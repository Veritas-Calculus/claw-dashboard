CREATE TABLE IF NOT EXISTS alerts (
    id           VARCHAR(16)  PRIMARY KEY,
    severity     VARCHAR(16)  NOT NULL DEFAULT 'info',
    title        VARCHAR(256) NOT NULL,
    message      TEXT         NOT NULL,
    agent_name   VARCHAR(128) NOT NULL,
    timestamp    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    acknowledged BOOLEAN      NOT NULL DEFAULT FALSE
);
