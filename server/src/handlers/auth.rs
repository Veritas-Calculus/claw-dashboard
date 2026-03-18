use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    Json,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::Utc;
use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{error::AppError, AppState};

// --- JWT Claims ---

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,       // user id
    pub username: String,
    pub role: String,
    pub exp: usize,        // expiry (unix timestamp)
}

// --- Request/Response types ---

#[derive(Deserialize)]
pub struct SetupRequest {
    pub username: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthResponse {
    pub token: String,
    pub username: String,
    pub role: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusResponse {
    pub needs_setup: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MeResponse {
    pub id: String,
    pub username: String,
    pub role: String,
}

// --- JWT secret (derived from DATABASE_URL for simplicity) ---

fn jwt_secret() -> String {
    std::env::var("JWT_SECRET").unwrap_or_else(|_| "claw-default-jwt-secret-change-me".into())
}

fn create_token(user_id: &str, username: &str, role: &str) -> Result<String, AppError> {
    let expiry = Utc::now().timestamp() as usize + 86400; // 24h
    let claims = Claims {
        sub: user_id.to_string(),
        username: username.to_string(),
        role: role.to_string(),
        exp: expiry,
    };
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret().as_bytes()),
    )
    .map_err(|e| AppError::Internal(format!("JWT encode error: {e}")))
}

pub fn validate_token(token: &str) -> Result<Claims, AppError> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret().as_bytes()),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|_| AppError::Unauthorized("Invalid or expired token".into()))
}

// --- Handlers ---

/// GET /api/v1/auth/status — check if setup is needed
pub async fn auth_status(State(state): State<AppState>) -> Result<Json<StatusResponse>, AppError> {
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
        .fetch_one(&state.db)
        .await?;
    Ok(Json(StatusResponse {
        needs_setup: count.0 == 0,
    }))
}

/// POST /api/v1/auth/setup — create first admin (only if no users exist)
pub async fn setup(
    State(state): State<AppState>,
    Json(body): Json<SetupRequest>,
) -> Result<(StatusCode, Json<AuthResponse>), AppError> {
    // Check no users exist
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
        .fetch_one(&state.db)
        .await?;
    if count.0 > 0 {
        return Err(AppError::Internal("Setup already completed".into()));
    }

    if body.username.len() < 3 || body.password.len() < 6 {
        return Err(AppError::Internal(
            "Username must be 3+ chars, password 6+ chars".into(),
        ));
    }

    let id = Uuid::new_v4().to_string();
    let hashed = hash(&body.password, DEFAULT_COST)
        .map_err(|e| AppError::Internal(format!("Hash error: {e}")))?;

    sqlx::query("INSERT INTO users (id, username, password, role) VALUES ($1, $2, $3, 'admin')")
        .bind(&id)
        .bind(&body.username)
        .bind(&hashed)
        .execute(&state.db)
        .await?;

    let token = create_token(&id, &body.username, "admin")?;
    tracing::info!("Admin user '{}' created", body.username);

    Ok((
        StatusCode::CREATED,
        Json(AuthResponse {
            token,
            username: body.username,
            role: "admin".into(),
        }),
    ))
}

/// POST /api/v1/auth/login
pub async fn login(
    State(state): State<AppState>,
    Json(body): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let row: Option<(String, String, String, String)> = sqlx::query_as(
        "SELECT id, username, password, role FROM users WHERE username = $1",
    )
    .bind(&body.username)
    .fetch_optional(&state.db)
    .await?;

    let (id, username, password_hash, role) = row.ok_or_else(|| {
        AppError::Unauthorized("Invalid credentials".into())
    })?;

    let valid = verify(&body.password, &password_hash)
        .map_err(|e| AppError::Internal(format!("Verify error: {e}")))?;

    if !valid {
        return Err(AppError::Unauthorized("Invalid credentials".into()));
    }

    let token = create_token(&id, &username, &role)?;
    Ok(Json(AuthResponse {
        token,
        username,
        role,
    }))
}

/// GET /api/v1/auth/me — validate token
pub async fn me(headers: HeaderMap) -> Result<Json<MeResponse>, AppError> {
    let token = extract_bearer(&headers)?;
    let claims = validate_token(&token)?;
    Ok(Json(MeResponse {
        id: claims.sub,
        username: claims.username,
        role: claims.role,
    }))
}

fn extract_bearer(headers: &HeaderMap) -> Result<String, AppError> {
    headers
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .map(|s| s.to_string())
        .ok_or_else(|| AppError::Unauthorized("Missing or invalid Authorization header".into()))
}
