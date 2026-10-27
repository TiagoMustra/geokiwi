import { Icon } from './Icon.jsx';

export default function MapViewControl({ value = 'flat', onChange, compact = false }) {
  return <div className={`map-view-control ${compact ? 'is-compact' : ''}`} role="group" aria-label="Visualização do mundo">
    <span className="view-control-label">VISUALIZAÇÃO</span>
    <div className="view-options">
      <button type="button" className={value === 'flat' ? 'active' : ''} aria-pressed={value === 'flat'} title="Mapa retangular" onClick={() => onChange('flat')}><Icon name="map" size={17} /> {compact ? 'Plano' : 'Mapa plano'}</button>
      <button type="button" className={value === 'globe' ? 'active' : ''} aria-pressed={value === 'globe'} onClick={() => onChange('globe')}><Icon name="globe" size={17} /> {compact ? 'Globo' : 'Globo 3D'}</button>
    </div>
  </div>;
}
