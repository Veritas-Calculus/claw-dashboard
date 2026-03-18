use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct TaskItem {
    pub id: String,
    pub name: String,
    pub agent_id: String,
    pub agent_name: String,
    pub status: String,
    pub progress: i32,
    pub created_at: DateTime<Utc>,
    pub duration: String,
}

impl TaskItem {
    pub async fn find_all(pool: &sqlx::PgPool) -> Result<Vec<Self>, sqlx::Error> {
        sqlx::query_as::<_, Self>("SELECT * FROM tasks ORDER BY created_at DESC")
            .fetch_all(pool)
            .await
    }
}
