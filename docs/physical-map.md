# Physical maps for proximity games

Explore the world and capital proximity now share `ProximityMap`, using MapLibre GL with a locally hosted style at `/maps/proximity-style.json`. The other games keep their D3 country/subdivision maps. The camera remains flat, with pan, pinch/scroll zoom and horizontally repeated worlds; it is never reset between questions. Recenter restores the chosen region.

The style contains no labels, POIs or country hover interactions. Rivers, lakes, coastlines, land cover and terrain provide physical clues without printing answers on the map. Answer markers, river/area outlines and the guess-to-answer connector appear after answering. Capital results use green/red markers at the true capitals; Explorer results let players select a round to revisit its geometry and pin. Existing point scoring, country caps, queues and saves are preserved.

MapLibre and its worker load only when a proximity map is opened. Tile requests go directly from the player's browser to the public map providers. No game progress is sent to those services; progress continues to live in localStorage. The basemap requires an internet connection.

## Sources

- [OpenFreeMap](https://openfreemap.org/quick_start/): OpenMapTiles vector tiles derived from OpenStreetMap, plus its Natural Earth shaded raster at world scale. The Liberty style was customized locally. OpenFreeMap's public instance requires no key or account.
- [Terrain Tiles](https://registry.opendata.aws/terrain-tiles/): public Terrarium elevation tiles, rendered as hillshade at closer zoom levels. Full upstream dataset attribution is shipped at `/licenses/terrain-data.txt` and linked in the live map attribution.
- [MapLibre GL](https://maplibre.org/maplibre-gl-js/docs/): renderer. Map orientation is fixed to Mercator without rotation, tilt or 3D extrusion.

The two challenge cards were simplified into generic pixel icons, titles and round selection. Fun facts no longer includes a sample question, and Explore the world no longer uses a playable answer as its illustration.
