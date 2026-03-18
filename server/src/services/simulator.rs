use std::sync::Arc;
use chrono::Utc;
use rand::{Rng, SeedableRng, rngs::StdRng};
use sqlx::PgPool;
use tokio::sync::broadcast;

use crate::handlers::ws::broadcast_event;
use crate::models::agent::Agent;
use crate::models::log::LogEntry;

/// Background task that simulates agent heartbeats and generates live events.
/// Updates agent CPU/memory in DB and broadcasts changes via WebSocket.
pub async fn run_simulator(pool: PgPool, tx: Arc<broadcast::Sender<String>>) {
    let agent_names = [
        "CodeReviewer", "DataAnalyst", "TestRunner", "DocWriter",
        "SecurityScanner", "DeployBot", "ChatAssistant", "Translator",
        "PipelineOrchestrator", "LogAnalyzer", "AlertRouter",
    ];
    let log_messages = [
        "Agent heartbeat received",
        "Processing batch items",
        "Cache hit ratio: 94.2%",
        "Token consumption update",
        "Memory checkpoint saved",
        "Task progress updated",
    ];

    let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(3));
    // StdRng is Send (unlike ThreadRng), safe to use across .await
    let mut rng = StdRng::from_entropy();

    loop {
        interval.tick().await;

        // Pick a random agent and update its metrics
        let agents = match Agent::find_all(&pool).await {
            Ok(a) => a,
            Err(_) => continue,
        };

        if agents.is_empty() {
            continue;
        }

        let idx = rng.gen_range(0..agents.len());
        let mut agent = agents[idx].clone();

        if agent.status != "offline" {
            // Drift CPU and memory
            agent.cpu = (agent.cpu + rng.gen_range(-5.0..5.0)).clamp(0.0, 100.0);
            agent.memory = (agent.memory + rng.gen_range(-3.0..3.0)).clamp(0.0, 100.0);
            agent.last_seen = Utc::now();

            let _ = Agent::upsert(&pool, &agent).await;

            // Broadcast agent update
            broadcast_event(&tx, "agent:update", &agent);
        }

        // Generate a random log entry every tick
        let log = LogEntry {
            id: format!("log-{}", Utc::now().timestamp_millis()),
            timestamp: Utc::now(),
            level: ["info", "info", "info", "warn", "debug"][rng.gen_range(0..5)].to_string(),
            agent_name: agent_names[rng.gen_range(0..agent_names.len())].to_string(),
            message: log_messages[rng.gen_range(0..log_messages.len())].to_string(),
        };

        let _ = LogEntry::insert(&pool, &log).await;
        broadcast_event(&tx, "log:new", &log);
    }
}
