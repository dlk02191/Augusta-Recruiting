import { readFile } from 'node:fs/promises';
import { validateRisks } from '../assets/risk-model.js';
const risks = JSON.parse(await readFile(new URL('../data/risks.json', import.meta.url), 'utf8'));
const errors = validateRisks(risks);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Validated ${risks.length} risk records.`);
