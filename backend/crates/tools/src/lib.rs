use serde_json::{json, Value};
use thiserror::Error;
use xf_policy::Risk;

#[derive(Debug, Error)]
pub enum ToolError {
    #[error("unknown tool")]
    Unknown,
    #[error("input.text must be a string of at most 32768 bytes")]
    BadInput,
}

pub fn risk(name: &str) -> Option<Risk> {
    match name {
        "echo" | "word_count" | "word_frequency" => Some(Risk::ReadOnly),
        _ => None,
    }
}

pub fn manifest() -> Value {
    json!([
        {
            "name": "echo",
            "description": "Return the submitted text unchanged",
            "inputSchema": {"type":"object","properties":{"text":{"type":"string"}},"required":["text"]}
        },
        {
            "name": "word_count",
            "description": "Count whitespace-delimited words",
            "inputSchema": {"type":"object","properties":{"text":{"type":"string"}},"required":["text"]}
        },
        {
            "name": "word_frequency",
            "description": "Count words in descending frequency",
            "inputSchema": {"type":"object","properties":{"text":{"type":"string"}},"required":["text"]}
        }
    ])
}

pub fn execute(name: &str, input: &Value) -> Result<Value, ToolError> {
    if risk(name).is_none() {
        return Err(ToolError::Unknown);
    }
    let text = input.get("text").and_then(Value::as_str).ok_or(ToolError::BadInput)?;
    if text.len() > 32_768 {
        return Err(ToolError::BadInput);
    }
    match name {
        "echo" => Ok(json!({"text": text})),
        "word_count" => Ok(json!({"count": text.split_whitespace().count()})),
        "word_frequency" => {
            use std::collections::BTreeMap;
            let mut words = BTreeMap::<String, usize>::new();
            for word in text.split_whitespace() {
                let normalized = word.trim_matches(|c: char| !c.is_alphanumeric()).to_lowercase();
                if !normalized.is_empty() {
                    *words.entry(normalized).or_default() += 1;
                }
            }
            let mut entries: Vec<_> = words.into_iter().map(|(term,count)| json!({"term":term,"count":count})).collect();
            entries.sort_by(|a,b| {
                b["count"].as_u64().cmp(&a["count"].as_u64())
                    .then_with(|| a["term"].as_str().cmp(&b["term"].as_str()))
            });
            Ok(json!({"items": entries}))
        }
        _ => Err(ToolError::Unknown),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn computes_actual_results() {
        assert_eq!(execute("word_count", &json!({"text":"hello rust world"})).unwrap()["count"],3);
        let r = execute("word_frequency", &json!({"text":"A a b"})).unwrap();
        assert_eq!(r["items"][0]["count"],2);
        assert!(execute("missing", &json!({"text":"x"})).is_err());
    }
}
