use axum::{extract::State, Json};
use crate::{error::AppError, models::metrics::DashboardMetrics, AppState};

pub async fn get_metrics(
    State(state): State<AppState>,
) -> Result<Json<DashboardMetrics>, AppError> {
    // TODO: add Redis caching (5s TTL)
    let metrics = DashboardMetrics::compute(&state.db).await?;
    Ok(Json(metrics))
}
