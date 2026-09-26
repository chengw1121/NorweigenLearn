import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(cell); cell = ""; }
    else if (char === "\n") { row.push(cell.replace(/\r$/u, "")); rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  if (cell || row.length) { row.push(cell.replace(/\r$/u, "")); rows.push(row); }
  const [headers, ...data] = rows;
  return data.filter(values => values.length === headers.length).map(values => Object.fromEntries(headers.map((header, index) => [header, values[index]])));
}
const csv = name => parseCsv(fs.readFileSync(path.join(root, name), "utf8"));

test("Chinese gloss ledger covers every inventory entry and reviewed text matches the app", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const key = row => `${row.pos}|${row.lemma.trim().toLocaleLowerCase("nb-NO")}`;
  const inventoryByKey = new Map(inventory.map(row => [key(row), row]));
  const ledgerByKey = new Map(ledger.map(row => [row.id, row]));

  assert.ok(inventory.length >= 1400, "inventory should include the project's A1/A2 target scope");
  assert.equal(inventoryByKey.size, inventory.length, "inventory keys must be unique by part of speech and lemma");
  assert.equal(ledgerByKey.size, ledger.length, "ledger ids must be unique");
  assert.equal(ledger.length, inventory.length, "every active lexical inventory row must have a review row");
  assert.deepEqual([...ledgerByKey.keys()].sort(), [...inventoryByKey.keys()].sort(), "ledger and app inventory keys must match exactly");
  for (const item of inventory) {
    const exampleCount = item.example ? item.example.split(" / ").length : 0;
    const translationCount = item.translation ? item.translation.split(" / ").length : 0;
    assert.equal(translationCount, exampleCount, `${item.pos}|${item.lemma} must keep every sentence paired with its Chinese translation`);
  }

  const reviewed = ledger.filter(row => row.reviewStatus === "已人工审校");
  assert.ok(reviewed.length > 0, "review progress must be visible");
  for (const row of reviewed) {
    assert.ok(row.reviewedZh.trim(), `${row.id} needs a reviewed Chinese gloss`);
    assert.ok(row.reviewerNote.trim(), `${row.id} needs an audit rationale/source note`);
    assert.ok(row.reviewedOn.trim(), `${row.id} needs a review date`);
    assert.equal(row.reviewedZh, inventoryByKey.get(row.id).zh, `${row.id} reviewed gloss must match the shipped app gloss`);
  }
});

test("batch 38 noun, adverb, clause and collocation reviews preserve contextual meanings", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const byKey = new Map(inventory.map(row => [`${row.pos}|${row.lemma.toLocaleLowerCase("nb-NO")}`, row]));
  const ledgerByKey = new Map(ledger.map(row => [row.id, row]));
  const hyling = byKey.get("名词|hyling");
  assert.ok(hyling, "hyling must remain a clean lemma key despite alternate gender forms");
  assert.match(hyling.display, /^en hyling$/u);
  assert.match(hyling.forms, /en\/ei hyling/u);
  assert.match(hyling.translation, /观众席上响起一阵尖叫/u);
  assert.match(hyling.translation, /风的呼啸声/u);

  const julepynt = byKey.get("名词|julepynt");
  assert.ok(julepynt);
  assert.match(julepynt.forms, /^julepynt · julepynten$/u);
  assert.doesNotMatch(julepynt.display, /en julepynt/u);

  const når = byKey.get("从属连词|når");
  assert.match(ledgerByKey.get("从属连词|når").reviewerNote, /间接问句.*疑问副词/u);
  assert.match(når.translation, /我到家后给你打电话/u);
  const innen = byKey.get("介词|innen");
  assert.match(ledgerByKey.get("介词|innen").reviewerNote, /截止期限/u);
  assert.match(ledgerByKey.get("介词|innen").reviewerNote, /innenfor/u);
  const lenger = byKey.get("副词|lenger");
  assert.match(lenger.zh, /不再/u);
  assert.match(ledgerByKey.get("副词|lenger").reviewerNote, /比较级/u);
  const nettopp = byKey.get("副词|nettopp");
  assert.match(nettopp.zh, /刚刚/u);
  assert.match(nettopp.zh, /正好/u);
  assert.match(nettopp.zh, /正是/u);
  const kjeks = byKey.get("名词|kjeks");
  assert.match(ledgerByKey.get("名词|kjeks").reviewerNote, /甜味曲奇只是其中一种/u);
  for (const key of ["名词|hyling", "动词|høres", "名词|julepynt", "名词|periode", "名词|slutt", "副词|før", "形容词|fri", "名词|smør", "名词|kjeks"]) {
    const row = byKey.get(key);
    assert.ok(row?.translation?.trim(), `${key} needs natural, sentence-matched translations`);
    const review = ledgerByKey.get(key);
    assert.ok(review?.reviewerNote?.trim(), `${key} needs a specific usage explanation, not a generic phrase template`);
    assert.doesNotMatch(review.reviewerNote, /把动词和后面的词一起理解；同一个动词换了搭配/u);
  }
});

test("online-curated vocabulary examples retain translations and verifiable source links", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const sourced = inventory.filter(row => row.exampleSources.trim());
  assert.ok(sourced.length >= 8, "curated online examples should be discoverable in the generated corpus inventory");
  for (const row of sourced) {
    assert.ok(row.example.trim(), `${row.lemma} sourced examples need sentence text`);
    assert.ok(row.translation.trim(), `${row.lemma} sourced examples need Chinese translations`);
    for (const url of row.exampleSources.split(" / ")) assert.match(url, /^https:\/\/(?:www\.)?(?:ordbokene\.no|naob\.no|hf\.ntnu\.no|ntnu\.edu|norwegianclass101\.com|preply\.com)\//u, `${row.lemma} source should be a verified dictionary, university, or language-learning source`);
  }
  const curated = new Map(inventory.map(row => [`${row.pos}|${row.lemma}`, row]));
  for (const [pos, lemma, norwegian, chinese] of [
    ["形容词", "hemmelig", "Jeg er hemmelig forelsket i henne.", "我暗恋着她。"],
    ["形容词", "kjempebra", "Dette gikk kjempebra!", "这件事进展得特别顺利！"],
    ["形容词", "kjempefin", "En kjempefin opplevelse.", "一次特别棒的体验。"],
    ["形容词", "kjempeflink", "Hun er kjempeflink til å snakke for seg.", "她特别善于表达自己。"],
    ["动词", "kjenne", "Politiet kjenner til saken.", "警方了解这件事。"],
    ["形容词", "koselig", "Et koselig hjem.", "一个温馨舒适的家。"],
    ["形容词", "lang", "Hun har langt hår.", "她留着长头发。"],
    ["动词", "le", "Folk smiler og ler til hverandre.", "人们相视微笑、大笑。"],
    ["形容词", "liten", "Hun har et lite barn.", "她有一个年幼的孩子。"],
    ["形容词", "brun", "ha brunt hår og brune øyne", "有棕色头发和棕色眼睛。"],
    ["形容词", "grei", "Han svarte greit på alle spørsmålene.", "他把所有问题都回答得很清楚。"],
    ["形容词", "grønn", "Han er fortsatt grønn på området.", "他在这个领域仍然缺乏经验。"],
    ["形容词", "grå", "Det var grått vær.", "天气阴沉多云。"],
    ["形容词", "gøy", "Dette var gøy.", "这真好玩。"],
    ["副词", "heldigvis", "Det gikk heldigvis bra.", "幸好事情进展顺利。"],
    ["形容词", "hyggelig", "Takk for en hyggelig kveld.", "谢谢你带来一个愉快的夜晚。"],
    ["副词", "ikke", "Han kjører ikke bil.", "他不开车。"],
    ["形容词", "interessant", "En interessant artikkel.", "一篇有意思、值得读的文章。"],
    ["形容词", "kald", "I dag er det kaldt ute.", "今天外面很冷。"],
    ["形容词", "blå", "blå himmel og blått hav", "蓝色的天空和蓝色的海"],
    ["形容词", "bra", "Det gikk bra med henne.", "她一切顺利。"],
    ["副词", "dessverre", "Jeg kan dessverre ikke komme.", "很遗憾，我来不了。"],
    ["形容词", "fin", "Det går fint.", "一切顺利。/没问题。"],
    ["形容词", "fornøyd", "Si seg fornøyd med resultatet.", "表示对结果满意。"],
    ["名词", "fotball", "Mange følger med på norsk fotball.", "很多人关注挪威足球。"],
    ["形容词", "fæl", "Et fælt syn.", "一幅可怕/令人不忍直视的景象。"],
    ["形容词", "gammel", "Hvor gammel er du?", "你多大了？"],
    ["副词", "ganske", "Hun er ganske flink.", "她挺能干的。"],
    ["动词", "bestå", "Vann består av hydrogen og oksygen.", "水由氢和氧组成。"],
    ["动词", "søke", "Hjelpemannskaper har søkt i hele natt.", "救援人员整夜都在搜寻。"],
    ["动词", "høre", "Har du hørt denne sangen før?", "你以前听过这首歌吗？"],
    ["动词", "mene", "Jeg skjønner ikke hva du mener.", "我不明白你的意思。"],
    ["动词", "skulle", "Vi skal reise i morgen.", "我们明天要出发。"],
    ["动词", "ville", "Vil dere ha litt kaffe?", "你们想来点咖啡吗？"],
    ["动词", "fortelle", "Fortell mer!", "再多讲一些！"],
    ["动词", "snakke", "Vi har aldri snakket om det.", "我们从来没有谈过这件事。"],
    ["动词", "spørre", "Hun spurte om veien.", "她问了路。"],
    ["动词", "si", "Hun sier at det regner.", "她说正在下雨。"],
    ["动词", "forstå", "Jeg forstår deg.", "我理解你。"],
    ["介词", "til", "Er den virkelig til meg?", "它真的是给我的吗？"],
    ["名词", "sykehus", "Hun ble lagt inn på sykehus.", "她住院了。"],
    ["动词", "lukke", "Hun lukket bøkene for kvelden.", "她今晚不再看书了。"],
    ["名词", "oppgave", "Det er din oppgave å ta gulvvasken.", "打扫地板是你的任务。"],
    ["名词", "pause", "Taleren gjorde en pause.", "演讲者停顿了一下。"],
    ["感叹词", "oi", "Oi, her blir det vanskelig å velge!", "哎呀，这下很难选了！"],
    ["名词", "gitar", "Han spiller klassisk gitar.", "他演奏古典吉他。"],
    ["形容词", "dyr", "Det ble en dyr lærepenge for meg.", "这对我来说是一次代价惨重的教训。"],
    ["名词", "frimerke", "Hun setter et frimerke på konvolutten.", "她在信封上贴一张邮票。"],
    ["动词", "kalle", "De kalte inn til møte.", "他们召集开会。"],
    ["名词", "måte", "Kan du si det på en enklere måte?", "你能用更简单的方式说吗？"],
    ["副词", "også", "Nei, kommer du også?", "咦，你也来吗？"],
    ["动词", "ringe", "Telefonen ringer.", "电话响了。"],
    ["动词", "sende", "Kan du sende meg en melding når du er framme?", "你到达后能给我发条消息吗？"],
    ["名词", "takk", "Takk, nå er jeg forsynt.", "谢谢，我已经够了。"],
    ["动词", "takke", "Han takket henne for gaven.", "他感谢她送的礼物。"],
    ["感叹词", "unnskyld", "Unnskyld, kan du si meg veien til byen?", "劳驾，能告诉我去市中心的路怎么走吗？"],
    ["动词", "vise", "Hun viste meg arbeidsplassen sin.", "她带我看了她的工作场所。"],
    ["名词", "aktivitet", "Hun er i aktivitet hele dagen.", "她一整天都在活动。"],
    ["名词", "beslutning", "Styret har fattet følgende beslutning.", "董事会作出了以下决定。"],
    ["名词", "endring", "Jeg foreslår noen få endringer.", "我建议做几处小改动。"],
    ["名词", "forbedring", "Dette er en klar forbedring.", "这是一个明显的改进。"],
    ["名词", "framtid", "Framtiden ligger åpen foran deg.", "你的未来有无限可能。"],
    ["名词", "glede", "Hun sprer glede til alle rundt seg.", "她把快乐带给身边的每一个人。"],
    ["名词", "håp", "Det er fortsatt håp om at han kan bli frisk.", "他仍有康复的希望。"],
    ["名词", "løsning", "Vi må finne fram til en helhetlig løsning.", "我们必须找到一个全面的解决方案。"],
    ["动词", "fokusere", "Vi må fokusere på å løse problemene.", "我们必须把注意力集中在解决问题上。"],
    ["动词", "forandre", "Tidene forandrer seg.", "时代在变化。"],
    ["动词", "forbedre", "Mye kan forbedres her.", "这里有很多方面可以改进。"],
    ["动词", "oppnå", "Hun oppnådde et godt resultat.", "她取得了好成绩。"],
    ["从属连词", "at", "Hun sier at det snør.", "她说正在下雪。"],
    ["并列连词", "men", "Jeg kunne ha gjort det, men jeg ville ikke.", "我本来可以做，但我不愿意。"],
    ["从属连词", "mens", "Hun liker å sy, mens søsteren foretrekker å lese.", "她喜欢缝纫，而她的姐妹更喜欢读书。"],
    ["并列连词", "og", "De sang og spilte.", "他们唱歌并演奏。"],
    ["并列连词", "eller", "Bruk en knapp eller lignende.", "使用一个按钮或类似的东西。"],
    ["名词", "avis", "Det stod i avisen i går.", "这件事昨天刊登在报纸上了。"],
    ["动词", "selge", "De selger gården sin til naboen.", "他们把自己的农场卖给邻居。"],
    ["名词", "lås", "Bilen har elektronisk lås.", "这辆车有电子锁。"],
    ["动词", "låse", "Hun låser alltid sykkelen.", "她总是把自行车锁好。"],
    ["名词", "loff", "spise reker med loff og majones", "吃虾时配白面包和蛋黄酱"],
    ["形容词", "forskjellig", "De to søstrene er svært forskjellige.", "这两姐妹非常不同。"],
    ["副词", "alene", "Du er ikke alene om å mene det.", "不只有你这么认为。"],
    ["形容词", "billig", "Det var utrolig billig.", "这便宜得惊人。"],
    ["名词", "gebyr", "kreve et gebyr", "收取一笔费用"],
    ["动词", "handle", "Har du handlet alt vi trenger?", "我们需要的东西你都买齐了吗？"],
    ["名词", "handlekurv", "Jeg legger varene i handlekurven.", "我把商品放进购物篮里。"],
    ["名词", "handleliste", "skrive handleliste", "写购物清单"],
    ["名词", "handlevogn", "stå i kø bak folk med fulle handlevogner", "排在推着满满购物车的人后面等候"],
    ["名词", "kasse", "sitte i kassa", "在收银台当班/负责收银"],
    ["名词", "kjøtt", "Vi spiser kjøtt to ganger i uka.", "我们每周吃两次肉。"],
    ["名词", "klesbutikk", "Jeg kjøper en jakke i en klesbutikk.", "我在一家服装店买一件夹克。"],
    ["名词", "kylling", "spise kylling til middag", "晚餐吃鸡肉"],
    ["名词", "laks", "bakt laks med agurksalat", "配黄瓜沙拉的烤三文鱼"],
    ["名词（通常不可数）", "melk", "drikke melk til maten", "吃饭时喝牛奶"],
    ["名词", "ost", "ha ost på brødskiva", "在面包片上放奶酪"],
    ["名词", "pakke", "få en pakke i posten", "收到一个邮寄包裹"],
    ["名词", "penge", "ha penger i lommeboka", "钱包里有钱"],
    ["名词", "pose", "hun puttet treningstøyet i en pose", "她把运动服放进一个袋子里"],
    ["名词", "pris", "prisen på melk", "牛奶的价格"],
    ["名词", "pølse", "pølse med brød", "夹面包吃的香肠（热狗）"],
    ["形容词", "sulten", "være så sulten at det piper i tarmene", "饿得肚子咕咕叫"],
    ["形容词", "tørst", "de var både sultne og tørste etter turen", "他们徒步后又饿又渴"],
    ["形容词", "fersk", "ferske nyheter", "最新消息"],
    ["形容词", "grov", "spise grovt brød til frokost", "早餐吃全谷物面包"],
    ["形容词", "kjempegod", "kjempegod mat", "特别美味的食物"],
    ["名词", "saus", "kjøttkaker i brun saus", "肉丸配棕色肉汁"],
    ["名词", "grønnsak", "brokkoli er en næringsrik grønnsak", "西兰花是一种营养丰富的蔬菜"],
    ["名词", "gulrot", "servere kokt gulrot", "端上煮胡萝卜"],
    ["名词", "paprika", "en fargerik salat med gul, grønn og lilla paprika", "一份色彩丰富的沙拉，里面有黄、绿、紫甜椒"],
    ["名词", "potet", "server med kokte, stekte eller bakte poteter", "配煮土豆、煎土豆或烤土豆"],
    ["限定词/副词", "litt", "kjøpe litt mat", "买一些食物"],
    ["限定词", "mange", "hvor mange er dere?", "你们一共多少人？"],
    ["副词/限定词", "mer", "kjøpe mer mat", "多买一些食物"],
    ["副词", "mer", "Du må trene mer.", "你得多锻炼"],
    ["形容词", "hel", "en hel time", "整整一个小时"],
    ["限定词/代词", "all", "bruke all fritiden sin på idrett", "把所有空闲时间都用来运动"],
    ["限定词/形容词", "annen", "de ventet til en annen dag", "他们等到另一天"],
    ["限定词", "noen", "har du noen som helst grunn til å klage?", "你有什么理由可以抱怨吗"],
    ["限定词", "atten", "vi var atten til bords", "我们一桌坐了十八个人"],
    ["缩写", "ca.", "ca. 100 kr", "约100克朗"],
    ["数词", "én", "kan jeg få én kake til?", "我能再要一块蛋糕吗"],
    ["限定词", "fem", "ta seg fem minutter", "抽五分钟休息一下"],
    ["数词", "fire", "en familie på fire", "一个四口之家"],
    ["限定词", "fjorten", "fjorten år senere", "十四年后"],
    ["动词", "spare", "Du sparer penger på å handle der.", "在那儿购物能省钱。"],
    ["名词", "forsett", "Jeg har et urokkelig forsett.", "我有一个坚定不移的决心。"],
    ["名词", "framgang", "Framgangen fra i fjor er merkbar.", "和去年相比，进步很明显。"],
    ["动词", "fullføre", "De fullfører et studium.", "他们完成一项学业。"],
    ["动词短语", "glede seg", "Jeg gleder meg til jul.", "我很期待圣诞节。"],
    ["名词", "innsats", "Hun har gjort en stor innsats for norsk teater.", "她为挪威戏剧事业作出了很大贡献。"],
    ["名词", "karriere", "Hun satser på en karriere som kunstner.", "她立志以艺术家为职业发展方向。"],
    ["名词", "motivasjon", "Mange mangler motivasjon for langvarig skolegang.", "很多人缺乏长期求学的动力。"],
    ["名词", "nyttår", "Han kommer over nyttår.", "他过了新年就来。"],
    ["动词", "oppdage", "Plutselig oppdaget han en mann fra hjemstedet.", "他突然发现一个来自家乡的人。"],
    ["名词", "opplevelse", "Konserten ble en minneverdig opplevelse.", "这场音乐会成了一段难忘的经历。"],
    ["名词", "plan", "Hvilke planer har du for framtiden?", "你对未来有什么计划？"],
    ["动词", "prioritere", "Denne saken bør prioriteres.", "这件事应该优先处理。"],
    ["名词", "reise", "Jeg drar på en reise til Paris.", "我要去巴黎旅行。"],
    ["形容词", "energisk", "Hun er et energisk menneske.", "她是一个精力充沛、做事很有干劲的人。"],
    ["形容词", "fokusert", "Jeg vil være mer fokusert på norsk.", "我想把更多注意力放在挪威语上。"],
    ["动词结构", "komme til å", "Hun kommer til å greie oppgaven.", "她会完成这项任务。"],
    ["形容词", "kreativ", "Hun er en kreativ kunstner.", "她是一位有创意的艺术家。"],
    ["副词", "mer", "Du må trene mer.", "你得多锻炼。"],
    ["形容词", "motivert", "Hun er motivert for oppgaven.", "她对这项任务很有动力。"],
    ["限定词/形容词", "neste", "Toget stopper ikke på neste stasjon.", "火车不会在下一站停车。"],
    ["介词", "nær", "Vi bor nær byen.", "我们住在城附近。"],
    ["介词", "om", "Vi snakker om framtida.", "我们在谈论未来。"],
    ["时间短语", "om fem år", "Om fem år bor jeg fortsatt i Norge.", "五年后我仍住在挪威。"],
    ["形容词", "positiv", "Hun har en positiv innstilling.", "她抱着积极的态度。"],
    ["形容词", "rolig", "Sjøen var rolig.", "海面很平静。"],
    ["名词", "rutine", "Hun hadde en fast rutine hver morgen.", "她每天早上都有固定的习惯。"],
    ["动词短语", "se for seg", "De ser for seg en sydhavsøy.", "他们想象着一座南太平洋岛屿。"],
    ["动词", "skape", "Vi vil skape noe nytt.", "我们想创造一些新事物。"],
    ["名词", "suksess", "Boka ble en suksess.", "这本书大获成功。"],
    ["形容词", "sunn", "Mosjon og rikelig med søvn er sunt.", "锻炼和充足的睡眠有益健康。"],
    ["动词", "trene", "Hun trener for å ta vare på kroppen.", "她锻炼是为了保持身体健康。"],
    ["形容词", "tålmodig", "Han var tålmodig med barna.", "他对孩子们很有耐心。"],
    ["名词", "utvikling", "En ny metode er under utvikling.", "一种新方法正在研发中。"],
    ["名词", "valg", "Jeg står foran et vanskelig valg.", "我正面临一个艰难的选择。"],
    ["名词", "vennskap", "Det er godt vennskap mellom dem.", "他们之间有着良好的友谊。"],
    ["形容词", "morsom", "Det er morsomt å seile.", "帆船运动很好玩。"],
    ["形容词", "ny", "Bilen er flunkende ny.", "这辆车崭新。"],
    ["形容词", "nysgjerrig", "De er nysgjerrige på alt nytt.", "他们对所有新事物都很好奇。"],
    ["形容词", "rett", "Finne det rette ordet.", "找到合适/正确的那个词。"],
    ["形容词", "riktig", "Alt gikk riktig for seg.", "一切都按正确的方式进行。"],
    ["形容词", "sann", "En sann historie.", "一个真实的故事。"],
    ["形容词", "stor", "Norge har vært en stor eksportør av tørrfisk.", "挪威一直是重要的鳕鱼干出口国。"],
    ["形容词", "trist", "Jeg var både trist og redd.", "我当时既难过又害怕。"],
    ["形容词", "trøtt", "Hun er trøtt av det ensformige livet sitt.", "她厌倦了自己单调乏味的生活。"],
    ["形容词", "varm", "En varm genser.", "一件保暖的毛衣。"],
    ["形容词", "våken", "Er du våken?", "你醒着吗？"],
    ["名词", "formiddag", "i morgen formiddag", "明天上午"],
    ["形容词", "forrige", "i forrige uke", "上周"],
    ["副词", "først", "Først må vi vaske opp.", "我们得先洗碗。"],
    ["形容词", "første", "første kapittel", "第一章"],
    ["名词", "gang", "Hvor mange ganger må jeg si det?", "这话我得说多少遍？"],
    ["形容词", "halv", "Klokka er halv ti.", "现在是九点半。"],
    ["名词", "klokke", "Hvor mye er klokka?", "现在几点？"],
    ["数词/副词", "kvart", "Vi må gå kvart på fire.", "我们得三点四十五分走。"],
    ["名词", "minutt", "Det er gjort på noen minutter.", "这几分钟就做完了。"],
    ["副词", "snart", "Nå er det snart slutt på pengene.", "现在钱快花完了。"],
    ["副词", "nå", "Nå drar vi.", "我们现在出发。"],
    ["动词", "tenke", "Hva har du tenkt å gjøre?", "你打算做什么？"],
    ["形容词", "flink", "Hun er flink til å snakke for seg.", "她很善于表达自己。"],
    ["形容词", "glad", "De var glad i hverandre.", "他们彼此相爱/很喜欢对方。"],
    ["形容词", "god", "Hun er god til å danse.", "她很擅长跳舞。"],
    ["副词", "kanskje", "De kommer kanskje i morgen.", "他们也许明天会来。"],
    ["名词", "mål", "Hun satte seg et mål om å lære norsk.", "她给自己定下了学习挪威语的目标。"],
    ["名词", "kø", "De står i kø.", "他们在排队。"],
    ["名词", "oppskrift", "Følg oppskriften nøye.", "仔细按照食谱/说明操作。"],
    ["形容词", "flott", "Det gikk flott.", "事情进展得很顺利。"],
    ["名词", "bluse", "kle seg i skjørt og bluse", "穿上裙子和女式衬衫"],
    ["名词", "bukse", "et par bukser", "一条裤子"],
    ["名词", "jakke", "gå i bukse og jakke", "穿着裤子和外套"],
    ["名词（复数）", "klær", "kjøpe seg nye klær", "给自己买新衣服"],
    ["名词", "nøkkel", "Nøkkelen står i døra.", "钥匙插在门上。"],
    ["名词", "sko", "ta på seg skoene", "把鞋穿上"],
    ["名词", "telefon", "Telefonen ringer.", "电话响了。"],
    ["名词", "vekkerklokke", "stille vekkerklokka på klokka halv sju", "把闹钟设在六点半"],
    ["名词", "humør", "Humøret var på topp.", "心情好极了。"],
    ["形容词", "fattig", "fattige mennesker som tigger på gata", "在街头乞讨的贫困人群"],
    ["动词", "bestemme", "Vi har bestemt oss for å reise i morgen.", "我们已经决定明天出发。"],
    ["动词", "bety", "Hva betyr dette skiltet?", "这个标志是什么意思？"],
    ["动词", "brenne", "Låven brenner.", "谷仓着火了。"],
    ["动词", "dele", "Hun delte eplet i små biter.", "她把苹果切成小块。"],
    ["动词", "dusje", "dusje etter treningen", "训练后洗淋浴"],
    ["动词", "fortsette", "Vi kan fortsette samtalen en annen gang.", "我们可以改天继续谈话。"],
    ["动词", "hente", "Jeg henter deg på stasjonen.", "我去车站接你。"],
    ["动词", "hoppe", "Du kan hoppe over dette spørsmålet og gå videre til neste.", "你可以跳过这道题，继续做下一题"],
    ["动词", "klappe", "Publikum klappet og klappet.", "观众不断鼓掌。"],
    ["动词", "løfte", "Heisekrana løfter flere tonn.", "起重机能吊起好几吨。"],
    ["动词", "rope", "De ropte raskt om hjelp.", "他们赶紧大声呼救。"],
    ["动词", "stoppe", "Bussen stoppet med et rykk.", "公交车猛地停了下来。"],
    ["动词", "synge", "De synger i et kor.", "他们在合唱团里唱歌。"],
    ["动词", "våkne", "våkne ved den minste lyd", "一有一点声音就醒来"],
    ["动词", "åpne", "Han åpnet døra forsiktig.", "他小心地打开了门。"],
    ["动词", "bruke", "Hun brukte lang tid på leksene.", "她做作业花了很长时间。"],
    ["动词", "bære", "Han bar en koffert.", "他提着一只行李箱。"],
    ["动词", "begynne", "Møtet begynner kl. 13.", "会议下午一点开始。"],
    ["动词", "glemme", "Jeg har glemt hva han heter.", "我忘了他叫什么名字。"],
    ["动词", "huske", "Husk å ta med kopp.", "记得带上杯子。"],
    ["动词", "vente", "Jeg har ventet ganske lenge nå.", "我已经等了挺久了。"],
    ["动词", "like", "Likte du filmen?", "你喜欢那部电影吗？"],
    ["动词", "prøve", "Jeg prøvde å komme tidsnok.", "我试着准时赶到。"],
    ["名词", "mat", "Han liker å lage mat.", "他喜欢做饭。"],
    ["名词", "dusj", "Jeg tar en dusj før jobb.", "我上班前冲个澡。"],
    ["动词", "få", "Han får svar i morgen.", "他明天会收到答复。"],
    ["动词", "gå", "De gikk seg en tur rundt vannet.", "他们绕着湖散了一会儿步。"],
    ["动词", "ha", "Hvordan har du det?", "你最近怎么样？"],
    ["动词", "komme", "Der kommer bussen.", "公交车来了。"],
    ["动词", "ta", "Ta tauet!", "把绳子拿住！"],
    ["动词", "være", "De er i utlandet.", "他们在国外。"],
    ["动词", "bli", "Hun ble igjen på hytta.", "她留在了小木屋里。"],
    ["动词", "gjøre", "Hun vil gjøre det selv.", "她想自己做这件事。"],
    ["动词", "måtte", "Jeg må gå nå.", "我现在必须走了。"],
    ["动词", "hjelpe", "De hjelper hverandre.", "他们互相帮助。"],
    ["动词", "se", "Han så en film.", "他看了一部电影。"],
    ["动词", "ligge", "Boka ligger på bordet.", "书在桌子上。"],
    ["动词", "sette", "De setter skoene i gangen.", "他们把鞋放在走廊里。"],
    ["动词", "sitte", "Gjestene satt i sofaen.", "客人们坐在沙发上。"],
    ["动词", "stå", "Bøkene står i hylla.", "书在书架上。"],
    ["动词", "finne", "Jeg fant hammeren i boden.", "我在储物间找到了锤子。"],
    ["动词", "gi", "Gi meg avisen.", "把报纸递给我。"],
    ["动词", "holde", "Han holdt barnet i armene.", "他把孩子抱在怀里。"],
    ["动词", "kunne", "Hun kan sykle.", "她会骑自行车。"],
    ["动词", "løpe", "De løper om kapp.", "他们在赛跑。"]
    , ["名词", "oppvaskmaskin", "På kjøkkenet er det en benk med komfyr og oppvaskmaskin.", "厨房里有一个台面，上面有炉灶和洗碗机。"]
    , ["名词", "oppvaskmaskin", "Etter middagen satte vi alt i oppvaskmaskinen.", "晚饭后，我们把所有餐具都放进了洗碗机。"]
    , ["名词", "vaskemaskin", "Jeg bruker vaskemaskinen for å holde klærne rene.", "我用洗衣机把衣服洗干净。"]
    , ["名词", "orden", "Navnene står i alfabetisk orden.", "名字按字母顺序排列。"]
    , ["名词", "orden", "Er alt i orden?", "一切都正常吗？"]
    , ["动词", "ordne", "Det ordner seg.", "事情会解决的；会好起来的。"]
    , ["动词", "legge", "Hun legger hånden på skulderen hans.", "她把手放在他的肩膀上。"]
    , ["动词", "vaske", "Hun vasker hendene.", "她在洗手。"]
    , ["动词", "vekke", "Vekk meg klokka sju!", "七点叫醒我！"]
    , ["名词", "konge", "Løven er dyrenes konge.", "狮子是百兽之王。"]
    , ["名词", "kne", "Ha smerter i kneet.", "膝盖疼。"]
    , ["名词", "lår", "Slå seg på lårene og le.", "拍着大腿大笑。"]
    , ["名词", "nakke", "Være stiv i nakken og skuldrene.", "脖子后侧和肩膀僵硬。"]
    , ["名词", "tunge", "Kjenne etter med tunga.", "用舌头感觉一下。"]
    , ["名词", "tunge", "Et smørbrød med tunge.", "一份舌肉三明治。"]
    , ["名词", "øre", "Ha ringer i ørene.", "戴着耳环。"]
    , ["名词", "øre", "I 1972 kostet en liter bensin en krone og femti øre.", "1972年一升汽油的价格是一克朗五十欧尔。"]
    , ["名词", "øye", "Ha vondt i øyet.", "眼睛疼。"]
    , ["名词", "øye", "Hun hadde store, brune øyne.", "她有一双又大又棕的眼睛。"]
    , ["名词（通常不可数）", "blod", "Gi blod.", "献血。"]
    , ["名词（通常不可数）", "blod", "Ha hett blod i årene.", "血液里流着热血；性情热烈。"]
    , ["名词", "hjerte", "Hjertet hamret i brystet på meg.", "我的心在胸腔里怦怦直跳。"]
    , ["名词", "hånd", "Vaske hendene.", "洗手。"]
    , ["名词", "hånd", "Skrive for hånd.", "手写。"]
    , ["名词", "hår", "Ha langt hår.", "留着长头发。"]
    , ["名词", "hår", "Miste hår.", "掉头发。"]
    , ["名词", "nese", "Være tett i nesa.", "鼻子不通气。"]
    , ["名词", "nese", "Hunden har en veldig skarp nese.", "这只狗的嗅觉非常灵敏。"]
    , ["名词", "sminke", "Skuespilleren tok av seg sminken.", "演员卸了妆。"]
    , ["名词", "ansikt", "Jeg ser det på ansiktet ditt.", "我从你的脸上看出来了。"]
    , ["名词", "ansikt", "Norsk idrett trenger nye ansikter.", "挪威体育界需要新面孔。"]
    , ["名词", "feber", "Ha 39 i feber.", "发烧到39度。"]
    , ["名词", "kropp", "Han svettet over hele kroppen.", "他浑身都出汗了。"]
    , ["动词", "leve", "De lever i utlandet nå.", "他们现在住在国外。"]
    , ["动词", "leve", "Jeg må leve på diett.", "我得按规定饮食；我必须控制饮食。"]
    , ["动词", "dø", "Planten døde fordi jeg glemte å vanne den.", "我忘了给植物浇水，所以它枯死了。"]
    , ["动词", "dø", "Dyrearten dør ut.", "这个物种正在灭绝。"]
    , ["形容词", "endelig", "Saken er endelig avgjort.", "此事已作出最终裁决。"]
    , ["副词", "endelig", "Endelig kom de.", "他们终于来了。"]
    , ["介词/从属连词", "om", "Bli med om du har lyst.", "如果你愿意，就一起去吧。"]
    , ["介词/从属连词", "om", "Hun lurte på om noen hadde ringt.", "她想知道有没有人打过电话。"]
    , ["副词", "da", "Da var Norge i union med Danmark.", "那时挪威与丹麦处于联合王国关系中。"]
    , ["副词", "da", "Da kom de til et hus.", "接着他们来到一座房子。"]
    , ["副词", "da", "Det gikk da bra.", "事情倒还挺顺利。"]
    , ["副词", "så", "Først tok hun på seg jakke, så lue, så skjerf og votter.", "她先穿上夹克，然后戴上帽子、围上围巾、戴上手套。"]
    , ["副词", "så", "Ring meg når du er på vei, så skal jeg sette på middagen.", "你出发后给我打电话，我就开始准备晚饭。"]
    , ["名词", "ettermiddag", "I ettermiddag tar jeg fri.", "我今天下午休息。"]
    , ["名词", "ettermiddag", "De pleier å ta en lur om ettermiddagen.", "他们通常下午会小睡一会儿。"]
    , ["名词", "kvarter", "Bussen går hvert kvarter.", "公交车每15分钟一班。"]
    , ["名词", "meter", "Huset er ti meter langt.", "这栋房子长十米。"]
    , ["副词", "siden", "Siden har jeg ikke prøvd.", "此后我就没再试过。"]
    , ["限定词", "sju", "Klokka slår sju.", "钟敲七下。"]
    , ["副词", "straks", "Klokka er straks ti.", "快十点了。"]
    , ["名词", "time", "Jeg har time hos legen klokka to.", "我约了两点看医生。"]
    , ["名词", "dag", "God dag!", "你好！/日安！"]
    , ["名词", "tid", "Det tar sin tid.", "这需要一些时间。"]
    , ["名词", "kveld", "Butikkene var stengt for kvelden.", "商店当天晚上已经关门了。"]
    , ["名词", "morgen", "God morgen!", "早上好！"]
    , ["名词", "uke", "i neste uke", "下周"]
    , ["名词", "år", "barnet fyller snart to år", "孩子很快就满两岁了"]
    , ["名词", "natt", "klokka tre i natt", "今晚/昨晚三点（依说话时间）"]
    , ["形容词", "sein", "senere i dag", "今天晚些时候"]
    , ["名词", "fisk", "Vi fikk lite fisk.", "我们没捕到多少鱼。"]
    , ["名词", "bakeri", "Vi kjøper brød på bakeriet.", "我们在面包店买面包。"]
    , ["名词", "brødhylle", "Jeg finner brødet på den nederste brødhylla.", "我在最下面一层面包架上找到面包。"]
    , ["名词", "egg", "hardkokt egg", "煮熟的鸡蛋"]
    , ["名词", "ekspeditør", "arbeide som ekspeditør", "做售货员/店员"]
    , ["名词", "eple", "høste epler", "采摘苹果"]
  ]) {
    const row = curated.get(`${pos}|${lemma}`);
    assert.ok(row, `${lemma} should be in the compiled vocabulary corpus`);
    assert.ok(row.example.includes(norwegian), `${lemma} sourced Norwegian example should be retained`);
    assert.ok(row.translation.includes(chinese), `${lemma} example translation should be retained`);
    assert.ok(row.exampleSources.split(" / ").some(url => /^https:\/\/(?:www\.)?(?:ordbokene\.no|naob\.no|hf\.ntnu\.no|ntnu\.edu|norwegianclass101\.com|preply\.com)\//u.test(url)), `${lemma} should retain a verifiable dictionary, university, or language-learning source`);
  }
});

test("the 26 September lexical batch corrects misleading senses and has reviewed context", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const reviewedIds = [
    "形容词|typisk", "形容词|vanskelig", "形容词|slapp", "形容词|total", "形容词|bestemt",
    "形容词|stressende", "形容词|ekte", "形容词|viktig", "形容词|normal", "动词|klare",
    "名词|elektrisitet", "名词|strøm", "名词|alder", "名词|tenåring", "名词|gubbe",
    "名词|tenåringsjente", "名词|pensjonist", "名词|lutefisk", "名词|akevitt", "名词|pinnekjøtt",
    "名词|ribbe", "名词|svineribbe", "名词|vikingskip", "名词|hyttetradisjon", "名词|norskkurs"
  ];
  const inventoryById = new Map(inventory.map(row => [`${row.pos}|${row.lemma}`, row]));
  const ledgerById = new Map(ledger.map(row => [row.id, row]));
  for (const id of reviewedIds) {
    assert.equal(ledgerById.get(id)?.reviewStatus, "已人工审校", `${id} must be logged as reviewed`);
    assert.equal(ledgerById.get(id)?.reviewedOn, "2026-09-26", `${id} must belong to this dated batch`);
    assert.equal(ledgerById.get(id)?.reviewedZh, inventoryById.get(id)?.zh, `${id} reviewed gloss must match the current corpus`);
  }
  const electricity = inventoryById.get("名词|elektrisitet");
  assert.equal(electricity.display, "elektrisitet", "uncountable elektrisitet must not be displayed as an ordinary count noun with en");
  assert.match(electricity.zh, /不可数/u);
  assert.match(inventoryById.get("名词|lutefisk").zh, /碱液处理的干鱼/u, "lutefisk should not be narrowly defined as cod");
  assert.match(inventoryById.get("名词|tenåring").zh, /通常/u, "teenager age range must not be stated as a rigid definition");
  assert.match(inventoryById.get("名词|strøm").zh, /水流\/气流/u, "noun senses should be clear without describing a verb action as the gloss");
  const repeatTranslations = inventory.filter(row => reviewedIds.includes(`${row.pos}|${row.lemma}`)).map(row => row.translation).join(" ");
  assert.doesNotMatch(repeatTranslations, /很快.{0,4}好几次|好几次.{0,4}很快/u, "repetition examples must not conflict with an incompatible speed cue");
});

test("the contextual-sense batch distinguishes polysemy and gender/relationship cues", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const reviewedIds = [
    "动词|bake", "动词|grille", "名词|gryterett", "名词|kamerat", "名词|venninne", "副词|heller",
    "形容词|vanlig", "介词|iblant", "形容词|elendig", "形容词|heldig", "形容词|nydelig", "形容词|perfekt",
    "形容词|nyttig", "动词|pusse", "形容词|rotete", "形容词|ryddig", "形容词|skitten", "形容词|stolt",
    "动词|hate", "形容词|begeistret", "动词|beundre", "动词|gråte", "名词|lykke", "名词|kølapp", "形容词|kritisk"
  ];
  const inventoryById = new Map(inventory.map(row => [`${row.pos}|${row.lemma}`, row]));
  const ledgerById = new Map(ledger.map(row => [row.id, row]));
  for (const id of reviewedIds) {
    const row = inventoryById.get(id);
    assert.ok(row, `${id} must remain in the corpus`);
    assert.equal(ledgerById.get(id)?.reviewStatus, "已人工审校", `${id} must be logged`);
    assert.equal(ledgerById.get(id)?.reviewedOn, "2026-09-26", `${id} must belong to this batch`);
    assert.equal(ledgerById.get(id)?.reviewedZh, row.zh, `${id} reviewed gloss must match the app`);
    assert.ok(row.translation.trim().length > 0, `${id} examples must have Chinese translations`);
  }
  assert.match(inventoryById.get("副词|heller").zh, /也不/u);
  assert.match(ledgerById.get("介词|iblant").reviewerNote, /副词/u);
  assert.match(inventoryById.get("名词|venninne").zh, /不默认指恋人/u);
  assert.match(inventoryById.get("形容词|kritisk").zh, /关键\/危急/u);
  assert.match(ledgerById.get("动词|pusse").reviewerNote, /宾语和小品词决定/u);
  assert.match(ledgerById.get("名词|gryterett").reviewerNote, /不一定含肉/u);
});

test("the 26 September batch reviews 25 emotion, people, and action words with context-specific glosses", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const ids = ["动词|skremme", "名词|tåre", "形容词|lykkelig", "名词|stemning", "形容词|bekymret", "形容词|ensom", "形容词|flau", "形容词|nervøs", "形容词|redd", "形容词|sint", "形容词|spent", "形容词|urolig", "名词|smil", "名词|synd", "形容词|usikker", "动词|rødme", "副词|sikkert", "名词|menneske", "形容词|berømt", "名词|dronning", "名词|folk", "动词|binde", "动词|kaste", "动词|rusle", "动词|miste"];
  const byId = new Map(inventory.map(row => [`${row.pos}|${row.lemma}`, row]));
  const ledgerById = new Map(ledger.map(row => [row.id, row]));
  for (const id of ids) {
    assert.equal(ledgerById.get(id)?.reviewStatus, "已人工审校", `${id} should be logged as reviewed`);
    assert.equal(ledgerById.get(id)?.reviewedOn, "2026-09-26", `${id} should belong to this batch`);
    assert.equal(ledgerById.get(id)?.reviewedZh, byId.get(id)?.zh, `${id} review gloss must match app gloss`);
    assert.ok(byId.get(id)?.translation.trim(), `${id} should have translated examples`);
  }
  assert.match(ledgerById.get("名词|stemning").reviewerNote, /倾向于/u, "stemning for must be explained as a tendency, not simply mood");
  assert.match(ledgerById.get("形容词|flau").reviewerNote, /味道淡/u, "flau should explain its non-emotional senses");
  assert.match(ledgerById.get("形容词|redd").reviewerNote, /redd for at/u, "redd for at should be distinguished from fear of a person");
  assert.match(byId.get("副词|sikkert").translation, /想必/u, "adverbial probability must translate naturally");
  assert.match(byId.get("名词|dronning").display, /ei\/en/u, "dronning should show both accepted genders");
  assert.match(ledgerById.get("动词|binde").reviewerNote, /binde sammen/u, "abstract connecting use should be explained");
  assert.match(ledgerById.get("动词|kaste").reviewerNote, /kaste bort tiden/u, "idiomatic particle constructions should be explained");
  assert.match(ledgerById.get("动词|miste").reviewerNote, /miste bussen/u, "miste bussen should mean missing a bus, not losing a vehicle");
  assert.doesNotMatch(byId.get("动词|rusle").translation, /很快.{0,4}好几次|好几次.{0,4}很快/u, "Chinese translations must not mechanically combine incompatible meanings");
});

test("the 26 September follow-up reviews 25 everyday nouns and verbs with sense and register cues", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const ids = ["名词|ring", "名词|ting", "名词|kaos", "名词|døgn", "名词|måned", "名词|bursdag", "名词|dunk", "名词|eske", "名词|salami", "名词|skinke", "动词|stenge", "名词|disk", "动词|trykke", "名词|pc", "名词|modell", "名词|politi", "名词|samfunn", "名词|hensyn", "动词|representere", "名词|fredspris", "动词|møtes", "名词|speilreflekskamera", "形容词|uskarp", "名词|nasjonalitet", "名词|arm"];
  const byId = new Map(inventory.map(row => [`${row.pos}|${row.lemma.toLocaleLowerCase("nb-NO")}`, row]));
  const ledgerById = new Map(ledger.map(row => [row.id, row]));
  for (const id of ids) {
    assert.ok(byId.get(id), `${id} should exist in the active inventory`);
    assert.equal(ledgerById.get(id)?.reviewStatus, "已人工审校", `${id} should be marked reviewed`);
    assert.equal(ledgerById.get(id)?.reviewedOn, "2026-09-26", `${id} should belong to this batch`);
    assert.equal(ledgerById.get(id)?.reviewedZh, byId.get(id)?.zh, `${id} reviewed gloss must match the app`);
    assert.ok(byId.get(id)?.translation.trim(), `${id} should have translated context examples`);
    assert.ok(ledgerById.get(id)?.reviewerNote.trim(), `${id} should have a specific usage note`);
  }
  assert.match(ledgerById.get("名词|dunk").reviewerNote, /en dunk.*et dunk/u, "dunk container and sound senses must not be conflated");
  assert.match(ledgerById.get("名词|ring").reviewerNote, /et ring/u, "ring jewellery and sound homonyms must be distinguished");
  assert.match(ledgerById.get("动词|møtes").reviewerNote, /河流.*汇合/u, "møtes must explain the non-human subject sense");
  assert.match(ledgerById.get("形容词|uskarp").reviewerNote, /刀刃.*不锋利/u, "uskarp must distinguish blur from bluntness");
  assert.match(ledgerById.get("名词|politi").reviewerNote, /politibetjent/u, "collective police and an individual officer must be differentiated");
  assert.match(ledgerById.get("名词|måned").reviewerNote, /måneder/u, "irregular plural should be called out");
  assert.match(ledgerById.get("名词|speilreflekskamera").reviewerNote, /不说明是胶片还是数码/u, "the compound must not imply digital by default");
});

test("the 26 September health batch reviews 25 entries with contextual Chinese and disambiguation", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const ids = ["名词|termometer", "名词|panne", "名词|bein", "名词|blodåre", "名词|finger", "名词|hud", "名词|kinn", "名词|leppe", "名词|lunge", "名词|hode", "名词|muskel", "名词|forkjølelse", "名词|hals", "名词|hevelse", "名词|influensa", "形容词|kvalm", "名词|resept", "名词|smerte", "形容词|svimmel", "形容词|syk", "名词|utslett", "名词|vondt", "名词|liv", "名词|bråk", "动词|hyle"];
  const byId = new Map(inventory.map(row => [`${row.pos}|${row.lemma.toLocaleLowerCase("nb-NO")}`, row]));
  const ledgerById = new Map(ledger.map(row => [row.id, row]));
  for (const id of ids) {
    const row = byId.get(id);
    assert.ok(row, `${id} should exist in the active inventory`);
    assert.equal(ledgerById.get(id)?.reviewStatus, "已人工审校", `${id} should be logged as reviewed`);
    assert.equal(ledgerById.get(id)?.reviewedOn, "2026-09-26", `${id} should belong to this batch`);
    assert.equal(ledgerById.get(id)?.reviewedZh, row.zh, `${id} reviewed gloss must match the inventory`);
    assert.ok(row.translation.trim(), `${id} should have translated contextual examples`);
    assert.ok(ledgerById.get(id)?.reviewerNote.trim(), `${id} needs a specific use/disambiguation note`);
  }
  assert.match(ledgerById.get("名词|panne").reviewerNote, /额头.*平底锅/u);
  assert.match(ledgerById.get("名词|blodåre").reviewedZh, /血管/u);
  assert.match(ledgerById.get("名词|hals").reviewerNote, /喉咙.*脖子/u);
  assert.match(ledgerById.get("形容词|kvalm").reviewerNote, /空气/u);
  assert.match(ledgerById.get("名词|vondt").reviewerNote, /名词.*形容词/u);
  assert.doesNotMatch(byId.get("名词|utslett").zh, /红疹/u, "utslett must not imply redness by default");
});

test("the 26 September batch 39 corrects collocation notes and natural Chinese translations", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const ids = ["名词|skive", "动词|forsyne", "名词|grøt", "名词|matrett", "动词|servere", "名词|torsk", "名词|verden", "动词|skje", "动词|passe", "名词|passord", "形容词|skadet", "名词|tomat", "限定词|flere", "形容词|ekstra", "名词|del", "名词|stykke", "名词|masse", "形容词|mye", "名词|rest", "名词|par", "副词|nok", "限定词|begge", "名词|kode", "限定词|elleve", "名词|tall"];
  const byId = new Map(inventory.map(row => [`${row.pos}|${row.lemma.toLocaleLowerCase("nb-NO")}`, row]));
  const ledgerById = new Map(ledger.map(row => [row.id, row]));
  for (const id of ids) {
    const row = byId.get(id);
    assert.ok(row, `${id} should exist in the active inventory`);
    assert.equal(ledgerById.get(id)?.reviewStatus, "已人工审校", `${id} should be logged as reviewed`);
    assert.equal(ledgerById.get(id)?.reviewedOn, "2026-09-26", `${id} should belong to batch 39`);
    assert.equal(ledgerById.get(id)?.reviewedZh, row.zh, `${id} reviewed gloss must match the active corpus`);
    assert.ok(row.translation.trim(), `${id} needs a natural Chinese example translation`);
    assert.ok(ledgerById.get(id)?.reviewerNote.trim(), `${id} needs a specific explanatory note`);
  }
  assert.match(ledgerById.get("动词|servere").reviewerNote, /不是网球等运动中.*发球/u, "servere must explicitly exclude the incorrect tennis example");
  assert.match(byId.get("动词|servere").example, /serverer indisk mat|serverte dem/u, "servere contexts should match its food/service sense");
  assert.match(ledgerById.get("限定词|flere").reviewerNote, /flere ganger.*好几次/u);
  assert.match(ledgerById.get("限定词|flere").reviewerNote, /flere ganger 是“好几次”，不是“很快”/u, "flere ganger must be explained as repeated occurrences, not speed");
  assert.match(byId.get("动词|passe").display, /^å passe$/u, "the verb card should display its infinitive marker");
  assert.match(ledgerById.get("名词|del").reviewerNote, /en del.*不少/u, "the quantifier-like en del construction must be explained");
  assert.match(ledgerById.get("名词|par").reviewerNote, /不保证精确等于两个/u);
  assert.match(ledgerById.get("副词|nok").reviewerNote, /大概|想必/u);
  assert.match(ledgerById.get("限定词|elleve").reviewerNote, /ellevte/u, "cardinal elleve must be distinguished from ordinal ellevte");
  assert.doesNotMatch(byId.get("名词|matrett").translation, /我们很快过来好几次/u, "translations should not reproduce nonsensical word-for-word Chinese");
});

test("batch 40 keeps the source sentence and translation counts aligned for sove", () => {
  const sove = csv("vocabulary-inventory.csv").find(row => row.pos === "动词" && row.lemma === "sove");
  assert.ok(sove);
  assert.equal(sove.example.split(" / ").length, sove.translation.split(" / ").length, "every sove example must have a corresponding Chinese translation");
  assert.match(sove.translation, /我睡得很好/u, "the core example Jeg sover godt must not be left untranslated");
});

test("the 26 September batch 42 re-audits common place and kitchen vocabulary with concrete semantic notes", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const ids = ["名词|kjøledisk", "名词|kirke", "名词|park", "名词|gate", "名词|gågate", "名词|katedral", "名词|katt", "名词|bytur", "名词|tur", "名词|ovn", "名词|bagett", "名词|bolle", "名词|gaffel", "名词|glass", "名词|is", "名词|kake", "名词|kjøkkenbenk", "名词|kniv", "动词|koke", "名词|komfyr", "名词|kopp", "名词|lunsj", "名词|spisebord", "名词|tallerken", "代词|en"];
  const byId = new Map(inventory.map(row => [`${row.pos}|${row.lemma.toLocaleLowerCase("nb-NO")}`, row]));
  const ledgerById = new Map(ledger.map(row => [row.id, row]));
  for (const id of ids) {
    const row = byId.get(id);
    assert.ok(row, `${id} must exist in the active inventory`);
    assert.equal(ledgerById.get(id)?.reviewStatus, "已人工审校", `${id} must remain logged as reviewed`);
    assert.equal(ledgerById.get(id)?.reviewedOn, "2026-09-26", `${id} must record this semantic correction pass`);
    assert.equal(ledgerById.get(id)?.reviewedZh, row.zh, `${id} ledger meaning must match the active inventory`);
    assert.ok(ledgerById.get(id)?.reviewerNote.trim(), `${id} needs a word-specific usage note`);
  }
  assert.match(ledgerById.get("名词|bolle").reviewerNote, /阳性.*en bolle.*不应标 ei bolle/u, "bolle gender must be internally consistent");
  assert.match(ledgerById.get("名词|bytur").reviewerNote, /不必然是购物/u, "bytur must not imply shopping without context");
  assert.match(ledgerById.get("名词|lunsj").reviewedZh, /不要求严格在正午|早餐与晚餐之间/u, "lunsj should be explained as a meal, not a precise clock time");
  assert.match(ledgerById.get("代词|en").reviewerNote, /不是男性代词.*不是名词前的冠词/u, "impersonal pronoun en must be distinguished from the article");
});

test("the 26 September batch 43 reviews 25 pending A2 items with word-specific translations and sense cues", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const ids = ["从属连词|hvis", "形容词|selvfølgelig", "名词|gruppe", "形容词|pen", "形容词|høy", "名词|byggesett", "名词|internettilgang", "名词|nett", "名词|ende", "名词|side", "介词|innom", "介词|inni", "介词|innover", "副词|nede", "形容词|nærmere", "介词|oppå", "副词|oppe", "形容词|søt", "名词|minusgrad", "名词|galleri", "名词|nasjonalgalleri", "名词|dokketeater", "名词|festival", "名词|kultur", "名词|kunst"];
  const byId = new Map(inventory.map(row => [`${row.pos}|${row.lemma.toLocaleLowerCase("nb-NO")}`, row]));
  const ledgerById = new Map(ledger.map(row => [row.id, row]));
  for (const id of ids) {
    const row = byId.get(id);
    assert.ok(row, `${id} must exist in the current vocabulary inventory`);
    assert.equal(ledgerById.get(id)?.reviewStatus, "已人工审校", `${id} must be recorded as reviewed`);
    assert.equal(ledgerById.get(id)?.reviewedOn, "2026-09-26", `${id} must belong to batch 43`);
    assert.equal(ledgerById.get(id)?.reviewedZh, row.zh, `${id} reviewed meaning must match the active entry`);
    assert.ok(ledgerById.get(id)?.reviewerNote.trim(), `${id} needs an explanatory note`);
  }
  assert.match(ledgerById.get("名词|minusgrad").reviewedZh, /数值随数量词/u, "minusgrad must not be permanently glossed as only one degree below zero");
  assert.match(ledgerById.get("名词|galleri").reviewerNote, /中性名词.*楼座/u, "galleri gender and non-art-gallery meanings must be clear");
  assert.match(ledgerById.get("形容词|pen").reviewerNote, /pent vær.*手写|pen håndskrift/u, "pen must include its weather or handwriting usage");
  assert.match(ledgerById.get("形容词|høy").reviewerNote, /声音/u, "høy must distinguish height, values, and sound");
  assert.match(ledgerById.get("介词|innover").reviewerNote, /不是静态/u, "innover must be distinguished from a static inside location");
  assert.match(ledgerById.get("名词|kunst").reviewerNote, /ingen kunst.*不难/u, "the fixed expression det er ingen kunst must not be translated literally");
});

test("the 26 September batch 44 gives arts and everyday vocabulary distinct contextual glosses", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const ids = ["名词|ballett", "名词|forestilling", "名词|kino", "名词|konsert", "名词|kor", "名词|opera", "名词|sang", "名词|show", "名词|teater", "名词|teaterforestilling", "名词|dikt", "名词|maleri", "名词|scene", "名词|dokument", "名词|papir", "名词|utfordring", "动词|fikse", "动词|løse", "名词|problem", "名词|salsakurs", "名词|femhundrelapp", "名词|minibank", "名词|idé", "动词|tro", "名词|melding"];
  const byId = new Map(inventory.map(row => [`${row.pos}|${row.lemma.toLocaleLowerCase("nb-NO")}`, row]));
  const ledgerById = new Map(ledger.map(row => [row.id, row]));
  for (const id of ids) {
    const row = byId.get(id);
    assert.ok(row, `${id} must exist in inventory`);
    assert.equal(ledgerById.get(id)?.reviewStatus, "已人工审校", `${id} must be marked reviewed`);
    assert.equal(ledgerById.get(id)?.reviewedZh, row.zh, `${id} review must match the shipped app gloss`);
    assert.ok(ledgerById.get(id)?.reviewerNote.trim(), `${id} needs a word-specific note`);
  }
  assert.match(ledgerById.get("名词|maleri").reviewedZh, /^绘画作品/u, "maleri must not imply oil paint by default");
  assert.match(ledgerById.get("名词|forestilling").reviewerNote, /ha en forestilling om/u, "forestilling senses must follow collocation");
  assert.match(ledgerById.get("动词|tro").reviewerNote, /Jeg tror at.*tro på seg selv/u, "tro meanings must explain sentence structure");
  assert.match(ledgerById.get("动词|fikse").reviewerNote, /不能不看宾语/u, "fikse must be translated from its object and context");
});

test("the 26 September batch 45 distinguishes easily confused A2 meanings and common constructions", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const ids = ["名词|nyhet", "名词|beskjed", "名词|informasjon", "名词|fredag", "名词|lørdag", "名词|søndag", "名词|torsdag", "动词|følge", "名词|form", "形容词|engasjert", "形容词|interessert", "名词|klatregruppe", "名词|romantiker", "名词|hobby", "名词|fan", "形容词|sjenert", "形容词|hjelpsom", "形容词|stille", "形容词|dum", "形容词|kjekk", "形容词|rar", "形容词|snill", "名词|sykkeltur", "动词|danse", "动词|fotografere"];
  const byId = new Map(inventory.map(row => [`${row.pos}|${row.lemma.toLocaleLowerCase("nb-NO")}`, row]));
  const ledgerById = new Map(ledger.map(row => [row.id, row]));
  for (const id of ids) {
    const row = byId.get(id);
    assert.ok(row, `${id} must exist in inventory`);
    assert.equal(ledgerById.get(id)?.reviewStatus, "已人工审校", `${id} must be marked reviewed`);
    assert.equal(ledgerById.get(id)?.reviewedZh, row.zh, `${id} review must match the shipped app gloss`);
    assert.ok(ledgerById.get(id)?.reviewerNote.trim(), `${id} needs a word-specific note`);
  }
  assert.match(ledgerById.get("名词|informasjon").reviewerNote, /beskjed/u, "informasjon must be distinguished from a message or notice");
  assert.match(ledgerById.get("动词|følge").reviewerNote, /instruksjonene/u, "følge must explain the obey/follow construction");
  assert.match(ledgerById.get("形容词|snill").reviewerNote, /Vær så snill/u, "snill must explain its polite-request idiom");
  assert.match(ledgerById.get("形容词|rar").reviewerNote, /rare/u, "rar must not be translated as the English false friend by default");
});

test("the 26 September batch 46 clarifies academic and school vocabulary in context", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const ids = ["名词|fritid", "名词|fritidsaktivitet", "动词|trenge", "动词|velge", "名词|psykologi", "名词|kompendium", "名词|blyant", "名词|viskelær", "名词|perm", "名词|analyse", "名词|lærer", "名词|masterstudent", "形容词|avansert", "名词|kurs", "名词|disiplin", "名词|hovedpunkt", "名词|kunnskap", "名词|veileder", "名词|matematikk", "名词|naturfag", "名词|samfunnsfag", "名词|skrivebok", "名词|klasseliste", "动词|skulke", "名词|foreleser"];
  const byId = new Map(inventory.map(row => [`${row.pos}|${row.lemma.toLocaleLowerCase("nb-NO")}`, row]));
  const ledgerById = new Map(ledger.map(row => [row.id, row]));
  for (const id of ids) {
    const row = byId.get(id);
    assert.ok(row, `${id} must exist in inventory`);
    assert.equal(ledgerById.get(id)?.reviewStatus, "已人工审校", `${id} must be marked reviewed`);
    assert.equal(ledgerById.get(id)?.reviewedZh, row.zh, `${id} review must match the shipped app gloss`);
    assert.ok(ledgerById.get(id)?.reviewerNote.trim(), `${id} needs a word-specific note`);
  }
  assert.match(ledgerById.get("动词|trenge").reviewerNote, /trenge seg inn/u, "trenge must distinguish its movement construction from need");
  assert.match(ledgerById.get("名词|perm").reviewerNote, /fra perm til perm/u, "perm should retain book-cover and binder senses");
  assert.match(ledgerById.get("名词|naturfag").reviewerNote, /课程名/u, "naturfag must be contextualized as a school subject");
  assert.match(ledgerById.get("名词|samfunnsfag").reviewerNote, /不能简单等同大学/u, "samfunnsfag must not be confused with a university discipline");
  assert.match(ledgerById.get("名词|veileder").reviewerNote, /书面材料/u, "veileder should distinguish human mentors from manuals");
});

test("the 26 September batch 47 separates classroom meanings, grades, roles, and colors", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const ids = ["名词|forelesning", "名词|prosjekt", "名词|rapport", "名词|bibliotek", "名词|klasserom", "名词|trinn", "名词|engelskprøve", "名词|fag", "名词|favorittfag", "名词|klasseavis", "名词|karakter", "名词|friminutt", "名词|auditorium", "名词|campus", "名词|institutt", "名词|elev", "名词|lekse", "动词|studere", "名词|essay", "名词|stress", "形容词|rød", "形容词|svart", "形容词|hvit", "形容词|lysebrun", "名词|invitasjon"];
  const byId = new Map(inventory.map(row => [`${row.pos}|${row.lemma.toLocaleLowerCase("nb-NO")}`, row]));
  const ledgerById = new Map(ledger.map(row => [row.id, row]));
  for (const id of ids) {
    const row = byId.get(id);
    assert.ok(row, `${id} must exist in inventory`);
    assert.equal(ledgerById.get(id)?.reviewStatus, "已人工审校", `${id} must be marked reviewed`);
    assert.equal(ledgerById.get(id)?.reviewedZh, row.zh, `${id} review must match the shipped app gloss`);
    assert.ok(ledgerById.get(id)?.reviewerNote.trim(), `${id} needs a word-specific note`);
  }
  assert.match(ledgerById.get("名词|karakter").reviewerNote, /få gode karakterer/u, "karakter should separate school grades from roles");
  assert.match(ledgerById.get("名词|trinn").reviewerNote, /脚步声/u, "trinn must explain the footstep sense, not only school grade");
  assert.match(ledgerById.get("名词|rapport").reviewerNote, /重复图案/u, "rapport should flag its specialist pattern sense");
  assert.match(ledgerById.get("动词|studere").reviewerNote, /仔细观察/u, "studere meaning depends on its object");
});

test("the 26 September batch 49 separates homographs and clarifies contextual meanings", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const ids = ["名词|t-skjorte", "名词|hit", "名词|popstjerne", "名词|colaboks", "名词|cola", "名词|te", "名词|kakao", "名词|øl", "名词|flaske", "动词|smake", "名词|tran", "名词|dessert", "名词|rett", "名词|trankapsel", "名词|vedlegg", "动词|gjette", "名词|ørret", "名词|språk", "形容词|spansk", "形容词|svensk", "名词|ord", "名词|grammatikk", "名词|reisebekreftelse", "名词|tannlegetime", "动词|håpe"];
  const byId = new Map(inventory.map(row => [`${row.pos}|${row.lemma.toLocaleLowerCase("nb-NO")}`, row]));
  const ledgerById = new Map(ledger.map(row => [row.id, row]));
  for (const id of ids) {
    const row = byId.get(id);
    assert.ok(row, `${id} must exist in inventory`);
    assert.equal(ledgerById.get(id)?.reviewStatus, "已人工审校", `${id} must be marked reviewed`);
    assert.equal(ledgerById.get(id)?.reviewedZh, row.zh, `${id} review must match the shipped app gloss`);
    assert.ok(ledgerById.get(id)?.reviewerNote.trim(), `${id} needs a word-specific note`);
  }
  assert.match(ledgerById.get("名词|hit").reviewerNote, /同形副词 hit.*到这里/u);
  assert.match(ledgerById.get("名词|rett").reviewerNote, /“直的、正确的、合适的”属于形容词/u);
  assert.doesNotMatch(ledgerById.get("形容词|spansk").reviewedZh, /西班牙人/u);
  assert.match(ledgerById.get("名词|øl").reviewerNote, /一杯/u);
});

test("the 26 September batch 50 gives wishes, reading, and sports words distinct natural meanings", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const ids = ["动词|ønske", "名词|drøm", "动词|drømme", "名词|avtale", "名词|oktober", "名词|desember", "动词|bla", "名词|eventyr", "名词|artikkel", "名词|korrektur", "名词|tekst", "名词|håndballspiller", "名词|jentelag", "名词|kamp", "名词|trener", "名词|idrettssenter", "名词|trening", "名词|ball", "名词|keeper", "名词|landslag", "名词|ballspill", "名词|bordtennis", "名词|cricket", "名词|håndball", "名词|idrett"];
  const byId = new Map(inventory.map(row => [`${row.pos}|${row.lemma.toLocaleLowerCase("nb-NO")}`, row]));
  const ledgerById = new Map(ledger.map(row => [row.id, row]));
  for (const id of ids) {
    const row = byId.get(id);
    assert.ok(row, `${id} must exist in inventory`);
    assert.equal(ledgerById.get(id)?.reviewStatus, "已人工审校", `${id} must be marked reviewed`);
    assert.equal(ledgerById.get(id)?.reviewedZh, row.zh, `${id} review must match the shipped app gloss`);
    assert.ok(ledgerById.get(id)?.reviewerNote.trim(), `${id} needs a word-specific note`);
  }
  assert.match(ledgerById.get("名词|trener").reviewerNote, /Hun trener（她在训练）是动词/u, "trener noun must not confuse it with the homographic verb form");
  assert.match(ledgerById.get("名词|ball").reviewerNote, /et ball.*ballet/u, "ball must distinguish the masculine ball from the neuter formal dance");
  assert.match(ledgerById.get("名词|avtale").reviewerNote, /看医生的预约/u, "avtale must distinguish a medical appointment from an agreement");
  assert.match(ledgerById.get("动词|bla").reviewerNote, /不是泛指在屏幕上滚动/u, "bla should distinguish page turning from screen scrolling");
});

test("the 26 September batch 51 disambiguates everyday polysemy, occupations, and contextual translations", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const ids = ["名词|sport", "名词|volleyball", "名词|spiller", "动词|klatre", "名词|pannekake", "名词|syltetøy", "名词|ansvar", "形容词|kort", "动词|pleie", "形容词|egentlig", "形容词|samlet", "名词|id-kort", "形容词|alvorlig", "动词|vite", "名词|mester", "名词|baker", "名词|skomaker", "名词|ingeniør", "名词|konsulent", "名词|maler", "名词|selger", "名词|pilot", "名词|journalist", "名词|prest", "名词|bonde", "名词|fisker", "名词|tre", "名词|ordning", "形容词|tung", "名词|tema"];
  const byId = new Map(inventory.map(row => [`${row.pos}|${row.lemma.toLocaleLowerCase("nb-NO")}`, row]));
  const ledgerById = new Map(ledger.map(row => [row.id, row]));
  for (const id of ids) {
    const row = byId.get(id);
    assert.ok(row, `${id} must exist in inventory`);
    assert.equal(ledgerById.get(id)?.reviewStatus, "已人工审校", `${id} must be marked reviewed`);
    assert.equal(ledgerById.get(id)?.reviewedZh, row.zh, `${id} review must match the shipped app gloss`);
    assert.ok(ledgerById.get(id)?.reviewerNote.trim(), `${id} needs a word-specific note`);
  }
  assert.match(ledgerById.get("动词|pleie").reviewerNote, /pleie å \+ 动词/u, "pleie must distinguish care from habitual action");
  assert.match(ledgerById.get("形容词|egentlig").reviewerNote, /作副词/u, "egentlig must flag its common adverbial use");
  assert.match(ledgerById.get("名词|tre").reviewerNote, /数词 tre（三）/u, "tre noun must be distinguished from the numeral");
  assert.match(ledgerById.get("名词|fisker").reviewerNote, /动词 fiske/u, "fisker noun must be distinguished from the homographic verb");
  assert.match(ledgerById.get("名词|id-kort").reviewedZh, /不限定为国家身份证/u);
});

test("the 26 September batch 40 distinguishes sleep, possession, weather, and food contexts", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const ledger = csv("chinese-gloss-review.csv");
  const ids = ["动词|sovne", "动词|sove", "名词|pyjamasjakke", "副词|sakte", "副词|fort", "限定词|deres", "限定词|hennes", "限定词|sin", "限定词|egen", "形容词|spesiell", "副词|hvorfor", "名词|spørsmål", "形容词|olympisk", "形容词|kjølig", "动词|skinne", "动词|regne", "动词|blåse", "动词|fryse", "形容词|våt", "名词|karamellpudding", "名词|eplekake", "名词|sjokoladekake", "名词|bløtkake", "名词|pudding", "名词|sjokolade"];
  const byId = new Map(inventory.map(row => [`${row.pos}|${row.lemma.toLocaleLowerCase("nb-NO")}`, row]));
  const ledgerById = new Map(ledger.map(row => [row.id, row]));
  for (const id of ids) {
    const row = byId.get(id);
    assert.ok(row, `${id} should exist in the active inventory`);
    assert.equal(ledgerById.get(id)?.reviewStatus, "已人工审校", `${id} must be recorded as reviewed`);
    assert.equal(ledgerById.get(id)?.reviewedOn, "2026-09-26", `${id} should belong to batch 40`);
    assert.equal(ledgerById.get(id)?.reviewedZh, row.zh, `${id} ledger gloss must match the app inventory`);
    assert.ok(ledgerById.get(id)?.reviewerNote.trim(), `${id} needs an explanatory note`);
  }
  assert.match(ledgerById.get("动词|sovne").reviewerNote, /sove.*睡眠状态/u);
  assert.match(ledgerById.get("限定词|deres").reviewerNote, /你们.*他们/u);
  assert.match(ledgerById.get("限定词|sin").reviewerNote, /回指.*主语/u);
  assert.match(ledgerById.get("形容词|våt").reviewerNote, /不是词义本身/u);
  assert.match(ledgerById.get("名词|eplekake").reviewerNote, /苹果派/u);
  assert.match(ledgerById.get("名词|pudding").reviewerNote, /累瘫/u);
});
