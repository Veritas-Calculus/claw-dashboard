mod config;
mod db;
mod error;
mod handlers;
mod middleware;
mod models;
mod services;

use std::sync::Arc;

use axum::{
    routing::{get, post, patch, delete},
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

    // Seed data only if SEED_DATA=true
    if cfg.seed_data {
        services::seed::seed_if_empty(&pool)
            .await
            .expect("Failed to seed database");
    }

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

    // Start background simulator only when seeding (dev mode)
    if cfg.seed_data {
        tokio::spawn(services::simulator::run_simulator(pool.clone(), broadcast_tx.clone()));
    }

    // Extract bind_addr before moving any fields from cfg
    let bind_addr = cfg.bind_addr();

    // Connect to OpenClaw Gateway if configured
    if let (Some(url), Some(token)) = (cfg.openclaw_gateway_url, cfg.openclaw_gateway_token) {
        let tx = broadcast_tx.clone();
        let gw_pool = pool.clone();
        tokio::spawn(async move {
            services::openclaw::connect_to_gateway(url, token, tx, gw_pool).await;
        });
    }

    // Protected routes — require valid JWT token
    let protected = Router::new()
        .route("/api/v1/agents",              get(handlers::agents::list_agents))
        .route("/api/v1/tasks",               get(handlers::tasks::list_tasks))
        .route("/api/v1/logs",                get(handlers::logs::list_logs))
        .route("/api/v1/alerts",              get(handlers::alerts::list_alerts))
        .route("/api/v1/alerts/{id}/ack",     post(handlers::alerts::acknowledge_alert))
        .route("/api/v1/dashboard/metrics",   get(handlers::dashboard::get_metrics))
        .route("/api/v1/auth/me",             get(handlers::auth::me))
        .route("/api/v1/users",               get(handlers::users::list_users)
                                                  .post(handlers::users::create_user))
        .route("/api/v1/users/{id}",          patch(handlers::users::update_user)
                                                  .delete(handlers::users::delete_user))
        .layer(axum::middleware::from_fn(middleware::auth::require_auth));

    // Public routes + merge protected
    let app = Router::new()
        .route("/healthz", get(|| async { "ok" }))
        .route("/api/v1/auth/status",  get(handlers::auth::auth_status))
        .route("/api/v1/auth/setup",   post(handlers::auth::setup))
        .route("/api/v1/auth/login",   post(handlers::auth::login))
        .route("/ws", get(handlers::ws::ws_handler))
        .merge(protected)
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any))
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    tracing::info!("Claw API listening on {bind_addr}");

    let listener = tokio::net::TcpListener::bind(&bind_addr)
        .await
        .expect("Failed to bind");

    axum::serve(listener, app)
        .await
        .expect("Server failed");
}
