-- Stores time-series metric snapshots for real dashboard trends.
-- One row per agent per snapshot interval.

CREATE TABLE IF NOT EXISTS metrics_history (
    id          BIGSERIAL    PRIMARY KEY,
    agent_id    VARCHAR(16)  NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    metric_type VARCHAR(32)  NOT NULL,   -- 'cpu', 'memory', 'response_time', 'tokens'
    value       REAL         NOT NULL,
    recorded_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index for efficient time-range queries per metric type
CREATE INDEX IF NOT EXISTS idx_metrics_history_type_time
    ON metrics_history (metric_type, recorded_at DESC);

-- Index for agent-specific metric queries
CREATE INDEX IF NOT EXISTS idx_metrics_history_agent
    ON metrics_history (agent_id, recorded_at DESC);
