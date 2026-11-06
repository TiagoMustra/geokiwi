# Numeric question expansion

Verified on **2026-11-06**. The exported `numberExpansion` bank contains **33** bilingual questions: 12 population estimates, six country areas, 10 other dimensions/distances and five counts. Each resolved question has its own source links, unit, non-negative bounds, target value, country IDs and verification date.

All use the existing `NUMBER_EXACT` storage identifier. The gameplay engine awards points by proximity; this identifier does not ask the player to reproduce a published figure digit for digit. Targets retain the source precision so the display and scoring can choose their own precision without altering the underlying fact.

## Population: World Bank, 2024

The 12 values were read from the downloaded primary World Bank API response for `SP.POP.TOTL`, requested for 2024. All observations are non-null, have `date: "2024"`, and are attributed to the ISO3 country identifiers below. The response reports WDI `lastupdated: "2026-10-08"`. Question wording explicitly names the World Bank and 2024; the explanation distinguishes an estimate from a census count.

The [World Bank indicator definition](https://databank.worldbank.org/metadataglossary/world-development-indicators/series/SP.POP.TOTL) defines these as midyear population estimates. The bank is a distributor of demographic data from the UN, national statistical offices and Eurostat; the questions do not attribute the values to a particular national census.

[Reproduce the population API query](https://api.worldbank.org/v2/country/PRT;BRA;IND;CHN;USA;JPN;NGA;DEU;NZL;CAN;IDN;MEX/indicator/SP.POP.TOTL?date=2024&format=json&per_page=100). Each question also links to an individual-country API request.

| Question ID suffix | Country | ISO3 | Country ID | People | Reference year |
| --- | --- | --- | --- | ---: | ---: |
| `population-prt-2024` | Portugal | PRT | 620 | 10,694,681 | 2024 |
| `population-bra-2024` | Brazil | BRA | 076 | 211,998,573 | 2024 |
| `population-ind-2024` | India | IND | 356 | 1,450,935,791 | 2024 |
| `population-chn-2024` | China | CHN | 156 | 1,408,975,000 | 2024 |
| `population-usa-2024` | United States | USA | 840 | 340,003,797 | 2024 |
| `population-jpn-2024` | Japan | JPN | 392 | 123,975,371 | 2024 |
| `population-nga-2024` | Nigeria | NGA | 566 | 232,679,478 | 2024 |
| `population-deu-2024` | Germany | DEU | 276 | 83,516,593 | 2024 |
| `population-nzl-2024` | New Zealand | NZL | 554 | 5,290,000 | 2024 |
| `population-can-2024` | Canada | CAN | 124 | 41,262,329 | 2024 |
| `population-idn-2024` | Indonesia | IDN | 360 | 283,487,931 | 2024 |
| `population-mex-2024` | Mexico | MEX | 484 | 130,861,007 | 2024 |

## Country areas

Five questions use the downloaded World Bank `AG.SRF.TOTL.K2` observations for 2023, also from the WDI release updated on 2026-10-08. [The indicator definition](https://databank.worldbank.org/metadataglossary/world-development-indicators/series/AG.SRF.TOTL.K2) includes inland water and some coastal waterways, and identifies FAO as the supplying agency. The wording says surface area rather than dry land area.

[Reproduce the originally requested surface area query](https://api.worldbank.org/v2/country/PRT;BRA;AUS;CAN;JPN;NZL/indicator/AG.SRF.TOTL.K2?date=2023&format=json&per_page=100).

| Question ID suffix | Country | km² | Reference year | Source |
| --- | --- | ---: | ---: | --- |
| `surface-area-prt-2023` | Portugal | 92,230 | 2023 | World Bank |
| `surface-area-bra-2023` | Brazil | 8,510,420 | 2023 | World Bank |
| `surface-area-aus-2023` | Australia | 7,741,220 | 2023 | World Bank |
| `surface-area-jpn-2023` | Japan | 377,969.3 | 2023 | World Bank |
| `surface-area-nzl-2023` | New Zealand | 267,710 | 2023 | World Bank |
| `surface-area-canada` | Canada, land and freshwater | 9,984,670 | — | [Statistics Canada, Geography](https://www150.statcan.gc.ca/n1/pub/11-402-x/2012000/chap/geo/geo-eng.htm) and [land/freshwater table](https://epe.lac-bac.gc.ca/100/205/301/statcan/canada_e-book-ef/05-01-21/www.statcan.ca/english/Pgdb/phys01.htm?nodisclaimer=1) |

**Rejected observation:** the downloaded World Bank response returned 15,634,410 km² for Canada in 2023. This conflicts substantially with the national statistical source and was not incorporated. The Canada replacement explicitly names Statistics Canada, specifies land plus freshwater, and is not labelled as a World Bank or 2023 observation. Its source is the archived Canada Year Book geography chapter; the same figure also appears in the [current federal conserved areas methodology](https://www.canada.ca/en/environment-climate-change/services/environmental-indicators/conserved-areas.html), which distinguishes terrestrial and marine territory.

## Other dimensions, distances and counts

| Question ID suffix | Sourced target | Scope and primary source |
| --- | ---: | --- |
| `earth-moon-distance` | 384,400 km | Mean distance, [NASA Moon Facts, Size and Distance](https://science.nasa.gov/moon/facts/). The longer distance deliberately uses numeric entry, outside the distance slider’s 20,037 km range. |
| `earth-equatorial-circumference` | 40,075 km | Equatorial circumference, [NASA rotation discussion](https://www.nasa.gov/space-science-and-astrobiology-at-ames/interesting-fact-of-the-month-current/interesting-fact-of-the-month-2020/) and the equator row on page 44 of the [NASA Moon/Earth worksheet](https://www.nasa.gov/pdf/475486main_HEP_I_MS_6.pdf). Numeric entry, not the distance slider. |
| `grand-canyon-length` | 446 km | River course from Lees Ferry to Grand Wash Cliffs, explicitly specified in the [NPS FAQ](https://www.nps.gov/grca/faqs.htm). |
| `eiffel-tower-height-2022` | 330 m | Height following the antenna installation on 15 March 2022, [official Eiffel Tower history of its height](https://www.toureiffel.paris/en/news/history-and-culture/300-330-meters-story-towers-height). `referenceYear: 2022`. |
| `burj-khalifa-height` | 828 m | Architectural height, including spire, [Council on Vertical Urbanism measurement database](https://www.skyscrapercenter.com/building/burj-khalifa/3-2). The question specifies this measurement convention. |
| `tokyo-skytree-height` | 634 m | Total height, [tower operator’s specifications](https://www.tokyo-skytree.jp/about/spec/). |
| `golden-gate-main-span` | 1,280 m | Span between the towers, [bridge district’s construction statistics](https://www.goldengate.org/bridge/history-research/statistics-data/design-construction-stats/). This is distinct from the full bridge and approaches. |
| `kilimanjaro-elevation` | 5,895 m | Highest point above sea level, [UNESCO property record](https://whc.unesco.org/en/list/403/). |
| `mount-fuji-elevation` | 3,776 m | Summit elevation rounded as published in the [UNESCO property record](https://whc.unesco.org/en/list/1418/). |
| `denali-elevation` | 6,190 m | Highest summit above sea level, [NPS interpretive site record](https://www.nps.gov/places/dena-mile-11.htm). Both Denali and Mount McKinley are included as names. |
| `canadian-provinces` | 10 provinces | Excludes the three territories, [Government of Canada explanation](https://www.canada.ca/en/intergovernmental-affairs/services/provinces-territories.html). |
| `swiss-cantons` | 26 cantons | [Swiss Federal Department of Foreign Affairs, Federalism](https://www.aboutswitzerland.eda.admin.ch/en/federalism). |
| `japan-islands-2023` | 14,125 islands | [GSI counting criteria](https://www.gsi.go.jp/kihonjohochousa/islands_index.html) and its [28 February 2023 announcement](https://svd1-web1.gsi.go.jp/kihonjohochousa/pressrelease20230228.html). The underlying map is dated January 2022, so `referenceYear` is 2022, while the prompt states the release year 2023. |
| `philippines-islands` | 7,641 islands | Count attributed explicitly to the [Philippine Department of Tourism](https://www.tourism.gov.ph/article/island-hopping-0-21/), whose primary page was verified via indexed text (direct fetch returned 403). No tidal or detailed survey definition is inferred. |
| `fiji-islands` | 333 islands | Count attributed explicitly to [Tourism Fiji’s Discover Fiji guide](https://www.fiji.travel/things-to-know/destination-guide/discover-fiji), rather than presented as a universal counting standard. |

### Definitions and discrepancies retained in the wording

- The NPS FAQ gives the specifically bounded Grand Canyon course as 277 river miles / 446 km. The [NPS statistics page](https://www.nps.gov/grca/learn/management/statistics.htm) currently lists 278 miles / 447 km for its park/river length. The question uses the FAQ’s named endpoints and cites that page; these published scopes are not silently merged.
- Burj Khalifa’s measurement database distinguishes 828 m architectural height from 829.8 m to the technical tip. Only architectural height is asked.
- The GSI count follows its legal and cartographic criteria, uses the January 2022 map, generally screens naturally formed coastal land by perimeter, and excludes islands in lakes. It is not interchangeable with counts using other thresholds.
- Tourism Fiji and the Philippine Department of Tourism publish the two island counts used here, but do not supply a mutually comparable counting method on these pages. Both questions name the reporting body.
- The existing CN Tower and Swedish island questions are not duplicated in this expansion.
