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
  for (let i = 0; i < COLLOCATIONS.length; i++) {
    const q = makeCollocationQuestion(COLLOCATIONS[i], "collocation-test-" + i);
    for (const issue of questionIntegrityIssues(q)) errors.push({ id:q.id, issue, answer:q.answer, collocation:q.collocation });
    if (!q.translation || q.translation !== q.collocation.exampleZh) errors.push({ id:q.id, issue:"collocation example is missing its sentence-level translation" });
    const feedback = detailedFeedback(q, "good", "test");
    if (!feedback.includes("本题固定搭配</strong><p><code>" + q.collocation.no + "</code> = " + q.collocation.zh + "</p>")) errors.push({ id:q.id, issue:"feedback phrase is not bound to collocation" });
    if (feedback.includes("vite det")) errors.push({ id:q.id, issue:"unrelated random verb phrase leaked into collocation feedback" });
  }
  for (const q of topicQuestionBank()) if (!q.translation) errors.push({ id:q.id, issue:"topic question has no Chinese sentence/meaning translation" });
  for (const article of window.READING_LIBRARY) {
    for (const [index, line] of article.sentences.entries()) if (!line[1]) errors.push({ id:article.id + ":" + index, issue:"reading sentence has no Chinese translation" });
    for (const word of article.words || []) if (word.example && !word.exampleZh) errors.push({ id:article.id + ":" + word.id, issue:"reading vocabulary example has no Chinese translation" });
  }
  for (const [cluster, entries] of Object.entries(window.VOCAB_V2.clusters)) for (const entry of entries) for (const [index, context] of (entry.contexts || []).entries()) if (Array.isArray(context) ? !context[1] : !(context.zh || context.translation)) errors.push({ id:entry.word, cluster, issue:"vocabulary context sentence has no Chinese translation", index });
  for (const verb of VERBS) for (const [index, example] of verbExamples(verb).entries()) if (!example.zh) errors.push({ id:verb.v1, issue:"verb example has no Chinese translation", index });
  for (const noun of NOUNS) if (noun.sentence && !noun.sentenceZh) errors.push({ id:noun.id, issue:"noun example has no Chinese translation" });
  const variedContexts = new Set(Array.from({ length: 12 }, () => sentenceContextFor(VERBS.find(item => item.v1 === "jobbe")).tail));
  if (variedContexts.size < 2) errors.push({ id:"jobbe", issue:"sentence context generator did not vary the familiar example" });
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
