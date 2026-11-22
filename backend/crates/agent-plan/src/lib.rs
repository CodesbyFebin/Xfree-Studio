//! Deterministic, auditable multi-agent planning. No autonomous execution.
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Role {
    Supervisor,
    Planner,
    Coder,
    Tester,
    Reviewer,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PlanStep {
    pub id: u8,
    pub role: Role,
    pub instruction: String,
    pub depends_on: Vec<u8>,
    pub requires_approval: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ExecutionPlan {
    pub goal: String,
    pub steps: Vec<PlanStep>,
    pub status: String,
}

pub fn plan(goal: &str) -> Result<ExecutionPlan, &'static str> {
    let goal = goal.trim();
    if goal.is_empty() || goal.len() > 1200 {
        return Err("goal must be between 1 and 1200 bytes");
    }
    Ok(ExecutionPlan {
        goal: goal.into(),
        status: "proposed_not_executed".into(),
        steps: vec![
            PlanStep { id: 1, role: Role::Supervisor, instruction: "Validate task scope and required permissions".into(), depends_on: vec![], requires_approval: false },
            PlanStep { id: 2, role: Role::Planner, instruction: format!("Produce requirements, architecture and acceptance criteria for: {goal}"), depends_on: vec![1], requires_approval: false },
            PlanStep { id: 3, role: Role::Coder, instruction: "Propose a patch in an isolated workspace".into(), depends_on: vec![2], requires_approval: true },
            PlanStep { id: 4, role: Role::Tester, instruction: "Execute permitted tests in a sandbox".into(), depends_on: vec![3], requires_approval: true },
            PlanStep { id: 5, role: Role::Reviewer, instruction: "Review changes and evidence before deployment".into(), depends_on: vec![4], requires_approval: true },
        ],
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn rejects_empty_and_large_goals() {
        assert!(plan("").is_err());
        assert!(plan(&"x".repeat(1201)).is_err());
    }
    #[test]
    fn makes_auditable_plan_without_execution() {
        let result = plan("Create a portfolio").unwrap();
        assert_eq!(result.steps.len(), 5);
        assert_eq!(result.status, "proposed_not_executed");
        assert!(result.steps[2].requires_approval);
        assert_eq!(result.steps[4].depends_on, vec![4]);
    }
}
