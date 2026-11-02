# Exploration and country riddles

The menu has nine games in four categories. “Desafios / Challenges” contains two first-class games with independent 10/20/30-round controls, saves and records. Their components load on demand. Starting a new run prompts before overwriting an existing save in that mode and round count. Completed runs offer replay and practice of missed rounds.

## Explore the world

100 locally bundled targets: cities, summits, historical sites, lakes, seas, bays/gulfs, deserts, mountain ranges and rivers. Natural features use Natural Earth geometry; exact points use Natural Earth or Wikidata coordinates. See exploration-data.md and the public attribution file.

Score follows the capital game: `round(100 * exp(-distanceKm / 500))`, capped at 25 for point targets clicked outside their associated country/countries. Natural cross-border features have no arbitrary country penalty. Distance is the spherical distance to the feature: any point inside an area counts; rivers use their full course. Small tolerances account for city extent and generalized cartography. A correct outline and marker appear after the answer, and the map focuses the revealed place. The next question starts with a world overview.

## Guess the country

105 bilingual clues: history, flags, geography and heritage. Each has accepted country IDs, a short PT/EN explanation and an individual primary-source link. Shared features explicitly accept any associated country. Normal runs balance subjects and avoid repeated answer sets. Autocomplete selection submits immediately; skip reveals the answer. Feedback lasts 3 seconds for a correct answer and 5 seconds for a mistake and can be paused. The explanation occupies at most two visible lines; full explanations and source links remain in the result review.

Clues use dated historical facts and precise definitions rather than unsourced rankings. Canonical country IDs and existing answer aliases are unchanged.

## Map adjustments

- Micro-country markers are now 12px across instead of 8px, in both flat and globe views.
- Existing game mistakes remain visible for 3.5 seconds instead of 2.3 seconds; pause is still available.
- The canonical Portuguese name of the Netherlands is Países Baixos; Holanda remains an accepted alias. The data update pipeline keeps that canonical name.
- Correct countries return to the original solid green. The kiwi pattern component and CSS were removed.
