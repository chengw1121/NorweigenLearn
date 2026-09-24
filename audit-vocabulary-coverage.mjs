import fs from "node:fs";
import vm from "node:vm";

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(cell); cell = ""; }
    else if (char === "\n") { row.push(cell.replace(/\r$/u, "")); rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  if (cell || row.length) { row.push(cell.replace(/\r$/u, "")); rows.push(row); }
  return rows;
}

const normalize = value => String(value || "").trim().toLocaleLowerCase("nb-NO").replace(/^(en|ei\/en|ei|et|å)\s+/u, "").replace(/\s+/gu, " ");
const values = parseCsv(fs.readFileSync(new URL("./vocabulary-candidates-1400.csv", import.meta.url), "utf8"));
const headers = values.shift();
const candidates = values.filter(row => row.length >= headers.length).map(row => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])));
const inventoryValues = parseCsv(fs.readFileSync(new URL("./vocabulary-inventory.csv", import.meta.url), "utf8"));
const inventoryHeaders = inventoryValues.shift();
const inventory = inventoryValues.filter(row => row.length >= inventoryHeaders.length).map(row => Object.fromEntries(inventoryHeaders.map((header, index) => [header, row[index] || ""])));
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL("./vocab-v2-library.js", import.meta.url), "utf8"), context);
const entries = context.window.VOCAB_V2.additions;
const keys = new Set(inventory.filter(entry => entry.unit === "单词").map(entry => `${normalize(entry.lemma)}|${entry.pos}|${entry.level}`));
const hits = candidates.filter(candidate => keys.has(`${normalize(candidate.lemma)}|${candidate.pos}|${candidate.candidateLevel}`));
const count = level => hits.filter(hit => hit.candidateLevel === level).length;
const candidateLemmaCounts = new Map();
for (const candidate of candidates) candidateLemmaCounts.set(normalize(candidate.lemma), (candidateLemmaCounts.get(normalize(candidate.lemma)) || 0) + 1);
const duplicateLemmas = [...candidateLemmaCounts].filter(([, occurrences]) => occurrences > 1);
const duplicates = entries.length - new Set(entries.map(entry => entry.id)).size;

console.log(`Cards: ${entries.length}; duplicate card IDs: ${duplicates}`);
console.log(`Candidate unique headwords: ${candidateLemmaCounts.size}/${candidates.length}; duplicate spellings: ${duplicateLemmas.length}`);
console.log(`Strict candidate coverage (lemma + POS + project level): ${hits.length}/${candidates.length}`);
console.log(`A1: ${count("A1")}/600; A2 additions: ${count("A2")}/800; remaining: ${candidates.length - hits.length}`);
const hitKeys = new Set(hits.map(candidate => `${normalize(candidate.lemma)}|${candidate.pos}|${candidate.candidateLevel}`));
const unmatchedOffset = Math.max(0, Number(process.argv[2]) || 0);
console.log(`Unmatched verified A1 candidates (${unmatchedOffset}–${unmatchedOffset + 79}):`);
for (const candidate of candidates.filter(row => row.candidateLevel === "A1" && row.officialHeadwordFound === "True" && !hitKeys.has(`${normalize(row.lemma)}|${row.pos}|${row.candidateLevel}`)).slice(unmatchedOffset, unmatchedOffset + 80)) {
  console.log(`- ${candidate.lemma} (${candidate.pos})`);
}
console.log(`Unmatched verified A2 candidates (${unmatchedOffset}–${unmatchedOffset + 79}):`);
for (const candidate of candidates.filter(row => row.candidateLevel === "A2" && row.officialHeadwordFound === "True" && !hitKeys.has(`${normalize(row.lemma)}|${row.pos}|${row.candidateLevel}`)).slice(unmatchedOffset, unmatchedOffset + 80)) {
  console.log(`- ${candidate.lemma} (${candidate.pos})`);
}
if (duplicates || duplicateLemmas.length || candidateLemmaCounts.size !== 1400) process.exitCode = 1;
