import { geoArea } from 'd3';

// Quantized coastal data can collapse tiny rings or reverse their spherical
// winding. An exterior with reversed winding paints Earth's complement.
function cleanRing(points, hole) {
  const ring = points.filter((point, index) => index === 0 || point[0] !== points[index - 1][0] || point[1] !== points[index - 1][1]);
  if (!ring.length) return null;
  if (ring[0][0] !== ring.at(-1)[0] || ring[0][1] !== ring.at(-1)[1]) ring.push(ring[0]);
  if (new Set(ring.slice(0, -1).map(point => `${point[0]},${point[1]}`)).size < 3) return null;
  const area = geoArea({ type: 'Polygon', coordinates: [ring] });
  const smallArea = Math.min(area, Math.PI * 4 - area);
  if (!Number.isFinite(area) || smallArea < 1e-13) return null;
  const reversed = hole ? area < Math.PI * 2 : area > Math.PI * 2;
  return reversed ? [...ring].reverse() : ring;
}

export function cleanCountryGeometry(feature) {
  const polygons = feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates : [feature.geometry.coordinates];
  const coordinates = polygons.flatMap(polygon => {
    const outer = cleanRing(polygon[0], false);
    if (!outer) return [];
    return [[outer, ...polygon.slice(1).map(ring => cleanRing(ring, true)).filter(Boolean)]];
  });
  return { ...feature, geometry: { type: 'MultiPolygon', coordinates } };
}

export function cleanFlatFeatures(features, fallbackFeatures = []) {
  const fallback = new Map(fallbackFeatures.map(feature => [feature.id, feature]));
  return features.map(feature => {
    const fixed = cleanCountryGeometry(feature);
    if (!fixed.geometry.coordinates.length && fallback.has(feature.id)) {
      return { ...fixed, geometry: cleanCountryGeometry(fallback.get(feature.id)).geometry };
    }
    return fixed;
  });
}
