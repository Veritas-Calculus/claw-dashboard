use std::sync::Arc;
use futures::{SinkExt, StreamExt};
use serde_json::json;
use sqlx::PgPool;
use tokio::sync::broadcast;
use tokio_tungstenite::{connect_async, tungstenite::Message};

/// Connects to OpenClaw Gateway via WebSocket as an operator client.
/// Translates gateway events into our internal broadcast format and persists to DB.
pub async fn connect_to_gateway(
    gateway_url: String,
    gateway_token: String,
    tx: Arc<broadcast::Sender<String>>,
    pool: PgPool,
) {
    loop {
        tracing::info!("Connecting to OpenClaw Gateway at {gateway_url}...");

        match connect_async(&gateway_url).await {
            Ok((ws_stream, _)) => {
                tracing::info!("Connected to OpenClaw Gateway");
                let (mut writer, mut reader) = ws_stream.split();

                // Send connect handshake
                let connect_req = json!({
                    "type": "req",
                    "id": uuid::Uuid::new_v4().to_string(),
                    "method": "connect",
                    "params": {
                        "minProtocol": 3,
                        "maxProtocol": 3,
                        "client": {
                            "id": "claw-dashboard",
                            "version": env!("CARGO_PKG_VERSION"),
                            "platform": "server",
                            "mode": "operator"
                        },
                        "role": "operator",
                        "scopes": ["operator.read"],
                        "caps": [],
                        "commands": [],
                        "permissions": {},
                        "auth": {
                            "token": gateway_token
                        },
                        "locale": "en-US",
                        "userAgent": format!("claw-dashboard/{}", env!("CARGO_PKG_VERSION"))
                    }
                });

                if let Err(e) = writer.send(Message::Text(connect_req.to_string())).await {
                    tracing::error!("Failed to send connect handshake: {e}");
                    tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
                    continue;
                }

                // Read events
                while let Some(msg) = reader.next().await {
                    match msg {
                        Ok(Message::Text(text)) => {
                            if let Ok(frame) = serde_json::from_str::<serde_json::Value>(&text) {
                                handle_gateway_frame(&frame, &tx, &pool).await;
                            }
                        }
                        Ok(Message::Close(_)) => {
                            tracing::warn!("OpenClaw Gateway closed connection");
                            break;
                        }
                        Err(e) => {
                            tracing::error!("OpenClaw Gateway error: {e}");
                            break;
                        }
                        _ => {}
                    }
                }
            }
            Err(e) => {
                tracing::error!("Failed to connect to OpenClaw Gateway: {e}");
            }
        }

        tracing::info!("Reconnecting to OpenClaw Gateway in 5s...");
        tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
    }
}

async fn handle_gateway_frame(
    frame: &serde_json::Value,
    tx: &broadcast::Sender<String>,
    pool: &PgPool,
) {
    let frame_type = frame.get("type").and_then(|v| v.as_str()).unwrap_or("");

    match frame_type {
        "event" => {
            let event_name = frame.get("event").and_then(|v| v.as_str()).unwrap_or("");
            let payload = frame.get("payload").cloned().unwrap_or(json!({}));

            match event_name {
                "presence" => {
                    // Persist agent presence to DB
                    persist_agent_from_gateway(&payload, pool).await;
                    let internal = json!({
                        "type": "gateway:presence",
                        "data": payload,
                    });
                    let _ = tx.send(internal.to_string());
                }
                "health" => {
                    // Persist health metrics to DB
                    persist_health_metrics(&payload, pool).await;
                    let internal = json!({
                        "type": "gateway:health",
                        "data": payload,
                    });
                    let _ = tx.send(internal.to_string());
                }
                "agent" => {
                    // Persist agent update to DB
                    persist_agent_from_gateway(&payload, pool).await;
                    let internal = json!({
                        "type": "gateway:agent",
                        "data": payload,
                    });
                    let _ = tx.send(internal.to_string());
                }
                "heartbeat" | "tick" => {
                    // Silently consume heartbeats
                }
                _ => {
                    tracing::debug!("Unhandled gateway event: {event_name}");
                }
            }
        }
        "res" => {
            let ok = frame.get("ok").and_then(|v| v.as_bool()).unwrap_or(false);
            if ok {
                if let Some(payload) = frame.get("payload") {
                    let ptype = payload.get("type").and_then(|v| v.as_str()).unwrap_or("");
                    if ptype == "hello-ok" {
                        tracing::info!("OpenClaw Gateway handshake successful");
                    }
                }
            } else {
                let error = frame.get("error").cloned().unwrap_or(json!("unknown"));
                tracing::error!("OpenClaw Gateway error response: {error}");
            }
        }
        _ => {}
    }
}

/// Extract agent data from gateway payload and upsert into agents table.
async fn persist_agent_from_gateway(payload: &serde_json::Value, pool: &PgPool) {
    let id = payload.get("id").and_then(|v| v.as_str());
    let name = payload.get("name").and_then(|v| v.as_str());

    if let (Some(id), Some(name)) = (id, name) {
        let status = payload.get("status").and_then(|v| v.as_str()).unwrap_or("active");
        let cpu = payload.get("cpu").and_then(|v| v.as_f64()).unwrap_or(0.0);
        let memory = payload.get("memory").and_then(|v| v.as_f64()).unwrap_or(0.0);
        let task_count = payload.get("taskCount").and_then(|v| v.as_i64()).unwrap_or(0);

        let result = sqlx::query(
            "INSERT INTO agents (id, name, status, cpu, memory, task_count, last_seen)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                status = EXCLUDED.status,
                cpu = EXCLUDED.cpu,
                memory = EXCLUDED.memory,
                task_count = EXCLUDED.task_count,
                last_seen = NOW()"
        )
        .bind(id)
        .bind(name)
        .bind(status)
        .bind(cpu as f32)
        .bind(memory as f32)
        .bind(task_count as i32)
        .execute(pool)
        .await;

        if let Err(e) = result {
            tracing::warn!("Failed to persist gateway agent: {e}");
        }
    }
}

/// Extract health metrics from gateway payload and write to metrics_history.
async fn persist_health_metrics(payload: &serde_json::Value, pool: &PgPool) {
    // Try to extract agent-scoped metrics
    let agent_id = payload.get("agentId").and_then(|v| v.as_str()).unwrap_or("system");

    if let Some(cpu) = payload.get("cpu").and_then(|v| v.as_f64()) {
        let _ = crate::models::metric_record::MetricRecord::insert(
            pool, agent_id, "cpu", cpu as f32,
        ).await;
    }
    if let Some(memory) = payload.get("memory").and_then(|v| v.as_f64()) {
        let _ = crate::models::metric_record::MetricRecord::insert(
            pool, agent_id, "memory", memory as f32,
        ).await;
    }
}
