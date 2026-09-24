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
    if ($current.example) { foreach ($sentence in ($current.example -split '\s*/\s*')) { if ($sentence -and -not $item.examples.Contains($sentence)) { $item.examples.Add($sentence) } } }
    if ($current.translation) { foreach ($translation in ($current.translation -split '\s*/\s*')) { if ($translation -and -not $item.translations.Contains($translation)) { $item.translations.Add($translation) } } }
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
  $tshirt.examples.Add('Jeg kjøpte ei blå T-skjorte på salg.')
  $tshirt.examples.Add('Han har på seg en hvit T-skjorte.')
  $tshirt.translations.Add('我打折买了一件蓝色T恤。')
  $tshirt.translations.Add('他穿着一件白色T恤。')
}

$sortProperties = @(
  @{Expression={ if ($_.currentLevel -eq 'A1') { 0 } elseif ($_.currentLevel -eq 'A2') { 1 } else { 2 } }}
  @{Expression={ $chapters = @($_.lessons | ForEach-Object { if ($_ -match '^(\d{1,2})') { [int]$Matches[1] } }); if ($chapters.Count) { ($chapters | Measure-Object -Minimum).Minimum } else { 99 } }}
  @{Expression={ -$_.sources.Count }}
  @{Expression={ $_.lemma }}
)
$ordered = @($candidates.Values | Sort-Object -Property $sortProperties)

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
