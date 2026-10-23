import { geoArea, geoContains } from 'd3';

/** Zoom to the main landmass; overseas islands must not force a global view. */
export function focusGeometry(features, center) {
  const polygons = features.flatMap(feature => feature.geometry.type === 'MultiPolygon'
    ? feature.geometry.coordinates.map(coordinates => ({ type: 'Polygon', coordinates }))
    : [feature.geometry]);
  return polygons.find(polygon => geoContains(polygon, center))
    || [...polygons].sort((a, b) => geoArea(b) - geoArea(a))[0];
}
