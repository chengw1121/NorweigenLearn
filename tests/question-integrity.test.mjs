import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
const topicSource = await readFile(new URL("../topic-fremtid.js", import.meta.url), "utf8");
const readingSource = await readFile(new URL("../reading-library.js", import.meta.url), "utf8");
const vocabSource = await readFile(new URL("../vocab-v2-library.js", import.meta.url), "utf8");
const stopAt = source.indexOf('document.querySelector("#reset-day").addEventListener');
assert.notEqual(stopAt, -1, "app.js bootstrap boundary should exist");
const storage = new Map();
const context = vm.createContext({
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
  location: { hash: "", pathname: "/", search: "" },
  window: { FREMTID_TOPIC: { vocabulary: [] }, VOCAB_V2: { clusters: {} }, READING_LIBRARY: [] },
  URLSearchParams,
  console
});
vm.runInContext(topicSource, context, { filename: "topic-fremtid.js" });
vm.runInContext(readingSource, context, { filename: "reading-library.js" });
vm.runInContext(vocabSource, context, { filename: "vocab-v2-library.js" });
vm.runInContext(source.slice(0, stopAt), context, { filename: "app.js" });

const results = vm.runInContext(`(() => {
  const errors = [];
  state.session = { index: 0, total: 10 };
  const types = ["form", "modal", "past", "perfect", "infinitive", "correction"];
  for (const verb of VERBS) {
    for (const type of types) {
      for (let serial = 0; serial < 10; serial++) {
        const q = makeQuestion(type, verb, serial);
        for (const issue of questionIntegrityIssues(q)) errors.push({ id:q.id, issue, prompt:q.prompt, answer:q.answer, correctSentence:q.correctSentence });
      }
    }
    for (let serial = 0; serial < 12; serial++) {
      const q = makeV2Question(serial, verb);
      for (const issue of questionIntegrityIssues(q)) errors.push({ id:q.id, issue, prompt:q.prompt, answer:q.answer, correctSentence:q.correctSentence });
    }
  }
  const auditedTypes = ["form", "modal", "past", "perfect", "infinitive", "correction"];
  for (const verb of VERBS) for (let serial = 0; serial < 36; serial++) {
    for (const type of auditedTypes) {
      const q = makeQuestion(type, verb, serial, ["nettopp", "flere ganger", "allerede", "i dag"][serial % 4]);
      for (const issue of questionIntegrityIssues(q)) errors.push({ id:q.id, issue, prompt:q.prompt, translation:q.translation });
    }
    const v2 = makeV2Question(serial, verb);
    for (const issue of questionIntegrityIssues(v2)) errors.push({ id:v2.id, issue, prompt:v2.prompt, translation:v2.translation });
  }
  for (let i = 0; i < COLLOCATIONS.length; i++) {
    const q = makeCollocationQuestion(COLLOCATIONS[i], "collocation-test-" + i);
    for (const issue of questionIntegrityIssues(q)) errors.push({ id:q.id, issue, answer:q.answer, collocation:q.collocation });
    if (!q.translation || q.translation !== q.collocation.exampleZh) errors.push({ id:q.id, issue:"collocation example is missing its sentence-level translation" });
    const feedback = detailedFeedback(q, "good", "test");
    if (!feedback.includes("本题固定搭配</strong><p><code>" + q.collocation.no + "</code> = " + q.collocation.zh + "</p>")) errors.push({ id:q.id, issue:"feedback phrase is not bound to collocation" });
    if (feedback.includes("vite det")) errors.push({ id:q.id, issue:"unrelated random verb phrase leaked into collocation feedback" });
  }
  for (const q of topicQuestionBank()) if (!q.translation || /正在校对|待校对|暂不提供|暂无译文|待翻译/.test(q.translation) || !/[\u3400-\u9fff]/.test(q.translation)) errors.push({ id:q.id, issue:"topic question has no reviewed Chinese sentence/meaning translation", translation:q.translation });
  for (const article of window.READING_LIBRARY) {
    for (const [index, line] of article.sentences.entries()) if (!line[1]) errors.push({ id:article.id + ":" + index, issue:"reading sentence has no Chinese translation" });
    for (const word of article.words || []) if (word.example && !word.exampleZh) errors.push({ id:article.id + ":" + word.id, issue:"reading vocabulary example has no Chinese translation" });
  }
  for (const [cluster, entries] of Object.entries(window.VOCAB_V2.clusters)) for (const entry of entries) for (const [index, context] of (entry.contexts || []).entries()) if (Array.isArray(context) ? !context[1] : !(context.zh || context.translation)) errors.push({ id:entry.word, cluster, issue:"vocabulary context sentence has no Chinese translation", index });
  for (const entry of window.VOCAB_V2.additions || []) {
    for (const field of ["zh", "note"]) if (!entry[field] || /正在校对|待校对|暂不提供|暂无译文|待翻译/.test(entry[field])) errors.push({ id:entry.id, issue:"vocabulary " + field + " is missing or unreviewed" });
    for (const [index, context] of (entry.contexts || []).entries()) {
      if (!context[0] || !context[1] || !context[2] || /正在校对|待校对|暂不提供|暂无译文|待翻译/.test(context[1])) errors.push({ id:entry.id, issue:"vocabulary context sentence or Chinese explanation is missing/unreviewed", index });
      if (context[3] && !/^https:\\/\\/(?:ordbokene\\.no|(?:www\\.)?hf\\.ntnu\\.no|www\\.norwegianclass101\\.com|preply\\.com)\\//u.test(context[3])) errors.push({ id:entry.id, issue:"sourced vocabulary examples must link to an approved dictionary, university, or language-learning publisher", index, source:context[3] });
    }
  }
  for (const id of ["hallo", "gjerne", "dessuten", "unnskyld", "hvordan", "nei", "ingenting", "du"]) {
    const entry = (window.VOCAB_V2.additions || []).find(item => item.id === id);
    if (!entry || !(entry.contexts || []).some(context => context[3] && context[0] && context[1])) errors.push({ id, issue:"review-curated online example, Chinese translation, or source is missing" });
  }
  for (const verb of VERBS) for (const [index, example] of verbExamples(verb).entries()) if (!example.zh) errors.push({ id:verb.v1, issue:"verb example has no Chinese translation", index });
  for (const noun of NOUNS) if (noun.sentence && !noun.sentenceZh) errors.push({ id:noun.id, issue:"noun example has no Chinese translation" });
  for (const article of window.READING_LIBRARY) for (const [index, line] of article.sentences.entries()) if (!/[\u3400-\u9fff]/.test(line[1] || "")) errors.push({ id:article.id + ":" + index, issue:"reading Chinese translation is empty or not Chinese" });
  const variedContexts = new Set(Array.from({ length: 12 }, () => sentenceContextFor(VERBS.find(item => item.v1 === "jobbe")).tail));
  if (variedContexts.size < 2) errors.push({ id:"jobbe", issue:"sentence context generator did not vary the familiar example" });
  const pastKjøpe = makeQuestion("past", VERBS.find(item => item.v1 === "kjøpe"), 0);
  if (pastKjøpe.translation !== "昨天，我买了食物。") errors.push({ id:pastKjøpe.id, issue:"past-tense Chinese should express a completed purchase naturally", translation:pastKjøpe.translation });
  for (const q of [...VERBS.flatMap(verb => ["form","modal","past","perfect","infinitive","correction","v2"].map((type, i) => type === "v2" ? makeV2Question(i, verb) : makeQuestion(type, verb, i))), ...topicQuestionBank()]) if (!q.translation) errors.push({ id:q.id, issue:"generated question has no Chinese translation" });
  let sessions = 0;
  for (let run = 0; run < 100; run++) {
    const session = buildSession(30);
    sessions++;
    for (const q of session.questions) {
      for (const issue of questionIntegrityIssues(q)) errors.push({ id:q.id, issue, prompt:q.prompt, answer:q.answer, correctSentence:q.correctSentence });
    }
  }
  return JSON.stringify({ errors, verbs: VERBS.length, collocations: COLLOCATIONS.length, sessions });
})()`, context);
const report = JSON.parse(results);

assert.deepEqual(report.errors, [], `Question integrity failures:\n${JSON.stringify(report.errors.slice(0, 25), null, 2)}`);
console.log(`Question integrity passed: ${report.verbs} verbs × all patterns, ${report.collocations} collocations, ${report.sessions} generated 30-question sessions.`);

const medalReport = JSON.parse(vm.runInContext(`(() => {
  const normalized = normalizeEarnedMedals([
    { code: "norwegian-christmas-2026", title: "挪威圣诞夜", earnedAt: "2026-12-24T10:00:00Z" },
    { code: "international-christmas-2026", title: "圣诞学习之星", earnedAt: "2026-12-25T10:00:00Z" },
    { code: "points-100", title: "初学启程", earnedAt: "2026-09-25T10:00:00Z" },
  ]);
  const goals = [
    { code: "points-100", category: "积分", threshold: 100, earned: true },
    { code: "points-500", category: "积分", threshold: 500, earned: false },
    { code: "streak-3", category: "连续学习", threshold: 3, earned: false },
    { code: "streak-7", category: "连续学习", threshold: 7, earned: false },
    { code: "month-2026-09", category: "月度学习", threshold: 20, earned: false },
    { code: "year-2026-120", category: "年度学习", threshold: 120, earned: false },
    { code: "christmas-learning-2026", category: "特别纪念", threshold: 1, earned: false },
    { code: "zodiac-horse-2026", category: "春节生肖", threshold: 1, earned: false },
  ];
  const showroom = buildMedalShowroom(normalized, goals);
  const staleQuestion = { id:"past-kjøpe-1", category:"past", verbId:VERBS.find(v => v.v1 === "kjøpe").id, correctSentence:"I går kjøpte jeg mat.", translation:"这道题的中文译文正在校对，暂不提供不确定的直译。", answerTranslation:"这道题的中文译文正在校对，暂不提供不确定的直译。" };
  state.session = { index: 0, questions: [staleQuestion] };
  const repaired = currentQuestion();
  const staleFeedback = detailedFeedback(repaired, "bad", "需要修改", "Laget");
  state.session = { index: 0, questions: [{ id:"unrepairable-legacy", prompt:"旧题", translation:"" }] };
  const replacedLegacy = currentQuestion();
  accountUser = { nickname: "Tester", points: 600 };
  accountMedals = normalized;
  accountMedalGoals = goals;
  accountStudyHabits = { currentStreak: 3, monthDays: 2, yearDays: 2 };
  accountTab = "medals";
  const html = renderAccount();
  return JSON.stringify({ normalizedCount: normalized.length, normalizedChristmasCode: normalized.find(m => m.category === "特别纪念")?.code, earnedFirst: showroom.earned[0]?.code, locked: showroom.locked.map(m => m.code), exposesHidden: showroom.locked.some(m => /christmas|zodiac/.test(m.code)), hasSingleShowroom: html.includes("奖牌陈列室") && !html.includes("data-medal-category"), earnedSectionBeforeGoals: html.indexOf("已点亮") < html.indexOf("下一步可解锁"), hiddenSecretsAbsent: !html.includes("zodiac-horse") && !html.includes("christmas-learning-2026"), staleQuestionRepaired: repaired.translation === "昨天，我买了食物。" && repaired.answerTranslation === repaired.translation && staleFeedback.includes("昨天，我买了食物。") && !staleFeedback.includes("正在校对"), unrepairableQuestionReplaced: replacedLegacy.id !== "unrepairable-legacy" && /[\u3400-\u9fff]/.test(replacedLegacy.translation) });
})()`, context));
assert.equal(medalReport.normalizedCount, 2, "legacy duplicate holiday medals should collapse into a single display medal");
assert.equal(medalReport.normalizedChristmasCode, "christmas-learning-2026", "legacy Christmas medals should use the canonical annual display identity");
assert.equal(medalReport.earnedFirst, "christmas-learning-2026", "earned medals should be present in the lit section after canonical grouping");
assert.deepEqual(medalReport.locked, ["points-500", "streak-3", "month-2026-09", "year-2026-120"], "showroom should only show each category's next milestone");
assert.equal(medalReport.exposesHidden, false, "unearned holiday and zodiac medals should stay hidden");
assert.equal(medalReport.hasSingleShowroom, true, "medals should render in one collection without category tabs");
assert.equal(medalReport.earnedSectionBeforeGoals, true, "earned medals should render before locked goals");
assert.equal(medalReport.hiddenSecretsAbsent, true, "the showroom should not expose names or codes of secret medals");
assert.equal(medalReport.staleQuestionRepaired, true, "saved legacy questions should replace proofreading placeholders with a contextual Chinese translation");
assert.equal(medalReport.unrepairableQuestionReplaced, true, "legacy questions without enough data to restore a Chinese cue should not be served to learners");
console.log("Medal showroom deduplication, milestone selection, and hidden medal checks passed.");

const reviewReport = JSON.parse(vm.runInContext(`(() => {
  state.mistakes = [];
  state.session = { answers: {} };
  const verb = VERBS.find(item => item.v1 === "kjøpe");
  const question = makeQuestion("perfect", verb, 1, "nettopp");
  const item = queueMistake(question, "kjøper", question.answer, question.explanation);
  const firstDue = item.dueAt;
  item.dueAt = 0;
  const session = buildSession(10);
  const automaticReviewIncluded = session.questions.some(q => q.scheduledReviewId === item.id);
  scheduleMistakeReview(item, true, question.answer);
  const nextDueIsSpaced = item.dueAt > Date.now() + 2 * 86400000;
  scheduleMistakeReview(item, true, question.answer);
  scheduleMistakeReview(item, true, question.answer);
  const masteredAfterThreeReviews = Boolean(item.masteredAt) && activeMistakes().length === 0;
  state.mistakes = [];
  const shown = queueMistake(question, "kjøper", question.answer, question.explanation);
  state.mistakePractice = { id: shown.id, index: 0, result: null };
  const mistakeHtml = renderMistakes();
  const choiceRecallCue = mistakeRecallCue({ answer: "spiser", correctSentence: "Hun spiser mat." }, { prompt: "Velg riktig alternativ." });
  state.learned = { ...(state.learned || {}), "future:0": 1 };
  const vocabHtml = renderLearn();
  const jobbeVerb = VERBS.find(item => item.v1 === "jobbe");
  const kjøpeVerb = VERBS.find(item => item.v1 === "kjøpe");
  const structureHtml = detailedFeedback(makeQuestion("modal", jobbeVerb, 0), "good", "test");
  const perfectStructure = sentenceStructure("Hun har nettopp kjøpt mat.", { verbId: kjøpeVerb.id, category: "perfect" });
  state.review = { "være-0": { streak: 0 } };
  state.vocabSession = { ids: ["være-0"], index: 0, topicId: "basics", lastResult: { meaningOk: true, morphologyOk: true, formsOk: true }, usageQuestion: { answer: "er" }, usageOk: null };
  render = () => {};
  finishVocabCard();
  return JSON.stringify({ automaticReviewIncluded, nextDueIsSpaced, masteredAfterThreeReviews, firstDue, showsChineseMeaning: mistakeHtml.includes("中文句意："), masksAnswerForChoiceRecall: choiceRecallCue.isCloze && choiceRecallCue.text === "Hun ______ mat.", sentenceBreakdownShown: structureHtml.includes("句子结构拆解") && structureHtml.includes("主语") && structureHtml.includes("限定情态动词"), perfectPhraseAnalyzed: perfectStructure.some(row => row.role === "完成分词（谓语的一部分）") && perfectStructure.some(row => row.role === "时间/频率状语"), progressCountsPracticedWords: vocabHtml.includes("已练习词条 · 完成卡片后增长"), unaskedUsageDoesNotBlockMastery: state.review["være-0"].streak === 1 });
})()`, context));
assert.equal(reviewReport.automaticReviewIncluded, true, "due mistakes should be inserted into daily practice");
assert.equal(reviewReport.nextDueIsSpaced, true, "a successful recall should schedule the next wider interval");
assert.equal(reviewReport.masteredAfterThreeReviews, true, "three spaced correct recalls should clear the active mistake");
assert.equal(reviewReport.showsChineseMeaning, true, "mistake recall should show saved Chinese context");
assert.equal(reviewReport.masksAnswerForChoiceRecall, true, "choice mistakes should become fill-in-the-blank recalls");
assert.equal(reviewReport.sentenceBreakdownShown, true, "feedback should explain identifiable sentence parts");
assert.equal(reviewReport.perfectPhraseAnalyzed, true, "perfect tense and adverb roles should be recognized in a sentence breakdown");
assert.equal(reviewReport.progressCountsPracticedWords, true, "vocabulary progress should report practiced coverage");
assert.equal(reviewReport.unaskedUsageDoesNotBlockMastery, true, "an unpresented usage prompt should not block vocabulary mastery progress");
console.log("Spaced review, contextual mistake recall, and vocabulary progress checks passed.");
