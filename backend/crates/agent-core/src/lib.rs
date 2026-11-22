use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use thiserror::Error;
use uuid::Uuid;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TaskState {
    Submitted,
    Working,
    InputRequired,
    Completed,
    Failed,
    Canceled,
}

impl TaskState {
    pub fn can_transition(self, next: Self) -> bool {
        use TaskState::*;
        matches!(
            (self, next),
            (Submitted, Working | Canceled)
                | (Working, Completed | Failed | InputRequired | Canceled)
                | (InputRequired, Working | Failed | Canceled)
        )
    }
}

#[derive(Debug, Error)]
pub enum TaskError {
    #[error("invalid task transition from {from:?} to {to:?}")]
    InvalidTransition { from: TaskState, to: TaskState },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentTask {
    pub id: Uuid,
    pub agent_id: String,
    pub tool: String,
    pub state: TaskState,
    pub input: String,
    pub output: Option<String>,
    pub error: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl AgentTask {
    pub fn new(agent_id: String, tool: String, input: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            agent_id,
            tool,
            state: TaskState::Submitted,
            input,
            output: None,
            error: None,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn transition(&mut self, next: TaskState) -> Result<(), TaskError> {
        if !self.state.can_transition(next) {
            return Err(TaskError::InvalidTransition { from: self.state, to: next });
        }
        self.state = next;
        self.updated_at = Utc::now();
        Ok(())
    }

    pub fn finish(&mut self, result: Result<String, String>) -> Result<(), TaskError> {
        match result {
            Ok(output) => {
                self.transition(TaskState::Completed)?;
                self.output = Some(output);
            }
            Err(error) => {
                self.transition(TaskState::Failed)?;
                self.error = Some(error);
            }
        }
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskArtifact {
    pub id: Uuid,
    pub task_id: Uuid,
    pub content: Value,
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn prohibits_unsupported_and_terminal_transitions() {
        let mut t = AgentTask::new("utility-agent".into(), "word_count".into(), "abc".into());
        assert!(t.transition(TaskState::Completed).is_err());
        t.transition(TaskState::Working).unwrap();
        t.finish(Ok("1".into())).unwrap();
        assert_eq!(t.state, TaskState::Completed);
        assert!(t.transition(TaskState::Working).is_err());
    }
}
