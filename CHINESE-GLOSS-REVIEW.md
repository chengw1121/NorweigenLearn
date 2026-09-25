# 中文释义人工语义校对

## 范围与口径

审核单位是应用主词库中的“词性 + 词头”条目，而不是仅按拼写去重的词数。清单从 `vocabulary-inventory.csv` 生成，合并应用核心词、V2 词库和 Fremtid 专题；同拼写但词性不同的条目分开审核。阅读文章里的释义若已对应主词库，不另重复计数；固定搭配/句子本身不算词条，后续遇到其中文提示问题时另行登记。

## 人工审核规则

每条中文释义需逐项判断：

1. 是否准确对应 Bokmål 词头、词性和词典/课程支持的核心义。
2. 多义词是否把常见义项分开，并说明怎样从搭配或句子语境判断；不把互不相关的同形词硬合成一个解释。
3. 是否适合初学者理解，中文自然、具体、不循环定义；避免堆砌近义词却不说明差异。
4. 名词是否区分实体、材料、类别/学科等用法；动词和短语是否说明必要的宾语、介词或固定搭配。
5. 核心释义与例句、译文、词形提示是否一致。若需要改释义，应用词库和审核清单必须同步。
6. 审核中若某个常见搭配或语义差别值得展示，从可靠在线词典/学习资源选取简短原句，人工翻译并记录来源；将原句、译文、使用提示和来源 URL 一并加入可轮换语境语料。

只有人工完成上述判断后，`reviewStatus` 才能设为“已人工审校”。自动字段齐全、词典链接存在或测试通过，都不算人工审校。

## 进度

- 主词库：1,497 个“词性 + 词头”审核单位。
- 已人工审校中文释义：501 / 1,497。
- 待审：996。
- 第一批（2026-09-25）：bolle、bytur、glass、is、katedral、ovn、tur。重点修正多义词和场景义提示。
- 第二批（2026-09-25）：barnehage、bekreftelse、bokhandel、gaffel、kake、katt、klasse、komfyr、kopp、pass、instrument、fødselsdag、fødselsdato、høyre（形容词）、ledig。重点处理制度语境、可数/量词差异、学校“班级”与“教室”区分，以及多义形容词的语境提示。
- 第三批（2026-09-25）：kjøledisk、kirke、park、gate、gågate、bagett、kjøkkenbenk、kniv、koke、lunsj、spisebord、tallerken、en（代词）、grav、falle、slå、dytte、veikryss、hjem（副词）、elske。重点厘清“koke”的主语/宾语用法、“slå”与på/av搭配、多义动词和同形词，以及名词的具体场景义。
- 第四批（2026-09-25）：holdeplass、kryss、lyskryss、passkontroll、postkontor、retning、sentrum、stasjon、til høyre、til venstre、vei、bestille、kilo、liter、matbu、med、ei、en（冠词）、småkake、møte（名词与动词分别登记）。重点说明地点/方向短语、单位词、多义介词和阴性名词冠词选择。
- 第五批（2026-09-25）：adresse、etternavn、min、vi、nummer、han、hun、jeg、kollega、administrasjon、kontor、norsk、jobb、slutte、jobbe、lære、besøk、besøke、bror、forelder、gift（形容词）、dame、gave、mann、venn、familie、barn、bestefar、bestemor、morfar、mormor、søster。重点校正姓名与地址、代词格、工作语义、亲属称谓以及同形词/句型歧义。
- 第六批（2026-09-25）：datter、gjest、gutt、invitere、jente、klem、kone、mamma、nabo、pappa、sammen、smile、sønn、far、kvinne、mor、navn、hverandre、treffe。重点区分年龄/亲属称谓、相互代词与“遇见/击中”等依宾语变化的动词义。
- 第七批（2026-09-25）：bad、balkong、benk、bilde、bokhylle、dyne、etasje、gardin、genser、hjørne、hylle、kjøleskap、klesskap、kommode、lenestol、lomme、madrass、møbel、salongbord、skap、skjørt、skrivebord、soverom、speil、stue、trapp、undertøy、vegg、vindu、bord、dør、hus、kjøkken、leilighet、rom、seng、stol。重点区分近义家具/空间词，以及房间、楼层、床品和“桌子/一桌饭菜”等语境义。
- 第八批（2026-09-25）：arbeide、forklare、jus、kamera、musikk、dit、fram、inn、høst、regn、sommer、vind、vinter、vær、vår、inventarliste、interiørbutikk、sofa。重点区分 jobbe/arbeide、dit/der、inn/inne、音乐不可数用法，以及天气、季节和家居商业词的语境义。
- 第九批（2026-09-25）：ja、nei、hm、vel、av、bare、brev、de、dere、derfor、dessuten、diskutere、du、for、forresten、fransk、gjerne、hallo、hei、hete、hilse、hjelp、hos、hva、hvilken、hvor、hvordan、ingen、ingenting。重点厘清否定/肯定回应、正式代词、介词结构、疑问词和语气副词；同时按词库分类复核 ingenting 是可独立使用的限定词类，不误标为代词。
- 补充在线语料（2026-09-25）：为 hallo、gjerne、dessuten、unnskyld、hvordan、nei、ingenting、du 各增补一条经人工翻译的 Bokmålsordboka 例句。语料以四项记录保留挪威语原句、中文译文、语用提示和官方来源链接；词汇练习会轮换显示，答案区提供来源链接。来源同时汇总在 `vocabulary-inventory.csv` 的 `exampleSources` 列。测试确保译文、提示与 HTTPS 官方词典来源齐全。
- 第十批（2026-09-25）：bagasje、bensinstasjon、bil、billett、buss、bussjåfør、bussrute、busstur、by（名词）、bytte、båt、dra、fly（名词）、flybuss、fra、jernbanestasjon、kart、kilometer、kjøre、koffert、kontrollere、lastebil、lufthavn、sjåfør、tog、reise（动词）。重点区分交通工具、行李集合名词、公交线路与时刻表、byen 的“城里”语境，以及同形名词/动词。
- 补充在线语料（2026-09-25）：为 bagasje、billett、bussrute、by、bytte、dra、fly（名词）、kart、kjøre、reise（动词）、tog 共 11 个词条增补经人工翻译和语境校对的 Bokmålsordboka 例句。每条记录包括原句、中文译文、用法提示和官方来源 URL，供词汇练习轮换显示；来源汇总至词汇盘点表。
- 第十一批（2026-09-25）：bagasjerom、flybillett、sykkel、sykle、parkeringsplass、dagsbillett、helårskort、sete、parkere、rute、sykling、hyttetur、tursekk、ryggsekk、sekk、guide、sjekke inn。重点说明行李舱与行李箱、机票与普通车票、骑行物件/动作/活动名词的区别；拆开 rute 的交通义和窗格义、sete 的座位/席位义；说明机场/住宿场景中的 sjekke inn。
- 补充在线语料（2026-09-25）：为 sykle、sykling、parkere、parkeringsplass、sete、rute 增补 6 条 Bokmålsordboka 支持的例句及中文译文；对词典原本以搭配片段呈现的例子，明确标记为依据词典搭配补成的完整句，不冒充原文。已记录具体词典链接与语境提示。
- 第十二批（2026-09-25）：storby、stikke、stanse、hjemover、bratt、snu、direkte、bort、hit、ned、tilbake。重点整理出行方向副词与视点（hit/bort/hjemover/tilbake）、stikke/stanse/snu 的句型和宾语差别，以及 bratt、direkte 在道路语境和引申语境中的含义。
- 补充在线语料（2026-09-25）：为上述 11 个词条各增补一条带中文翻译和语境提示的 Bokmålsordboka 例句/搭配句。对词典短语扩写为完整句的项目明确标注为改写；hit 与 bort 分别补充“朝说话者来”与“离开当前位置”的方向视角。
- 第十三批（2026-09-25）：aktivitet、beslutning、endring、glede、håp、løsning、framtid、forbedring、fokusere、forandre、forbedre、oppnå、spare。重点厘清名词在抽象义与具体场景义间的差别、名词性别选择、反身/及物结构，以及 spare 在“存钱/省钱”中的语境判断。
- 补充在线语料（2026-09-25）：为第十三批上述 13 个词条各加入 Bokmålsordboka 例句或基于词典搭配改写的完整句及人工译文。每条保留来源链接和用法提示，接入未来专题的语境轮换；不是词典完整原句的，提示中明确标出“根据词典搭配补成完整句”。
- 第十四批（2026-09-25）：forsett、framgang、fullføre、glede seg、innsats、karriere、motivasjon、nyttår、oppdage、opplevelse、plan、prioritere、reise。重点区分 forsett 与 nyttårsforsett、glede seg til/over、motivasjon 与理由、opplevelse 与经验、reise 名词与动词，以及 plan 的同形异词/异词性。
- 补充在线语料（2026-09-25）：为第十四批 13 个词条加入 14 条 Bokmålsordboka 语境例句（glede seg 提供 til/over 对照）及人工中文译文。词典搭配扩写为完整句时在提示中明示；来源链接、译文和语用说明随词条进入专题轮换语料，并纳入自动核对。
- 第十五批（2026-09-25）：energisk、fokusert、komme til å、kreativ、mer、motivert、neste、nær、om、om fem år、positiv、rolig、rutine。重点辨析未来预测与偶然发生、形容词分词搭配、数量/程度比较、下一个的时间顺序、om 的话题/时间含义，以及 rutine 的习惯/程序/熟练经验义；并备注 nær 在词典中的词类标注与专题介词用法。
- 补充在线语料（2026-09-25）：为第十五批 13 个词条各加入一条源自 Bokmålsordboka 词条例句/搭配的挪威语语境及人工译文。基于词典片段扩展成完整句的，已在提示中标出；词典例句、翻译、语境提示及来源链接纳入词汇练习轮换与测试。
- 第十六批（2026-09-25）：se for seg、skape、suksess、sunn、trene、tålmodig、utvikling、valg、vennskap。重点说明反身代词随主语变化、创造与引起的语义范围、成功作为结果、sunn 的健康/明智/稳健义、trene 的自我锻炼与训练他人之别、utvikling 不必然意味着进步、valg 的选择/选举义，以及 vennskap 与 venn 的区别；补充 utvikling 的 en/ei 性别变体。
- 补充在线语料（2026-09-25）：为第十六批 9 个词条各加入 Bokmålsordboka 例句或基于词典搭配扩写的完整句及中文翻译。词典原句与扩写句均附语境说明和官方来源；扩写情况会在提示中标明，并加入语料轮换及回归测试。
- 第十七批（2026-09-25）：bestå、søke、gitar、dyr（形容词）、helseforsikring、frimerke、kalle、måte、også、ringe、sende、takk、takke、unnskyld、vise。重点区分 bestå 的考试/存在/组成义，søke 的寻找/寻求/申请/前往结构，dyr 的形容词与动物名词，ringe 的响铃/按铃/打电话，takk 名词与礼貌回应，以及 kalle/takke/vise 的常见论元搭配；健康保险的实际保障须以保单为准。
- 补充在线语料（2026-09-25）：上述批次 14 个可由 Bokmålsordboka 直接支持的词条各加入例句、人工译文、语境提示与官方来源，覆盖核心动词详情卡和 V2 词汇卡；`helseforsikring` 未找到可靠的独立词典词条，因此只保留注明为自编的既有场景句，不冒充词典引文。
- 第十八批（2026-09-25）：høre、mene、skulle、ville、fortelle、snakke、spørre、si、til、forstå、sykehus、lukke、oppgave、pause、oi。重点讲清动词的论元结构、情态含义、交谈/言说类动词差异、介词 til 的多种关系，以及医院名词的冠词语境和 oi 的语用色彩。
- 补充在线语料（2026-09-25）：本批 15 个词条均加入经人工翻译的 Bokmålsordboka 例句/短句、语境提示和官方来源链接；动词例句进入核心动词语境列表，名词、介词及感叹词例句进入 V2 词条语境列表并可供词汇练习调用。回归测试核对每条挪威语原句、中文译文和来源链接。
- 第十九批（2026-09-25）：at、men、mens、og、eller、avis、selge、lås、låse。重点讲清从属连词与并列连词差别、mens 的时间/对比义，avis 的报刊/报社转指，selge 的常用补语，以及 lås 可用 en/et 两种性别、låse 与 låse opp/inn/ut 的结构关系。
- 补充在线语料（2026-09-25）：本批 9 个条目均增加 Bokmålsordboka 例句、人工中文译文、语境说明和来源链接；连接词例句特意覆盖时间、对比、转折、并列和选择，不用单一中文词硬对应。
- 第二十批（2026-09-25）：loff、forskjellig、alene、billig。厘清 loff 的白面包义与固定表达 på loffen，forskjellig 的形容词/副词用法，alene 的“独自”与“只有/不只有”句法，以及 billig 的价格义和贬义抽象用法。
- 补充在线语料（2026-09-25）：为本批 4 个词条加入 Bokmålsordboka 原例、人工翻译和语境说明；loff 的词典原例本身是短语片段，特意保留片段性质，不伪装成完整句子。
- 第二十二批（2026-09-25）：brun、grei、grønn、grå、gøy、heldigvis、hyggelig、ikke、interessant、kald。重点区分颜色词的隐喻/领域义、grei 的“清楚/好相处/可行”、gøy 的形容词与同形名词、ikke 的否定范围，以及 kald 的温度/态度/比赛状态义。
- 补充在线语料（2026-09-25）：为以上 10 个词条添加 Bokmålsordboka 例句或搭配片段、人工译文、语境提示与官方来源 URL；对 grått vær、ha brunt hår og brune øyne 等片段明确标注片段身份，对根据词典搭配补成完整句的项目明确注明扩写。
- 第二十三批（2026-09-25）：mobilnummer、hemmelig、kjempebra、kjempefin、kjempeflink、kjenne（动词）、koselig、lang、le（动词）、liten。重点厘清 mobilnummer 与 mobiltelefon 的指称差别、kjempe- 的口语强化功能、kjenne 的宾语/介词搭配、le 的愉快与嘲笑义，以及 liten 词形不规则和年龄义。
- 第二十四批（2026-09-25）：morsom、ny、nysgjerrig、rett、riktig、sann、stor、trist、trøtt、varm。重点区分“好笑/有趣/令人愉快”、“新物品/新加入/新变化”、“正确/合适/笔直”与同形名词义，以及描述人、事件或事物时中文义的变化；同时区分 trøtt 的疲倦、困倦、厌倦义和 varm 的温度、保暖、亲切义。rett 的中文释义按形容词义重写，不把名词“权利”误列为形容词义。
- 补充在线语料（2026-09-25）：为本批 10 个词条添加 Bokmålsordboka 例句/短语、人工中文翻译、语境说明与官方链接。Finne det rette ordet、En sann historie、En varm genser 保留词典原有短语片段身份并按短语翻译，不扩写或伪装成完整句。
- 第二十五批（2026-09-25）：en / ei / et、våken、tenke、flink、glad、god、kanskje、mål、kø、oppskrift。重点区分冠词与名词性别、våken 与 våkne、tenke 的结构义、flink 的技能/熟练义、glad for 与 glad i、god 的质量/能力/品格/充足义，以及 mål 的目标/进球/语言义。
- 补充在线语料（2026-09-25）：本批增加 9 条 Bokmålsordboka 例句或基于词典词义和搭配改写的完整练习句，逐条提供人工中文翻译、搭配说明及来源。`mål` 例句属于明确标注的自编扩展句，不冒充词典原句。
- 第二十六批（2026-09-25）：flott、bluse、bukse、jakke、klær、nøkkel、sko、telefon、vekkerklokke、humør。重点辨析 flott 的外观/表现/进展义，klær 的集合复数特征，bukse/sko 的服饰数量表达，nøkkel 的实物/工具/抽象义，telefon 的设备/通话/来电义，以及 humør 与 humor。
- 补充在线语料（2026-09-25）：本批 10 条均补入 Bokmålsordboka 例句或短语、中文翻译、用法提示和官方来源；词典短语保留短语形态，未伪装成完整句。`stille vekkerklokka på klokka halv sju` 特别说明挪威语 `halv sju` 是六点半。
- 第二十七批（2026-09-25）：fattig、bestemme、bety、brenne、dele、dusje、fortsette、hente、hoppe、klappe。重点区分贫乏与贫困，bestemme 与 bestemme seg，bety 的含义/结果/重要性，brenne 的自燃/使燃烧/热切投入，dele 的切分/分配/分享，以及 hente 的取回/接人结构；补充 hoppe over 的“略过”义和 klappe 的轻拍/鼓掌等搭配。
- 补充在线语料（2026-09-25）：本批为全部 10 个词条增加 Bokmålsordboka 例句/词组、人工翻译、搭配提示和来源。对于 `fattige mennesker som tigger på gata`、`dusje etter treningen` 等词典片段保留短语身份；其余例句按词典原文翻译。
- 第二十八批（2026-09-25）：løfte、rope、stoppe、synge、våkne、åpne、bruke、bære。重点说明 stoppe 的停止/填塞/织补多义，rope på 人与事物的结构差别，våkne 与 våken 的词性区别，åpne 的具体/营业/抽象义，以及 bruke 的使用/消耗/习惯义和 bære 的搬运/穿戴/承载义。
- 补充在线语料（2026-09-25）：本批 8 个词条均补入 Bokmålsordboka 支持的短句或短语、人工翻译、搭配提示和官方链接；短语 `våkne ved den minste lyd` 按片段翻译，其余选择词典原句并保留原有时态与语序。
- 补充在线语料（2026-09-25）：为高频动词 `gi`、`holde`、`kunne`、`løpe` 各补入 Bokmålsordboka 例句、逐句中文翻译、句型/搭配说明和官方来源链接；已加入 app 可调用的语境例句池，并加入自动核验。
- 补充在线语料（2026-09-25）：为 `måtte`、`hjelpe`、`se`、`ligge`、`sette`、`sitte`、`stå`、`finne` 各补入官方词典例句及人工译文、搭配/语义提示和来源链接；其中对比说明了放置动作 `sette`、坐着状态 `sitte`、平放/所在 `ligge`、竖放/位置 `stå`，并加入语料覆盖测试。
- 补充在线语料（2026-09-25）：为 A1 高频动词 `få`、`gå`、`ha`、`komme`、`ta`、`være`、`bli`、`gjøre` 补入官方词典例句、中文译文、搭配解释和来源；重点区分状态与变化、获得与使役、以及常见固定搭配，例句均纳入覆盖测试。
- 补充在线语料（2026-09-25）：为 `begynne`、`glemme`、`huske`、`vente`、`like`、`prøve`、`mat`、`dusj` 补入词典例句或明确标注改写的练习句及中文译文、词性/搭配提示和来源。特别标明 huske 的同形多义、mat 可指食物或一顿饭、dusj 的设备/房间/喷洒义，避免中文提示过度笼统。
- 复核同形重复词头 `mat`：核心名词卡和 V2 不可数名词卡是两个不同教学行，均单独记入审校台账；补齐核心卡官方例句来源，并明确该核心卡只练泛指 `mat` / 定指 `maten`，不把不存在的通用计数义混入。
- 补充在线语料（2026-09-25）：为 9 个有可核验词典例句/搭配的词条补入例句、人工译文、语境说明和官方来源；kjempeflink 的独立词典词条未收录，例句依据官方 flink 词条搭配扩写并明确标注。mobilnummer 未找到独立词典词条，故例句标记为自编练习语境，不伪装成在线引文。
- 第二十一批（2026-09-25）：blå、bra、dessverre、fin、fornøyd、fotball、fæl、gammel、ganske。重点区分 bra 的形容词/副词和健康义、fin 的非外貌用法、fornøyd 的满意/受够语义、fotball 的运动/球义、gammel 的年龄/陈旧/熟识义，以及程度副词 ganske 的语境强弱。
- 补充在线语料（2026-09-25）：为以上 9 个词条添加 Bokmålsordboka 例句或原始搭配片段、人工中文翻译、用法说明和官方词典链接；明确标出 `blå himmel og blått hav` 与 `et fælt syn` 等是词典短语片段而非完整句。新增来源校验允许官方站点的 `www` 与非 `www` 两种规范域名。
- 第二十九批（2026-09-25）：oppvaskmaskin、orden、ordne、vaskemaskin、legge、vaske、vekke、konge、kne、lår。重点细化家务动词与机器名词，说明 orden 的“秩序/顺序/正常”、ordne seg 的习语义，区分 legge（放置动作）与 ligge（状态）、vekke（叫醒他人）与 våkne（自己醒来），并核正 kne 的不规则复数 knær/knærne 及身体部位范围。
- 补充在线语料（2026-09-25）：为本批词条补入 Bokmålsordboka 的原句/短语、NTNU LearnNoW 教材例句及 NorwegianClass101/Preply 学习语境，逐条人工翻译并标注使用提示；词典例句片段保持片段身份。洗碗机与洗衣机场景例句的来源与官方词义词典链接分别记录，来源校验扩展到本批使用的大学教材和语言学习出版物。
- 第三十批（2026-09-25）：nakke、tunge、øre、øye、blod、hjerte、hånd、hår、nese、sminke。重点区分颈后与脖子/喉咙、舌头/语言/舌肉、耳朵与货币单位欧尔、眼睛与视力/固定搭配、不可数血液与引申义、头发集合义与单根毛发，以及名词/动词同形的 sminke；复核 øye、hender 等不规则复数和可变性别形式。
- 补充在线语料（2026-09-25）：十个词条均补入 Bokmålsordboka 例句或固定搭配片段，逐条提供人工中文翻译、语境提示和官方词典来源；片段保留片段身份，特别标注 øre 的货币义、tunge 的食物义、hår 的不可数用法及抽象固定搭配。
- 第三十一批（2026-09-25；10 个词头，11 个审核单位）：ansikt、feber、kropp、leve、dø、endelig（形容词、副词分别审核）、om、da、så、ettermiddag。重点扩展身体/症状名词的具体与引申义，说明 leve 的居住/谋生/生活结构、dø 的生命义与渐消义，区分 endelig 的副词与形容词用法、om 的介词与从属连词功能，以及 da、så 的时间、结果和语气功能；校正下午时间表达 i ettermiddag 与 om ettermiddagen。
- 补充在线语料（2026-09-25）：十项均补入 Bokmålsordboka 例句或搭配、人工翻译、按句法区分的语境说明和官方链接；明确标注词典原有短语片段，覆盖 endelig 的双词性、om 的条件/间接问句、da 的语气功能和 så 的先后/承接意义。
- 第三十二批（2026-09-25）：formiddag、forrige、først、første、gang、halv、klokke、kvart、minutt、snart、nå。重点校正时间词语义与挪威报时：halv ti 是 09:30，kvart på fire 是 15:45；区分 gang 的“次数/走廊”，snart 的“快要/几乎”，以及 først 的“首先/直到……才”。
- 补充在线语料（2026-09-25）：本批 11 个审核单位均新增 Bokmålsordboka 例句或明确标注为词典搭配片段的语境、人工译文、用法提示与可验证来源链接；例句覆盖上午时段、先后顺序、钟点表达和分钟用法。同步调整释义和例句来源列，并添加自动回归断言。
- 第三十三批（2026-09-25）：kvarter、meter、siden（副词）、sju、straks、time、dag、tid、kveld、morgen。重点厘清 kvarter 的时间义与街区/驻地义、siden 副词与从属连词/介词用法、time 的小时/课时/预约时段、dag 的白天/日期/问候义，以及 morgen/kveld 的时段搭配；依据词典将 sju 说明为数量限定词，并注明 syv 也是规范拼写。
- 补充在线语料（2026-09-25）：本批 10 项均补入 Bokmålsordboka 例句/原例片段、人工中文翻译、适合初学者的语境说明和官方链接；尤其标明时间差异（straks ti=快十点）、“两年前”结构 for ... siden，以及每15分钟的 bus hvert kvarter。
- 逐条状态、原释义、审校后释义、判断理由和词典来源：`chinese-gloss-review.csv`。

## 操作

- 更新主词库盘点：`node build-vocabulary-inventory.mjs`
- 刷新审核清单（会保留已审核记录）：`node build-chinese-gloss-review.mjs`
- 在线例句语境的记录格式为 `[挪威语, 中文译文, 语用提示, 来源URL]`；避免只贴原句而无准确整句译文或来源。
- 优先选用 Bokmålsordboka 的真实例句/搭配；若词典只提供片段，保留片段并在提示中说明，不补写成句后冒称原文。
- 词条来源和应用内容需以实际词库文件为准；清单用于跟踪人工审校，不会自动覆盖应用运行时数据。
