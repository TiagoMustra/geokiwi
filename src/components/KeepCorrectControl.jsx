import { Icon } from './Icon.jsx';

export default function KeepCorrectControl({ checked, onChange }) {
  return <button type="button" className={`keep-correct-control ${checked ? 'is-on' : ''}`} role="switch" aria-checked={checked} aria-label="Manter acertos a verde" onClick={() => onChange(!checked)}>
    <Icon name="check" size={19} />
    <span className="keep-correct-copy"><strong>Manter acertos a verde</strong><small>{checked ? 'As cores ficam no mapa' : 'As cores desaparecem após o feedback'}</small></span>
    <span className="keep-correct-state">{checked ? 'LIGADO' : 'DESLIGADO'}</span>
    <span className="pixel-switch" aria-hidden="true"><i /></span>
  </button>;
}
