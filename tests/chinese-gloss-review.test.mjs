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

  const reviewed = ledger.filter(row => row.reviewStatus === "已人工审校");
  assert.ok(reviewed.length > 0, "review progress must be visible");
  for (const row of reviewed) {
    assert.ok(row.reviewedZh.trim(), `${row.id} needs a reviewed Chinese gloss`);
    assert.ok(row.reviewerNote.trim(), `${row.id} needs an audit rationale/source note`);
    assert.ok(row.reviewedOn.trim(), `${row.id} needs a review date`);
    assert.equal(row.reviewedZh, inventoryByKey.get(row.id).zh, `${row.id} reviewed gloss must match the shipped app gloss`);
  }
});

test("online-curated vocabulary examples retain translations and verifiable source links", () => {
  const inventory = csv("vocabulary-inventory.csv");
  const sourced = inventory.filter(row => row.exampleSources.trim());
  assert.ok(sourced.length >= 8, "curated online examples should be discoverable in the generated corpus inventory");
  for (const row of sourced) {
    assert.ok(row.example.trim(), `${row.lemma} sourced examples need sentence text`);
    assert.ok(row.translation.trim(), `${row.lemma} sourced examples need Chinese translations`);
    for (const url of row.exampleSources.split(" / ")) assert.match(url, /^https:\/\/(?:www\.)?(?:ordbokene\.no|hf\.ntnu\.no|norwegianclass101\.com|preply\.com)\//u, `${row.lemma} source should be a verified dictionary, university, or language-learning source`);
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
  ]) {
    const row = curated.get(`${pos}|${lemma}`);
    assert.ok(row, `${lemma} should be in the compiled vocabulary corpus`);
    assert.ok(row.example.includes(norwegian), `${lemma} sourced Norwegian example should be retained`);
    assert.ok(row.translation.includes(chinese), `${lemma} example translation should be retained`);
    assert.ok(row.exampleSources.split(" / ").some(url => /^https:\/\/(?:www\.)?(?:ordbokene\.no|hf\.ntnu\.no|norwegianclass101\.com|preply\.com)\//u.test(url)), `${lemma} should retain a verifiable dictionary, university, or language-learning source`);
  }
});
