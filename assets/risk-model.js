export const LIKELIHOOD = ['Rare — exceptional circumstances', 'Unlikely — plausible but infrequent', 'Possible — could occur in a typical year', 'Likely — expected without reliable controls', 'Almost certain — repeated or imminent exposure'];
export const IMPACT = ['Insignificant — negligible disruption; routine correction', 'Minor — limited internal disruption or small loss', 'Moderate — material team disruption or limited privacy harm', 'Major — prolonged disruption, significant loss or reportable harm', 'Severe — widespread harm, sustained outage or major regulatory consequences'];
export const STATUSES = ['Identified', 'In treatment', 'Monitoring', 'Accepted', 'Closed'];
export const ACTION_STATUSES = ['Planned', 'In progress', 'Complete', 'Deferred'];
export const STRATEGIES = ['accept', 'mitigate', 'transfer', 'avoid'];
export const score = ({ likelihood, impact }) => likelihood * impact;
export function severity(value) {
  if (!Number.isInteger(value) || value < 1 || value > 25) throw new RangeError('Score must be an integer from 1 to 25');
  return value <= 4 ? 'Low' : value <= 9 ? 'Moderate' : value <= 16 ? 'High' : 'Critical';
}
export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function validateRisks(data) {
  const errors = [];
  if (!Array.isArray(data) || !data.length) return ['Risk register must be a nonempty array'];
  const ids = new Set();
  const text = (v) => typeof v === 'string' && v.trim().length > 0;
  for (const [index, r] of data.entries()) {
    const at = `Record ${index + 1}`;
    if (!r || typeof r !== 'object' || Array.isArray(r)) { errors.push(`${at}: must be an object`); continue; }
    if (!/^R-\d{3,}$/.test(r.id) || ids.has(r.id)) errors.push(`${at}: invalid or duplicate ID`);
    ids.add(r.id);
    for (const key of ['title', 'category', 'description', 'owner', 'residualBasis']) if (!text(r[key])) errors.push(`${at}: missing ${key}`);
    for (const key of ['causes', 'consequences', 'controls']) if (!Array.isArray(r[key]) || !r[key].length || !r[key].every(text)) errors.push(`${at}: ${key} must contain nonempty text`);
    for (const key of ['inherent', 'residual']) {
      for (const axis of ['likelihood', 'impact']) if (!Number.isInteger(r[key]?.[axis]) || r[key][axis] < 1 || r[key][axis] > 5) errors.push(`${at}: ${key}.${axis} must be 1–5`);
      if (r[key] && Object.hasOwn(r[key], 'score')) errors.push(`${at}: calculate scores; do not store them`);
    }
    if (r.residualType !== 'proposed') errors.push(`${at}: residualType must be proposed for this unverified portfolio`);
    if (!STRATEGIES.includes(r.strategy)) errors.push(`${at}: invalid strategy`);
    if (!STATUSES.includes(r.status)) errors.push(`${at}: invalid workflow status`);
    for (const key of ['identified', 'assessed', 'nextReview']) if (!validDate(r[key])) errors.push(`${at}: invalid ${key} date`);
    if (r.identified > r.assessed || r.assessed > r.nextReview) errors.push(`${at}: assessment dates out of order`);
    if (!Array.isArray(r.actions) || !r.actions.length) errors.push(`${at}: actions required`);
    else for (const a of r.actions) if (!a || !text(a.action) || !text(a.owner) || !validDate(a.due) || !ACTION_STATUSES.includes(a.status)) errors.push(`${at}: invalid treatment action`);
    if (!Array.isArray(r.history) || !r.history.length) errors.push(`${at}: history required`);
    else for (const h of r.history) if (!h || !validDate(h.date) || !text(h.author) || !text(h.change)) errors.push(`${at}: invalid history entry`);
  }
  return errors;
}
export function summarize(risks, today = new Date().toISOString().slice(0, 10)) {
  return { total: risks.length, critical: risks.filter(r => severity(score(r.inherent)) === 'Critical').length,
    high: risks.filter(r => severity(score(r.inherent)) === 'High').length,
    treatment: risks.filter(r => r.status === 'In treatment').length,
    due: risks.filter(r => r.status !== 'Closed' && r.nextReview <= today).length };
}
export function selectRisks(risks, { query = '', category = '', rating = '', status = '', sort = 'id', direction = 'asc' } = {}) {
  const selected = risks.filter(r => [r.id, r.title, r.category, r.owner, r.description].join(' ').toLowerCase().includes(query.toLowerCase().trim()) && (!category || r.category === category) && (!rating || severity(score(r.inherent)) === rating) && (!status || r.status === status));
  const value = r => sort === 'inherent' || sort === 'residual' ? score(r[sort]) : sort === 'severity' ? score(r.inherent) : r[sort];
  return selected.sort((a, b) => {
    const x = value(a), y = value(b);
    const comparison = typeof x === 'number' ? x - y : String(x).localeCompare(String(y));
    return (comparison || a.id.localeCompare(b.id)) * (direction === 'desc' ? -1 : 1);
  });
}
export function csvCell(value) {
  let text = String(value ?? '');
  // Prefix formula-like cells, including formulas hidden behind whitespace/control characters.
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function toCSV(risks) {
  const headers = ['ID', 'Title', 'Category', 'Owner', 'Risk statement', 'Causes', 'Consequences', 'Inherent likelihood', 'Inherent impact', 'Inherent score', 'Inherent severity', 'Assumed controls (unverified)', 'Proposed residual likelihood', 'Proposed residual impact', 'Proposed residual score', 'Proposed residual severity', 'Residual basis', 'Strategy', 'Actions', 'Status', 'Identified', 'Assessed', 'Next review', 'History'];
  const rows = risks.map(r => [r.id, r.title, r.category, r.owner, r.description, r.causes.join('; '), r.consequences.join('; '), r.inherent.likelihood, r.inherent.impact, score(r.inherent), severity(score(r.inherent)), r.controls.join('; '), r.residual.likelihood, r.residual.impact, score(r.residual), severity(score(r.residual)), r.residualBasis, r.strategy, r.actions.map(a => `${a.action} | ${a.owner} | ${a.due} | ${a.status}`).join('; '), r.status, r.identified, r.assessed, r.nextReview, r.history.map(h => `${h.date} | ${h.author} | ${h.change}`).join('; ')]);
  return '\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
