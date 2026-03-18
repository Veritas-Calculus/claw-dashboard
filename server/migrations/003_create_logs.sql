CREATE TABLE IF NOT EXISTS logs (
    id          VARCHAR(32)  PRIMARY KEY,
    timestamp   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    level       VARCHAR(8)   NOT NULL DEFAULT 'info',
    agent_name  VARCHAR(128) NOT NULL,
    message     TEXT         NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);
