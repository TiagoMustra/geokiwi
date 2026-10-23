import { geoMercator, geoPath } from 'd3';
import { byId, features } from '../data/index.js';
import { focusGeometry } from '../lib/map.js';
import { Icon } from './Icon.jsx';

export const CARD_TITLES = {
  1: 'Encontra o país',
  2: 'Escreve o país',
  3: 'País pela capital',
  4: 'Escreve a capital',
};
const portugal = byId['620'];
const mainland = focusGeometry(features.filter(feature => feature.id === portugal.id), portugal.coordenadas_centro);
const projection = geoMercator().fitExtent([[12, 5], [51, 65]], mainland);
const outline = geoPath(projection)(mainland);
const [capitalX, capitalY] = projection(portugal.coordenadas_capital);

function MiniMap({ capital = false, clickable = false }) {
  return <span className="preview-map"><svg viewBox="0 0 66 70" width="66" height="70" aria-hidden="true"><path className="preview-outline" d={outline} />{capital && <g transform={`translate(${capitalX},${capitalY})`}><path className="preview-pin" d="M0 0s-5-6-5-9a5 5 0 1 1 10 0C5-6 0 0 0 0Z" /><circle className="preview-pin-center" cy="-9" r="1.8" /></g>}</svg>{clickable && <Icon name="crosshair" className="preview-crosshair" size={23} />}</span>;
}

/** A static example makes the clue → action clear without another paragraph. */
export default function ModePreview({ mode }) {
  const labels = {
    1: 'Exemplo: Portugal e a sua bandeira. Clica no país no mapa.',
    2: 'Exemplo: país em destaque no mapa. Escreve Portugal.',
    3: 'Exemplo: Lisboa. Clica no país correspondente no mapa.',
    4: 'Exemplo: Portugal com um pin na capital. Escreve Lisboa.',
  };
  return <div className="mode-preview" role="img" aria-label={labels[mode]}>
    <div aria-hidden="true" className="preview-flow">
      {mode === 1 ? <span className="preview-clue"><img src={portugal.bandeira_url} alt="" /><strong>Portugal</strong></span>
        : mode === 3 ? <span className="preview-clue"><Icon name="city" size={26} /><strong>Lisboa</strong></span>
        : <span className="preview-map-clue"><MiniMap capital={mode === 4} />{mode === 4 && <strong>Portugal</strong>}</span>}
      <Icon name="arrow" size={18} className="preview-arrow" />
      {[1, 3].includes(mode) ? <MiniMap clickable /> : <span className="preview-input"><Icon name="keyboard" size={19} /><strong>{mode === 2 ? 'Portugal' : 'Lisboa'}<i /></strong></span>}
    </div>
  </div>;
}
