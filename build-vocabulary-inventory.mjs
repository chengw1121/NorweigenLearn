import fs from "node:fs";
import vm from "node:vm";

const read = file => fs.readFileSync(new URL(file, import.meta.url), "utf8");
const evaluateDeclaration = (source, start, end, expression, context = {}) => {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);
  if (from < 0 || to < 0) throw new Error(`Could not find inventory section: ${start}`);
  return vm.runInNewContext(`${source.slice(from, to)}\n${expression}`, context);
};

const app = read("./app.js");
const verbs = evaluateDeclaration(app, "const VERBS = [", "const VERB_USAGE_ZH", "VERBS");
const nouns = evaluateDeclaration(app, "const NOUNS = [", "const NOUN_GUIDES", "NOUNS");
const topics = evaluateDeclaration(app, "const VOCAB_TOPICS = [", "const NOUN_BY_ID", "VOCAB_TOPICS");
const v2Context = { window: {} };
vm.runInNewContext(read("./vocab-v2-library.js"), v2Context);
const v2 = v2Context.window.VOCAB_V2.additions;
const futureContext = { window: {} };
vm.runInNewContext(read("./topic-fremtid.js"), futureContext);
const future = futureContext.window.FREMTID_TOPIC;

const topicByVerb = new Map();
const topicByNoun = new Map();
for (const topic of topics) {
  for (const lemma of topic.verbs) if (!topicByVerb.has(lemma)) topicByVerb.set(lemma, topic);
  for (const lemma of topic.nouns) if (!topicByNoun.has(lemma)) topicByNoun.set(lemma, topic);
}
const toRow = (source, values) => ({
  source,
  lemma: values.lemma || "",
  display: values.display || values.lemma || "",
  unit: values.unit || "单词",
  pos: values.pos || "待核",
  level: values.level || "待分级",
  topic: values.topic || "待归类",
  zh: values.zh || "",
  forms: values.forms || "",
  example: values.example || "",
  translation: values.translation || "",
  levelBasis: values.levelBasis || "待复核",
  status: values.status || "已有内容·待审核",
  reviewFields: values.reviewFields || "",
  reviewSource: values.reviewSource || "",
  reviewSourceUrl: values.reviewSourceUrl || "",
  reviewedOn: values.reviewedOn || "",
});

const rows = [];
for (const verb of verbs) {
  const topic = topicByVerb.get(verb.v1);
  const level = topic?.level.includes("A1") && !topic?.level.includes("A2") ? "A1" : topic?.level.includes("A2") && !topic?.level.includes("A1") ? "A2" : "待分级";
  rows.push(toRow("app.js · 核心动词", { lemma: verb.v1, display: `å ${verb.v1}`, pos: "动词", level, topic: topic?.title, zh: verb.zh, forms: `${verb.v1} – ${verb.pres} – ${verb.past} – ${verb.pp}`, example: `Jeg ${verb.pres} ${verb.tail}.`, levelBasis: level === "待分级" ? "主题标为 A1–A2，需人工定级" : "按当前主题等级暂分，待复核", status: "已有词形与基础例句·待核" }));
}
for (const noun of nouns) {
  const topic = topicByNoun.get(noun.id);
  const level = topic?.level.includes("A1") && !topic?.level.includes("A2") ? "A1" : topic?.level.includes("A2") && !topic?.level.includes("A1") ? "A2" : "待分级";
  rows.push(toRow("app.js · 核心名词", { lemma: noun.lemma, display: noun.forms[0], pos: "名词", level, topic: topic?.title, zh: noun.zh, forms: noun.forms.join(" · "), example: noun.sentence, translation: noun.sentenceZh, levelBasis: level === "待分级" ? "主题标为 A1–A2，需人工定级" : "按当前主题等级暂分，待复核", status: noun.review ? `来源已登记：${noun.review.fields?.join("、") || "核验范围未注明"}` : "已有词形与例句·待核", reviewFields: noun.review?.fields?.join("、") || "", reviewSource: noun.review?.source || "", reviewSourceUrl: noun.review?.sourceUrl || "", reviewedOn: noun.review?.checkedOn || "" }));
}
for (const entry of v2) {
  const lemma = entry.id === "penge" ? "penge" : entry.word.replace(/^(en|ei\/en|ei|et|å)\s+/u, "");
  rows.push(toRow(entry.source || "vocab-v2-library.js · V2 词条", { lemma, display: entry.word, unit: /\s/u.test(lemma) ? "短语" : "单词", pos: entry.pos, level: entry.level, topic: entry.cluster, zh: entry.zh, forms: entry.forms.join(" · "), example: entry.contexts.map(context => context[0]).join(" / "), translation: entry.contexts.map(context => context[1]).join(" / "), levelBasis: entry.levelBasis || "项目内部等级标签，需抽查", status: entry.review ? `来源已登记：${entry.review.fields?.join("、") || "核验范围未注明"}` : "已有完整语境·待审定", reviewFields: entry.review?.fields?.join("、") || "", reviewSource: entry.review?.source || "", reviewSourceUrl: entry.review?.sourceUrl || "", reviewedOn: entry.review?.checkedOn || "" }));
}
for (const entry of future.vocabulary) {
  const { word: display, zh, pos, forms, sentence: example, translation } = entry;
  const lemma = display.replace(/^(en|ei|et|å)\s+/u, "");
  rows.push(toRow("Tema: fremtid · 课本专题", { lemma, display, unit: /\s/u.test(lemma) ? "短语" : "单词", pos, level: "待拆级", topic: "未来计划与目标", zh, forms, example, translation, levelBasis: "专题整体标 A2–B1，单条尚未分级", status: "专题词条·待拆级复核" }));
}

const canonical = value => value.trim().toLocaleLowerCase("nb-NO").replace(/^(en|ei|et|å)\s+/u, "").replace(/\s+/gu, " ");
const unique = new Map();
for (const row of rows) {
  const key = `${row.pos}|${canonical(row.lemma)}`;
  const old = unique.get(key);
  if (!old) { unique.set(key, row); continue; }
  const sources = new Set(`${old.source}; ${row.source}`.split("; "));
  const preferNew = Boolean(row.reviewedOn) && !old.reviewedOn || row.level !== "待拆级" && old.level === "待拆级" || Boolean(row.translation) && !old.translation || row.status.includes("完整语境") && !old.status.includes("完整语境");
  const preferred = preferNew ? row : old;
  const alternate = preferNew ? old : row;
  unique.set(key, { ...preferred, source: [...sources].join("; "), topic: [...new Set([preferred.topic, alternate.topic].filter(Boolean))].join(" / "), zh: preferred.zh || alternate.zh, forms: preferred.forms || alternate.forms, example: preferred.example || alternate.example, translation: preferred.translation || alternate.translation, reviewFields: preferred.reviewFields || alternate.reviewFields, reviewSource: preferred.reviewSource || alternate.reviewSource, reviewSourceUrl: preferred.reviewSourceUrl || alternate.reviewSourceUrl, reviewedOn: preferred.reviewedOn || alternate.reviewedOn, status: preferred.reviewedOn ? preferred.status : alternate.reviewedOn ? alternate.status : preferred.status });
}

const inventory = [...unique.values()].sort((a, b) => {
  const levelOrder = { A1: 0, A2: 1, "待分级": 2, "待拆级": 3 };
  return levelOrder[a.level] - levelOrder[b.level] || a.topic.localeCompare(b.topic, "zh-CN") || a.lemma.localeCompare(b.lemma, "nb-NO");
});
const columns = ["source", "lemma", "display", "unit", "pos", "level", "topic", "zh", "forms", "example", "translation", "levelBasis", "status", "reviewFields", "reviewSource", "reviewSourceUrl", "reviewedOn"];
const csvCell = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
fs.writeFileSync(new URL("./vocabulary-inventory.csv", import.meta.url), [columns.join(","), ...inventory.map(row => columns.map(column => csvCell(row[column])).join(","))].join("\n") + "\n", "utf8");

const headwords = level => new Set(inventory.filter(row => row.level === level && row.unit === "单词").map(row => canonical(row.lemma)));
const a1Headwords = headwords("A1");
const a2Headwords = headwords("A2");
const cumulativeHeadwords = new Set([...a1Headwords, ...a2Headwords]);
const a2Additions = new Set([...a2Headwords].filter(lemma => !a1Headwords.has(lemma)));
const phraseCount = level => inventory.filter(row => row.level === level && row.unit === "短语").length;
const a1 = a1Headwords.size;
const a2 = a2Additions.size;
const cumulative = cumulativeHeadwords.size;
const missingTranslations = inventory.filter(row => row.example && !row.translation).length;
const summary = `# A1/A2 词库盘点（内部工作清单）

此清单由应用数据及注明来源的补充词条生成，供逐条复核 CEFR 等级、词形、释义与语境；“A1 600 / A2 累计 1,400”是项目内容目标，不是官方固定词表。下表的等级数是当前暂标数，并非已经完成全部审校的确认覆盖量；词条只有在来源、等级、词义、词形、例句和译文均通过审核后才能计入已确认覆盖量。短语单独统计，不混入单词目标。

注意：此清单按唯一拼写统计词头；同一拼写的不同词性保留为不同教学行，但不重复计入 A1/A2 词汇量。另见 vocabulary-candidates-1400.csv：该表目标为 1,400 个不重复词头（A1 600 + A2 新增 800），由 node audit-vocabulary-coverage.mjs 检查唯一拼写、词性、暂定等级与应用覆盖。候选表填满释义、词形、例句和译文栏不等于这些内容已逐词人工验收，也不代表已确认 CEFR。

## 当前盘点

| 项目 | 当前暂标词头数 | 内部目标 | 还需新增（按当前暂定等级） |
|---|---:|---:|---:|
| A1 不同拼写词头 | ${a1} | 600 | ${Math.max(0, 600 - a1)} |
| A2 新增词头（排除与 A1 同拼写） | ${a2} | 800 | ${Math.max(0, 800 - a2)} |
| A1+A2 累计不同拼写 | ${cumulative} | 1,400 | ${Math.max(0, 1400 - cumulative)} |
| A1 短语（另计） | ${phraseCount("A1")} | 不计入单词目标 | — |
| A2 短语（另计） | ${phraseCount("A2")} | 不计入单词目标 | — |
| 等级待核/待拆专题词 | ${inventory.filter(row => ["待分级", "待拆级"].includes(row.level) && row.unit === "单词").length} | 不计入已分级总数 | — |
| 现有去重词性词头总数 | ${inventory.length} | — | — |
| 有挪威语例句但缺中文译文 | ${missingTranslations} | 需补齐 | — |

## 清单字段与核验状态

- vocabulary-inventory.csv 每行是一个去重后的“词性 + 词头”；同形异义或不同词性的条目会分开保留。
- 核验顺序：确认 Bokmål 词头与词性 → 核对 CEFR 内部等级及主题 → 核对义项/词形 → 检查例句自然度、译文和可判分练习。
- A1/A2 等级来自现有专题标注或主题映射，均需复核；Fremtid 专题整体为 A2–B1，尚未逐词拆级，因此暂不计入 A1/A2 数量。
- 应用内 A1/A2 暂标覆盖量按不同拼写统计；需逐词复核 CEFR、词性/词形、释义、例句自然度与中文译文后，才可记为“已审核”。候选表匹配审计与 Ordbank 词形审计分别记录在独立文件/命令中。
- 重新生成：node build-vocabulary-inventory.mjs。
`;
fs.writeFileSync(new URL("./VOCABULARY-INVENTORY.md", import.meta.url), summary, "utf8");
console.log(`Wrote ${inventory.length} unique rows. A1=${a1}; A2=${a2}; ungraded=${inventory.filter(row => row.level.startsWith("待")).length}; missing translations=${missingTranslations}.`);
