# Inception Deck

**Project**: AshlarPress
**Generated**: 2026-08-11

---

# Section 1: Why Are We Here?

## Problem Statement

Educators spend hours to days manually researching and assembling newsletters. This time-intensive process limits their capacity for other educational work.

## Who Experiences This Problem?

- **Educators**: Organization members responsible for creating newsletters who lack time to research and compile content
- **Human Editors**: Those who curate, refine, and finalize newsletter content before publication
- **Newsletter Readers**: Members of clubs and fraternities who consume the newsletters and are inspired to explore topics further

## Current State

Newsletter creation is a manual, time-consuming process requiring hours of research, writing, and assembly. Educators struggle to maintain consistent publication schedules while managing other responsibilities.

## Consequences of Inaction

- Newsletters take hours or days to create, limiting educator productivity
- Reduced newsletter frequency or quality due to time constraints
- Educators unable to focus on other important educational activities
- Potential for topic repetition without systematic tracking

## Vision of Success

AshlarPress enables educators to assemble inspiring newsletters in a few hours instead of days, with AI-assisted content gathering that sparks curiosity and encourages readers to explore topics further.

### Success Criteria

- [ ] Ability to build a full year of newsletters (12+ issues)
- [ ] Reduce assembly time to a few hours per issue
- [ ] Human review and editing remains part of the workflow
- [ ] All content includes proper source citations
- [ ] No unintentional topic repetition across issues
- [ ] Content inspires readers to explore topics further

## Key Drivers

- **Time Savings**: Reduce newsletter creation from hours/days to a few hours
- **Quality Content**: AI-gathered content with citations that inspires further research
- **Human Control**: Editors remain at the center of research and editorial decisions

---

# Section 2: Elevator Pitch

## The Pitch

> For **educators**
> who **need to assemble inspiring organizational newsletters but lack time to start from scratch**,
> the **AshlarPress**
> is a **newsletter generation engine**
> that **gathers, cites, and organizes seed content from configurable sources using customizable templates**.
> Unlike **fully-automated writing tools that bypass human judgment**,
> our product **bootstraps inspirational starting points with full source attribution, tracks previously covered topics, and keeps humans at the center of research and editorial decisions**.

## Breakdown

### Target Customer
Educators in clubs and fraternities (and similar organizations) responsible for creating regular newsletters

### Customer Need
Educators spend significant time researching and compiling content, leaving less time for other important work

### Product Name
**AshlarPress**

### Product Category
newsletter generation engine

### Key Benefit
AI agents research, write, and generate images based on configurable prompts, while tracking topics to prevent repetition

### Competition / Alternatives
- **Manual Research**: Time-consuming, inconsistent, no systematic topic tracking
- **Generic AI Writing Tools**: Replace rather than support human judgment, lack citation, no topic memory

### Our Differentiator
AshlarPress is designed to inspire further research, not replace it. Human editors review and refine all content before publication.

## Tagline Options

- "From Rough Ideas to Polished Inspiration"
- "Inspire Curiosity. Save Time."
- "Research Starts Here."

## Compelling Reason to Act Now

Organizations need consistent, quality newsletters but educators' time is limited. AshlarPress removes the research bottleneck while maintaining human editorial oversight.

---

# Section 3: Product Box

## Front of Box

### Product Name
# AshlarPress

### Tagline
*"From Rough Ideas to Polished Inspiration"*

### Hero Image Description
A rough stone being refined into a polished ashlar, with newsletter pages emerging from within

### Top 3 Features

### Smart Gathering
AI agents fetch and cite content based on your prompts, respecting your exclusion list

### Never Repeat Yourself
Topic Ledger tracks what you've already covered across all issues

### Your Voice, Your Control
Human editors review, refine, and contribute their own pieces

## Back of Box

### Product Description
AshlarPress is a newsletter generation engine that gathers, cites, and organizes content from configurable sources. It uses AI agents for research, copywriting, and image generation while keeping human editors in control.

### Key Benefits

- clock **Save Time**: Reduce newsletter assembly from hours/days to a few hours
- link **Cite Everything**: All gathered content includes source attribution for verification
- brain **Inspire Curiosity**: Content designed to encourage readers to explore topics further

### Technical Highlights

- YAML-based configuration for sections, prompts, and exclusions
- Multi-agent orchestration (Research, Copywriter, Image)
- Configurable AI CLI backends (Claude, Gemini, Copilot)
- Mustache templating for consistent newsletter formatting
- Topic Ledger for cross-issue topic tracking

### Requirements / Prerequisites

- Node.js runtime
- VSCode (recommended)
- AI CLI tool with valid license (Claude CLI, Gemini CLI, or Copilot CLI)
- Internet access for research agents

## Quick Facts

| Attribute | Value |
|-----------|-------|
| Version | 1.0.0 |
| Platform | Local (macOS, Linux, Windows) |
| License | Open Source |
| Support | Community / GitHub |

## Testimonial (Aspirational)

> "AshlarPress transformed our monthly newsletter from a dreaded chore into an enjoyable curation experience."
>
> — Future User, Lodge Education Officer

## Call to Action

Clone the repository and start creating your first newsletter in minutes.

---

# Section 4: NOT List

## Purpose

This section explicitly defines what is **out of scope** for AshlarPress. Clear boundaries prevent scope creep and set appropriate expectations.

## Definitely NOT Doing (Out of Scope)

### Replacement for research
- **Why excluded**: AshlarPress bootstraps and inspires; humans do the real research
- **Common misconception**: That AI-generated content is the final word on any topic

### Replacement for writing
- **Why excluded**: AshlarPress gathers and organizes; editors craft the final voice
- **Common misconception**: That AI copy is ready to publish without human review

### Auto-publish
- **Why excluded**: Human review required before any publication
- **Common misconception**: That the system will automatically send newsletters

### Full CMS
- **Why excluded**: Generates content; doesn't manage website or distribution
- **Common misconception**: That it handles website publishing and subscriber management

### Real-time content
- **Why excluded**: Creates periodic newsletters, not live feeds
- **Common misconception**: That it provides real-time news updates

### Multi-tenant SaaS
- **Why excluded**: Single organization/instance focus in v1
- **Common misconception**: That it's a hosted service for multiple organizations

### Paid subscriptions handling
- **Why excluded**: No billing, paywalls, or subscriber management
- **Common misconception**: That it manages newsletter monetization

### Email delivery system
- **Why excluded**: Produces output files; doesn't send emails directly
- **Common misconception**: That it handles email list management and sending

### Cloud-hosted
- **Why excluded**: Local-first tool for editors; cloud deployment is future consideration
- **Common misconception**: That it requires cloud infrastructure

### Multi-language support
- **Why excluded**: Single language support in v1
- **Common misconception**: That it handles translation or multiple languages

### Analytics/tracking
- **Why excluded**: Future consideration; v1 focuses on content creation
- **Common misconception**: That it tracks reader engagement or open rates

## Not Doing *Right Now* (Future Consideration)

### Cloud storage connectors
- **Why deferred**: Filesystem first, extensibility designed in
- **Potential timeline**: Future phases
- **Dependencies**: Core workflow must be stable first

### SharePoint/Google Drive integration
- **Why deferred**: Planned for future extensibility
- **Potential timeline**: Post v1
- **Dependencies**: Pluggable connector architecture

### Analytics dashboard
- **Why deferred**: Focus on content creation first
- **Potential timeline**: Future consideration
- **Dependencies**: Publication workflow established

## In Scope (For Clarity)

- AI-powered content gathering with citations
- YAML-based configuration (sections, prompts, exclusions)
- Multi-agent orchestration (Research, Copywriter, Image)
- Topic Ledger for tracking covered topics
- Editor contributions directory
- Mustache templating
- Output rendering (Markdown, PDF, HTML)
- Configurable AI CLI backends

## Scope Boundaries

### User Types NOT Supported
- Users without AI CLI subscriptions
- Users expecting fully automated publishing

### Platforms NOT Supported
- Mobile devices (v1)
- Cloud-only environments (v1)

### Integrations NOT Included
- Email service providers (v1)
- CMS platforms (v1)
- Cloud storage services (v1)

### Features Explicitly Excluded
- Auto-publish without human review
- Real-time content updates
- Subscriber management
- Payment processing
- Multi-language translation

## Decision Log

| Item | Decision | Date | Decided By |
|------|----------|------|------------|
| Image generation | In scope - aligned to copy from other agents | 2026-08-11 | Project Lead |
| Multi-language | Out of scope for v1 | 2026-08-11 | Project Lead |
| Analytics | Future consideration, not v1 | 2026-08-11 | Project Lead |

## Escalation Path

If stakeholders request out-of-scope items:
1. Reference this NOT List
2. Discuss with Project Lead
3. If approved, update Inception Deck formally
4. Re-baseline estimates and timeline

---

# Section 5: Meet the Neighbors

## Core Team

### Project Lead
- **Role**: Decision-maker, Developer, Architect
- **Responsibilities**: Architecture, implementation, all decisions
- **Availability**: Volunteer time
- **Contact**: GitHub

## Key Stakeholders

### Human Editors
- **Title/Role**: Primary Users
- **Interest in Project**: High
- **Influence Level**: High
- **Engagement Strategy**: Collaborate
- **Key Concerns**: Ease of use, quality of gathered content
- **Communication Preference**: GitHub Issues

### Volunteer Contributors
- **Title/Role**: Future Developers
- **Interest in Project**: Medium
- **Influence Level**: Medium
- **Engagement Strategy**: Collaborate
- **Key Concerns**: Clear documentation, good architecture
- **Communication Preference**: GitHub

### Newsletter Readers
- **Title/Role**: End Consumers
- **Interest in Project**: Medium
- **Influence Level**: Low
- **Engagement Strategy**: Inform
- **Key Concerns**: Quality and relevance of content
- **Communication Preference**: Through newsletters

## Stakeholder Matrix

| Stakeholder | Interest | Influence | Strategy |
|-------------|----------|-----------|----------|
| Project Lead | High | High | Owner |
| Human Editors | High | High | Collaborate |
| Volunteer Contributors | Medium | Medium | Collaborate |
| Newsletter Readers | Medium | Low | Inform |

### Engagement Strategies
- **Manage Closely** (High Interest, High Influence): Regular updates, involve in decisions
- **Keep Satisfied** (Low Interest, High Influence): Address concerns, don't overwhelm
- **Keep Informed** (High Interest, Low Influence): Regular communication, gather feedback
- **Monitor** (Low Interest, Low Influence): Minimal effort, periodic updates

## External Systems / Services

### AI CLI Tools (Claude, Gemini, Copilot)
- **Integration Type**: CLI subprocess
- **Owner**: Anthropic, Google, Microsoft
- **SLA/Availability**: Per provider terms
- **Documentation**: Provider documentation

## Potential Blockers

- **AI CLI tool API changes**: Abstract CLI calls behind interface; support multiple providers

---

# Section 6: Show the Solution

## High-Level Solution Overview

AshlarPress is an orchestration layer that coordinates AI agents (Research, Copywriter, Image) via configurable AI CLI tools, assembles their output with human contributions, and renders newsletters using Mustache templates.

## Solution Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           ASHLARPRESS                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────────────────────────────────┐  │
│  │    CONFIG    │    │              AGENT ORCHESTRATOR           │  │
│  │ newsletter.  │───▶│  ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │    yaml      │    │  │ Research │ │Copywriter│ │  Image   │  │  │
│  └──────────────┘    │  │  Agent   │ │  Agent   │ │  Agent   │  │  │
│                      │  └────┬─────┘ └────┬─────┘ └────┬─────┘  │  │
│                      │       └────────────┴────────────┘        │  │
│                      └──────────────────────────────────────────┘  │
│                                         │                          │
│  ┌──────────────┐                       ▼                          │
│  │   EDITOR     │    ┌──────────────────────────────────────────┐  │
│  │ CONTRIBUTIONS│───▶│            ASSEMBLY ENGINE               │  │
│  └──────────────┘    │  • Process contributions first           │  │
│                      │  • Gap analysis against sections          │  │
│                      │  • Merge gathered + editor content        │  │
│                      │  • Apply Mustache templates               │  │
│                      │  • Check Topic Ledger                     │  │
│                      └──────────────────────────────────────────┘  │
│                                         │                          │
│                                         ▼                          │
│                      ┌──────────────────────────────────────────┐  │
│                      │              OUTPUT                       │  │
│                      │  newsletter.md + newsletter.pdf           │  │
│                      └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      TOPIC LEDGER                             │  │
│  │            (tracks all topics across all issues)              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

*High-level architecture showing config, agent orchestration, assembly engine, and output rendering*

## Key Components

### Config (YAML)
- **Purpose**: Defines sections, prompts, exclusion sites, agent CLI assignments
- **Technology**: YAML
- **Interactions**: Read by Agent Orchestrator

### Agent Orchestrator
- **Purpose**: Coordinates fan-out to Research, Copywriter, Image agents
- **Technology**: Node.js
- **Interactions**: Invokes AI CLI tools, collects output

### Research Agent
- **Purpose**: Gathers content from web, cites sources, respects exclusions
- **Technology**: AI CLI (configurable)
- **Interactions**: Receives prompts, outputs gathered content

### Copywriter Agent
- **Purpose**: Refines/crafts copy from gathered material
- **Technology**: AI CLI (configurable)
- **Interactions**: Receives gathered content, outputs refined copy

### Image Agent
- **Purpose**: Generates visuals aligned to copy context
- **Technology**: AI CLI (configurable)
- **Interactions**: Receives copy context, outputs images

### Editor Contributions
- **Purpose**: Directory for human-submitted content
- **Technology**: Filesystem
- **Interactions**: Read by Assembly Engine, classified to sections

### Assembly Engine
- **Purpose**: Merges content, applies templates, checks ledger, renders output
- **Technology**: Node.js, Mustache
- **Interactions**: Reads all content, writes issue.json, renders MD/PDF/HTML

### Topic Ledger
- **Purpose**: Master list preventing topic repetition across issues
- **Technology**: JSON
- **Interactions**: Read/write by Assembly Engine

### Output Renderer
- **Purpose**: Converts Markdown to PDF/HTML
- **Technology**: Pandoc or similar
- **Interactions**: Reads MD, outputs PDF/HTML

## User Journeys

### Generate Newsletter Issue
**Actor**: Human Editor

1. Editor configures newsletter.yaml (sections, prompts, exclusions, agent assignments)
2. Editor optionally drops contributions into input/contributions/
3. Editor runs AshlarPress for a specific issue
4. System processes contributions first, classifies to sections
5. System performs gap analysis to identify sections needing content
6. Agents gather, write, and generate images for gaps
7. Assembly Engine merges all content into issue.json
8. Mustache template renders newsletter.md
9. Editor reviews and edits the Markdown
10. System renders final PDF/HTML
11. Topic Ledger updated with covered topics

## Technical Approach

### Architecture Style
Local-first CLI orchestration with pluggable AI backends

### Key Technologies
- **Runtime**: Node.js - Developer preference, good CLI tooling support
- **Configuration**: YAML - Human-readable, widely understood
- **Data**: JSON - Structured data for issue.json and Topic Ledger
- **Templating**: Mustache - Proven in Trestleboard, logic-less templates
- **AI Integration**: CLI subprocess (Claude, Gemini, Copilot) - Flexibility, cost optimization, redundancy
- **PDF Rendering**: Pandoc or similar - Well-supported MD to PDF conversion

### Data Flow
1. Human contributions processed first and classified. 2. Gap analysis identifies needed content. 3. Agents fill gaps. 4. All contributions (human + agent) compiled into issue.json. 5. Mustache renders from issue.json. 6. PDF/HTML generated from Markdown.

```
Contributions → Classify → issue.json ← Agents
                              ↓
                    Mustache Template
                              ↓
                    newsletter.md
                              ↓
                    newsletter.pdf / .html
```

## Deployment Model

Local-first: runs on editor's machine via VSCode terminal

### Environments
- **Local Development**: Primary environment for editors

---

# Section 7: Risks

## Risk Summary

| ID | Risk | Likelihood | Impact | Score | Status |
|----|------|------------|--------|-------|--------|
| R1 | AI CLI tool changes/breaks | 3 | 4 | 12 | Open |
| R2 | LLM hallucinations / bad sources | 3 | 4 | 12 | Open |
| R3 | API costs escalate | 3 | 3 | 9 | Open |
| R4 | Topic Ledger corruption | 2 | 3 | 6 | Open |
| R5 | Exclusion list bypassed | 2 | 3 | 6 | Open |
| R6 | Image-copy misalignment | 3 | 2 | 6 | Open |
| R7 | Scope creep | 4 | 3 | 12 | Open |
| R8 | Output format rendering issues | 2 | 2 | 4 | Open |

**Risk Score**: Likelihood (1-5) x Impact (1-5)

## Detailed Risk Register

### R1: AI CLI tool changes/breaks

**Category**: Technical

**Description**
AI CLI tools (Claude, Gemini, Copilot) may change their interfaces or become unavailable

**Likelihood**: 3/5 - CLI tools are actively developed and may change

**Impact**: 4/5 - Core functionality depends on CLI tools

**Risk Score**: 12 (Medium-High)

**Triggers / Warning Signs**
- CLI command syntax changes
- Authentication changes
- Deprecation announcements

**Mitigation Strategy**
Abstract CLI calls behind interface; support multiple providers

**Contingency Plan**
Switch to alternative CLI tool

**Owner**: Project Lead

**Status**: Open

**Review Date**: Ongoing

---

### R2: LLM hallucinations / bad sources

**Category**: Technical

**Description**
AI agents may produce inaccurate content or cite unreliable sources

**Likelihood**: 3/5 - LLMs can hallucinate; this is a known limitation

**Impact**: 4/5 - Bad content could damage newsletter credibility

**Risk Score**: 12 (Medium-High)

**Triggers / Warning Signs**
- Unfamiliar topics
- Sparse source material
- Complex claims

**Mitigation Strategy**
Human editor review required; all sources cited for verification

**Contingency Plan**
Editor rejects and manually researches section

**Owner**: Project Lead

**Status**: Open

**Review Date**: Ongoing

---

### R3: API costs escalate

**Category**: Budget

**Description**
Frequent use of AI agents could result in higher than expected API costs

**Likelihood**: 3/5 - Token usage can be unpredictable

**Impact**: 3/5 - Could limit usage or require cost optimization

**Risk Score**: 9 (Medium)

**Triggers / Warning Signs**
- Large issues
- Complex prompts
- Frequent regeneration

**Mitigation Strategy**
Configurable model selection; use cheaper models where appropriate; monitor token usage

**Contingency Plan**
Reduce agent usage; use more human contributions

**Owner**: Project Lead

**Status**: Open

**Review Date**: Ongoing

---

### R7: Scope creep

**Category**: Project

**Description**
Feature requests may expand scope beyond manageable levels

**Likelihood**: 4/5 - Common in open projects

**Impact**: 3/5 - Delays core functionality; complicates maintenance

**Risk Score**: 12 (Medium-High)

**Triggers / Warning Signs**
- User feature requests
- Cool ideas during development

**Mitigation Strategy**
Strong NOT List; prioritize core workflow first; phased delivery

**Contingency Plan**
Defer features to future phases

**Owner**: Project Lead

**Status**: Open

**Review Date**: Ongoing

---

## Risk Categories

### Technical Risks
- AI CLI interface changes
- LLM hallucinations
- Output rendering compatibility

### External Risks
- AI provider availability
- API pricing changes

## Assumptions

- **AI CLI tools (Claude, Gemini, Copilot) will remain available and maintain similar interfaces**: If false, Would need to rewrite agent integration
- **Editors have VSCode and terminal access**: If false, Would need alternative runtime environment
- **Editors are comfortable reviewing AI-generated content**: If false, Would need additional training or documentation
- **Internet access available for research agents**: If false, Research agent would fail; only human contributions possible
- **Editors have valid licenses/API keys for the AI CLI tools they configure**: If false, Agent calls would fail; need alternative provider

## Risk Response Strategies

| Strategy | When to Use |
|----------|-------------|
| **Avoid** | Eliminate the threat by removing the cause |
| **Mitigate** | Reduce likelihood or impact |
| **Transfer** | Shift risk to third party (insurance, contracts) |
| **Accept** | Acknowledge and prepare contingency |

## Risk Review Schedule

- **Weekly**: High risks (score 15+)
- **Bi-weekly**: Medium risks (score 8-14)
- **Monthly**: Low risks (score 1-7)

**Next Review Date**: Ongoing

---

# Section 8: Sizing

## Executive Summary

**Overall Size**: M (S / M / L / XL)

**Estimated Duration**: Phased delivery

**Confidence Level**: 3

## T-Shirt Sizing Reference

| Size | Duration | Team Size | Complexity |
|------|----------|-----------|------------|
| S | 1-2 weeks | 1 person | Low - well understood |
| M | 1-2 months | 1-2 people | Moderate - some unknowns |
| L | 3-6 months | 2-4 people | High - significant unknowns |
| XL | 6+ months | 4+ people | Very High - research required |

## Size Breakdown by Area

### Core Orchestrator
- **Size**: M
- **Rationale**: Coordinate agents, manage config, assembly pipeline
- **Key Efforts**:
  - YAML config parsing
  - Agent coordination
  - Issue assembly logic

### Research Agent
- **Size**: S-M
- **Rationale**: Web search, citation extraction, exclusion filtering
- **Key Efforts**:
  - Prompt construction
  - Source citation
  - Exclusion filtering

### Copywriter Agent
- **Size**: S
- **Rationale**: Prompt-driven content refinement
- **Key Efforts**:
  - Prompt construction
  - Copy refinement

### Image Agent
- **Size**: S
- **Rationale**: Generate images aligned to copy context
- **Key Efforts**:
  - Context passing
  - Image generation prompts

### Topic Ledger
- **Size**: S
- **Rationale**: JSON read/write, duplicate detection
- **Key Efforts**:
  - JSON operations
  - Topic matching

### Template Engine
- **Size**: S
- **Rationale**: Mustache rendering, already proven in Trestleboard
- **Key Efforts**:
  - Template rendering
  - Data binding

### Output Rendering
- **Size**: S-M
- **Rationale**: MD to PDF/HTML conversion
- **Key Efforts**:
  - Pandoc integration
  - Format configuration

### Default Template & Config
- **Size**: S
- **Rationale**: Ready-to-use newsletter template and starter configuration
- **Key Efforts**:
  - Template design
  - Config structure

## Estimation Approach

**Methodology**: T-shirt sizing

Rough estimation based on component complexity and dependencies

### Estimation Participants
- Project Lead (Architect/Developer)

### Estimation Date
2026-08-11

## Rough Timeline

### Phases

#### Phase 1: Foundation
- **Duration**: TBD
- **Key Deliverables**:
  - Config system
  - Folder structure
  - Single CLI support
  - Basic research agent
  - Default template
  - Default configuration
- **Dependencies**: None

#### Phase 2: Full Pipeline
- **Duration**: TBD
- **Key Deliverables**:
  - All agents
  - Topic Ledger
  - Assembly engine
  - Complete newsletter (MD + PDF)
- **Dependencies**: Phase 1 complete

#### Phase 3: Multi-CLI
- **Duration**: TBD
- **Key Deliverables**:
  - Agent CLI configurability
  - Support for Claude, Gemini, Copilot
- **Dependencies**: Phase 2 complete

#### Phase 4: Polish
- **Duration**: TBD
- **Key Deliverables**:
  - Editor contributions
  - HTML output
  - Error handling
  - Production-ready
- **Dependencies**: Phase 3 complete

## Complexity Factors

### Increasing Complexity
- Multi-agent coordination
- Multiple CLI backend support
- Gap analysis logic

### Reducing Complexity
- Reuse Trestleboard patterns (templates, schemas)
- Local-first (no cloud infrastructure)
- Phased delivery (not everything at once)

---

# Section 9: Tradeoffs

## The Tradeoff Sliders

Every project balances competing priorities. These sliders show where AshlarPress sits.

### Scope
```
Fixed                                              Flexible
  1 -------- 2 -------- 3 -------- 4 -------- 5
                        ▲
```
**Position**: 3/5
**Rationale**: Core features fixed, but phased delivery allows flexibility

### Timeline
```
Fixed                                              Flexible
  1 -------- 2 -------- 3 -------- 4 -------- 5
             ▲
```
**Position**: 2/5
**Rationale**: Volunteer project, no hard deadlines

### Budget
```
Fixed                                              Flexible
  1 -------- 2 -------- 3 -------- 4 -------- 5
                        ▲
```
**Position**: 3/5
**Rationale**: API costs are real; design for cost efficiency

### Quality
```
Fixed                                              Flexible
  1 -------- 2 -------- 3 -------- 4 -------- 5
                                   ▲
```
**Position**: 4/5
**Rationale**: Output must be good enough for editors to refine, not rewrite

## Tradeoff Summary

| Dimension | Flexibility | Priority Rank |
|-----------|-------------|---------------|
| Scope | 3/5 | 2 |
| Timeline | 2/5 | 4 |
| Budget | 3/5 | 3 |
| Quality | 4/5 | 1 |

**Primary Constraint**: Quality

**Most Flexible**: Timeline

## What This Means

### If We're Behind Schedule
Defer nice-to-have features to later phases; focus on core workflow

### If We're Over Budget
Use cheaper models for simpler tasks; reduce agent usage; rely more on human contributions

### If Scope Expands
Evaluate against NOT List; defer to future phases if not core

### If Quality Issues Emerge
Delay release until quality standards met; never ship unreliable output

## Quality Dimensions

### Code Quality
- **Target Level**: Clean, documented, maintainable
- **Minimum Acceptable**: Functional with basic documentation
- **Measurement**: Code review, documentation coverage

### Test Coverage
- **Target Level**: Key paths tested
- **Minimum Acceptable**: Critical paths tested
- **Types Required**: Unit tests for core logic

### Documentation
- **Target Level**: README, usage guide, API docs
- **Minimum Acceptable**: README with setup and basic usage
- **Required Artifacts**: Setup instructions, configuration reference

## Acceptable Compromises

- Delay a phase to get quality right
- Cut a nice-to-have feature from v1
- Start with one CLI, add others later
- Use simpler output formats first

## Unacceptable Compromises

- Ship broken or unreliable features
- Cut human editorial review
- Build all CLI integrations at once at expense of core
- Over-engineer rendering pipeline

## Decision Framework

When tradeoff decisions arise:

1. **Consult**: Project Lead
2. **Consider**: Impact on Quality first
3. **Document**: Record decision and rationale
4. **Communicate**: Inform Future contributors

---

# Section 10: What It Takes

## Executive Summary

To deliver AshlarPress, we need:

- **Team**: Solo developer (Project Lead) with potential future volunteer contributors
- **Duration**: Phased delivery, no fixed timeline
- **Budget**: No infrastructure budget; API costs covered by personal subscriptions
- **Key Dependencies**: AI CLI tools, Node.js ecosystem, Pandoc or similar

## Team Composition

### Required Roles

#### Project Lead / Developer
- **Count**: 1
- **Level**: Senior
- **Key Skills**: Node.js, YAML/JSON, AI CLI tools, Mustache templating
- **Allocation**: Volunteer
- **Duration**: Ongoing
- **Status**: Filled

#### Future Contributors
- **Count**: 0
- **Level**: Any
- **Key Skills**: Node.js, documentation, testing
- **Allocation**: Volunteer
- **Duration**: As available
- **Status**: Open

### Team Structure

```
Project Lead (Owner)
       ↓
Future Contributors (TBD)
```

### Total Headcount
- **Core Team**: 1
- **Extended Team**: 0
- **Total FTE**: 0.25

## Skills Matrix

| Skill | Required Level | Available | Gap |
|-------|----------------|-----------|-----|
| Node.js | High | Yes | None |
| YAML/JSON | Medium | Yes | None |
| Mustache templating | Medium | Yes | None |
| AI CLI tools | High | Yes | None |
| PDF generation | Low | Learning | Minor |

## Tools & Infrastructure

### Development Tools
- **VSCode**: Editor environment - Free
- **Node.js**: Runtime - Free
- **Git**: Version control - Free
- **Pandoc**: PDF/HTML rendering - Free

### Infrastructure
- **Local filesystem**: Storage (v1) - Free
- **Future: Pluggable connectors**: SharePoint, GCS, etc. - TBD

### Licenses & Subscriptions
- **AI CLI subscriptions**: 1 seats - Personal (existing)

## Budget Breakdown

| Category | Estimated Cost | Notes |
|----------|----------------|-------|
| Development labor | Volunteer | No paid labor |
| Infrastructure | $0 | Local-first |
| AI API costs | Personal subscription | Monitor token usage |

**Total Estimated Budget**: $0 (volunteer project)

**Contingency (0%)**: N/A

**Grand Total**: $0

## Environment Requirements

### Development
- VSCode with terminal
- Node.js runtime
- AI CLI tool(s) installed
- Git

## Governance & Process

### Methodology
Agile/iterative: Build incrementally, validate each phase

## Success Factors

### Must Have
- AI-powered content gathering with citations
- YAML configuration
- Topic Ledger
- Human editorial oversight
- MD + PDF output

### Should Have
- Multi-CLI backend support
- Image generation agent
- Editor contributions directory
- Default template and configuration

### Nice to Have
- HTML output
- Cloud storage connectors
- Analytics (future)

---

# Open Questions

*No open questions at this time.*

---

*Inception Deck - Complete Document*

---

<sub>Built with [Trestleboard](https://github.com/phelpsbn42/Trestleboard) - Capture organizational knowledge through structured, AI-guided solution delivery.</sub>
