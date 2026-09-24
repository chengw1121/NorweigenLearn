param(
  [string]$LearnNoWWorkbook = (Join-Path $PSScriptRoot 'ntnu-learnnow-vocabulary-source.xlsx'),
  [string]$NoWHtml = (Join-Path $PSScriptRoot 'ntnu-now-vocabulary-source.html'),
  [string]$CurrentInventory = (Join-Path $PSScriptRoot 'vocabulary-inventory.csv'),
  [int]$A1Target = 600,
  [int]$A2Target = 800
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Read-EntryText($entry) {
  $reader = [System.IO.StreamReader]::new($entry.Open())
  try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
}

function Get-CellValue($row, $column, $strings, $namespace) {
  $cell = $row.SelectSingleNode("x:c[starts-with(@r, '$column')]", $namespace)
  if ($null -eq $cell) { return '' }
  $value = $cell.SelectSingleNode('x:v', $namespace)
  if ($null -eq $value) { return '' }
  if ($cell.GetAttribute('t') -eq 's') { return [string]$strings[[int]$value.InnerText] }
  return [string]$value.InnerText
}

function Normalize-Lemma([string]$word) {
  $lemma = $word.Trim()
  if ($lemma -match '\((?:å|en|ei|et)\s+([^)]*)\)') { $lemma = $Matches[1] }
  elseif ($lemma -match '\(cf\.\s*([^)]+)\)') { $lemma = $Matches[1] }
  return (($lemma -replace '\s+', ' ').Trim())
}

function Get-Pos([string]$code, [string]$article) {
  switch ($code.Trim().ToLowerInvariant()) {
    'n' { return '名词' }
    'v' { return '动词' }
    'a' { return '形容词' }
    'd' { return '副词' }
    'p' { return '介词' }
    default {
      if ($article.Trim() -eq 'å') { return '动词' }
      if ($article.Trim() -match '^(en|ei|et)$') { return '名词' }
      return '待核词性'
    }
  }
}

function Get-LemmaKey([string]$lemma) {
  $key = (($lemma.Trim() -replace '\s+', ' ').ToLowerInvariant())
  if ($key -eq 'alle') { return 'all' }
  if ($key -eq 'penger') { return 'penge' }
  if ($key -eq 'sikkert') { return 'sikker' }
  if ($key -eq 'mindre' -or $key -eq 'minst') { return 'liten' }
  # Comparative/superlative cards remain available for practice, but these
  # forms are already taught under their A1 base lemmas and are not new words.
  if ($key -eq 'bedre' -or $key -eq 'best') { return 'god' }
  if ($key -eq 'mest') { return 'mer' }
  return $key
}

function Add-Candidate($table, $word, $pos, $course, $lesson, $article, $forms, $gloss, $current) {
  $lemma = Normalize-Lemma ([string]$word)
  if ([string]::IsNullOrWhiteSpace($lemma) -or $lemma -match '\s') { return }
  # In its learner-relevant possessive sense, egen is a determinative, not an
  # ordinary descriptive adjective. Normalize all course/app sources together.
  if ($lemma -eq 'egen') { $pos = '限定词' }
  if ($gloss -match '(?i)proper name') { return }
  # Existing curated entries and conventional acronym compounds (PC, ID-kort)
  # may start with capitals without being proper names.
  if ($lemma -cmatch '^[A-ZÆØÅ]' -and -not $current -and $lemma -cnotmatch '^[A-Z]{1,4}-[a-zæøå]') { return }
  $key = "$pos|$($lemma.ToLowerInvariant())"
  if (-not $table.ContainsKey($key)) {
    $table[$key] = [pscustomobject]@{
      key=$key; lemma=$lemma; pos=$pos; article=''; lessons=[System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
      sources=[System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase); forms=[System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
      gloss=''; currentLevel=''; zh=''; examples=[System.Collections.Generic.List[string]]::new(); translations=[System.Collections.Generic.List[string]]::new()
    }
  }
  $item = $table[$key]
  if ($course) { [void]$item.sources.Add($course) }
  if ($lesson) { [void]$item.lessons.Add($lesson) }
  if ($article -and -not $item.article) { $item.article = $article.Trim() }
  if ($forms) { [void]$item.forms.Add($forms.Trim()) }
  if ($gloss -and -not $item.gloss) { $item.gloss = $gloss.Trim() }
  if ($current) {
    if ($current.level -in @('A1','A2') -and -not $item.currentLevel) { $item.currentLevel = $current.level }
    if ($current.zh -and -not $item.zh) { $item.zh = $current.zh }
    if ($current.example) {
      $sentences = @($current.example -split '\s*/\s*')
      $translations = @($current.translation -split '\s*/\s*')
      for ($i = 0; $i -lt $sentences.Count; $i++) {
        $sentence = $sentences[$i]
        if ($sentence -and -not $item.examples.Contains($sentence)) {
          $item.examples.Add($sentence)
          if ($i -lt $translations.Count -and $translations[$i]) { $item.translations.Add($translations[$i]) }
        }
      }
    }
  }
}

if (-not (Test-Path -LiteralPath $LearnNoWWorkbook)) { throw "Missing source workbook: $LearnNoWWorkbook" }
if (-not (Test-Path -LiteralPath $NoWHtml)) { throw "Missing source page: $NoWHtml" }
$candidates = @{}

$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $LearnNoWWorkbook))
try {
  $sharedXml = [xml](Read-EntryText $zip.GetEntry('xl/sharedStrings.xml'))
  $sharedNs = [System.Xml.XmlNamespaceManager]::new($sharedXml.NameTable)
  $sharedNs.AddNamespace('x','http://schemas.openxmlformats.org/spreadsheetml/2006/main')
  $strings = @($sharedXml.SelectNodes('//x:si',$sharedNs) | ForEach-Object { ($_.SelectNodes('.//x:t',$sharedNs) | ForEach-Object { $_.'#text' }) -join '' })
  $sheetXml = [xml](Read-EntryText $zip.GetEntry('xl/worksheets/sheet1.xml'))
  $sheetNs = [System.Xml.XmlNamespaceManager]::new($sheetXml.NameTable)
  $sheetNs.AddNamespace('x','http://schemas.openxmlformats.org/spreadsheetml/2006/main')
  foreach ($row in $sheetXml.SelectNodes('//x:sheetData/x:row[position()>1]',$sheetNs)) {
    $word = Get-CellValue $row 'B' $strings $sheetNs
    if (-not $word) { continue }
    $article = Get-CellValue $row 'A' $strings $sheetNs
    $pos = Get-Pos (Get-CellValue $row 'G' $strings $sheetNs) $article
    $lesson = Get-CellValue $row 'F' $strings $sheetNs
    Add-Candidate $candidates $word $pos 'NTNU LearnNoW' $lesson $article (Get-CellValue $row 'D' $strings $sheetNs) (Get-CellValue $row 'E' $strings $sheetNs) $null
  }
} finally { $zip.Dispose() }

$html = Get-Content -LiteralPath $NoWHtml -Raw
$pattern = '<span style="font-family: ''courier new''; color: black">(?<article>.*?)</span>\s*<a href="http://www\.hf\.ntnu\.no/now/audio/ordliste/publisert/[^\"]+"[^>]*>(?<word>.*?)</a>\s*\(<a href="/now/(?<lessonUrl>[^\"]+)">(?<lesson>.*?)</a>\)\s*=\s*(?<gloss>.*?)<br\s*/?>'
foreach ($match in [regex]::Matches($html,$pattern,[System.Text.RegularExpressions.RegexOptions]::Singleline)) {
  $article = [System.Net.WebUtility]::HtmlDecode(($match.Groups['article'].Value -replace '<[^>]+>','')).Trim() -replace '\u00a0',''
  $word = [System.Net.WebUtility]::HtmlDecode(($match.Groups['word'].Value -replace '<[^>]+>','')).Trim()
  $gloss = [System.Net.WebUtility]::HtmlDecode(($match.Groups['gloss'].Value -replace '<[^>]+>','')).Trim()
  $lesson = $match.Groups['lesson'].Value.Trim()
  $pos = Get-Pos '' $article
  Add-Candidate $candidates $word $pos 'NTNU NoW1' $lesson $article '' $gloss $null
}

if (Test-Path -LiteralPath $CurrentInventory) {
  foreach ($current in (Import-Csv -LiteralPath $CurrentInventory)) {
    # Inventory rows use unit labels such as “名词/数词” as well as “单词”.
    # They are still single lexical headwords; exclude only multiword phrases.
    if ($current.pos -match '短语' -or $current.unit -match '短语') { continue }
    Add-Candidate $candidates $current.lemma $current.pos 'NorweigenLearn 当前词库' '' '' $current.forms '' $current
  }
}

# Course lists contain some items without learner-facing glosses or examples.
# Add original, contextual Chinese data for those retained candidates rather
# than letting a "complete" 1,400-row sheet contain blank teaching fields.
if ($candidates.ContainsKey('名词|t-skjorte')) {
  $tshirt = $candidates['名词|t-skjorte']
  $tshirt.zh = 'T恤；短袖圆领衫'
  $tshirt.forms = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
  foreach ($form in @('ei T-skjorte · T-skjorta · T-skjorter · T-skjortene','en T-skjorte · T-skjorten · T-skjorter · T-skjortene')) { [void]$tshirt.forms.Add($form) }
  $examplePairs = @(
    @{ sentence='Jeg kjøpte en blå T-skjorte på salg.'; translation='我打折买了一件蓝色T恤。' },
    @{ sentence='Jeg kjøpte ei blå T-skjorte på salg.'; translation='我打折买了一件蓝色T恤。' },
    @{ sentence='Han har på seg en hvit T-skjorte.'; translation='他穿着一件白色T恤。' }
  )
  $uniqueExamples = [System.Collections.Generic.List[string]]::new()
  $uniqueTranslations = [System.Collections.Generic.List[string]]::new()
  for ($i = 0; $i -lt [Math]::Min($tshirt.examples.Count, $tshirt.translations.Count); $i++) {
    $sentence = $tshirt.examples[$i]
    if (-not $uniqueExamples.Contains($sentence)) {
      $uniqueExamples.Add($sentence)
      $uniqueTranslations.Add($tshirt.translations[$i])
    }
  }
  $tshirt.examples = $uniqueExamples
  $tshirt.translations = $uniqueTranslations
  foreach ($pair in $examplePairs) {
    if (-not $tshirt.examples.Contains($pair.sentence)) {
      $tshirt.examples.Add($pair.sentence)
      $tshirt.translations.Add($pair.translation)
    }
  }
}

$sortProperties = @(
  @{Expression={ if ($_.currentLevel -eq 'A1') { 0 } elseif ($_.currentLevel -eq 'A2') { 1 } else { 2 } }}
  @{Expression={ if ((Get-LemmaKey $_.lemma) -eq $_.lemma.ToLowerInvariant()) { 0 } else { 1 } }}
  @{Expression={ $chapters = @($_.lessons | ForEach-Object { if ($_ -match '^(\d{1,2})') { [int]$Matches[1] } }); if ($chapters.Count) { ($chapters | Measure-Object -Minimum).Minimum } else { 99 } }}
  @{Expression={ -$_.sources.Count }}
  @{Expression={ $_.lemma }}
)
$ordered = @($candidates.Values | Sort-Object -Property $sortProperties)

# Preserve manually reviewed learner-facing examples when source aggregation
# would otherwise reintroduce older or less natural phrasing.
$reviewedContentOverrides = @{
  'slik' = @{
    zh='这样；如此；像这样'
    examples=@('Fyll ut skjemaet slik at alle feltene er med.','Hun viste meg hvordan jeg skulle gjøre det, så jeg gjorde det slik hun viste meg.')
    translations=@('填写表格时要确保所有栏目都完整填写。','她给我示范了怎么做，所以我就照她示范的方式做了。')
  }
  'spent' = @{
    zh='期待的；兴奋紧张的；绷紧的'
    examples=@('Barna er spente på hva som er i pakken.','Hun var spent før jobbintervjuet.')
    translations=@('孩子们很期待知道包裹里是什么。','她面试前既期待又紧张。')
  }
  'syk' = @{
    zh='生病的；患病的；不舒服的'
    examples=@('Barnet er sykt og blir hjemme fra skolen.','Jeg ble syk etter helgen.')
    translations=@('孩子生病了，待在家里不去上学。','我周末后病倒了。')
  }
  'støvel' = @{
    zh='靴子；长筒靴；防水靴'
    examples=@('Barna tok på seg støvlene før de gikk ut i regnet.','Jeg trenger et par varme støvler til vinteren.')
    translations=@('孩子们出门淋雨前穿上了靴子。','我需要一双适合冬天穿的保暖靴子。')
  }
  'tall' = @{
    zh='数字；数值；数量；统计数据（依语境）'
    examples=@('Skriv tallet med bokstaver.','Tallene for hvor mange som reiser kollektivt, øker fra år til år.')
    translations=@('请用字母把这个数字写出来。','乘坐公共交通的人数逐年上升。')
  }
  'vikar' = @{
    zh='代班人员；临时替班者；代课老师（依语境）'
    examples=@('Skolen har en vikar for læreren i dag.','Vikaren kjenner ikke alle elevene ennå.')
    translations=@('学校今天安排了一位代课老师，替那位老师上课。','这位代课老师还不认识所有学生。')
  }
  'altså' = @{
    zh='所以；因此；也就是说；话说（依语境/语气）'
    examples=@('Bussen går ikke på søndager. Vi må altså ta toget.','Hun er altså den nye læreren vår.')
    translations=@('公交星期天不运行，所以我们得坐火车。','也就是说，她就是我们的新老师。')
  }
  'fall' = @{
    zh='跌倒；下降；落差；（复合词中）落差/瀑布相关词义'
    examples=@('Det var et kraftig fall i temperaturen i natt.','Hun skled på den glatte veien og fikk et stygt fall.')
    translations=@('昨夜气温大幅下降。','她在湿滑的路面上滑倒，摔得很重。')
  }
  'feile' = @{
    zh='犯错；做错；失败；（某人）有病/不舒服'
    examples=@('Jeg prøvde flere ganger, men feilet til slutt.','Hva feiler det deg? Har du vondt noe sted?')
    translations=@('我试了好几次，但最后还是失败了。','你哪里不舒服？身体哪个地方疼吗？')
  }
  'julegave' = @{
    zh='圣诞礼物'
    examples=@('Jeg må kjøpe en julegave til søsteren min.','Barna pakker opp julegavene etter middagen.')
    translations=@('我得给姐姐或妹妹买一份圣诞礼物。','孩子们晚饭后拆圣诞礼物。')
  }
  'grad' = @{
    zh='度；程度；等级'
    examples=@('Det er fem grader ute i dag.','Hun er i høy grad motivert.')
    translations=@('今天室外五度。','她积极性很高。')
  }
  'hevelse' = @{
    zh='肿胀；肿块；浮肿'
    examples=@('Jeg har en hevelse rundt ankelen etter fallet.','Hevelsen ble mindre etter at hun la is på kneet.')
    translations=@('我摔倒后脚踝周围肿了起来。','她给膝盖冰敷后，肿胀减轻了。')
  }
  'hode' = @{
    zh='头；头部；（引申）头脑、负责人'
    examples=@('Jeg har vondt i hodet og trenger å hvile.','Barnet la hodet forsiktig på puta.')
    translations=@('我头疼，需要休息。','孩子轻轻把头枕在枕头上。')
  }
  'insistere' = @{
    zh='坚持；坚决要求；强调'
    examples=@('Hun insisterer på å betale for middagen.','Legen insisterte på at jeg skulle hvile mer.')
    translations=@('她坚持要付晚餐的钱。','医生坚持让我多休息。')
  }
  'klemme' = @{
    zh='拥抱；挤压；夹住'
    examples=@('Bestemor klemmer barnet.','Ikke klem tomaten, da blir den ødelagt.')
    translations=@('奶奶抱了抱孩子。','别挤西红柿，会把它弄坏的。')
  }
  'kondisjon' = @{
    zh='体能；耐力；心肺状况'
    examples=@('Jeg trener for å få bedre kondisjon.','Hun har god kondisjon etter mange år med løping.')
    translations=@('我通过锻炼来提高体能。','多年跑步之后，她的体能很好。')
  }
  'ordning' = @{
    zh='安排；制度；方案；做法（依语境）'
    examples=@('Kommunen innfører en ny ordning for tildeling av barnehageplasser.','Denne ordningen gjør det enklere å bestille time.')
    translations=@('市政府推出新的幼儿园学位分配办法。','这项安排让预约变得更容易。')
  }
  'resept' = @{
    zh='处方'
    examples=@('Legen skriver ut en resept.','Jeg henter ut medisinen på apoteket etter at legen har skrevet ut resepten.')
    translations=@('医生开了一张处方。','医生开出处方后，我去药房取药。')
  }
  'skranke' = @{
    zh='服务台；柜台；接待处'
    examples=@('Du kan hente nøkkelen ved skranken i resepsjonen.','Skrankene på biblioteket stenger klokka fire.')
    translations=@('你可以在接待处的柜台领取钥匙。','图书馆的服务台四点关闭。')
  }
  'sport' = @{
    zh='体育运动；运动项目；体育（活动）'
    examples=@('Sønnen min er interessert i sport, særlig fotball.','Det blir mye sport på TV i helga.')
    translations=@('我儿子喜欢体育，尤其是足球。','这个周末电视上有很多体育赛事。')
  }
  'tann' = @{
    zh='牙齿'
    examples=@('Jeg pusser tennene hver morgen.','Hun må bestille time hos tannlegen.')
    translations=@('我每天早上刷牙。','她得预约看牙医。')
  }
  'trening' = @{
    zh='训练；锻炼；一次训练课'
    examples=@('Jeg går på trening etter jobb.','Treningen begynner klokka seks.')
    translations=@('我下班后去锻炼。','训练六点开始。')
  }
  'bryllup' = @{
    zh='婚礼；婚宴；婚礼庆典'
    examples=@('Søsteren hennes skal gifte seg i juni, og vi skal i bryllup.','Bryllupet var lite, men veldig hyggelig.')
    translations=@('她姐姐（或妹妹）六月要结婚，我们会去参加婚礼。','婚礼规模不大，但非常愉快。')
  }
  'videre' = @{
    zh='进一步的；更多的；继续；此外（依语境）'
    examples=@('Vi trenger videre informasjon om kurset.','Etter pausen gikk møtet videre.')
    translations=@('我们还需要关于这门课程的更多信息。','休息后会议继续进行。')
  }
  'utslett' = @{
    zh='皮疹；疹子；皮肤红疹'
    examples=@('Barnet har fått utslett på armene.','Utslettet klør, så jeg ringer legen.')
    translations=@('孩子胳膊上起了皮疹。','疹子很痒，所以我要给医生打电话。')
  }
  'forestilling' = @{
    zh='演出；表演；想法；印象（依语境）'
    examples=@('Vi så en morsom forestilling på teatret.','Jeg hadde en helt annen forestilling om stedet.')
    translations=@('我们在剧院看了一场有趣的演出。','我原本对那个地方的印象完全不同。')
  }
  'kunst' = @{
    zh='艺术；艺术作品/门道（依语境）'
    examples=@('Vi så moderne kunst på museet.','Det er en kunst å få alle til å le.')
    translations=@('我们在博物馆看了现代艺术。','让所有人都笑出来是一门本事。')
  }
  'hyling' = @{
    zh='嚎叫；尖叫；大声哭喊'
    examples=@('Det var mye hyling på lekeplassen.','Hylingen fra vinden vekket barna.')
    translations=@('游乐场里到处都是孩子们的尖叫声。','风的呼啸声把孩子们吵醒了。')
  }
  'miste' = @{
    zh='失去；弄丢；错过（车、机会等）'
    examples=@('Jeg mistet nøklene på vei hjem.','Vi mistet bussen fordi vi gikk hjemmefra for sent.')
    translations=@('我回家的路上把钥匙弄丢了。','我们因为出门太晚而没赶上公交。')
  }
  'skjønnhet' = @{
    zh='美；美丽；美人/美的事物'
    examples=@('Vi ble overrasket over skjønnheten i fjellene.','Det er en egen skjønnhet i de gamle trehusene.')
    translations=@('群山的美让我们惊叹。','这些老木屋有一种独特的美感。')
  }
  'utstilling' = @{
    zh='展览；展出；展览会'
    examples=@('Vi skal se en utstilling av norske malerier.','Det er mange mennesker på utstillingen i dag.')
    translations=@('我们要去看一个挪威绘画展。','今天展览上有很多人。')
  }
  'desember' = @{
    zh='十二月；12月'
    examples=@('Vi reiser til familien min i desember.','Vi skal ha juleavslutning på skolen i desember.')
    translations=@('我们十二月去看我的家人。','学校十二月要举办圣诞学期结束活动。')
  }
  'kinn' = @{
    zh='脸颊；面颊'
    examples=@('Hun fikk et kyss på kinnet.','Barna kom inn med røde kinn.')
    translations=@('有人亲了她的脸颊。','孩子们进来时脸颊红红的。')
  }
  'onkel' = @{
    zh='叔叔；伯伯；舅舅；姨父/姑父等（依亲属关系）'
    examples=@('Onkelen min bor i Bergen.','Vi besøker onkel Per på lørdag.')
    translations=@('我叔叔（或舅舅）住在卑尔根。','我们星期六去看望佩尔叔叔。')
  }
  'overraskelse' = @{
    zh='惊讶；意外之事；惊喜（依语境）'
    examples=@('Det var en hyggelig overraskelse å få besøk av søsteren min.','Til min overraskelse var toget i rute.')
    translations=@('姐姐（或妹妹）来看我，真是个惊喜。','令我意外的是，火车准点。')
  }
  'servere' = @{
    zh='上菜；供应；招待；（体育）发球'
    examples=@('Restauranten serverer middag fra klokka fem.','Tennisspilleren serverte godt i det første settet.')
    translations=@('这家餐馆从五点开始供应晚餐。','网球选手在第一盘发球表现很好。')
  }
  'ønske' = @{
    zh='希望；想要；祝愿；希望某人……'
    examples=@('Barnet ønsker seg en sykkel til bursdagen.','Jeg ønsker deg en fin dag.')
    translations=@('孩子想要一辆自行车作为生日礼物。','祝你今天愉快。')
  }
  'svigerforelder' = @{
    zh='岳父/岳母；公公/婆婆（性别未说明时的统称）'
    examples=@('Vi skal besøke svigerforeldrene mine i helgen.','Hun har et godt forhold til svigerforelderen sin.')
    translations=@('我们周末要去看望我的岳父母（或公公婆婆）。','她和配偶的父亲或母亲相处得很好。')
  }
  'svigermor' = @{
    zh='婆婆；岳母；配偶的母亲'
    examples=@('Vi skal besøke svigermoren min på søndag.','Begge svigermødrene kommer på middag.')
    translations=@('我们星期天去看望我的婆婆（或岳母）。','两位婆婆（或岳母）都会来吃晚饭。')
  }
  'tante' = @{
    zh='姑妈；姨妈；舅妈/伯母等；阿姨（依亲属关系或称呼）'
    examples=@('Vi skal besøke tante Petra på søndag.','Tanta mi bor i Trondheim.')
    translations=@('我们星期天要去看望佩特拉阿姨。','我姑妈（或姨妈）住在特隆赫姆。')
  }
  'hennes' = @{
    zh='她的'
    examples=@('Familien hennes bor i Trondheim.','Jeg kjenner søsteren hennes.')
    translations=@('她的家人住在特隆赫姆。','我认识她的姐姐（或妹妹）。')
  }
  'elektrisitet' = @{
    zh='电；电力；电能'
    examples=@('Prisen på elektrisitet kan variere gjennom året.','Elektrisitet er nødvendig for at lys og varme skal fungere.')
    translations=@('电价可能会随季节变化。','照明和供暖都离不开电。')
  }
  'kølapp' = @{
    zh='排队号；取号纸；号码牌'
    examples=@('Ta en kølapp og vent til nummeret ditt blir ropt opp.','Jeg mistet kølappen før det ble min tur.')
    translations=@('取号后，等着叫到你的号码。','还没轮到我，我就把号码牌弄丢了。')
  }
  'maler' = @{
    zh='画家；油漆工；涂装工（依语境）'
    examples=@('Bestefaren min jobbet som maler.','Maleren skal male stua på nytt.')
    translations=@('我祖父以前是油漆工（也可能是画家，需看职业背景）。','油漆工要把客厅重新粉刷一遍。')
  }
  'nevø' = @{
    zh='侄子；外甥（兄弟姐妹的儿子）'
    examples=@('Nevøen min begynner på skolen til høsten.','Hun har to nevøer og ei niese.')
    translations=@('我侄子（或外甥）今年秋天开始上学。','她有两个侄子（或外甥）和一个侄女（或外甥女）。')
  }
  'oldemor' = @{
    zh='曾祖母；外曾祖母（祖父母一辈的母亲）'
    examples=@('Oldemora mi bor fortsatt i Trondheim.','Barna fikk høre historier fra oldemødrene sine.')
    translations=@('我的曾祖母（或外曾祖母）仍住在特隆赫姆。','孩子们听了各自曾祖母讲的故事。')
  }
  'søskenbarn' = @{
    zh='堂/表兄弟姐妹；堂/表亲（父母的兄弟姐妹的子女）'
    examples=@('Søskenbarnet mitt bor i Bergen.','Vi skal besøke søskenbarna våre i ferien.')
    translations=@('我的堂（或表）亲住在卑尔根。','假期我们要去看望我们的堂（或表）亲们。')
  }
  'mat' = @{
    zh='食物；饭菜；一餐'
    examples=@('Barna liker italiensk mat.','Maten er klar.')
    translations=@('孩子们喜欢意大利菜。','饭做好了。')
  }
  'melk' = @{
    zh='牛奶；奶'
    examples=@('Barnet drikker melk til frokost.','Melka står i kjøleskapet.')
    translations=@('孩子早餐喝牛奶。','牛奶在冰箱里。')
  }
  'penge' = @{
    zh='钱；金钱（通常用复数形式 penger）'
    examples=@('Vi sparer penger til en ny bil.','Jeg har ikke nok penger til billetten.')
    translations=@('我们在攒钱买一辆新车。','我的钱不够买这张票。')
  }
  'lærer' = @{
    zh='老师；教师'
    examples=@('Læreren hjelper elevene med leksene.','Vi snakket med læreren etter timen.')
    translations=@('老师帮助学生们做作业。','下课后我们和老师聊了聊。')
  }
}
foreach ($item in $ordered) {
  $override = $reviewedContentOverrides[$item.lemma.ToLowerInvariant()]
  if ($override) {
    $item.zh = $override.zh
    $item.examples = [System.Collections.Generic.List[string]]::new()
    $item.translations = [System.Collections.Generic.List[string]]::new()
    foreach ($sentence in $override.examples) { $item.examples.Add($sentence) }
    foreach ($translation in $override.translations) { $item.translations.Add($translation) }
  }
}

# Source-consolidated candidates can carry stale, conflicting forms from older
# app content or course exports. Prefer an explicitly dictionary-reviewed form
# set for entries that have been checked; keep the raw pool untouched otherwise.
$reviewedInflectionOverrides = @{
  'trykke' = 'å trykke · trykker · trykket / trykte · har trykket / har trykt'
  'joggesko' = 'en joggesko · joggeskoen · joggesko · joggeskoa / joggeskoene'
  'mester' = 'en mester · mesteren · mestere / mestre · mesterne / mestrene'
  'oktober' = 'en oktober · oktoberen · oktoberer · oktoberene'
  'bygg' = 'et bygg · bygget · bygg · byggene'
  'plaster' = 'et plaster · plasteret · plaster / plastre · plastera / plastrene'
  'fan' = 'en fan · fanen · fans · fanene'
  'møterom' = 'et møterom · møterommet · møterom · møterommene'
  'kakao' = 'en kakao · kakaoen · kakaoer · kakaoene'
  'korrektur' = 'en korrektur · korrekturen · korrekturer · korrekturene'
  'form' = 'en form / ei form · formen / forma · former · formene'
  'hode' = 'et hode · hodet · hoder · hoda / hodene'
  'kondisjon' = 'en kondisjon · kondisjonen'
  'forestilling' = 'ei/en forestilling · forestillingen / forestillinga · forestillinger · forestillingene'
  'rykte' = 'et rykte · ryktet · rykter · rykta / ryktene'
  'skjønnhet' = 'en/ei skjønnhet · skjønnheten / skjønnheta · skjønnheter · skjønnhetene'
  'neste' = 'neste'
  'nær' = 'nær · nært · nære · nærmere · nærmest'
  'om' = 'om'
  'mer' = 'mer'
}
function Get-CandidateForms($item) {
  if ($reviewedInflectionOverrides.ContainsKey($item.lemma.ToLowerInvariant())) {
    return $reviewedInflectionOverrides[$item.lemma.ToLowerInvariant()]
  }
  return (@($item.forms | Sort-Object) -join ' / ')
}

$poolOutput = foreach ($item in $ordered) {
  $chapterNumbers = @($item.lessons | ForEach-Object { if ($_ -match '^(\d{1,2})') { [int]$Matches[1] } } | Sort-Object -Unique)
  [pscustomobject]@{
    lemma=$item.lemma; pos=$item.pos; currentLevel=$item.currentLevel; article=$item.article
    sourceCourses=(@($item.sources) -join '; '); courseUnits=(@($item.lessons | Sort-Object) -join '; ')
    firstChapter=if ($chapterNumbers.Count) { $chapterNumbers[0] } else { '' }
    sourceInflections=(Get-CandidateForms $item)
    zh=$item.zh; exampleNb=($item.examples -join ' / '); exampleZh=($item.translations -join ' / ')
  }
}
$poolOutput | Export-Csv -LiteralPath (Join-Path $PSScriptRoot 'vocabulary-candidate-pool.csv') -NoTypeInformation -Encoding utf8

 $uniqueLemmaCount = @($ordered | ForEach-Object { Get-LemmaKey $_.lemma } | Sort-Object -Unique).Count
if ($uniqueLemmaCount -lt ($A1Target + $A2Target)) { throw "Only $uniqueLemmaCount distinct headwords in the candidate pool; need $($A1Target + $A2Target)." }
$selectedA1 = [System.Collections.Generic.List[object]]::new()
$selectedA2 = [System.Collections.Generic.List[object]]::new()
$selectedKeys = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$knownA1Keys = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$excludedA2Keys = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
# Inflected comparative/superlative forms are useful learning targets, but are
# not distinct headwords when the base adjective is already represented in A1.
[void]$excludedA2Keys.Add('størst') # base adjective stor is already in A1
[void]$excludedA2Keys.Add('mindre') # comparative of liten; base adjective is already in A1
[void]$excludedA2Keys.Add('minst') # superlative of liten; do not count an inflection as a new lemma
[void]$excludedA2Keys.Add('nærmere') # comparative of nær; do not count an inflection as a new lemma
[void]$excludedA2Keys.Add('kjempekoselig') # productive intensifier + adjective; replace with a standalone lexical item
[void]$excludedA2Keys.Add('seinere') # comparative/adverbial inflection of sen; require base headword, not an orphan form
[void]$excludedA2Keys.Add('kjempefint') # neuter inflection of kjempefin; do not count an inflection as a second lemma
[void]$excludedA2Keys.Add('samlet') # participle of samle; no independent adjective lemma in the checked word list
[void]$excludedA2Keys.Add('hyttetradisjon') # unsupported low-frequency compound; replace with a dictionary-listed lexical headword
[void]$excludedA2Keys.Add('nr') # abbreviation, not a learner-facing lexical headword
[void]$excludedA2Keys.Add('ung') # candidate is only an inflection with no complete standalone teaching record
[void]$excludedA2Keys.Add('god') # comparative/superlative cards bedre/best belong to the A1 base-adjective paradigm
[void]$excludedA2Keys.Add('lego') # brand name/common-material use; not an independently verified Bokmål headword
[void]$excludedA2Keys.Add('fikk') # preterite of få; do not count an inflected verb form as a separate headword
foreach ($item in $ordered | Where-Object currentLevel -eq 'A1') { [void]$knownA1Keys.Add((Get-LemmaKey $item.lemma)) }
foreach ($item in $ordered | Where-Object currentLevel -eq 'A1') { if ($selectedA1.Count -ge $A1Target) { break }; if ($selectedKeys.Add((Get-LemmaKey $item.lemma))) { $selectedA1.Add($item) } }
foreach ($item in $ordered) { if ($selectedA1.Count -ge $A1Target) { break }; if ($selectedKeys.Add((Get-LemmaKey $item.lemma))) { $selectedA1.Add($item) } }
foreach ($item in $ordered | Where-Object currentLevel -eq 'A2') { if ($selectedA2.Count -ge $A2Target) { break }; $lemmaKey = Get-LemmaKey $item.lemma; if (-not $excludedA2Keys.Contains($lemmaKey) -and -not $knownA1Keys.Contains($lemmaKey) -and $selectedKeys.Add($lemmaKey)) { $selectedA2.Add($item) } }
foreach ($item in $ordered) { if ($selectedA2.Count -ge $A2Target) { break }; $lemmaKey = Get-LemmaKey $item.lemma; if ($item.pos -ne '待核词性' -and -not $excludedA2Keys.Contains($lemmaKey) -and -not $knownA1Keys.Contains($lemmaKey) -and $selectedKeys.Add($lemmaKey)) { $selectedA2.Add($item) } }
if ($selectedA1.Count -ne $A1Target -or $selectedA2.Count -ne $A2Target) { throw 'Could not allocate the exact A1/A2 candidate targets.' }

$output = foreach ($pair in @(@('A1',$selectedA1),@('A2',$selectedA2))) {
  foreach ($item in $pair[1]) {
    $chapterNumbers = @($item.lessons | ForEach-Object { if ($_ -match '^(\d{1,2})') { [int]$Matches[1] } } | Sort-Object -Unique)
    [pscustomobject]@{
      lemma=$item.lemma; pos=$item.pos; candidateLevel=$pair[0]; article=$item.article
      sourceCourses=(@($item.sources) -join '; '); courseUnits=(@($item.lessons | Sort-Object) -join '; ')
      firstChapter=if ($chapterNumbers.Count) { $chapterNumbers[0] } else { '' }
      sourceInflections=(Get-CandidateForms $item)
      zh=$item.zh; exampleNb=($item.examples -join ' / '); exampleZh=($item.translations -join ' / ')
      levelBasis=if ($item.currentLevel -eq $pair[0]) { '沿用现有词库暂标；仍待逐词核验' } else { '根据 A1–A2 初级课程覆盖与章节先后分配的项目候选等级；非官方逐词 CEFR 标注' }
      reviewStatus=if ($item.zh -and $item.forms.Count -and $item.examples.Count -and $item.translations.Count) { '现有应用词条；词头/词性/等级仍待整体验收' } else { '候选记录；词头、词性、等级待核，待补独立中文义项、规范词形与原创例句译文' }
    }
  }
}

$outputPath = Join-Path $PSScriptRoot 'vocabulary-candidates-1400.csv'
$output | Export-Csv -LiteralPath $outputPath -NoTypeInformation -Encoding utf8
$a1Count = @($output | Where-Object candidateLevel -eq 'A1').Count
$a2Count = @($output | Where-Object candidateLevel -eq 'A2').Count
$missingZh = @($output | Where-Object { -not $_.zh }).Count
$missingForms = @($output | Where-Object { -not $_.sourceInflections }).Count
$missingSentences = @($output | Where-Object { -not $_.exampleNb -or -not $_.exampleZh }).Count
$sourceCounts = $candidates.Values | ForEach-Object { $_.sources } | Group-Object | Select-Object Name,Count
$summary = @(
  '# 1,400 词候选总表（工作版）'
  ''
  '由 NTNU LearnNoW、NTNU NoW1 课程词汇表与现有应用词库汇集；本表按规范化词头去重，目标为 1,400 个不同单词词头（A1 600 + A2 新增 800），不将同拼写异词性重复算作新词。短语和专名不计入。NTNU 将 LearnNoW 与 NoW 说明为 A1–A2 初级课程，但未提供逐词 CEFR 等级；本表等级是工作标签，不可视为已审核等级。'
  ''
  '## 当前候选数据状态'
  ''
  "- 候选记录：$($output.Count)（A1 $a1Count + A2 $a2Count）；词头归并、词性及 CEFR 仍待逐条核验。"
  "- 缺中文义项：$missingZh；缺课程词形资料：$missingForms；缺自然挪威语例句或中文译文：$missingSentences。"
  '为避免搬运来源课程的英文释义，本候选表不复制原教材 gloss；正式中文义项将在分批核词后自行编写。'
  '每批须再核对 Bokmål 词头/词性/词形、词义范围、例句与译文，完成后才进入 App 正式词库及审核计数。'
  '课程来源：LearnNoW 下载区与词汇表；NoW1 下载区与词汇表。完整来源及使用边界见 `VOCABULARY-SOURCES.md`。'
  ''
  '重新生成：`./build-vocabulary-candidates.ps1`'
) -join [Environment]::NewLine
Set-Content -LiteralPath (Join-Path $PSScriptRoot 'VOCABULARY-CANDIDATES-1400.md') -Value $summary -Encoding utf8
Write-Output "Built $($output.Count) draft candidate records by unique headword (A1=$a1Count, A2=$a2Count); missing Chinese=$missingZh, forms=$missingForms, contextual sentences/translations=$missingSentences."
