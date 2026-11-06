# Timeline question provenance

The 30 questions in `src/quiz/history-expansion.js` were checked on **2026-11-06** against the institutional primary sources linked below. Wording is original in Portuguese and English. Each answer is a specific calendar year, with zero answer tolerance; proximity scoring is handled by the quiz engine. The range maximum is resolved from `CURRENT_YEAR` at runtime.

“Primary” here includes the responsible institution’s own historical account, national archives, government scientific agencies, monument operators, UNESCO’s official heritage records, and an archived treaty text. Country identifiers are existing numeric-string IDs from `src/data/countries.json`; no identifier is assigned to the former Soviet Union or to multinational organizations.

| Question ID | Year | Verification and source |
| --- | ---: | --- |
| `timeline-apollo-11` | 1969 | First crewed lunar landing; [NASA mission overview](https://www.nasa.gov/missions/apollo/apollo-11/apollo-11-mission-overview/). |
| `timeline-gagarin` | 1961 | First human spaceflight, 12 April; [NASA](https://science.nasa.gov/resource/yuri-gagarin-first-human-in-space/). |
| `timeline-sputnik` | 1957 | Launch of the first artificial satellite, 4 October; [NASA history](https://www.nasa.gov/history/65-years-ago-sputnik-ushers-in-the-space-age/). |
| `timeline-iss-zarya` | 1998 | Launch of the first ISS module, 20 November; [NASA module record](https://www.nasa.gov/international-space-station/zarya-module/). |
| `timeline-hubble-launch` | 1990 | Launch on 24 April; deployment on 25 April; [NASA timeline](https://science.nasa.gov/mission/hubble/overview/hubble-timeline/hubble-history-timeline-full-text/). |
| `timeline-un-founding` | 1945 | Charter entry into force, 24 October; [United Nations Charter](https://www.un.org/en/about-us/un-charter). |
| `timeline-maastricht-force` | 1993 | Entry into force on 1 November, rather than the 1992 signing; [Council treaty register](https://www.consilium.europa.eu/en/documents/treaties-agreements/agreement/?docLanguage=en&id=1992004). |
| `timeline-euro-cash` | 2002 | Physical cash introduction, distinct from the 1999 currency launch; [European Central Bank](https://www.ecb.europa.eu/euro/intro/html/index.en.html). |
| `timeline-schengen-checks` | 1995 | First abolition of internal checks, 26 March; [Council of the EU booklet, introduction](https://www.consilium.europa.eu/media/37791/20177547_qc0717127enn_pdf.pdf). |
| `timeline-brexit-withdrawal` | 2020 | Formal withdrawal on 31 January, distinct from the referendum; [Council of the EU](https://www.consilium.europa.eu/en/brexit/). |
| `timeline-panama-canal` | 1914 | Inauguration on 15 August with SS Ancon; [Panama Canal Authority](https://pancanal.com/en/history-in-pictures-107-years-of-the-panama-canal/). |
| `timeline-suez-canal` | 1869 | Inauguration on 17 November; [Suez Canal Authority history](https://www.suezcanal.gov.eg/English/About/SuezCanal/Pages/CanalHistory.aspx). |
| `timeline-us-declaration` | 1776 | Congressional adoption on 4 July, not a claim that every signature occurred that day; [US National Archives](https://www.archives.gov/founding-docs/declaration/how-did-it-happen). |
| `timeline-canada-confederation` | 1867 | Creation of the Dominion on 1 July; [Government of Canada](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/canadas-history.html). |
| `timeline-australia-federation` | 1901 | Six colonies federated on 1 January; [National Museum of Australia](https://www.nma.gov.au/defining-moments/resources/federation). |
| `timeline-waitangi-signing` | 1840 | First signing on 6 February; later signings continued; [Manatū Taonga, NZ History](https://nzhistory.govt.nz/politics/treaty/making-the-treaty/signing-the-treaty). |
| `timeline-mandela-inauguration` | 1994 | Inauguration on 10 May, after the April elections; [South African Government](https://www.gov.za/issues/20years/milestones-20-years-freedom). |
| `timeline-carnation-revolution` | 1974 | Revolution on 25 April; [Assembleia da República](https://www.parlamento.pt/Parlamento/Paginas/construcao-democracia_1974-1976.aspx). |
| `timeline-tordesillas-treaty` | 1494 | Treaty concluded on 7 June; [Yale Avalon transcription](https://avalon.law.yale.edu/15th_century/mod001.asp). |
| `timeline-lisbon-earthquake` | 1755 | Earthquake and tsunami on 1 November; [IPMA tsunami leaflet](https://www.ipma.pt/pt/media/noticias/documentos/2021/Folheto_Tsunami.pdf). |
| `timeline-krakatoa-eruption` | 1883 | Catastrophic eruption in August; [US Geological Survey](https://www.usgs.gov/news/volcano-watch-mixing-magmas-krakatau). |
| `timeline-vesuvius-pompeii` | 79 | Common Era year of the destructive eruption; [Italian Civil Protection Department](https://www.protezionecivile.gov.it/en/approfondimento/eruptive-history/). |
| `timeline-colosseum-inauguration` | 80 | Common Era inauguration year; [Parco archeologico del Colosseo museum record](https://colosseo.it/en/opere/elevators-and-platforms-or-the-machinery-behind-the-show/). |
| `timeline-sydney-opera-opening` | 1973 | Official opening on 20 October; [Sydney Opera House](https://www.sydneyoperahouse.com/our-story/50-years-extraordinary-moments). |
| `timeline-statue-liberty-dedication` | 1886 | Dedication on 28 October; [US National Park Service](https://www.nps.gov/npnh/learn/news/fact-sheet-stli.htm?fullweb=1). |
| `timeline-burj-khalifa-inauguration` | 2010 | Official inauguration on 4 January; [Burj Khalifa operator](https://www.burjkhalifa.ae/the-tower/making/). |
| `timeline-cn-tower-public-opening` | 1976 | Public opening on 26 June, distinct from structural completion in 1975; [CN Tower](https://www.cntower.ca/history). |
| `timeline-taj-mahal-mausoleum` | 1648 | Main mausoleum completion, distinct from the 1653 ancillary works; [UNESCO record](https://whc.unesco.org/en/list/252/). |
| `timeline-sagrada-familia-cornerstone` | 1882 | Cornerstone laid on 19 March, before Gaudí took over in 1883; [Sagrada Família](https://sagradafamilia.org/en/history-of-the-temple/). |
| `timeline-golden-gate-opening` | 1937 | Pedestrians admitted 27 May and vehicles 28 May; [Golden Gate Bridge District chronology](https://www.goldengate.org/bridge/history-research/moments-events/key-dates/). |

## Boundaries and ambiguity checks

- The existing `timeline-berlin` and `timeline-eiffel` questions are outside this expansion and are not duplicated here.
- The Vesuvius question deliberately asks only for the year: discussion of the precise eruption date does not affect AD 79. Both ancient questions explicitly say Common Era to distinguish them from BCE years.
- The Taj Mahal prompt names the main mausoleum and attributes the date to UNESCO, avoiding the common 1648/1653 ambiguity for different parts of the complex.
- The CN Tower prompt asks for admission of the public; its construction completion date is a different year. Sydney’s prompt specifies the official opening, since performances preceded that ceremony.
- Schengen’s signing, implementation, and later expansions are separate events. The prompt fixes the first removal of internal checks in seven countries.
- Australia’s question concerns federation, rather than an overly broad claim of full independence. Waitangi’s question concerns the first signing without making a contested interpretation of the treaty’s legal meaning.
- The Suez history page has an isolated “1969” typographical error in its later development section. Its introduction and inauguration section repeatedly give 1869; the authority’s [FAQ](https://www.suezcanal.gov.eg/English/Pages/FAQ.aspx) independently confirms the first opening in November 1869.

Verification: all 30 records imported successfully; each has unique IDs, both locales, a supported source URL, valid existing country IDs, the required schema fields, and an answer inside its declared timeline range. No UI, engine, or publishing files were changed for this content expansion.
