use axum::{
    extract::{Extension, Path, State},
    http::StatusCode,
    Json,
};
use bcrypt::{hash, DEFAULT_COST};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{error::AppError, handlers::auth::Claims, AppState};

// --- Response types ---

#[derive(Debug, Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct UserResponse {
    pub id: String,
    pub username: String,
    pub role: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Deserialize)]
pub struct CreateUserRequest {
    pub username: String,
    pub password: String,
    pub role: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateUserRequest {
    pub role: Option<String>,
    pub password: Option<String>,
}

// --- Handlers (admin only) ---

/// GET /api/v1/users — list all users
pub async fn list_users(
    Extension(claims): Extension<Claims>,
    State(state): State<AppState>,
) -> Result<Json<Vec<UserResponse>>, AppError> {
    require_admin(&claims)?;
    let users = sqlx::query_as::<_, UserResponse>(
        "SELECT id, username, role, created_at FROM users ORDER BY created_at"
    )
    .fetch_all(&state.db)
    .await?;
    Ok(Json(users))
}

/// POST /api/v1/users — create a new user
pub async fn create_user(
    Extension(claims): Extension<Claims>,
    State(state): State<AppState>,
    Json(body): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<UserResponse>), AppError> {
    require_admin(&claims)?;

    if body.username.len() < 3 || body.password.len() < 6 {
        return Err(AppError::Internal(
            "Username must be 3+ chars, password 6+ chars".into(),
        ));
    }

    let role = body.role.unwrap_or_else(|| "viewer".into());
    if role != "admin" && role != "viewer" {
        return Err(AppError::Internal("Role must be 'admin' or 'viewer'".into()));
    }

    let id = Uuid::new_v4().to_string();
    let hashed = hash(&body.password, DEFAULT_COST)
        .map_err(|e| AppError::Internal(format!("Hash error: {e}")))?;

    sqlx::query("INSERT INTO users (id, username, password, role) VALUES ($1, $2, $3, $4)")
        .bind(&id)
        .bind(&body.username)
        .bind(&hashed)
        .bind(&role)
        .execute(&state.db)
        .await?;

    let user = sqlx::query_as::<_, UserResponse>(
        "SELECT id, username, role, created_at FROM users WHERE id = $1"
    )
    .bind(&id)
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(user)))
}

/// DELETE /api/v1/users/:id — delete a user (cannot delete self)
pub async fn delete_user(
    Extension(claims): Extension<Claims>,
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<StatusCode, AppError> {
    require_admin(&claims)?;

    if claims.sub == id {
        return Err(AppError::Internal("Cannot delete your own account".into()));
    }

    let result = sqlx::query("DELETE FROM users WHERE id = $1")
        .bind(&id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        Err(AppError::NotFound(format!("User {id} not found")))
    } else {
        Ok(StatusCode::NO_CONTENT)
    }
}

/// PATCH /api/v1/users/:id — update role or password
pub async fn update_user(
    Extension(claims): Extension<Claims>,
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<UpdateUserRequest>,
) -> Result<Json<UserResponse>, AppError> {
    require_admin(&claims)?;

    if let Some(ref role) = body.role {
        if role != "admin" && role != "viewer" {
            return Err(AppError::Internal("Role must be 'admin' or 'viewer'".into()));
        }
        sqlx::query("UPDATE users SET role = $1 WHERE id = $2")
            .bind(role)
            .bind(&id)
            .execute(&state.db)
            .await?;
    }

    if let Some(ref password) = body.password {
        if password.len() < 6 {
            return Err(AppError::Internal("Password must be 6+ chars".into()));
        }
        let hashed = hash(password, DEFAULT_COST)
            .map_err(|e| AppError::Internal(format!("Hash error: {e}")))?;
        sqlx::query("UPDATE users SET password = $1 WHERE id = $2")
            .bind(&hashed)
            .bind(&id)
            .execute(&state.db)
            .await?;
    }

    let user = sqlx::query_as::<_, UserResponse>(
        "SELECT id, username, role, created_at FROM users WHERE id = $1"
    )
    .bind(&id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| AppError::NotFound(format!("User {id} not found")))?;

    Ok(Json(user))
}

fn require_admin(claims: &Claims) -> Result<(), AppError> {
    if claims.role != "admin" {
        Err(AppError::Unauthorized("Admin access required".into()))
    } else {
        Ok(())
    }
}
