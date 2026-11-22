use serde::Serialize;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Risk {
    ReadOnly,
    Mutating,
    Privileged,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum Decision {
    Allow,
    RequireApproval,
    Deny,
}

pub fn evaluate(risk: Risk, authenticated: bool) -> Decision {
    match (risk, authenticated) {
        (Risk::ReadOnly, _) => Decision::Allow,
        (Risk::Mutating, true) => Decision::RequireApproval,
        (Risk::Mutating, false) | (Risk::Privileged, _) => Decision::Deny,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn defaults_to_deny_for_unsafe_tools() {
        assert_eq!(evaluate(Risk::ReadOnly, false), Decision::Allow);
        assert_eq!(evaluate(Risk::Mutating, false), Decision::Deny);
        assert_eq!(evaluate(Risk::Privileged, true), Decision::Deny);
    }
}
