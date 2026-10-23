import { geoArea, geoContains, zoomIdentity } from 'd3';

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
