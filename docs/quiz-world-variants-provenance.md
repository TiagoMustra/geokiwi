# Conhecimento geral — mixed world variants (2026-11-06)

32 original bilingual questions: 8 NUMBER_EXACT, 8 SLIDER_TIMELINE, 8 MAP_PINPOINT and 8 SLIDER_DISTANCE. The four other question-generation agents/modules are independent; this module changes no engine, UI or integration files.

All numeric questions retain the existing 0–100 proximity scoring; the historical type name NUMBER_EXACT does not imply an exact-answer game. All years are CE; the slider ranges cap at CURRENT_YEAR. All city pins use a 15 km tolerance and 500 km decay, matching existing city pin questions.

## Quantities and dates

| ID | Target | Primary verification and scope |
| --- | ---: | --- |
| world-panama-canal-length | 80 kilometres | [Panama Canal Authority · How the canal works](https://pancanal.com/en/history-of-the-panama-canal/) — Approximately how many kilometres long is the Panama Canal between the two oceans? |
| world-suez-canal-length-2015 | 193.3 kilometres | [Suez Canal Authority · Canal Characteristics](https://www.suezcanal.gov.eg/English/About/SuezCanal/Pages/CanalCharacteristics.aspx) — What overall length, in kilometres, does the Suez Canal Authority give for the canal’s 2015 configuration? |
| world-channel-tunnel-length | 50.5 kilometres | [Getlink · The Channel Tunnel infrastructure](https://www.getlinkgroup.com/en/our-group/eurotunnel/channel-tunnel/) — How many kilometres long is the Channel Tunnel in total, including its sections under land? |
| world-baikal-depth | 1,642 metres | [Limnological Institute · INTAS Project 99-1669, Morphometric Data](https://www.lin.irk.ru/intas_eng/morphometry.htm) — What is Lake Baikal’s maximum sounded depth, in metres, according to the INTAS bathymetry project? |
| world-titicaca-altitude | 3,810 metres | [SERNANP · Titicaca National Reserve](https://visitaareasnaturales.sernanp.gob.pe/en/anps/titicaca-national-reserve/) — Approximately how many metres above sea level is Lake Titicaca? |
| world-great-barrier-reef-length | 2,300 kilometres | [Great Barrier Reef Marine Park Authority · Our story](https://www.gbrmpa.gov.au/about-us/our-story) — Along approximately how many kilometres of Australia’s coast does the Great Barrier Reef extend? |
| world-victoria-falls-width | 1,708 metres | [Zambia Ministry of Tourism · Victoria Falls overview](https://www.mot.gov.zm/wp-content/uploads/2024/06/About-the-Ministry.pdf) — Approximately how many metres wide are Victoria Falls, from bank to bank? |
| world-bering-strait-width | 85 kilometres | [UC San Diego · Multiscale Ocean Dynamics, Bering Strait](https://www.mod.ucsd.edu/bering-strait) — Approximately how many kilometres wide is the Bering Strait between Russia and Alaska? |
| world-channel-tunnel-inauguration | 1,994 CE | [Getlink · HM Queen Elizabeth II and the opening of the Tunnel](https://www.getlinkgroup.com/en/queen-elizabeth/) — In which year was the Channel Tunnel inaugurated, linking Great Britain to continental Europe by rail? |
| world-yellowstone-established | 1,872 CE | [US National Park Service · Birth of a National Park](https://www.nps.gov/yell/learn/historyculture/yellowstoneestablishment.htm) — In which year was Yellowstone National Park established by law? |
| world-world-heritage-convention | 1,972 CE | [UNESCO World Heritage Centre · The World Heritage Convention](https://whc.unesco.org/en/convention) — In which year did UNESCO adopt the World Heritage Convention, combining cultural and natural heritage protection? |
| world-singapore-independence | 1,965 CE | [Singapore Ministry of Foreign Affairs · Histories and Milestones](https://www.mfa.gov.sg/about-mfa/histories-and-milestones/) — In which year did Singapore become an independent state, separating from Malaysia? |
| world-brasilia-inauguration | 1,960 CE | [Senado Federal · Brasília 50 anos, cronologia](https://www.senado.gov.br/noticias/especiais/brasilia50anos/not02.asp) — In which year was Brasília inaugurated, replacing Rio de Janeiro as Brazil’s capital? |
| world-gotthard-base-inauguration | 2,016 CE | [Canton Graubünden · Der Gotthard-Basistunnel ist eröffnet](https://www.gr.ch/DE/institutionen/verwaltung/diem/aev/aktuelles/aktuelles/Seiten/160606_gotthardtunnel.aspx) — In which year was the Gotthard Base railway tunnel inaugurated beneath the Swiss Alps? |
| world-amundsen-south-pole | 1,911 CE | [Fram Museum · The Third Fram Expedition 1910–1914](https://frammuseum.no/en/polar-history/expeditions/the-third-fram-expedition-1910-1914/) — In which year did Roald Amundsen’s expedition reach the geographic South Pole? |
| world-vasco-da-gama-calicut | 1,498 CE | [Marinha Portuguesa · Dia da Marinha](https://www.marinha.pt/pt/a-marinha/simbolos-tradicoes/Paginas/dia-da-marinha.aspx) — In which year did Vasco da Gama’s fleet reach Calicut on the first sea voyage from Portugal to India via the Cape of Good Hope? |

The Suez length is explicitly the official 2015 configuration (193.30 km), not a timeless engineering claim or the sum of parallel bypass lengths. The Panama figure follows the operator’s approximate 80 km definition. Channel Tunnel total length (50.5 km) includes land sections and is not confused with its shorter underwater section; its inauguration is distinguished from the later commercial-service start dates. Both Tunnel facts share topicId world:channel-tunnel to avoid asking both in one run when alternatives exist.

Lake Baikal uses the Limnological Institute / INTAS 99-1669 project’s measured 1,642 m maximum depth, not older 1,637 m values found in some institutional summaries. Titicaca is an approximate altitude, not a constant water-level measurement. Victoria Falls asks for width (1,708 m), not height or a disputed largest-waterfall ranking. Bering Strait uses the approximately 85 km value from the UC San Diego oceanography project.

The Gotthard canton page had a full-page fetch timeout during verification, but the indexed primary excerpt explicitly confirmed the 2016 opening. The original project opening booklet also identifies 1 June 2016: [AlpTransit opening booklet](https://www.alptransit-portal.ch/Storages/User/Meilensteine/Pin_051/Dokumente_051/Gottardo_2016_Booklet_RZ_GzD_0505_ENG_WEB.pdf). Only that inauguration date is claimed; no unsupported service-start assertion is retained.

## Coordinate provenance

Coordinates were extracted on 2026-11-06 from the actual Point geometry in the versioned [Natural Earth v5.1.2 populated-places GeoJSON](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_populated_places_simple.geojson). These are not the alternative longitude/latitude label properties, which differ slightly for some cities. Natural Earth data is public domain. Existing endpoints reuse the project’s previously verified Natural Earth point catalogue. No user or external service call is required during a game.

| Pin city | Longitude | Latitude | Country |
| --- | ---: | ---: | --- |
| Reykjavík | -21.936546 | 64.143459 | Iceland |
| Quito | -78.501997 | -0.213042 | Ecuador |
| Ushuaia | -68.310001 | -54.790003 | Argentina |
| Honolulu | -157.858301 | 21.303429 | United States |
| Santiago | -70.650504 | -33.440205 | Chile |
| Kathmandu | 85.314696 | 27.718638 | Nepal |
| Wellington | 174.777201 | -41.292068 | New Zealand |
| Oslo | 10.748033 | 59.918636 | Norway |

Two additional distance-only endpoints from the same source: Lhasa [91.100010, 29.645024] and Madrid [-3.685297, 40.401972]. All country IDs resolve to isCountry records. No disputed-state, dependent-territory or coastline-selection assumption is introduced. Pins ask for city centres, not arbitrary points representing broad natural areas.

## Selected city distances

Great-circle distances are computed from those coordinates using the engine’s mean Earth radius 6,371.0088 km, then rounded to the kilometre. They do not claim to be road, scheduled-flight or tunnel distances. The selection uses near-antipodes, South/North Atlantic crossings, the Pacific and mountain regions; it is not an all-pairs combinatorial expansion.

| Pair | km |
| --- | ---: |
| quito-singapore | 19,727 |
| wellington-madrid | 19,852 |
| ushuaia-cape-town | 6,795 |
| honolulu-tokyo | 6,201 |
| reykjavik-oslo | 1,746 |
| santiago-buenos-aires | 1,133 |
| kathmandu-lhasa | 604 |
| lisbon-reykjavik | 2,949 |

## Validation

Standalone checks passed: all 32 validateQuestion contracts, unique IDs and PT/EN prompts against the existing bank, all country IDs known sovereign-country records, exact trusted targets score 100, city coordinates equal the source Point geometries, and all eight rounded distances recompute correctly and fit the 0–20,037 km slider.
