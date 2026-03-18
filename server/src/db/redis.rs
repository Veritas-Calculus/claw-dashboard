use redis::Client;

pub fn init_client(redis_url: &str) -> Result<Client, redis::RedisError> {
    let client = Client::open(redis_url)?;
    tracing::info!("Redis client created");
    Ok(client)
}
