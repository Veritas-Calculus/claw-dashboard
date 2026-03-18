use axum::{extract::State, Json};
use redis::AsyncCommands;
use crate::{error::AppError, models::metrics::DashboardMetrics, AppState};

const METRICS_CACHE_KEY: &str = "claw:dashboard:metrics";
const METRICS_CACHE_TTL: u64 = 5; // seconds

pub async fn get_metrics(
    State(state): State<AppState>,
) -> Result<Json<DashboardMetrics>, AppError> {
    // Try Redis cache first
    if let Ok(mut conn) = state.redis.get_multiplexed_async_connection().await {
        if let Ok(cached) = conn.get::<_, String>(METRICS_CACHE_KEY).await {
            if let Ok(metrics) = serde_json::from_str::<DashboardMetrics>(&cached) {
                return Ok(Json(metrics));
            }
        }
    }

    // Cache miss — compute from DB
    let metrics = DashboardMetrics::compute(&state.db).await?;

    // Write to cache (best-effort, don't fail on Redis errors)
    if let Ok(mut conn) = state.redis.get_multiplexed_async_connection().await {
        if let Ok(json) = serde_json::to_string(&metrics) {
            let _: Result<(), _> = conn.set_ex(METRICS_CACHE_KEY, json, METRICS_CACHE_TTL).await;
        }
    }

    Ok(Json(metrics))
}
