# Exploration catalogue provenance

The catalogue `src/data/exploration-places.js` contains 100 targets: 30 cities, 10 mountain summits, 10 monuments/historic sites, 10 lakes, 10 seas, 6 bays/gulfs, 6 deserts, 6 mountain ranges and 12 rivers. Each item has Portuguese and English names and short original descriptions, a source URL, a reveal/reference point, scoring scale and a geographical tolerance.

## Geographic data

All area and river geometries are taken from the official Natural Earth repository, pinned to **v5.1.2**:

- [Populated places](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_10m_populated_places_simple.geojson): city reference coordinates and countries.
- [Lakes](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_10m_lakes.geojson).
- [Marine regions](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_10m_geography_marine_polys.geojson): seas, bays and gulfs.
- [Physical regions](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_10m_geography_regions_polys.geojson): deserts and mountain ranges.
- [Rivers and lake centre lines](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_10m_rivers_lake_centerlines.geojson).

Every vertex and polygon hole from the selected features is retained; coordinate precision is rounded to five decimal places. Features with the same selected name are combined into MultiPolygons or MultiLineStrings. The Nile additionally includes the named Albert Nile and Victoria Nile sections. No artificial desert, mountain, sea or lake outline has been hand-drawn. Source-file SHA-256 hashes are recorded in `exploration-data-provenance.json`.

Natural Earth explains that physical-region limits are approximate cartographic boundaries, suitable for general world maps rather than exact legal or scientific delineation: [physical labels](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-physical-labels/). The game therefore provides modest tolerances (8 km for lakes; 10 km for marine areas; 20 km for deserts/ranges; 15 km for river lines). A correct click is scored against the **whole geometry**, never an arbitrary centre. City tolerance is 15 km; summit tolerance 5 km; monument tolerance 3 km. A polygon's reference point is chosen inside its real source outline and is only a fallback/reveal point, not the scoring target.

## Precise summits and monuments

Mountain summits and monuments use coordinate property **P625** from the corresponding Wikidata entity, linked individually from each target. The preferred non-deprecated Earth coordinate was selected when available. This avoids several-kilometre offsets in some generalized mountain-label datasets. Wikidata entity IDs are recorded in the provenance JSON. For example: [Mount Everest](https://www.wikidata.org/wiki/Q513), [Machu Picchu](https://www.wikidata.org/wiki/Q676203), [Eiffel Tower](https://www.wikidata.org/wiki/Q243).

The data was fetched during the November 2026 update and bundled locally. No external API, download or account is needed while playing. The UNESCO bulk XML endpoint rejected direct retrieval, so UNESCO data is not used and no UNESCO provenance is claimed.

## Reuse

Natural Earth geographic data is [public domain](https://www.naturalearthdata.com/about/terms-of-use/). Wikidata structured data is [CC0](https://www.wikidata.org/wiki/Wikidata:Licensing). See `public/licenses/exploration-data.txt`.
