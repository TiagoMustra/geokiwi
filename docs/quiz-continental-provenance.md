# Continental geography variants — 2026-11-06

`src/quiz/continental-variants.js` exports **32 questions**: 20 `TEXT_MULTIPLE`, 4 `TEXT_SINGLE`, 6 `TRUE_FALSE`, and 2 `NUMBER_EXACT`. Prompts and concise explanations are original Portuguese/English wording. Lists are finite complete sets; country identity and accepted aliases come from the existing main-country catalog (`isCountry`), not territories.

## Equator and tropics

Definitions use [NOAA's latitude explainer](https://oceanservice.noaa.gov/facts/latitude.html). Country intersections were independently computed from the shipped **Natural Earth 5.1.2 Admin-0 geometry** (`src/data/world.json`): for every connected polygon, test whether its exterior-ring latitude range crosses the chosen parallel. The official upstream data is [Natural Earth](https://github.com/nvkelso/natural-earth-vector/tree/v5.1.2/geojson). Values ±23.436° were used for the tropics; rounding them to ±23.4° does not change the authored sets.

Crucial distinction: the Equator questions count **land**, including islands, **not territorial waters**. The generalized map returns ten land-crossing states. It omits the tiny Ilhéu das Rolas, so **São Tomé and Príncipe must be added**, yielding eleven. Its crossing was directly confirmed by [São Tomé and Príncipe's official tourism agency](https://turismo.gov.st/en/pourquoi-sao-tome-et-principe/nature/island-paradise) and the [Portuguese Navy historical archive's record of the Gago Coutinho Equator monument](https://arquivohistorico.marinha.pt/report/?ID=9933&Locale=pt&f=3&p=%2FArcheevo6_MarinhaAH%2FFrontOffice%2FPublic%2FMiscellaneous%2FDescriptionItemPublicReport). The main island itself is north of the line. Maldives and Kiribati lie on both sides but have no land directly on it; Equatorial Guinea also has separated northern and southern land, not land crossing 0°.

| Group | Complete accepted set (ISO3) |
| --- | --- |
| Equator, land worldwide | ECU COL BRA STP GAB COG COD UGA KEN SOM IDN |
| Equator, African land | STP GAB COG COD UGA KEN SOM |
| Equator, American land | ECU COL BRA |
| Capricorn, African land | NAM BWA ZAF MOZ MDG |
| Capricorn, American land | CHL ARG PRY BRA |
| Cancer, Asian main-country catalog | SAU ARE OMN IND BGD MMR CHN TWN |

The Cancer question explicitly refers to the game's main Asian catalog, which includes Taiwan (the Portuguese catalog currently labels it Ilha Formosa). No Cancer/Africa group is authored because Western Sahara's status and merged geometry make the criterion politically ambiguous. The Equator/Asia single answer is Indonesia.

Related Equator variants share `topicId: latitude:equator-land`; Borneo and Cancer/Asia variants also share their underlying fact's topic ID. The selection engine therefore avoids presenting different formats of that same subject in one run when alternatives exist.

## Landlocked sets

The full `landlocked` fields were fetched from the publisher's [Mledoze countries JSON](https://raw.githubusercontent.com/mledoze/countries/master/countries.json) on 2026-11-06, joined against the local `isCountry` catalog and game continent. Cross-check: [UN M49](https://unstats.un.org/unsd/methodology/m49/overview/) and the UN's [LLDC country list](https://www.un.org/en/landlocked/about-landlocked-developing-countries). The latter returned 403 to one direct crawler request, but its indexed text exposed the full list; the raw dataset and M49 table were accessible. No inference is made that all landlocked countries are developing countries.

- Africa (16): BDI BFA BWA CAF ETH LSO MLI MWI NER RWA SSD SWZ TCD UGA ZMB ZWE.
- Asia in the game's classification (12): AFG ARM AZE BTN KAZ KGZ LAO MNG NPL TJK TKM UZB.
- South America (2): BOL PRY.

A Caspian shore or navigable river is not an ocean coastline. No Europe/single-neighbour list was added: overseas borders such as Denmark–Canada require extra qualifications and the upstream `borders` field is incomplete there.

## Shared islands, lake shores, and regional groups

| Subject | Complete answer set | Primary evidence |
| --- | --- | --- |
| Borneo | BRN MYS IDN | [NASA Marshall's own caption](https://www.flickr.com/photos/nasamarshall/14556034397) identifies all three countries. |
| New Guinea | IDN PNG | [NASA Earth Observatory](https://science.nasa.gov/earth/earth-observatory/forest-change-on-new-ireland-papua-new-guinea-8842/) distinguishes the western Indonesian and eastern Papua New Guinean halves. |
| Hispaniola | HTI DOM | [NASA MODIS](https://modis.gsfc.nasa.gov/gallery/individual.php?db_date=2016-02-07) names Haiti in the west and the Dominican Republic in the east. |
| Isla Grande de Tierra del Fuego | CHL ARG | [ESA Sentinel-1D description](https://www.esa.int/ESA_Multimedia/Images/2025/11/Tierra_del_Fuego_by_Sentinel-1D) identifies the countries and strait. The question names the main island explicitly. |
| Lake Victoria shore | KEN UGA TZA | [Kenya Water Resources Authority](https://wra.go.ke/lake-victoria-south-basin-area/) distinguishes the three lakeshore states from the five-state drainage basin. |
| Lake Tanganyika shore | BDI COD TZA ZMB | [Lake Tanganyika Authority](https://lta-alt.org/en/contracting-countries/) explicitly names the four riparian contracting states. |
| Lake Titicaca | BOL PER | [Peru's UNESCO tentative-list submission](https://whc.unesco.org/en/tentativelists/5080/) places it between Peru and Bolivia; no claim that the site is inscribed World Heritage. |
| Lake Malawi/Niassa/Nyasa shore | MWI MOZ TZA | [FAO resource inventory](https://www.fao.org/4/t0473e/T0473E05.htm) states all three locations and the Tanzania shore. Both question and explanation distinguish the physical shore from disputed water jurisdiction. No border claim is endorsed. |
| Benelux | BEL NLD LUX | [Dutch government business portal](https://business.gov.nl/coming-to-the-netherlands/living-in-the-netherlands/economic-alliances-in-europe/) gives the complete group. |
| Baltic States | EST LVA LTU | [Latvian Ministry of Foreign Affairs](https://www.mfa.gov.lv/en/co-operation-among-baltic-states) names the three states; the question excludes the broader Baltic-coast interpretation. |
| Central Asia | KAZ KGZ TJK TKM UZB | [UN Statistics M49](https://unstats.un.org/unsd/methodology/m49/overview/) defines this exact five-country subregion. |

The Lesotho enclave question is supported by the [World Bank's Systematic Country Diagnostic](https://documents.worldbank.org/curated/en/371421468188678379/pdf/97812-CAS-P152099-IDA-SecM2015-0141-IFC-SecM2015-0055-PUBLIC-disclosed-7-2-15.pdf). The Gambia question uses its [own government description](https://gambia.gov.gm/about/), explicitly preserving its Atlantic opening; it is not described as an enclave or landlocked country.

## Validation

All 32 questions pass the current `validateQuestion`, have distinct IDs and bilingual prompts against the previous 414-record bank, and reference only `isCountry` identities. Single answers evaluate correctly in both languages. Every list was submitted through Easy, Medium and Hard quotas with success; aliases and normalized names are checked against existing accepted-answer logic. This module does not change the question index, UI, selection, or saved runs; the owning agent integrates it.
