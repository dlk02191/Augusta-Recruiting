import { score, severity, validateRisks, summarize, selectRisks, toCSV, STATUSES, LIKELIHOOD, IMPACT } from './risk-model.js';
const $ = id => document.getElementById(id);
const make = (tag, text, className) => { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (className) el.className = className; return el; };
let risks = [], assessment = 'inherent', sort = 'id', direction = 'asc', opener;
function riskButton(r, compact = false) {
  const button = make('button', compact ? r.id : r.title, compact ? 'risk-marker' : 'risk-link');
  button.type = 'button'; button.setAttribute('aria-label', `${r.id}: ${r.title}, open details`);
  button.addEventListener('click', () => openRisk(r, button)); return button;
}
function badge(value) { return make('span', severity(value), `badge ${severity(value).toLowerCase()}`); }
function renderMetrics() {
  const summary = summarize(risks);
  const entries = [['REGISTERED EXPOSURES', summary.total, 'Total risks', 'Full portfolio'], ['IMMEDIATE ATTENTION', summary.critical, 'Critical risks', 'Inherent score 17–25'], ['ELEVATED EXPOSURE', summary.high, 'High risks', 'Inherent score 10–16'], ['ACTION UNDERWAY', summary.treatment, 'In treatment', 'Active treatment plans'], ['REVIEW QUEUE', summary.due, 'Due for review', 'Due today or overdue']];
  $('metrics').replaceChildren(...entries.map(([label, value, title, note], i) => { const card = make('article', undefined, `metric metric-${i}`); card.append(make('p', label, 'small-label'), make('strong', value, 'metric-value'), make('h2', title), make('p', note, 'muted')); return card; }));
}
function renderMatrix() {
  const cells = [];
  for (let impact = 5; impact >= 1; impact--) {
    for (let likelihood = 1; likelihood <= 5; likelihood++) {
      const cell = make('div', undefined, `matrix-cell ${severity(impact * likelihood).toLowerCase()}`);
      cell.setAttribute('role', 'group'); cell.setAttribute('aria-label', `Likelihood ${likelihood}, impact ${impact}, ${severity(impact * likelihood)}`);
      const coords = make('span', `${impact * likelihood}`, 'cell-score'); coords.setAttribute('aria-hidden', 'true'); cell.append(coords);
      for (const risk of risks.filter(r => r[assessment].impact === impact && r[assessment].likelihood === likelihood)) cell.append(riskButton(risk, true));
      cells.push(cell);
    }
  }
  const labels = [1, 2, 3, 4, 5].map(n => make('span', n, 'matrix-tick'));
  $('matrix').replaceChildren(...cells, ...labels);
  $('matrix-list').replaceChildren(...risks.map(r => { const li = make('li', `${r.id} — ${r.title}: likelihood ${r[assessment].likelihood}, impact ${r[assessment].impact}, score ${score(r[assessment])}, ${severity(score(r[assessment]))}${assessment === 'residual' ? ' (proposed target)' : ''}.`); return li; }));
  $('matrix-note').textContent = `${assessment === 'inherent' ? 'Inherent exposure before controls.' : 'Proposed targets after planned treatments; effectiveness is unverified.'} Select a risk ID for details. Impact increases from bottom (1) to top (5).`;
}
function renderPriorities() {
  $('priorities').replaceChildren(...selectRisks(risks, { sort: 'inherent', direction: 'desc' }).slice(0, 3).map((r, index) => {
    const article = make('article', undefined, 'priority'); const heading = make('div', undefined, 'priority-top'); heading.append(make('span', `0${index + 1} / ${r.id}`, 'small-label'), badge(score(r.inherent)));
    article.append(heading, riskButton(r), make('p', r.actions[0].action), make('p', `${r.actions[0].owner} · ${r.actions[0].due}`, 'muted')); return article;
  }));
}
function renderTable() {
  const visible = selectRisks(risks, { query: $('search').value, category: $('category').value, rating: $('severity').value, status: $('status').value, sort, direction });
  $('risk-rows').replaceChildren(...visible.map(r => {
    const row = make('tr');
    const id = make('th', r.id, 'risk-id'); id.scope = 'row'; row.append(id);
    const title = make('td'); title.append(riskButton(r)); row.append(title, make('td', r.category), make('td', r.owner), make('td', score(r.inherent), 'score-value'), make('td', score(r.residual), 'score-value'));
    const rating = make('td'); rating.append(badge(score(r.inherent))); row.append(rating);
    const status = make('td'); status.append(make('span', r.status, 'status-pill')); row.append(status);
    const date = make('td'); const time = make('time', r.nextReview); time.dateTime = r.nextReview; date.append(time); row.append(date); return row;
  }));
  $('result-count').textContent = `${visible.length} of ${risks.length} risks`;
  $('empty-state').hidden = visible.length !== 0;
  document.querySelectorAll('[data-sort]').forEach(button => {
    button.closest('th').removeAttribute('aria-sort');
    if (button.dataset.sort === sort) button.closest('th').setAttribute('aria-sort', direction === 'asc' ? 'ascending' : 'descending');
  });
}
function listSection(title, items) {
  const section = make('section', undefined, 'detail-section'), ul = make('ul');
  ul.append(...items.map(item => make('li', item))); section.append(make('h3', title), ul); return section;
}
function openRisk(r, trigger) {
  opener = trigger;
  const fragment = document.createDocumentFragment();
  fragment.append(make('p', `${r.id} / ${r.category}`, 'eyebrow'), make('h2', r.title));
  fragment.lastChild.id = 'detail-title';
  fragment.append(make('p', r.description, 'risk-statement'));
  const meta = make('dl', undefined, 'detail-meta');
  for (const [key, value] of [['Accountable owner', r.owner], ['Workflow', r.status], ['Treatment strategy', r.strategy], ['Date identified', r.identified], ['Last assessment', r.assessed], ['Next review', r.nextReview]]) meta.append(make('dt', key), make('dd', value));
  fragment.append(meta);
  const scoring = make('div', undefined, 'detail-scores');
  for (const [key, title] of [['inherent', 'Inherent exposure'], ['residual', 'Proposed residual target']]) {
    const box = make('div'); box.append(make('h3', title), make('strong', `${r[key].likelihood} × ${r[key].impact} = ${score(r[key])}`), badge(score(r[key]))); scoring.append(box);
  }
  fragment.append(scoring, make('p', r.residualBasis, 'target-note'), listSection('Causes', r.causes), listSection('Potential consequences', r.consequences), listSection('Existing hypothetical controls — assumed, not verified', r.controls));
  const treatment = make('section', undefined, 'detail-section'); treatment.append(make('h3', 'Planned treatment actions'));
  for (const a of r.actions) { const action = make('article', undefined, 'treatment-action'); action.append(make('h4', a.action), make('p', `${a.owner} · Due ${a.due}`), make('span', a.status, 'status-pill')); treatment.append(action); }
  fragment.append(treatment);
  fragment.append(listSection('Assessment & change history', r.history.map(h => `${h.date} · ${h.author}: ${h.change}`)));
  $('risk-detail').replaceChildren(fragment); $('risk-dialog').showModal(); $('risk-dialog').scrollTop = 0;
}
$('close-dialog').addEventListener('click', () => $('risk-dialog').close());
$('risk-dialog').addEventListener('close', () => opener?.focus());
$('filters').addEventListener('submit', e => e.preventDefault());
$('filters').addEventListener('input', renderTable);
$('filters').addEventListener('reset', () => setTimeout(renderTable, 0));
document.querySelectorAll('[data-sort]').forEach(button => button.addEventListener('click', () => {
  direction = sort === button.dataset.sort && direction === 'asc' ? 'desc' : 'asc'; sort = button.dataset.sort; renderTable();
}));
document.querySelectorAll('[name="assessment"]').forEach(input => input.addEventListener('change', () => { assessment = input.value; renderMatrix(); }));
$('export').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([toCSV(risks)], { type: 'text/csv;charset=utf-8;' }));
  const link = make('a'); link.href = url; link.download = `augusta-risk-register-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
for (const [id, definitions] of [['likelihood-definitions', LIKELIHOOD], ['impact-definitions', IMPACT]]) $(id).replaceChildren(...definitions.map(d => make('li', d)));
async function load() {
  try {
    const response = await fetch(new URL('../data/risks.json', import.meta.url));
    if (!response.ok) throw new Error('Unable to fetch register');
    const data = await response.json();
    if (validateRisks(data).length) throw new Error('Invalid register data');
    risks = data;
    for (const category of [...new Set(risks.map(r => r.category))].sort()) { const opt = make('option', category); opt.value = category; $('category').append(opt); }
    for (const status of STATUSES) { const opt = make('option', status); opt.value = status; $('status').append(opt); }
    renderMetrics(); renderMatrix(); renderPriorities(); renderTable();
    $('load-state').hidden = true; $('export').disabled = false;
  } catch {
    $('load-state').setAttribute('role', 'alert');
    $('load-state').replaceChildren(make('strong', 'The risk register could not be loaded. '), make('span', 'Check your connection or ask the maintainer to validate data/risks.json. '));
    const retry = make('button', 'Retry', 'text-button'); retry.addEventListener('click', () => location.reload()); $('load-state').append(retry);
    $('result-count').textContent = 'Data unavailable';
  }
}
load();
