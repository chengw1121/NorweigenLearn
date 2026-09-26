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
    if (!feedback.includes("本题固定搭配</strong><p><code>" + q.collocation.no + "</code> = " + q.collocation.zh + "</p><p>" + q.collocation.note + "</p>")) errors.push({ id:q.id, issue:"phrase-specific guidance must appear directly below the exact collocation, not as a generic explanation later" });
    if (!feedback.includes(q.collocation.note) || !feedback.includes(q.collocation.exampleZh) || !feedback.includes(q.collocation.example)) errors.push({ id:q.id, issue:"phrase-specific explanation, complete Norwegian example, and its Chinese translation must all appear together in feedback" });
    if (q.answer !== q.collocation.no || q.correctSentence !== q.collocation.example || q.translation !== q.collocation.exampleZh || q.answerTranslation !== q.translation) errors.push({ id:q.id, issue:"collocation answer, matched example sentence, and Chinese translation must come from the same phrase record", answer:q.answer, collocation:q.collocation, sentence:q.correctSentence, translation:q.translation });
    if (feedback.includes("vite det") || feedback.includes("本句搭配怎么理解") || feedback.includes("这个动词的四形")) errors.push({ id:q.id, issue:"unrelated verb phrase/forms leaked into collocation feedback" });
    if (!q.collocation.note || q.rule !== q.collocation.note || q.rule === "把固定搭配作为整体记忆，再通过例句观察它在真实句子中的用法。") errors.push({ id:q.id, issue:"collocation explanation is generic instead of phrase-specific" });
  }
  const phraseNotes = new Set(COLLOCATIONS.map(item => item.note));
  if (phraseNotes.size !== COLLOCATIONS.length) errors.push({ id:"collocations", issue:"different collocations share a generic explanation" });
  if (COLLOCATIONS.some(item => !item.note || /请结合例句中的主语、动作和语境理解/.test(item.note))) errors.push({ id:"collocations", issue:"an unreviewed collocation is still receiving a generic fallback explanation" });
  if (COLLOCATIONS.some(item => /把动词和后面的词一起理解|同一个动词换了搭配|把固定搭配作为整体记忆|请结合例句中的主语、动作和语境理解|在真实句子中的用法/u.test(item.note))) errors.push({ id:"collocations", issue:"retired one-size-fits-all phrase explanation has returned" });
  if (COLLOCATIONS.some(item => !item.example || !item.exampleZh || item.exampleZh.length < 3)) errors.push({ id:"collocations", issue:"a phrase lacks its matching complete example or Chinese translation" });
  if (VERBS.some(item => /把动词和后面的词一起理解；同一个动词换了搭配，意思也可能变化/.test(verbPhraseExplanation(item)))) errors.push({ id:"verb-phrases", issue:"the generic phrase explanation from the deployed screenshot must never be shown" });
  if (new Set(VERBS.map(verbPhraseExplanation)).size !== VERBS.length) errors.push({ id:"verb-phrases", issue:"each current verb phrase must have its own non-duplicated usage explanation" });
  const phraseSamples = [
    ["komme", "hjem", "hjem 在这里表示动作的目的地‘家’"],
    ["vente", "på bussen", "vente på bussen 是等公交车"],
    ["kjøpe", "mat", "mat 在这里泛指食物/食品"]
  ];
  for (const [lemma, tail, expected] of phraseSamples) {
    const verb = VERBS.find(item => item.v1 === lemma && item.tail === tail);
    if (!verb || !verbPhraseExplanation(verb).includes(expected)) errors.push({ id:lemma + " " + tail, issue:"verb phrase feedback does not explain this specific collocation" });
  }
  if (phraseNotes.size !== 18) errors.push({ id:"collocations", issue:"expected specific explanations for every current phrase" });
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
      if (context[3] && !/^https:\\/\\/(?:ordbokene\\.no|naob\\.no|(?:www\\.)?hf\\.ntnu\\.no|www\\.ntnu\\.edu|www\\.norwegianclass101\\.com|preply\\.com)\\//u.test(context[3])) errors.push({ id:entry.id, issue:"sourced vocabulary examples must link to an approved dictionary, university, or language-learning publisher", index, source:context[3] });
    }
  }
  const telleRaw = window.VOCAB_V2.additions.find(entry => entry.id === "telle");
  const telleEntry = telleRaw ? { ...telleRaw, kind:"lexeme" } : null;
  const tellePastField = telleEntry && entryFields(telleEntry).find(field => field.key === "form2");
  const tellePerfectField = telleEntry && entryFields(telleEntry).find(field => field.key === "form3");
  if (!tellePastField || !["talte", "telte", "tellet"].every(form => matchesLexicalAnswer(form, tellePastField.answer)) || matchesLexicalAnswer("telte", "teller")) errors.push({ id:"telle", issue:"accepted past-tense variants should be individually gradable", field:tellePastField });
  if (!tellePerfectField || !["talt", "telt", "tellet"].every(form => matchesLexicalAnswer(form, tellePerfectField.answer))) errors.push({ id:"telle", issue:"accepted participle variants should be individually gradable", field:tellePerfectField });
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
  const repeatedKomme = makeQuestion("perfect", VERBS.find(item => item.v1 === "komme"), 0, "flere ganger");
  if (repeatedKomme.correctSentence !== "Jeg har kommet hit flere ganger denne uka." || repeatedKomme.correctSentence.includes("snart")) errors.push({ id:repeatedKomme.id, issue:"repeated-arrival example must state a natural destination and never combine it with snart", sentence:repeatedKomme.correctSentence });
  if (repeatedKomme.translation !== "这周，我已经来过这里好几次了。") errors.push({ id:repeatedKomme.id, issue:"repeated-arrival Chinese translation should be idiomatic and retain the destination", translation:repeatedKomme.translation });
  const uncuratedRepeat = repairQuestionTranslation({ verbId:VERBS.find(item => item.v1 === "gå").id, category:"perfect", correctSentence:"Jeg har gått til jobben flere ganger denne uka." });
  if (uncuratedRepeat) errors.push({ id:"flere ganger", issue:"an unreviewed verb must not receive a machine-generated, potentially unnatural repetition translation", translation:uncuratedRepeat });
  if (!repeatedKomme.rule.includes("已经来过这里好几次了") || !repeatedKomme.correctSentence.includes("flere ganger denne uka") || !repeatedKomme.rule.includes("flere ganger（好几次）") || !repeatedKomme.rule.includes("denne uka（这周）") || !repeatedKomme.rule.includes("频率状语") || !repeatedKomme.rule.includes("修饰整个动作") || !repeatedKomme.rule.includes("回答“发生了几次”") || !repeatedKomme.rule.includes("时间状语") || !repeatedKomme.rule.includes("动作 + 次数 + 时间范围") || !repeatedKomme.rule.includes("本句句尾实际是 denne uka") || !repeatedKomme.rule.includes("不表示“很快”") || !repeatedKomme.rule.includes("Jeg har flere ganger kommet hit denne uka.")) errors.push({ id:repeatedKomme.id, issue:"frequency explanation must give the exact idiomatic translation, identify what the frequency modifies, distinguish the time span, explain this sentence's actual order, and show a contextual alternative", rule:repeatedKomme.rule });
  const repeatTranslations = { komme:"已经来过这里好几次了", kjøpe:"已经买过好几次食物了", spise:"已经和家人一起吃过好几次晚饭了", snakke:"已经和邻居聊过好几次了", prøve:"已经试着说过好几次挪威语了", se:"已经在家看过好几次电影了" };
  for (const [lemma, expected] of Object.entries(repeatTranslations)) {
    const q = makeQuestion("perfect", VERBS.find(item => item.v1 === lemma), 0, "flere ganger");
    const matchingFronted = q.rule.includes(q.correctSentence.split(" ")[0] + " har flere ganger");
    if (!q.correctSentence.includes("flere ganger denne uka") || /snart|nettopp/.test(q.correctSentence) || !q.translation.includes(expected) || /很快.*好几次|好几次.*很快/.test(q.translation) || !q.rule.includes("flere ganger（好几次）") || !q.rule.includes("denne uka（这周）") || !q.rule.includes("频率状语") || !q.rule.includes("时间状语") || !q.rule.includes("修饰整个动作") || !q.rule.includes("并非固定句尾") || !matchingFronted || !q.rule.includes(q.translation.replace(/[。！？.!?]+$/u, ""))) errors.push({ id:lemma, issue:"frequency example, idiomatic Chinese meaning, and contextual word-order alternatives must match the selected verb without importing a conflicting time cue", sentence:q.correctSentence, translation:q.translation, rule:q.rule });
  }
  for (const verb of VERBS) for (let serial = 0; serial < 48; serial++) {
    const q = makeQuestion("perfect", verb, serial, "flere ganger");
    if (/\\b(?:snart|nettopp)\\b/iu.test(q.correctSentence) || /很快.*好几次|好几次.*很快/u.test(q.translation) || /nettop\\b/iu.test(q.correctSentence)) errors.push({ id:verb.v1, issue:"frequency sentence combines incompatible cues, contains the reported machine-like translation, or misspells nettopp", sentence:q.correctSentence, translation:q.translation, rule:q.rule });
    if (!PERFECT_REPEAT_CONTEXTS[verb.v1] && q.correctSentence.includes("flere ganger")) errors.push({ id:verb.v1, issue:"repetition cue must only be generated for a deliberately curated, natural verb context", sentence:q.correctSentence, translation:q.translation });
  }
  const phraseFeedback = detailedFeedback(makeQuestion("perfect", VERBS.find(item => item.v1 === "kjøpe"), 0, "nettopp"), "good", "test");
  if (phraseFeedback.includes("把动词和后面的词一起理解；同一个动词换了搭配，意思也可能变化。")) errors.push({ id:"kjøpe", issue:"generic phrase explanation template should not appear in feedback" });
  if (!phraseFeedback.includes("mat 在这里泛指食物/食品") || !phraseFeedback.includes("不是“买一顿饭”")) errors.push({ id:"kjøpe", issue:"kjøpe mat explanation should clarify the contextual meaning of mat" });
  for (const verb of VERBS) {
    const explanation = verbPhraseExplanation(verb);
    if ((!explanation.includes(verb.v1) && !explanation.includes(verb.tail)) || /把动词和后面的词一起理解|同一个动词换了搭配/u.test(explanation)) errors.push({ id:verb.v1, issue:"phrase guidance must refer to this actual verb or its selected complement and avoid the retired generic template", explanation });
  }
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
  const comeRepeat = makeQuestion("perfect", VERBS.find(item => item.v1 === "komme"), 3, "flere ganger");
  const frequencyPlacement = makeQuestion("perfect", VERBS.find(item => item.v1 === "spise"), 2, "flere ganger").rule;
  state.review = { "være-0": { streak: 0 } };
  state.vocabSession = { ids: ["være-0"], index: 0, topicId: "basics", lastResult: { meaningOk: true, morphologyOk: true, formsOk: true }, usageQuestion: { answer: "er" }, usageOk: null };
  render = () => {};
  finishVocabCard();
  return JSON.stringify({ automaticReviewIncluded, nextDueIsSpaced, masteredAfterThreeReviews, firstDue, showsChineseMeaning: mistakeHtml.includes("中文句意："), masksAnswerForChoiceRecall: choiceRecallCue.isCloze && choiceRecallCue.text === "Hun ______ mat.", sentenceBreakdownShown: structureHtml.includes("句子结构拆解") && structureHtml.includes("主语") && structureHtml.includes("限定情态动词"), perfectPhraseAnalyzed: perfectStructure.some(row => row.role === "完成分词（谓语的一部分）") && perfectStructure.some(row => row.role === "时间/频率状语"), comeRepeatTranslationNatural: !/很快.*好几次/.test(comeRepeat.translation) && /这周，.+已经来过这里好几次了/.test(comeRepeat.translation), frequencyPlacementExplained: frequencyPlacement.includes("flere ganger（好几次）") && frequencyPlacement.includes("denne uka（这周）") && frequencyPlacement.includes("频率状语") && frequencyPlacement.includes("时间状语") && frequencyPlacement.includes("Han har flere ganger") && frequencyPlacement.includes("更突出“好几次”") && frequencyPlacement.includes("好几次晚饭了"), progressCountsPracticedWords: vocabHtml.includes("已练习词条 · 完成卡片后增长"), unaskedUsageDoesNotBlockMastery: state.review["være-0"].streak === 1 });
})()`, context));
assert.equal(reviewReport.automaticReviewIncluded, true, "due mistakes should be inserted into daily practice");
assert.equal(reviewReport.nextDueIsSpaced, true, "a successful recall should schedule the next wider interval");
assert.equal(reviewReport.masteredAfterThreeReviews, true, "three spaced correct recalls should clear the active mistake");
assert.equal(reviewReport.showsChineseMeaning, true, "mistake recall should show saved Chinese context");
assert.equal(reviewReport.masksAnswerForChoiceRecall, true, "choice mistakes should become fill-in-the-blank recalls");
assert.equal(reviewReport.sentenceBreakdownShown, true, "feedback should explain identifiable sentence parts");
assert.equal(reviewReport.perfectPhraseAnalyzed, true, "perfect tense and adverb roles should be recognized in a sentence breakdown");
assert.equal(reviewReport.comeRepeatTranslationNatural, true, "a repeated-arrival example should not translate as 'come soon several times'");
assert.equal(reviewReport.frequencyPlacementExplained, true, "feedback should explain why the frequency phrase is placed here and give a valid alternate position");
assert.equal(reviewReport.progressCountsPracticedWords, true, "vocabulary progress should report practiced coverage");
assert.equal(reviewReport.unaskedUsageDoesNotBlockMastery, true, "an unpresented usage prompt should not block vocabulary mastery progress");
console.log("Spaced review, contextual mistake recall, and vocabulary progress checks passed.");
