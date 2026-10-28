import { useId } from 'react';
import { geoMercator, geoPath } from 'd3';
import { byId, features } from '../data/index.js';
import { focusGeometry } from '../lib/map.js';
import { Icon } from './Icon.jsx';

export const CARD_TITLES = {
  1: 'Encontra o país', 2: 'Escreve o país', 3: 'País pela capital', 4: 'Escreve a capital',
};
const portugal = byId['620'];
const mainland = focusGeometry(features.filter(feature => feature.id === portugal.id), portugal.coordenadas_centro);
const projection = geoMercator().fitExtent([[12, 5], [51, 65]], mainland);
const outline = geoPath(projection)(mainland);
const [capitalX, capitalY] = projection(portugal.coordenadas_capital);

function MiniMap({ capital = false, clickable = false, divisions = false, usa = false }) {
  const clip = useId().replaceAll(':','');
  return <span className="preview-map"><svg viewBox="0 0 66 70" width="66" height="70" aria-hidden="true">
    {usa ? <g className="preview-usa"><path className="preview-outline" d="M5 15 L19 17 29 15 42 18 58 14 57 29 49 35 44 43 34 42 30 55 23 48 20 36 8 32 Z"/><path d="M19 17 L20 36 M29 16 L30 38 M42 18 L41 38 M8 27 L55 28 M20 36 L47 35 M30 38 L40 39 L40 47 L34 42 L30 55 L23 48 Z" /></g> : <><defs><clipPath id={clip}><path d={outline}/></clipPath></defs><path className="preview-outline" d={outline} />{divisions && <g className="preview-divisions" clipPath={`url(#${clip})`}><path d="M0 20h66 M0 30h66 M0 40h66 M0 50h66 M22 0v70 M32 0v70 M42 0v70"/></g>}{capital && <g transform={`translate(${capitalX},${capitalY})`}><path className="preview-pin" d="M0 0s-5-6-5-9a5 5 0 1 1 10 0C5-6 0 0 0 0Z" /><circle className="preview-pin-center" cy="-9" r="1.8" /></g>}</>}
  </svg>{clickable && <Icon name="crosshair" className="preview-crosshair" size={23} />}</span>;
}

/** Example of the actual clue and action in each game. */
export default function ModePreview({ mode }) {
  const labels = {
    1: 'Portugal e bandeira: clica em Portugal no mapa.',
    2: 'País em destaque: escreve Portugal.',
    3: 'Lisboa: clica em Portugal no mapa.',
    4: 'Portugal com pin: escreve Lisboa.',
    5: 'Lisboa: clica no concelho de Lisboa.',
    6: 'Lisboa, Portugal: coloca um pin perto de Lisboa.',
    7: 'Texas: clica no estado do Texas.',
  };
  return <div className="mode-preview" role="img" aria-label={labels[mode]}><div aria-hidden="true" className="preview-flow">
    {mode === 1 ? <span className="preview-clue"><img src={portugal.bandeira_url} alt="" /><strong>Portugal</strong></span>
      : mode === 3 || mode === 5 ? <span className="preview-clue"><Icon name={mode === 3 ? 'city' : 'pin'} size={24}/><strong>Lisboa</strong><small>{mode === 5 ? 'CONCELHO' : 'CAPITAL'}</small></span>
      : mode === 6 ? <span className="preview-clue"><strong>Lisboa</strong><small>PORTUGAL</small></span>
      : mode === 7 ? <span className="preview-clue"><strong>Texas</strong><small>ESTADO</small></span>
      : <span className="preview-map-clue"><MiniMap capital={mode === 4} />{mode === 4 && <strong>Portugal</strong>}</span>}
    <Icon name="arrow" size={18} className="preview-arrow" />
    {[1,3,5,6,7].includes(mode) ? <MiniMap clickable={mode !== 6} capital={mode === 6} divisions={mode === 5} usa={mode === 7} />
      : <span className="preview-input"><small>ESCREVE</small><strong>{mode === 2 ? 'Portugal' : 'Lisboa'}<i /> <span>↵</span></strong></span>}
  </div></div>;
}
