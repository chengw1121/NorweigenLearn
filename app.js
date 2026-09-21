/* Norsk hver dag - a deterministic, data-driven Norwegian practice engine. */
const VERBS = [
  ["være","er","var","vært","是、处于","hjemme"], ["ha","har","hadde","hatt","有","tid"],
  ["gjøre","gjør","gjorde","gjort","做","en innsats"], ["gå","går","gikk","gått","走、去","til jobben"],
  ["komme","kommer","kom","kommet","来","snart"], ["ta","tar","tok","tatt","拿；乘坐","bussen"],
  ["se","ser","så","sett","看、看见","filmen"], ["si","sier","sa","sagt","说（内容）","det"],
  ["vite","vet","visste","visst","知道","det"], ["finne","finner","fant","funnet","找到","en løsning"],
  ["få","får","fikk","fått","得到；有孩子","hjelp"], ["bli","blir","ble","blitt","变成、成为","bedre"],
  ["stå","står","sto","stått","站；放置","utenfor"], ["sitte","sitter","satt","sittet","坐","på en kafé"],
  ["ligge","ligger","lå","ligget","躺；位于","i Norge"], ["gi","gir","ga","gitt","给","ham boka"],
  ["drikke","drikker","drakk","drukket","喝","kaffe"], ["sove","sover","sov","sovet","睡","godt"],
  ["forstå","forstår","forsto","forstått","理解","litt norsk"], ["spørre","spør","spurte","spurt","问","læreren"],
  ["fortelle","forteller","fortalte","fortalt","告诉、讲述","meg det"], ["holde","holder","holdt","holdt","拿住；保持","døra"],
  ["velge","velger","valgte","valgt","选择","denne"], ["selge","selger","solgte","solgt","卖","bilen"],
  ["kunne","kan","kunne","kunnet","能、会","snakke norsk"], ["ville","vil","ville","villet","想、愿意","lære norsk"],
  ["skulle","skal","skulle","skullet","将要、计划","jobbe"], ["måtte","må","måtte","måttet","必须","øve"],
  ["burde","bør","burde","burdet","应该","hvile"], ["jobbe","jobber","jobbet","jobbet","工作","i Oslo"],
  ["lære","lærer","lærte","lært","学习","norsk"], ["øve","øver","øvde","øvd","练习","hver dag"],
  ["lese","leser","leste","lest","读","ei bok"], ["skrive","skriver","skrev","skrevet","写","en melding"],
  ["søke","søker","søkte","søkt","申请、搜索","på en jobb"], ["bo","bor","bodde","bodd","居住","i Norge"],
  ["møte","møter","møtte","møtt","遇见、会见","læreren"], ["hjelpe","hjelper","hjalp","hjulpet","帮助","meg"],
  ["bruke","bruker","brukte","brukt","使用、花费","mobilen"], ["trenge","trenger","trengte","trengt","需要","hjelp"],
  ["prøve","prøver","prøvde","prøvd","尝试","å snakke norsk"], ["spise","spiser","spiste","spist","吃","frokost"],
  ["lage","lager","laget","laget","做、制作","middag"], ["kjøpe","kjøper","kjøpte","kjøpt","买","mat"],
  ["betale","betaler","betalte","betalt","支付","regningen"], ["kjøre","kjører","kjørte","kjørt","开车","til Oslo"],
  ["reise","reiser","reiste","reist","旅行、出行","til Sverige"], ["vaske","vasker","vasket","vasket","洗、清洁","klær"],
  ["snakke","snakker","snakket","snakket","说话、交谈","med naboen"], ["like","liker","likte","likt","喜欢","å lære norsk"],
  ["tenke","tenker","tenkte","tenkt","想、思考","på framtida"], ["mene","mener","mente","ment","认为；意思是","det"],
  ["synes","synes","syntes","syntes","觉得、认为","det"], ["huske","husker","husket","husket","记得","det"],
  ["glemme","glemmer","glemte","glemt","忘记","nøklene"], ["begynne","begynner","begynte","begynt","开始","å jobbe"],
  ["slutte","slutter","sluttet","sluttet","停止、结束","klokka fire"], ["vente","venter","ventet","ventet","等待","på bussen"],
  ["høre","hører","hørte","hørt","听见","deg"], ["sette","setter","satte","satt","放置；使坐下","seg ned"],
  ["legge","legger","la","lagt","放下；躺下","seg ned"], ["løpe","løper","løp","løpt","跑","hjem"],
  ["bære","bærer","bar","båret","搬、拿、背","denne"], ["treffe","treffer","traff","truffet","见到、碰见","henne"],
  ["bestå","består","besto","bestått","通过（考试）","B1"]
].map(([v1,pres,past,pp,zh,tail], index) => ({ id: `${v1}-${index}`, v1, pres, past, pp, zh, tail, phrase: `${v1} ${tail}` }));

const COLLLOCATIONS = [
  ["ha lyst til å", "想做……", "Har du lyst til å gå en tur?"], ["like å", "喜欢做……", "Jeg liker å lære norsk."],
  ["prøve å", "尝试做……", "Jeg prøver å snakke norsk."], ["begynne å", "开始做……", "Jeg begynner å jobbe klokka åtte."],
  ["bli ferdig", "完成、弄完", "Når blir du ferdig?"], ["komme tilbake", "回来", "Vi kommer tilbake senere."],
  ["ta på seg", "穿上", "Ta på deg jakka."], ["gå på tur", "去散步", "Vi går på tur i helga."],
  ["gå til jobben", "步行去上班", "Jeg går til jobben hver dag."], ["ta bussen / toget", "坐公交 / 火车", "Jeg tok bussen i går."],
  ["snakke med noen", "和某人交谈", "Jeg snakker med naboen."], ["si at …", "说……", "Jeg vil si at maten er god."],
  ["søke på en jobb", "申请工作", "Jeg skal søke på en ny jobb."], ["vente på", "等待", "Jeg venter på toget."],
  ["høre på", "听（音乐等）", "Jeg hører på musikk."], ["se på", "看（电视等）", "Jeg ser på TV."],
  ["tenke på", "想到、考虑", "Jeg tenker på framtida."], ["være ferdig med", "完成某事", "Jeg er ferdig med jobben."]
].map(([no, zh, example]) => ({ no, zh, example }));

const DISTRIBUTION = [
  ["form", "四形选择", .28], ["modal", "情态 + V1", .18], ["past", "过去时", .14],
  ["perfect", "har + 完成分词", .14], ["infinitive", "å + V1", .10], ["collocation", "固定搭配", .08],
  ["correction", "改错", .04], ["v2", "V2 语序", .04], ["output", "自由输出", .02]
];
const DEFAULT_STATE = { mistakes: [], attempts: 0, correct: 0, streak: 1, learned: {}, session: null, lastSummary: null };
const STORAGE_KEY = "norsk-state-v2";
let state = loadState();

function loadState() { try { return { ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; } catch { return { ...DEFAULT_STATE }; } }
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function esc(value = "") { return String(value).replace(/[&<>'"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[c])); }
function normalize(value = "") { return value.trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "").toLocaleLowerCase("nb-NO"); }
function shuffle(list) { return [...list].sort(() => Math.random() - .5); }
function route() { return (location.hash.slice(1) || "today").split("?")[0]; }
function query() { return new URLSearchParams(location.hash.split("?")[1] || ""); }
function getVerb(id) { return VERBS.find(v => v.id === id) || VERBS[0]; }
function currentQuestion() { return state.session?.questions?.[state.session.index]; }

function countsFor(total) {
  const required = total >= 10
    ? ["form","modal","past","perfect","infinitive","collocation","correction","v2","output"]
    : total >= 8
      ? ["form","modal","past","perfect","infinitive","collocation","v2","output"]
      : ["form","modal","past","perfect","output"];
  const counts = DISTRIBUTION.map(([type]) => ({ type, count: required.includes(type) ? 1 : 0 }));
  let left = total - required.length;
  const priority = ["form","modal","past","perfect","infinitive","collocation","v2","correction","output"];
  let i = 0; while (left-- > 0) { counts.find(x => x.type === priority[i % priority.length]).count++; i++; }
  return counts;
}
function answerChoices(verb, correct, extra = []) {
  const unique = [...new Set([verb.v1, verb.pres, verb.past, verb.pp, ...extra].filter(Boolean))];
  if (unique.length < 4) VERBS.forEach(other => { if (other.id !== verb.id && unique.length < 4 && !unique.includes(other.pres)) unique.push(other.pres); });
  if (!unique.includes(correct)) unique.unshift(correct);
  return shuffle(unique).slice(0, Math.min(4, unique.length));
}
function makeChoice(id, type, skill, prompt, verb, correct, explanation) { return { id, type: "choice", skill, prompt, options: answerChoices(verb, correct), answer: correct, verbId: verb.id, explanation }; }
function makeQuestion(type, verb, serial) {
  const id = `${type}-${verb.id}-${serial}`;
  if (type === "form") return makeChoice(id, type, "动词四形", `Jeg ___ ${verb.tail}.`, verb, verb.pres, `这是普通现在时。普通“现在/平时做”使用 ${verb.pres}。`);
  if (type === "modal") return makeChoice(id, type, "情态 + V1", `Jeg skal ___ ${verb.tail}.`, verb, verb.v1, `skal 已经承担了变形，后面直接用原形：skal + ${verb.v1}，不加 -r，也不加 å。`);
  if (type === "past") return makeChoice(id, type, "过去时", `I går ___ jeg ${verb.tail}.`, verb, verb.past, `i går 表示明确过去时间，所以使用过去时：${verb.v1} – ${verb.pres} – ${verb.past}。`);
  if (type === "perfect") return makeChoice(id, type, "har + 完成分词", `Jeg har ___ ${verb.tail}.`, verb, verb.pp, `har 后面使用完成分词（第四形态）：har + ${verb.pp}。`);
  if (type === "infinitive") return makeChoice(id, type, "å + V1", `Jeg liker å ___ ${verb.tail}.`, verb, verb.v1, `liker å 后面使用原形：liker å + ${verb.v1}。情态动词后才不加 å。`);
  if (type === "v2") return makeV2Question(serial);
  if (type === "collocation") {
    const c = COLLLOCATIONS[serial % COLLLOCATIONS.length];
    return { id, type: "choice", skill: "固定搭配", prompt: "选择自然表达：我昨天坐公交去上班。", options: shuffle(["Jeg tok bussen til jobb i går.", "Jeg gikk på buss til jobben i går.", "Jeg tok bussen på jobb i går.", "Jeg gikk bussen til jobb i går."]), answer: "Jeg tok bussen til jobb i går.", verbId: verb.id, explanation: `固定搭配是 ${c[0]}。本题特别练习 ta – tar – tok – tatt 和 ta bussen。` };
  }
  if (type === "correction") return { id, type: "input", skill: "改错", prompt: `改正句子：Jeg skal ${verb.pres} ${verb.tail}.`, answers: [`Jeg skal ${verb.v1} ${verb.tail}.`], answer: `Jeg skal ${verb.v1} ${verb.tail}.`, verbId: verb.id, explanation: `错误在于 skal 后使用了现在时 ${verb.pres}。应改为原形：skal ${verb.v1}。` };
  return { id, type: "free", skill: "自由输出", prompt: `用挪威语写一句关于你自己的句子，使用：${verb.v1}。可以用 skal、vil、kan 或 har。`, verbId: verb.id, target: verb.v1, example: `Jeg skal ${verb.v1} ${verb.tail}.` };
}
function makeV2Question(serial) { return { id: `v2-${serial}`, type: "input", skill: "V2 语序", prompt: "把词语组成自然句子（时间可以放句首或句末）：I morgen / jeg / skal / jobbe", answers: ["I morgen skal jeg jobbe", "Jeg skal jobbe i morgen"], answer: "I morgen skal jeg jobbe", explanation: "两种语序都正确：I morgen + skal + jeg + jobbe，或 Jeg + skal + jobbe + i morgen。只有时间放句首时，变位动词必须在第二位。" }; }
function buildSession(total, onlyVerbId = null) {
  const counts = countsFor(total); const pool = onlyVerbId ? [getVerb(onlyVerbId)] : shuffle(VERBS); let serial = Date.now(); const qs = [];
  counts.forEach(({ type, count }) => { for (let i = 0; i < count; i++) qs.push(makeQuestion(type, pool[(qs.length + i) % pool.length], serial++)); });
  return { questions: shuffle(qs), index: 0, answers: {}, total };
}

function render() {
  document.querySelectorAll("[data-route]").forEach(a => a.classList.toggle("active", a.dataset.route === route()));
  if (route() === "learn" && query().get("verb")) { document.querySelector("#app").innerHTML = renderLearnDetail(getVerb(query().get("verb"))); bindView(); return; }
  const views = { today: renderToday, setup: renderSetup, practice: renderPractice, summary: renderSummary, verbs: renderVerbs, learn: renderLearn, mistakes: renderMistakes, speak: renderSpeak };
  document.querySelector("#app").innerHTML = (views[route()] || renderToday)(); bindView();
}
function progressForSkill(skill) { return Math.max(25, 78 - state.mistakes.filter(m => m.skill === skill).length * 7); }
function renderToday() {
  const s = state.session; const done = s ? Object.keys(s.answers || {}).length : 0; const total = s?.total || 0; const pct = total ? Math.round(done / total * 100) : 0;
  return `<section class="hero"><div class="hero-main"><div class="eyebrow">Dagens økt · 今日训练</div><h1>练到开口时<br>不再犹豫。</h1><p>先选择题量，系统会按学习目标分配题型。每个动词会在四形、情态、过去、完成和固定搭配中反复出现。</p><button class="button primary" data-start>${s ? "继续今日训练" : "选择题量并开始"}</button></div><aside class="hero-side"><div><span class="streak">${state.streak}<small>天连续学习 · streak</small></span></div><div><div class="metric-head"><strong>${s ? "本次进度" : "准备开始"}</strong><span>${s ? `${done}/${total}` : "5–30题"}</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div></aside></section><section class="grid"><article class="panel"><span class="tag">弱项雷达</span><h2 style="margin-top:12px">你的四个盒子</h2><div class="metric-row">${["动词四形","情态 + V1","过去时","har + 完成分词","V2 语序"].map(skill => `<div><div class="metric-head"><strong>${skill}</strong><span>${progressForSkill(skill)}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${progressForSkill(skill)}%"></div></div></div>`).join("")}</div></article><article class="panel"><span class="tag">科学分配</span><h2 style="margin-top:12px">每次都练完整链条</h2><p class="muted">先识别形态，再放进情境，最后用固定搭配和自由输出迁移。错题会回到你的错误库，不会只出现一次。</p><div class="rule-box"><strong>四句话记一个词：</strong><br><span class="example">Jeg jobber. · Jeg skal jobbe. · Jeg jobbet. · Jeg har jobbet.</span></div></article></section>`;
}
function renderSetup() {
  const selected = Number(query().get("n")) || 10; const counts = countsFor(selected);
  return `<section class="panel setup-panel"><span class="eyebrow">Dagens økt · 设置本次训练</span><h1 style="font-size:44px">你想练多少题？</h1><p class="muted">题量越大，覆盖的动词和题型越多。建议每天10–15题，连续学习比一次做很多题更有效。</p><div class="count-grid">${[5,10,15,20,30].map(n => `<button class="count-option ${n === selected ? "selected" : ""}" data-count="${n}"><strong>${n}</strong><span>道题</span></button>`).join("")}</div><div class="distribution-card"><h3>本次自动分配</h3><div class="distribution-list">${counts.filter(x => x.count).map(x => `<div><span>${DISTRIBUTION.find(d => d[0] === x.type)?.[1] || x.type}</span><strong>${x.count}</strong></div>`).join("")}</div></div><div class="actions"><button class="button primary" data-begin="${selected}">开始${selected}题训练</button><button class="button secondary" data-back-today>返回</button></div></section>`;
}
function renderPractice() {
  const q = currentQuestion(); if (!q) return renderSummary(); const answered = state.session.answers?.[q.id]; const pct = Math.round(state.session.index / state.session.total * 100); let ui = "";
  if (q.type === "choice") ui = `<div class="options">${q.options.map(o => `<button class="option" data-choice="${esc(o)}" ${answered ? "disabled" : ""}>${esc(o)}</button>`).join("")}</div>`;
  if (q.type === "input") ui = `<input class="answer" id="answer-input" autocomplete="off" placeholder="Skriv svaret …" ${answered ? "disabled" : ""}><div class="actions"><button class="button primary" data-check ${answered ? "disabled" : ""}>检查答案</button></div>`;
  if (q.type === "free") ui = `<textarea id="free-answer" placeholder="Skriv på norsk …" ${answered ? "disabled" : ""}></textarea><div class="actions"><button class="button primary" data-check-free ${answered ? "disabled" : ""}>分析我的句子</button><button class="button secondary" data-example>显示参考框架</button></div>`;
  const savedFeedback = answered ? feedback(answered.ok ? "good" : "bad", answered.ok ? "✓ 已答对" : "已记录错题", q.explanation, answered.ok ? "" : (q.answers || [q.answer])[0]) : "";
  return `<section class="question-card"><div class="question-meta"><span>${esc(q.skill)} · ${state.session.index + 1}/${state.session.total}</span><span>第${state.session.index + 1}题</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><div class="prompt">${esc(q.prompt)}</div>${ui}<div id="feedback">${savedFeedback}</div></section>`;
}
function renderSummary() { const sum = state.lastSummary || { correct: 0, total: 0, mistakes: 0 }; return `<section class="panel center summary-panel"><span class="eyebrow">Økt ferdig · 本次完成</span><h1 style="font-size:48px">做得很好。</h1><div class="summary-score">${sum.correct}<small>/${sum.total} 正确</small></div><p class="muted">${sum.mistakes ? `有${sum.mistakes}道题进入错误库，下一次会优先复习。` : "本次没有新增错题。"}</p><div class="actions" style="justify-content:center"><button class="button primary" data-start>再练一次</button><button class="button secondary" data-go-learn>去背词</button></div></section>`; }
function renderVerbs() { return `<section class="panel wide"><span class="eyebrow">Verb · 动词四形</span><h1 style="font-size:44px">四个形态，整组记。</h1><p class="muted">原形 – 现在时 – 过去时 – 完成分词。点击任意动词进入背词卡。</p><div class="verb-list">${VERBS.map(v => `<button class="verb-row verb-button" data-verb="${v.id}"><div class="verb-forms">${v.v1} – ${v.pres} – ${v.past} – ${v.pp}</div><div class="translation">${v.zh} · <span class="example">${v.phrase}</span></div></button>`).join("")}</div></section>`; }
function renderLearn() { const learnedCount = Object.values(state.learned).filter(x => x >= 2).length; return `<section class="panel wide"><span class="eyebrow">Lær · 背词模块</span><h1 style="font-size:44px">每天5–10个，跟着卡片学。</h1><p class="muted">先看挪威语，自己读四形；点击进入后查看中文、固定搭配和四句框架。按“再练/会了”记录掌握程度。</p><div class="learn-progress"><strong>${learnedCount}/${VERBS.length}</strong><span>个动词达到“会了”两次</span><div class="progress-track"><div class="progress-fill" style="width:${Math.round(learnedCount / VERBS.length * 100)}%"></div></div></div><div class="learn-grid">${VERBS.map(v => { const n = state.learned[v.id] || 0; return `<button class="learn-card" data-verb="${v.id}"><div class="learn-card-top"><strong>${v.v1}</strong><span>${n ? `复习${n}次` : "新词"}</span></div><div>${v.zh}</div><div class="learn-forms">${v.pres} · ${v.past} · ${v.pp}</div></button>`; }).join("")}</div></section>`; }
function renderLearnDetail(v) { const n = state.learned[v.id] || 0; return `<section class="panel wide detail-panel"><button class="text-button" data-back-learn>← 返回背词</button><span class="eyebrow">动词卡 · ${esc(v.zh)}</span><h1 style="font-size:58px">${esc(v.v1)}</h1><div class="big-forms"><span>现在时 <strong>${v.pres}</strong></span><span>过去时 <strong>${v.past}</strong></span><span>完成分词 <strong>${v.pp}</strong></span></div><div class="rule-box"><strong>固定搭配 / 记忆锚点</strong><p class="example">${esc(v.phrase)}</p></div><div class="four-sentences"><div><span>现在</span><code>Jeg ${v.pres} ${v.tail}.</code></div><div><span>情态</span><code>Jeg skal ${v.v1} ${v.tail}.</code></div><div><span>过去</span><code>Jeg ${v.past} ${v.tail}.</code></div><div><span>完成</span><code>Jeg har ${v.pp} ${v.tail}.</code></div></div><p class="muted">本词已标记：${n}次。连续两次选择“我会了”后，系统会降低新词出现频率，之后按间隔复习。</p><div class="actions"><button class="button orange" data-again-verb="${v.id}">再练这个词</button><button class="button primary" data-know-verb="${v.id}">我会了</button></div></section>`; }
function renderMistakes() { return `<section class="panel wide"><span class="eyebrow">Mine feil · 我的错误</span><h1 style="font-size:44px">错误会回来，直到你会。</h1>${state.mistakes.length ? `<div class="mistake-list">${[...state.mistakes].reverse().map(m => `<div class="mistake-item"><span class="tag">${esc(m.skill)}</span><h3 style="margin-top:10px">${esc(m.prompt)}</h3><div>你的答案：<code>${esc(m.given)}</code></div><div>建议答案：<code>${esc(m.answer)}</code></div><p class="muted">${esc(m.explanation)}</p></div>`).join("")}</div>` : `<div class="empty">还没有错题。做完训练后，系统会按技能自动收集。</div>`}</section>`; }
function renderSpeak() { return `<section class="panel wide center"><span class="eyebrow">Snakke · 口语模式</span><h1 style="font-size:44px">Hva skal du gjøre i morgen?</h1><p class="muted">浏览器支持语音识别时可以直接说；也可以输入文字。系统会检查你常犯的动词和语序问题。</p><button class="speak-button" data-speak aria-label="开始录音">●</button><p id="speech-status" class="muted">Trykk for å snakke</p><textarea id="speech-text" placeholder="识别结果会出现在这里，也可以直接输入。"></textarea><div class="actions" style="justify-content:center"><button class="button primary" data-check-speech>分析回答</button></div><div id="feedback" style="text-align:left"></div></section>`; }

function record(q, given, ok, answer, explanation) { if (state.session.answers[q.id]) return; state.session.answers[q.id] = { ok, given }; state.attempts++; if (ok) state.correct++; if (!ok) state.mistakes.push({ id: Date.now(), qid: q.id, skill: q.skill, prompt: q.prompt, given, answer, explanation }); saveState(); }
function feedback(kind, title, explanation, answer = "") { return `<div class="feedback ${kind}"><h3>${title}</h3>${answer ? `<div>建议：<code>${esc(answer)}</code></div>` : ""}<p>${esc(explanation)}</p><div class="actions"><button class="button primary" data-next>${state.session.index === state.session.total - 1 ? "查看总结" : "下一题"}</button></div></div>`; }
function structuredCheck(q, given) { const valid = q.answers || [q.answer]; const ok = valid.some(x => normalize(x) === normalize(given)); record(q, given, ok, valid[0], q.explanation); document.querySelector("#feedback").innerHTML = feedback(ok ? "good" : "bad", ok ? "✓ 正确" : "需要修改", q.explanation, ok ? "" : valid[0]); document.querySelector("[data-next]")?.addEventListener("click", nextQuestion); }
function analyze(text, q = null) {
  const lower = normalize(text); const issues = []; if (!lower) issues.push("请先写一句挪威语。");
  const badModal = /\b(skal|vil|kan|må|bør)\s+(\w+(?:er|r))\b/gi; let match; const base = { finner:"finne", snakker:"snakke", jobber:"jobbe", lærer:"lære", reiser:"reise", kjøper:"kjøpe", sier:"si", gjør:"gjøre", får:"få", går:"gå", tar:"ta" };
  while ((match = badModal.exec(lower))) issues.push(`在 ${match[1]} 后使用原形：${match[1]} ${base[match[2]] || match[2].replace(/r$/, "")}，不使用 ${match[2]}。`);
  if (/\bkan\s+å\b/i.test(lower)) issues.push("kan 后面不加 å：写成 kan + 动词原形。");
  if (/\bhar\s+(jobber|snakker|finner|går|tar|ser)\b/i.test(lower)) issues.push("har 后面应使用完成分词（第四形态），不能使用现在时。");
  if (/^(i morgen|neste (uke|år)|i går)\s+jeg\b/i.test(lower)) issues.push("时间放句首时，变位动词要在第二位：I morgen skal jeg …");
  if (/\bgikk på buss\b/i.test(lower)) issues.push("“坐公交”通常说 tok bussen，而不是 gikk på buss。");
  if (/\bkolleger mi\b/i.test(lower)) issues.push("复数所有结构应是 kollegene mine。");
  if (/\b(chjef|sjef) mi\b/i.test(lower)) issues.push("应写 sjefen min：定指名词 + 所有词。");
  if (q?.target && !lower.includes(q.target)) issues.push(`本题目标词是 ${q.target}，请确认你使用了它。`);
  return { ok: issues.length === 0, issues };
}
function freeCheck(q, text) { const result = analyze(text, q); const ok = result.ok; const explanation = ok ? "目标结构和已知常见错误检查通过。自然表达可能有多个正确答案，所以不会要求逐字一致。" : result.issues.join(" "); record(q, text, ok, q.example, explanation); document.querySelector("#feedback").innerHTML = `<div class="feedback ${ok ? "good" : "close"}"><h3>${ok ? "✓ 本地规则检查通过" : "接近正确，看看这些地方"}</h3>${result.issues.length ? `<ul>${result.issues.map(i => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}<p class="muted">本地规则不能判断所有自然度；复杂句可以接入AI或老师复核。</p><div class="actions"><button class="button primary" data-next>${state.session.index === state.session.total - 1 ? "查看总结" : "下一题"}</button></div></div>`; document.querySelector("[data-next]")?.addEventListener("click", nextQuestion); }
function nextQuestion() { state.session.index++; saveState(); if (state.session.index >= state.session.total) { const answers = Object.values(state.session.answers); state.lastSummary = { total: state.session.total, correct: answers.filter(x => x.ok).length, mistakes: answers.filter(x => !x.ok).length }; state.session = null; saveState(); location.hash = "summary"; } else render(); }
function startSession(total, onlyVerbId = null) { state.session = buildSession(total, onlyVerbId); saveState(); location.hash = "practice"; }
function startSpeech() { const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition; const status = document.querySelector("#speech-status"); if (!Recognition) { status.textContent = "当前浏览器不支持语音识别，请直接输入。"; return; } const rec = new Recognition(); rec.lang = "nb-NO"; rec.interimResults = false; status.textContent = "Lytter … 正在听"; rec.onresult = e => { document.querySelector("#speech-text").value = e.results[0][0].transcript; status.textContent = "识别完成，可以分析。"; }; rec.onerror = () => { status.textContent = "没有识别成功，请重试或直接输入。"; }; rec.start(); }

function bindView() {
  document.querySelector("[data-start]")?.addEventListener("click", () => { location.hash = state.session ? "practice" : "setup?n=10"; });
  document.querySelectorAll("[data-count]").forEach(b => b.addEventListener("click", () => { location.hash = `setup?n=${b.dataset.count}`; }));
  document.querySelector("[data-begin]")?.addEventListener("click", () => startSession(Number(document.querySelector("[data-begin]").dataset.begin)));
  document.querySelector("[data-back-today]")?.addEventListener("click", () => { location.hash = "today"; });
  document.querySelectorAll("[data-verb]").forEach(b => b.addEventListener("click", () => { location.hash = `learn?verb=${b.dataset.verb}`; }));
  document.querySelector("[data-back-learn]")?.addEventListener("click", () => { location.hash = "learn"; });
  document.querySelector("[data-know-verb]")?.addEventListener("click", () => { const id = document.querySelector("[data-know-verb]").dataset.knowVerb; state.learned[id] = (state.learned[id] || 0) + 1; saveState(); render(); });
  document.querySelector("[data-again-verb]")?.addEventListener("click", () => startSession(10, document.querySelector("[data-again-verb]").dataset.againVerb));
  document.querySelector("[data-go-learn]")?.addEventListener("click", () => { location.hash = "learn"; });
  document.querySelectorAll("[data-choice]").forEach(btn => btn.addEventListener("click", () => { document.querySelectorAll("[data-choice]").forEach(x => x.disabled = true); const q = currentQuestion(); const ok = (q.answers || [q.answer]).some(a => normalize(a) === normalize(btn.dataset.choice)); btn.classList.add(ok ? "correct" : "wrong"); if (!ok) document.querySelectorAll("[data-choice]").forEach(x => { if ((q.answers || [q.answer]).some(a => normalize(a) === normalize(x.dataset.choice))) x.classList.add("correct"); }); record(q, btn.dataset.choice, ok, (q.answers || [q.answer])[0], q.explanation); document.querySelector("#feedback").innerHTML = feedback(ok ? "good" : "bad", ok ? "✓ 正确" : "需要修改", q.explanation, ok ? "" : (q.answers || [q.answer])[0]); document.querySelector("[data-next]")?.addEventListener("click", nextQuestion); }));
  document.querySelector("[data-check]")?.addEventListener("click", () => structuredCheck(currentQuestion(), document.querySelector("#answer-input").value));
  document.querySelector("[data-check-free]")?.addEventListener("click", () => freeCheck(currentQuestion(), document.querySelector("#free-answer").value));
  document.querySelector("[data-example]")?.addEventListener("click", () => { const q = currentQuestion(); document.querySelector("#feedback").innerHTML = `<div class="feedback close"><h3>参考框架</h3><p class="example">${esc(q.example)}</p><p>参考答案不是唯一答案；先自己说，再比较结构。</p></div>`; });
  document.querySelector("[data-next]")?.addEventListener("click", nextQuestion);
  document.querySelector("[data-check-speech]")?.addEventListener("click", () => { const r = analyze(document.querySelector("#speech-text").value); document.querySelector("#feedback").innerHTML = `<div class="feedback ${r.ok ? "good" : "close"}"><h3>${r.ok ? "✓ 检查通过" : "可以这样改进"}</h3>${r.issues.length ? `<ul>${r.issues.map(i => `<li>${esc(i)}</li>`).join("")}</ul>` : "你的回答没有触发已知错误规则。"}</div>`; });
  document.querySelector("[data-speak]")?.addEventListener("click", startSpeech);
}

document.querySelector("#reset-day").addEventListener("click", () => { if (confirm("确定清除今日进度和错题吗？")) { state = { ...DEFAULT_STATE }; saveState(); location.hash = "today"; render(); } });
window.addEventListener("hashchange", render);
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
render();
