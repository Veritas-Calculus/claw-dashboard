use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct AlertItem {
    pub id: String,
    pub severity: String,
    pub title: String,
    pub message: String,
    pub agent_name: String,
    pub timestamp: DateTime<Utc>,
    pub acknowledged: bool,
}

impl AlertItem {
    pub async fn find_all(pool: &sqlx::PgPool) -> Result<Vec<Self>, sqlx::Error> {
        sqlx::query_as::<_, Self>("SELECT * FROM alerts ORDER BY timestamp DESC")
            .fetch_all(pool)
            .await
    }

    pub async fn acknowledge(pool: &sqlx::PgPool, id: &str) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("UPDATE alerts SET acknowledged = TRUE WHERE id = $1")
            .bind(id)
            .execute(pool)
            .await?;
        Ok(result.rows_affected() > 0)
    }
}
