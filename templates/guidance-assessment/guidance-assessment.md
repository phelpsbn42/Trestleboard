# Guidance Assessment

**Project / Engagement**: {{project_name}}
**Generated**: {{generated_date}}
**Persona**: {{persona}}
**Scope**: {{scope}}

{{summary}}

## Sources Considered

{{#sources}}
- **{{kind}}**: {{description}}{{#location}} (`{{location}}`){{/location}}
{{/sources}}

## What I Notice

{{#observations}}
### {{id}}

{{statement}}

{{#evidence}}**Evidence**: {{evidence}}{{/evidence}}
{{/observations}}

## My Interpretation

{{#interpretations}}
### {{id}} ({{confidence}} confidence)

{{statement}}

{{#assumptions}}
- Assumption: {{.}}
{{/assumptions}}
{{/interpretations}}

## Suggestions and Experiments

{{#suggestions}}
### {{id}} — {{priority}} priority

**Action**: {{action}}

{{#rationale}}**Why**: {{rationale}}{{/rationale}}
{{#owner}}**Owner**: {{owner}}{{/owner}}
{{#timebox}}**Timebox**: {{timebox}}{{/timebox}}
{{#signal}}**What to inspect**: {{signal}}{{/signal}}
{{/suggestions}}

## Open Questions

{{#open_questions}}
- {{.}}
{{/open_questions}}

## Risks or Contradictions

{{#risks_or_contradictions}}
- {{.}}
{{/risks_or_contradictions}}

## Handoff

{{#handoff}}
**Next persona**: {{next_persona}}

{{next_step}}
{{/handoff}}
