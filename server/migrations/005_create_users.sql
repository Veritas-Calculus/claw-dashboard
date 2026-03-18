CREATE TABLE IF NOT EXISTS users (
    id         VARCHAR(36)  PRIMARY KEY,
    username   VARCHAR(64)  NOT NULL UNIQUE,
    password   VARCHAR(128) NOT NULL,
    role       VARCHAR(16)  NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
