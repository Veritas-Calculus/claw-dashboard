use axum::{extract::{Query, State}, Json};
use serde::Deserialize;
use crate::{error::AppError, models::log::LogEntry, AppState};

#[derive(Deserialize)]
pub struct LogQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    pub level: Option<String>,
}

pub async fn list_logs(
    State(state): State<AppState>,
    Query(params): Query<LogQuery>,
) -> Result<Json<Vec<LogEntry>>, AppError> {
    let limit = params.limit.unwrap_or(100).min(500);
    let offset = params.offset.unwrap_or(0);

    let logs = match &params.level {
        Some(level) => {
            sqlx::query_as::<_, LogEntry>(
                "SELECT * FROM logs WHERE level = $1 ORDER BY timestamp DESC LIMIT $2 OFFSET $3"
            )
            .bind(level)
            .bind(limit)
            .bind(offset)
            .fetch_all(&state.db)
            .await?
        }
        None => {
            sqlx::query_as::<_, LogEntry>(
                "SELECT * FROM logs ORDER BY timestamp DESC LIMIT $1 OFFSET $2"
            )
            .bind(limit)
            .bind(offset)
            .fetch_all(&state.db)
            .await?
        }
    };

    Ok(Json(logs))
}
