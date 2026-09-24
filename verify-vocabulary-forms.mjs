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

// Transparent compounds absent as standalone rows in Ordbank can still have
// their inflection checked against the documented head component. These are
// explicit, reviewable decompositions; they do not imply dictionary lemma
// status or independently verify meaning/CEFR.
const compoundBases = new Map(Object.entries({
  flyttebil:["flytte","bil"], fødselsdato:["fødsels","dato"], brødhylle:["brød","hylle"],
  fotoautomat:["foto","automat"], fruktdisk:["frukt","disk"], helseforsikring:["helse","forsikring"],
  interiørbutikk:["interiør","butikk"], fiskemarked:["fiske","marked"], mobilnummer:["mobil","nummer"],
  notatbok:["notat","bok"], arkitektstudent:["arkitekt","student"], dagsbillett:["dags","billett"],
  femhundrelapp:["femhundre","lapp"], helårskort:["helårs","kort"], lekebutikk:["leke","butikk"],
  vinterjakke:["vinter","jakke"], begynnerkurs:["begynner","kurs"], byggfirma:["bygg","firma"],
  "it-firma":["it-","firma"], klatregruppe:["klatre","gruppe"], engelskprøve:["engelsk","prøve"],
  favorittfag:["favoritt","fag"], halstablett:["hals","tablett"], klasseliste:["klasse","liste"],
  kunstutstilling:["kunst","utstilling"], tursekk:["tur","sekk"], colaboks:["cola","boks"],
  planleggingsperiode:["planleggings","periode"], prosjektdokument:["prosjekt","dokument"],
  julekule:["jule","kule"], juletradisjon:["jule","tradisjon"], pyjamasjakke:["pyjamas","jakke"],
  trankapsel:["tran","kapsel"], juleblomst:["jule","blomst"], vinterbilde:["vinter","bilde"],
  internettilgang:["internet","tilgang"], legevaktsentral:["legevakt","sentral"],
  mastergradsstudent:["mastergrads","student"], reisebekreftelse:["reise","bekreftelse"],
  salsakurs:["salsa","kurs"], semesterkort:["semester","kort"]
}));
const relatedBases = new Map(Object.entries({
  kjempeflink:["kjempe","flink"], kjempesulten:["kjempe","sulten"], hyttetradisjon:["hytte","tradisjon"],
  sikkert:["","sikker"], skadet:["","skade"], engasjert:["","engasjere"], samlet:["","samle"],
  fokusert:["","fokusere"], motivert:["","motivere"]
}));
const compositionallyVerifiedNumerals = new Set(["trettiåtte"]);

const audit = inventory.map(item => {
  const key = normalize(item.lemma);
  const forms = fullForms.get(key);
  const rawExpected = item.forms.split(/\s*[·–/]\s*/u).map(normalize).filter(value => value && value !== "—");
  const comparisonForms = rawExpected.filter(value => /^(mer|mest)\s/u.test(value));
  const expected = rawExpected.filter(value => !/^(mer|mest)\s/u.test(value)).filter(value => item.pos === "数词" || !/^(ei|en|et|å)$/u.test(value)).map(value => value.replace(/^har\s+/u, "").replace(/\s*\([^)]*\)\s*$/u, "").trim());
  const crossLemmaForms = item.lemma === "denne"
    ? new Set(["dette", "disse"])
    : item.lemma === "mindre"
      ? new Set(["liten", "lite", "små", "minst"])
      : new Set();
  const compound = compoundBases.get(key) || relatedBases.get(key);
  const componentForms = compound ? fullForms.get(compound[1]) : undefined;
  const numeralVerified = compositionallyVerifiedNumerals.has(key);
  const compoundMatched = compound && componentForms
    ? expected.filter(form => form.startsWith(compound[0]) && componentForms.has(form.slice(compound[0].length)))
    : [];
  const matched = forms ? expected.filter(form => forms.has(form) || crossLemmaForms.has(form)) : numeralVerified ? expected : compoundMatched;
  const missing = expected.filter(form => !forms?.has(form) && !crossLemmaForms.has(form) && !compoundMatched.includes(form) && !numeralVerified);
  const isPhrase = item.unit === "短语" || /短语/u.test(item.pos);
  const componentFormsVerified = Boolean(compound && componentForms && expected.length && missing.length === 0);
  const status = isPhrase ? "词组结构需人工核查" : !forms && !componentForms && !numeralVerified ? "需核实是否为词典词头" : missing.length ? "有词形需人工核对" : componentFormsVerified ? (compoundBases.has(key) ? "透明复合词词形匹配中心词" : "相关词头词形匹配") : numeralVerified ? "数词拼写按Språkrådet规则核对" : crossLemmaForms.size ? "关联范式词形已人工核对" : comparisonForms.length ? "基本词形匹配；比较级形式另核" : "词头与列出词形匹配";
  const morphologyBasis = forms ? "Ordbank 直接词头" : componentForms ? `相关词头：${compound[1]}` : crossLemmaForms.size ? "关联范式人工核对" : numeralVerified ? "Språkrådet：数词读法顺序" : "未确认";
  const morphologySourceUrl = forms ? "https://ord.uib.no/bm/fil/boys.csv" : componentForms ? `https://ordbokene.no/bm/${encodeURIComponent(compound[1])}` : numeralVerified ? "https://sprakradet.no/godt-og-korrekt-sprak/rettskriving-og-grammatikk/tall-tid-dato/" : "";
  return { ...item, officialLemmaFound: Boolean(forms), expectedForms: rawExpected.join(" · "), matchedForms: matched.join(" · "), unmatchedForms: missing.join(" · "), officialForms: forms ? [...forms].slice(0, 16).join(" · ") : componentForms ? [...componentForms].slice(0, 16).join(" · ") : "", morphologyBasis, morphologySourceUrl, auditStatus: status };
});
const outputColumns = [...columns, "officialLemmaFound", "expectedForms", "matchedForms", "unmatchedForms", "officialForms", "morphologyBasis", "morphologySourceUrl", "auditStatus"];
const output = [outputColumns.join(","), ...audit.map(row => outputColumns.map(name => cell(row[name])).join(","))].join("\n") + "\n";
fs.writeFileSync(new URL("./vocabulary-inflection-audit.csv", import.meta.url), output, "utf8");
const counts = audit.reduce((acc, row) => { acc[row.auditStatus] = (acc[row.auditStatus] || 0) + 1; return acc; }, {});
console.log(`Audited ${audit.length} rows against UiB/Språkrådet Ordbank full forms: ${JSON.stringify(counts)}`);
