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

const NOUNS = [
  ["dag","en","dag","dagen","dager","dagene","天","Hver dag lærer jeg litt norsk.","每天我学一点挪威语。"],
  ["tid","ei","tid","tida","tider","tidene","时间","Jeg har tid i dag.","我今天有时间。"],
  ["hjem","et","hjem","hjemmet","hjem","hjemmene","家","Jeg går hjem etter jobb.","下班后我回家。"],
  ["jobb","en","jobb","jobben","jobber","jobbene","工作","Jeg går på jobb om morgenen.","我早上去上班。"],
  ["mat","—","mat","maten","—","—","食物","Vi lager mat hjemme.","我们在家做饭。"],
  ["vann","—","vann","vannet","—","—","水","Jeg drikker vann hver dag.","我每天喝水。"],
  ["familie","en","familie","familien","familier","familiene","家庭","Familien min bor i Norge.","我的家人住在挪威。"],
  ["barn","et","barn","barnet","barn","barna","孩子","Barnet leser en bok.","孩子在读一本书。"],
  ["venn","en","venn","vennen","venner","vennene","朋友","Jeg snakker med en venn.","我和一个朋友聊天。"],
  ["mor","ei","mor","mora","mødre","mødrene","妈妈","Mora mi lager middag.","我妈妈做晚饭。"],
  ["far","en","far","faren","fedre","fedrene","爸爸","Faren min jobber i Oslo.","我爸爸在奥斯陆工作。"],
  ["mann","en","mann","mannen","menn","mennene","男人；丈夫","En mann venter på bussen.","一个男人在等公交车。"],
  ["kvinne","ei","kvinne","kvinna","kvinner","kvinnene","女人","Kvinnen snakker norsk.","这位女士说挪威语。"],
  ["navn","et","navn","navnet","navn","navnene","名字","Hva er navnet ditt?","你叫什么名字？"],
  ["hus","et","hus","huset","hus","husene","房子","De bor i et stort hus.","他们住在一栋大房子里。"],
  ["leilighet","en","leilighet","leiligheten","leiligheter","leilighetene","公寓","Vi har ei lita leilighet.","我们有一套小公寓。"],
  ["rom","et","rom","rommet","rom","rommene","房间","Barnet er på rommet sitt.","孩子在自己的房间里。"],
  ["kjøkken","et","kjøkken","kjøkkenet","kjøkken","kjøkkenene","厨房","Kjøkkenet er lite.","厨房很小。"],
  ["seng","ei","seng","senga","senger","sengene","床","Senga står på soverommet.","床在卧室里。"],
  ["bord","et","bord","bordet","bord","bordene","桌子","Boka ligger på bordet.","书在桌子上。"],
  ["stol","en","stol","stolen","stoler","stolene","椅子","Jeg sitter på en stol.","我坐在椅子上。"],
  ["dør","ei","dør","døra","dører","dørene","门","Lukk døra, takk.","请把门关上。"],
  ["brød","et","brød","brødet","brød","brødene","面包","Jeg kjøper brød på butikken.","我在商店买面包。"],
  ["melk","—","melk","melken","—","—","牛奶","Barnet drikker melk.","孩子喝牛奶。"],
  ["kaffe","en","kaffe","kaffen","kaffer","kaffene","咖啡","Vil du ha en kopp kaffe?","你想喝一杯咖啡吗？"],
  ["butikk","en","butikk","butikken","butikker","butikkene","商店","Jeg går til butikken.","我去商店。"],
  ["penger","—","penger","pengene","—","—","钱","Jeg betaler med penger.","我用钱付款。"],
  ["frokost","en","frokost","frokosten","frokoster","frokostene","早餐","Vi spiser frokost klokka sju.","我们七点吃早餐。"],
  ["uke","ei","uke","uka","uker","ukene","星期；周","Jeg lærer norsk hver uke.","我每周学挪威语。"],
  ["morgen","en","morgen","morgenen","morgener","morgenene","早晨","Om morgenen drikker jeg kaffe.","早晨我喝咖啡。"],
  ["kveld","en","kveld","kvelden","kvelder","kveldene","晚上","Vi leser om kvelden.","我们晚上读书。"],
  ["år","et","år","året","år","årene","年","Jeg har bodd her i fem år.","我在这里住了五年。"],
  ["lege","en","lege","legen","leger","legene","医生","Jeg skal snakke med legen.","我准备和医生谈谈。"],
  ["apotek","et","apotek","apoteket","apotek","apotekene","药房","Apoteket ligger nær hjemmet.","药房在家附近。"],
  ["medisin","en","medisin","medisinen","medisiner","medisinene","药","Hun tar medisinen hver dag.","她每天吃药。"],
  ["hode","et","hode","hodet","hoder","hodene","头","Jeg har vondt i hodet.","我头疼。"],
  ["buss","en","buss","bussen","busser","bussene","公交车","Jeg tar bussen til jobb.","我坐公交去上班。"],
  ["bil","en","bil","bilen","biler","bilene","汽车","Vi kjører bil til byen.","我们开车去城里。"],
  ["tog","et","tog","toget","tog","togene","火车","Toget kommer klokka åtte.","火车八点到。"],
  ["billett","en","billett","billetten","billetter","billettene","票","Jeg kjøper en billett.","我买一张票。"],
  ["by","en","by","byen","byer","byene","城市","Oslo er en stor by.","奥斯陆是一座大城市。"],
  ["skole","en","skole","skolen","skoler","skolene","学校","Barnet går på skolen.","孩子去上学。"],
  ["bok","ei","bok","boka","bøker","bøkene","书","Jeg leser ei bok på norsk.","我读一本挪威语书。"],
  ["ord","et","ord","ordet","ord","ordene","单词","Jeg lærer fem nye ord.","我学五个新单词。"],
  ["språk","et","språk","språket","språk","språkene","语言","Norsk er et fint språk.","挪威语是一门很美的语言。"],
  ["lærer","en","lærer","læreren","lærere","lærerne","老师","Læreren hjelper elevene.","老师帮助学生们。"]
].map(([id,gender,lemma,definite,plural,pluralDefinite,zh,sentence,sentenceZh]) => ({ id, gender, lemma, zh, sentence, sentenceZh, forms: [gender === "—" ? lemma : `${gender} ${lemma}`, definite, plural, pluralDefinite], formLabels: id === "penger" ? ["复数", "定指复数", "—", "—"] : gender === "—" ? ["无冠词形式", "定指形式", "复数", "定指复数"] : ["不定单数", "定指单数", "不定复数", "定指复数"], phrase: "", kind: "noun" }));

const VOCAB_TOPICS = [
  { id: "basics", title: "日常基础", level: "A1 · 入门高频", icon: "☀", description: "先掌握每天都会用到的动词和生活词。", verbs: ["være","ha","gjøre","gå","komme","ta","få","bli"], nouns: ["dag","tid","hjem","jobb","mat","vann"], story: "Hver dag står jeg opp, spiser frokost og går på jobb. Om kvelden er jeg hjemme og lærer norsk.", storyZh: "每天我起床、吃早餐、去上班。晚上我在家学习挪威语。" },
  { id: "people", title: "家庭与人物", level: "A1 · 家人朋友", icon: "♡", description: "用常见人称和关系词说自己的生活。", verbs: ["snakke","bo","hjelpe","se","spørre","fortelle","møte"], nouns: ["familie","barn","venn","mor","far","mann","kvinne","navn"], story: "Familien min bor i Norge. Jeg snakker norsk med en venn og forteller om barna mine.", storyZh: "我的家人住在挪威。我和一位朋友说挪威语，也聊聊我的孩子。" },
  { id: "home", title: "家与房间", level: "A1 · 居家生活", icon: "⌂", description: "从家里的物品开始，练位置和日常动作。", verbs: ["bo","sitte","stå","ligge","sette","legge","vaske"], nouns: ["hus","leilighet","rom","kjøkken","seng","bord","stol","dør"], story: "Boka ligger på bordet. Jeg setter meg på en stol og leser i stua.", storyZh: "书在桌子上。我坐到椅子上，在客厅里读书。" },
  { id: "food", title: "食物与购物", level: "A1 · 吃饭买东西", icon: "⌑", description: "把食物词放进买东西、做饭和用餐的句子。", verbs: ["spise","drikke","lage","kjøpe","betale","like","prøve"], nouns: ["brød","melk","kaffe","butikk","penger","frokost","mat","vann"], story: "Jeg kjøper brød og melk på butikken. Hjemme lager jeg frokost og drikker kaffe.", storyZh: "我在商店买面包和牛奶。回家后我做早餐、喝咖啡。" },
  { id: "time", title: "时间与日常", level: "A1 · 时间表达", icon: "◷", description: "学习安排一天、一周和日常习惯。", verbs: ["begynne","slutte","vente","huske","glemme","jobbe","lære"], nouns: ["uke","morgen","kveld","år","dag","tid","jobb"], story: "Om morgenen jobber jeg. Om kvelden øver jeg norsk, og hver uke lærer jeg nye ord.", storyZh: "早上我工作。晚上我练习挪威语，每周学习新词。" },
  { id: "health", title: "健康与看医生", level: "A2 · 健康生活", icon: "+", description: "掌握看医生、药房和身体状况的基本表达。", verbs: ["trenge","få","ta","hjelpe","gå","si","vente"], nouns: ["lege","apotek","medisin","hode","tid","dag"], story: "Jeg har vondt i hodet. Jeg ringer legen, går til apoteket og henter medisinen.", storyZh: "我头疼。我给医生打电话，去药房取药。" },
  { id: "travel", title: "交通与出行", level: "A1 · 城市出行", icon: "↗", description: "把交通名词和常用出行动词一起记。", verbs: ["reise","kjøre","gå","ta","komme","finne","vente"], nouns: ["buss","bil","tog","billett","by","tid","hjem"], story: "Jeg kjøper en billett, tar toget til byen og går hjem om kvelden.", storyZh: "我买一张票，坐火车进城，晚上走回家。" },
  { id: "study", title: "学习与工作", level: "A1–A2 · 我的目标", icon: "✎", description: "围绕挪威语学习、课程和工作表达。", verbs: ["jobbe","lære","øve","lese","skrive","søke","forstå","vite"], nouns: ["skole","bok","ord","språk","lærer","jobb","tid"], story: "Jeg går på norskkurs. Læreren hjelper meg, og jeg leser ei bok og skriver nye ord.", storyZh: "我去上挪威语课。老师帮助我，我读一本书并写下新单词。" }
];

const NOUN_BY_ID = Object.fromEntries(NOUNS.map(noun => [noun.id, noun]));
function topicEntries(topicId) {
  const topic = VOCAB_TOPICS.find(item => item.id === topicId) || VOCAB_TOPICS[0];
  const verbs = topic.verbs.map(name => { const v = VERBS.find(item => item.v1 === name); return v ? { ...v, kind: "verb", key: v.id } : null; }).filter(Boolean);
  const nouns = topic.nouns.map(id => NOUN_BY_ID[id]).filter(Boolean).map(noun => ({ ...noun, key: `noun:${noun.id}` }));
  const mixed = []; for (let i = 0; i < Math.max(verbs.length, nouns.length); i++) { if (verbs[i]) mixed.push(verbs[i]); if (nouns[i]) mixed.push(nouns[i]); }
  return mixed;
}
function getStudyEntry(key) { return key.startsWith("noun:") ? NOUN_BY_ID[key.slice(5)] : VERBS.find(v => v.id === key) || VERBS[0]; }
function entryFields(entry) {
  if (entry.kind === "noun") return entry.forms.map((answer, i) => ({ key: `form${i}`, answer, label: entry.formLabels[i], hint: ["把冠词和名词当成一个词记", "留意定指词尾 -en / -a / -et", "留意复数词尾", "复数定指常见 -ene / -a"][i] })).filter(field => field.answer !== "—");
  return [{ key: "pres", answer: entry.pres, label: "现在时", hint: "表示现在或习惯" }, { key: "past", answer: entry.past, label: "过去时", hint: "表示已经发生" }, { key: "pp", answer: entry.pp, label: "完成分词", hint: "放在 har 后面" }];
}

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
const DEFAULT_STATE = { mistakes: [], attempts: 0, correct: 0, streak: 1, learned: {}, review: {}, session: null, vocabSession: null, lastSummary: null };
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
function renderVerbs() { return `<section class="panel wide"><span class="eyebrow">Verb · 动词四形</span><h1 style="font-size:44px">四个形态，整组记。</h1><p class="muted">共 ${VERBS.length} 个动词参考。点“听原形”播放发音，点“四形讲解”查看变化和例句。</p><div class="verb-list">${VERBS.map(v => `<article class="verb-row verb-entry"><div class="verb-forms">${esc(v.v1)} – ${esc(v.pres)} – ${esc(v.past)} – ${esc(v.pp)}</div><div class="translation">${esc(v.zh)} · <span class="example">${esc(v.phrase)}</span></div><div class="verb-entry-actions"><button class="sound-button" data-say="${esc(v.v1)}" type="button">🔊 听原形</button><button class="button secondary verb-detail-button" data-verb="${v.id}" type="button">四形讲解</button></div></article>`).join("")}</div></section>`; }
function renderLearn() {
  const allEntries = [...new Map(VOCAB_TOPICS.flatMap(topic => topicEntries(topic.id)).map(entry => [entry.key, entry])).values()];
  const mastered = allEntries.filter(entry => (state.review?.[entry.key]?.streak || 0) >= 2).length;
  const dueCount = allEntries.filter(entry => state.review?.[entry.key] && state.review[entry.key].dueAt <= Date.now()).length;
  const active = state.vocabSession;
  return `<section class="panel wide learning-home"><span class="eyebrow">Lær · 专题词汇</span><h1>从最常用的词开始，放进句子里记。</h1><p class="muted">每次只学5个左右：先看情境和中文，主动回忆词形，再听读句子。按专题学习，动词和名词交替出现；答完会安排明天、3天后、1周后的复习。</p><div class="study-method"><strong>一张卡的记忆流程</strong><div><span>① 看主题句</span><span>② 遮住答案回忆</span><span>③ 听音跟读</span><span>④ 间隔复习</span></div></div>${active ? `<button class="resume-study" data-resume-session>继续${VOCAB_TOPICS.find(topic => topic.id === active.topicId)?.title || "当前专题"} · ${Math.min(active.index + 1, active.ids.length)}/${active.ids.length} 词</button>` : ""}<div class="learn-overview"><div><strong>${mastered}/${allEntries.length}</strong><span>已连续记住两次</span></div><div><strong>${dueCount}</strong><span>到期待复习</span></div></div><h2 class="topic-heading">选择一个专题</h2><div class="topic-grid">${VOCAB_TOPICS.map(topic => { const entries = topicEntries(topic.id); const done = entries.filter(entry => (state.review?.[entry.key]?.streak || 0) >= 2).length; return `<article class="topic-card"><div class="topic-icon">${topic.icon}</div><div class="topic-info"><span class="topic-level">${topic.level}</span><h3>${topic.title}</h3><p>${topic.description}</p><div class="topic-meta"><span>${entries.filter(entry => entry.kind === "verb").length} 个动词 · ${entries.filter(entry => entry.kind === "noun").length} 个名词</span><span>${done}/${entries.length} 熟练</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.round(done / entries.length * 100)}%"></div></div><div class="topic-actions"><button class="button primary" data-study="5" data-topic="${topic.id}">学5个</button><button class="button secondary" data-study="10" data-topic="${topic.id}">复习10个</button></div></div></article>`; }).join("")}</div></section>`;
}
function renderInlineKeyboard() {
  const rows = [["q","w","e","r","t","y","u","i","o","p"], ["a","s","d","f","g","h","j","k","l"], ["z","x","c","v","b","n","m","backspace"], ["æ","ø","å","space"]];
  const label = key => key === "backspace" ? "⌫" : key === "space" ? "空格" : key;
  return `<div class="keyboard-label">点按输入 · 挪威语字母已包含</div><div class="inline-keyboard" aria-label="挪威语内嵌键盘">${rows.map((row, i) => `<div class="keyboard-row row-${i + 1}">${row.map(key => `<button class="key-button ${["backspace","space"].includes(key) ? "utility" : ""}" data-key="${key}" type="button" aria-label="${key === "backspace" ? "删除一个字母" : key === "space" ? "空格" : key}">${label(key)}</button>`).join("")}</div>`).join("")}<div class="keyboard-row keyboard-tools"><button class="key-button utility clear-key" data-key="clear" type="button">清空本项</button></div></div>`;
}
function renderWordForm(label, text) { return `<span class="word-form-card"><small>${esc(label)}</small><strong>${esc(text)}</strong><button class="sound-button word-audio" data-say="${esc(text)}" type="button" aria-label="播放 ${esc(text)} 的挪威语发音">🔊 听词</button></span>`; }
function renderLearnStudy() {
  const s = state.vocabSession; if (!s || !s.ids.length) return renderLearn();
  const entry = getStudyEntry(s.ids[s.index]); const topic = VOCAB_TOPICS.find(item => item.id === s.topicId) || VOCAB_TOPICS[0];
  const title = entry.kind === "noun" ? entry.lemma : entry.v1; const fields = entryFields(entry);
  const studyHeader = `<div class="study-topline"><div><span class="eyebrow">${topic.title} · ${entry.kind === "noun" ? "名词" : "动词"}</span><strong>先回忆，再看答案</strong></div><div class="study-right"><span class="study-counter">${s.index + 1}/${s.ids.length}</span><button class="study-exit" data-back-topics type="button" aria-label="返回专题">×</button></div></div>`;
  if (!s.revealed) {
    const step = Math.min(s.recallStep || 0, fields.length - 1); const field = fields[step];
    const value = s.recallValues?.[field.key] || "";
    const front = entry.kind === "noun"
      ? `<span class="eyebrow">根据中文和情境回忆名词</span><h1>${esc(entry.zh)}</h1><p class="muted">情境：${esc(entry.sentenceZh)}</p>`
      : `<span class="eyebrow">动词原形 · 回忆其他形式</span><h1>${esc(entry.v1)}</h1><p class="vocab-meaning">${esc(entry.zh)}</p><p class="muted">情境：<span class="example">${esc(entry.phrase)}</span></p>`;
    return `<section class="question-card vocab-card">${studyHeader}<div class="study-progress" style="--steps:${fields.length}">${fields.map((item, i) => `<span class="${i < step ? "done" : i === step ? "current" : ""}">${i + 1} ${item.label}</span>`).join("")}</div><div class="vocab-front">${front}</div><div class="recall-step"><div class="recall-step-head"><span>第 ${step + 1} / ${fields.length} 项</span><strong>${field.label}</strong><small>${field.hint}</small></div><div id="vocab-current" class="custom-answer" data-value="${esc(value)}" data-placeholder="写出 ${esc(field.label)} …" aria-live="polite" aria-label="${field.label}">${value ? esc(value) : `<span class="custom-placeholder">写出 ${esc(field.label)} …</span>`}</div><p class="recall-help">凭记忆想一想，再点击下方挪威语键盘。</p>${renderInlineKeyboard()}</div><div class="actions vocab-actions"><button class="button primary" data-vocab-step>${step === fields.length - 1 ? "检查并看答案" : "下一项"}</button><button class="button secondary" data-vocab-reveal>跳过回忆</button></div></section>`;
  }
  const result = s.lastResult;
  const headwordSound = entry.kind === "noun" ? fields[0].answer : entry.v1;
  const formCards = (entry.kind === "noun" ? fields.map(field => [field.label, field.answer]) : [["原形", entry.v1], ...fields.map(field => [field.label, field.answer])])
    .map(([label, answer]) => renderWordForm(label, answer)).join("");
  const examples = entry.kind === "noun"
    ? `<div class="four-sentences"><div><span>专题例句 · ${topic.title}</span><code>${esc(entry.sentence)}</code><p class="muted">${esc(entry.sentenceZh)}</p><button class="sound-button" data-say="${esc(entry.sentence)}" type="button">🔊 听一遍</button></div></div>`
    : `<div class="four-sentences"><div><span>现在</span><code>Jeg ${esc(entry.pres)} ${esc(entry.tail)}.</code><button class="sound-button" data-say="Jeg ${esc(entry.pres)} ${esc(entry.tail)}." type="button">🔊 听一遍</button></div><div><span>情态</span><code>Jeg skal ${esc(entry.v1)} ${esc(entry.tail)}.</code><button class="sound-button" data-say="Jeg skal ${esc(entry.v1)} ${esc(entry.tail)}." type="button">🔊 听一遍</button></div><div><span>过去</span><code>Jeg ${esc(entry.past)} ${esc(entry.tail)}.</code><button class="sound-button" data-say="Jeg ${esc(entry.past)} ${esc(entry.tail)}." type="button">🔊 听一遍</button></div><div><span>完成</span><code>Jeg har ${esc(entry.pp)} ${esc(entry.tail)}.</code><button class="sound-button" data-say="Jeg har ${esc(entry.pp)} ${esc(entry.tail)}." type="button">🔊 听一遍</button></div></div>`;
  const progressNote = entry.kind === "noun" ? "记名词时把冠词一起背：它告诉你词的性别；再留意定指词尾和复数变化。" : "把四形按节奏读出来，再用一个句子把它和日常生活连起来。";
  return `<section class="question-card vocab-card">${studyHeader}<div class="vocab-front answer-front"><span class="eyebrow">${esc(entry.zh)}</span><div class="answer-headword"><h1>${esc(title)}</h1><button class="sound-button headword-audio" data-say="${esc(headwordSound)}" type="button" aria-label="播放 ${esc(headwordSound)} 的挪威语发音">🔊 听词</button></div></div>${result ? `<div class="feedback ${result.ok ? "good" : "close"}"><h3>${result.ok ? "✓ 全部回忆正确" : "看答案，再主动回忆一次"}</h3><p>${result.message}</p></div>` : ""}<p id="pronunciation-status" class="pronunciation-note" aria-live="polite">🔊 单词和词形都可单独播放，发音使用设备提供的挪威语语音。</p><div class="big-forms">${formCards}</div>${examples}<div class="theme-sentence"><span>专题整合句 · ${topic.title}</span><p class="example">${esc(topic.story)}</p><p class="muted">${esc(topic.storyZh)}</p><button class="sound-button" data-say="${esc(topic.story)}" type="button">🔊 听整句</button></div><div class="memory-tip"><strong>记忆小方法</strong><span>${progressNote} 明天、3天后和1周后再复习。</span></div><div class="actions"><button class="button orange" data-vocab-retry>再测一次</button><button class="button primary" data-vocab-know>我记住了，下一词</button></div></section>`;
}
function renderLearnDetail(v) { const n = state.learned[v.id] || 0; const forms = [["现在时", v.pres], ["过去时", v.past], ["完成分词", v.pp]].map(([label, word]) => renderWordForm(label, word)).join(""); return `<section class="panel wide detail-panel"><button class="text-button" data-back-learn>← 返回背词</button><span class="eyebrow">动词卡 · ${esc(v.zh)}</span><div class="answer-headword"><h1 style="font-size:58px">${esc(v.v1)}</h1><button class="sound-button headword-audio" data-say="${esc(v.v1)}" type="button" aria-label="播放 ${esc(v.v1)} 的挪威语发音">🔊 听原形</button></div><div class="big-forms">${forms}</div><div class="rule-box"><strong>固定搭配 / 记忆锚点</strong><p class="example">${esc(v.phrase)}</p><button class="sound-button" data-say="${esc(v.phrase)}" type="button">🔊 听搭配</button></div><div class="four-sentences"><div><span>现在</span><code>Jeg ${esc(v.pres)} ${esc(v.tail)}.</code><button class="sound-button" data-say="Jeg ${esc(v.pres)} ${esc(v.tail)}." type="button">🔊 听例句</button></div><div><span>情态</span><code>Jeg skal ${esc(v.v1)} ${esc(v.tail)}.</code><button class="sound-button" data-say="Jeg skal ${esc(v.v1)} ${esc(v.tail)}." type="button">🔊 听例句</button></div><div><span>过去</span><code>Jeg ${esc(v.past)} ${esc(v.tail)}.</code><button class="sound-button" data-say="Jeg ${esc(v.past)} ${esc(v.tail)}." type="button">🔊 听例句</button></div><div><span>完成</span><code>Jeg har ${esc(v.pp)} ${esc(v.tail)}.</code><button class="sound-button" data-say="Jeg har ${esc(v.pp)} ${esc(v.tail)}." type="button">🔊 听例句</button></div></div><p class="muted">本词已标记：${n}次。连续两次选择“我会了”后，系统会降低新词出现频率，之后按间隔复习。</p><div class="actions"><button class="button orange" data-again-verb="${v.id}">再练这个词</button><button class="button primary" data-know-verb="${v.id}">我会了</button></div></section>`; }
function renderMistakes() { return `<section class="panel wide"><span class="eyebrow">Mine feil · 我的错误</span><h1 style="font-size:44px">错误会回来，直到你会。</h1>${state.mistakes.length ? `<div class="mistake-list">${[...state.mistakes].reverse().map(m => `<div class="mistake-item"><span class="tag">${esc(m.skill)}</span><h3 style="margin-top:10px">${esc(m.prompt)}</h3><div>你的答案：<code>${esc(m.given)}</code></div><div>建议答案：<code>${esc(m.answer)}</code></div><p class="muted">${esc(m.explanation)}</p></div>`).join("")}</div>` : `<div class="empty">还没有错题。做完训练后，系统会按技能自动收集。</div>`}</section>`; }
function renderSpeak() { return `<section class="panel wide center"><span class="eyebrow">Snakke · 口语模式</span><h1 style="font-size:44px">Hva skal du gjøre i morgen?</h1><p class="muted">浏览器支持语音识别时可以直接说；也可以输入文字。系统会检查你常犯的动词和语序问题。</p><button class="speak-button" data-speak aria-label="开始录音">●</button><p id="speech-status" class="muted">Trykk for å snakke</p><textarea id="speech-text" placeholder="识别结果会出现在这里，也可以直接输入。"></textarea><div class="actions" style="justify-content:center"><button class="button primary" data-check-speech>分析回答</button></div><div id="feedback" style="text-align:left"></div></section>`; }

function record(q, given, ok, answer, explanation) { if (state.session.answers[q.id]) return; state.session.answers[q.id] = { ok, given }; state.attempts++; if (ok) state.correct++; if (!ok) state.mistakes.push({ id: Date.now(), qid: q.id, skill: q.skill, prompt: q.prompt, given, answer, explanation }); saveState(); }
function speakNorwegian(text) {
  if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") { const status = document.querySelector("#pronunciation-status"); if (status) status.textContent = "当前浏览器不支持语音朗读；请使用系统朗读功能。"; return; }
  const synth = window.speechSynthesis; synth.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = "nb-NO"; utterance.rate = .82;
  const voices = synth.getVoices(); utterance.voice = voices.find(voice => /^nb-NO$/i.test(voice.lang)) || voices.find(voice => /^nb(?:-|$)/i.test(voice.lang)) || voices.find(voice => /^no(?:-|$)/i.test(voice.lang)) || null;
  utterance.onerror = () => { const status = document.querySelector("#pronunciation-status"); if (status) status.textContent = "当前设备没有可用的挪威语语音；请检查系统语音设置后重试。"; };
  synth.speak(utterance);
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
function startVocabSession(total, topicId = "basics") {
  const pool = topicEntries(topicId); const now = Date.now();
  const due = pool.filter(entry => state.review?.[entry.key]?.dueAt && state.review[entry.key].dueAt <= now).sort((a, b) => (state.review[a.key].dueAt || 0) - (state.review[b.key].dueAt || 0));
  const fresh = pool.filter(entry => !state.review?.[entry.key]); const early = pool.filter(entry => state.review?.[entry.key] && state.review[entry.key].dueAt > now).sort((a, b) => state.review[a.key].dueAt - state.review[b.key].dueAt);
  const ids = [...due, ...fresh, ...early].slice(0, total).map(entry => entry.key);
  state.vocabSession = { topicId, ids, index: 0, revealed: false, recallStep: 0, recallValues: {}, lastResult: null }; saveState(); location.hash = "learnstudy";
}
function advanceVocabStep() {
  const s = state.vocabSession; const entry = getStudyEntry(s.ids[s.index]); const fields = entryFields(entry); const step = s.recallStep || 0; const field = fields[step]; const input = document.querySelector("#vocab-current"); const value = input?.dataset.value || "";
  if (!value.trim()) { input?.classList.add("input-error"); return; }
  const recallValues = { ...(s.recallValues || {}), [field.key]: value };
  if (step < fields.length - 1) { s.recallValues = recallValues; s.recallStep = step + 1; saveState(); render(); requestAnimationFrame(() => document.querySelector("#vocab-current")?.scrollIntoView({ block: "center", behavior: "smooth" })); return; }
  const values = fields.map(item => recallValues[item.key] || ""); const correct = fields.map((item, i) => normalize(values[i]) === normalize(item.answer));
  s.recallValues = recallValues;
  s.revealed = true; s.lastResult = { ok: correct.every(Boolean), message: correct.every(Boolean) ? `所有${fields.length}项都正确。把它放进专题例句里读一遍。` : fields.map((item, i) => `${item.label}${correct[i] ? "✓" : "✗"}`).join("，") + "。看一遍后，合上答案再回想。" }; saveState(); render();
}
function finishVocabCard() {
  const s = state.vocabSession; const key = s.ids[s.index]; const previous = state.review?.[key] || { streak: 0 };
  const remembered = !s.lastResult || s.lastResult.ok; const streak = remembered ? previous.streak + 1 : 0; const intervals = [1, 3, 7, 14, 30]; const delayDays = remembered ? intervals[Math.min(Math.max(streak - 1, 0), intervals.length - 1)] : 1;
  state.learned[key] = (state.learned[key] || 0) + 1; state.review[key] = { streak, dueAt: Date.now() + delayDays * 86400000 };
  s.index++; s.revealed = false; s.recallStep = 0; s.recallValues = {}; s.lastResult = null;
  if (s.index >= s.ids.length) { state.vocabSession = null; location.hash = "learn"; } saveState(); render();
}
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
  document.querySelector("[data-resume-session]")?.addEventListener("click", () => { location.hash = "learnstudy"; });
  document.querySelector("[data-back-topics]")?.addEventListener("click", () => { location.hash = "learn"; });
  document.querySelectorAll("[data-study]").forEach(b => b.addEventListener("click", () => startVocabSession(Number(b.dataset.study), b.dataset.topic || "basics")));
  document.querySelector("[data-vocab-step]")?.addEventListener("click", advanceVocabStep);
  document.querySelectorAll("[data-key]").forEach(b => b.addEventListener("click", () => {
    const input = document.querySelector("#vocab-current"); if (!input) return;
    const key = b.dataset.key;
    let value = input.dataset.value || "";
    if (key === "backspace") value = value.slice(0, -1);
    else if (key === "clear") value = "";
    else if (key === "space") value += " ";
    else value += key;
    input.dataset.value = value;
    input.innerHTML = value ? esc(value) : `<span class="custom-placeholder">${esc(input.dataset.placeholder || "")}</span>`;
    input.classList.remove("input-error");
    const s = state.vocabSession; const keys = ["pres", "past", "pp"]; if (s) s.recallValues = { ...(s.recallValues || {}), [keys[Math.min(s.recallStep || 0, 2)]]: value };
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
