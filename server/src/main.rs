mod config;
mod db;
mod error;
mod handlers;
mod models;
mod services;

use std::sync::Arc;

use axum::{
    routing::{get, post},
    Router,
};
use tokio::sync::broadcast;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

/// Shared application state — passed to all handlers via Axum State extractor.
#[derive(Clone)]
pub struct AppState {
    pub db: sqlx::PgPool,
    pub redis: redis::Client,
    pub broadcast_tx: Arc<broadcast::Sender<String>>,
}

#[tokio::main]
async fn main() {
    // Load .env
    let _ = dotenvy::dotenv();

    // Init tracing
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "claw_api=info,tower_http=info".parse().unwrap()),
        )
        .init();

    let cfg = config::Config::from_env();

    // Database
    let pool = db::postgres::init_pool(&cfg.database_url)
        .await
        .expect("Failed to connect to PostgreSQL");

    db::postgres::run_migrations(&pool)
        .await
        .expect("Failed to run migrations");

    // Seed data
    services::seed::seed_if_empty(&pool)
        .await
        .expect("Failed to seed database");

    // Redis
    let redis_client = db::redis::init_client(&cfg.redis_url)
        .expect("Failed to connect to Redis");

    // Broadcast channel for WebSocket fan-out
    let (broadcast_tx, _) = broadcast::channel::<String>(256);
    let broadcast_tx = Arc::new(broadcast_tx);

    let state = AppState {
        db: pool.clone(),
        redis: redis_client,
        broadcast_tx: broadcast_tx.clone(),
    };

    // Start background simulator
    tokio::spawn(services::simulator::run_simulator(pool, broadcast_tx));

    // Routes
    let app = Router::new()
        // Health
        .route("/healthz", get(|| async { "ok" }))
        // API v1
        .route("/api/v1/agents",              get(handlers::agents::list_agents))
        .route("/api/v1/tasks",               get(handlers::tasks::list_tasks))
        .route("/api/v1/logs",                get(handlers::logs::list_logs))
        .route("/api/v1/alerts",              get(handlers::alerts::list_alerts))
        .route("/api/v1/alerts/{id}/ack",     post(handlers::alerts::acknowledge_alert))
        .route("/api/v1/dashboard/metrics",   get(handlers::dashboard::get_metrics))
        // WebSocket
        .route("/ws", get(handlers::ws::ws_handler))
        // Middleware
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any))
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let bind_addr = cfg.bind_addr();
    tracing::info!("Claw API listening on {bind_addr}");

    let listener = tokio::net::TcpListener::bind(&bind_addr)
        .await
        .expect("Failed to bind");

    axum::serve(listener, app)
        .await
        .expect("Server failed");
}
