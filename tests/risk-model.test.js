import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { score, severity, validDate, validateRisks, summarize, selectRisks, csvCell, toCSV } from '../assets/risk-model.js';
const risks = JSON.parse(readFileSync(new URL('../data/risks.json', import.meta.url)));
const copy = () => structuredClone(risks);
test('JSON records pass the complete data contract', () => assert.deepEqual(validateRisks(risks), []));
test('five expected initial risks with unique IDs', () => assert.deepEqual(risks.map(r => r.id), ['R-001', 'R-002', 'R-003', 'R-004', 'R-005']));
test('inherent and proposed residual scores match the initial assessment', () => {
  assert.deepEqual(risks.map(r => score(r.inherent)), [20, 16, 16, 12, 12]);
  assert.deepEqual(risks.map(r => score(r.residual)), [8, 6, 6, 6, 8]);
});
test('all 25 scoring combinations and severity boundaries', () => {
  for (let l = 1; l <= 5; l++) for (let i = 1; i <= 5; i++) assert.equal(score({likelihood:l, impact:i}), l*i);
  for (let n=1;n<=25;n++) assert.equal(severity(n), n<=4?'Low':n<=9?'Moderate':n<=16?'High':'Critical');
  for (const bad of [0,26,NaN,1.5,'5']) assert.throws(() => severity(bad), RangeError);
});
test('reject invalid register shapes and null records', () => { for (const bad of [null,{},[],[null]]) assert.ok(validateRisks(bad).length); });
test('required text and arrays cannot be empty or missing', () => {
  for (const field of ['title','category','description','owner','residualBasis','causes','consequences','controls','actions','history']) {
    const data=copy(); delete data[0][field]; assert.ok(validateRisks(data).length,field);
  }
});
test('duplicate and malformed IDs rejected', () => { for (const id of ['R-002','oops']) {const data=copy();data[0].id=id;assert.ok(validateRisks(data).length);} });
test('score inputs must be integers within 1–5; duplicate scores forbidden', () => {
  for (const key of ['inherent','residual']) for (const axis of ['likelihood','impact']) for (const bad of [0,6,2.5,'3',null]) {
    const data=copy();data[0][key][axis]=bad;assert.ok(validateRisks(data).length);
  }
  const data=copy();data[0].inherent.score=20;assert.ok(validateRisks(data).length);
});
test('calendar dates and date order validated', () => {
  assert.ok(validDate('2024-02-29'));
  for (const date of ['2026-02-29','2026-04-31','2026-13-01','yesterday','2026-1-01',null]) assert.equal(validDate(date),false);
  for (const key of ['identified','assessed','nextReview']) {const data=copy();data[0][key]='2026-02-30';assert.ok(validateRisks(data).length);}
  const data=copy();data[0].nextReview='2025-01-01';assert.ok(validateRisks(data).length);
});
test('treatment owners, dates, statuses and history are validated', () => {
  for (const [key,value] of [['owner',''],['action',''],['due','2026-02-30'],['status','Done']]) {const data=copy();data[0].actions[0][key]=value;assert.ok(validateRisks(data).length);}
  for (const key of ['date','author','change']) {const data=copy();delete data[0].history[0][key];assert.ok(validateRisks(data).length);}
  for (const [key,value] of [['status','Unknown'],['strategy','ignore'],['residualType','verified']]) {const data=copy();data[0][key]=value;assert.ok(validateRisks(data).length);}
});
test('metrics are computed, date-sensitive, exclude closed reviews', () => {
  assert.deepEqual(summarize(risks,'2026-10-25'),{total:5,critical:1,high:4,treatment:3,due:0});
  assert.equal(summarize(risks,'2026-11-20').due,3);
  const data=copy();data[0].status='Closed';assert.equal(summarize(data,'2027-01-01').due,4);
});
test('search, combined filters and ascending/descending sorts', () => {
  assert.equal(selectRisks(risks,{query:'candidate data'}).length,1);
  assert.equal(selectRisks(risks,{category:'Fraud',rating:'High',status:'In treatment'})[0].id,'R-003');
  assert.equal(selectRisks(risks,{query:'no such risk'}).length,0);
  assert.deepEqual(selectRisks(risks,{sort:'inherent',direction:'asc'}).map(r=>score(r.inherent)),[12,12,16,16,20]);
  assert.equal(selectRisks(risks,{sort:'id',direction:'desc'})[0].id,'R-005');
});
test('CSV escapes commas, double quotes, multiline values and formula injection', () => {
  assert.equal(csvCell('hello,"world"\nnext'),'"hello,""world""\nnext"');
  for (const value of ['=1+1','+SUM(A1)','-2+4','@SUM(A1)','  =1','\t=1','\r=1','\n@x','\u0001=1']) assert.ok(csvCell(value).startsWith('"\''),JSON.stringify(value));
  assert.equal(csvCell('Candidate Data Exposure'),'"Candidate Data Exposure"');
});
test('full CSV includes all records, calculated targets, treatment and history', () => {
  const csv=toCSV(risks);assert.ok(csv.startsWith('\uFEFF"ID"'));assert.equal(csv.split('\r\n').length,7);
  for (const r of risks) {assert.ok(csv.includes(r.id));assert.ok(csv.includes(r.title));assert.ok(csv.includes(r.actions[0].action));}
  assert.ok(csv.includes('Proposed residual score'));assert.ok(csv.includes('"20","Critical"'));
});
