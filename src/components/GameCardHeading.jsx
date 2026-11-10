import { useLocale } from '../i18n/LocaleContext.jsx';
import { Icon } from './Icon.jsx';

const artwork = {
  1: {icon:'globe',badge:'crosshair',pt:'APONTAR O PAÍS',en:'FIND THE COUNTRY'},
  2: {icon:'globe',badge:'keyboard',pt:'ESCREVER O PAÍS',en:'TYPE THE COUNTRY'},
  3: {icon:'city',badge:'crosshair',pt:'CAPITAL → PAÍS',en:'CAPITAL → COUNTRY'},
  4: {icon:'city',badge:'keyboard',pt:'ESCREVER A CAPITAL',en:'TYPE THE CAPITAL'},
  5: {icon:'map',badge:'pin',pt:'ENCONTRAR O CONCELHO',en:'FIND THE MUNICIPALITY'},
  6: {icon:'city',badge:'pin',pt:'APROXIMAR O PIN',en:'PLACE THE PIN'},
  7: {icon:'flag',badge:'crosshair',pt:'ENCONTRAR O ESTADO',en:'FIND THE STATE'},
  8: {icon:'map',badge:'pin',pt:'EXPLORAR E APROXIMAR',en:'EXPLORE AND PIN'},
  10: {icon:'stadium',badge:'pin',pt:'LOCALIZAR O ESTÁDIO',en:'PINPOINT THE STADIUM'},
  9: {icon:'book',badge:'help',pt:'QUIZ DE GEOGRAFIA',en:'GEOGRAPHY QUIZ'},
};
export const CARD_TITLES={1:'Encontra o país',2:'Escreve o país',3:'País pela capital',4:'Escreve a capital'};

/** One visual language for every expanded game card; artwork never gives a quiz answer. */
export default function GameCardHeading({mode,title,titleId}) {
  const {locale}=useLocale();const visual=artwork[mode];
  return <div className="game-card-heading">
    <span className="game-card-art" aria-hidden="true"><Icon name={visual.icon} size={48}/><span className="game-card-art-badge"><Icon name={visual.badge} size={17}/></span></span>
    <div className="game-card-heading-copy"><span className="game-card-action">{visual[locale]}</span><h3 id={titleId}>{title}</h3></div>
    <span className="card-number" aria-hidden="true">{String(mode).padStart(2,'0')}</span>
  </div>;
}
