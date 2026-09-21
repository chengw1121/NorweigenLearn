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
  ["correction", "改错", .06], ["v2", "V2 语序", .06]
];
const DEFAULT_STATE = { mistakes: [], attempts: 0, correct: 0, streak: 1, learned: {}, session: null, vocabSession: null, lastSummary: null };
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
    ? ["form","modal","past","perfect","infinitive","collocation","correction","v2"]
    : total >= 8
      ? ["form","modal","past","perfect","infinitive","collocation","v2","correction"]
      : ["form","modal","past","perfect","collocation"];
  const counts = DISTRIBUTION.map(([type]) => ({ type, count: required.includes(type) ? 1 : 0 }));
  let left = total - required.length;
  const priority = ["form","modal","past","perfect","infinitive","collocation","v2","correction"];
  let i = 0; while (left-- > 0) { counts.find(x => x.type === priority[i % priority.length]).count++; i++; }
  return counts;
}
function answerChoices(verb, correct, extra = []) {
  const unique = [...new Set([verb.v1, verb.pres, verb.past, verb.pp, ...extra].filter(Boolean))];
  if (unique.length < 4) VERBS.forEach(other => { if (other.id !== verb.id && unique.length < 4 && !unique.includes(other.pres)) unique.push(other.pres); });
  if (!unique.includes(correct)) unique.unshift(correct);
  return shuffle(unique).slice(0, Math.min(4, unique.length));
}
function makeChoice(id, type, skill, prompt, verb, correct, explanation, details = {}) { return { id, type: "choice", skill, prompt, options: answerChoices(verb, correct), answer: correct, verbId: verb.id, explanation, ...details }; }
function makeQuestion(type, verb, serial) {
  const id = `${type}-${verb.id}-${serial}`;
  if (type === "form") return makeChoice(id, type, "动词四形", `Jeg ___ ${verb.tail}.`, verb, verb.pres, `这是普通现在时。普通“现在/平时做”使用 ${verb.pres}。`, { translation: `我每天/通常${verb.zh}（空格要填现在时）。`, correctSentence: `Jeg ${verb.pres} ${verb.tail}.`, answerTranslation: `我现在或平时${verb.zh}。`, rule: `普通现在时表示现在、习惯或一般事实。这个位置没有情态动词或 har，直接使用 presens：${verb.pres}。` });
  if (type === "modal") return makeChoice(id, type, "情态 + V1", `Jeg skal ___ ${verb.tail}.`, verb, verb.v1, `skal 已经承担了变形，后面直接用原形：skal + ${verb.v1}，不加 -r，也不加 å。`, { translation: `我打算/计划${verb.zh}。`, correctSentence: `Jeg skal ${verb.v1} ${verb.tail}.`, answerTranslation: `我打算${verb.zh}。`, rule: `skal、vil、kan、må、bør都是“老大动词”。它们后面使用V1原形，不加现在时的 -r，也不加 å。` });
  if (type === "past") return makeChoice(id, type, "过去时", `I går ___ jeg ${verb.tail}.`, verb, verb.past, `i går 表示明确过去时间，所以使用过去时：${verb.v1} – ${verb.pres} – ${verb.past}。`, { translation: `昨天我${verb.zh}。`, correctSentence: `I går ${verb.past} jeg ${verb.tail}.`, answerTranslation: `昨天我${verb.zh}。`, rule: `i går、forrige uke、i 2025等明确过去时间词，要求使用preteritum：${verb.past}。` });
  if (type === "perfect") return makeChoice(id, type, "har + 完成分词", `Jeg har ___ ${verb.tail}.`, verb, verb.pp, `har 后面使用完成分词（第四形态）：har + ${verb.pp}。`, { translation: `我已经${verb.zh}。`, correctSentence: `Jeg har ${verb.pp} ${verb.tail}.`, answerTranslation: `我已经${verb.zh}。`, rule: `现在完成时的结构是 har + perfektum partisipp。这里不能放现在时 ${verb.pres} 或过去时 ${verb.past}。` });
  if (type === "infinitive") return makeChoice(id, type, "å + V1", `Jeg liker å ___ ${verb.tail}.`, verb, verb.v1, `liker å 后面使用原形：liker å + ${verb.v1}。情态动词后才不加 å。`, { translation: `我喜欢${verb.zh}。`, correctSentence: `Jeg liker å ${verb.v1} ${verb.tail}.`, answerTranslation: `我喜欢${verb.zh}。`, rule: `liker、prøver、begynner、har lyst til等普通动词/结构后，另一个动作通常用 å + V1。` });
  if (type === "v2") return makeV2Question(serial);
  if (type === "collocation") {
    const c = COLLLOCATIONS[serial % COLLLOCATIONS.length];
    return { id, type: "choice", skill: "固定搭配", prompt: "选择自然表达：我昨天坐公交去上班。", options: shuffle(["Jeg tok bussen til jobb i går.", "Jeg gikk på buss til jobben i går.", "Jeg tok bussen på jobb i går.", "Jeg gikk bussen til jobb i går."]), answer: "Jeg tok bussen til jobb i går.", verbId: VERBS.find(v => v.v1 === "ta").id, explanation: `固定搭配是 ${c.no}。本题特别练习 ta – tar – tok – tatt 和 ta bussen。`, translation: "我昨天坐公交去上班。", correctSentence: "Jeg tok bussen til jobb i går.", answerTranslation: "我昨天坐公交去上班。", rule: "挪威语里‘坐公交/火车’使用 ta：ta bussen / ta toget。昨天要用过去时 tok。" };
  }
  if (type === "correction") return { id, type: "input", skill: "改错", prompt: `改正句子：Jeg skal ${verb.pres} ${verb.tail}.`, answers: [`Jeg skal ${verb.v1} ${verb.tail}.`], answer: `Jeg skal ${verb.v1} ${verb.tail}.`, verbId: verb.id, explanation: `错误在于 skal 后使用了现在时 ${verb.pres}。应改为原形：skal ${verb.v1}。`, translation: `改正：我打算${verb.zh}。`, correctSentence: `Jeg skal ${verb.v1} ${verb.tail}.`, answerTranslation: `我打算${verb.zh}。`, rule: `情态动词 skal 已经承担了时态和人称信息，后面的动作只用V1原形。` };
  return { id, type: "free", skill: "自由输出", prompt: `用挪威语写一句关于你自己的句子，使用：${verb.v1}。`, verbId: verb.id, target: verb.v1, example: `Jeg skal ${verb.v1} ${verb.tail}.`, translation: `用挪威语表达你自己的计划或愿望。`, correctSentence: `Jeg skal ${verb.v1} ${verb.tail}.`, answerTranslation: `我打算${verb.zh}。` };
}
function makeV2Question(serial) { return { id: `v2-${serial}`, type: "input", skill: "V2 语序", prompt: "把词语组成自然句子（时间可以放句首或句末）：I morgen / jeg / skal / jobbe", answers: ["I morgen skal jeg jobbe", "Jeg skal jobbe i morgen"], answer: "I morgen skal jeg jobbe", explanation: "两种语序都正确：I morgen + skal + jeg + jobbe，或 Jeg + skal + jobbe + i morgen。只有时间放句首时，变位动词必须在第二位。", translation: "我明天打算工作。", correctSentence: "I morgen skal jeg jobbe.", answerTranslation: "我明天打算工作。", rule: "挪威语主句遵守V2：如果时间放在句首，变位动词skal仍然必须是第二个成分。时间也可以放句末。" }; }
function buildSession(total, onlyVerbId = null) {
  const counts = countsFor(total); const pool = onlyVerbId ? [getVerb(onlyVerbId)] : shuffle(VERBS); let serial = Date.now(); const qs = [];
  counts.forEach(({ type, count }) => { for (let i = 0; i < count; i++) qs.push(makeQuestion(type, pool[(qs.length + i) % pool.length], serial++)); });
  return { questions: shuffle(qs), index: 0, answers: {}, total };
}

function render() {
  document.querySelectorAll("[data-route]").forEach(a => a.classList.toggle("active", a.dataset.route === route()));
  document.body.classList.toggle("focus-mode", ["learnstudy", "practice"].includes(route()));
  if (route() === "learn" && query().get("verb")) { document.querySelector("#app").innerHTML = renderLearnDetail(getVerb(query().get("verb"))); bindView(); return; }
  const views = { today: renderToday, setup: renderSetup, practice: renderPractice, summary: renderSummary, verbs: renderVerbs, learn: renderLearn, learnstudy: renderLearnStudy, mistakes: renderMistakes, speak: renderSpeak };
  document.querySelector("#app").innerHTML = (views[route()] || renderToday)(); bindView();
}
function progressForSkill(skill) { return Math.max(25, 78 - state.mistakes.filter(m => m.skill === skill).length * 7); }
function renderToday() {
  const s = state.session; const done = s ? Object.keys(s.answers || {}).length : 0; const total = s?.total || 0; const pct = total ? Math.round(done / total * 100) : 0;
  return `<section class="hero"><div class="hero-main"><div class="eyebrow">Dagens økt · 今日训练</div><h1>练到开口时<br>不再犹豫。</h1><p>先选择题量，系统会按学习目标分配题型。每个动词会在四形、情态、过去、完成和固定搭配中反复出现。</p><button class="button primary" data-start>${s ? "继续今日训练" : "选择题量并开始"}</button></div><aside class="hero-side"><div><span class="streak">${state.streak}<small>天连续学习 · streak</small></span></div><div><div class="metric-head"><strong>${s ? "本次进度" : "准备开始"}</strong><span>${s ? `${done}/${total}` : "5–30题"}</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div></aside></section><section class="grid"><article class="panel"><span class="tag">弱项雷达</span><h2 style="margin-top:12px">你的四个盒子</h2><div class="metric-row">${["动词四形","情态 + V1","过去时","har + 完成分词","V2 语序"].map(skill => `<div><div class="metric-head"><strong>${skill}</strong><span>${progressForSkill(skill)}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${progressForSkill(skill)}%"></div></div></div>`).join("")}</div></article><article class="panel"><span class="tag">科学分配</span><h2 style="margin-top:12px">每次都练完整链条</h2><p class="muted">先识别形态，再放进情境，最后用固定搭配和复习迁移。错题会回到你的错误库，不会只出现一次。</p><div class="rule-box"><strong>四句话记一个词：</strong><br><span class="example">Jeg jobber. · Jeg skal jobbe. · Jeg jobbet. · Jeg har jobbet.</span></div></article></section>`;
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
  const savedFeedback = answered ? detailedFeedback(q, answered.ok ? "good" : "bad", answered.ok ? "✓ 已答对" : "已记录错题", answered.given) : "";
  return `<section class="question-card"><div class="question-meta"><span>${esc(q.skill)} · ${state.session.index + 1}/${state.session.total}</span><span>第${state.session.index + 1}题</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><div class="prompt">${esc(q.prompt)}</div>${q.translation ? `<div class="prompt-translation"><strong>中文提示：</strong>${esc(q.translation)}</div>` : ""}${ui}<div id="feedback">${savedFeedback}</div></section>`;
}
function renderSummary() { const sum = state.lastSummary || { correct: 0, total: 0, mistakes: 0 }; return `<section class="panel center summary-panel"><span class="eyebrow">Økt ferdig · 本次完成</span><h1 style="font-size:48px">做得很好。</h1><div class="summary-score">${sum.correct}<small>/${sum.total} 正确</small></div><p class="muted">${sum.mistakes ? `有${sum.mistakes}道题进入错误库，下一次会优先复习。` : "本次没有新增错题。"}</p><div class="actions" style="justify-content:center"><button class="button primary" data-start>再练一次</button><button class="button secondary" data-go-learn>去背词</button></div></section>`; }
function renderVerbs() { return `<section class="panel wide"><span class="eyebrow">Verb · 动词四形</span><h1 style="font-size:44px">四个形态，整组记。</h1><p class="muted">原形 – 现在时 – 过去时 – 完成分词。点击任意动词进入背词卡。</p><div class="verb-list">${VERBS.map(v => `<button class="verb-row verb-button" data-verb="${v.id}"><div class="verb-forms">${v.v1} – ${v.pres} – ${v.past} – ${v.pp}</div><div class="translation">${v.zh} · <span class="example">${v.phrase}</span></div></button>`).join("")}</div></section>`; }
function renderLearn() { const learnedCount = Object.values(state.learned).filter(x => x >= 2).length; return `<section class="panel wide"><span class="eyebrow">Lær · 背词模块</span><h1 style="font-size:44px">不是看一眼，是回忆出来。</h1><p class="muted">每张卡先只给中文和原形。你要先回忆现在时、过去时和完成分词，再显示答案、听读音、朗读四句话。每次只学5个，第二天再间隔复习。</p><div class="learn-actions"><button class="button primary" data-study="5">开始今日5词记忆</button><button class="button secondary" data-study="10">进行10词复习</button></div><div class="learn-progress"><strong>${learnedCount}/${VERBS.length}</strong><span>个动词达到“会了”两次</span><div class="progress-track"><div class="progress-fill" style="width:${Math.round(learnedCount / VERBS.length * 100)}%"></div></div></div><h3>动词库 · 点击可查看完整卡片</h3><div class="learn-grid">${VERBS.map(v => { const n = state.learned[v.id] || 0; return `<button class="learn-card" data-verb="${v.id}"><div class="learn-card-top"><strong>${v.v1}</strong><span>${n ? `复习${n}次` : "新词"}</span></div><div>${v.zh}</div><div class="learn-forms">${v.pres} · ${v.past} · ${v.pp}</div></button>`; }).join("")}</div></section>`; }
function renderInlineKeyboard() {
  const rows = [["q","w","e","r","t","y","u","i","o","p"], ["a","s","d","f","g","h","j","k","l"], ["z","x","c","v","b","n","m"], ["æ","ø","å"]];
  return `<div class="keyboard-label">点击下方键盘输入 · 不会打开手机键盘</div><div class="inline-keyboard" aria-label="挪威语内嵌键盘">${rows.map(row => `<div class="keyboard-row">${row.map(key => `<button class="key-button" data-key="${key}" type="button">${key}</button>`).join("")}</div>`).join("")}<div class="keyboard-row keyboard-tools"><button class="key-button utility" data-key="backspace" type="button">⌫ 删除</button><button class="key-button utility" data-key="clear" type="button">清空</button></div></div>`;
}
function renderLearnStudy() {
  const s = state.vocabSession; if (!s || !s.ids.length) return renderLearn(); const v = getVerb(s.ids[s.index]);
  if (!s.revealed) {
    const fields = [{ key: "pres", label: "现在时", hint: "表示现在或习惯" }, { key: "past", label: "过去时", hint: "表示已经发生" }, { key: "pp", label: "完成分词", hint: "放在 har 后面" }];
    const step = Math.min(s.recallStep || 0, fields.length - 1); const field = fields[step];
    const value = s.recallValues?.[field.key] || "";
    return `<section class="question-card vocab-card"><div class="study-topline"><div><span class="eyebrow">背词回忆</span><strong>先回忆，再看答案</strong></div><span class="study-counter">${s.index + 1}/${s.ids.length}</span></div><div class="study-progress">${fields.map((item, i) => `<span class="${i < step ? "done" : i === step ? "current" : ""}">${i + 1} ${item.label}</span>`).join("")}</div><div class="vocab-front"><span class="eyebrow">目标词 · 原形</span><h1>${esc(v.v1)}</h1><p class="vocab-meaning">${esc(v.zh)}</p><p class="muted">搭配提示：<span class="example">${esc(v.phrase)}</span></p></div><div class="recall-step"><div class="recall-step-head"><span>第 ${step + 1} / 3 项</span><strong>${field.label}</strong><small>${field.hint}</small></div><input id="vocab-current" class="custom-answer" value="${esc(value)}" autocomplete="off" autocapitalize="none" spellcheck="false" inputmode="none" readonly aria-label="${field.label}" placeholder="写出 ${field.label} …"><p class="recall-help">先凭记忆，再点击下方键盘输入；系统键盘不会弹出。</p>${renderInlineKeyboard()}</div><div class="actions vocab-actions"><button class="button primary" data-vocab-step>${step === 2 ? "检查并显示答案" : "下一项"}</button><button class="button secondary" data-vocab-reveal>直接显示答案</button></div></section>`;
  }
  const result = s.lastResult; return `<section class="question-card vocab-card"><div class="question-meta"><span>背词反馈 · ${s.index + 1}/${s.ids.length}</span><span>跟读四句话</span></div><div class="vocab-front"><span class="eyebrow">${esc(v.zh)}</span><h1>${esc(v.v1)}</h1></div>${result ? `<div class="feedback ${result.ok ? "good" : "close"}"><h3>${result.ok ? "✓ 三种形式都对了" : "有形式需要再记一次"}</h3><p>${result.message}</p></div>` : ""}<div class="big-forms"><span>现在时 <strong>${esc(v.pres)}</strong></span><span>过去时 <strong>${esc(v.past)}</strong></span><span>完成分词 <strong>${esc(v.pp)}</strong></span></div><div class="four-sentences"><div><span>现在</span><code>Jeg ${esc(v.pres)} ${esc(v.tail)}.</code><button class="sound-button" data-say="Jeg ${esc(v.pres)} ${esc(v.tail)}." type="button">🔊 听一遍</button></div><div><span>情态</span><code>Jeg skal ${esc(v.v1)} ${esc(v.tail)}.</code><button class="sound-button" data-say="Jeg skal ${esc(v.v1)} ${esc(v.tail)}." type="button">🔊 听一遍</button></div><div><span>过去</span><code>Jeg ${esc(v.past)} ${esc(v.tail)}.</code><button class="sound-button" data-say="Jeg ${esc(v.past)} ${esc(v.tail)}." type="button">🔊 听一遍</button></div><div><span>完成</span><code>Jeg har ${esc(v.pp)} ${esc(v.tail)}.</code><button class="sound-button" data-say="Jeg har ${esc(v.pp)} ${esc(v.tail)}." type="button">🔊 听一遍</button></div></div><div class="memory-tip"><strong>现在做一次主动回忆</strong><span>合上答案，自己说出四个形式和四句话。</span></div><div class="actions"><button class="button orange" data-vocab-retry>再来一次</button><button class="button primary" data-vocab-know>我记住了，下一词</button></div></section>`;
}
function renderLearnDetail(v) { const n = state.learned[v.id] || 0; return `<section class="panel wide detail-panel"><button class="text-button" data-back-learn>← 返回背词</button><span class="eyebrow">动词卡 · ${esc(v.zh)}</span><h1 style="font-size:58px">${esc(v.v1)}</h1><div class="big-forms"><span>现在时 <strong>${v.pres}</strong></span><span>过去时 <strong>${v.past}</strong></span><span>完成分词 <strong>${v.pp}</strong></span></div><div class="rule-box"><strong>固定搭配 / 记忆锚点</strong><p class="example">${esc(v.phrase)}</p></div><div class="four-sentences"><div><span>现在</span><code>Jeg ${v.pres} ${v.tail}.</code></div><div><span>情态</span><code>Jeg skal ${v.v1} ${v.tail}.</code></div><div><span>过去</span><code>Jeg ${v.past} ${v.tail}.</code></div><div><span>完成</span><code>Jeg har ${v.pp} ${v.tail}.</code></div></div><p class="muted">本词已标记：${n}次。连续两次选择“我会了”后，系统会降低新词出现频率，之后按间隔复习。</p><div class="actions"><button class="button orange" data-again-verb="${v.id}">再练这个词</button><button class="button primary" data-know-verb="${v.id}">我会了</button></div></section>`; }
function renderMistakes() { return `<section class="panel wide"><span class="eyebrow">Mine feil · 我的错误</span><h1 style="font-size:44px">错误会回来，直到你会。</h1>${state.mistakes.length ? `<div class="mistake-list">${[...state.mistakes].reverse().map(m => `<div class="mistake-item"><span class="tag">${esc(m.skill)}</span><h3 style="margin-top:10px">${esc(m.prompt)}</h3><div>你的答案：<code>${esc(m.given)}</code></div><div>建议答案：<code>${esc(m.answer)}</code></div><p class="muted">${esc(m.explanation)}</p></div>`).join("")}</div>` : `<div class="empty">还没有错题。做完训练后，系统会按技能自动收集。</div>`}</section>`; }
function renderSpeak() { return `<section class="panel wide center"><span class="eyebrow">Snakke · 口语模式</span><h1 style="font-size:44px">Hva skal du gjøre i morgen?</h1><p class="muted">浏览器支持语音识别时可以直接说；也可以输入文字。系统会检查你常犯的动词和语序问题。</p><button class="speak-button" data-speak aria-label="开始录音">●</button><p id="speech-status" class="muted">Trykk for å snakke</p><textarea id="speech-text" placeholder="识别结果会出现在这里，也可以直接输入。"></textarea><div class="actions" style="justify-content:center"><button class="button primary" data-check-speech>分析回答</button></div><div id="feedback" style="text-align:left"></div></section>`; }

function record(q, given, ok, answer, explanation) { if (state.session.answers[q.id]) return; state.session.answers[q.id] = { ok, given }; state.attempts++; if (ok) state.correct++; if (!ok) state.mistakes.push({ id: Date.now(), qid: q.id, skill: q.skill, prompt: q.prompt, given, answer, explanation }); saveState(); }
function speakNorwegian(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = "nb-NO"; utterance.rate = .82; window.speechSynthesis.speak(utterance);
}
function detailedFeedback(q, kind, title, given = "") {
  const answer = (q.answers || [q.answer])[0]; const verb = q.verbId ? getVerb(q.verbId) : null;
  const forms = verb ? `<div class="form-strip"><span>${verb.v1}</span><span>${verb.pres}</span><span>${verb.past}</span><span>${verb.pp}</span></div>` : "";
  const givenBlock = given ? `<div class="answer-compare"><span>你的答案</span><code>${esc(given)}</code></div>` : "";
  return `<div class="feedback ${kind}"><h3>${title}</h3>${givenBlock}<div class="explain-block"><strong>中文意思</strong><p>${esc(q.translation || "请根据上下文理解这句话。")}</p></div><div class="explain-block"><strong>完整正确句</strong><p class="example">${esc(q.correctSentence || answer)} <button class="sound-button" data-say="${esc(q.correctSentence || answer)}" type="button">🔊 播放发音</button></p><p class="muted">${esc(q.answerTranslation || "")}</p></div><div class="explain-block"><strong>为什么这样用</strong><p>${esc(q.rule || q.explanation || "")}</p><p class="muted">${esc(q.explanation || "")}</p></div>${forms ? `<div class="explain-block"><strong>这个动词的四形</strong>${forms}</div>` : ""}<div class="memory-tip"><strong>记忆动作</strong><span>大声跟读完整句两遍，再自己替换一个词重新说一遍。</span></div><div class="actions"><button class="button primary" data-next>${state.session.index === state.session.total - 1 ? "查看总结" : "下一题"}</button></div></div>`;
}
function structuredCheck(q, given) { const valid = q.answers || [q.answer]; const ok = valid.some(x => normalize(x) === normalize(given)); record(q, given, ok, valid[0], q.explanation); document.querySelector("#feedback").innerHTML = detailedFeedback(q, ok ? "good" : "bad", ok ? "✓ 正确，但请看讲解" : "需要修改 · 这道题的规则", given); document.querySelector("[data-next]")?.addEventListener("click", nextQuestion); document.querySelectorAll("[data-say]").forEach(b => b.addEventListener("click", () => speakNorwegian(b.dataset.say))); }
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
function freeCheck(q, text) { const result = analyze(text, q); const ok = result.ok; const explanation = ok ? "目标结构和已知常见错误检查通过。" : result.issues.join(" "); record(q, text, ok, q.example, explanation); document.querySelector("#feedback").innerHTML = detailedFeedback(q, ok ? "good" : "close", ok ? "✓ 本地规则检查通过" : "接近正确，看看这些地方", text); document.querySelector("[data-next]")?.addEventListener("click", nextQuestion); document.querySelectorAll("[data-say]").forEach(b => b.addEventListener("click", () => speakNorwegian(b.dataset.say))); }
function nextQuestion() { state.session.index++; saveState(); if (state.session.index >= state.session.total) { const answers = Object.values(state.session.answers); state.lastSummary = { total: state.session.total, correct: answers.filter(x => x.ok).length, mistakes: answers.filter(x => !x.ok).length }; state.session = null; saveState(); location.hash = "summary"; } else render(); }
function startSession(total, onlyVerbId = null) { state.session = buildSession(total, onlyVerbId); saveState(); location.hash = "practice"; }
function startVocabSession(total) {
  const due = shuffle(VERBS.filter(v => (state.learned[v.id] || 0) < 2)); const review = shuffle(VERBS.filter(v => (state.learned[v.id] || 0) >= 2));
  state.vocabSession = { ids: [...due, ...review].slice(0, total).map(v => v.id), index: 0, revealed: false, recallStep: 0, recallValues: {}, lastResult: null }; saveState(); location.hash = "learnstudy";
}
function advanceVocabStep() {
  const s = state.vocabSession; const v = getVerb(s.ids[s.index]); const keys = ["pres", "past", "pp"]; const input = document.querySelector("#vocab-current"); const value = input?.value || "";
  if (!value.trim()) { input?.classList.add("input-error"); input?.focus(); return; }
  const recallValues = { ...(s.recallValues || {}), [keys[Math.min(s.recallStep || 0, 2)]]: value };
  if ((s.recallStep || 0) < 2) { s.recallValues = recallValues; s.recallStep = (s.recallStep || 0) + 1; saveState(); render(); requestAnimationFrame(() => { const next = document.querySelector("#vocab-current"); next?.focus(); next?.scrollIntoView({ block: "center", behavior: "smooth" }); }); return; }
  const values = keys.map(key => recallValues[key] || ""); const expected = [v.pres, v.past, v.pp]; const correct = values.map((x, i) => normalize(x) === normalize(expected[i]));
  s.recallValues = recallValues;
  s.revealed = true; s.lastResult = { ok: correct.every(Boolean), message: correct.every(Boolean) ? "现在时、过去时和完成分词都正确。现在请大声读四句话。" : `现在时${correct[0] ? "✓" : "✗"}，过去时${correct[1] ? "✓" : "✗"}，完成分词${correct[2] ? "✓" : "✗"}。先看正确形式，再遮住答案重新回忆。` }; saveState(); render();
}
function finishVocabCard() { const s = state.vocabSession; const id = s.ids[s.index]; state.learned[id] = (state.learned[id] || 0) + 1; s.index++; s.revealed = false; s.recallStep = 0; s.recallValues = {}; s.lastResult = null; if (s.index >= s.ids.length) { state.vocabSession = null; location.hash = "learn"; } saveState(); render(); }
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
  document.querySelectorAll("[data-study]").forEach(b => b.addEventListener("click", () => startVocabSession(Number(b.dataset.study))));
  document.querySelector("[data-vocab-step]")?.addEventListener("click", advanceVocabStep);
  document.querySelectorAll("[data-key]").forEach(b => b.addEventListener("click", () => {
    const input = document.querySelector("#vocab-current"); if (!input) return;
    const key = b.dataset.key;
    if (key === "backspace") input.value = input.value.slice(0, -1);
    else if (key === "clear") input.value = "";
    else input.value += key;
    input.classList.remove("input-error");
    const s = state.vocabSession; const keys = ["pres", "past", "pp"]; if (s) s.recallValues = { ...(s.recallValues || {}), [keys[Math.min(s.recallStep || 0, 2)]]: input.value };
    saveState();
  }));
  document.querySelector("[data-vocab-reveal]")?.addEventListener("click", () => { state.vocabSession.revealed = true; state.vocabSession.recallStep = 0; state.vocabSession.recallValues = {}; state.vocabSession.lastResult = null; saveState(); render(); });
  document.querySelector("[data-vocab-retry]")?.addEventListener("click", () => { state.vocabSession.revealed = false; state.vocabSession.recallStep = 0; state.vocabSession.recallValues = {}; state.vocabSession.lastResult = null; saveState(); render(); });
  document.querySelector("[data-vocab-know]")?.addEventListener("click", finishVocabCard);
  document.querySelectorAll("[data-choice]").forEach(btn => btn.addEventListener("click", () => { document.querySelectorAll("[data-choice]").forEach(x => x.disabled = true); const q = currentQuestion(); const ok = (q.answers || [q.answer]).some(a => normalize(a) === normalize(btn.dataset.choice)); btn.classList.add(ok ? "correct" : "wrong"); if (!ok) document.querySelectorAll("[data-choice]").forEach(x => { if ((q.answers || [q.answer]).some(a => normalize(a) === normalize(x.dataset.choice))) x.classList.add("correct"); }); record(q, btn.dataset.choice, ok, (q.answers || [q.answer])[0], q.explanation); document.querySelector("#feedback").innerHTML = detailedFeedback(q, ok ? "good" : "bad", ok ? "✓ 正确，但请看讲解" : "需要修改 · 这道题的规则", btn.dataset.choice); document.querySelector("[data-next]")?.addEventListener("click", nextQuestion); document.querySelectorAll("[data-say]").forEach(b => b.addEventListener("click", () => speakNorwegian(b.dataset.say))); }));
  document.querySelector("[data-check]")?.addEventListener("click", () => structuredCheck(currentQuestion(), document.querySelector("#answer-input").value));
  document.querySelector("[data-check-free]")?.addEventListener("click", () => freeCheck(currentQuestion(), document.querySelector("#free-answer").value));
  document.querySelector("[data-example]")?.addEventListener("click", () => { const q = currentQuestion(); document.querySelector("#feedback").innerHTML = `<div class="feedback close"><h3>参考框架</h3><p class="example">${esc(q.example)}</p><p>参考答案不是唯一答案；先自己说，再比较结构。</p></div>`; });
  document.querySelector("[data-next]")?.addEventListener("click", nextQuestion);
  document.querySelector("[data-check-speech]")?.addEventListener("click", () => { const r = analyze(document.querySelector("#speech-text").value); document.querySelector("#feedback").innerHTML = `<div class="feedback ${r.ok ? "good" : "close"}"><h3>${r.ok ? "✓ 检查通过" : "可以这样改进"}</h3>${r.issues.length ? `<ul>${r.issues.map(i => `<li>${esc(i)}</li>`).join("")}</ul>` : "你的回答没有触发已知错误规则。"}</div>`; });
  document.querySelector("[data-speak]")?.addEventListener("click", startSpeech);
  document.querySelectorAll("[data-say]").forEach(b => b.addEventListener("click", () => speakNorwegian(b.dataset.say)));
}

document.querySelector("#reset-day").addEventListener("click", () => { if (confirm("确定清除今日进度和错题吗？")) { state = { ...DEFAULT_STATE }; saveState(); location.hash = "today"; render(); } });
window.addEventListener("hashchange", render);
let lastScrollY = window.scrollY;
window.addEventListener("scroll", () => {
  const nav = document.querySelector(".bottom-nav"); if (!nav) return;
  const currentY = window.scrollY;
  if (currentY > 70 && currentY > lastScrollY + 6) nav.classList.add("nav-hidden");
  if (currentY < lastScrollY - 6 || currentY <= 30) nav.classList.remove("nav-hidden");
  lastScrollY = currentY;
}, { passive: true });
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
render();
