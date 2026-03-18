use axum::{extract::State, Json};
use crate::{error::AppError, models::task::TaskItem, AppState};

pub async fn list_tasks(State(state): State<AppState>) -> Result<Json<Vec<TaskItem>>, AppError> {
    let tasks = TaskItem::find_all(&state.db).await?;
    Ok(Json(tasks))
}
