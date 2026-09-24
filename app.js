/* Norsk hver dag - a deterministic, data-driven Norwegian practice engine. */
const VERBS = [
  ["være","er","var","vært","是、处于","hjemme"], ["ha","har","hadde","hatt","有","tid"],
  ["gjøre","gjør","gjorde","gjort","做","en innsats"], ["gå","går","gikk","gått","走、去","til jobben"],
  ["komme","kommer","kom","kommet","来","snart"], ["ta","tar","tok","tatt","拿；乘坐","bussen"],
  ["se","ser","så","sett","看、看见","filmen"], ["si","sier","sa","sagt","说（内容）","det"],
  ["vite","vet","visste","visst","知道","det"], ["finne","finner","fant","funnet","找到","en løsning"],
  ["få","får","fikk","fått","得到；获得","hjelp"], ["bli","blir","ble","blitt","变成、成为","bedre"],
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

const VERB_USAGE_ZH = {
  "være":"待在家里", "ha":"有时间", "gjøre":"付出努力", "gå":"步行去上班", "komme":"很快过来", "ta":"乘坐公交车", "se":"看这部电影", "si":"说这件事", "vite":"知道这件事", "finne":"找到一个解决办法", "få":"得到帮助", "bli":"变得更好", "stå":"站在外面", "sitte":"坐在咖啡馆里", "ligge":"位于挪威", "gi":"把书给他", "drikke":"喝咖啡", "sove":"睡得好", "forstå":"懂一点挪威语", "spørre":"询问老师", "fortelle":"把这件事告诉我", "holde":"扶着门", "velge":"选择这个", "selge":"卖掉汽车", "kunne":"会说挪威语", "ville":"想学挪威语", "skulle":"打算工作", "måtte":"必须练习", "burde":"应该休息", "jobbe":"在奥斯陆工作", "lære":"学习挪威语", "øve":"每天练习", "lese":"读一本书", "skrive":"写一条消息", "søke":"申请一份工作", "bo":"住在挪威", "møte":"见老师", "hjelpe":"帮助我", "bruke":"使用手机", "trenge":"需要帮助", "prøve":"尝试说挪威语", "spise":"吃早餐", "lage":"做晚饭", "kjøpe":"购买食物", "betale":"支付账单", "kjøre":"开车去奥斯陆", "reise":"去瑞典旅行", "vaske":"洗衣服", "snakke":"和邻居交谈", "like":"喜欢学挪威语", "tenke":"思考未来", "mene":"表达这个意思", "synes":"觉得是这样", "huske":"记得这件事", "glemme":"忘记钥匙", "begynne":"开始工作", "slutte":"四点下班", "vente":"等公交车", "høre":"听见你说话", "sette":"坐下来", "legge":"躺下来", "løpe":"跑回家", "bære":"搬这个东西", "treffe":"见到她", "bestå":"通过B1考试"
};
function verbActionZh(verb) { return VERB_USAGE_ZH[verb.v1] || verb.zh; }
function modalActionZh(modal, verb) {
  const intent = { vil: "想", skal: "计划", kan: "能够", må: "必须", bør: "应该" }[modal] || "";
  return `${intent}${verbActionZh(verb)}`;
}
function translatedSentenceZh(time, subject, action) { return `${time ? `${time}，` : ""}${subject}${action}。`; }

const MODAL_EXAMPLES = {
  "kunne":[["现在","Jeg kan snakke norsk.","我会说挪威语。"],["原形","Det er nyttig å kunne snakke norsk.","会说挪威语很有用。"],["过去","Jeg kunne snakke litt norsk.","我以前会说一点挪威语。"],["完成","Jeg har kunnet snakke norsk på jobb.","我已经能够在工作中说挪威语了。"]],
  "ville":[["现在","Jeg vil lære norsk.","我想学挪威语。"],["原形","Det er viktig å ville lære.","有学习的意愿很重要。"],["过去","Jeg ville lære norsk.","我当时想学挪威语。"],["完成","Jeg har villet lære norsk lenge.","我想学挪威语已经很久了。"]],
  "skulle":[["现在","Jeg skal jobbe i morgen.","我明天要工作。"],["原形","Det er vanskelig å skulle velge nå.","现在就必须作选择很难。"],["过去","Jeg skulle jobbe i går.","我昨天原本要工作。"],["完成","Jeg har skullet jobbe mye denne uka.","这周我一直得工作很多。"]],
  "måtte":[["现在","Jeg må øve hver dag.","我必须每天练习。"],["原形","Det er vanlig å måtte vente.","不得不等待是很常见的。"],["过去","Jeg måtte øve i går.","我昨天必须练习。"],["完成","Jeg har måttet øve mye.","我一直不得不大量练习。"]],
  "burde":[["现在","Jeg bør hvile.","我应该休息。"],["原形","Det er lett å vite hva man burde gjøre.","知道自己应该做什么很容易。"],["过去","Jeg burde hvile mer.","我当时应该多休息。"],["完成","Jeg har burdet hvile mer.","我本来一直应该多休息。"]]
};

function verbExamples(entry) {
  if (MODAL_EXAMPLES[entry.v1]) return MODAL_EXAMPLES[entry.v1].map(([label, no, zh]) => ({ label, no, zh }));
  const action = VERB_USAGE_ZH[entry.v1] || entry.zh;
  return [
    { label: "现在", no: `Jeg ${entry.pres} ${entry.tail}.`, zh: `我现在${action}。` },
    { label: "计划", no: `Jeg skal ${entry.v1} ${entry.tail}.`, zh: `我打算${action}。` },
    { label: "过去", no: `Jeg ${entry.past} ${entry.tail}.`, zh: `我当时${action}。` },
    { label: "完成", no: `Jeg har ${entry.pp} ${entry.tail}.`, zh: `我已经${action}了。` }
  ];
}

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
  ["penger","en","penge","pengen","penger","pengene","钱币；钱（泛指金钱时常用复数 penger）","Jeg sparer penger til en sykkel.","我在攒钱买一辆自行车。"],
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
].map(([id,gender,lemma,definite,plural,pluralDefinite,zh,sentence,sentenceZh]) => ({ id, gender, lemma, zh, sentence, sentenceZh, forms: [gender === "—" ? lemma : `${gender} ${lemma}`, definite, plural, pluralDefinite], formLabels: gender === "—" ? ["无冠词形式", "定指形式", "复数", "定指复数"] : ["不定单数", "定指单数", "不定复数", "定指复数"], phrase: "", kind: "noun", ...(id === "penger" ? { review: { source:"Bokmålsordboka", sourceUrl:"https://ordbokene.no/nob/bm/penge", checkedOn:"2026-09-24", fields:["词义/词性/词形/例句/译文"] } } : {}) }));

const NOUN_GUIDES = {
  "dag":["一天、日子；也可表示白天", "这里是时间单位 day，不是天空。天空是 himmel。"],
  "tid":["时间；一段时间", "ha tid 表示“有时间”；问几点通常用 Hva er klokka?"],
  "hjem":["家、归属感或居所", "gå hjem 表示“回家”，前面通常不用 til；房屋建筑本身常用 hus。"],
  "jobb":["工作、职位；也可指工作地点", "gå på jobb 是“去上班”；更宽泛的“劳动/工作”还可用 arbeid。"],
  "mat":["食物、饭菜的总称", "通常作为不可数概念使用；不是某一道具体菜名。"],
  "vann":["水", "表示物质时通常不可数；一杯水可说 et glass vann。"],
  "familie":["家庭、家人这一群体", "指整个家庭；单独一位亲属通常用 familiemedlem。"],
  "barn":["孩子；儿童", "et barn 是一个孩子，barn 也可以是不定复数，要靠上下文判断。"],
  "venn":["朋友", "指一个具体朋友；vennlig 是“友好的”，不要混淆。"],
  "mor":["母亲、妈妈", "复数是不规则形式 mødre。口语中常说 mora mi。"],
  "far":["父亲、爸爸", "复数是不规则形式 fedre。"],
  "mann":["男人；丈夫", "具体是“男人”还是“丈夫”由语境决定；复数是不规则形式 menn。"],
  "kvinne":["女人、女性", "指成年女性；女孩通常用 jente。"],
  "navn":["名字、名称", "Hva heter du? 和 Hva er navnet ditt? 都可询问姓名。"],
  "hus":["房子、建筑物", "强调建筑本身；hjem 更强调“家/归属之处”。"],
  "leilighet":["公寓、住宅单元", "指一套公寓，不是整栋楼；公寓楼可说 boligblokk。"],
  "rom":["房间；空间", "这里指 house 中的房间；也能表示“空间”，需看语境。"],
  "kjøkken":["厨房", "既可指家里的厨房，也可指餐厅的后厨。"],
  "seng":["床", "gå til sengs 是“上床睡觉”，与卧室 soverom 不同。"],
  "bord":["桌子", "这里是家具 table；不是“黑板”，黑板是 tavle。"],
  "stol":["椅子", "普通有靠背座椅；扶手椅通常用 lenestol。"],
  "dør":["门", "指门本身；门口/入口根据语境可用 inngang。"],
  "brød":["面包；一条/一个面包", "et brød 可指一个完整面包；不定复数仍是 brød。"],
  "melk":["牛奶", "作为饮品通常不可数；一杯牛奶说 et glass melk。"],
  "kaffe":["咖啡；一杯咖啡", "作为饮品可不带冠词；点单时 en kaffe 常指“一杯咖啡”。"],
  "butikk":["商店、店铺", "去商店常说 gå i/på butikken，具体介词会随语境变化。"],
  "penger":["钱币；泛指金钱时通常用复数 penger", "en penge 指一枚钱币/一笔钱，复数 penger 常泛指钱；定指复数是 pengene。"],
  "frokost":["早餐", "spise frokost 表示“吃早餐”，通常不需要冠词。"],
  "uke":["一周、星期这一时间段", "i uka 是“在这一周/每周”的常见表达；具体星期几用 ukedag。"],
  "morgen":["早晨", "i morgen 是“明天”，om morgenen 是“在早晨”，意义不同。"],
  "kveld":["晚上、傍晚", "通常指从傍晚到睡前；夜间更晚的时段是 natt。"],
  "år":["年；年龄中的岁", "et år 是一年；不定复数仍是 år，例如 fem år。"],
  "lege":["医生、医师", "专指医疗医生；博士学位称呼通常不是这个词。"],
  "apotek":["药房、药店", "购买或领取药物的地方；不是普通商店 butikk。"],
  "medisin":["药、药物；医学", "在本专题里指服用的药物；“学医/医学”也可用 medisin。"],
  "hode":["头、头部", "ha vondt i hodet 是“头疼”的固定说法。"],
  "buss":["公交车、大巴", "ta bussen 表示“乘公交”，不是字面上的“拿公交车”。"],
  "bil":["汽车、轿车", "kjøre bil 是“开车”；坐车则根据语境说 sitte i bilen。"],
  "tog":["火车", "ta toget 是“坐火车”；不定复数仍是 tog。"],
  "billett":["票、入场券、车票", "可指交通票或活动门票，具体类型由语境决定。"],
  "by":["城市、城镇", "大小范围由语境决定；国家 country 是 land。"],
  "skole":["学校；上学这一活动", "gå på skolen 可指去/在学校；gå på skole 强调上学。"],
  "bok":["书、一本书", "复数是不规则形式 bøker。"],
  "ord":["单词；话语", "这里指一个语言单位 word；不定复数仍是 ord。"],
  "språk":["语言", "可指数一种语言；不定复数仍是 språk。"],
  "lærer":["老师、教师", "作为名词是“老师”；lærer 也可能是动词 lære 的现在时“学习”，要看句子位置。"]
};

function nounGuide(entry) { const [meaning, note] = NOUN_GUIDES[entry.id] || [entry.zh, "结合例句判断这个名词在当前专题中的具体意思。"]; return { meaning, note }; }

const VOCAB_TOPICS = [
  { id: "basics", title: "日常基础", level: "A1 · 入门高频", icon: "☀", description: "先掌握每天都会用到的动词和生活词。", verbs: ["være","ha","gjøre","gå","komme","ta","få","bli"], nouns: ["dag","tid","hjem","jobb","mat","vann"], story: "Hver dag står jeg opp, spiser frokost og går på jobb. Om kvelden er jeg hjemme og lærer norsk.", storyZh: "每天我起床、吃早餐、去上班。晚上我在家学习挪威语。" },
  { id: "people", title: "家庭与人物", level: "A1 · 家人朋友", icon: "♡", description: "用常见人称和关系词说自己的生活。", verbs: ["snakke","bo","hjelpe","se","spørre","fortelle","møte"], nouns: ["familie","barn","venn","mor","far","mann","kvinne","navn"], story: "Familien min bor i Norge. Jeg snakker norsk med en venn og forteller om barna mine.", storyZh: "我的家人住在挪威。我和一位朋友说挪威语，也聊聊我的孩子。" },
  { id: "home", title: "家与房间", level: "A1 · 居家生活", icon: "⌂", description: "从家里的物品开始，练位置和日常动作。", verbs: ["bo","sitte","stå","ligge","sette","legge","vaske"], nouns: ["hus","leilighet","rom","kjøkken","seng","bord","stol","dør"], story: "Boka ligger på bordet. Jeg setter meg på en stol og leser i stua.", storyZh: "书在桌子上。我坐到椅子上，在客厅里读书。" },
  { id: "food", title: "食物与购物", level: "A1 · 吃饭买东西", icon: "⌑", description: "把食物词放进买东西、做饭和用餐的句子。", verbs: ["spise","drikke","lage","kjøpe","betale","like","prøve"], nouns: ["brød","melk","kaffe","butikk","penger","frokost","mat","vann"], story: "Jeg kjøper brød og melk på butikken. Hjemme lager jeg frokost og drikker kaffe.", storyZh: "我在商店买面包和牛奶。回家后我做早餐、喝咖啡。" },
  { id: "time", title: "时间与日常", level: "A1 · 时间表达", icon: "◷", description: "学习安排一天、一周和日常习惯。", verbs: ["begynne","slutte","vente","huske","glemme","jobbe","lære"], nouns: ["uke","morgen","kveld","år","dag","tid","jobb"], story: "Om morgenen jobber jeg. Om kvelden øver jeg norsk, og hver uke lærer jeg nye ord.", storyZh: "早上我工作。晚上我练习挪威语，每周学习新词。" },
  { id: "health", title: "健康与看医生", level: "A2 · 健康生活", icon: "+", description: "掌握看医生、药房和身体状况的基本表达。", verbs: ["trenge","få","ta","hjelpe","gå","si","vente"], nouns: ["lege","apotek","medisin","hode","tid","dag"], story: "Jeg har vondt i hodet. Jeg ringer legen, går til apoteket og henter medisinen.", storyZh: "我头疼。我给医生打电话，去药房取药。" },
  { id: "travel", title: "交通与出行", level: "A1 · 城市出行", icon: "↗", description: "把交通名词和常用出行动词一起记。", verbs: ["reise","kjøre","gå","ta","komme","finne","vente"], nouns: ["buss","bil","tog","billett","by","tid","hjem"], story: "Jeg kjøper en billett, tar toget til byen og går hjem om kvelden.", storyZh: "我买一张票，坐火车进城，晚上走回家。" },
  { id: "study", title: "学习与工作", level: "A1–A2 · 我的目标", icon: "✎", description: "围绕挪威语学习、课程和工作表达。", verbs: ["jobbe","lære","øve","lese","skrive","søke","forstå","vite"], nouns: ["skole","bok","ord","språk","lærer","jobb","tid"], story: "Jeg går på norskkurs. Læreren hjelper meg, og jeg leser ei bok og skriver nye ord.", storyZh: "我去上挪威语课。老师帮助我，我读一本书并写下新单词。" },
  { id: "fremtid", title: "未来与人生计划", level: "A2–B1 · 完整专题", icon: "🚀", description: "把未来表达、主题词汇、对话阅读、综合练习和写作放进同一个学习主题。", verbs: [], nouns: [], story: "Jeg vil lære norsk. Neste år skal jeg søke på en ny jobb.", storyZh: "我想学好挪威语。明年我打算申请一份新工作。" }
];

const NOUN_BY_ID = Object.fromEntries(NOUNS.map(noun => [noun.id, noun]));
function studyPriority(word) {
  if (/^(en framtid|et mål|en plan|en familie|et nyttår|en drøm|et forsett|en mulighet|å ville|å skulle|å komme til å|å bli|å lære|å reise|å spise|å spare|å gjøre|å tenke|å ønske|ofte|neste|om fem år|til|om)$/.test(word)) return 2.5;
  if (/^(være|ha|gjøre|gå|komme|ta|få|bli|snakke|bo|spise|drikke|kjøpe|jobbe|lære|reise|familie|barn|dag|tid|hjem|jobb|mat|vann|uke|morgen|år)$/.test(word)) return 2;
  return 1;
}
function topicEntries(topicId) {
  if (topicId === "saved") return (state.savedWords || []).map(word => ({ ...word, key: `saved:${word.id}`, kind: "future", priority: 1.5 }));
  if (topicId === "daily") return [...new Map([...VOCAB_TOPICS.flatMap(topic => topicEntries(topic.id)), ...topicEntries("fremtid"), ...topicEntries("saved")].map(entry => [entry.key, entry])).values()];
  if (topicId === "fremtid") return window.FREMTID_TOPIC.vocabulary.map((entry, index) => ({ ...entry, id: `future-${index}`, key: `future:${index}`, kind: "future", priority: studyPriority(entry.word), contexts: [{ id: `future-${index}:sentence`, no: entry.sentence, zh: entry.translation, note: `专题例句；结合上下文理解“${entry.zh}”。` }] }));
  const topic = VOCAB_TOPICS.find(item => item.id === topicId) || VOCAB_TOPICS[0];
  const verbs = topic.verbs.map(name => { const v = VERBS.find(item => item.v1 === name); return v ? { ...v, kind: "verb", key: v.id } : null; }).filter(Boolean);
  const nouns = topic.nouns.map(id => NOUN_BY_ID[id]).filter(Boolean).map(noun => ({ ...noun, key: `noun:${noun.id}`, priority: studyPriority(noun.lemma) }));
  const additions = (window.VOCAB_V2?.additions || []).filter(item => item.topic === topicId).map(item => ({ ...item, kind: "lexeme", key: `lex:${item.id}`, lemma: item.word, priority: item.frequency || 1, contexts: item.contexts.map((row, i) => ({ id: `${item.id}:ctx${i}`, no: row[0], zh: row[1], note: row[2] })) }));
  verbs.forEach(verb => { verb.priority = studyPriority(verb.v1); });
  const mixed = []; const base = [...verbs, ...nouns]; for (let i = 0; i < Math.max(base.length, additions.length); i++) { if (base[i]) mixed.push(base[i]); if (additions[i]) mixed.push(additions[i]); }
  return mixed;
}
function getStudyEntry(key) { if (key.startsWith("future:")) return topicEntries("fremtid")[Number(key.slice(7))]; if (key.startsWith("saved:")) return topicEntries("saved").find(entry => entry.key === key) || topicEntries("saved")[0]; if (key.startsWith("noun:")) return { ...NOUN_BY_ID[key.slice(5)], key }; if (key.startsWith("lex:")) return topicEntries("daily").find(entry => entry.key === key); const verb = VERBS.find(v => v.id === key) || VERBS[0]; return { ...verb, kind: "verb", key: verb.id }; }
function entryFields(entry) {
  if (entry.kind === "future" && entry.pos === "名词") {
    const forms = String(entry.forms || "").split(/\s+[–—-]\s+/).filter(Boolean);
    const labels = forms.length === 4 ? ["不定单数", "定指单数", "不定复数", "定指复数"] : forms.length === 2 ? ["不定单数", "定指单数"] : forms.map((_, i) => `名词词形 ${i+1}`);
    return forms.map((answer, i) => ({ key: `form${i}`, answer, label: labels[i], hint: "回想情境中要说的是一个还是多个、已知还是首次提及；冠词和词尾一起记。" }));
  }
  if (entry.kind === "future" && entry.pos === "动词") {
    const forms = String(entry.forms || "").split(/\s+[–—-]\s+/).filter(Boolean);
    return [{ key: "word", answer: entry.word, label: "动词原形", hint: "先回忆原形；情态动词后的动作要用原形。" }, ...forms.map((answer, i) => ({ key: `form${i}`, answer, label: ["现在时", "过去时", "完成表达"][i] || `词形 ${i+1}`, hint: i === 2 ? "完成表达由 har + 完成分词构成，记住整组。" : "结合句子中的时间线索回忆这个动词形式。" }))];
  }
  if (entry.kind === "future") return [{ key: "word", answer: entry.word, label: "主题词", hint: "回想词条；可带 å 或冠词，核对时看完整词形" }];
  if (entry.kind === "noun") return entry.forms.map((answer, i) => ({ key: `form${i}`, answer, label: entry.formLabels[i], hint: ["把冠词和名词当成一个词记", "留意定指词尾 -en / -a / -et", "留意复数词尾", "复数定指常见 -ene / -a"][i] })).filter(field => field.answer !== "—");
  if (entry.kind === "lexeme") return entry.forms.map((answer, i) => ({ key: `form${i}`, answer, label: entry.labels[i], hint: entry.pos === "形容词" ? "想一想名词的性数如何影响词尾" : entry.pos === "名词" ? "冠词、定指和复数都要与词一起记" : "回忆这个词形及其常见使用位置" }));
  return [{ key: "v1", answer: entry.v1, label: "动词原形", hint: "先根据中文和情境主动回忆词根" }, { key: "pres", answer: entry.pres, label: "现在时", hint: "表示现在或习惯" }, { key: "past", answer: entry.past, label: "过去时", hint: "表示已经发生" }, { key: "pp", answer: entry.pp, label: "完成分词", hint: "放在 har 后面" }];
}

function vocabContexts(entry, topicId = "daily") {
  const candidates = [...(entry.contexts || [])];
  if (entry.kind === "noun" && entry.sentence) candidates.push({ id: `${entry.key}:sentence`, no: entry.sentence, zh: entry.sentenceZh || "", note: "注意句子中的冠词和名词词尾。" });
  if (entry.kind === "verb") verbExamples(entry).forEach((row, i) => candidates.push({ id: `${entry.key}:verb${i}`, no: row.no, zh: row.zh, note: row.label }));
  const topic = VOCAB_TOPICS.find(item => item.id === topicId);
  if (topic?.story) candidates.push({ id: `${topicId}:story`, no: topic.story, zh: topic.storyZh, note: "把词放回主题整合句理解。" });
  const lemma = (entry.word || entry.lemma || entry.v1 || "").replace(/^(en|ei|et|å)\s+/i, "").toLocaleLowerCase("nb-NO");
  (window.READING_LIBRARY || []).forEach(article => article.sentences?.forEach((line, i) => {
    const no = Array.isArray(line) ? line[0] : line.no; const zh = Array.isArray(line) ? line[1] : (line.zh || line.translation || "");
    if (lemma && no?.toLocaleLowerCase("nb-NO").includes(lemma)) candidates.push({ id: `${article.id}:s${i}`, no, zh, note: `阅读语料：${article.title}` });
  }));
  return [...new Map(candidates.filter(row => row?.no).map(row => [row.id || row.no, row])).values()];
}

function usageQuestion(entry, context) {
  if (entry.kind === "verb") {
    const tail = entry.tail || ""; const tense = context?.no?.match(/i går|forrige (uke|år)|i fjor/i) ? "past" : "pres";
    const answer = tense === "past" ? entry.past : entry.pres;
    return { prompt: tense === "past" ? "句首 i går 表示过去，选择过去时：" : "Hver dag 表示习惯，选择现在时：", choices: shuffle([...new Set([answer, entry.v1, entry.pp, entry.past])]).slice(0, 4), answer, why: tense === "past" ? "i går 明确表示过去，主句谓语用过去时；完成分词通常要和 har 一起使用。" : "Hver dag 表示习惯，现在时用于一般习惯；å + 原形不能直接充当主句谓语。", sentence: tense === "past" ? `I går ${answer} jeg ${tail}.` : `Hver dag ${answer} jeg ${tail}.`, zh: "先抓时间线索，再决定谓语形式。" };
  }
  if (entry.kind === "noun" || (entry.kind === "lexeme" && entry.pos === "名词")) {
    const forms = entry.forms;
    const available = forms.map((form, index) => ({ form, index })).filter(item => item.form && item.form !== "—");
    const pluralOnly = entry.kind === "noun" && entry.formLabels?.[0] === "复数";
    const standardCases = [
      { index: 0, scene: "第一次提到一个不特定的单数对象", prompt: `你第一次提到“一个/一件${entry.zh || "东西"}”，听者还不知道具体是哪一个。`, sentence: `Jeg trenger ___.`, zh: `我需要一个/一件${entry.zh || "东西"}。`, why: "首次提及、单数、可数且不特指 → 不定单数。阳性/阴性名词通常带 en/ei，中性名词带 et。" },
      { index: 1, scene: "谈论已知的一个对象", prompt: `前文已经提到这个${entry.zh || "东西"}，现在问“它在哪里？”。`, sentence: `Hvor er ___?`, zh: `这个/那件${entry.zh || "东西"}在哪里？`, why: "对象已在上下文中明确，且数量为一个 → 定指单数。Bokmål 通常把定指形式做在名词词尾（如 bok → boka/boken）。" },
      { index: 2, scene: "首次提到若干个、不特指哪几个", prompt: `你第一次提到几本/几件${entry.zh || "东西"}，并不特指哪几个。`, sentence: `Jeg trenger ___.`, zh: `我需要一些${entry.zh || "东西"}。`, why: "多个、尚未特指 → 不定复数；挪威语通常不加冠词，复数形式本身要记（有规则变化，也有不规则变化）。" },
      { index: 3, scene: "谈论已知的那几个对象", prompt: `前文已说过这些${entry.zh || "东西"}，现在问“它们在哪里？”。`, sentence: `Hvor er ___?`, zh: `这些${entry.zh || "东西"}在哪里？`, why: "数量为多个，而且说话双方知道具体指哪几个 → 定指复数，常见词尾是 -ene/-ne，但要按词条记忆。" }
    ];
    // Uncountable and plural-only nouns do not have the regular four-way paradigm.
    const cases = pluralOnly
      ? [standardCases[2], standardCases[3]]
      : available.some(item => item.index === 2 || item.index === 3)
        ? standardCases.filter(item => available.some(form => form.index === item.index))
        : standardCases.filter(item => item.index < 2 && available.some(form => form.index === item.index));
    const scenario = shuffle(cases)[0];
    const answer = forms[scenario.index];
    const options = [...new Set(available.map(item => item.form))];
    const lemma = (entry.lemma || entry.word).replace(/^(en|ei|et)\s+/i, "");
    const nounNote = entry.kind === "noun" ? nounGuide(entry).note : entry.note;
    const special = options.length < 4 ? ` 这不是完整的四格变化：${nounNote || "该词有特殊用法"}` : "";
    return { prompt: scenario.prompt, scene: scenario.scene, choices: shuffle(options).slice(0, 4), answer, why: `${scenario.why}${special}`, sentence: scenario.sentence, zh: scenario.zh, formIndex: scenario.index, lemma };
  }
  if (entry.kind === "lexeme" && entry.pos === "形容词") {
    const answer = entry.forms[1] || entry.forms[0];
    return { prompt: "名词 hus 是中性(et)，选择形容词与它搭配的形式。", choices: shuffle([...new Set([answer, entry.forms[0], entry.forms[2], entry.forms[3]].filter(Boolean))]).slice(0, 4), answer, why: "单数中性名词 et hus 前，形容词通常用中性形式；常见规则是在原形后加 -t，但也有例外。", sentence: `Vi har et ${answer} hus.`, zh: "我们有一栋……的房子。" };
  }
  if (entry.kind === "lexeme") return { prompt: `读情境，选出能表达“${entry.zh}”的挪威语词/短语。`, choices: shuffle([...new Set([entry.forms[0], ...(entry.collocations || []).slice(0, 3)])]).slice(0, 4), answer: entry.forms[0], why: entry.note, sentence: context?.no || entry.contexts?.[0]?.no || "", zh: context?.zh || entry.contexts?.[0]?.zh || "" };
  return null;
}

const COLLOCATIONS = [
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
const DEFAULT_STATE = { mistakes: [], attempts: 0, correct: 0, streak: 1, learned: {}, review: {}, questionMastery: {}, session: null, vocabSession: null, lastSummary: null, questionHistory: [], practiceSessions: 0, savedWords: [], readingProgress: {}, dailyProgress: {}, soundEffects: true, trainingSettings: { dailyQuestionCount: 10, dailyPlan: "lesson-vocab-reading" } };
const STORAGE_KEY = "norsk-state-v2";
let state = loadState();
let soundContext = null;
let accountSession = null;
let accountUser = null;
let accountMedals = [];
let accountMedalGoals = [];
let accountStudyHabits = { currentStreak: 0, monthDays: 0, yearDays: 0 };
let accountNotice = "";
let accountMode = "login";
let boardPeriod = "all";
let boardRows = [];
let accountBackendUnavailable = false;
let verificationEmail = "";

try { accountSession = JSON.parse(localStorage.getItem("norsk-auth-session") || "null"); } catch { accountSession = null; }
const authCallback = new URLSearchParams(location.hash.startsWith("#") ? location.hash.slice(1) : "");
if (authCallback.has("access_token") && authCallback.has("refresh_token")) {
  accountSession = { access_token: authCallback.get("access_token"), refresh_token: authCallback.get("refresh_token"), expires_at: Date.now() + Number(authCallback.get("expires_in") || 3600) * 1000 };
  localStorage.setItem("norsk-auth-session", JSON.stringify(accountSession));
  const recovery = authCallback.get("type") === "recovery";
  history.replaceState(null, "", `${location.pathname}${recovery ? "?recovery=1" : "?verified=1"}#account`);
  if (recovery) accountMode = "reset";
}

function loadState() { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); const count = Number(saved.trainingSettings?.dailyQuestionCount); const dailyPlan = saved.trainingSettings?.dailyPlan; return { ...DEFAULT_STATE, ...saved, trainingSettings: { ...DEFAULT_STATE.trainingSettings, ...(saved.trainingSettings || {}), dailyQuestionCount: [5,10,15,20,30].includes(count) ? count : 10, dailyPlan: ["lesson","lesson-vocab","lesson-vocab-reading"].includes(dailyPlan) ? dailyPlan : "lesson-vocab-reading" } }; } catch { return { ...DEFAULT_STATE }; } }
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function playLearningSound(kind) {
  if (state.soundEffects === false) return;
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return;
  try {
    soundContext ||= new Audio();
    if (soundContext.state === "suspended") soundContext.resume().catch(() => {});
    const notes = kind === "wrong" ? [[330, 0, .12], [247, .10, .16]] : kind === "complete" ? [[523, 0, .16], [659, .12, .16], [784, .24, .22], [1047, .39, .28]] : [[587, 0, .11], [784, .09, .18]];
    const started = soundContext.currentTime;
    for (const [frequency, offset, duration] of notes) {
      const oscillator = soundContext.createOscillator(), gain = soundContext.createGain();
      const at = started + offset; oscillator.type = kind === "wrong" ? "sine" : "triangle"; oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(.0001, at); gain.gain.linearRampToValueAtTime(kind === "wrong" ? .025 : .04, at + .018); gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
      oscillator.connect(gain); gain.connect(soundContext.destination); oscillator.start(at); oscillator.stop(at + duration + .015);
    }
  } catch { /* Audio is an enhancement; learning stays usable when unavailable. */ }
}
function esc(value = "") { return String(value).replace(/[&<>'"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[c])); }
function normalize(value = "") { return value.trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "").toLocaleLowerCase("nb-NO"); }
function shuffle(list) { const out = [...list]; for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; } return out; }
function route() { return (location.hash.slice(1) || "study").split("?")[0]; }
function query() { return new URLSearchParams(location.hash.split("?")[1] || ""); }
function getVerb(id) { return VERBS.find(v => v.id === id) || VERBS[0]; }
function currentQuestion() { return state.session?.questions?.[state.session.index]; }

function countsFor(total) {
  const shift = (state.practiceSessions || 0) % DISTRIBUTION.length;
  const rotated = DISTRIBUTION.map((_, i) => DISTRIBUTION[(i + shift) % DISTRIBUTION.length]);
  const counts = DISTRIBUTION.map(([type]) => ({ type, count: 0 }));
  rotated.slice(0, Math.min(total, rotated.length)).forEach(([type]) => counts.find(x => x.type === type).count++);
  let left = total - Math.min(total, rotated.length);
  while (left-- > 0) {
    const sum = DISTRIBUTION.reduce((n, row) => n + row[2], 0); let pick = Math.random() * sum;
    const chosen = DISTRIBUTION.find(row => (pick -= row[2]) <= 0) || DISTRIBUTION[0]; counts.find(x => x.type === chosen[0]).count++;
  }
  return counts;
}
function answerChoices(verb, correct, extra = []) {
  const unique = [...new Set([verb.v1, verb.pres, verb.past, verb.pp, ...extra].filter(Boolean))];
  if (unique.length < 4) VERBS.forEach(other => { if (other.id !== verb.id && unique.length < 4 && !unique.includes(other.pres)) unique.push(other.pres); });
  if (!unique.includes(correct)) unique.unshift(correct);
  return shuffle(unique).slice(0, Math.min(4, unique.length));
}
function makeChoice(id, type, skill, prompt, verb, correct, explanation, details = {}) { return { id, type: "choice", category: type, skill, prompt, options: answerChoices(verb, correct), answer: correct, verbId: verb.id, explanation, ...details }; }
const SUBJECTS = [{ no:"Jeg", zh:"我" },{ no:"Hun", zh:"她" },{ no:"Han", zh:"他" },{ no:"Vi", zh:"我们" },{ no:"De", zh:"他们/她们" }];
const FUTURE_TIMES = [{ no:"I morgen", zh:"明天" },{ no:"Neste uke", zh:"下周" },{ no:"På fredag", zh:"周五" },{ no:"Etter kurset", zh:"课程后" },{ no:"Til sommeren", zh:"到夏天" },{ no:"I kveld", zh:"今晚" }];
const PAST_TIMES = [{ no:"I går", zh:"昨天" },{ no:"Forrige uke", zh:"上周" },{ no:"For to dager siden", zh:"两天前" },{ no:"I fjor", zh:"去年" }];
const HABIT_TIMES = [{ no:"Hver dag", zh:"每天" },{ no:"Vanligvis", zh:"通常" },{ no:"Om kvelden", zh:"晚上" },{ no:"På mandager", zh:"每周一" },{ no:"Etter jobb", zh:"下班后" }];
function sentenceId(text) { return normalize(text).replace(/[^\p{L}\p{N}]+/gu, "_"); }
function makeQuestion(type, verb, serial) {
  const id = `${type}-${verb.id}-${serial}`;
  const subject = SUBJECTS[serial % SUBJECTS.length]; const habit = HABIT_TIMES[Math.floor(serial / SUBJECTS.length) % HABIT_TIMES.length];
  if (type === "form") { const sentence = serial % 2 ? `${subject.no} ${verb.pres} ${verb.tail} ${habit.no.toLocaleLowerCase("nb-NO")}.` : `${habit.no} ${verb.pres} ${subject.no.toLocaleLowerCase("nb-NO")} ${verb.tail}.`; const prompt = serial % 2 ? `${subject.no} ___ ${verb.tail} ${habit.no.toLocaleLowerCase("nb-NO")}.` : `${habit.no} ___ ${subject.no.toLocaleLowerCase("nb-NO")} ${verb.tail}.`; return makeChoice(id, type, "动词四形", prompt, verb, verb.pres, `这是现在时 ${verb.pres}。${habit.zh} 是习惯/频率线索，动词用现在时。`, { translation: translatedSentenceZh(habit.zh, subject.zh, verbActionZh(verb)), correctSentence: sentence, answerTranslation: translatedSentenceZh("", subject.zh, verbActionZh(verb)), rule: `现在时可表达当前状态、一般事实或习惯；主语换成不同人称，挪威语动词现在时通常不随人称变化。`, rotationVariant: sentenceId(sentence) }); }
  if (type === "modal") { const modals = [{ no:"skal", zh:"计划" },{ no:"vil", zh:"想" },{ no:"kan", zh:"能够" },{ no:"må", zh:"必须" },{ no:"bør", zh:"应该" }]; const modal = modals[serial % modals.length]; const sentence = `${subject.no} ${modal.no} ${verb.v1} ${verb.tail}.`; const meaning = modalActionZh(modal.no, verb); return makeChoice(id, type, "情态 + V1", `${subject.no} ${modal.no} ___ ${verb.tail}.`, verb, verb.v1, `${modal.no}（${modal.zh}）已经承担了变位，后面的动作使用原形 ${verb.v1}，不加 -r，也不加 å。`, { translation: translatedSentenceZh("", subject.zh, meaning), correctSentence: sentence, answerTranslation: translatedSentenceZh("", subject.zh, meaning), rule: `情态动词 ${modal.no} 后直接接动词原形：${modal.no} + V1。挪威语情态动词本身变位，后面的主要动词不变位。`, rotationVariant: sentenceId(sentence) }); }
  if (type === "past") { const time = PAST_TIMES[serial % PAST_TIMES.length]; const sentence = `${time.no} ${verb.past} ${subject.no.toLocaleLowerCase("nb-NO")} ${verb.tail}.`; const meaning = translatedSentenceZh(time.zh, subject.zh, verbActionZh(verb)); return makeChoice(id, type, "过去时", `${time.no} ___ ${subject.no.toLocaleLowerCase("nb-NO")} ${verb.tail}.`, verb, verb.past, `${time.no} 明确表示过去，使用过去时 ${verb.past}。`, { translation: meaning, correctSentence: sentence, answerTranslation: meaning, rule: `明确过去时间词（如 i går、forrige uke）通常搭配过去时。主语和时间短语变化不会改变过去时词形。`, rotationVariant: sentenceId(sentence) }); }
  if (type === "perfect") { const sentence = `${subject.no} har ${verb.pp} ${verb.tail}.`; const time = ["allerede","nettopp","flere ganger","i dag"][serial % 4]; const meaning = translatedSentenceZh("", subject.zh, `已经${verbActionZh(verb)}`); return makeChoice(id, type, "har + 完成分词", `${subject.no} har ${time} ___ ${verb.tail}.`, verb, verb.pp, `har 后使用完成分词 ${verb.pp}；主语变化时 har 仍保持不变。`, { translation: meaning, correctSentence: sentence, answerTranslation: meaning, rule: `现在完成时结构是主语 + har + 完成分词。副词（allerede、nettopp）可放在完成分词前，但本题空格仍填完成分词。`, rotationVariant: sentenceId(`${subject.no} har ${time} ${verb.pp} ${verb.tail}`) }); }
  if (type === "infinitive") { const starters = [{ no:"Jeg liker å", zh:"我喜欢" },{ no:"Hun prøver å", zh:"她试着" },{ no:"Vi ønsker å", zh:"我们希望" },{ no:"De trenger å", zh:"他们需要" }]; const starter = starters[serial % starters.length]; const sentence = `${starter.no} ${verb.v1} ${verb.tail}.`; const meaning = `${starter.zh}${verbActionZh(verb)}。`; return makeChoice(id, type, "å + V1", `${starter.no} ___ ${verb.tail}.`, verb, verb.v1, `${starter.no.split(" ").slice(-1)[0]} 是变位动词/结构，后面的动作使用 å + 原形 ${verb.v1}。`, { translation: meaning, correctSentence: sentence, answerTranslation: meaning, rule: `两个动词连用时，liker / prøver / ønsker / trenger 后的第二个动词常用 å + V1；情态动词后则不加 å。`, rotationVariant: sentenceId(sentence) }); }
  if (type === "v2") return makeV2Question(serial);
  if (type === "collocation") {
    const c = COLLLOCATIONS[serial % COLLLOCATIONS.length];
    return { id, type: "choice", skill: "固定搭配", prompt: "选择自然表达：我昨天坐公交去上班。", options: shuffle(["Jeg tok bussen til jobb i går.", "Jeg gikk på buss til jobben i går.", "Jeg tok bussen på jobb i går.", "Jeg gikk bussen til jobb i går."]), answer: "Jeg tok bussen til jobb i går.", verbId: VERBS.find(v => v.v1 === "ta").id, explanation: `固定搭配是 ${c.no}。本题特别练习 ta – tar – tok – tatt 和 ta bussen。`, translation: "我昨天坐公交去上班。", correctSentence: "Jeg tok bussen til jobb i går.", answerTranslation: "我昨天坐公交去上班。", rule: "挪威语里‘坐公交/火车’使用 ta：ta bussen / ta toget。昨天要用过去时 tok。" };
  }
  if (type === "correction") { const time = FUTURE_TIMES[serial % FUTURE_TIMES.length]; const modal = ["skal","vil","kan","må"][serial % 4]; const answer = `${time.no} ${modal} ${subject.no.toLocaleLowerCase("nb-NO")} ${verb.v1} ${verb.tail}`; const wrong = `${time.no} ${modal} ${subject.no.toLocaleLowerCase("nb-NO")} ${verb.pres} ${verb.tail}`; const meaning = translatedSentenceZh(time.zh, subject.zh, modalActionZh(modal, verb)); const intent = { vil: "希望", skal: "计划", kan: "能够", må: "必须" }[modal]; return { id, type: "input", category: type, skill: "改错", prompt: `改正句子：${wrong}。`, answers: [answer, answer.replace(`${time.no} ${modal} ${subject.no.toLocaleLowerCase("nb-NO")} `, `${subject.no} ${modal} `).replace(` ${verb.tail}`, ` ${verb.tail} ${time.no.toLocaleLowerCase("nb-NO")}`)], answer, verbId: verb.id, explanation: `错误在于 ${modal} 后误用了现在时 ${verb.pres}；应使用原形 ${verb.v1}。`, translation: meaning, hint: `${time.zh}，${subject.zh}${intent}${verbActionZh(verb)}。先找出情态动词 ${modal}，再判断它后面的主要动词应该用哪种形式。`, correctSentence: `${answer}.`, answerTranslation: meaning, rule: `情态动词 ${modal} 承担了时态/情态信息，后面的主要动词要用原形（V1）。句首时间短语后还要遵守 V2：变位动词 ${modal} 紧接时间成分。`, rotationVariant: sentenceId(wrong) }; }
  const sentence = `${subject.no} ${verb.pres} ${verb.tail} ${habit.no.toLocaleLowerCase("nb-NO")}.`;
  return { id, type: "free", category: type, skill: "自由输出", prompt: `用挪威语写一句关于${subject.zh}自己的句子，使用动词“${verb.v1}”，可加入时间“${habit.no.toLocaleLowerCase("nb-NO")}”。`, verbId: verb.id, target: verb.v1, example: sentence, translation: `写一句使用 ${verb.v1} 的个人化表达。`, correctSentence: sentence, answerTranslation: translatedSentenceZh(habit.zh, subject.zh, verbActionZh(verb)), rotationVariant: sentenceId(sentence) };
}
function makeV2Question(serial, verb = VERBS[0]) { const mode = serial % 3; const subject = SUBJECTS[Math.floor(serial / 3) % SUBJECTS.length];
  if (mode === 0) { const time = FUTURE_TIMES[Math.floor(serial / 5) % FUTURE_TIMES.length]; const modal = ["skal","vil","kan"][Math.floor(serial / 2) % 3]; const first = `${time.no} ${modal} ${subject.no.toLocaleLowerCase("nb-NO")} ${verb.v1} ${verb.tail}`; const second = `${subject.no} ${modal} ${verb.v1} ${verb.tail} ${time.no.toLocaleLowerCase("nb-NO")}`; const meaning = translatedSentenceZh(time.zh, subject.zh, modalActionZh(modal, verb)); return { id:`v2-${verb.id}-${serial}`, type:"input", category:"v2", skill:"V2 语序", prompt:`把词语组成句子（注意 V2）：${time.no} / ${subject.no.toLocaleLowerCase("nb-NO")} / ${modal} / ${verb.v1} / ${verb.tail}`, answers:[first,second], answer:first, verbId:verb.id, explanation:`时间放句首时，${modal} 必须紧跟在时间成分后，主语 ${subject.no.toLocaleLowerCase("nb-NO")} 放在它后面。时间也可以放句末，形成另一种自然语序。`, translation:meaning, correctSentence:`${first}.`, answerTranslation:meaning, rule:`挪威语主句遵守 V2：句首时间成分算第一位，变位动词 ${modal} 位于第二位。`, rotationVariant:sentenceId(first) }; }
  if (mode === 1) { const time = PAST_TIMES[Math.floor(serial / 3) % PAST_TIMES.length]; const first = `${time.no} ${verb.past} ${subject.no.toLocaleLowerCase("nb-NO")} ${verb.tail}`; const second = `${subject.no} ${verb.past} ${verb.tail} ${time.no.toLocaleLowerCase("nb-NO")}`; const meaning = translatedSentenceZh(time.zh, subject.zh, verbActionZh(verb)); return { id:`v2-${verb.id}-${serial}`, type:"input", category:"v2", skill:"V2 语序", prompt:`用过去时组成自然句：${time.no} / ${subject.no.toLocaleLowerCase("nb-NO")} / ${verb.past} / ${verb.tail}`, answers:[first,second], answer:first, verbId:verb.id, explanation:`时间放句首时，变位动词 ${verb.past} 仍占第二位；主语随之放在动词后。`, translation:meaning, correctSentence:`${first}.`, answerTranslation:meaning, rule:`V2 不等于“第二个单词”，而是主句第一个成分后接变位动词。`, rotationVariant:sentenceId(first) }; }
  const time = HABIT_TIMES[Math.floor(serial / 4) % HABIT_TIMES.length]; const first = `${time.no} ${verb.pres} ${subject.no.toLocaleLowerCase("nb-NO")} ${verb.tail}`; const second = `${subject.no} ${verb.pres} ${verb.tail} ${time.no.toLocaleLowerCase("nb-NO")}`; const meaning = translatedSentenceZh(time.zh, subject.zh, verbActionZh(verb)); return { id:`v2-${verb.id}-${serial}`, type:"input", category:"v2", skill:"V2 语序", prompt:`用习惯表达组成自然句：${time.no} / ${subject.no.toLocaleLowerCase("nb-NO")} / ${verb.pres} / ${verb.tail}`, answers:[first,second], answer:first, verbId:verb.id, explanation:`${time.zh} 放在句首时，变位动词 ${verb.pres} 紧随其后；若主语放句首，则动词在主语后。`, translation:meaning, correctSentence:`${first}.`, answerTranslation:meaning, rule:"主句 V2 规则按成分数位置：句首时间状语是第一成分，变位动词必须是第二成分。", rotationVariant:sentenceId(first) };
}
function buildSession(total, onlyVerbId = null) {
  const counts = countsFor(total), history = state.questionHistory || []; const pool = onlyVerbId ? [getVerb(onlyVerbId)] : shuffle(VERBS); let serial = Date.now(); const qs = []; const usedCollocations = new Set();
  counts.forEach(({ type, count }) => { for (let i = 0; i < count; i++) {
    const available = pool.filter(v => !qs.some(q => q.category === type && q.verbId === v.id));
    const recentHistory = history.slice(-100);
    const fresh = available.filter(v => !recentHistory.some(key => key === `${type}:${v.id}` || key.startsWith(`${type}:${v.id}:`)));
    const candidates = fresh.length ? fresh : available;
    const weighted = candidates.map(v => { const mastery = state.questionMastery?.[`${type}:${v.id}`]; return { v, weight: studyPriority(v.v1) * (mastery ? (mastery.streak >= 2 ? .35 : mastery.streak === 0 ? 2 : .8) : 1) }; });
    const weightSum = weighted.reduce((sum, item) => sum + item.weight, 0); let pick = Math.random() * weightSum;
    const verb = (weighted.find(item => (pick -= item.weight) <= 0) || weighted[0])?.v || pool[i % pool.length];
    let q;
    if (type === "v2") q = makeV2Question(serial++, verb);
    else if (type === "collocation") { const unseen = COLLOCATIONS.filter(x => !usedCollocations.has(x.no)); const freshPhrases = unseen.filter(x => !history.slice(-100).includes(`collocation:${sentenceId(x.no)}`)); const c = shuffle(freshPhrases.length ? freshPhrases : unseen)[0] || shuffle(COLLOCATIONS)[0]; usedCollocations.add(c.no); q = { id: `${type}-${serial++}`, type: "choice", category: type, skill: "固定搭配", prompt: `选择与“${c.zh}”对应的自然搭配。`, options: shuffle([c.no, ...shuffle(COLLOCATIONS.filter(x => x.no !== c.no)).slice(0, 3).map(x => x.no)]), answer: c.no, verbId: verb.id, explanation: `固定搭配 ${c.no} 表示“${c.zh}”。请把短语连同例句一起记忆。`, translation: c.zh, correctSentence: c.example, answerTranslation: c.zh, rule: "挪威语动词常和介词或不定式组成搭配，适合整块记忆。" }; }
    else q = makeQuestion(type, verb, serial++);
    q.rotationKey = type === "collocation" ? `collocation:${sentenceId(q.answer)}` : `${type}:${verb.id}:${q.rotationVariant || sentenceId(q.correctSentence || q.prompt)}`; qs.push(q);
  }});
  state.practiceSessions = (state.practiceSessions || 0) + 1; state.questionHistory = [...history, ...qs.map(q => q.rotationKey)].slice(-120);
  return { questions: shuffle(qs), index: 0, answers: {}, total };
}

function render() {
  const activeRoute = ["topic","topics","verbs","learn","learnstudy","today","setup","practice","summary"].includes(route()) ? "study" : route();
  document.querySelectorAll("[data-route]").forEach(a => a.classList.toggle("active", a.dataset.route === activeRoute));
  document.body.classList.toggle("focus-mode", ["learnstudy", "practice"].includes(route()));
  if (route() === "learn" && query().get("verb")) { document.querySelector("#app").innerHTML = renderLearnDetail(getVerb(query().get("verb"))); bindView(); return; }
  const views = { study: renderStudy, today: renderStudy, setup: renderSetup, practice: renderPractice, summary: renderSummary, verbs: renderVerbs, learn: renderLearn, learnstudy: renderLearnStudy, topics: renderTopics, topic: renderFremtidUnit, read: renderReading, mistakes: renderMistakes, speak: renderSpeak, account: renderAccount };
  document.querySelector("#app").innerHTML = (views[route()] || renderStudy)(); bindView();
}
function renderAccount() {
  const params = new URLSearchParams(location.search); const resetToken = params.get("reset"); if(params.get("verified")==="1") accountNotice="邮箱已验证，现在可以登录了。";
  if (resetToken || params.get("recovery")==="1" || accountMode==="reset") return `<section class="panel account-panel"><span class="eyebrow">账号安全 · 重置密码</span><h1>设置新密码</h1><p class="muted">新密码至少12位。保存后请用新密码登录。</p><form class="account-form" data-account-form="reset"><label>新密码<input name="password" type="password" minlength="12" maxlength="128" autocomplete="new-password" required></label><button class="button primary" type="submit">更新密码</button></form>${accountNotice?`<p class="account-notice">${esc(accountNotice)}</p>`:""}</section>`;
  if (accountUser) {
    const rows = boardRows.length ? boardRows.map((row,i)=>`<li class="leader-row ${row.nickname===accountUser.nickname?"me":""}"><span class="leader-rank">${i+1}</span><strong>${esc(row.nickname)}</strong><span>${Number(row.points).toLocaleString()} 分</span></li>`).join("") : `<li class="leader-empty">排行榜加载中，完成练习后这里会更新。</li>`;
    const earnedByCode = new Map(accountMedals.map(m => [m.code, m]));
    const goalCards = accountMedalGoals.map(goal => renderMedalCard(goal, earnedByCode.get(goal.code)));
    const featuredCodes = new Set(accountMedalGoals.map(goal => goal.code));
    const specialCards = accountMedals.filter(m => !featuredCodes.has(m.code)).map(m => renderMedalCard({ ...earnedMedalDetails(m), ...m, progress: 1, threshold: 1 }, m));
    const habits = accountStudyHabits;
    return `<section class="panel wide account-panel"><span class="eyebrow">账户 · 学习积分</span><h1>你好，${esc(accountUser.nickname)}！</h1><p class="muted">邮箱由登录服务安全管理，不会显示在排行榜。完成练习、答题和主动回忆可累计积分；每天最多计入300分。</p>${renderTrainingSettings()}<div class="account-stats"><div><strong>${Number(accountUser.points||0).toLocaleString()}</strong><span>总积分</span></div><div><strong>${accountMedals.length}</strong><span>已获得奖牌</span></div><div><strong>${habits.currentStreak}</strong><span>当前连续学习日</span></div><div><strong>${habits.monthDays}/20</strong><span>本月有效学习日</span></div></div><section class="medal-intro"><span class="eyebrow">学习日的计算方式</span><p>按挪威当地日期统计，当天累计至少获得 <strong>10 分</strong>才算一个有效学习日；只登录不计。每月达 20 天获得月牌；年度牌按 120 / 180 / 240 天递进。</p><p class="fine-print">连续学习奖励：3、7、30、90、180、365、730、1,095 天。年度与月度奖牌按各自自然年/月记录。</p></section><h2>奖牌陈列室</h2><div class="medal-group-label">连续学习与阶段目标</div><div class="medal-grid">${goalCards.join("")}${specialCards.join("")}</div><div class="leader-heading"><div><span class="eyebrow">学习社区</span><h2>排行榜</h2></div><div class="board-tabs"><button class="${boardPeriod==="all"?"selected":""}" data-board-period="all">总榜</button><button class="${boardPeriod==="week"?"selected":""}" data-board-period="week">本周</button></div></div><ol class="leaderboard">${rows}</ol><div class="actions"><button class="button secondary" data-auth-logout>退出登录</button></div>${accountNotice?`<p class="account-notice">${esc(accountNotice)}</p>`:""}</section>`;
  }
  const form = accountMode === "register" ? `<form class="account-form" data-account-form="register"><label>公开昵称<input name="nickname" minlength="2" maxlength="24" autocomplete="nickname" required></label><label>邮箱（不会公开）<input name="email" type="email" maxlength="254" autocomplete="email" required></label><label>密码（至少12位）<input name="password" type="password" minlength="12" maxlength="128" autocomplete="new-password" required></label><p class="fine-print">注册即表示你同意使用昵称公开展示积分榜。请勿在昵称中填写邮箱、真实姓名等隐私信息。</p><button class="button primary" type="submit">创建账号并发送验证邮件</button></form>` : accountMode === "forgot" ? `<form class="account-form" data-account-form="forgot"><label>注册邮箱<input name="email" type="email" autocomplete="email" required></label><button class="button primary" type="submit">发送重置链接</button></form>` : `<form class="account-form" data-account-form="login"><label>邮箱<input name="email" type="email" autocomplete="email" required></label><label>密码<input name="password" type="password" autocomplete="current-password" required></label><button class="button primary" type="submit">登录</button></form>`;
  return `<section class="panel account-panel"><span class="eyebrow">账号 · 排行榜 · 奖牌</span><h1>${accountMode==="register"?"创建学习账号":accountMode==="forgot"?"找回密码":"登录 Norsk hver dag"}</h1><p class="muted">跨设备保存学习积分和奖牌，查看本周与总积分榜。</p>${renderTrainingSettings()}${accountBackendUnavailable?`<div class="feedback close"><h3>账号服务正在配置中</h3><p>需要先配置 Supabase 邮箱认证、Cloudflare D1 数据库并部署 Worker；配置完成后即可注册。</p></div>`:""}${verificationEmail?`<form class="account-form resend-form" data-account-form="resend"><input type="hidden" name="email" value="${esc(verificationEmail)}"><button class="button secondary" type="submit">重发验证邮件</button></form>`:""}${form}<div class="account-switch">${accountMode==="login"?`<button class="text-button" data-account-mode="register">创建账号</button><button class="text-button" data-account-mode="forgot">忘记密码</button>`:`<button class="text-button" data-account-mode="login">返回登录</button>`}</div>${accountNotice?`<p class="account-notice">${esc(accountNotice)}</p>`:""}<p class="fine-print">邮箱验证和密码由 Supabase Auth 管理；D1 只保存排行榜昵称、积分和奖牌。公开榜单仅展示昵称与分数。</p></section>`;
}
function medalTier(tier = "bronze") { return ["bronze", "silver", "gold", "diamond", "special"].includes(tier) ? tier : "bronze"; }
function earnedMedalDetails(medal) {
  if (/^month-\d{4}-\d{2}$/.test(medal.code)) return { description: "本自然月完成 20 个有效学习日", category: "月度学习", tier: "gold" };
  const yearly = medal.code.match(/^year-\d{4}-(120|180|240)$/);
  if (yearly) return { description: `本自然年完成 ${yearly[1]} 个有效学习日`, category: "年度学习", tier: yearly[1] === "240" ? "diamond" : yearly[1] === "180" ? "gold" : "silver" };
  const streak = medal.code.match(/^streak-(\d+)$/);
  if (streak) return { description: `连续 ${Number(streak[1]).toLocaleString()} 个有效学习日`, category: "连续学习", tier: Number(streak[1]) >= 365 ? "diamond" : Number(streak[1]) >= 90 ? "gold" : Number(streak[1]) >= 30 ? "silver" : "bronze" };
  return { description: "在特别的日子里坚持学习", category: "特别日期", tier: "special" };
}
function medalArt(tier) {
  return `<svg class="medal-art" viewBox="0 0 100 116" aria-hidden="true"><path class="medal-ribbon" d="M28 5h18l7 32-15-8-15 8zM54 5h18l-2 32-15-8-14 8z"/><circle class="medal-disc" cx="50" cy="66" r="32"/><circle class="medal-ring" cx="50" cy="66" r="25"/><path class="medal-star" d="m50 46 6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2z"/><circle class="medal-jewel" cx="50" cy="66" r="3"/></svg>`;
}
function renderMedalCard(goal, earned) {
  const tier = medalTier(goal.tier), completed = Boolean(earned || goal.earned), progress = Number(goal.progress || 0), target = Number(goal.threshold || 1);
  const ratio = completed ? 100 : Math.max(0, Math.min(100, Math.round(progress / target * 100)));
  const date = earned?.earnedAt ? String(earned.earnedAt).slice(0, 10) : "";
  return `<article class="medal-card ${completed ? "is-earned" : "is-locked"} tier-${tier}"><div class="medal-art-wrap">${medalArt(tier)}${completed ? `<span class="medal-check" aria-label="已获得">✓</span>` : ""}</div><span class="medal-category">${esc(goal.category || "学习成就")}</span><strong>${esc(goal.title)}</strong><small class="medal-description">${esc(goal.description || "完成学习挑战，收集这枚纪念奖牌。")}</small><div class="medal-progress"><span style="width:${ratio}%"></span></div><small class="medal-status">${completed ? `已获得${date ? ` · ${esc(date)}` : ""}` : `${progress.toLocaleString()} / ${target.toLocaleString()} · ${ratio}%`}</small></article>`;
}
function renderTrainingSettings() {
  const selected = Number(state.trainingSettings?.dailyQuestionCount) || 10;
  const soundOn = state.soundEffects !== false;
  const dailyPlan = state.trainingSettings?.dailyPlan || "lesson-vocab-reading";
  const plans = [["lesson","只做今日学习"],["lesson-vocab","今日学习 + 词汇"],["lesson-vocab-reading","今日学习 + 词汇 + 阅读"]];
  return `<section class="training-settings"><div><span class="eyebrow">练习偏好 · 仅保存在本设备</span><h2>每日默认题量</h2><p class="muted">今日页会一键开始这个数量；临时想多练或少练，可在开始前点“调整题量”。</p></div><div class="count-pills">${[5,10,15,20,30].map(n=>`<button type="button" class="count-pill ${n===selected?"selected":""}" data-preferred-count="${n}" aria-pressed="${n===selected}">${n}题</button>`).join("")}</div><p class="fine-print" data-count-saved aria-live="polite">当前默认：${selected}题</p><h3 class="daily-plan-title">今日任务组合</h3><p class="muted">选择每天要完成的内容；今日页只统计你选中的任务。</p><div class="daily-plan-options">${plans.map(([id,label])=>`<button type="button" class="daily-plan-option ${dailyPlan===id?"selected":""}" data-daily-plan="${id}" aria-pressed="${dailyPlan===id}">${label}</button>`).join("")}</div><p class="fine-print" data-plan-saved aria-live="polite">${plans.find(([id])=>id===dailyPlan)?.[1]} · 可随时更改</p><div class="sound-preference"><div><strong>答题音效</strong><small>答题反馈和完成练习时播放轻提示音</small></div><button type="button" class="sound-toggle ${soundOn?"selected":""}" data-toggle-sfx aria-pressed="${soundOn}">${soundOn?"开启":"关闭"}</button></div></section>`;
}
function progressForSkill(skill) { return Math.max(25, 78 - state.mistakes.filter(m => m.skill === skill).length * 7); }
function renderToday() {
  const s = state.session; const done = s ? Object.keys(s.answers || {}).length : 0; const total = s?.total || 0; const pct = total ? Math.round(done / total * 100) : 0;
  return `<section class="hero"><div class="hero-main"><div class="eyebrow">Dagens økt · 今日训练</div><h1>练到开口时<br>不再犹豫。</h1><p>先选择题量，系统会按学习目标分配题型。每个动词会在四形、情态、过去、完成和固定搭配中反复出现。</p><button class="button primary" data-start>${s ? "继续今日训练" : "选择题量并开始"}</button></div><aside class="hero-side"><div><span class="streak">${state.streak}<small>天连续学习 · streak</small></span></div><div><div class="metric-head"><strong>${s ? "本次进度" : "准备开始"}</strong><span>${s ? `${done}/${total}` : "5–30题"}</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div></aside></section><section class="grid"><article class="panel"><span class="tag">弱项雷达</span><h2 style="margin-top:12px">你的四个盒子</h2><div class="metric-row">${["动词四形","情态 + V1","过去时","har + 完成分词","V2 语序"].map(skill => `<div><div class="metric-head"><strong>${skill}</strong><span>${progressForSkill(skill)}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${progressForSkill(skill)}%"></div></div></div>`).join("")}</div></article><article class="panel"><span class="tag">科学分配</span><h2 style="margin-top:12px">每次都练完整链条</h2><p class="muted">先识别形态，再放进情境，最后用固定搭配和复习迁移。错题会回到你的错误库，不会只出现一次。</p><div class="rule-box"><strong>四句话记一个词：</strong><br><span class="example">Jeg jobber. · Jeg skal jobbe. · Jeg jobbet. · Jeg har jobbet.</span></div></article></section>`;
}
function localDayKey() { return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date()); }
function dailyReadingArticle() { const day = Math.floor(Date.parse(`${localDayKey()}T12:00:00Z`) / 86400000); return window.READING_LIBRARY[((day % window.READING_LIBRARY.length) + window.READING_LIBRARY.length) % window.READING_LIBRARY.length]; }
function renderStudy() {
  const day = localDayKey(), readDone = state.readingProgress?.[day]?.done, daily = state.dailyProgress?.[day] || {}, due = Object.values(state.review || {}).filter(item => item.dueAt <= Date.now()).length;
  const s = state.session, completed = s ? Object.keys(s.answers || {}).length : 0, count = Number(state.trainingSettings?.dailyQuestionCount) || 10;
  const plan = state.trainingSettings?.dailyPlan || "lesson-vocab-reading", includeVocab = plan !== "lesson", includeReading = plan === "lesson-vocab-reading";
  const tasks = [{ enabled: true, done: !!daily.practice }, { enabled: includeVocab, done: !!daily.vocab }, { enabled: includeReading, done: !!readDone }].filter(task => task.enabled);
  const taskDone = tasks.filter(task => task.done).length, taskTotal = tasks.length, taskPercent = Math.round(taskDone / taskTotal * 100);
  const article = dailyReadingArticle();
  return `<section class="hero"><div class="hero-main"><div class="eyebrow">Dagens læring · 今日学习</div><h1>每天一点，<br>把挪威语用起来。</h1><p>按你的每日计划安排结构练习${includeVocab?"、词汇回忆":""}${includeReading?"和情境阅读":""}。先回忆，再核对，再把词句用于自己的生活。</p><div class="actions"><button class="button primary" data-start-daily>${s ? `继续上次练习 ${completed}/${s.total}` : `开始今日练习 · ${count}题`}</button>${s?"":`<button class="button secondary" data-change-count>调整题量</button>`}${includeVocab?`<button class="button secondary" data-start-vocab-daily>复习到期词 ${due ? `· ${due}` : ""}</button>`:""}</div></div><aside class="hero-side"><span class="streak">${state.streak}<small>天连续学习</small></span><div class="metric-head"><strong>今日任务</strong><span>${taskDone}/${taskTotal}</span></div><div class="progress-track"><div class="progress-fill" style="width:${taskPercent}%"></div></div><p class="muted">${includeVocab?`练习 ${count} 题 · 记忆 5 词${includeReading?" · 阅读 1 篇":""}`:`完成今日 ${count} 道练习题`}</p></aside></section><section class="grid"><article class="panel daily-task"><span class="tag">① 今日学习</span><h2>短时集中练习</h2><p class="muted">题型按比例轮换，最近做过的动词尽量暂缓出现。</p><button class="button primary" data-start-daily>${s ? "继续上次练习" : `开始${count}题`}</button>${s?"":`<button class="text-button daily-count-adjust" data-change-count>调整题量</button>`}</article>${includeVocab?`<article class="panel daily-task"><span class="tag">② 词汇记忆</span><h2>在句子里记词</h2><p class="muted">优先复习到期词与高频词；混合动词、名词和专题词汇。</p><button class="button secondary" data-start-vocab-daily>开始5词主动回忆</button></article>`:""}${includeReading?`<article class="panel daily-task"><span class="tag">③ 今日阅读</span><h2>${esc(article.title)}</h2><p class="muted">${esc(article.deck)} · ${readDone?"已完成":"约5分钟"}</p><a class="button secondary topic-shortcut" href="#read">${readDone?"重读并复习":"打开今日短文"}</a></article>`:""}<article class="panel daily-task"><span class="tag">内容库</span><h2>按需要继续学习</h2><p class="muted">词汇按主题组织，专题将词汇、语法、句子与练习串起来。</p><div class="actions"><a class="button secondary topic-shortcut" href="#learn">词汇库</a><a class="button secondary topic-shortcut" href="#topics">专题库</a></div></article></section>`;
}
function readingTokens(article, sentence) {
  const surfaces = article.words.flatMap(word => word.surface.map(surface => ({ surface, word }))).sort((a, b) => b.surface.length - a.surface.length);
  const matcher = new RegExp("(" + surfaces.map(item => item.surface).join("|") + ")", "giu");
  return sentence.split(matcher).map(part => {
    const found = surfaces.find(item => item.surface.toLocaleLowerCase("nb-NO") === part.toLocaleLowerCase("nb-NO"));
    return found ? '<button class="article-token" data-read-word="' + esc(found.word.id) + '">' + esc(part) + "</button>" : esc(part);
  }).join("");
}
function renderReading() {
  const articles = window.READING_LIBRARY, article = articles.find(item => item.id === query().get("id")) || dailyReadingArticle();
  const saved = state.readingProgress?.[localDayKey()]?.articleId === article.id && state.readingProgress?.[localDayKey()]?.done;
  const lookup = state.readingLookup?.articleId === article.id ? state.readingLookup : null;
  const lookupHtml = lookup ? `<section class="reading-lookup" id="reading-lookup"><span class="eyebrow">${esc(lookup.kind === "word" ? lookup.word.pos : "句子讲解")}</span><h2>${esc(lookup.kind === "word" ? lookup.word.lemma : lookup.no)}</h2><p><strong>${esc(lookup.kind === "word" ? lookup.word.zh : lookup.zh)}</strong></p><p>${esc(lookup.kind === "word" ? lookup.word.note : lookup.note)}</p>${lookup.kind === "word" ? `<p class="muted">${esc(lookup.word.forms)}</p><div class="rule-box"><b>情境例句：</b>${esc(lookup.word.example)}<br>${esc(lookup.word.exampleZh)}</div><div class="actions"><button class="button secondary" data-read-speak="${esc(lookup.word.lemma)}">🔊 听发音</button><button class="button primary" data-read-save="${esc(lookup.word.id)}">${state.savedWords.some(w=>w.id===`${article.id}:${lookup.word.id}`)?"已加入复习":"加入词汇复习"}</button></div>`:`<button class="sound-button" data-read-speak="${esc(lookup.no)}">🔊 听句子</button>`}<button class="text-button reading-lookup-close" data-reading-lookup-close>收起词语解释</button></section>` : "";
  const lookupSentence = lookup?.kind === "word" ? article.sentences.findIndex(([sentence]) => lookup.word.surface.some(surface => sentence.toLocaleLowerCase("nb-NO").includes(surface.toLocaleLowerCase("nb-NO")))) : -1;
  const lines = article.sentences.map(([no, zh, grammar], i) => {
    const tokens = readingTokens(article, no);
    return `<article class="reading-line"><div class="reading-no"><span>${i+1}</span><p>${tokens}</p></div><button class="text-button" data-read-line="${i}">显示翻译与语法</button><div class="reading-translation" id="read-line-${i}" hidden><p>${esc(zh)}</p><small>${esc(grammar)}</small><button class="sound-button" data-say="${esc(no)}">🔊 听句子</button></div>${i === lookupSentence ? lookupHtml : ""}</article>`;
  }).join("");
  return `<section class="panel wide reading-page"><div class="reading-top"><div><span class="eyebrow">Les · 分级阅读 · ${esc(article.level)} · ${esc(article.theme)}</span><h1>${esc(article.title)}</h1><p class="muted">${esc(article.deck)} <span class="tag">原创分级短文</span></p></div><select data-reading-select aria-label="选择阅读文章">${articles.map(item=>`<option value="${esc(item.id)}" ${item.id===article.id?"selected":""}>${esc(item.title)}</option>`).join("")}</select></div><p class="reading-instruction">先读挪威语，点橙色词看词义；解释会显示在对应句子下方。每句也可展开翻译和语法。页面内容为人工编写，不是实时新闻。</p><div class="reading-lines">${lines}</div><div class="actions"><button class="button ${saved?"secondary":"primary"}" data-read-done>${saved?"✓ 今日已完成阅读":"完成今日阅读"}</button><button class="button secondary" data-go-study>返回学习</button></div><h2 class="topic-heading">本篇重点词</h2><div class="topic-grid">${article.words.map(word=>`<div class="reading-word-entry"><button class="learn-card" data-read-word="${esc(word.id)}"><strong>${esc(word.lemma)}</strong><div>${esc(word.zh)} · ${esc(word.pos)}</div><span class="learn-forms">${esc(word.forms)}</span></button>${lookupSentence < 0 && lookup?.kind === "word" && lookup.word.id === word.id ? lookupHtml : ""}</div>`).join("")}</div><h2 class="topic-heading">选择其他短文</h2><div class="topic-grid">${articles.map(item=>`<button class="topic-card article-choice" data-article="${esc(item.id)}"><div class="topic-icon">文</div><div class="topic-info"><span class="topic-level">${esc(item.level)} · ${esc(item.theme)}</span><h3>${esc(item.title)}</h3><p>${esc(item.deck)}</p></div></button>`).join("")}</div></section>`;
}
function renderSetup() {
  const requested = Number(query().get("n")); const selected = [5,10,15,20,30].includes(requested) ? requested : (Number(state.trainingSettings?.dailyQuestionCount) || 10); const counts = countsFor(selected);
  return `<section class="panel setup-panel"><span class="eyebrow">Dagens økt · 设置本次训练</span><h1 style="font-size:44px">你想练多少题？</h1><p class="muted">题量越大，覆盖的动词和题型越多。建议每天10–15题，连续学习比一次做很多题更有效。</p><div class="count-grid">${[5,10,15,20,30].map(n => `<button class="count-option ${n === selected ? "selected" : ""}" data-count="${n}"><strong>${n}</strong><span>道题</span></button>`).join("")}</div><div class="distribution-card"><h3>本次自动分配</h3><div class="distribution-list">${counts.filter(x => x.count).map(x => `<div><span>${DISTRIBUTION.find(d => d[0] === x.type)?.[1] || x.type}</span><strong>${x.count}</strong></div>`).join("")}</div></div><div class="actions"><button class="button primary" data-begin="${selected}">开始${selected}题训练</button><button class="button secondary" data-back-today>返回</button></div></section>`;
}
function renderPractice() {
  const q = currentQuestion(); if (!q) return renderSummary(); const answered = state.session.answers?.[q.id]; const pct = Math.round(state.session.index / state.session.total * 100); let ui = "";
  if (q.type === "choice") ui = `<div class="options">${q.options.map(o => `<button class="option" data-choice="${esc(o)}" ${answered ? "disabled" : ""}>${esc(o)}</button>`).join("")}</div>`;
  if (q.type === "input") ui = `<input class="answer" id="answer-input" autocomplete="off" placeholder="Skriv svaret …" ${answered ? "disabled" : ""}><div class="actions"><button class="button primary" data-check ${answered ? "disabled" : ""}>检查答案</button></div>`;
  if (q.type === "free") ui = `<textarea id="free-answer" placeholder="Skriv på norsk …" ${answered ? "disabled" : ""}></textarea><div class="actions"><button class="button primary" data-check-free ${answered ? "disabled" : ""}>分析我的句子</button><button class="button secondary" data-example>显示参考框架</button></div>`;
  const savedFeedback = answered ? detailedFeedback(q, answered.ok ? "good" : "bad", answered.ok ? "✓ 已答对" : "已记录错题", answered.given) : "";
  return `<section class="question-card"><div class="question-meta"><span>${esc(q.skill)} · ${state.session.index + 1}/${state.session.total}</span><span>第${state.session.index + 1}题</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><div class="prompt">${esc(q.prompt)}</div>${q.hint ? `<div class="prompt-translation"><strong>思考方向：</strong>${esc(q.hint)}</div>` : q.translation ? `<div class="prompt-translation"><strong>语境参考：</strong>${esc(q.translation)}</div>` : ""}${ui}<div id="feedback">${savedFeedback}</div></section>`;
}
function renderSummary() { const sum = state.lastSummary || { correct: 0, total: 0, mistakes: 0 }; return `<section class="panel center summary-panel"><span class="eyebrow">Økt ferdig · 本次完成</span><h1 style="font-size:48px">做得很好。</h1><div class="summary-score">${sum.correct}<small>/${sum.total} 正确</small></div><p class="muted">${sum.mistakes ? `有${sum.mistakes}道题进入错误库，下一次会优先复习。` : "本次没有新增错题。"}</p><div class="actions" style="justify-content:center"><button class="button primary" data-start>再练一次</button><button class="button secondary" data-go-learn>去背词</button></div></section>`; }
function renderVerbs() { return `<section class="panel wide"><span class="eyebrow">Verb · 动词</span><h1 style="font-size:44px">动词词形参考</h1><p class="muted">共 ${VERBS.length} 个动词参考。词汇记忆主页还包含名词和其它词类；这里保留动词变位速查。</p><div class="verb-list">${VERBS.map(v => `<article class="verb-row verb-entry"><div class="verb-forms">${esc(v.v1)} – ${esc(v.pres)} – ${esc(v.past)} – ${esc(v.pp)}</div><div class="translation">${esc(v.zh)} · <span class="example">${esc(v.phrase)}</span></div><div class="verb-entry-actions"><button class="sound-button" data-say="${esc(v.v1)}" type="button">🔊 听原形</button><button class="button secondary verb-detail-button" data-verb="${v.id}" type="button">四形讲解</button></div></article>`).join("")}</div></section>`; }
function renderTopics() {
  const topic = window.FREMTID_TOPIC; const progress = state.topicProgress?.fremtid || {};
  const units = [["grammar","语法讲解","8个核心小节 · 对比未来表达、V2语序和时态"],["vocab","情境词汇","82个主题词 · 每词含例句、中文译文和发音"],["dialogue","听读对话","Ingrid 与 Marta 谈未来 · 逐句翻译与朗读"],["reading","分段阅读","Emil 的新年目标 · 双语阅读理解"],["practice","自适应综合题库",`${topicQuestionBank().length}道题 · 全部词条、例句、课文段落、语法与未来目标`],["writing","写作迁移","8个写作任务 · 自己输出后对照自检"]];
  const done = Object.keys(progress).filter(key => progress[key]).length;
  return `<section class="panel wide topic-hub"><span class="eyebrow">专题学习 · 由课本整理</span><h1>${topic.icon} ${esc(topic.title)}</h1><p class="muted">${esc(topic.intro)}</p><div class="topic-course-hero"><div><strong>学习目标</strong><ul>${topic.goals.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div><div class="course-score"><strong>${done}/6</strong><span>已完成学习环节</span></div></div><div class="topic-roadmap">${units.map(([id,title,desc], i) => `<article class="topic-unit-card"><span class="unit-number">${String(i+1).padStart(2,"0")}</span><div><h2>${title}</h2><p>${desc}</p></div><button class="button ${progress[id] ? "secondary" : "primary"}" data-topic-open="${id}">${progress[id] ? "继续学习" : "开始"}</button></article>`).join("")}</div><aside class="source-note"><strong>本专题的学习闭环</strong><p>先理解规则与词义，再听读原文，最后做自动判分练习和个人写作。自由写作目前提供自检清单，不会假装由 AI 自动批改。</p></aside></section>`;
}
function futurePlanQuestions() {
  const plans = [
    ["spise sunnere", "spiser sunnere", "吃得更健康"], ["lære et nytt språk", "lærer et nytt språk", "学习一门新语言"], ["lese flere bøker", "leser flere bøker", "多读一些书"], ["bruke mindre tid på telefonen", "bruker mindre tid på telefonen", "少花些时间看手机"], ["spare mer penger", "sparer mer penger", "多存一些钱"], ["reise til et nytt land", "reiser til et nytt land", "去一个新的国家旅行"], ["besøke familien min oftere", "besøker familien min oftere", "更经常去看望家人"]
  ];
  return plans.flatMap(([infinitive, present, zh], i) => {
    const structures = [
    ["presens", `Neste år ${present.split(" ")[0]} jeg ${present.split(" ").slice(1).join(" ")}.`, `明年我会${zh}（作为已安排/时间表的事项）。`],
      ["skal", `Neste år skal jeg ${infinitive}.`, `我计划明年${zh}。`],
      ["kommer", `Neste år kommer jeg til å ${infinitive}.`, `我预计明年会${zh}。`],
      ["vil", `Neste år vil jeg ${infinitive}.`, `我希望/想在明年${zh}。`]
    ];
    return structures.map(([type, sentence, translation]) => ({ id: `plan-${i}-${type}`, type: "sentence", skill: `未来目标 · ${type}`, prompt: sentence, answer: translation, correctSentence: sentence, translation, why: `${type === "presens" ? "现在时配合明确的未来时间可表示安排好的事项。" : type === "skal" ? "skal + 动词原形表达计划。" : type === "kommer" ? "kommer til å + 动词原形表达预测或预期。" : "vil + 动词原形表达愿望或意愿。"}同一目标换一种结构，语气也随之改变。`, priority: ["skal", "vil"].includes(type) ? 1.5 : 1 }));
  });
}
function stableOptions(answer, alternatives, seed = 0) {
  const rest = [...new Set(alternatives.filter(item => item && item !== answer))].slice(0, 3);
  const list = [answer, ...rest]; while (list.length < 4) list.push(answer);
  const correctAt = seed % 4; const distractors = list.slice(1); const out = [];
  for (let i=0;i<4;i++) out.push(i===correctAt ? answer : distractors.shift());
  return out;
}
function topicQuestionBank() {
  const topic = window.FREMTID_TOPIC; const entries = topic.vocabulary; const bank = [];
  entries.forEach((v, i) => {
    const peers = entries.filter((x, j) => j !== i && x.pos === v.pos);
    bank.push({ id: `f-word-${i}`, skill: `词汇 · ${v.pos}`, prompt: `在句子中理解这个词：${v.sentence}\n\n${v.pos}「${v.zh}」对应哪个词？`, answer: v.word, options: stableOptions(v.word, [...peers.map(x => x.word), ...entries.filter((x,j)=>j!==i&&x.pos!==v.pos).map(x=>x.word)], i), correctSentence: v.sentence, translation: v.translation, why: `${v.word} 在本句中表示“${v.zh}”。词形提示：${v.forms}。先结合整句和画面线索理解，不要只孤立背中文。`, priority: studyPriority(v.word) });
    const distractors = entries.filter((x, j) => j !== i && x.translation !== v.translation).map(x => x.translation);
    bank.push({ id: `f-sentence-${i}`, skill: "例句理解", prompt: `这句话在当前语境中的自然中文意思是什么？\n${v.sentence}`, answer: v.translation, options: stableOptions(v.translation, distractors, i+1), correctSentence: v.sentence, translation: v.translation, why: `逐句理解：${v.translation}。关键词「${v.word}」意为“${v.zh}”；注意它在这句里的具体用法。`, priority: 1 });
  });
  [...topic.dialogue, ...topic.reading].forEach(([no, zh], i) => { const distractors = [...topic.dialogue, ...topic.reading].filter(row => row[1] !== zh).map(row => row[1]); bank.push({ id: `f-text-${i}`, skill: "课文听读理解", prompt: `读一读并理解这段话：\n${no}\n\n选择最准确的中文翻译。`, answer: zh, options: stableOptions(zh, distractors, i+2), correctSentence: no, translation: zh, why: `本段译文：${zh}。朗读时留意语序、连接词和未来表达，试着不看译文复述一次。`, priority: 1 }); });
  topic.grammar.forEach((g, i) => { const distractors = topic.grammar.filter((_, j) => j !== i).map(x => x.zh); bank.push({ id: `f-grammar-${i}`, skill: `语法 · ${g.title}`, prompt: `理解结构「${g.form}」：\n${g.example}\n\n这句话是什么意思？`, answer: g.zh, options: stableOptions(g.zh, distractors, i+1), correctSentence: g.example, translation: g.zh, why: `${g.note} 例句翻译：${g.zh}`, priority: 1.4 }); });
  topic.exercises.forEach((q, i) => bank.push({ id: `f-exercise-${i}`, skill: "专题语法综合", prompt: q.prompt, answer: q.answer, options: stableOptions(q.answer, q.choices.filter(x=>x!==q.answer), i), correctSentence: q.prompt.includes("___") ? q.prompt.replace("___", q.answer) : "", why: q.why, priority: 1.5 }));
  const combined = [...bank, ...futurePlanQuestions()]; return combined.map((q,i) => q.options ? q : { ...q, options: stableOptions(q.answer, combined.filter(x=>x.id!==q.id).map(x=>x.answer), i) });
}
function weightedQuestionSample(bank, total) {
  const now = Date.now(); const items = shuffle(bank).map(q => { const r = state.topicReview?.[q.id]; const due = r && r.dueAt <= now; const late = due ? Math.min(10, 1 + (now-r.dueAt)/86400000) : 0; return { q, w: (q.priority || 1) * (due ? 7 + late : r ? Math.max(.2, 2/(1+r.streak)) : 3) }; }); const chosen=[];
  while(items.length && chosen.length<total) { const sum=items.reduce((n,x)=>n+x.w,0); let p=Math.random()*sum; let i=items.findIndex(x=>(p-=x.w)<=0); if(i<0)i=items.length-1; chosen.push(items.splice(i,1)[0].q.id); } return chosen;
}
function renderFremtidUnit() {
  const topic = window.FREMTID_TOPIC; const unit = query().get("unit") || "grammar"; const progress = state.topicProgress?.fremtid || {};
  const back = `<button class="text-button" data-back-topic-list>← 返回专题总览</button>`;
  if (unit === "grammar") {
    const i = Number(query().get("n") || 0); const item = topic.grammar[Math.min(i, topic.grammar.length-1)];
    return `<section class="panel wide topic-lesson">${back}<span class="eyebrow">语法讲解 · ${i+1}/${topic.grammar.length}</span><h1>${esc(item.title)}</h1><div class="grammar-cue">${esc(item.cue)}</div><div class="grammar-formula">${esc(item.form)}</div><p class="lesson-explanation">${esc(item.note)}</p><div class="example-card"><code>${esc(item.example)}</code><p>${esc(item.zh)}</p><button class="sound-button" data-say="${esc(item.example)}">🔊 听例句</button></div><div class="actions"><button class="button secondary" data-grammar-prev="${Math.max(0,i-1)}" ${i===0?"disabled":""}>上一节</button><button class="button primary" data-grammar-next="${i+1}">${i===topic.grammar.length-1?"完成语法学习":"下一节"}</button></div></section>`;
  }
  if (unit === "vocab") {
    const filter = query().get("pos") || "全部"; const words = filter === "全部" ? topic.vocabulary : topic.vocabulary.filter(v=>v.pos===filter); const categories=["全部","名词","动词","形容词","副词","介词","时间短语","限定词/形容词"];
    return `<section class="panel wide topic-lesson">${back}<span class="eyebrow">情境词汇 · ${topic.vocabulary.length} 项</span><h1>让词跟着画面和句子一起记</h1><p class="muted">先看画面线索和中文语义，主动回忆挪威语单词；想好后再展开答案，听读词汇与例句。名词同时学习性别和词形，易混词会给出语境。</p><div class="pos-filters">${categories.map(cat=>`<button class="pos-filter ${filter===cat?"selected":""}" data-pos-filter="${cat}">${cat} <small>${cat==="全部"?topic.vocabulary.length:topic.vocabulary.filter(v=>v.pos===cat).length}</small></button>`).join("")}</div><div class="topic-word-grid">${words.map(v => `<article class="topic-word-card"><div class="word-scene" aria-hidden="true">${v.scene}</div><div class="word-tag">${v.pos} · 先回忆</div><h2 class="word-prompt">${esc(v.zh)}</h2><p class="word-cue">观察图标和意思，试着先说出对应的挪威语词。</p><details class="word-answer"><summary>想好后，展开答案与例句</summary><div class="word-answer-body"><div class="answer-headword"><h3>${esc(v.word)}</h3><button class="sound-button" data-say="${esc(v.word)}">🔊 听单词</button></div><p class="word-forms">${esc(v.forms)}</p><div class="example-card compact"><code>${esc(v.sentence)}</code><p>${esc(v.translation)}</p><button class="sound-button" data-say="${esc(v.sentence)}">🔊 听例句</button></div></div></details></article>`).join("")}</div><button class="button primary" data-topic-done="vocab">完成词汇学习</button></section>`;
  }
  if (unit === "dialogue" || unit === "reading") {
    const rows = unit === "dialogue" ? topic.dialogue : topic.reading; const title = unit === "dialogue" ? "Ingrid og Marta snakker om framtiden" : "Emils mål for neste år";
    return `<section class="panel wide topic-lesson">${back}<span class="eyebrow">${unit === "dialogue" ? "对话听读" : "分段阅读"} · ${rows.length} 段</span><h1>${title}</h1><p class="muted">建议先听挪威语并猜大意，再展开中文核对。点每段的播放键，跟读并模仿停顿。</p><div class="bilingual-text">${rows.map(([no,zh],i) => `<article class="bilingual-line"><span class="line-number">${i+1}</span><div><p class="norwegian-line">${esc(no)}</p><button class="sound-button" data-say="${esc(no)}">🔊 听这一段</button><details><summary>显示中文翻译</summary><p>${esc(zh)}</p></details></div></article>`).join("")}</div><div class="actions"><button class="button primary" data-topic-done="${unit}">完成本环节</button></div></section>`;
  }
  if (unit === "practice") {
    const bank = topicQuestionBank(); const s = state.topicQuiz || { ids: [], index: 0, answers: {} }; const i = s.index; const q = bank.find(item => item.id === s.ids[i]);
    if (!q) { const answers = Object.values(s.answers || {}); const correct = answers.filter(x => x.ok).length; return `<section class="panel wide topic-lesson center">${back}<span class="eyebrow">专题练习完成</span><h1>做完这一轮了！</h1><div class="summary-score">${correct}<small>/${answers.length} 正确</small></div><p class="muted">本轮抽题覆盖词汇、全部词汇例句、课文、语法和未来目标表达。错题已加入错题练习。</p><button class="button primary" data-topic-reset-quiz>再练一轮</button></section>`; }
    const saved = s.answers[q.id];
    return `<section class="panel wide topic-lesson">${back}<span class="eyebrow">专题综合题库 · ${i+1}/${s.ids.length} · ${esc(q.skill)}</span><div class="progress-track"><div class="progress-fill" style="width:${Math.round((i/s.ids.length)*100)}%"></div></div><h1 class="topic-question">${esc(q.prompt).replace(/\n/g,"<br>")}</h1><div class="topic-options">${q.options.map((choice,j)=>`<button class="topic-option ${saved ? choice===q.answer?"correct":choice===saved.given?"wrong":"" : ""}" data-topic-choice="${j}" ${saved?"disabled":""}>${esc(choice)}</button>`).join("")}</div>${saved?`<div class="feedback ${saved.ok?"good":"bad"}"><h3>${saved.ok?"✓ 正确":"再看一下"}</h3><p><strong>答案：</strong>${esc(q.answer)}</p><p>${esc(q.why)}</p>${q.correctSentence?`<p><strong>例句：</strong><code>${esc(q.correctSentence)}</code> <button class="sound-button" data-say="${esc(q.correctSentence)}">🔊 听</button></p>`:""}${q.translation?`<p><strong>中文：</strong>${esc(q.translation)}</p>`:""}<div class="actions"><button class="button primary" data-topic-next>下一题</button></div></div>`:""}</section>`;
  }
  if (unit === "writing") return `<section class="panel wide topic-lesson">${back}<span class="eyebrow">写作迁移 · 本地自检</span><h1>把表达用到自己的生活</h1><p class="muted">AI 判定暂未接入，因此这里不会把开放式写作自动判成对或错。写完后按下面清单自检，再朗读自己的句子。</p><div class="writing-task-list">${topic.writingPrompts.map(([prompt,tip],i)=>`<article><span class="tag">任务 ${i+1}</span><h2>${esc(prompt)}</h2><p>${esc(tip)}</p><textarea class="writing-area" data-writing="${i}" placeholder="Skriv på norsk …">${esc(state.writing?.[i]||"")}</textarea><label class="check-row"><input type="checkbox" data-writing-done="${i}" ${state.writingDone?.[i]?"checked":""}> 已完成并朗读</label></article>`).join("")}</div><div class="self-check"><strong>自检清单</strong><ul><li>我是否选对了表达：日程、计划、愿望还是预测？</li><li>skal/vil 后是否直接使用动词原形？</li><li>kommer til 后是否写了 å + 原形？</li><li>如果时间放句首，变位动词是否在第二位？</li><li>我是否至少使用了三个专题词汇，并大声读过？</li></ul></div></section>`;
  return renderTopics();
}
function renderLearn() {
  const allEntries = [...new Map([...VOCAB_TOPICS.flatMap(topic => topicEntries(topic.id)), ...topicEntries("saved")].map(entry => [entry.key, entry])).values()];
  const mastered = allEntries.filter(entry => (state.review?.[entry.key]?.streak || 0) >= 2).length;
  const dueCount = allEntries.filter(entry => state.review?.[entry.key] && state.review[entry.key].dueAt <= Date.now()).length;
  const active = state.vocabSession;
  return `<section class="panel wide learning-home"><span class="eyebrow">Lær · 词汇记忆 V2</span><h1>从高频词开始，放进句子和场景里记。</h1><p class="muted">练习不只背中文：先回忆词形，再判断它在真实句子里怎么用。熟练词降低频率，薄弱词和到期词优先。</p><div class="study-method"><strong>一张卡的学习循环</strong><div><span>① 场景理解</span><span>② 主动回忆词形</span><span>③ 语境选用</span><span>④ 间隔复习</span></div></div><div class="topic-actions"><button class="button primary" data-study="5" data-topic="daily">混合复习5词</button></div>${(state.savedWords||[]).length?`<article class="panel saved-words"><h2>阅读收藏 · ${state.savedWords.length} 词</h2><p class="muted">从短文收藏的词会进入间隔复习。</p><button class="button primary" data-study="5" data-topic="saved">练习收藏词</button></article>`:""}${active ? `<button class="resume-study" data-resume-session>继续${active.topicId === "fremtid" ? "未来与人生计划" : VOCAB_TOPICS.find(topic => topic.id === active.topicId)?.title || "当前主题"} · ${Math.min(active.index + 1, active.ids.length)}/${active.ids.length} 词</button>` : ""}<div class="learn-overview"><div><strong>${mastered}/${allEntries.length}</strong><span>词条已连续记住两次</span></div><div><strong>${dueCount}</strong><span>到期待复习</span></div></div><h2 class="topic-heading">常用词汇主题</h2><div class="topic-grid">${VOCAB_TOPICS.map(topic => { const entries = topicEntries(topic.id); const done = entries.filter(entry => (state.review?.[entry.key]?.streak || 0) >= 2).length; const types = [...new Set(entries.map(entry => entry.kind === "verb" ? "动词" : entry.kind === "noun" || entry.pos === "名词" ? "名词" : entry.pos || "词汇"))]; const clusters = window.VOCAB_V2?.clusters?.[topic.id] || []; return `<article class="topic-card"><div class="topic-icon">${topic.icon}</div><div class="topic-info"><span class="topic-level">${topic.level}</span><h3>${topic.title}</h3><p>${topic.description}</p><div class="topic-meta"><span>${types.join(" · ")} · ${entries.length} 词条</span><span>${done}/${entries.length} 熟练</span></div>${clusters.length ? `<div class="topic-clusters">${clusters.map(cluster => `<span>${esc(cluster)}</span>`).join("")}</div>` : ""}<div class="progress-track"><div class="progress-fill" style="width:${Math.round(done / Math.max(1, entries.length) * 100)}%"></div></div><div class="topic-actions"><button class="button primary" data-study="5" data-topic="${topic.id}">学5个</button><button class="button secondary" data-study="10" data-topic="${topic.id}">复习10个</button></div>${topic.id === "fremtid" ? `<a class="button topic-course-link" href="#topics">进入完整专题课程：语法、对话、阅读与写作</a>` : ""}</div></article>`; }).join("")}</div></section>`;
}
function renderWordForm(label, text) { return `<span class="word-form-card"><small>${esc(label)}</small><strong>${esc(text)}</strong><button class="sound-button word-audio" data-say="${esc(text)}" type="button" aria-label="播放 ${esc(text)} 的挪威语发音">🔊 听词</button></span>`; }
function renderLearnStudy() {
  const s = state.vocabSession; if (!s || !s.ids.length) return renderLearn();
  const entry = getStudyEntry(s.ids[s.index]); const topic = VOCAB_TOPICS.find(item => item.id === s.topicId) || { title: "Fremtid · 未来", story: "Jeg vil lære et nytt språk. Jeg skal nå målet mitt.", storyZh: "我想学习一门新语言。我会实现自己的目标。" };
  const title = entry.kind === "future" ? entry.word : entry.kind === "noun" ? entry.lemma : entry.kind === "lexeme" ? entry.word : entry.v1; const fields = entryFields(entry); const nounInfo = entry.kind === "noun" ? nounGuide(entry) : null;
  const category = entry.kind === "future" ? entry.pos : entry.kind === "noun" ? "名词" : entry.kind === "lexeme" ? entry.pos : "动词";
  const studyHeader = `<div class="study-topline"><div><span class="eyebrow">${topic.title} · ${category}</span><strong>先回忆，再看答案</strong></div><div class="study-right"><span class="study-counter">${s.index + 1}/${s.ids.length}</span><button class="study-exit" data-back-topics type="button" aria-label="返回专题">×</button></div></div>`;
  if (!s.revealed) {
    const step = Math.min(s.recallStep || 0, fields.length - 1); const field = fields[step];
    const value = s.recallValues?.[field.key] || "";
    const context = s.contexts?.[entry.key];
    const front = entry.kind === "future"
      ? `<div class="word-scene" aria-hidden="true">${entry.scene}</div><span class="eyebrow">${esc(entry.pos)} · 看句子回忆主题词</span><h1>${esc(entry.zh)}</h1><p class="example">${esc(entry.sentence)}</p><p class="muted">${esc(entry.translation)}</p><button class="sound-button" data-say="${esc(entry.sentence)}" type="button">🔊 听例句</button>`
      : entry.kind === "noun"
      ? `<span class="eyebrow">根据准确语义和情境回忆名词</span><h1>${esc(nounInfo.meaning)}</h1><div class="meaning-cue"><strong>本题语义</strong><p>${esc(nounInfo.note)}</p></div><p class="example">${esc(context?.no || entry.sentence)}</p><p class="muted">${esc(context?.zh || entry.sentenceZh)}</p>`
      : entry.kind === "lexeme"
      ? `<span class="eyebrow">${esc(entry.pos)} · ${esc(entry.cluster)}</span><h1>${esc(entry.zh)}</h1><div class="meaning-cue"><strong>先想语境，不要只背中文</strong><p>${esc(entry.note)}</p></div>${context ? `<p class="example">${esc(context.no)}</p><p class="muted">${esc(context.zh)}</p><button class="sound-button" data-say="${esc(context.no)}" type="button">🔊 听情境句</button>` : ""}`
      : `<span class="eyebrow">动词 · 从语义和句子回忆词形</span><h1>${esc(entry.zh)}</h1><p class="muted">结合这个常见搭配理解：<span class="example">${esc(entry.phrase)}</span></p>${context ? `<p class="example">${esc(context.no)}</p><p class="muted">${esc(context.zh)}</p>` : ""}`;
    return `<section class="question-card vocab-card">${studyHeader}<div class="study-progress" style="--steps:${fields.length}">${fields.map((item, i) => `<span class="${i < step ? "done" : i === step ? "current" : ""}">${i + 1} ${item.label}</span>`).join("")}</div><div class="vocab-front">${front}</div><div class="recall-step"><div class="recall-step-head"><span>第 ${step + 1} / ${fields.length} 项</span><strong>${field.label}</strong><small>${field.hint}</small></div><input id="vocab-current" class="answer vocab-answer" type="text" value="${esc(value)}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="写出 ${esc(field.label)} …" aria-label="${field.label}"><div class="actions vocab-actions recall-actions"><button class="button primary" type="button" data-vocab-step>${step === fields.length - 1 ? "检查并看答案" : "下一项"}</button><button class="button secondary" type="button" data-vocab-reveal>直接看答案</button></div><p id="vocab-recall-status" class="recall-help" role="status" aria-live="polite">使用手机系统键盘输入。也可以先口头回忆，再点击“直接看答案”。</p></div></section>`;
  }
  const result = s.lastResult;
  if (s.usagePending && s.usageQuestion) { const q = s.usageQuestion; return `<section class="question-card vocab-card">${studyHeader}<div class="meaning-guide"><span>词形会背了，还要会选</span><strong>${esc(q.prompt)}</strong><p>${esc(q.zh)}</p>${q.scene ? `<p class="muted">判断线索：${esc(q.scene)}</p>` : ""}</div>${q.sentence ? `<div class="example-card"><code>${esc(q.sentence)}</code></div>` : ""}<div class="usage-options">${q.choices.map((choice, i) => `<button class="choice-button" data-vocab-usage-choice="${i}">${esc(choice)}</button>`).join("")}</div><p class="muted">先判断“一个还是多个”，再判断“新信息还是已知对象”。</p></section>`; }
  if (entry.kind === "future") return `<section class="question-card vocab-card">${studyHeader}<div class="vocab-front answer-front"><span class="eyebrow">${esc(entry.pos)} · ${esc(entry.zh)}</span><div class="answer-headword"><h1>${esc(entry.word)}</h1><button class="sound-button headword-audio" data-say="${esc(entry.word)}" type="button">🔊 听词</button></div></div>${result ? `<div class="feedback ${result.ok ? "good" : "close"}"><h3>${result.ok ? "✓ 回忆正确" : "看答案，再主动回忆一次"}</h3><p>${esc(result.message)}</p></div>` : ""}<div class="meaning-guide"><span>词义与词形</span><strong>${esc(entry.zh)}</strong><p>${esc(entry.forms)}</p><p><b>例句译文：</b>${esc(entry.translation)}</p></div><div class="example-card"><code>${esc(entry.sentence)}</code><p>${esc(entry.translation)}</p><button class="sound-button" data-say="${esc(entry.sentence)}">🔊 听例句</button></div><div class="memory-tip"><strong>记忆方法</strong><span>先想象“${esc(entry.scene)}”所代表的场景，再把词放回整句；遮住中文复述挪威语，最后听读两遍。</span></div><div class="actions"><button class="button orange" data-vocab-retry>再测一次</button><button class="button primary" data-vocab-know>我记住了，下一词</button></div></section>`;
  if (entry.kind === "lexeme") {
    const context = s.contexts?.[entry.key] || entry.contexts?.[0];
    const q = s.usageQuestion;
    const forms = fields.map(field => renderWordForm(field.label, field.answer)).join("");
    const usage = q ? `<div class="meaning-guide"><span>放进语境里判断</span><strong>${esc(q.prompt)}</strong><p class="example">${esc(q.sentence)}</p><p>${esc(q.zh)}</p><p><b>为什么：</b>${esc(q.why)}</p></div>` : "";
    return `<section class="question-card vocab-card">${studyHeader}<div class="vocab-front answer-front"><span class="eyebrow">${esc(entry.pos)} · ${esc(entry.zh)}</span><div class="answer-headword"><h1>${esc(entry.word)}</h1><button class="sound-button headword-audio" data-say="${esc(entry.word)}" type="button">🔊 听词</button></div></div>${result ? `<div class="feedback ${result.ok ? "good" : "close"}"><h3>${result.ok ? "✓ 回忆与运用都正确" : "还要巩固"}</h3><p>${esc(result.message)}</p>${s.usageQuestion ? `<p>你选：<code>${esc(s.usageGiven || "未选择")}</code> · 推荐形式：<code>${esc(s.usageQuestion.answer)}</code></p>` : ""}</div>` : ""}<div class="meaning-guide"><span>具体语义与用法</span><strong>${esc(entry.zh)}</strong><p>${esc(entry.note)}</p>${entry.collocations?.length ? `<p><b>常见搭配：</b>${entry.collocations.map(esc).join(" · ")}</p>` : ""}</div><div class="big-forms">${forms}</div>${context ? `<div class="example-card"><span>真实语境 · ${esc(entry.cluster)}</span><code>${esc(context.no)}</code><p>${esc(context.zh)}</p><p class="muted">${esc(context.note)}</p><button class="sound-button" data-say="${esc(context.no)}" type="button">🔊 听例句</button></div>` : ""}${usage}<div class="memory-tip"><strong>把形式和场景绑定</strong><span>遮住译文，先复述例句；再换掉主语或时间词，自己造一个新句。复习时系统会轮换词条和例句。</span></div><div class="actions"><button class="button orange" data-vocab-retry>再测一次</button><button class="button primary" data-vocab-know>我记住了，下一词</button></div></section>`;
  }
  const headwordSound = entry.kind === "noun" ? fields[0].answer : entry.v1;
  const formCards = fields.map(field => [field.label, field.answer])
    .map(([label, answer]) => renderWordForm(label, answer)).join("");
  const verbExampleList = entry.kind === "verb" ? verbExamples(entry) : []; const selectedContext = s.contexts?.[entry.key];
  const examples = entry.kind === "noun"
    ? `<div class="four-sentences"><div><span>语境例句 · ${esc(entry.cluster || topic.title)}</span><code>${esc(selectedContext?.no || entry.sentence)}</code><p class="muted">${esc(selectedContext?.zh || entry.sentenceZh)}</p><p class="muted">${esc(selectedContext?.note || "注意句子中的冠词和名词词尾。")}</p><button class="sound-button" data-say="${esc(selectedContext?.no || entry.sentence)}" type="button">🔊 听一遍</button></div></div>`
    : `<div class="four-sentences"><div><span>${esc(selectedContext?.note || verbExampleList[0]?.label || "情境例句")}</span><code>${esc(selectedContext?.no || verbExampleList[0]?.no || "")}</code><p class="example-translation">${esc(selectedContext?.zh || verbExampleList[0]?.zh || "")}</p><button class="sound-button" data-say="${esc(selectedContext?.no || verbExampleList[0]?.no || "")}" type="button">🔊 听一遍</button></div><details><summary>查看其他时态例句</summary>${verbExampleList.slice(1).map(example => `<p><b>${esc(example.label)}：</b><code>${esc(example.no)}</code><br>${esc(example.zh)}</p>`).join("")}</details></div>`;
  const nounUsage = s.usageQuestion ? `<div class="meaning-guide"><span>本题为什么选这个形式</span><strong>${esc(s.usageQuestion.scene || "根据上下文判断")}</strong><p>${esc(s.usageQuestion.why)}</p><p><b>本题形式：</b>${esc(s.usageQuestion.answer)}</p></div>` : "";
  const meaningBlock = entry.kind === "noun"
    ? `<div class="meaning-guide"><span>语义和易混点</span><strong>${esc(nounInfo.meaning)}</strong><p>${esc(nounInfo.note)}</p><p><b>判断顺序：</b>先看数量（一个 / 多个），再看对象是否已明确（新信息 / 已知特指）。</p><p><b>例句：</b>${esc(entry.sentenceZh)}</p></div>`
    : `<div class="meaning-guide"><span>这里具体怎么理解</span><strong>${esc(entry.phrase)}</strong><p>这个搭配在例句中表示“${esc(VERB_USAGE_ZH[entry.v1] || entry.zh)}”。动词本身可表示“${esc(entry.zh)}”，实际中文要结合后面的宾语或补语判断。</p></div>`;
  const progressNote = entry.kind === "noun" ? "记名词时把冠词一起背：它告诉你词的性别；再留意定指词尾和复数变化。" : "把四形按节奏读出来，再用一个句子把它和日常生活连起来。";
  return `<section class="question-card vocab-card">${studyHeader}<div class="vocab-front answer-front"><span class="eyebrow">${esc(entry.kind === "noun" ? nounInfo.meaning : entry.zh)}</span><div class="answer-headword"><h1>${esc(title)}</h1><button class="sound-button headword-audio" data-say="${esc(headwordSound)}" type="button" aria-label="播放 ${esc(headwordSound)} 的挪威语发音">🔊 听词</button></div></div>${result ? `<div class="feedback ${result.ok ? "good" : "close"}"><h3>${result.ok ? "✓ 词形与运用都正确" : "还需要巩固"}</h3><p>${esc(result.message)}</p>${s.usageQuestion ? `<p>你选：<code>${esc(s.usageGiven || "未选择")}</code> · 推荐形式：<code>${esc(s.usageQuestion.answer)}</code></p>` : ""}</div>` : ""}${meaningBlock}${nounUsage}<p id="pronunciation-status" class="pronunciation-note" aria-live="polite">🔊 单词和词形都可单独播放，发音使用设备提供的挪威语语音。</p><div class="big-forms">${formCards}</div>${examples}<div class="theme-sentence"><span>专题整合句 · ${topic.title}</span><p class="example">${esc(topic.story)}</p><p class="muted">${esc(topic.storyZh)}</p><button class="sound-button" data-say="${esc(topic.story)}" type="button">🔊 听整句</button></div><div class="memory-tip"><strong>记忆小方法</strong><span>${progressNote} 明天、3天后和1周后再复习。</span></div><div class="actions"><button class="button orange" data-vocab-retry>再测一次</button><button class="button primary" data-vocab-know>我记住了，下一词</button></div></section>`;
}
function renderLearnDetail(v) { const n = state.learned[v.id] || 0; const forms = [["现在时", v.pres], ["过去时", v.past], ["完成分词", v.pp]].map(([label, word]) => renderWordForm(label, word)).join(""); const examples = verbExamples(v); return `<section class="panel wide detail-panel"><button class="text-button" data-back-learn>← 返回背词</button><span class="eyebrow">动词卡 · ${esc(v.zh)}</span><div class="answer-headword"><h1 style="font-size:58px">${esc(v.v1)}</h1><button class="sound-button headword-audio" data-say="${esc(v.v1)}" type="button" aria-label="播放 ${esc(v.v1)} 的挪威语发音">🔊 听原形</button></div><div class="big-forms">${forms}</div><div class="meaning-guide"><span>语义与固定搭配</span><strong>${esc(v.phrase)}</strong><p>这个搭配表示“${esc(VERB_USAGE_ZH[v.v1] || v.zh)}”。动词本身可表示“${esc(v.zh)}”，要和后面的成分一起理解。</p><button class="sound-button" data-say="${esc(v.phrase)}" type="button">🔊 听搭配</button></div><div class="four-sentences">${examples.map(example => `<div><span>${example.label}</span><code>${esc(example.no)}</code><p class="example-translation">${esc(example.zh)}</p><button class="sound-button" data-say="${esc(example.no)}" type="button">🔊 听例句</button></div>`).join("")}</div><p class="muted">本词已标记：${n}次。连续两次选择“我会了”后，系统会降低新词出现频率，之后按间隔复习。</p><div class="actions"><button class="button orange" data-again-verb="${v.id}">再练这个词</button><button class="button primary" data-know-verb="${v.id}">我会了</button></div></section>`; }
function renderMistakes() {
  const mistakes = [...state.mistakes].reverse(); const active = state.mistakePractice;
  const current = active ? state.mistakes.find(item => item.id === active.id) : null;
  const training = current ? `<article class="mistake-practice"><span class="tag">主动回忆练习 · ${active.index+1}/${mistakes.length}</span><h2>${esc(current.prompt)}</h2><p class="muted">先不看下面的错题记录，自己重新写出正确答案。</p><input class="answer" id="mistake-answer" placeholder="写出正确答案…" ${active.result?"disabled":""} value="${esc(active.given||"")}">${active.result?`<div class="feedback ${active.result.ok?"good":"close"}"><h3>${active.result.ok?"✓ 这次答对了":"再对照规则练一次"}</h3><p>参考答案：<code>${esc(current.answer)}</code></p><p>${esc(current.explanation||"回忆题目对应的规则，并大声读正确句。")}</p><button class="button primary" data-mistake-next>${active.result.ok?"下一道错题":"再试一次"}</button></div>`:`<div class="actions"><button class="button primary" data-mistake-check>检查并复习</button><button class="button secondary" data-mistake-hint>先看提示</button></div>`}</article>` : "";
  return `<section class="panel wide"><span class="eyebrow">Mine feil · 错题集与练习</span><h1>把错题练到真正记住。</h1><p class="muted">这里不只是答案记录：每次先遮住正确答案，主动回想，再核对讲解。答对后错题会从待练列表移除；答错会继续保留。</p><div class="mistake-summary"><strong>${mistakes.length}</strong><span>道待复习</span>${mistakes.length?`<button class="button primary" data-start-mistakes>${active?"继续练习":"开始错题练习"}</button>`:""}</div>${training}${mistakes.length ? `<div class="mistake-list"><h2>错题记录与讲解</h2>${mistakes.map(m => `<div class="mistake-item"><span class="tag">${esc(m.skill)}</span><h3 style="margin-top:10px">${esc(m.prompt)}</h3><div>你的答案：<code>${esc(m.given)}</code></div><div>建议答案：<code>${esc(m.answer)}</code></div><p class="muted">${esc(m.explanation)}</p></div>`).join("")}</div>` : `<div class="empty">待复习错题已清空。后续做题出现错误时，会自动加入这里。</div>`}</section>`;
}
function renderSpeak() { return `<section class="panel wide center"><span class="eyebrow">Snakke · 口语模式</span><h1 style="font-size:44px">Hva skal du gjøre i morgen?</h1><p class="muted">浏览器支持语音识别时可以直接说；也可以输入文字。系统会检查你常犯的动词和语序问题。</p><button class="speak-button" data-speak aria-label="开始录音">●</button><p id="speech-status" class="muted">Trykk for å snakke</p><textarea id="speech-text" placeholder="识别结果会出现在这里，也可以直接输入。"></textarea><div class="actions" style="justify-content:center"><button class="button primary" data-check-speech>分析回答</button></div><div id="feedback" style="text-align:left"></div></section>`; }

function record(q, given, ok, answer, explanation) { if (state.session.answers[q.id]) return; state.session.answers[q.id] = { ok, given }; state.attempts++; const key = q.rotationKey || `${q.type}:${q.verbId||q.id}`; const previous = state.questionMastery?.[key] || { streak: 0, seen: 0 }; state.questionMastery = { ...(state.questionMastery||{}), [key]: { streak: ok ? previous.streak + 1 : 0, seen: previous.seen + 1, lastSeenAt: Date.now() } }; if (ok) state.correct++; playLearningSound(ok ? "correct" : "wrong"); sendLearningEvent("answer",ok); if (!ok) state.mistakes.push({ id: Date.now(), qid: q.id, skill: q.skill, prompt: q.prompt, given, answer, explanation }); saveState(); }
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
  const phraseMeaning = verb ? `<div class="explain-block"><strong>本句词组</strong><p><code>${esc(verb.v1)} ${esc(verb.tail)}</code> = ${esc(verbActionZh(verb))}</p><p class="muted">把动词和后面的词一起理解；同一个动词换了搭配，意思也可能变化。</p></div>` : "";
  const givenBlock = given ? `<div class="answer-compare"><span>你的答案</span><code>${esc(given)}</code></div>` : "";
  return `<div class="feedback ${kind}"><h3>${title}</h3>${givenBlock}<div class="explain-block"><strong>中文意思</strong><p>${esc(q.translation || "请根据上下文理解这句话。")}</p></div>${phraseMeaning}<div class="explain-block"><strong>完整正确句</strong><p class="example">${esc(q.correctSentence || answer)} <button class="sound-button" data-say="${esc(q.correctSentence || answer)}" type="button">🔊 播放发音</button></p><p class="muted">${esc(q.answerTranslation || "")}</p></div><div class="explain-block"><strong>为什么这样用</strong><p>${esc(q.rule || q.explanation || "")}</p><p class="muted">${esc(q.explanation || "")}</p></div>${forms ? `<div class="explain-block"><strong>这个动词的四形</strong>${forms}</div>` : ""}<div class="memory-tip"><strong>记忆动作</strong><span>大声跟读完整句两遍，再自己替换一个词重新说一遍。</span></div><div class="actions"><button class="button primary" data-next>${state.session.index === state.session.total - 1 ? "查看总结" : "下一题"}</button></div></div>`;
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
function nextQuestion() { state.session.index++; saveState(); if (state.session.index >= state.session.total) { const answers = Object.values(state.session.answers); state.dailyProgress = { ...(state.dailyProgress||{}), [localDayKey()]: { ...(state.dailyProgress?.[localDayKey()]||{}), practice: true } }; state.lastSummary = { total: state.session.total, correct: answers.filter(x => x.ok).length, mistakes: answers.filter(x => !x.ok).length }; playLearningSound("complete"); sendLearningEvent("completion",true); state.session = null; saveState(); location.hash = "summary"; } else render(); }
function startSession(total, onlyVerbId = null) { state.session = buildSession(total, onlyVerbId); saveState(); location.hash = "practice"; }
function startVocabSession(total, topicId = "basics") {
  const pool = topicEntries(topicId); const now = Date.now();
  const recent = new Set((state.vocabHistory || []).slice(-36));
  const ranked = shuffle(pool).map(entry => { const review = state.review?.[entry.key]; const due = review && review.dueAt <= now; const overdue = due ? Math.min(12, 1 + (now - review.dueAt) / 86400000) : 0; const frequency = Math.max(1, entry.priority || 1); const weak = review && (review.formStreak ?? review.streak ?? 0) < 2; const base = due ? 8 + overdue : review ? (weak ? 2.4 : Math.max(.2, 1.6 / (1 + review.streak))) : 3.4; const recencyPenalty = recent.has(entry.key) && !due ? .12 : 1; const weight = frequency * base * recencyPenalty; return { entry, weight }; });
  const freshRanked = ranked.filter(item => !recent.has(item.entry.key) || (state.review?.[item.entry.key]?.dueAt || Infinity) <= now);
  const eligible = freshRanked.length >= total ? freshRanked : ranked;
  const chosen = []; while (eligible.length && chosen.length < total) { const sum = eligible.reduce((n, item) => n + item.weight, 0); let pick = Math.random() * sum; let index = eligible.findIndex(item => (pick -= item.weight) <= 0); if (index < 0) index = eligible.length - 1; chosen.push(eligible.splice(index, 1)[0].entry); }
  const ids = chosen.map(entry => entry.key);
  const contexts = {}; const history = { ...(state.vocabContextHistory || {}) };
  chosen.forEach(entry => { const candidates = vocabContexts(entry, topicId); if (!candidates.length) return; const recentIds = new Set(history[entry.key] || []); const fresh = candidates.filter(item => !recentIds.has(item.id)); const context = shuffle(fresh.length ? fresh : candidates)[0]; contexts[entry.key] = context; history[entry.key] = [...(history[entry.key] || []), context.id].slice(-Math.min(5, candidates.length)); });
  state.vocabContextHistory = history; state.vocabHistory = [...(state.vocabHistory || []), ...ids].slice(-120);
  state.vocabSession = { topicId, ids, contexts, index: 0, revealed: false, recallStep: 0, recallValues: {}, lastResult: null, usagePending: false, usageQuestion: null, usageOk: null }; saveState(); location.hash = "learnstudy";
}
function advanceVocabStep() {
  const s = state.vocabSession; if (!s || s.revealed) return;
  const entry = getStudyEntry(s.ids[s.index]); if (!entry) return;
  const fields = entryFields(entry); const step = Math.min(s.recallStep || 0, fields.length - 1); const field = fields[step]; if (!field) return;
  const input = document.querySelector("#vocab-current"); const value = input?.value || "";
  const status = document.querySelector("#vocab-recall-status");
  if (!value.trim()) { input?.classList.add("input-error"); if (status) status.textContent = "还没有输入答案。可以填写后再检查，或点‘直接看答案’。"; return; }
  if (status) status.textContent = "";
  const recallValues = { ...(s.recallValues || {}), [field.key]: value };
  if (step < fields.length - 1) { s.recallValues = recallValues; s.recallStep = step + 1; saveState(); render(); requestAnimationFrame(() => document.querySelector("#vocab-current")?.scrollIntoView({ block: "center", behavior: "smooth" })); return; }
  const values = fields.map(item => recallValues[item.key] || ""); const correct = fields.map((item, i) => ["word", "v1"].includes(item.key) ? [item.answer, item.answer.replace(/^å\s+/i, "")].some(answer => normalize(values[i]) === normalize(answer)) : normalize(values[i]) === normalize(item.answer));
  s.recallValues = recallValues;
  s.lastResult = { meaningOk: correct[0], morphologyOk: correct.slice(1).every(Boolean), formsOk: correct.every(Boolean), ok: false, message: correct.every(Boolean) ? `词义回忆和${fields.length - 1}项词形都正确。再判断一次真实语境中的用法。` : fields.map((item, i) => `${item.label}${correct[i] ? "✓" : "✗"}`).join("，") + "。看一遍后，合上答案再回想。" };
  playLearningSound(s.lastResult.formsOk ? "correct" : "wrong");
  // Checking the recalled forms must always reveal the answer immediately.
  // Keep the usage prompt for the explanation card, but don't interpose another
  // quiz here: on mobile that made “检查并看答案” appear not to respond.
  const context = s.contexts?.[entry.key]; s.usageQuestion = usageQuestion(entry, context); s.usagePending = false; s.usageOk = null; s.revealed = true; s.lastResult.ok = s.lastResult.formsOk; input?.blur(); saveState(); render();
}
function finishVocabCard() {
  const s = state.vocabSession; const key = s.ids[s.index]; const previous = state.review?.[key] || { streak: 0 };
  const meaningOk = s.lastResult?.meaningOk ?? s.lastResult?.formsOk ?? false; const morphologyOk = s.lastResult?.morphologyOk ?? s.lastResult?.formsOk ?? false; const usageOk = s.usageQuestion ? s.usageOk === true : true; const remembered = meaningOk && morphologyOk && usageOk; const streak = remembered ? previous.streak + 1 : 0; const meaningStreak = meaningOk ? (previous.meaningStreak || 0) + 1 : 0; const formStreak = morphologyOk ? (previous.formStreak || 0) + 1 : 0; const usageStreak = usageOk ? (previous.usageStreak || 0) + 1 : 0; const intervals = [1, 3, 7, 14, 30]; const delayDays = remembered ? intervals[Math.min(Math.max(streak - 1, 0), intervals.length - 1)] : 1;
  sendLearningEvent("vocab", remembered);
  state.learned[key] = (state.learned[key] || 0) + 1; state.review[key] = { ...previous, streak, meaningStreak, formStreak, usageStreak, lastSeenAt: Date.now(), dueAt: Date.now() + delayDays * 86400000 };
  s.index++; s.revealed = false; s.recallStep = 0; s.recallValues = {}; s.lastResult = null; s.usagePending = false; s.usageQuestion = null; s.usageOk = null;
  if (s.index >= s.ids.length) { if (s.topicId === "daily") state.dailyProgress = { ...(state.dailyProgress||{}), [localDayKey()]: { ...(state.dailyProgress?.[localDayKey()]||{}), vocab: true } }; state.vocabSession = null; playLearningSound("complete"); location.hash = "learn"; } saveState(); render();
}
function startSpeech() { const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition; const status = document.querySelector("#speech-status"); if (!Recognition) { status.textContent = "当前浏览器不支持语音识别，请直接输入。"; return; } const rec = new Recognition(); rec.lang = "nb-NO"; rec.interimResults = false; status.textContent = "Lytter … 正在听"; rec.onresult = e => { document.querySelector("#speech-text").value = e.results[0][0].transcript; status.textContent = "识别完成，可以分析。"; }; rec.onerror = () => { status.textContent = "没有识别成功，请重试或直接输入。"; }; rec.start(); }

async function accountApi(path, options = {}) {
  if (accountSession?.refresh_token && accountSession.expires_at < Date.now() + 60000 && !path.endsWith("/refresh")) {
    try { const fresh = await accountApi("/api/auth/refresh", { method: "POST", body: JSON.stringify({ refresh_token: accountSession.refresh_token }) }); setAccountSession(fresh); }
    catch { clearAccountSession(); }
  }
  const response = await fetch(path, { credentials: "same-origin", ...options, headers: { ...(options.body ? { "content-type": "application/json" } : {}), ...(accountSession?.access_token && !path.endsWith("/refresh") ? { authorization: `Bearer ${accountSession.access_token}` } : {}), ...(options.headers || {}) } });
  let data; try { data = await response.json(); } catch { throw new Error("账号服务未部署或当前不可用。"); }
  if (!response.ok) { const error = new Error(data.error || "请求失败。"); error.data = data; throw error; } return data;
}
function setAccountSession(session) { const rawExpiry=Number(session.expires_at||0);accountSession={...session,expires_at:rawExpiry?(rawExpiry<1e12?rawExpiry*1000:rawExpiry):Date.now()+Number(session.expires_in||3600)*1000};localStorage.setItem("norsk-auth-session",JSON.stringify(accountSession)); }
function clearAccountSession() { accountSession = null; localStorage.removeItem("norsk-auth-session"); }
function updateAccountButton() { const button=document.querySelector("[data-account-label]"); if(button) button.textContent=accountUser?`${accountUser.nickname} · ${Number(accountUser.points||0)}分`:"登录 / 排行"; }
async function refreshAccount() {
  try { const data=await accountApi("/api/auth/me"); accountUser=data.user; accountMedals=data.medals||[]; accountMedalGoals=data.medalGoals||[]; accountStudyHabits=data.studyHabits||accountStudyHabits; accountBackendUnavailable=false; }
  catch { accountUser=null; accountMedals=[]; accountMedalGoals=[]; accountStudyHabits={currentStreak:0,monthDays:0,yearDays:0}; accountBackendUnavailable=true; }
  updateAccountButton();
}
async function refreshLeaderboard() { try { const data=await accountApi(`/api/leaderboard?period=${boardPeriod}`); boardRows=data.rows||[]; } catch { boardRows=[]; } }
async function sendLearningEvent(type, correct = false) {
  if(!accountUser) return;
  try { const eventId=crypto.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==="x"?r:(r&3|8)).toString(16);}); const data=await accountApi("/api/score",{method:"POST",body:JSON.stringify({eventId,type,correct})}); accountUser={...accountUser,points:data.points}; if(data.newMedals?.length) accountMedals=[...data.newMedals,...accountMedals]; accountMedalGoals=data.medalGoals||accountMedalGoals;accountStudyHabits=data.studyHabits||accountStudyHabits; updateAccountButton(); if(route()==="account"){await refreshLeaderboard();render();} }
  catch { /* The learning app stays usable when the account service is offline. */ }
}
async function submitAccountForm(form) {
  const action=form.dataset.accountForm; const values=Object.fromEntries(new FormData(form).entries());
  try {
    if(action==="register"){const data=await accountApi("/api/auth/register",{method:"POST",body:JSON.stringify(values)});accountNotice=data.message||"请打开邮箱完成验证。";accountMode="login";}
    else if(action==="login"){const data=await accountApi("/api/auth/login",{method:"POST",body:JSON.stringify(values)});setAccountSession(data);verificationEmail="";accountNotice="登录成功。";await refreshAccount();await refreshLeaderboard();}
    else if(action==="forgot"||action==="resend"){const data=await accountApi(`/api/auth/${action}`,{method:"POST",body:JSON.stringify(values)});accountNotice=data.message||"邮件已发送。";}
    else if(action==="reset"){const data=await accountApi("/api/auth/reset",{method:"POST",body:JSON.stringify(values)});accountNotice=data.message||"密码已更新，请重新登录。";clearAccountSession();accountUser=null;accountMedals=[];history.replaceState(null,"",`${location.pathname}#account`);accountMode="login";}
  } catch(error){accountNotice=error.message;if(error.data?.needsVerification)verificationEmail=values.email||"";}
  render();
}
function bindView() {
  document.querySelectorAll("[data-account-mode]").forEach(button=>button.addEventListener("click",()=>{accountMode=button.dataset.accountMode;accountNotice="";render();}));
  document.querySelectorAll("[data-account-form]").forEach(form=>form.addEventListener("submit",event=>{event.preventDefault();submitAccountForm(form);}));
  document.querySelector("[data-auth-logout]")?.addEventListener("click",async()=>{try{await accountApi("/api/auth/logout",{method:"POST",body:"{}"});}catch{}clearAccountSession();accountUser=null;accountMedals=[];accountNotice="已退出登录。";updateAccountButton();render();});
  document.querySelectorAll("[data-board-period]").forEach(button=>button.addEventListener("click",async()=>{boardPeriod=button.dataset.boardPeriod;await refreshLeaderboard();render();}));
  document.querySelector("[data-start]")?.addEventListener("click", () => { location.hash = state.session ? "practice" : `setup?n=${Number(state.trainingSettings?.dailyQuestionCount) || 10}`; });
  document.querySelectorAll("[data-start-daily]").forEach(button => button.addEventListener("click", () => state.session ? (location.hash = "practice") : startSession(Number(state.trainingSettings?.dailyQuestionCount) || 10)));
  document.querySelectorAll("[data-change-count]").forEach(button => button.addEventListener("click", () => { location.hash = `setup?n=${Number(state.trainingSettings?.dailyQuestionCount) || 10}`; }));
  document.querySelectorAll("[data-preferred-count]").forEach(button => button.addEventListener("click", () => { state.trainingSettings = { ...(state.trainingSettings || {}), dailyQuestionCount: Number(button.dataset.preferredCount) }; saveState(); document.querySelectorAll("[data-preferred-count]").forEach(item => { const selected = item === button; item.classList.toggle("selected", selected); item.setAttribute("aria-pressed", String(selected)); }); const saved = document.querySelector("[data-count-saved]"); if (saved) saved.textContent = `已保存：每日默认 ${button.dataset.preferredCount}题`; }));
  document.querySelectorAll("[data-daily-plan]").forEach(button => button.addEventListener("click", () => { const dailyPlan = button.dataset.dailyPlan; state.trainingSettings = { ...(state.trainingSettings || {}), dailyPlan }; saveState(); document.querySelectorAll("[data-daily-plan]").forEach(item => { const selected = item === button; item.classList.toggle("selected", selected); item.setAttribute("aria-pressed", String(selected)); }); const saved = document.querySelector("[data-plan-saved]"); if (saved) saved.textContent = `${button.textContent.trim()} · 已保存；今日页已按新计划更新`; }));
  document.querySelector("[data-toggle-sfx]")?.addEventListener("click", () => { state.soundEffects = state.soundEffects === false; saveState(); render(); });
  document.querySelectorAll("[data-start-vocab-daily]").forEach(button => button.addEventListener("click", () => startVocabSession(5, "daily")));
  document.querySelector("[data-go-study]")?.addEventListener("click", () => { location.hash = "study"; });
  document.querySelector("[data-reading-select]")?.addEventListener("change", event => { location.hash = "read?id=" + encodeURIComponent(event.target.value); });
  document.querySelectorAll("[data-article]").forEach(button => button.addEventListener("click", () => { state.readingLookup = null; location.hash = "read?id=" + encodeURIComponent(button.dataset.article); }));
  document.querySelectorAll("[data-read-word]").forEach(button => button.addEventListener("click", () => {
    const article = window.READING_LIBRARY.find(item => item.id === query().get("id")) || dailyReadingArticle();
    const word = article.words.find(item => item.id === button.dataset.readWord); if (!word) return;
    state.readingLookup = { kind: "word", articleId: article.id, word }; saveState(); render(); document.querySelector("#reading-lookup")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }));
  document.querySelector("[data-reading-lookup-close]")?.addEventListener("click", () => { state.readingLookup = null; saveState(); render(); });
  document.querySelectorAll("[data-read-line]").forEach(button => button.addEventListener("click", () => { const box = document.querySelector("#read-line-" + button.dataset.readLine); if (box) { box.hidden = !box.hidden; button.textContent = box.hidden ? "显示翻译与语法" : "收起翻译与语法"; } }));
  document.querySelectorAll("[data-read-speak]").forEach(button => button.addEventListener("click", () => speakNorwegian(button.dataset.readSpeak)));
  document.querySelectorAll("[data-read-save]").forEach(button => button.addEventListener("click", () => {
    const article = window.READING_LIBRARY.find(item => item.id === query().get("id")) || dailyReadingArticle(); const word = article.words.find(item => item.id === button.dataset.readSave); if (!word) return;
    const id = article.id + ":" + word.id;
    if (!state.savedWords.some(item => item.id === id)) state.savedWords.push({ id, word: word.lemma, zh: word.zh, pos: word.pos, forms: word.forms, sentence: word.example, translation: word.exampleZh, scene: word.scene + " " + article.title, priority: 1.5 });
    saveState(); render();
  }));
  document.querySelector("[data-read-done]")?.addEventListener("click", () => { const article = window.READING_LIBRARY.find(item => item.id === query().get("id")) || dailyReadingArticle(); const day = localDayKey(); state.readingProgress = { ...(state.readingProgress||{}), [day]: { articleId: article.id, done: true } }; saveState(); render(); sendLearningEvent("completion", true); });
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
  document.querySelectorAll("[data-topic-open]").forEach(b => b.addEventListener("click", () => { if (b.dataset.topicOpen === "practice" && (!state.topicQuiz || !state.topicQuiz.ids?.length || state.topicQuiz.index >= state.topicQuiz.ids.length)) state.topicQuiz = { ids: weightedQuestionSample(topicQuestionBank(), 20), index: 0, answers: {} }; saveState(); location.hash = `topic?unit=${b.dataset.topicOpen}`; }));
  document.querySelector("[data-back-topic-list]")?.addEventListener("click", () => { location.hash = "topics"; });
  document.querySelectorAll("[data-grammar-prev]").forEach(b => b.addEventListener("click", () => { location.hash = `topic?unit=grammar&n=${b.dataset.grammarPrev}`; }));
  document.querySelectorAll("[data-grammar-next]").forEach(b => b.addEventListener("click", () => { const n = Number(b.dataset.grammarNext); if (n >= window.FREMTID_TOPIC.grammar.length) { state.topicProgress = { ...(state.topicProgress||{}), fremtid: { ...(state.topicProgress?.fremtid||{}), grammar: true } }; saveState(); location.hash = "topics"; } else location.hash = `topic?unit=grammar&n=${n}`; }));
  document.querySelectorAll("[data-pos-filter]").forEach(b => b.addEventListener("click", () => { location.hash = `topic?unit=vocab&pos=${encodeURIComponent(b.dataset.posFilter)}`; }));
  document.querySelectorAll("[data-topic-done]").forEach(b => b.addEventListener("click", () => { const id=b.dataset.topicDone; state.topicProgress = { ...(state.topicProgress||{}), fremtid: { ...(state.topicProgress?.fremtid||{}), [id]: true } }; saveState(); location.hash = "topics"; }));
  document.querySelectorAll("[data-topic-choice]").forEach(b => b.addEventListener("click", () => { const quiz=state.topicQuiz; const q=topicQuestionBank().find(item=>item.id===quiz?.ids?.[quiz.index]); if(!q)return; const given=q.options[Number(b.dataset.topicChoice)]; const ok=given===q.answer; playLearningSound(ok?"correct":"wrong"); sendLearningEvent("answer",ok); quiz.answers={...quiz.answers,[q.id]:{ok,given}}; const old=state.topicReview?.[q.id]||{streak:0}; const streak=ok?old.streak+1:0; const days=ok?[1,3,7,14,30][Math.min(streak-1,4)]:0; state.topicReview={...(state.topicReview||{}),[q.id]:{streak,dueAt:Date.now()+(days?days*86400000:10*60000),correct:(old.correct||0)+(ok?1:0),wrong:(old.wrong||0)+(ok?0:1)}}; if(!ok) state.mistakes.push({id:Date.now(),qid:q.id,skill:q.skill,prompt:q.prompt,given,answer:q.answer,explanation:q.why}); state.topicQuiz=quiz; saveState(); render(); }));
  document.querySelector("[data-topic-next]")?.addEventListener("click", () => { const quiz=state.topicQuiz; quiz.index++; if(quiz.index>=quiz.ids.length){state.topicProgress={...(state.topicProgress||{}),fremtid:{...(state.topicProgress?.fremtid||{}),practice:true}};playLearningSound("complete");sendLearningEvent("completion",true);} saveState(); render(); });
  document.querySelector("[data-topic-reset-quiz]")?.addEventListener("click", () => { state.topicQuiz={ids:weightedQuestionSample(topicQuestionBank(),20),index:0,answers:{}}; saveState(); render(); });
  document.querySelectorAll("[data-writing]").forEach(area => area.addEventListener("input", () => { state.writing={...(state.writing||{}),[area.dataset.writing]:area.value}; saveState(); }));
  document.querySelectorAll("[data-writing-done]").forEach(box => box.addEventListener("change", () => { state.writingDone={...(state.writingDone||{}),[box.dataset.writingDone]:box.checked}; const allDone=window.FREMTID_TOPIC.writingPrompts.every((_,i)=>state.writingDone?.[i]); if(allDone) state.topicProgress={...(state.topicProgress||{}),fremtid:{...(state.topicProgress?.fremtid||{}),writing:true}}; saveState(); }));
  document.querySelector("[data-start-mistakes]")?.addEventListener("click", () => { const m=[...state.mistakes].reverse()[0]; if(m){state.mistakePractice={id:m.id,index:0,result:null};saveState();render();} });
  document.querySelector("[data-mistake-check]")?.addEventListener("click", () => { const practice=state.mistakePractice; const item=state.mistakes.find(m=>m.id===practice?.id); const given=document.querySelector("#mistake-answer")?.value||""; if(!item||!given.trim()) return; const ok=(item.answer||"").split(/\s*\/\s*/).some(answer=>normalize(answer)===normalize(given)); practice.given=given; practice.result={ok}; saveState(); render(); });
  document.querySelector("[data-mistake-hint]")?.addEventListener("click", () => { const item=state.mistakes.find(m=>m.id===state.mistakePractice?.id); if(item) alert(`提示：想想这条规则。\n${item.explanation||"尝试回忆句型，再输入完整表达。"}`); });
  document.querySelector("[data-mistake-next]")?.addEventListener("click", () => { const practice=state.mistakePractice; if(!practice) return; if(practice.result?.ok) state.mistakes=state.mistakes.filter(m=>m.id!==practice.id); const next=[...state.mistakes].reverse()[0]; state.mistakePractice=next?{id:next.id,index:(practice.index||0)+1,result:null}:null; saveState(); render(); });
  const vocabStepButton = document.querySelector("[data-vocab-step]");
  vocabStepButton?.addEventListener("click", () => {
    try { advanceVocabStep(); }
    catch (error) { console.error("词汇检查失败", error); const status = document.querySelector("#vocab-recall-status"); if (status) status.textContent = "检查时遇到问题，请再点一次；如果仍无反应，请刷新页面后继续。"; }
  });
  document.querySelector("#vocab-current")?.addEventListener("keydown", event => { if (event.key === "Enter") { event.preventDefault(); vocabStepButton?.click(); } });
  document.querySelector("#vocab-current")?.addEventListener("input", event => { const s=state.vocabSession; if(!s) return; const entry=getStudyEntry(s.ids[s.index]); const fields=entryFields(entry); const field=fields[Math.min(s.recallStep||0,fields.length-1)]; s.recallValues={...(s.recallValues||{}),[field.key]:event.target.value}; event.target.classList.remove("input-error"); const status=document.querySelector("#vocab-recall-status"); if(status)status.textContent="使用手机系统键盘输入。也可以先口头回忆，再点击‘直接看答案’。"; saveState(); });
  document.querySelector("[data-vocab-reveal]")?.addEventListener("click", () => { state.vocabSession.revealed = true; state.vocabSession.usagePending = false; state.vocabSession.recallStep = 0; state.vocabSession.recallValues = {}; state.vocabSession.lastResult = null; saveState(); render(); });
  document.querySelector("[data-vocab-usage-choice]")?.closest(".vocab-card")?.querySelectorAll("[data-vocab-usage-choice]").forEach(button => button.addEventListener("click", () => {
    const session = state.vocabSession; const q = session?.usageQuestion; if (!q || !session.usagePending) return;
    const given = q.choices[Number(button.dataset.vocabUsageChoice)]; session.usageGiven = given; session.usageOk = normalize(given) === normalize(q.answer); session.usagePending = false; session.revealed = true;
    const formOk = session.lastResult?.formsOk === true; session.lastResult = { ...session.lastResult, ok: formOk && session.usageOk, message: `${formOk ? "词形回忆正确" : "词形还需复习"}；语境选择${session.usageOk ? "正确" : "需再看讲解"}。${q.why}` };
    saveState(); render();
  }));
  document.querySelector("[data-vocab-retry]")?.addEventListener("click", () => { state.vocabSession.revealed = false; state.vocabSession.usagePending = false; state.vocabSession.usageQuestion = null; state.vocabSession.usageOk = null; state.vocabSession.recallStep = 0; state.vocabSession.recallValues = {}; state.vocabSession.lastResult = null; saveState(); render(); });
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

document.querySelector("#reset-day").addEventListener("click", () => { if (confirm("重置今日的练习记录？不会删除错题、词汇记忆和历史记录。")) { const day = localDayKey(); state.session = null; state.vocabSession = null; if (state.dailyProgress) delete state.dailyProgress[day]; if (state.readingProgress) delete state.readingProgress[day]; saveState(); location.hash = "study"; render(); } });
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
refreshAccount().then(async()=>{if(accountUser)await refreshLeaderboard();if(route()==="account")render();});
