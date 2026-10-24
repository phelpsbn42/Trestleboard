# Quality Report

**Project**: {{project_name}}
**Generated**: {{generated_date}}
**Scope**: {{scope}}

{{summary}}

---

## Test Strategy

| Level | Tests | Notes |
|-------|-------|-------|
{{#test_strategy.levels}}
| {{level}} | {{count}} | {{notes}} |
{{/test_strategy.levels}}

{{#test_strategy.coverage}}
**Coverage**: {{line}}% line, {{branch}}% branch
{{/test_strategy.coverage}}

{{#test_strategy.gaps}}
- Gap: {{.}}
{{/test_strategy.gaps}}

---

## Findings

{{#findings}}
### [{{id}}] {{title}}

| Attribute | Value |
|-----------|-------|
| **Severity** | {{severity}} |
| **Category** | {{category}} |
| **Location** | {{location}} |

{{description}}

**Recommendation**: {{recommendation}}

{{/findings}}

---

## Consistency Checks

| Check | Result | Details |
|-------|--------|---------|
{{#consistency_checks}}
| {{check}} | {{result}} | {{details}} |
{{/consistency_checks}}

---

## Recommendations

{{#recommendations}}
{{priority}}. {{action}}
{{/recommendations}}
