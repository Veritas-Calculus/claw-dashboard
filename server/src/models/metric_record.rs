use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::PgPool;

/// A single time-series data point stored in metrics_history.
#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct MetricRecord {
    pub id: i64,
    pub agent_id: String,
    pub metric_type: String,
    pub value: f32,
    pub recorded_at: DateTime<Utc>,
}

impl MetricRecord {
    /// Insert a new metric data point.
    pub async fn insert(
        pool: &PgPool,
        agent_id: &str,
        metric_type: &str,
        value: f32,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            "INSERT INTO metrics_history (agent_id, metric_type, value) VALUES ($1, $2, $3)",
        )
        .bind(agent_id)
        .bind(metric_type)
        .bind(value)
        .execute(pool)
        .await?;
        Ok(())
    }

    /// Fetch average values for a metric type grouped by 15-min intervals over the last N hours.
    /// Returns (time_label, avg_value) pairs.
    pub async fn trend(
        pool: &PgPool,
        metric_type: &str,
        hours: i32,
    ) -> Result<Vec<(String, f64)>, sqlx::Error> {
        let rows: Vec<(String, f64)> = sqlx::query_as(
            "SELECT
                to_char(date_trunc('hour', recorded_at) +
                    (EXTRACT(minute FROM recorded_at)::int / 15) * interval '15 min',
                    'HH24:MI') AS time_label,
                ROUND(AVG(value)::numeric, 1)::float8 AS avg_value
             FROM metrics_history
             WHERE metric_type = $1
               AND recorded_at > NOW() - ($2 || ' hours')::interval
             GROUP BY time_label,
                date_trunc('hour', recorded_at) +
                    (EXTRACT(minute FROM recorded_at)::int / 15) * interval '15 min'
             ORDER BY MIN(recorded_at)",
        )
        .bind(metric_type)
        .bind(hours.to_string())
        .fetch_all(pool)
        .await?;
        Ok(rows)
    }
}
