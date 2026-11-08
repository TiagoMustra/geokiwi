# Flag-colour combinations — 2026-11-09

26 new bilingual TEXT_MULTIPLE questions, scoped to the existing country/continent catalogue. No dependent territories. Curated answer sets are authored in `src/quiz/flag-colors.js`; they are not inferred from SVG hex codes (which would incorrectly count shadows and tiny crest colours).

Two explicit rules appear in every prompt: **contains** allows additional colours; **only** requires exactly the named colour families. Coats of arms, state crests and seals (including their own lettering) are ignored, but separate backing panels/discs remain. Fine outline strokes are excluded: Cambodia’s embassy specification lists blue/red/white even though some drawings outline Angkor Wat in black. Other filled devices, stars, crosses, borders, stripes and canton flags count. Gold is yellow; maroon/crimson is red; orange is separate. France qualifies for Europe RWB, Portugal does not qualify from colours inside its shield. Belize and Haiti retain white backing panels. Liechtenstein's standalone crown counts as yellow. Uganda's white backing disc counts. Zambia's orange does not count as yellow. Brunei's red state crest is ignored. Qatar's maroon qualifies under the expressly stated shade convention.

Sources: [UN Vienna Protocol flag overview](https://www.unvienna.org/uploads/protocol/res/generic-information_html/A-Z_Flags_external.pdf), [provenance supplied by Permanent Missions](https://www.unvienna.org/protocol/en/useful-resources.html), [flag-icons publisher SVG collection](https://github.com/lipis/flag-icons/tree/main/flags/4x3), [Qatar Amiri Diwan](https://www.diwan.gov.qa/en/about-qatar), [current Syrian flag, Ministry of Culture](https://events.moc.gov.sy/en/about-flag), [Uganda Foreign Affairs](https://canberra.mofa.go.ug/node/167), [Eswatini government](https://gov.sz/index.php/national-symbols), [Zambia State House](https://www.sh.gov.zm/national-symbols/).

The UN overview is a broad visual reference, not a guarantee that every flag is current: its Syria and Mauritania entries are outdated. These authored sets use Syria's green/white/black flag with red stars and Mauritania's red bands. The matching current publisher SVGs and individual authorities take precedence. The overview does not determine game continent assignments or recognition.

Existing saves and records retain their IDs and keys. New questions join the unseen-first pool and retain all difficulty quotas and proportional partial scoring. All questions, criteria and answers are included in the regular MD/JSON bank downloads.

Cambodian outline convention: [official embassy specifications, hosted by ASEAN](https://asean.org/wp-content/uploads/2020/10/flagspec_Cambodia-Flag-specifications.pdf).

## Authored combinations and answer sets

- **flag-colors-europa-red-white-blue-contains** (12): Chéquia, França, Reino Unido, Croácia, Islândia, Luxemburgo, Países Baixos, Noruega, Rússia, Sérvia, Eslováquia, Eslovénia.
- **flag-colors-africa-green-yellow-red-contains** (23): Benin, Burkina Faso, República Centro-Africana, Camarões, Congo, Comores, Eritreia, Etiópia, Gana, Guiné, Guiné-Bissau, Mali, Moçambique, Mauritânia, Maurício, Namíbia, Senegal, Sudão do Sul, São Tomé e Príncipe, Seicheles, Togo, África do Sul, Zimbabwe.
- **flag-colors-oceania-red-white-blue-contains** (6): Austrália, Fiji, Kiribati, Nova Zelândia, Tuvalu, Samoa.
- **flag-colors-americas-red-white-blue-contains** (11): Antígua e Barbuda, Belize, Chile, Costa Rica, Cuba, República Dominicana, Haiti, Panamá, Paraguai, Estados Unidos, Venezuela.
- **flag-colors-asia-red-white-contains** (33): Emirados Árabes Unidos, Azerbeijão, Bahrein, Geórgia, Indonésia, Irão, Iraque, Jordânia, Japão, Camboja, Coreia do Sul, Kuwait, Laos, Líbano, Maldivas, Myanmar, Malásia, Nepal, Omã, Filipinas, Coreia do Norte, Palestina, Catar, Singapura, Síria, Tailândia, Tajiquistão, Turquemenistão, Timor-Leste, Turquia, Ilha Formosa, Uzbequistão, Iémen.
- **flag-colors-asia-green-white-contains** (18): Emirados Árabes Unidos, Azerbeijão, Índia, Irão, Iraque, Jordânia, Kuwait, Líbano, Maldivas, Myanmar, Omã, Paquistão, Palestina, Arábia Saudita, Síria, Tajiquistão, Turquemenistão, Uzbequistão.
- **flag-colors-africa-blue-white-contains** (16): Botswana, República Centro-Africana, Comores, Cabo Verde, Djibouti, Gâmbia, Guiné Equatorial, Libéria, Lesoto, Namíbia, Serra Leoa, Somália, Sudão do Sul, Essuatíni, Seicheles, África do Sul.
- **flag-colors-africa-green-yellow-blue-contains** (12): República Centro-Africana, Comores, Eritreia, Etiópia, Gabão, Maurício, Namíbia, Ruanda, Sudão do Sul, Seicheles, Tanzânia, África do Sul.
- **flag-colors-africa-red-black-white-contains** (10): Egito, Quénia, Líbia, Moçambique, Sudão, Sudão do Sul, Essuatíni, Uganda, África do Sul, Zimbabwe.
- **flag-colors-europa-blue-white-only** (3): Finlândia, Grécia, San Marino.
- **flag-colors-europa-blue-yellow-only** (2): Suécia, Ucrânia.
- **flag-colors-europa-black-red-yellow-only** (2): Bélgica, Alemanha.
- **flag-colors-europa-red-yellow-only** (3): Espanha, Macedónia do Norte, Montenegro.
- **flag-colors-europa-red-green-white-only** (4): Bulgária, Bielorússia, Hungria, Itália.
- **flag-colors-europa-blue-yellow-red-only** (4): Andorra, Liechtenstein, Moldávia, Roménia.
- **flag-colors-asia-red-white-only** (7): Bahrein, Geórgia, Indonésia, Japão, Catar, Singapura, Turquia.
- **flag-colors-asia-red-white-blue-only** (6): Camboja, Laos, Nepal, Coreia do Norte, Tailândia, Ilha Formosa.
- **flag-colors-asia-red-yellow-only** (3): China, Quirguistão, Vietname.
- **flag-colors-asia-red-green-white-only** (3): Irão, Líbano, Omã.
- **flag-colors-americas-blue-white-only** (4): Guatemala, Honduras, Nicarágua, El Salvador.
- **flag-colors-americas-red-white-only** (2): Canadá, Perú.
- **flag-colors-americas-blue-black-yellow-only** (2): Bahamas, Barbados.
- **flag-colors-americas-red-green-contains** (7): Bolívia, Dominica, Granada, Guiana, São Cristóvão e Nevis, México, Suriname.
- **flag-colors-oceania-blue-yellow-contains** (5): Kiribati, Nauru, Palau, Ilhas Salomão, Tuvalu.
- **flag-colors-oceania-blue-white-contains** (10): Austrália, Fiji, Micronésia, Kiribati, Ilhas Marshall, Nauru, Nova Zelândia, Ilhas Salomão, Tuvalu, Samoa.
- **flag-colors-oceania-red-yellow-contains** (4): Kiribati, Papua Nova Guiné, Tuvalu, Vanuatu.
