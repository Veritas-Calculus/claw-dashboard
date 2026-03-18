use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Agent {
    pub id: String,
    pub name: String,
    pub status: String,
    pub cpu: f32,
    pub memory: f32,
    pub task_count: i32,
    pub last_seen: DateTime<Utc>,
}

impl Agent {
    pub async fn find_all(pool: &sqlx::PgPool) -> Result<Vec<Self>, sqlx::Error> {
        sqlx::query_as::<_, Self>("SELECT * FROM agents ORDER BY name")
            .fetch_all(pool)
            .await
    }

    pub async fn find_by_id(pool: &sqlx::PgPool, id: &str) -> Result<Option<Self>, sqlx::Error> {
        sqlx::query_as::<_, Self>("SELECT * FROM agents WHERE id = $1")
            .bind(id)
            .fetch_optional(pool)
            .await
    }

    pub async fn upsert(pool: &sqlx::PgPool, agent: &Self) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"INSERT INTO agents (id, name, status, cpu, memory, task_count, last_seen)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (id) DO UPDATE SET
                 status = EXCLUDED.status,
                 cpu = EXCLUDED.cpu,
                 memory = EXCLUDED.memory,
                 task_count = EXCLUDED.task_count,
                 last_seen = EXCLUDED.last_seen"#,
        )
        .bind(&agent.id)
        .bind(&agent.name)
        .bind(&agent.status)
        .bind(agent.cpu)
        .bind(agent.memory)
        .bind(agent.task_count)
        .bind(agent.last_seen)
        .execute(pool)
        .await?;
        Ok(())
    }

    pub async fn count_by_status(
        pool: &sqlx::PgPool,
    ) -> Result<std::collections::HashMap<String, i64>, sqlx::Error> {
        let rows: Vec<(String, i64)> =
            sqlx::query_as("SELECT status, COUNT(*) as count FROM agents GROUP BY status")
                .fetch_all(pool)
                .await?;
        Ok(rows.into_iter().collect())
    }
}
