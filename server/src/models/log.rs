use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct LogEntry {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub level: String,
    pub agent_name: String,
    pub message: String,
}

impl LogEntry {
    pub async fn find_recent(pool: &sqlx::PgPool, limit: i64) -> Result<Vec<Self>, sqlx::Error> {
        sqlx::query_as::<_, Self>(
            "SELECT * FROM logs ORDER BY timestamp DESC LIMIT $1",
        )
        .bind(limit)
        .fetch_all(pool)
        .await
    }

    pub async fn insert(pool: &sqlx::PgPool, entry: &Self) -> Result<(), sqlx::Error> {
        sqlx::query(
            "INSERT INTO logs (id, timestamp, level, agent_name, message) VALUES ($1, $2, $3, $4, $5)",
        )
        .bind(&entry.id)
        .bind(entry.timestamp)
        .bind(&entry.level)
        .bind(&entry.agent_name)
        .bind(&entry.message)
        .execute(pool)
        .await?;
        Ok(())
    }
}
