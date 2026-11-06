# Exploration and country riddles

The menu has nine games in four categories. “Desafios / Challenges” contains two first-class games with independent 10/20/30-round controls, saves and records. Their components load on demand. Starting a new run prompts before overwriting an existing save in that mode and round count. Completed runs offer replay; Explore the world also offers practice of missed rounds.

## Explore the world

100 locally bundled targets: cities, summits, historical sites, lakes, seas, bays/gulfs, deserts, mountain ranges and rivers. Natural features use Natural Earth geometry; exact points use Natural Earth or Wikidata coordinates. See exploration-data.md and the public attribution file.

Score follows the capital game: `round(100 * exp(-distanceKm / 500))`, capped at 25 for point targets clicked outside their associated country/countries. Natural cross-border features have no arbitrary country penalty. Distance is the spherical distance to the feature: any point inside an area counts; rivers use their full course. Small tolerances account for city extent and generalized cartography. A correct outline and marker appear after the answer, and the map focuses the revealed place. The camera remains where the player left it between questions; recenter restores the world view. Both proximity games use the dedicated physical map described in physical-map.md.

## Fun facts

The dynamic GeoGuru engine supports seven interactions: true/false, single text, multiple text, exact numbers with units, map pins, timeline sliders and distance sliders. The 105 original country clues are adapted to the new schema, alongside 11 sourced launch questions. Easy/Medium/Hard control list quotas (one/half rounded up/all). See [geoguru.md](geoguru.md) for the contracts, component structure, parser rules and save migration.

Autocomplete selection submits immediately; skip reveals the answer. Explore the world advances after 1 second for a correct answer and 2 seconds for a mistake or skip. Fun facts allows 3 seconds for a correct answer and 4.5 seconds for partial answers, mistakes or skips. Its numeric questions score by proximity and its map is visible only for pins; its results omit review/practice. Explicit pause remains available; hovering over Explorer feedback no longer delays the next round. The explanation occupies at most two visible lines; sources remain available during feedback; Explore the world keeps its result review.

Clues use dated historical facts and precise definitions rather than unsourced rankings. Canonical country IDs and existing answer aliases are unchanged.

## Map adjustments

- Micro-country markers are now 12px across instead of 8px, in both flat and globe views.
- Existing game mistakes remain visible for 3.5 seconds instead of 2.3 seconds; pause is still available.
- The canonical Portuguese name of the Netherlands is Países Baixos; Holanda remains an accepted alias. The data update pipeline keeps that canonical name.
- Correct countries return to the original solid green. The kiwi pattern component and CSS were removed.
