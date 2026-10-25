# Augusta Recruiting — Risk Register

A responsive, interactive GRC engineering portfolio for a fictional recruiting and consulting firm.

> **Fictional portfolio demonstration.** The organization, risks, scenarios, assessments, controls, action progress and history are illustrative. No actual incidents or verified controls are claimed. Never commit real candidate, employee, client or security incident information.

Target site: https://dlk02191.github.io/Augusta-Recruiting/

## Features

- Five cause–event–impact risk scenarios across privacy, security, consultant lifecycle, fraud, resilience and hiring compliance.
- Data-derived summary cards, interactive inherent / proposed-residual 5×5 heat map, and accessible matrix text alternative.
- Search, category/severity/status filters, sortable columns and native keyboard-accessible detail dialogs with focus restoration.
- Full-record CSV export with quoting, Unicode support and spreadsheet formula-injection protection.
- Responsive layout, visible focus, semantic landmarks, labeled controls, local assets and graceful loading errors.

Residual values are **proposed post-treatment targets**, not verified current residual risk. All summaries and severity filters use inherent scores. Filters affect the table; the dashboard, map and CSV always cover the full register.

## Architecture and structure

Plain HTML5, CSS and browser JavaScript modules; JSON is the source of truth. No backend, database, authentication, analytics, third-party scripts, runtime dependencies or build step. All site assets use relative paths for the `/Augusta-Recruiting/` deployment subpath.

```text
index.html                     Dashboard and accessible landmarks
assets/app.js                  Rendering, interactions and loading states
assets/risk-model.js           Shared scoring, validation, selection and CSV logic
assets/styles.css              Responsive styling and focus states
assets/favicon.svg             Local brand mark
data/risks.json                Risk records, targets, actions and history
scripts/validate.js            CLI data validator
tests/risk-model.test.js        Dependency-free Node tests
tests/browser.mjs              Optional browser / accessibility integration checks
docs/methodology.md            Scales, scoring and limitations
.github/workflows/validate.yml PR and push validation
.nojekyll                      Serve static assets directly on GitHub Pages
```

## Run locally

Use Node.js 22+ (CI uses 24) and Python 3. No `npm install` is needed for the application or unit checks.

```sh
npm run check
npm start
```

Open your local server on port 8000. Serve over HTTP; opening `index.html` via `file://` does not support the JSON fetch reliably. For production-subpath verification, run `python3 -m http.server 8000 --directory /workspace` when the checkout is `/workspace/Augusta-Recruiting`, then request `/Augusta-Recruiting/` on that server.

`npm run check` checks JavaScript syntax, validates current JSON and runs the Node suite. Validation checks required fields, unique IDs, real calendar dates and chronology, integer score axes, treatment and history structure, enums and proposed-residual labeling. CSV and filter logic are unit tested too. The initial fixture test deliberately expects the five original IDs and scores; update that explicit expectation when intentionally changing the portfolio scope or assessment values.

Optional integration tests use Chromium, Playwright and axe outside the app dependencies:

```sh
npm install --prefix /tmp/augusta-browser --cache /tmp/augusta-npm-cache --no-package-lock playwright @axe-core/playwright
# Keep the subpath server described above running, then:
BROWSER_MODULE_ROOT=/tmp/augusta-browser/node_modules node tests/browser.mjs
```

Requires Chromium at `/usr/bin/chromium` (override `CHROMIUM_PATH`) and the server at `http://127.0.0.1:8000/Augusta-Recruiting/` (override `SITE_URL`). Browser tooling is optional and not loaded by the website or required for the dependency-free CI suite.

## Maintain risk data with GitHub

1. Create a feature branch. Edit `data/risks.json`; no application-code changes are needed for a new record.
2. Copy an existing record and assign a unique `R-###` ID. Populate all fields, cause–event–impact statement, organizational owner, causes, consequences and explicitly assumed controls.
3. Set `inherent` and `residual` likelihood and impact as integers 1–5; do **not** add calculated scores. Keep `residualType: "proposed"` and explain target dependencies in `residualBasis`.
4. Choose strategy `accept`, `mitigate`, `transfer`, or `avoid`. Add actions with `action`, `owner`, `due` (`YYYY-MM-DD`) and status `Planned`, `In progress`, `Complete`, or `Deferred`.
5. Set workflow status `Identified`, `In treatment`, `Monitoring`, `Accepted`, or `Closed`. Use valid ISO dates with `identified ≤ assessed ≤ nextReview`. Record each assessment/change in `history` with date, role author and change rationale. Add explicit score-change details to history when changing scores.
6. Run `npm run check`, inspect the local site, open a pull request, and require passing validation before merging to `main`. Intentionally update fixture expectations when adding/removing records or changing initial scores. Never remove validation to hide an error.
7. After merge, GitHub Pages redeploys the root site, including the JSON. Confirm the published data. Browser interactions are read-only and never save to GitHub.

The executable contract is `validateRisks` in `assets/risk-model.js`; the CLI and browser both use it. Do not add secrets or personal information to public data, history, or commits.

## Scoring

**Likelihood × impact = score**, from 1 to 25. Low: 1–4; Moderate: 5–9; High: 10–16; Critical: 17–25. The initial inherent scores are 20, 16, 16, 12, 12; targets are 8, 6, 6, 6, 8. Summary: 5 total, 1 Critical, 4 High and 3 In treatment. Due-review count changes with the UTC date. See [methodology](docs/methodology.md) for all scale definitions, assumptions and calibration requirements.

## Deploy to GitHub Pages

The Actions workflow runs validation on every push and pull request. Hosting uses **Deploy from a branch**, not a custom deployment workflow:

1. Repository **Settings → Pages → Build and deployment**.
2. Source: **Deploy from a branch**.
3. Branch: **main**; folder: **/ (root)**; click **Save**.
4. Check the Pages deployment under **Actions** / **Deployments**, then visit https://dlk02191.github.io/Augusta-Recruiting/ and confirm all five records load.

Repository administration permissions and a plan/visibility compatible with GitHub Pages are required. Configure branch protection to require the validation check before merging; branch hosting itself does not wait for this separate workflow. A push or a configured target URL alone does not prove that a deployment succeeded.

## Security and accessibility

Risk text renders through DOM `textContent`, never HTML interpolation. JSON is validated before rendering. A restrictive meta CSP allows only same-origin scripts, CSS, assets and data; there are no inline scripts or styles. Referrer policy is `no-referrer`. CSV exports prefix cells that could be interpreted as spreadsheet formulas, including leading whitespace/control-character variants. Exported content is still untrusted data and should be handled accordingly.

Native modal dialogs support Escape, focus containment and focus restoration. The map has labeled risk buttons and a list alternative; ratings use text in addition to color. The wide register scrolls within a labeled, keyboard-focusable region on narrow screens. JavaScript-disabled users receive direct data/methodology links.

GitHub Pages does not support custom response headers here. A meta CSP cannot enforce `frame-ancestors`; production anti-framing and other server headers require hosting/CDN support. There is no authentication, audit service, approval enforcement or verified control evidence in this public demonstration.

## Limitations and next enhancements

Qualitative ordinal scores require business calibration; target residuals are not evidence of realized reduction. Only five illustrative risks are included. Dates and action progress are synthetic and will age. CI runs model/data tests; optional browser tests require browser tooling. Recommended next work: evidence-linked assessment snapshots, change-diff reporting, automated browser checks in CI, and independently reviewed risk-appetite/acceptance rules. Keep any real operational data in a separate private system.
