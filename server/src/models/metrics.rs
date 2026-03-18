use serde::{Serialize, Deserialize};

use crate::models::metric_record::MetricRecord;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentsByStatus {
    pub active: i64,
    pub idle: i64,
    pub error: i64,
    pub offline: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MetricPoint {
    pub time: String,
    pub value: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardMetrics {
    pub agents_by_status: AgentsByStatus,
    pub task_completion_rate: f64,
    pub avg_response_time: f64,
    pub total_tokens_today: i64,
    pub task_trend: Vec<MetricPoint>,
    pub cpu_trend: Vec<MetricPoint>,
    pub memory_trend: Vec<MetricPoint>,
}

impl DashboardMetrics {
    pub async fn compute(pool: &sqlx::PgPool) -> Result<Self, sqlx::Error> {
        // Agent status counts
        let status_map = crate::models::agent::Agent::count_by_status(pool).await?;
        let agents_by_status = AgentsByStatus {
            active: *status_map.get("active").unwrap_or(&0),
            idle: *status_map.get("idle").unwrap_or(&0),
            error: *status_map.get("error").unwrap_or(&0),
            offline: *status_map.get("offline").unwrap_or(&0),
        };

        // Task completion rate (real data from DB)
        let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM tasks")
            .fetch_one(pool)
            .await?;
        let completed: (i64,) =
            sqlx::query_as("SELECT COUNT(*) FROM tasks WHERE status = 'completed'")
                .fetch_one(pool)
                .await?;
        let task_completion_rate = if total.0 > 0 {
            (completed.0 as f64 / total.0 as f64) * 100.0
        } else {
            0.0
        };

        // Avg response time: average task duration over the last 24h
        let avg_rt: (Option<f64>,) = sqlx::query_as(
            "SELECT AVG(CAST(REGEXP_REPLACE(duration, '[^0-9.]', '', 'g') AS NUMERIC))
             FROM tasks WHERE duration != '--' AND created_at > NOW() - INTERVAL '24 hours'"
        )
        .fetch_one(pool)
        .await
        .unwrap_or((None,));
        let avg_response_time = avg_rt.0.unwrap_or(0.0);

        // Total tokens today (count of completed tasks as proxy until real token tracking)
        let tokens: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM tasks WHERE status = 'completed' AND created_at > CURRENT_DATE"
        )
        .fetch_one(pool)
        .await
        .unwrap_or((0,));
        let total_tokens_today = tokens.0 * 1000; // estimate: ~1000 tokens per completed task

        // Trend data from metrics_history (real 15-min aggregated data)
        let cpu_raw = MetricRecord::trend(pool, "cpu", 6).await.unwrap_or_default();
        let memory_raw = MetricRecord::trend(pool, "memory", 6).await.unwrap_or_default();

        let cpu_trend: Vec<MetricPoint> = cpu_raw
            .into_iter()
            .map(|(time, value)| MetricPoint { time, value })
            .collect();
        let memory_trend: Vec<MetricPoint> = memory_raw
            .into_iter()
            .map(|(time, value)| MetricPoint { time, value })
            .collect();

        // Task trend: completed tasks per 15-min interval
        let task_raw: Vec<(String, i64)> = sqlx::query_as(
            "SELECT
                to_char(date_trunc('hour', created_at) +
                    (EXTRACT(minute FROM created_at)::int / 15) * interval '15 min',
                    'HH24:MI') AS time_label,
                COUNT(*) AS cnt
             FROM tasks
             WHERE created_at > NOW() - INTERVAL '6 hours'
             GROUP BY time_label,
                date_trunc('hour', created_at) +
                    (EXTRACT(minute FROM created_at)::int / 15) * interval '15 min'
             ORDER BY MIN(created_at)"
        )
        .fetch_all(pool)
        .await
        .unwrap_or_default();

        let task_trend: Vec<MetricPoint> = task_raw
            .into_iter()
            .map(|(time, count)| MetricPoint { time, value: count as f64 })
            .collect();

        Ok(Self {
            agents_by_status,
            task_completion_rate: (task_completion_rate * 10.0).round() / 10.0,
            avg_response_time: (avg_response_time * 10.0).round() / 10.0,
            total_tokens_today,
            task_trend,
            cpu_trend,
            memory_trend,
        })
    }
}
