import { geoArea, geoContains, geoMercator, geoGraticule, zoomIdentity } from 'd3';

/** Count every land part belonging to a country before adding its small-country marker. */
export function microCountryFeatures(features, maximumArea = 0.000012) {
  const groups = new Map();
  for (const feature of features) {
    const previous = groups.get(feature.id);
    if (previous) previous.area += geoArea(feature);
    else groups.set(feature.id, { feature, area: geoArea(feature) });
  }
  return [...groups.values()].filter(group => group.area < maximumArea).map(group => group.feature);
}

/** Zoom to the main landmass; overseas islands must not force a global view. */
export function focusGeometry(features, center) {
  const polygons = features.flatMap(feature => feature.geometry.type === 'MultiPolygon'
    ? feature.geometry.coordinates.map(coordinates => ({ type: 'Polygon', coordinates }))
    : [feature.geometry]);
  return polygons.find(polygon => geoContains(polygon, center))
    || [...polygons].sort((a, b) => geoArea(b) - geoArea(a))[0];
}

// Geographic frames intentionally exclude distant overseas territories and
// Russia's Asian landmass. They do not change selectable country geometry.
export const REGION_FRAMES = {
  europa: [-26, 33, 48, 81], africa: [-26, -56, 65, 38],
  asia: [25, -15, 150, 80], americas: [-175, -60, -10, 84],
  oceania: [90, -55, 235, 30],
};
export const regionRotation = region => region === 'oceania' ? [-150, 0, 0] : region === 'americas' ? [80, 0, 0] : [0, 0, 0];

export function getRegionTransform(region, projection, width, height) {
  if (region === 'mundo') return zoomIdentity.translate(width / 2, height / 2).scale(1.1).translate(-width / 2, -height / 2);
  const frame = REGION_FRAMES[region];
  if (!frame) return zoomIdentity;
  const [west, south, east, north] = frame;
  const points = [];
  for (let lon = west; lon <= east + 2; lon += 2) {
    for (let lat = south; lat <= north + 2; lat += 2) {
      const longitude = Math.min(lon, east);
      points.push(projection([longitude > 180 ? longitude - 360 : longitude, Math.min(lat, north)]));
    }
  }
  const left = Math.min(...points.map(p => p[0])), right = Math.max(...points.map(p => p[0]));
  const top = Math.min(...points.map(p => p[1])), bottom = Math.max(...points.map(p => p[1]));
  const scale = Math.max(0.8, Math.min(8, 0.88 / Math.max((right - left) / width, (bottom - top) / height)));
  return zoomIdentity.translate(width / 2, height / 2).scale(scale).translate(-(left + right) / 2, -(top + bottom) / 2);
}

// A regular web-map Mercator, with the same scale on both axes. Fit the
// playable north/south span; horizontal space is filled by repeated worlds.
export function createFlatProjection(width, height, region = 'mundo') {
  const mercatorY = latitude => Math.log(Math.tan(Math.PI / 4 + latitude * Math.PI / 360));
  const north = mercatorY(84.5), south = mercatorY(-60);
  const padding = Math.min(24, height * 0.06);
  const scale = Math.max(1, (height - padding * 2) / (north - south));
  return geoMercator().rotate(regionRotation(region)).scale(scale)
    .translate([width / 2, padding + north * scale]).precision(0.15);
}

/** Visible copies plus one buffer on each side. Recompute only when crossing
 * a world boundary, while D3 moves the parent group on every pointer event. */
export function getWorldCopies(transform, projection, width) {
  const period = 2 * Math.PI * projection.scale();
  const left = projection.translate()[0] - period / 2;
  const x0 = transform.invertX(0), x1 = transform.invertX(width);
  return {
    first: Math.floor((x0 - left) / period) - 1,
    last: Math.floor((x1 - left) / period) + 1,
    primary: Math.round((transform.invertX(width / 2) - projection.translate()[0]) / period),
    k: transform.k,
  };
}


/** Extend minor meridians to Mercator's full polar cap, instead of stopping at
 * 80 degrees and leaving an ungridded band above the normal parallels. */
export function createFlatGraticule() {
  const limit = 85.0511287798066;
  return geoGraticule().extent([[-180, -limit], [180, limit]]).step([10, 10])();
}

/** Convert a screen click to a geographic coordinate, accounting for zoom and repeated worlds. */
export function flatClickCoordinate(point, transform, projection) {
  const [px, py] = transform.invert(point);
  const period = 2 * Math.PI * projection.scale(), cx = projection.translate()[0];
  const x = ((px - cx + period / 2) % period + period) % period - period / 2 + cx;
  const coords = projection.invert([x, py]);
  return coords && coords.every(Number.isFinite) && Math.abs(coords[1]) <= 85 ? coords : null;
}
