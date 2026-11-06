# Additional flag patterns and facts

Verified **2026-11-06**. `src/quiz/flag-variants.js` exports **30 questions**: **8 TEXT_MULTIPLE**, **12 TEXT_SINGLE**, **5 TRUE_FALSE**, and **5 NUMBER_EXACT**. Every question has Portuguese and English text, revision 1, sources, a topic ID and country context; country IDs, labels and usable aliases come from `countries.json` with `isCountry: true`.

This is a bounded content expansion. It does not alter existing questions, integration, selection, rendering or tests. The existing `questions.js`, `country-clues.js`, `flag-expansion.js` and flag assertions in `boolean-expansion.js` were checked for duplicate facts before authoring. In particular, this module does not repeat the existing Nepal shape, Canadian maple leaf, New Zealand red-star description, Bhutan dragon identification, Swiss square, Vatican keys, Guatemala quetzal identification, Lebanese cedar, Maltese George Cross, or Kiribati frigatebird identification.

## Visual evidence and interpretation

All **197 principal-country flags** were rendered in labelled contact sheets: Africa 54, Europe 46, Asia 48, Americas 35, and Oceania 14. The bundled files in `public/flags/<iso2>.svg` match `src/data/flag-svgs.json` byte for byte for all 197 countries. The publisher is [flag-icons](https://github.com/lipis/flag-icons), and the [4:3 SVG collection](https://github.com/lipis/flag-icons/tree/main/flags/4x3) is a primary source for the exact artwork displayed by the game. It is a publisher’s collection rather than a legislative authority; no question depends on its standardised 4:3 display proportions.

Regional sets follow the existing `continente` field and principal-country catalogue, without silently substituting another classification. Thus Georgia is in the game’s Asia domain, Cyprus and Kosovo are in Europe, and the Americas combine North, Central and South America and the Caribbean. Territories outside the principal catalogue do not count.

Colour names describe design colours rather than individual rendered pixels: maroon/crimson shades count as red, and gold counts as yellow in the green–yellow–red group. Antialiasing, highlights and stroke rendering do not create new design colours. All symbols count for colour questions; no coat of arms is silently ignored. Current national designs are used, with a version bearing the coat of arms explicitly requested when civil and state variants differ.

## Complete answer sets

| ID suffix | Accepted ISO3 codes | Completeness and boundary checks |
| --- | --- | --- |
| `africa-crescents` | COM, DZA, LBY, MRT, TUN | These are the only crescent-bearing national designs among the 54 African principal countries. Other stars, suns, discs, wreaths and rings are not crescents. Western Sahara is outside this catalogue’s principal-country domain. |
| `europe-red-white-only` | AUT, CHE, DNK, LVA, MCO, POL | The only six European principal-country flags whose full designs use red and white alone. Latvia’s dark red is still red. Malta has silver-grey and black in the George Cross, so its full design does not meet the criterion; the Maltese government’s [graphical specifications](https://www.gov.mt/en/About%20Malta/Documents/Maltese%20Islands/National%20Flag%20Graphical%20Specifications.pdf) corroborate those extra colours. Georgia’s red-and-white design belongs to the game’s Asia domain, not Europe. |
| `oceania-southern-cross` | AUS, NZL, PNG, WSM | The four constellation-bearing flags among the 14 principal Oceanian countries. Tuvalu’s stars represent islands; Solomon Islands and Micronesian stars are also not this constellation. Brazil depicts the constellation but lies outside Oceania. |
| `oceania-birds` | FJI, KIR, PNG | Fiji’s shield contains a dove, Kiribati has a frigatebird, and Papua New Guinea has a bird-of-paradise. All 14 national designs were checked, including shield details; Vanuatu’s boar tusk and leaves are not birds. Separate coats of arms or Australian state flags do not count. |
| `africa-green-yellow-red-only` | BEN, BFA, CMR, COG, GIN, MLI, MRT, SEN | Every accepted flag uses all three colours and no fourth colour. Ghana and Guinea-Bissau add black stars, Ethiopia adds a blue emblem, Togo adds white, São Tomé and Príncipe adds black stars, and Zimbabwe adds black and white; all remaining African designs fail the same explicit criterion. Mauritania’s current red bands are included. `COG` is the Republic of the Congo, not `COD`, the Democratic Republic of the Congo. |
| `americas-birds` | BOL, DMA, ECU, GTM, MEX | Bolivia and Ecuador have condors in coats of arms, Dominica has a sisserou parrot, Guatemala a quetzal, and Mexico an eagle. The prompt explicitly counts versions bearing coats of arms, resolving Bolivia/Guatemala’s civil/state distinction. Of the other 30 designs, none has a bird on the national flag; the Bahamian coat-of-arms flamingo and the American national eagle are not on those countries’ national flags. |
| `europe-stars-including-arms` | BIH, HRV, MDA, SVN, UNK | Bosnia and Herzegovina and Kosovo have stars in their flag fields. Croatia has stars in the small heraldic shields above the chequered shield, Moldova has the eight-pointed star between the aurochs’ horns, and Slovenia has three six-pointed stars in its shield. All 46 national designs were inspected, including coat-of-arms details; dots, bezants, crosses, crown ornaments and the North Macedonian sun are not counted as stars. |
| `asia-bird-lion-dragon` | BTN, KAZ, LKA | The prompt defines the animal classes, rather than claiming to enumerate every possible animal motif: a whole bird, a lion, or a dragon. Bhutan’s dragon, Kazakhstan’s eagle and Sri Lanka’s lion qualify; Brunei’s isolated wings are not a whole bird, and interpretations of Mongolia’s Soyombo as two fish do not meet any requested class. All 48 Asian national designs were inspected. |

The eight groups have **3–8 answers**. Every set is complete for its stated criterion and domain, so the existing Easy/Medium/Hard quotas can safely ask for one, half rounded up, or all answers.

Primary official descriptions supporting the interpretation-sensitive groups:

- The Southern Cross is identified by the [Australian PM&C flag booklet](https://www.pmc.gov.au/resources/australian-flags-booklet/part-1-australian-national-flag), New Zealand’s [government encyclopedia Te Ara](https://teara.govt.nz/en/southern-cross/print), the [Papua New Guinea Embassy](https://pngembassy.org/flag.html), and [Samoa’s Government](https://www.samoagovt.ws/about-samoa/). Te Ara explicitly lists the five national flags worldwide, including Brazil, allowing a complete intersection with the Oceanian catalogue.
- [Fijian Foreign Affairs](https://www.foreignaffairs.gov.fj/fiji-embassy-in-brussels-belgium/fiji-flag/) explicitly identifies the dove in the shield; the [PNG Embassy](https://pngembassy.org/flag.html) identifies the bird-of-paradise. Kiribati’s complete visible configuration was already verified in `quiz-flags-provenance.md` and was rechecked in the local artwork.
- [Moldova’s Presidency](https://presedinte.md/eng/simbolurile-statului), [Slovenia’s Government](https://www.gov.si/en/topics/national-symbols/), and [Croatia’s flag and coat-of-arms law, Article 7](https://sredisnjikatalogrh.gov.hr/srce-arhiva/263/18315/www.nn.hr/clanci/sluzbeno/1990/1067.htm) identify the stars embedded in the coats of arms.
- [Kazakhstan’s Presidency](https://www.akorda.kz/ru/state_symbols/about_state_symbols) identifies the eagle, and the [Sri Lankan Government](https://www.gov.lk/sri-lanka/country-overview) identifies the lion holding a sword. The already-sourced Bhutan dragon was included only in this new complete group, not repackaged as another identification question.

## Individual identification questions

Each asks for one distinctive national flag, without making a fragile claim that it is the only country ever to use a given colour, object or symbol.

| ID suffix | Answer | Verification |
| --- | --- | --- |
| `south-africa-green-y` | ZAF | [South African Government flag description](https://www.gov.za/st/about-government/national-flag); the green Y and six-colour layout also match the local artwork. |
| `seychelles-radiating-bands` | SYC | [Seychelles Government national-symbols page](https://egov.sc/PressRoom/GovernmentAgencies/natcesym/natcesym.ASPX) names all five oblique bands. |
| `brazil-order-progress` | BRA | [Brazilian Presidency flag page](https://www.gov.br/planalto/pt-br/conheca-a-presidencia/biblioteca-da-pr/simbolos-nacionais/bandeira/bandeira-nacional) and the motto in the bundled SVG; this asks about the inscription rather than the earlier star group. |
| `dominica-sisserou` | DMA | [Dominica Government national-flag description](https://www.dominica.gov.dm/about-dominica/national-symbols/national-flag) identifies the sisserou parrot and red central disc. The answer entity is Dominica (`DMA`), rather than the Dominican Republic (`DOM`). |
| `mexico-eagle-cactus` | MEX | [Mexican Presidency flag-day account](https://www.gob.mx/presidencia/articulos/version-estenografica-dia-de-la-bandera-ciudad-de-mexico) describes the eagle, snake and cactus in the central coat of arms. |
| `albania-double-eagle` | ALB | [Albanian Constitution, Article 14, published by OSCE](https://www.osce.org/files/f/documents/3/2/41888.pdf) defines the red flag and black double-headed eagle. |
| `cyprus-map-olive` | CYP | [Cypriot Presidency state-symbols description](https://www.gov.cy/presidency/en/about/state-symbols/) identifies the copper-coloured map above olive branches. |
| `belize-two-figures` | BLZ | [Belize Ministry of Education and Culture’s official flag artwork](https://www.moecst.gov.bz/wp-content/uploads/2023/09/Belize-Flag.pdf) depicts the two human figures, shield, white disc, blue field and red bands. No claim about their ethnicity, occupation or number of world flags with human figures is made. |
| `cambodia-angkor-wat` | KHM | [Cambodian Foreign Affairs document containing the national flag](https://www.mfaic.gov.kh/files/uploads/RH6V72GCKAP2/Non-paper-for-EU-English-2.pdf) and the local SVG show the white temple on red between blue bands; the identification of Angkor Wat is also corroborated by the [Cambodian state news agency’s report of the culture minister’s remarks](https://www.akp.gov.kh/index.php/post/detail/340111). |
| `korea-taegeuk-trigrams` | KOR | [South Korean Ministry of the Interior and Safety](https://www.mois.go.kr/eng/sub/a03/nationalSymbol/screen.do) defines the taegeuk, white field and four black trigrams. |
| `mongolia-soyombo` | MNG | [Mongolian Presidency’s State Flag Day address](https://president.mn/en/2018/07/10/speech-by-president-of-mongolia-khaltmaagiin-battulga-at-the-state-flag-day-military-parade/) identifies the golden Soyombo; the local SVG confirms the red–blue–red layout and hoist-side placement. |
| `palau-golden-disc` | PLW | [Palauan Government flag description](https://www.palaugov.pw/about-palau/flag/) identifies the pale blue field, yellow circle and offset towards the hoist. The question relies on geometry and colours, without asserting a disputed historical explanation or comparing it with Japan. |

## True/false facts

| ID suffix | Answer | Primary basis |
| --- | --- | --- |
| `bangladesh-disc-centred` | False | [Bangladesh’s National Flag Rules, Foreign Affairs publication](https://file.mofa.gov.bd/uploads/17a82527-2d2c-43fa-a913-76a534396210/667/28a/b0a/66728ab0a55a7907618245.pdf) place the circle’s centre at 9/20 of the length from the hoist and halfway down the height. It is vertically centred but horizontally offset. |
| `jamaica-red-colour` | False | [Jamaican Prime Minister’s Office](https://opm.gov.jm/symbols/national-flag/) specifies black, green and gold, with no red. |
| `philippines-peacetime-order` | False | [Flag Code implementing rules, Section 15, Philippine Supreme Court E-Library](https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/10/40780) prescribe blue above red in peacetime and red above blue in wartime. The prompt explicitly refers to horizontal display from a flagpole, avoiding vertical-display left/right conventions. |
| `paraguay-two-sides` | True | [Paraguayan Foreign Affairs description](https://www2.mre.gov.py/embapar-ecuador/index.php/el-paraguay/datos-generales) identifies the star and Republic inscription on the obverse and lion with Peace and Justice on the reverse. The local SVG shows only the obverse, so the reverse fact is sourced to the official text rather than inferred from that artwork. |
| `lesotho-mokorotlo` | True | [SADC’s Corporate Identity Manual, Lesotho entry, printed p. 62](https://www.sadc.int/sites/default/files/2021-07/SADC_CORPORATE_IDENTITY_MANUAL.pdf) identifies the black Basotho hat/mokorotlo on the white band. |

## Numeric facts

| ID suffix | Exact answer | Source and limit |
| --- | --- | --- |
| `usa-star-count` | 50 stars | [USAGov](https://www.usa.gov/flag) describes the current fifty-star design. A change in the number of states would require rechecking this question. |
| `india-chakra-spokes` | 24 spokes | [Flag Code of India, Part I, paragraph 1.1](https://knowindia.india.gov.in/assets/doc/flagcodeofindia_070214.pdf) specifies 24 equally spaced spokes. This question does not rely on older material/manufacturing rules elsewhere in that edition. |
| `greece-stripe-count` | 9 stripes | [Greek Presidency](https://www.presidency.gr/en/presidency/the-flag/) specifies five blue and four white horizontal stripes. The canton does not create additional stripes. |
| `malaysia-stripe-count` | 14 stripes | [Malaysian Government](https://www.malaysia.gov.my/en/government/kenali-malaysia/flag-of-malaysia) specifies fourteen alternating red and white horizontal stripes, beginning red and ending white. This asks for stripes, not the already-discussed crescent or stars. |
| `china-star-count` | 5 stars | [Chinese Constitution, Article 141, official government English text](https://english.www.gov.cn/archive/lawregulations/201911/20/content_WS5ed8856ec6d0b3f0e9499913.html) specifies a five-star red flag; the artwork shows one large and four small yellow stars. |

Numeric entries explicitly set `fullCreditError: 0`, so one extra or missing star, stripe or spoke is not awarded full credit by the engine’s default percentage tolerance. Partial scoring still follows the existing engine.

## Source access and deliberate limits

- A direct fetch of the Cypriot Presidency page returned 403, while the search index supplied the official description; the local SVG independently confirms all visible details. The question makes no historical or etymological claim from that page.
- The initially discovered Samoan flag-law PDF returned 404, so the delivered source points to the live government country profile; Te Ara independently confirms the same Southern Cross identification.
- Some large official PDFs (notably the SADC manual) exceed the browser extraction limit. Relevant indexed page excerpts and visual descriptions were available and match the actual flags. Sources are linked to the primary publication, not an unaffiliated summary.
- A possible numeric question on Kyrgyzstan’s sun rays was omitted because source checks mainly found older descriptions around the 2023 drawing change. Afghanistan and Syria were also excluded from questions about current designs.
- Bird and star sets include small coat-of-arms details only where the prompt explicitly says so. This prevents civil/state and symbol-boundary assumptions from changing the accepted set silently.

## Standalone validation

All 30 entries pass the existing `validateQuestion`. IDs and Portuguese/English prompts are unique against the existing bank; every context and answer ID is a principal-country record. Every accepted Portuguese and English label was exercised through `evaluateSubmission`, each complete list was exercised at Easy/Medium/Hard thresholds, both boolean outcomes were checked, and each numeric target earned full credit while an answer one above the target earned less than full credit. No existing test file was changed.
