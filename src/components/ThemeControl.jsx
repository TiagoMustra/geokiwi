import { Icon } from './Icon.jsx';

export default function ThemeControl({ value, onChange }) {
  const light = value === 'light';
  return <button className="theme-toggle" type="button" role="switch" aria-label="Modo claro" aria-checked={light} title={light ? 'Mudar para modo escuro' : 'Mudar para modo claro'} onClick={() => onChange(light ? 'dark' : 'light')}>
    <Icon name={light ? 'sun' : 'moon'} size={17} /><span>{light ? 'Claro' : 'Escuro'}</span>
  </button>;
}
