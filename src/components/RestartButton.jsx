import { Icon } from './Icon.jsx';

/** One visible, accessible entry point shared by all game screens. */
export default function RestartButton({ onClick }) {
  return <button type="button" className="secondary-button extra-restart" onClick={onClick} aria-label="Reiniciar partida"><Icon name="reset" size={15}/> REINICIAR</button>;
}
