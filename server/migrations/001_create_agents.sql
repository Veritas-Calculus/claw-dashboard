CREATE TABLE IF NOT EXISTS agents (
    id          VARCHAR(16)  PRIMARY KEY,
    name        VARCHAR(128) NOT NULL UNIQUE,
    status      VARCHAR(16)  NOT NULL DEFAULT 'offline',
    cpu         REAL         NOT NULL DEFAULT 0,
    memory      REAL         NOT NULL DEFAULT 0,
    task_count  INTEGER      NOT NULL DEFAULT 0,
    last_seen   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
