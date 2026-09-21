const VERBS = [
  { forms: "jobbe – jobber – jobbet – jobbet", zh: "工作", phrase: "jobbe i Oslo" },
  { forms: "snakke – snakker – snakket – snakket", zh: "说话", phrase: "snakke med noen" },
  { forms: "gå – går – gikk – gått", zh: "走、去", phrase: "gå til jobben" },
  { forms: "ta – tar – tok – tatt", zh: "拿、乘坐", phrase: "ta bussen" },
  { forms: "finne – finner – fant – funnet", zh: "找到", phrase: "finne en løsning" },
  { forms: "søke – søker – søkte – søkt", zh: "申请、搜索", phrase: "søke på en jobb" },
  { forms: "si – sier – sa – sagt", zh: "说某句话", phrase: "si at …" },
  { forms: "gjøre – gjør – gjorde – gjort", zh: "做", phrase: "gjøre en innsats" },
];

const QUESTIONS = [
  {
    id: "modal-v1-jobbe", type: "choice", skill: "skal + V1", level: "核心规则",
    prompt: "Jeg skal ___ i Lillestrøm neste år.", options: ["jobb", "jobbe", "jobber", "jobbet"], answer: "jobbe",
    explanation: "skal 已经承担了变形，后面的动词必须用不带 å 的原形：skal + jobbe。jobb 是名词，jobber 是现在时。"
  },
  {
    id: "past-ta", type: "choice", skill: "过去时", level: "动词四形",
    prompt: "Jeg ___ bussen til jobb i går.", options: ["tar", "tok", "tatt", "ta"], answer: "tok",
    explanation: "i går 明确要求过去时。ta – tar – tok – tatt，所以这里用 tok。固定搭配是 ta bussen。"
  },
  {
    id: "perfect-finne", type: "choice", skill: "完成时", level: "动词四形",
    prompt: "Jeg har ___ en ny jobb.", options: ["finne", "finner", "fant", "funnet"], answer: "funnet",
    explanation: "har + perfektum partisipp（第四形态）。finne – finner – fant – funnet。"
  },
  {
    id: "present-snakk", type: "input", skill: "现在时", level: "快速填空",
    prompt: "Jeg ___ norsk med kollegene mine hver dag.", answer: "snakker",
    explanation: "hver dag 表示习惯。普通现在时使用 snakker。"
  },
  {
    id: "v2-order", type: "input", skill: "V2 语序", level: "重新排序",
    prompt: "把词语组成正确句子：I morgen / jeg / skal / jobbe",
    answers: ["I morgen skal jeg jobbe", "I morgen skal jeg jobbe."],
    explanation: "时间成分放到句首后，变位动词仍在第二位：I morgen + skal + jeg + jobbe。"
  },
  {
    id: "free-tomorrow", type: "free", skill: "自由造句", level: "个性化反馈",
    prompt: "Hva skal du gjøre i morgen? 写一句或两句挪威语。",
    targets: ["skal"], example: "I morgen skal jeg jobbe, og etter jobb skal jeg lære norsk."
  }
];

const DEFAULT_STATE = { completed: [], correct: 0, attempts: 0, mistakes: [], streak: 1, lastDate: "" };
const STORAGE_KEY = "norsk-state-v1";
let state = loadState();
let currentIndex = Math.min(state.completed.length, QUESTIONS.length - 1);

function loadState() {
  try { return { ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return { ...DEFAULT_STATE }; }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function escapeHtml(value = "") {
  return value.replace(/[&<>'"]/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[ch]));
}
function normalize(value = "") { return value.trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "").toLocaleLowerCase("nb-NO"); }
function route() { return (location.hash.slice(1) || "today").split("?")[0]; }

function render() {
  document.querySelectorAll("[data-route]").forEach(a => a.classList.toggle("active", a.dataset.route === route()));
  const views = { today: renderToday, practice: renderPractice, verbs: renderVerbs, mistakes: renderMistakes, speak: renderSpeak };
  document.querySelector("#app").innerHTML = (views[route()] || renderToday)();
  bindView();
}

function accuracy(skill) {
  const items = state.mistakes.filter(x => x.skill === skill);
  const base = { "skal + V1": 78, "过去时": 66, "完成时": 58, "V2 语序": 64 }[skill] || 70;
  return Math.max(20, base - items.length * 7);
}

function renderToday() {
  const done = state.completed.length;
  const pct = Math.round(done / QUESTIONS.length * 100);
  return `
    <section class="hero">
      <div class="hero-main">
        <div class="eyebrow">Dagens økt · 今日训练</div>
        <h1>练到开口时<br>不再犹豫。</h1>
        <p>今天只练最容易出错的动词形态。完成 ${QUESTIONS.length} 道小题，大约需要 8–12 分钟。</p>
        <button class="button primary" data-start>${done ? "继续今日训练" : "开始今日训练"}</button>
      </div>
      <aside class="hero-side">
        <div><span class="streak">${state.streak}<small>天连续学习 · streak</small></span></div>
        <div><div class="metric-head"><strong>今日进度</strong><span>${done}/${QUESTIONS.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div>
      </aside>
    </section>
    <section class="grid">
      <article class="panel">
        <span class="tag">弱项雷达</span><h2 style="margin-top:12px">你的四个盒子</h2>
        <div class="metric-row">${["skal + V1","过去时","完成时","V2 语序"].map(s => `<div><div class="metric-head"><strong>${s}</strong><span>${accuracy(s)}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${accuracy(s)}%"></div></div></div>`).join("")}</div>
      </article>
      <article class="panel">
        <span class="tag">判题机制</span><h2 style="margin-top:12px">答案不是只看一模一样</h2>
        <p class="muted">选择和填空精确判题；自由造句会拆成“目标结构、动词形态、语序、固定搭配”逐项检查。系统不确定时会明确标记为“需复核”。</p>
        <div class="rule-box"><strong>例：</strong><br><span class="example">Jeg skal jobber.</span><br>→ 识别到 <code>skal + 现在时</code><br>→ 建议 <code>skal jobbe</code> 并解释原因</div>
      </article>
    </section>`;
}

function renderPractice() {
  const q = QUESTIONS[currentIndex];
  const progress = Math.round(currentIndex / QUESTIONS.length * 100);
  let answerUi = "";
  if (q.type === "choice") answerUi = `<div class="options">${q.options.map(o => `<button class="option" data-choice="${escapeHtml(o)}">${escapeHtml(o)}</button>`).join("")}</div>`;
  if (q.type === "input") answerUi = `<input class="answer" id="answer-input" autocomplete="off" placeholder="Skriv svaret …"><div class="actions"><button class="button primary" data-check>检查答案</button></div>`;
  if (q.type === "free") answerUi = `<textarea id="free-answer" placeholder="Skriv på norsk …"></textarea><div class="actions"><button class="button primary" data-check-free>分析我的句子</button><button class="button secondary" data-example>显示参考答案</button></div>`;
  return `<section class="question-card">
    <div class="question-meta"><span>${q.level} · ${q.skill}</span><span>${currentIndex + 1}/${QUESTIONS.length}</span></div>
    <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
    <div class="prompt">${q.prompt}</div>${answerUi}<div id="feedback"></div>
  </section>`;
}

function renderVerbs() {
  return `<section class="panel wide"><span class="eyebrow">Verb · 动词四形</span><h1 style="font-size:44px">不要只背一个词。</h1><p class="muted">按“原形 – 现在时 – 过去时 – 完成分词”整组记忆，再连同固定搭配一起使用。</p><div class="verb-list">${VERBS.map(v => `<div class="verb-row"><div class="verb-forms">${v.forms}</div><div class="translation">${v.zh} · <span class="example">${v.phrase}</span></div></div>`).join("")}</div></section>`;
}

function renderMistakes() {
  return `<section class="panel wide"><span class="eyebrow">Mine feil · 我的错误</span><h1 style="font-size:44px">错误会回来，直到你会。</h1>${state.mistakes.length ? `<div class="mistake-list">${[...state.mistakes].reverse().map(m => `<div class="mistake-item"><span class="tag">${m.skill}</span><h3 style="margin-top:10px">${escapeHtml(m.prompt)}</h3><div>你的答案：<code>${escapeHtml(m.given)}</code></div><div>建议答案：<code>${escapeHtml(m.answer)}</code></div><p class="muted">${escapeHtml(m.explanation)}</p></div>`).join("")}</div>` : `<div class="empty">还没有错题。完成今日训练后，系统会自动收集并按规则分类。</div>`}</section>`;
}

function renderSpeak() {
  return `<section class="panel wide center"><span class="eyebrow">Snakke · 口语模式</span><h1 style="font-size:44px">Hva skal du gjøre i morgen?</h1><p class="muted">点击麦克风后说一句挪威语。浏览器支持语音识别时会自动转成文字，再使用同一套语法规则分析。</p><button class="speak-button" data-speak aria-label="开始录音">●</button><p id="speech-status" class="muted">Trykk for å snakke</p><textarea id="speech-text" placeholder="识别结果会出现在这里，也可以直接输入。"></textarea><div class="actions" style="justify-content:center"><button class="button primary" data-check-speech>分析回答</button></div><div id="feedback" style="text-align:left"></div></section>`;
}

function recordResult(q, given, isCorrect, answer, explanation) {
  state.attempts += 1;
  if (isCorrect) state.correct += 1;
  else state.mistakes.push({ id: Date.now(), qid: q.id, skill: q.skill, prompt: q.prompt, given, answer, explanation });
  if (!state.completed.includes(q.id)) state.completed.push(q.id);
  saveState();
}

function feedbackHtml(kind, title, explanation, answer = "") {
  return `<div class="feedback ${kind}"><h3>${title}</h3>${answer ? `<div>建议：<code>${escapeHtml(answer)}</code></div>` : ""}<p>${explanation}</p><div class="actions"><button class="button primary" data-next>${currentIndex === QUESTIONS.length - 1 ? "查看今日总结" : "下一题"}</button></div></div>`;
}

function checkStructured(q, given) {
  const valid = q.answers || [q.answer];
  const ok = valid.some(a => normalize(a) === normalize(given));
  const expected = valid[0];
  recordResult(q, given, ok, expected, q.explanation);
  document.querySelector("#feedback").innerHTML = feedbackHtml(ok ? "good" : "bad", ok ? "✓ 正确" : "需要修改", q.explanation, ok ? "" : expected);
  document.querySelector("[data-next]")?.addEventListener("click", nextQuestion);
  return ok;
}

function analyzeNorwegian(text) {
  const raw = text.trim();
  const lower = normalize(raw);
  const issues = [];
  if (!raw) return { status: "bad", issues: ["请先写一句挪威语。"], corrected: "" };

  const modalBad = /\b(skal|vil|kan|må|bør)\s+(\w+(?:er|r))\b/gi;
  let match;
  while ((match = modalBad.exec(lower))) {
    const irregular = { finner: "finne", snakker: "snakke", jobber: "jobbe", lærer: "lære", reiser: "reise", kjøper: "kjøpe", går: "gå", tar: "ta", sier: "si", gjør: "gjøre", får: "få" };
    const suggested = irregular[match[2]] || match[2].replace(/r$/, "");
    issues.push(`在 ${match[1]} 后使用动词原形：${match[1]} ${suggested}，不使用 ${match[2]}。`);
  }
  if (/\bkan\s+å\b/i.test(lower)) issues.push("kan 后面不加 å：写成 kan + 动词原形。");
  if (/\bskal\s+jobb\b/i.test(lower)) issues.push("jobb 是名词；动词原形是 jobbe，所以应写 skal jobbe。");
  if (/\bhar\s+(jobber|snakker|finner|går|tar)\b/i.test(lower)) issues.push("har 后面要使用完成分词（第四形态），不能使用现在时。");
  if (/^(i morgen|neste (uke|år)|i går)\s+jeg\b/i.test(lower)) issues.push("时间放句首时要用 V2 语序：时间 + 变位动词 + 主语。比如 I morgen skal jeg …");
  if (/\bgikk på buss\b/i.test(lower)) issues.push("“坐公交”通常说 tok bussen，而不是 gikk på buss。");
  if (/\bkolleger mi\b/i.test(lower)) issues.push("复数所有结构应是 kollegene mine。");
  if (/\b(chjef|sjef) mi\b/i.test(lower)) issues.push("应写 sjefen min：名词定指形式 + 所有词。");
  if (/\bsnakke denne\b/i.test(lower)) issues.push("表达“说某件事”用 si at …；snakke 表示交谈。");

  const hasTarget = /\b(skal|vil|kan|må|bør|kommer til å)\b/i.test(lower);
  if (!hasTarget) issues.push("这道题的目标是练习未来或情态结构，请至少使用 skal、vil、kan 或 kommer til å。 ");
  return { status: issues.length ? "close" : "good", issues, corrected: "", hasTarget };
}

function showFreeFeedback(text) {
  const result = analyzeNorwegian(text);
  const q = QUESTIONS.find(x => x.type === "free") || QUESTIONS.at(-1);
  const ok = result.status === "good";
  const explanation = ok ? "目标结构和常见语法检查均通过。自由表达可能有多个正确答案，所以这里不会要求与你的参考答案一模一样。" : result.issues.join(" ");
  recordResult(q, text, ok, q.example, explanation);
  document.querySelector("#feedback").innerHTML = `<div class="feedback ${result.status}"><h3>${ok ? "✓ 本地规则检查通过" : "接近正确，看看这些地方"}</h3>${result.issues.length ? `<ul>${result.issues.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>` : ""}<p class="muted">本地检查只判断已知规则；自然度、语义细节和复杂句需要 AI 或老师复核。</p><div class="actions"><button class="button primary" data-next>完成</button></div></div>`;
  document.querySelector("[data-next]")?.addEventListener("click", nextQuestion);
}

function nextQuestion() {
  if (currentIndex < QUESTIONS.length - 1) { currentIndex += 1; location.hash = "practice"; render(); }
  else { location.hash = "today"; render(); }
}

function bindView() {
  document.querySelector("[data-start]")?.addEventListener("click", () => { currentIndex = Math.min(state.completed.length, QUESTIONS.length - 1); location.hash = "practice"; });
  document.querySelectorAll("[data-choice]").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll("[data-choice]").forEach(x => x.disabled = true);
    const q = QUESTIONS[currentIndex]; const ok = checkStructured(q, btn.dataset.choice);
    btn.classList.add(ok ? "correct" : "wrong");
    if (!ok) document.querySelectorAll("[data-choice]").forEach(x => { if (x.dataset.choice === q.answer) x.classList.add("correct"); });
  }));
  document.querySelector("[data-check]")?.addEventListener("click", () => checkStructured(QUESTIONS[currentIndex], document.querySelector("#answer-input").value));
  document.querySelector("[data-check-free]")?.addEventListener("click", () => showFreeFeedback(document.querySelector("#free-answer").value));
  document.querySelector("[data-example]")?.addEventListener("click", () => { document.querySelector("#feedback").innerHTML = `<div class="feedback close"><h3>参考表达</h3><p class="example">${QUESTIONS[currentIndex].example}</p><p>这只是一个参考答案，不是唯一答案。请尽量用自己的真实情况作答。</p></div>`; });
  document.querySelector("[data-next]")?.addEventListener("click", nextQuestion);
  document.querySelector("[data-check-speech]")?.addEventListener("click", () => showFreeFeedback(document.querySelector("#speech-text").value));
  document.querySelector("[data-speak]")?.addEventListener("click", startSpeech);
}

function startSpeech() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const status = document.querySelector("#speech-status");
  if (!Recognition) { status.textContent = "当前浏览器不支持语音识别，请直接输入；Chrome/Edge 通常支持。"; return; }
  const rec = new Recognition(); rec.lang = "nb-NO"; rec.interimResults = false;
  status.textContent = "Lytter … 正在听";
  rec.onresult = e => { document.querySelector("#speech-text").value = e.results[0][0].transcript; status.textContent = "识别完成，可以检查。"; };
  rec.onerror = () => { status.textContent = "没有识别成功，请重试或直接输入。"; };
  rec.start();
}

document.querySelector("#reset-day").addEventListener("click", () => { if (confirm("确定清除今日进度和错题吗？")) { state = { ...DEFAULT_STATE }; currentIndex = 0; saveState(); render(); } });
window.addEventListener("hashchange", render);
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
render();
