use axum::{extract::{Query, State}, Json};
use serde::Deserialize;
use crate::{error::AppError, models::log::LogEntry, AppState};

#[derive(Deserialize)]
pub struct LogQuery {
    pub limit: Option<i64>,
}

pub async fn list_logs(
    State(state): State<AppState>,
    Query(params): Query<LogQuery>,
) -> Result<Json<Vec<LogEntry>>, AppError> {
    let limit = params.limit.unwrap_or(100).min(500);
    let logs = LogEntry::find_recent(&state.db, limit).await?;
    Ok(Json(logs))
}
