# Risk scoring methodology

**Portfolio disclaimer:** Augusta Recruiting, all scenarios, owners, assessments, controls and history are fictional. No incidents or control effectiveness have been verified. This is not legal advice or a real organizational assessment.

## Model and scope

The register covers candidate privacy, information security, consultant access lifecycle, fraud, operational resilience and hiring compliance. A risk statement follows **cause → uncertain event → business impact**. Each owner is an accountable organizational role, not a named individual.

**Score = likelihood × impact**, each on an ordinal scale from 1 to 5. Scores are calculated in JavaScript, never stored as duplicate fields. The same function is used for the table, matrix, details, CSV and tests.

| Score | Rating | Illustrative response |
| --- | --- | --- |
| 1–4 | Low | Monitor; document an acceptance decision if appropriate |
| 5–9 | Moderate | Assign ownership and proportionate treatment |
| 10–16 | High | Prioritize treatment and management review |
| 17–25 | Critical | Prompt management attention and treatment planning |

These responses are examples, not approved risk appetite or a claim that any score is acceptable. Numeric bands describe the product; some integers in the bands cannot be produced by a 5×5 matrix.

## Likelihood

Use an illustrative annual horizon, informed by exposure, plausible threats, and control evidence when available. No statistical probabilities are claimed.

| Level | Definition |
| --- | --- |
| 1 — Rare | Exceptional circumstances |
| 2 — Unlikely | Plausible but infrequent |
| 3 — Possible | Could occur in a typical year |
| 4 — Likely | Expected without reliable controls |
| 5 — Almost certain | Repeated or imminent exposure |

## Impact

Consider confidentiality, privacy harm, fairness, financial loss, legal duties, client trust and service interruption. Use the most credible material consequence rather than averaging away severe harm. No monetary or outage thresholds have been calibrated.

| Level | Definition |
| --- | --- |
| 1 — Insignificant | Negligible disruption; routine correction |
| 2 — Minor | Limited internal disruption or small loss |
| 3 — Moderate | Material team disruption or limited privacy harm |
| 4 — Major | Prolonged disruption, significant loss or reportable harm |
| 5 — Severe | Widespread harm, sustained outage or major regulatory consequences |

## Inherent, current and target exposure

- **Inherent** estimates exposure before controls. The dashboard severity cards and severity filter use this basis.
- **Existing hypothetical controls** are explicitly assumed. They are distinct from planned actions and are not supported by audit evidence.
- **Proposed residual target** estimates exposure only if planned treatments work. `residualType` must be `proposed`. Each record explains its assumptions in `residualBasis`. A lower target does not mean the action has been completed or that current exposure has fallen.

This version does not estimate evidenced current residual exposure. Before using it operationally, add control test evidence, assessor review and an approved assessment convention. Do not relabel a target as actual residual exposure without these changes.

## Treatment and review

Strategies are accept, mitigate, transfer or avoid; all initial examples use mitigate. Transfer does not remove accountability, and acceptance requires an authorized, documented decision. Actions have a role owner, ISO calendar due date, and Planned / In progress / Complete / Deferred status. Overall workflow is Identified / In treatment / Monitoring / Accepted / Closed. Illustrative progress statuses are fictional too.

A review is due when its next review date is today or earlier in **UTC** and the risk is not Closed. Counts use the entire register, independently of table filters or the matrix mode. Review after significant changes or incidents as well as on schedule. Preserve history through JSON entries and Git commits; do not silently replace prior assessments.

## Assumptions and limitations

Ordinal multiplication is a prioritization aid, not quantified loss or mathematical precision. Equal scores can conceal different risk profiles. The five examples are not comprehensive. Supplier/client control dependencies, jurisdictional employment and privacy law, correlated risks, evidence freshness and threat changes require professional judgment. An organization must calibrate likelihood, impact, review cadence, escalation thresholds and risk appetite with its leadership and qualified legal advisers before real use. No sensitive data belongs in this public repository.
