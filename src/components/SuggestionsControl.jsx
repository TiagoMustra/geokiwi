import { Icon } from './Icon.jsx';

export default function SuggestionsControl({ checked, onChange }) {
  return <button type="button" className={`keep-correct-control is-compact suggestions-control ${checked ? 'is-on' : ''}`} role="switch" aria-checked={checked} aria-label="Sugestões de nomes" title="Completar nomes enquanto escreves" onClick={() => onChange(!checked)}>
    <Icon name="keyboard" size={15} /><span className="keep-correct-copy"><strong>Sugestões de nomes</strong></span><span className="pixel-switch" aria-hidden="true"><i /></span>
  </button>;
}
