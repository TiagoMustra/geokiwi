import { Icon } from './Icon.jsx';

export default function MapViewControl({ value = 'flat', onChange }) {
  return <div className="map-view-control" role="group" aria-label="Visualização do mundo">
    <span className="view-control-label">VISUALIZAÇÃO</span>
    <div className="view-options">
      <button type="button" className={value === 'flat' ? 'active' : ''} aria-pressed={value === 'flat'} onClick={() => onChange('flat')}><Icon name="map" size={17} /> Mapa plano</button>
      <button type="button" className={value === 'globe' ? 'active' : ''} aria-pressed={value === 'globe'} onClick={() => onChange('globe')}><Icon name="globe" size={17} /> Globo 3D</button>
    </div>
  </div>;
}
