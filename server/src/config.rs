use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub redis_url: String,
    pub host: String,
    pub port: u16,
    pub seed_data: bool,
    pub openclaw_gateway_url: Option<String>,
    pub openclaw_gateway_token: Option<String>,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "postgres://claw:claw_secret@localhost:5432/claw".into()),
            redis_url: env::var("REDIS_URL")
                .unwrap_or_else(|_| "redis://localhost:6379".into()),
            host: env::var("API_HOST").unwrap_or_else(|_| "0.0.0.0".into()),
            port: env::var("API_PORT")
                .ok()
                .and_then(|p| p.parse().ok())
                .unwrap_or(8080),
            seed_data: env::var("SEED_DATA")
                .map(|v| v == "true")
                .unwrap_or(false),
            openclaw_gateway_url: env::var("OPENCLAW_GATEWAY_URL").ok(),
            openclaw_gateway_token: env::var("OPENCLAW_GATEWAY_TOKEN").ok(),
        }
    }

    pub fn bind_addr(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }
}
