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

const csvCell = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
const normalize = value => String(value || "").trim().toLocaleLowerCase("nb-NO").replace(/^(en|ei\/en|ei|et|å)\s+/u, "").replace(/\s+/gu, " ");
const readCsv = name => {
  const rows = parseCsv(fs.readFileSync(new URL(`./${name}`, import.meta.url), "utf8"));
  const headers = rows.shift();
  return rows.filter(row => row.length >= headers.length).map(row => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])));
};
const candidates = readCsv("vocabulary-candidates-1400.csv");
const inventory = readCsv("vocabulary-inventory.csv");
const inflectionAudit = readCsv("vocabulary-inflection-audit.csv");
const key = (lemma, pos) => `${normalize(lemma)}|${pos}`;
const inventoryByKey = new Map(inventory.map(row => [key(row.lemma, row.pos), row]));
const reviewedInventoryByLemma = new Map(inventory.filter(row => row.reviewedOn).map(row => [normalize(row.lemma), row]));
const formsByKey = new Map(inflectionAudit.map(row => [key(row.lemma, row.pos), row]));
// This explicit list is a human read-through of every Norwegian sentence and
// its Chinese translation for these listed high-frequency entries. It does not
// certify pronunciation, CEFR level, or forms beyond the separate form audit.
const exampleTranslationReviewed = new Set([
  "avis", "bensinstasjon", "bil", "bli", "bo", "brus", "by", "dag", "dame", "ekspeditør",
  "familie", "fly", "gjøre", "ha", "hete", "hilse", "jente", "jobbe", "kart", "kilometer",
  "komme", "koste", "krone", "antropologi", "arkitektur", "båt", "fra", "god", "hyggelig", "norsk",
  "på", "være", "adresse", "betale", "billett", "bruke", "buss", "bussjåfør", "bytte", "dra", "vondt", "penge", "all", "tohundrelapp",
  "du", "han", "hun", "denne", "bra", "bedre", "bestemor", "mobilnummer", "veldig", "plaster",
  "ikke", "med", "de", "dere", "hva", "hvor", "jeg", "men", "og", "fordi", "når",
]);
const records = candidates.map(candidate => {
  const app = inventoryByKey.get(key(candidate.lemma, candidate.pos));
  const reviewedApp = reviewedInventoryByLemma.get(normalize(candidate.lemma));
  const forms = formsByKey.get(key(candidate.lemma, candidate.pos));
  const complete = Boolean(candidate.zh && candidate.sourceInflections && candidate.exampleNb && candidate.exampleZh);
  const exampleCount = candidate.exampleNb.split(/\s*\/\s*/u).filter(Boolean).length;
  return {
    candidateLevel: candidate.candidateLevel,
    lemma: candidate.lemma,
    pos: candidate.pos,
    topic: app?.topic || "",
    sourceCourses: candidate.sourceCourses,
    chineseMeaning: candidate.zh,
    listedForms: candidate.sourceInflections,
    exampleNb: candidate.exampleNb,
    exampleZh: candidate.exampleZh,
    exampleCount,
    appLevel: app?.level || "",
    appIntegrated: Boolean(app),
    fieldsPresent: complete,
    manualReviewStatus: reviewedApp?.reviewedOn ? `词典核验：${reviewedApp.reviewFields}` : "尚未人工逐词核验",
    dictionarySource: reviewedApp?.reviewSource || "",
    dictionarySourceUrl: reviewedApp?.reviewSourceUrl || "",
    manuallyCheckedOn: reviewedApp?.reviewedOn || "",
    examplesManuallyCheckedOn: exampleTranslationReviewed.has(normalize(candidate.lemma)) ? "2026-09-24" : "",
    officialLemmaFound: forms?.officialLemmaFound || "未核",
    formAuditStatus: forms?.auditStatus || "无对应词形审计行",
    cefrReview: "课程候选等级；尚未逐词人工确认",
    meaningAndExampleReview: exampleTranslationReviewed.has(normalize(candidate.lemma)) || (reviewedApp?.reviewedOn && reviewedApp.reviewFields.includes("例句")) ? "例句/译文已人工审校" : "例句/译文尚未人工逐词审校",
  };
});
const columns = Object.keys(records[0]);
fs.writeFileSync(new URL("./vocabulary-1400-review.csv", import.meta.url), [columns.join(","), ...records.map(row => columns.map(column => csvCell(row[column])).join(","))].join("\n") + "\n", "utf8");

const counts = (field, predicate = () => true) => records.filter(predicate).reduce((map, row) => map.set(row[field], (map.get(row[field]) || 0) + 1), new Map());
const levels = [...counts("candidateLevel")].map(([name, count]) => `${name}: ${count}`).join("；");
const appMatches = records.filter(row => row.appIntegrated && row.appLevel === row.candidateLevel).length;
const fullFields = records.filter(row => row.fieldsPresent).length;
const manuallyReviewed = records.filter(row => row.manuallyCheckedOn).length;
const examplesReviewed = records.filter(row => row.meaningAndExampleReview === "例句/译文已人工审校").length;
const dictionary = counts("officialLemmaFound");
const forms = counts("formAuditStatus");
const report = [
  "# A1/A2 1,400 词逐词审核进度",
  "",
  `- 候选清单：${records.length} 个唯一词头（${levels}）。`,
  `- 与应用词头、词性和暂定等级匹配：${appMatches}/${records.length}。`,
  `- 中文义项、词形、至少一条挪威语例句及译文均有填写：${fullFields}/${records.length}；字段齐全不等同于人工校对通过。`,
  `- 已逐词登记并核验词典或课程词表所支持的词头、词性、核心义项/课程信息：${manuallyReviewed}/${records.length}；逐条范围与来源见 CSV。`,
  `- 例句及中文译文已人工逐条审校：${examplesReviewed}/${records.length}；其余条目的例句/译文仅有内容，仍待人工审校。`,
  `- Ordbank 词头自动查询结果：${[...dictionary].map(([name, count]) => `${name} ${count}`).join("；")}。`,
  "- 词典/课程来源核验只覆盖 CSV 中注明的字段；CEFR 等级及未标为人工审校的词义取舍、词形、例句自然度和中文翻译仍需逐项人工签核。在线词形自动匹配也不等于全部词形均已人工确认。",
  "- 每个词的明细、课程来源、应用主题和词形审计状态见 `vocabulary-1400-review.csv`。",
  "",
  "## Ordbank 词形审计状态",
  "",
  ...[...forms].map(([name, count]) => `- ${name}：${count}`),
  "",
  "重新生成：`node build-vocabulary-1400-review.mjs`。数据取自候选清单、应用词库盘点及 `vocabulary-inflection-audit.csv`。",
].join("\n");
fs.writeFileSync(new URL("./VOCABULARY-1400-REVIEW.md", import.meta.url), `${report}\n`, "utf8");
console.log(`Reviewed inventory report: ${records.length} candidate rows; app matches ${appMatches}; complete fields ${fullFields}; output vocabulary-1400-review.csv.`);
