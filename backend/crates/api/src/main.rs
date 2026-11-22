use axum::{
    extract::{DefaultBodyLimit, Path, State},
    http::{header, HeaderValue, Method, StatusCode},
    routing::{get, post},
    Json, Router,
};
use serde::Deserialize;
use serde_json::{json, Value};
use std::{collections::HashMap, env, net::SocketAddr, sync::Arc};
use tokio::sync::RwLock;
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use uuid::Uuid;
use xf_agent_core::{AgentTask, TaskState};
use xf_policy::{evaluate, Decision};

#[derive(Clone)]
struct AppState {
    tasks: Arc<RwLock<HashMap<Uuid, AgentTask>>>,
}
#[derive(Deserialize)]
struct CreateTask {
    input: String,
    tool: Option<String>,
    agent_id: Option<String>,
}
#[derive(Deserialize)]
struct RpcRequest {
    jsonrpc: String,
    id: Option<Value>,
    method: String,
    params: Option<Value>,
}

async fn health() -> Json<Value> {
    Json(json!({"status":"ok","service":"xfree-studio-api","version":"0.1.0"}))
}
async fn agents() -> Json<Value> {
    Json(json!({"agents":[{
        "id":"utility-agent",
        "name":"Utility Agent",
        "skills":["echo","word_count","word_frequency"]
    }]}))
}

async fn create_task(
    State(state): State<AppState>,
    Json(req): Json<CreateTask>,
) -> Result<(StatusCode, Json<AgentTask>), (StatusCode, Json<Value>)> {
    if req.input.len() > 32_768 {
        return Err((StatusCode::BAD_REQUEST, Json(json!({"error":"input_too_long"}))));
    }
    let agent_id = req.agent_id.unwrap_or_else(|| "utility-agent".to_string());
    if agent_id != "utility-agent" {
        return Err((StatusCode::BAD_REQUEST, Json(json!({"error":"unknown_agent"}))));
    }
    let tool = req.tool.unwrap_or_else(|| "word_count".into());
    let risk = xf_tools::risk(&tool).ok_or((
        StatusCode::NOT_FOUND,
        Json(json!({"error":"unknown_tool"})),
    ))?;
    if evaluate(risk, false) != Decision::Allow {
        return Err((StatusCode::FORBIDDEN, Json(json!({"error":"permission_denied"}))));
    }
    let mut task = AgentTask::new(agent_id, tool.clone(), req.input.clone());
    task.transition(TaskState::Working).map_err(|e| (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(json!({"error":e.to_string()})),
    ))?;
    let input = json!({"text":req.input});
    task.finish(xf_tools::execute(&tool, &input).map(|v| v.to_string()).map_err(|e| e.to_string()))
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error":e.to_string()}))))?;
    state.tasks.write().await.insert(task.id, task.clone());
    Ok((StatusCode::CREATED, Json(task)))
}

async fn get_task(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<AgentTask>, StatusCode> {
    state.tasks.read().await.get(&id).cloned().map(Json).ok_or(StatusCode::NOT_FOUND)
}

// Demonstration JSON-RPC only: not a standards-conformant MCP Streamable HTTP implementation.
async fn mcp_demo(Json(req): Json<RpcRequest>) -> Json<Value> {
    let id = req.id.unwrap_or(Value::Null);
    if req.jsonrpc != "2.0" {
        return Json(json!({"jsonrpc":"2.0","id":id,"error":{"code":-32600,"message":"Invalid request"}}));
    }
    let result = match req.method.as_str() {
        "ping" => Ok(json!({})),
        "tools/list" => Ok(json!({"tools":xf_tools::manifest()})),
        "tools/call" => {
            let p = req.params.unwrap_or(Value::Null);
            let name = p.get("name").and_then(Value::as_str).unwrap_or("");
            let args = p.get("arguments").cloned().unwrap_or(json!({}));
            match xf_tools::risk(name) {
                None => Err(json!({"code":-32602,"message":"Unknown tool"})),
                Some(risk) if evaluate(risk, false) != Decision::Allow =>
                    Err(json!({"code":-32603,"message":"Tool denied by policy"})),
                Some(_) => match xf_tools::execute(name, &args) {
                    Ok(out) => Ok(json!({"content":[{"type":"text","text":out.to_string()}]})),
                    Err(e) => Ok(json!({"isError":true,"content":[{"type":"text","text":e.to_string()}]})),
                }
            }
        }
        _ => Err(json!({"code":-32601,"message":"Method not found"})),
    };
    Json(match result {
        Ok(v) => json!({"jsonrpc":"2.0","id":id,"result":v}),
        Err(e) => json!({"jsonrpc":"2.0","id":id,"error":e}),
    })
}
async fn a2a_not_implemented() -> (StatusCode, Json<Value>) {
    (StatusCode::NOT_IMPLEMENTED, Json(json!({
        "error":"a2a_not_implemented",
        "message":"Official A2A protocol and security conformance are not implemented."
    })))
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .init();
    let origin: HeaderValue = env::var("CORS_ORIGIN")
        .unwrap_or_else(|_| "http://localhost:5173".into())
        .parse()
        .expect("Invalid CORS_ORIGIN");
    let cors = CorsLayer::new()
        .allow_origin(origin)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([header::CONTENT_TYPE]);
    let state = AppState { tasks: Arc::new(RwLock::new(HashMap::new())) };
    let app = Router::new()
        .route("/health", get(health))
        .route("/v1/agents", get(agents))
        .route("/v1/tasks", post(create_task))
        .route("/v1/tasks/{id}", get(get_task))
        .route("/experimental/mcp", post(mcp_demo))
        .route("/experimental/a2a", post(a2a_not_implemented))
        .layer(DefaultBodyLimit::max(33_000))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state);
    let addr: SocketAddr = env::var("BIND_ADDR")
        .unwrap_or_else(|_| "127.0.0.1:8080".into())
        .parse()
        .expect("Invalid BIND_ADDR");
    tracing::info!(%addr,"starting Xfree Studio development API");
    let listener = tokio::net::TcpListener::bind(addr).await.expect("bind failed");
    axum::serve(listener, app).await.expect("server failed");
}
