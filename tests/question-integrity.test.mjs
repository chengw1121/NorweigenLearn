import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
const stopAt = source.indexOf('document.querySelector("#reset-day").addEventListener');
assert.notEqual(stopAt, -1, "app.js bootstrap boundary should exist");
const storage = new Map();
const context = vm.createContext({
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
  location: { hash: "", pathname: "/", search: "" },
  URLSearchParams,
  console
});
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
    const feedback = detailedFeedback(q, "good", "test");
    if (!feedback.includes("本题固定搭配</strong><p><code>" + q.collocation.no + "</code> = " + q.collocation.zh + "</p>")) errors.push({ id:q.id, issue:"feedback phrase is not bound to collocation" });
    if (feedback.includes("vite det")) errors.push({ id:q.id, issue:"unrelated random verb phrase leaked into collocation feedback" });
  }
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
