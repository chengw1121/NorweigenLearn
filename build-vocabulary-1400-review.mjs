import fs from "node:fs";

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
  return rows;
}

const csvCell = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
const normalize = value => String(value || "").trim().toLocaleLowerCase("nb-NO").replace(/^(en|ei\/en|ei|et|å)\s+/u, "").replace(/\s+/gu, " ");
const readCsv = name => {
  const rows = parseCsv(fs.readFileSync(new URL(`./${name}`, import.meta.url), "utf8"));
  const headers = rows.shift();
  return rows.filter(row => row.length >= headers.length).map(row => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])));
};
const candidates = readCsv("vocabulary-candidates-1400.csv");
const inventory = readCsv("vocabulary-inventory.csv");
const inflectionAudit = readCsv("vocabulary-inflection-audit.csv");
const key = (lemma, pos) => `${normalize(lemma)}|${pos}`;
const inventoryByKey = new Map(inventory.map(row => [key(row.lemma, row.pos), row]));
const reviewedInventoryByLemma = new Map(inventory.filter(row => row.reviewedOn).map(row => [normalize(row.lemma), row]));
const formsByKey = new Map(inflectionAudit.map(row => [key(row.lemma, row.pos), row]));
// This explicit list is a human read-through of every Norwegian sentence and
// its Chinese translation for these listed high-frequency entries. It does not
// certify pronunciation, CEFR level, or forms beyond the separate form audit.
const exampleTranslationReviewed = new Set([
  "avis", "bensinstasjon", "bil", "bli", "bo", "brus", "by", "dag", "dame", "ekspeditør",
  "familie", "fly", "gjøre", "ha", "hete", "hilse", "jente", "jobbe", "kart", "kilometer",
  "komme", "koste", "krone", "antropologi", "arkitektur", "båt", "fra", "god", "hyggelig", "norsk",
  "på", "være", "adresse", "betale", "billett", "bruke", "buss", "bussjåfør", "bytte", "dra", "vondt", "penge", "all", "tohundrelapp",
  "du", "han", "hun", "denne", "bra", "bedre", "bestemor", "mobilnummer", "veldig", "plaster",
  "ikke", "med", "de", "dere", "hva", "hvor", "jeg", "men", "og", "fordi", "når",
  "få", "gå", "kunne", "se", "ta", "måtte", "skulle", "ville", "lærer",
  // A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "drikke", "ettermiddag", "finne", "flytte", "gutt", "hjelp", "hjelpe", "hjem",
  "kafé", "kaffe", "kjøpe", "kjøpesenter", "kjøre", "kopp", "kort", "år",
  // Second A1 batch reviewed for sentence naturalness and Chinese translation.
  "bagasje", "bare", "bety", "bussrute", "busstur", "flybuss", "fransk", "gammel",
  "gift", "her", "i", "igjen", "klokke", "koffert", "kontrollere", "lang",
  "ledig", "lufthavn", "mamma", "mann", "måte", "nå",
  // Third A1 batch reviewed for sentence naturalness and Chinese translation.
  "også", "orden", "pappa", "pass", "passkontroll", "reise", "rope", "så",
  "sammen", "sitte", "snakke", "stå", "takk", "til", "time", "trøtt",
  "vente", "bad", "bære", "barnehage", "besøk", "besøke", "bilde", "bord",
  // Fourth A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "brød", "brødskive", "bror", "bygning", "dør", "dusj", "etasje", "far",
  "forstå", "frokost", "gang", "gitar", "gjest", "hente", "høre", "hus",
  "jakke", "kjenne", "kjøkken", "kjøleskap", "koke", "kone", "kontrakt", "alene",
  // Fifth A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "av", "balkong", "benk", "bluse", "bokhylle", "borte", "bukse", "dele",
  "der", "etter", "etternavn", "flyttebil", "flyttebyrå", "fødselsdato", "for", "foran",
  "formiddag", "garasje", "gardin", "grei", "hår", "hjemme", "hjørne", "hoppe",
  // Sixth A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "hybel", "hylle", "inn", "instrument", "inventarliste", "italiener", "jus", "kalle",
  "kamera", "kjøkkenbenk", "klesskap", "komfyr", "kommode", "kvarter", "kveld", "lastebil",
  "le", "leilighet", "lenestol", "ligge", "like", "løpe", "madrass", "mandag",
  // Seventh A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "mellom", "møbel", "morfar", "morgen", "mormor", "morsom", "møte", "musikk",
  "nabo", "nabohus", "oppvaskmaskin", "ordne", "plass", "riktig", "ringe", "rom",
  "rundt", "salongbord", "seng", "si", "sjåfør", "skap", "skjørt", "sko",
  // Eighth A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "skole", "skrivebord", "smile", "sminke", "snart", "sofa", "soverom", "speil",
  "spise", "spisebord", "spørre", "stol", "stoppe", "stor", "stue", "synge",
  "telefon", "tenke", "tirsdag", "trapp", "undertøy", "ut", "utenfor", "våken",
  // Ninth A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "våkne", "vaske", "vaskemaskin", "ved", "vegg", "venn", "vindu", "banan",
  "barn", "begynne", "bestemme", "bok", "butikk", "dusje", "eple", "forelder",
  "fortelle", "fotball", "gave", "genser", "gi", "handle", "invitere", "kake",
  // Eleventh A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "fram", "frimerke", "fruktdisk", "gebyr", "gjerne", "gøy", "halv", "handlekurv",
  "handlevogn", "helseforsikring", "hos", "høyre", "humør", "interiørbutikk", "is", "jernbanestasjon",
  "jobb", "kjær", "kjøledisk", "koselig", "kryss", "lære", "lage", "legge",
  // Twelfth A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "lese", "løfte", "lomme", "lyskryss", "matbu", "mene", "meter", "minutt",
  "mor", "nabolag", "nær", "nærhet", "onsdag", "opp", "over", "pakke",
  "postkontor", "retning", "rett", "sann", "sein", "sende", "siden", "sist",
  // Thirteenth A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "spille", "straks", "sykehus", "takke", "tegne", "treffe", "tur", "ungdomsskole",
  "vei", "veikryss", "vekke", "vel", "vise", "appelsin", "bestille", "bygge",
  "diskutere", "gågate", "gate", "glemme", "greie", "historie", "holde", "kantine",
  // Fourteenth A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "kirke", "kollega", "konge", "administrasjon", "alltid", "ansikt", "arbeide", "bestefar",
  "blå", "brenne", "brosjyre", "bytur", "dessverre", "dø", "dyr", "elske",
  "farge", "ferdig", "fersk", "fisk", "fiskemarked", "flink", "fortsette", "fotballspiller",
  // Fifteenth A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "frukt", "gjennom", "glass", "grav", "grønnsak", "grov", "guide", "gul",
  "gulrot", "himmel", "kanskje", "katedral", "katt", "kilo", "kjøtt", "klappe",
  "klar", "kylling", "lag", "laks", "liter", "loff", "lunsj", "lyst",
  // Sixteenth A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "mål", "mat", "melk", "mett", "middag", "mot", "nummer", "ny",
  "nysgjerrig", "ost", "pålegg", "paprika", "pose", "potet", "prøve", "sette",
  "sol", "ute", "vær", "huske", "billig", "brun", "dit", "etterpå",
  // Seventeenth A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "forskjellig", "glad", "grønn", "inne", "interessant", "kjempegod", "kniv", "liten",
  "pris", "sentrum", "sulten", "tallerken", "tørst", "vann", "datter", "dessuten",
  "flott", "fornøyd", "ganske", "heldigvis", "uke", "feber", "helg", "høst",
  // Eighteenth A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "derfor", "hånd", "oppgave", "pause", "regn", "skog", "vind", "ennå",
  "hel", "navn", "ofte", "tid", "vanligvis", "aldri", "forresten", "hjerte",
  "kald", "kjempeflink", "kropp", "natt", "varm", "vinter", "kjempebra", "nese",
  // Nineteenth A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "annen", "at", "åtte", "atten", "blod", "blomst", "ca.", "den",
  "det", "dette", "din", "disse", "dytte", "egg", "ei", "eller",
  "elv", "en", "én", "endelig", "engelsk", "fæl", "faktisk", "falle",
  // Twentieth A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "fattig", "fem", "fire", "fjorten", "forbi", "forrige", "første", "førti",
  "fugl", "gaffel", "grå", "gress", "hallo", "handleliste", "hans", "hav",
  "hei", "hemmelig", "hm", "holdeplass", "høy", "hundre", "hver", "hverandre",
  // Twenty-first A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "hvilken", "hvordan", "ingen", "ingenting", "innsjø", "italiensk", "ja", "kjempefin",
  "kjempesulten", "klær", "kne", "kø", "kvart", "kvinne", "lår", "lås",
  "låse", "leve", "litt", "lommebok", "lukke", "måne", "mange", "mens",
  // Twenty-second A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "mer", "min", "museum", "nakke", "nei", "ni", "niende", "noen",
  "nøkkel", "notatbok", "oi", "om", "oppskrift", "ordbok", "øre", "ovn",
  "øye", "pære", "park", "penn", "pølse", "postkort", "pute", "samme",
  // Twenty-third A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "saus", "seks", "selge", "sju", "sky", "slå", "slutte", "småkake",
  "snø", "sommer", "sønn", "stasjon", "stein", "stjerne", "telle", "ti",
  // Twenty-fourth A2 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "t-skjorte", "prate", "rød", "rundstykke", "sakte", "salami", "selvfølgelig", "skinke",
  "skinne", "skive", "søt", "spansk", "spesiell", "spiller", "svensk", "sykepleier",
  // Twenty-fifth A2 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "syltetøy", "te", "terrasse", "trenge", "venninne", "verden", "vinne", "anbefale",
  "bibliotek", "bygg", "e-post", "håpe", "kino", "konsert", "kurs", "akkurat",
  // Twenty-sixth A2 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "apotek", "arkitektstudent", "arrangement", "arrangere", "auditorium", "avgift", "bank", "barne-tv",
  "bokstav", "campus", "cola", "dagsbillett", "danse", "dekke", "disk", "eksempel",
  "elegant", "eplekake", "femhundrelapp", "festival", "flaske", "foreleser", "forelesning", "gjette",
  // Tenth A1 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "kakestykke", "kasse", "klasse", "klem", "klesbutikk", "kontor", "allerede", "åpne",
  "august", "bagett", "bakeri", "banke", "bekreftelse", "bokhandel", "bolle", "brev",
  "brødhylle", "da", "dyne", "fin", "fødselsdag", "forklare", "først", "fotoautomat",
  // A2 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "grovbrød", "helårskort", "helt", "hud", "hvit", "id-kort", "idé", "idrettssenter",
  "inngang", "institutt", "kåpe", "kjole", "kode", "kompendium", "konsulent", "kvittering",
  "lav", "lekebutikk", "lenge", "lenger", "lørdag", "lue", "lys", "lysebrun",
  // Next A2 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "moderne", "møtes", "naturligvis", "ned", "nok", "nydelig", "øyeblikk", "par",
  "parkere", "parkeringsplass", "passe", "plutselig", "pusse", "rabatt", "salg", "sjiraff",
  "sjokoladekake", "skjære", "skobutikk", "smil", "smør", "snill", "sove", "sted",
  // Following A2 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "stykke", "svart", "synes", "tast", "tilbake", "tilbud", "tomat", "torg",
  "tørke", "vanlig", "vinterjakke", "vite", "ingeniør", "kontakt", "album", "alvorlig",
  "arbeidsdag", "bak", "ballett", "ballspill", "begynnelse", "begynnerkurs", "bestevenn", "bort",
  // Following A2 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "bråk", "byggfirma", "dårlig", "deretter", "dimensjon", "dum", "elev", "enebarn",
  "essay", "farfar", "farmor", "firma", "fjernkontroll", "fornavn", "fort", "fritidsaktivitet",
  "grammatikk", "gruppe", "hjemland", "hobby", "informasjon", "kamerat", "kjekk", "klatre",
  // Following A2 batch reviewed for sentence naturalness and Chinese translation on 2026-09-24.
  "klatregruppe", "knapp", "leke", "lekse", "løse", "lykkelig", "modell", "nervøs",
  "nesten", "nokså", "nyhet", "oppe", "perm", "personale", "problem", "prosjekt",
  "rapport", "rar", "sint", "sjef", "sjenert", "skremme", "skrive", "søndag",
  // Next A2 batch: manually read Norwegian examples and Chinese translations on 2026-09-24.
  "it-firma", "mye", "spennende", "stille", "sur", "ting", "trykke", "under",
  "viktig", "virke", "bedring", "beskjed", "fest", "føle", "fryse", "gulv",
  "hals", "hytte", "hyttetur", "influensa", "arm", "bål", "bestemt", "bla",
  // Next A2 batch: manually read Norwegian examples and Chinese translations on 2026-09-24.
  "blåse", "blyant", "deltaker", "disiplin", "ekstra", "enda", "engelskprøve", "fag",
  "fastlege", "favorittfag", "flau", "følge", "før", "fri", "friminutt", "fyre",
  "grille", "gryterett", "gubbe", "halstablett", "halvtime", "heldig", "hit", "høres",
  // Next A2 batch: manually read Norwegian examples and Chinese translations on 2026-09-24.
  "høstdag", "høstsalg", "hotell", "karakter", "kaste", "keeper", "kikke", "kjedelig",
  "kjeks", "klasseliste", "klasserom", "kunstutstilling", "land", "låne", "lillebror", "male",
  "måned", "matematikk", "menneske", "naturfag", "neste", "nettopp", "norskkurs", "opptatt",
  // Next A2 batch: manually read Norwegian examples and Chinese translations on 2026-09-24.
  "øve", "overskyet", "pannekake", "pen", "perfekt", "rødme", "rute", "samfunnsfag",
  "ses", "sjokolade", "skogsvei", "skrivebok", "søster", "språk", "stenge", "storesøster",
  "studere", "supermarked", "sykkel", "sykkeltur", "sykle", "sykling", "tavle", "tekst",
]);
const records = candidates.map(candidate => {
  const app = inventoryByKey.get(key(candidate.lemma, candidate.pos));
  const reviewedApp = reviewedInventoryByLemma.get(normalize(candidate.lemma));
  const forms = formsByKey.get(key(candidate.lemma, candidate.pos));
  const complete = Boolean(candidate.zh && candidate.sourceInflections && candidate.exampleNb && candidate.exampleZh);
  const exampleCount = candidate.exampleNb.split(/\s*\/\s*/u).filter(Boolean).length;
  return {
    candidateLevel: candidate.candidateLevel,
    lemma: candidate.lemma,
    pos: candidate.pos,
    topic: app?.topic || "",
    sourceCourses: candidate.sourceCourses,
    chineseMeaning: candidate.zh,
    listedForms: candidate.sourceInflections,
    exampleNb: candidate.exampleNb,
    exampleZh: candidate.exampleZh,
    exampleCount,
    appLevel: app?.level || "",
    appIntegrated: Boolean(app),
    fieldsPresent: complete,
    manualReviewStatus: reviewedApp?.reviewedOn ? `词典核验：${reviewedApp.reviewFields}` : "尚未人工逐词核验",
    dictionarySource: reviewedApp?.reviewSource || "",
    dictionarySourceUrl: reviewedApp?.reviewSourceUrl || "",
    manuallyCheckedOn: reviewedApp?.reviewedOn || "",
    examplesManuallyCheckedOn: exampleTranslationReviewed.has(normalize(candidate.lemma)) ? "2026-09-24" : "",
    officialLemmaFound: forms?.officialLemmaFound || "未核",
    formAuditStatus: forms?.auditStatus || "无对应词形审计行",
    cefrReview: "课程候选等级；尚未逐词人工确认",
    meaningAndExampleReview: exampleTranslationReviewed.has(normalize(candidate.lemma)) || (reviewedApp?.reviewedOn && reviewedApp.reviewFields.includes("例句")) ? "例句/译文已人工审校" : "例句/译文尚未人工逐词审校",
  };
});
const columns = Object.keys(records[0]);
fs.writeFileSync(new URL("./vocabulary-1400-review.csv", import.meta.url), [columns.join(","), ...records.map(row => columns.map(column => csvCell(row[column])).join(","))].join("\n") + "\n", "utf8");

const counts = (field, predicate = () => true) => records.filter(predicate).reduce((map, row) => map.set(row[field], (map.get(row[field]) || 0) + 1), new Map());
const levels = [...counts("candidateLevel")].map(([name, count]) => `${name}: ${count}`).join("；");
const appMatches = records.filter(row => row.appIntegrated && row.appLevel === row.candidateLevel).length;
const fullFields = records.filter(row => row.fieldsPresent).length;
const manuallyReviewed = records.filter(row => row.manuallyCheckedOn).length;
const examplesReviewed = records.filter(row => row.meaningAndExampleReview === "例句/译文已人工审校").length;
const dictionary = counts("officialLemmaFound");
const forms = counts("formAuditStatus");
const report = [
  "# A1/A2 1,400 词逐词审核进度",
  "",
  `- 候选清单：${records.length} 个唯一词头（${levels}）。`,
  `- 与应用词头、词性和暂定等级匹配：${appMatches}/${records.length}。`,
  `- 中文义项、词形、至少一条挪威语例句及译文均有填写：${fullFields}/${records.length}；字段齐全不等同于人工校对通过。`,
  `- 已逐词登记并核验词典或课程词表所支持的词头、词性、核心义项/课程信息：${manuallyReviewed}/${records.length}；逐条范围与来源见 CSV。`,
  `- 例句及中文译文已人工逐条审校：${examplesReviewed}/${records.length}；其余条目的例句/译文仅有内容，仍待人工审校。`,
  `- Ordbank 词头自动查询结果：${[...dictionary].map(([name, count]) => `${name} ${count}`).join("；")}。`,
  "- 词典/课程来源核验只覆盖 CSV 中注明的字段；CEFR 等级及未标为人工审校的词义取舍、词形、例句自然度和中文翻译仍需逐项人工签核。在线词形自动匹配也不等于全部词形均已人工确认。",
  "- 每个词的明细、课程来源、应用主题和词形审计状态见 `vocabulary-1400-review.csv`。",
  "",
  "## Ordbank 词形审计状态",
  "",
  ...[...forms].map(([name, count]) => `- ${name}：${count}`),
  "",
  "重新生成：`node build-vocabulary-1400-review.mjs`。数据取自候选清单、应用词库盘点及 `vocabulary-inflection-audit.csv`。",
].join("\n");
fs.writeFileSync(new URL("./VOCABULARY-1400-REVIEW.md", import.meta.url), `${report}\n`, "utf8");
console.log(`Reviewed inventory report: ${records.length} candidate rows; app matches ${appMatches}; complete fields ${fullFields}; output vocabulary-1400-review.csv.`);
