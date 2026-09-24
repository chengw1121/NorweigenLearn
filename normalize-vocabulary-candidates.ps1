param(
  [string]$CandidatePool = (Join-Path $PSScriptRoot 'vocabulary-candidate-pool.csv'),
  [string]$LemmaJson = (Join-Path $PSScriptRoot 'uib-ordbank-lemma-source.json'),
  [string]$FormsCsv = (Join-Path $PSScriptRoot 'uib-ordbank-boys-source.csv'),
  [int]$A1Target = 600,
  [int]$A2Target = 800
)

$ErrorActionPreference = 'Stop'
foreach ($path in @($CandidatePool,$LemmaJson,$FormsCsv)) { if (-not (Test-Path -LiteralPath $path)) { throw "Missing input: $path" } }

function Convert-TagToPos([string]$tag) {
  switch ($tag) {
    'NOUN' { '名词' } 'VERB' { '动词' } 'ADJ' { '形容词' } 'ADV' { '副词' }
    'ADP' { '介词' } 'DET' { '限定词' } 'PRON' { '代词' } 'NUM' { '数词' }
    'CCONJ' { '并列连词' } 'SCONJ' { '从属连词' } 'INTJ' { '感叹词' }
    'AUX' { '助动词' } 'PART' { '小品词' } 'PROPN' { '专有名词' }
    'SYM' { '符号' } 'ABBR' { '缩写' } default { '待核词性' }
  }
}

function Convert-PosToTag([string]$pos) {
  if ($pos -match '^名词') { return 'NOUN' }
  if ($pos -match '^动词') { return 'VERB' }
  if ($pos -match '形容词') { return 'ADJ' }
  if ($pos -match '^副词') { return 'ADV' }
  if ($pos -match '^介词') { return 'ADP' }
  if ($pos -match '^限定词') { return 'DET' }
  if ($pos -match '^代词') { return 'PRON' }
  if ($pos -match '^数词') { return 'NUM' }
  if ($pos -match '并列连词') { return 'CCONJ' }
  if ($pos -match '从属连词') { return 'SCONJ' }
  if ($pos -match '^感叹词') { return 'INTJ' }
  return ''
}

function Add-UniqueText($list, [string]$value) {
  if (-not [string]::IsNullOrWhiteSpace($value) -and -not $list.Contains($value)) { $list.Add($value) }
}

$lemmaMetadata = @{}
foreach ($entry in (Get-Content -LiteralPath $LemmaJson -Raw | ConvertFrom-Json)) {
  $key = ([string]$entry[0]).Trim().ToLowerInvariant()
  if (-not $lemmaMetadata.ContainsKey($key)) { $lemmaMetadata[$key] = [System.Collections.Generic.List[object]]::new() }
  $lemmaMetadata[$key].Add([pscustomobject]@{ lemma=[string]$entry[0]; articleId=[string]$entry[1]; tag=[string]$entry[2]; subClass=[string]$entry[3] })
}

$candidateRows = @(Import-Csv -LiteralPath $CandidatePool)
$candidateKeys = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
foreach ($row in $candidateRows) { [void]$candidateKeys.Add(([string]$row.lemma).Trim()) }
$formRoots = @{}
$officialForms = @{}
foreach ($line in [System.IO.File]::ReadLines((Resolve-Path -LiteralPath $FormsCsv))) {
  $parts = $line.Split('|')
  if ($parts.Count -lt 2) { continue }
  $root = $parts[0].Trim()
  if (-not $root) { continue }
  $rootKey = $root.ToLowerInvariant()
  if (-not $officialForms.ContainsKey($rootKey)) { $officialForms[$rootKey] = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase) }
  foreach ($form in $parts) {
    $form = $form.Trim()
    if (-not $form) { continue }
    $formKey = $form.ToLowerInvariant()
    if ($candidateKeys.Contains($formKey)) {
      if (-not $formRoots.ContainsKey($formKey)) { $formRoots[$formKey] = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase) }
      [void]$formRoots[$formKey].Add($root)
    }
    if ($candidateKeys.Contains($rootKey) -or $candidateKeys.Contains($formKey)) {
      if (-not $officialForms.ContainsKey($rootKey)) { $officialForms[$rootKey] = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase) }
      [void]$officialForms[$rootKey].Add($form)
    }
  }
}

$manual = @{
  'deg'=@('du','代词'); 'et'=@('en','限定词'); 'dem'=@('de','代词'); 'ett'=@('én','数词');
  'oss'=@('vi','代词'); 'trettiåtte'=@('trettiåtte','数词'); 'brødre'=@('bror','名词');
  'greit'=@('grei','形容词'); 'kjempeflink'=@('kjempeflink','形容词'); 'kjempesulten'=@('kjempesulten','形容词');
  'meg'=@('jeg','代词'); 'hvilket'=@('hvilken','限定词'); 'klokka'=@('klokke','名词');
  'greide'=@('greie','动词'); 'hvilke'=@('hvilken','限定词'); 'syttito'=@('syttito','数词');
  'besteforeldre'=@('besteforelder','名词'); 'kjempemorsom'=@('kjempemorsom','形容词');
  'kjempesøt'=@('kjempesøt','形容词'); 'hyggeligere'=@('hyggelig','形容词');
  'kaldere'=@('kald','形容词'); 'dine'=@('din','限定词'); 'di'=@('din','限定词'); 'internettilgang'=@('internettilgang','名词')
  'hallo'=@('hallo','感叹词'); 'hei'=@('hei','感叹词')
}

$resolved = [System.Collections.Generic.List[object]]::new()
foreach ($row in $candidateRows) {
  $original = ([string]$row.lemma).Trim()
  $key = $original.ToLowerInvariant()
  $pos = [string]$row.pos
  $root = $original
  $resolution = '原词形保留；需人工复核'
  $metadata = @()

  if ($manual.ContainsKey($key)) {
    $root = $manual[$key][0]
    $pos = $manual[$key][1]
    $resolution = '常见屈折形式/透明构词人工归一；待复核'
  } else {
    $sourceTag = Convert-PosToTag $pos
    $exact = if ($lemmaMetadata.ContainsKey($key)) { @($lemmaMetadata[$key]) } else { @() }
    if ($exact.Count) {
      $matching = if ($sourceTag) { @($exact | Where-Object tag -eq $sourceTag) } else { @() }
      $metadata = if ($matching.Count) { $matching } else { $exact }
      $officialTag = [string]$metadata[0].tag
      if (-not $sourceTag -or $sourceTag -eq 'X') { $pos = Convert-TagToPos $officialTag }
      $resolution = 'Ordbank 词头匹配'
    } else {
      $possibleRoots = if ($formRoots.ContainsKey($key)) { @($formRoots[$key]) } else { @() }
      $rootMatches = foreach ($possible in $possibleRoots) {
        $possibleKey = $possible.ToLowerInvariant()
        if ($lemmaMetadata.ContainsKey($possibleKey)) {
          foreach ($meta in $lemmaMetadata[$possibleKey]) {
            if (-not $sourceTag -or $meta.tag -eq $sourceTag) { [pscustomobject]@{ root=$possible; metadata=$meta } }
          }
        }
      }
      $distinctRoots = @($rootMatches | Select-Object -ExpandProperty root -Unique)
      if ($distinctRoots.Count -eq 1) {
        $root = $distinctRoots[0]
        $metadata = @($rootMatches | Where-Object { $_.root -eq $root } | ForEach-Object metadata)
        if ($metadata.Count -and (-not $sourceTag -or $pos -eq '待核词性')) { $pos = Convert-TagToPos $metadata[0].tag }
        $resolution = '按 Ordbank 屈折形式归回词头'
      } elseif ($pos -eq '待核词性' -and $possibleRoots.Count -eq 0) {
        $resolution = 'Ordbank 无精确词头或词形；人工分词性暂标'
      } else {
        $resolution = '存在多个可能词头；需人工消歧'
      }
    }
  }

  $metadata = if ($metadata.Count) { @($metadata) } elseif ($lemmaMetadata.ContainsKey($root.ToLowerInvariant())) { @($lemmaMetadata[$root.ToLowerInvariant()]) } else { @() }
  $officialTags = @($metadata | Select-Object -ExpandProperty tag -Unique)
  $officialFormList = if ($officialForms.ContainsKey($root.ToLowerInvariant())) { @($officialForms[$root.ToLowerInvariant()] | Sort-Object) -join ' · ' } else { '' }
  $resolved.Add([pscustomobject]@{
    lemma=$root; originalCandidate=$original; pos=$pos; candidateLevel=$row.currentLevel
    article=$row.article; sourceCourses=$row.sourceCourses; courseUnits=$row.courseUnits; firstChapter=$row.firstChapter
    sourceInflections=$row.sourceInflections; officialForms=$officialFormList; officialPOS=($officialTags -join '; ')
    officialHeadwordFound=[bool]$lemmaMetadata.ContainsKey($root.ToLowerInvariant())
    zh=$row.zh; exampleNb=$row.exampleNb; exampleZh=$row.exampleZh; resolution=$resolution
  })
}

$merged = @{}
foreach ($row in $resolved) {
  $key = "$($row.pos)|$($row.lemma.ToLowerInvariant())"
  if (-not $merged.ContainsKey($key)) {
    $merged[$key] = [pscustomobject]@{
      lemma=$row.lemma; pos=$row.pos; article=''; levels=[System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
      origins=[System.Collections.Generic.List[string]]::new(); sources=[System.Collections.Generic.List[string]]::new(); lessons=[System.Collections.Generic.List[string]]::new()
      sourceForms=[System.Collections.Generic.List[string]]::new(); officialForms=[System.Collections.Generic.List[string]]::new(); officialPOS=[System.Collections.Generic.List[string]]::new()
      official=$false; zh=''; examples=[System.Collections.Generic.List[string]]::new(); translations=[System.Collections.Generic.List[string]]::new()
    }
  }
  $item=$merged[$key]
  if (-not $item.article -and $row.article) { $item.article=$row.article }
  if ($row.candidateLevel) { [void]$item.levels.Add($row.candidateLevel) }
  Add-UniqueText $item.origins $row.originalCandidate
  Add-UniqueText $item.sources $row.sourceCourses
  Add-UniqueText $item.lessons $row.courseUnits
  Add-UniqueText $item.sourceForms $row.sourceInflections
  Add-UniqueText $item.officialForms $row.officialForms
  Add-UniqueText $item.officialPOS $row.officialPOS
  if ($row.officialHeadwordFound) { $item.official=$true }
  if (-not $item.zh -and $row.zh) { $item.zh=$row.zh }
  Add-UniqueText $item.examples $row.exampleNb
  Add-UniqueText $item.translations $row.exampleZh
}

$all = @($merged.Values | ForEach-Object {
  $chapters=@($_.lessons | ForEach-Object { if ($_ -match '(?<!\d)(\d{1,2})[A-Z]') { [int]$Matches[1] } } | Sort-Object)
  [pscustomobject]@{
    lemma=$_.lemma; pos=$_.pos; currentLevels=@($_.levels); chapter=if($chapters.Count){$chapters[0]}else{99}
    latestChapter=if($chapters.Count){$chapters[-1]}else{0}; sources=$_.sources -join ' · '; lessons=$_.lessons -join ' · '
    originalForms=$_.origins -join ' · '; sourceInflections=$_.sourceForms -join ' / '; officialForms=$_.officialForms -join ' / '
    officialPOS=$_.officialPOS -join ' · '; official=$_.official; article=$_.article; zh=$_.zh; exampleNb=$_.examples -join ' / '; exampleZh=$_.translations -join ' / '
  }
})

$a1 = [System.Collections.Generic.List[object]]::new()
$a2 = [System.Collections.Generic.List[object]]::new()
$used = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$keyFor = { param($item) "$($item.pos)|$($item.lemma.ToLowerInvariant())" }
$a1Seeds = @($all | Where-Object { $_.currentLevels -contains 'A1' } | Sort-Object chapter,@{Expression={-$_.latestChapter}},lemma)
foreach ($item in $a1Seeds) { if ($a1.Count -ge $A1Target) { break }; $k=&$keyFor $item; if($used.Add($k)){$a1.Add($item)} }
foreach ($item in ($all | Sort-Object chapter,@{Expression={-$_.latestChapter}},lemma)) { if($a1.Count -ge $A1Target){break};$k=&$keyFor $item;if($used.Add($k)){$a1.Add($item)} }
$a2Seeds = @($all | Where-Object { $_.currentLevels -contains 'A2' } | Sort-Object @{Expression={-$_.latestChapter}},@{Expression={-$_.chapter}},lemma)
foreach ($item in $a2Seeds) { if($a2.Count -ge $A2Target){break};$k=&$keyFor $item;if($used.Add($k)){$a2.Add($item)} }
foreach ($item in ($all | Sort-Object @{Expression={-$_.latestChapter}},@{Expression={-$_.chapter}},lemma)) { if($a2.Count -ge $A2Target){break};$k=&$keyFor $item;if($used.Add($k)){$a2.Add($item)} }
if ($a1.Count -ne $A1Target -or $a2.Count -ne $A2Target) { throw "After lemma/POS normalization only $($a1.Count + $a2.Count) unique entries remain; inspect candidate pool before proceeding." }

$output=@(
  foreach($item in $a1){[pscustomobject]@{lemma=$item.lemma;pos=$item.pos;candidateLevel='A1';levelBasis='按课程先后/现有应用标记暂分；逐词CEFR待审';officialHeadwordFound=$item.official;officialPOS=$item.officialPOS;article=$item.article;courseUnits=$item.lessons;sourceVariants=$item.originalForms;sourceInflections=$item.sourceInflections;officialForms=$item.officialForms;zh=$item.zh;exampleNb=$item.exampleNb;exampleZh=$item.exampleZh;reviewStatus=if($item.official){'词头/词性已对照Ordbank；释义、等级、例句仍待审'}else{'词头/词性待人工核；其他字段待补'}}}
  foreach($item in $a2){[pscustomobject]@{lemma=$item.lemma;pos=$item.pos;candidateLevel='A2';levelBasis='按课程先后/现有应用标记暂分；逐词CEFR待审';officialHeadwordFound=$item.official;officialPOS=$item.officialPOS;article=$item.article;courseUnits=$item.lessons;sourceVariants=$item.originalForms;sourceInflections=$item.sourceInflections;officialForms=$item.officialForms;zh=$item.zh;exampleNb=$item.exampleNb;exampleZh=$item.exampleZh;reviewStatus=if($item.official){'词头/词性已对照Ordbank；释义、等级、例句仍待审'}else{'词头/词性待人工核；其他字段待补'}}}
)

$outPath=Join-Path $PSScriptRoot 'vocabulary-candidates-1400.csv'
$output | Export-Csv -LiteralPath $outPath -NoTypeInformation -Encoding utf8
$auditPath=Join-Path $PSScriptRoot 'vocabulary-candidate-normalization-audit.csv'
$resolved | Export-Csv -LiteralPath $auditPath -NoTypeInformation -Encoding utf8
$summary=@(
  '# 1,400 词候选总表（规范化工作版）'
  ''
  "- 当前规范化后唯一记录：$($output.Count)（A1 $($a1.Count) + A2 $($a2.Count)）。"
  "- Ordbank 精确词头匹配：$(@($output|Where-Object officialHeadwordFound -eq 'True').Count)；无精确词头的透明合成词、数词或待核项仍需人工检查。"
  "- 缺中文义项：$(@($output|Where-Object {-not $_.zh}).Count)；缺例句或译文：$(@($output|Where-Object {-not $_.exampleNb -or -not $_.exampleZh}).Count)。"
  '- A1/A2 仍为课程顺序工作分配，不是官方逐词 CEFR 等级；需要逐条教学审核。'
  '- Ordbank 形式用于形态核对；正式词条仍需选择常用规范形式，并添加独立中文义项、自然例句与准确译文。'
  '详细词形归并记录见 vocabulary-candidate-normalization-audit.csv。'
) -join [Environment]::NewLine
Set-Content -LiteralPath (Join-Path $PSScriptRoot 'VOCABULARY-CANDIDATES-1400.md') -Value $summary -Encoding utf8
Write-Output "Normalized candidate pool to $($output.Count) unique lexeme/POS rows (A1=$($a1.Count), A2=$($a2.Count)); official lemma matches=$(@($output|Where-Object officialHeadwordFound -eq 'True').Count)."
