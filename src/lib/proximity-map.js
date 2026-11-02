import { geoBounds, geoContains } from 'd3';
import { REGION_FRAMES } from './map.js';

export const wrapLongitude = value => ((value + 180) % 360 + 360) % 360 - 180;
export const validMapPoint = point => Array.isArray(point) && point.length >= 2 && point.slice(0,2).every(Number.isFinite) && Math.abs(point[1]) <= 85.051129;
export function countryAtPoint(point, land) {
  if (!validMapPoint(point)) return null;
  const canonical = [wrapLongitude(point[0]), point[1]];
  return land.find(feature => feature.id && geoContains(feature, canonical))?.id || null;
}
export function initialProximityBounds(region = 'mundo') {
  const frames = region.split('+').map(id => REGION_FRAMES[id]).filter(Boolean);
  if (!frames.length) return [[-180,-58],[180,80]];
  return [[Math.min(...frames.map(f=>f[0])),Math.min(...frames.map(f=>f[1]))],[Math.max(...frames.map(f=>f[2])),Math.max(...frames.map(f=>f[3]))]];
}
/** Keep a short line across the date line instead of drawing the long way round. */
export function guessConnection(guess, answer) {
  if (!validMapPoint(guess) || !validMapPoint(answer)) return {type:'FeatureCollection',features:[]};
  const east = guess[0] + wrapLongitude(answer[0] - guess[0]);
  return {type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[[guess[0],guess[1]],[east,answer[1]]]}}]};
}
export function physicalAnswerFeature(geometry) {
  if (!geometry) return {type:'FeatureCollection',features:[]};
  if (geometry.type === 'FeatureCollection') return geometry;
  return {type:'FeatureCollection',features:[geometry.type==='Feature'?geometry:{type:'Feature',properties:{},geometry}]};
}
export function revealMapBounds(geometry, point, guess = null) {
  let bounds;
  if (geometry) bounds=geoBounds(geometry);
  else if (validMapPoint(point)) bounds=[[point[0],point[1]],[point[0],point[1]]];
  if (!bounds || !bounds.flat().every(Number.isFinite)) return null;
  let [[west,south],[east,north]]=bounds;
  if (east<west) east+=360;
  if (validMapPoint(guess)) {
    const mid=(west+east)/2;
    const lon=mid+wrapLongitude(guess[0]-mid);
    west=Math.min(west,lon);east=Math.max(east,lon);south=Math.min(south,guess[1]);north=Math.max(north,guess[1]);
  }
  return [[west,Math.max(-80,south)],[east,Math.min(83,north)]];
}
