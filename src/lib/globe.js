import { geoArea, geoDistance, geoOrthographic, geoPath } from 'd3';
import { focusGeometry } from './map.js';

export const REGION_CENTERS = {
  mundo: [0, 15], africa: [20, 0], asia: [95, 25],
  europa: [20, 50], americas: [-85, 10], oceania: [155, -20],
};
export const clampGlobeZoom = value => Math.max(0.8, Math.min(120, value));
export const globeRadius = (width, height) => Math.max(20, Math.min(width, height) * 0.41);

export function createGlobeProjection(width, height, camera) {
  return geoOrthographic().translate([width / 2, height / 2])
    .scale(globeRadius(width, height) * camera.zoom)
    .rotate(camera.rotation).clipAngle(90).precision(0.4);
}

export function globePointVisible(point, projection) {
  if (!point || !point.every(Number.isFinite)) return false;
  // projection(point) alone does NOT clip a point on the far hemisphere.
  return geoDistance(point, projection.invert(projection.translate())) < Math.PI / 2 - 1e-6;
}

export function rotateGlobe(camera, dx, dy, radius) {
  const degreesPerPixel = 180 / (Math.PI * radius * camera.zoom);
  const longitude = camera.rotation[0] + dx * degreesPerPixel;
  return { ...camera, rotation: [
    ((longitude + 180) % 360 + 360) % 360 - 180,
    Math.max(-89.99, Math.min(89.99, camera.rotation[1] - dy * degreesPerPixel)),
    0,
  ] };
}

export function getGlobeCamera({ width, height, region = 'mundo', typed = false, target, showCapitalPin = false, features = [] }) {
  const center = typed && target
    ? showCapitalPin ? target.coordenadas_capital : target.coordenadas_centro
    : REGION_CENTERS[region] || REGION_CENTERS.mundo;
  const camera = { rotation: [-center[0], -center[1], 0], zoom: typed ? 1 : ({ europa: 2.1, africa: 1.15, asia: 1.1, oceania: 1.1 }[region] || 1) };
  if (typed && target) {
    const geometry = focusGeometry(features.filter(f => f.id === target.id), center);
    const projection = createGlobeProjection(width, height, camera);
    const bounds = geoPath(projection).bounds(geometry);
    const size = Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height);
    if (Number.isFinite(size) && size > 0) camera.zoom = Math.max(1.15, Math.min(100, 0.6 / size));
  }
  return camera;
}

// Keep topology IDs and tiny islands intact. Only thin dense coastlines while
// the player is moving the globe; restore the full 1:50m shapes on release.
function simplifyRing(ring, tolerance) {
  if (ring.length < 8) return ring;
  const points = [ring[0]];
  let previous = ring[0];
  for (let i = 1; i < ring.length - 1; i++) {
    const point = ring[i];
    if (Math.abs(point[0] - previous[0]) > 180 || Math.hypot(point[0] - previous[0], point[1] - previous[1]) >= tolerance) {
      points.push(point); previous = point;
    }
  }
  points.push(ring[ring.length - 1]);
  if (points.length < 4) return ring;
  // A closed ring can still be invalid on a sphere. Thinning a tiny island
  // can reverse its winding: D3 then fills Earth's complement, hiding other
  // countries and making a single hover/target color paint the whole globe.
  const signedArea = coordinates => {
    const area = geoArea({ type: 'Polygon', coordinates: [coordinates] });
    return area > Math.PI * 2 ? area - Math.PI * 4 : area;
  };
  const original = signedArea(ring);
  const reduced = signedArea(points);
  if (!Number.isFinite(reduced) || Math.sign(original) !== Math.sign(reduced)
    || Math.abs(reduced - original) > Math.abs(original) * 0.1) return ring;
  return points;
}

export function simplifyGlobeFeatures(features) {
  return features.map(feature => ({ ...feature, geometry: {
    ...feature.geometry,
    coordinates: feature.geometry.type === 'MultiPolygon'
      ? feature.geometry.coordinates.map(polygon => polygon.map(ring => simplifyRing(ring, 0.35)))
      : feature.geometry.coordinates.map(ring => simplifyRing(ring, 0.35)),
  } }));
}
