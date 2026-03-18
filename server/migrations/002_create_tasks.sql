CREATE TABLE IF NOT EXISTS tasks (
    id          VARCHAR(16)  PRIMARY KEY,
    name        VARCHAR(256) NOT NULL,
    agent_id    VARCHAR(16)  NOT NULL REFERENCES agents(id),
    agent_name  VARCHAR(128) NOT NULL,
    status      VARCHAR(16)  NOT NULL DEFAULT 'queued',
    progress    INTEGER      NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    duration    VARCHAR(16)  NOT NULL DEFAULT '--'
);
