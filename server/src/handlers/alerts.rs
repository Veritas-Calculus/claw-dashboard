use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use crate::{error::AppError, models::alert::AlertItem, AppState};

pub async fn list_alerts(State(state): State<AppState>) -> Result<Json<Vec<AlertItem>>, AppError> {
    let alerts = AlertItem::find_all(&state.db).await?;
    Ok(Json(alerts))
}

pub async fn acknowledge_alert(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<StatusCode, AppError> {
    let updated = AlertItem::acknowledge(&state.db, &id).await?;
    if updated {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(AppError::NotFound(format!("Alert {id} not found")))
    }
}
