use axum::{extract::State, Json};
use crate::{error::AppError, models::agent::Agent, AppState};

pub async fn list_agents(State(state): State<AppState>) -> Result<Json<Vec<Agent>>, AppError> {
    let agents = Agent::find_all(&state.db).await?;
    Ok(Json(agents))
}
