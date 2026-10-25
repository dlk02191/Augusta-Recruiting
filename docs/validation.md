# Validation record

Validated on 2026-10-25 using Node.js 24.19.0, Python 3.12.14 and system Chromium with temporary external Playwright / axe tooling.

- `npm run check`: 14 Node tests passed, 0 failed/skipped; JSON validation passed for 5 records; application and model JavaScript syntax passed.
- `node --check tests/browser.mjs`: passed.
- `BROWSER_MODULE_ROOT=/tmp/augusta-browser/node_modules node tests/browser.mjs`: 35 browser checks passed against the HTTP-served `/Augusta-Recruiting/` subpath.
- Functional coverage: all five records, calculated scores and dashboard totals, 25-cell matrix, shared cells, proposed-target toggle, text alternative, search, combined filters, empty state, numeric sorting in both directions, table/matrix details, initial dialog focus, keyboard containment, Escape and focus restoration, complete CSV download, and JavaScript-disabled fallback.
- Failure/security coverage: HTTP data failure, invalid records, disabled export on failure, text rendered without HTML injection, CSV escaping and formula mitigation.
- Responsive coverage: no document overflow at 768, 390 and 320 pixels; desktop and mobile screenshots visually reviewed. The table intentionally scrolls inside its region.
- axe scans: zero reported violations on desktop, mobile and open dialog. Automated scans are basic accessibility evidence, not a complete manual assistive-technology audit.
- Default synthetic dataset: 5 total, 1 Critical, 4 High, 3 In treatment, 0 due on the assessment date. Inherent scores 20 / 16 / 16 / 12 / 12; proposed targets 8 / 6 / 6 / 6 / 8.

## Deployment access limitation

From this environment, a repository-settings read through `gh api repos/dlk02191/Augusta-Recruiting` returned `Forbidden`. Requesting `https://dlk02191.github.io/Augusta-Recruiting/` failed before reaching the site: `CONNECT tunnel failed, response 403` (proxy response). These responses do not establish the public site's deployment status or absence.

Required destinations `api.github.com` and `dlk02191.github.io` have been added to the cloud environment configuration **draft**. Draft persistence does not apply runtime networking or publish an environment. Review/save the settings and publish the environment through the product to use that configuration. No token values were requested or saved.

If Pages has not been enabled, use repository **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main → Folder: / (root) → Save**. Then inspect the Pages deployment and visit the target URL to confirm the interactive register loads. API/network access is needed to verify this from the cloud machine; public availability must not be inferred from a successful Git push.
