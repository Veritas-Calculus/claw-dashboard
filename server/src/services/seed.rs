use chrono::Utc;
use rand::Rng;
use sqlx::PgPool;

/// Seed database with initial data if tables are empty.
pub async fn seed_if_empty(pool: &PgPool) -> Result<(), sqlx::Error> {
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM agents")
        .fetch_one(pool)
        .await?;

    if count.0 > 0 {
        tracing::info!("Database already seeded ({} agents)", count.0);
        return Ok(());
    }

    tracing::info!("Seeding database...");
    seed_agents(pool).await?;
    seed_tasks(pool).await?;
    seed_logs(pool).await?;
    seed_alerts(pool).await?;
    tracing::info!("Database seeded successfully");
    Ok(())
}

async fn seed_agents(pool: &PgPool) -> Result<(), sqlx::Error> {
    let agents = vec![
        ("agent-001", "CodeReviewer",          "active",  72.3, 65.0, 3),
        ("agent-002", "DataAnalyst",           "active",  45.1, 82.0, 2),
        ("agent-003", "TestRunner",            "idle",    12.0, 30.0, 0),
        ("agent-004", "DocWriter",             "active",  38.5, 45.0, 1),
        ("agent-005", "SecurityScanner",       "error",   91.0, 78.0, 0),
        ("agent-006", "DeployBot",             "idle",     8.0, 22.0, 0),
        ("agent-007", "ChatAssistant",         "active",  55.0, 60.0, 5),
        ("agent-008", "Translator",            "idle",    15.0, 25.0, 0),
        ("agent-009", "ImageProcessor",        "offline",  0.0,  0.0, 0),
        ("agent-010", "PipelineOrchestrator",  "active",  68.0, 70.0, 4),
        ("agent-011", "LogAnalyzer",           "active",  42.0, 55.0, 2),
        ("agent-012", "AlertRouter",           "active",  30.0, 40.0, 1),
    ];

    for (id, name, status, cpu, mem, tasks) in agents {
        let ago = if status == "offline" {
            rand::thread_rng().gen_range(3600..86400)
        } else {
            rand::thread_rng().gen_range(1..60)
        };
        let last_seen = Utc::now() - chrono::Duration::seconds(ago);

        sqlx::query(
            "INSERT INTO agents (id, name, status, cpu, memory, task_count, last_seen) VALUES ($1,$2,$3,$4,$5,$6,$7)"
        )
        .bind(id).bind(name).bind(status)
        .bind(cpu as f32).bind(mem as f32).bind(tasks)
        .bind(last_seen)
        .execute(pool).await?;
    }
    Ok(())
}

async fn seed_tasks(pool: &PgPool) -> Result<(), sqlx::Error> {
    let tasks = vec![
        ("task-0001", "Code review for PR #142",             "agent-001", "CodeReviewer",         "running",   65),
        ("task-0002", "Analyze quarterly sales data",        "agent-002", "DataAnalyst",          "completed", 100),
        ("task-0003", "Run integration test suite",          "agent-003", "TestRunner",           "completed", 100),
        ("task-0004", "Generate API documentation",          "agent-004", "DocWriter",            "running",   40),
        ("task-0005", "Scan dependencies for CVEs",          "agent-005", "SecurityScanner",      "failed",    72),
        ("task-0006", "Deploy staging environment",          "agent-006", "DeployBot",            "queued",     0),
        ("task-0007", "Process customer support tickets",    "agent-007", "ChatAssistant",        "running",   88),
        ("task-0008", "Translate UI strings to Japanese",    "agent-008", "Translator",           "completed", 100),
        ("task-0009", "Resize and optimize product images",  "agent-009", "ImageProcessor",       "failed",    15),
        ("task-0010", "Execute data pipeline ETL",           "agent-010", "PipelineOrchestrator", "running",   55),
        ("task-0011", "Parse error logs from production",    "agent-011", "LogAnalyzer",          "completed", 100),
        ("task-0012", "Route P1 alerts to on-call",          "agent-012", "AlertRouter",          "running",   30),
        ("task-0013", "Generate performance report",         "agent-002", "DataAnalyst",          "queued",     0),
        ("task-0014", "Update database migrations",          "agent-010", "PipelineOrchestrator", "completed", 100),
        ("task-0015", "Build ML training dataset",           "agent-002", "DataAnalyst",          "running",   20),
        ("task-0016", "Run load test simulation",            "agent-003", "TestRunner",           "queued",     0),
    ];

    let mut rng = rand::thread_rng();
    for (id, name, aid, aname, status, progress) in tasks {
        let created = Utc::now() - chrono::Duration::seconds(rng.gen_range(60..7200));
        let duration = if status == "queued" {
            "--".to_string()
        } else {
            format!("{}s", rng.gen_range(5..300))
        };

        sqlx::query(
            "INSERT INTO tasks (id, name, agent_id, agent_name, status, progress, created_at, duration) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)"
        )
        .bind(id).bind(name).bind(aid).bind(aname)
        .bind(status).bind(progress).bind(created).bind(duration)
        .execute(pool).await?;
    }
    Ok(())
}

async fn seed_logs(pool: &PgPool) -> Result<(), sqlx::Error> {
    let agent_names = [
        "CodeReviewer", "DataAnalyst", "TestRunner", "DocWriter",
        "SecurityScanner", "DeployBot", "ChatAssistant", "Translator",
        "ImageProcessor", "PipelineOrchestrator", "LogAnalyzer", "AlertRouter",
    ];
    let messages = [
        "Starting task execution...",
        "Connected to upstream API successfully",
        "Processing batch 3/10 (128 items)",
        "Rate limit approaching: 85% of quota used",
        "Retrying failed request (attempt 2/3)",
        "Task completed in 4.2s",
        "Memory usage: 312MB / 512MB",
        "Token consumption: 2,450 tokens",
        "WebSocket connection established",
        "Agent heartbeat received",
        "Cache hit ratio: 94.2%",
        "Error: Connection timeout after 30s",
        "Warning: Response time exceeding SLO threshold",
        "Checkpoint saved to persistent storage",
        "Model inference completed: 150ms latency",
        "Graceful shutdown initiated",
    ];
    let levels = ["info", "info", "info", "warn", "error", "debug"];

    let mut rng = rand::thread_rng();
    for i in 0..100 {
        let ts = Utc::now() - chrono::Duration::seconds(i * 3 + rng.gen_range(0..3));
        let id = format!("log-{}-{i:04}", ts.timestamp_millis());

        sqlx::query(
            "INSERT INTO logs (id, timestamp, level, agent_name, message) VALUES ($1,$2,$3,$4,$5)"
        )
        .bind(&id)
        .bind(ts)
        .bind(levels[rng.gen_range(0..levels.len())])
        .bind(agent_names[rng.gen_range(0..agent_names.len())])
        .bind(messages[rng.gen_range(0..messages.len())])
        .execute(pool).await?;
    }
    Ok(())
}

async fn seed_alerts(pool: &PgPool) -> Result<(), sqlx::Error> {
    let alerts = vec![
        ("alert-001", "critical", "Agent SecurityScanner unresponsive",
         "No heartbeat received for 5 minutes. Last seen processing CVE scan.",
         "SecurityScanner", 120, false),
        ("alert-002", "warning", "High memory usage on DataAnalyst",
         "Memory usage at 92% (472MB / 512MB). Consider scaling resources.",
         "DataAnalyst", 300, false),
        ("alert-003", "warning", "Task failure rate above threshold",
         "3 consecutive failures on PipelineOrchestrator in the last 30 minutes.",
         "PipelineOrchestrator", 600, true),
        ("alert-004", "info", "Scheduled maintenance window",
         "System maintenance scheduled for 02:00-04:00 UTC.",
         "System", 1800, true),
    ];

    for (id, severity, title, message, agent, ago_secs, acked) in alerts {
        let ts = Utc::now() - chrono::Duration::seconds(ago_secs);
        sqlx::query(
            "INSERT INTO alerts (id, severity, title, message, agent_name, timestamp, acknowledged) VALUES ($1,$2,$3,$4,$5,$6,$7)"
        )
        .bind(id).bind(severity).bind(title).bind(message)
        .bind(agent).bind(ts).bind(acked)
        .execute(pool).await?;
    }
    Ok(())
}
