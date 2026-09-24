import fs from "node:fs";

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
function cell(value) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function normalize(value) { return String(value || "").trim().toLocaleLowerCase("nb-NO").replace(/^(en|ei\/en|ei|et|å)\s+/u, "").replace(/\s+/gu, " "); }

const inventoryRows = parseCsv(fs.readFileSync(new URL("./vocabulary-inventory.csv", import.meta.url), "utf8"));
const columns = inventoryRows.shift();
const inventory = inventoryRows.filter(row => row.length >= columns.length).map(values => Object.fromEntries(columns.map((name, index) => [name, values[index] || ""])));
const response = await fetch("https://ord.uib.no/bm/fil/boys.csv");
if (!response.ok) throw new Error(`Ordbank returned HTTP ${response.status}`);
const fullForms = (await response.text()).split(/\r?\n/u).map(line => line.split("|")).filter(row => row[0]).reduce((map, row) => {
  const key = normalize(row[0]);
  if (!map.has(key)) map.set(key, new Set());
  row.forEach(form => { if (form.trim()) map.get(key).add(normalize(form)); });
  return map;
}, new Map());

const audit = inventory.map(item => {
  const key = normalize(item.lemma);
  const forms = fullForms.get(key);
  const rawExpected = item.forms.split(/\s*[·–/]\s*/u).map(normalize).filter(value => value && value !== "—");
  const comparisonForms = rawExpected.filter(value => /^(mer|mest)\s/u.test(value));
  const expected = rawExpected.filter(value => !/^(mer|mest)\s/u.test(value)).filter(value => item.pos === "数词" || !/^(ei|en|et|å)$/u.test(value)).map(value => value.replace(/^har\s+/u, "").replace(/\s*\([^)]*\)\s*$/u, "").trim());
  const matched = forms ? expected.filter(form => forms.has(form)) : [];
  const missing = expected.filter(form => !forms?.has(form));
  const isPhrase = item.unit === "短语" || /短语/u.test(item.pos);
  const status = isPhrase ? "词组结构需人工核查" : !forms ? "需核实是否为词典词头" : missing.length ? "有词形需人工核对" : comparisonForms.length ? "基本词形匹配；比较级形式另核" : "词头与列出词形匹配";
  return { ...item, officialLemmaFound: Boolean(forms), expectedForms: rawExpected.join(" · "), matchedForms: matched.join(" · "), unmatchedForms: missing.join(" · "), officialForms: forms ? [...forms].slice(0, 16).join(" · ") : "", auditStatus: status };
});
const outputColumns = [...columns, "officialLemmaFound", "expectedForms", "matchedForms", "unmatchedForms", "officialForms", "auditStatus"];
const output = [outputColumns.join(","), ...audit.map(row => outputColumns.map(name => cell(row[name])).join(","))].join("\n") + "\n";
fs.writeFileSync(new URL("./vocabulary-inflection-audit.csv", import.meta.url), output, "utf8");
const counts = audit.reduce((acc, row) => { acc[row.auditStatus] = (acc[row.auditStatus] || 0) + 1; return acc; }, {});
console.log(`Audited ${audit.length} rows against UiB/Språkrådet Ordbank full forms: ${JSON.stringify(counts)}`);
