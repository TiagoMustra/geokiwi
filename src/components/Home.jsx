import { districts } from '../data/districts.js';
import { normalizeAnswer } from '../lib/game.js';
import { extraScope } from '../lib/extra-game.js';
import { GAME_CATEGORIES, categoryHasGame } from '../lib/categories.js';
import { readExtra, readExtraRecord, readCapitalRecord } from '../lib/extra-game.js';
import { toggleRegion, regionIncludes } from '../lib/regions.js';
import { useState } from 'react';
import { MODES, REGIONS, getPool } from '../data/index.js';
import { saveKey } from '../lib/activity.js';
import { scoreKey } from '../lib/game.js';
import { Icon } from './Icon.jsx';
import KeepCorrectControl from './KeepCorrectControl.jsx';
import MapViewControl from './MapViewControl.jsx';
import GameCardHeading, { CARD_TITLES } from './GameCardHeading.jsx';
import { useLocale } from '../i18n/LocaleContext.jsx';
import KiwiFacts from './KiwiFacts.jsx';
import StadiumCard, {hasStadiumSave} from './StadiumCard.jsx';
import { ChallengeCard, hasChallengeSave } from './ChallengeCards.jsx';

export default function Home({ difficulty, setDifficulty, mapView = 'flat', setMapView, scores, onStart, saves = {}, onResume, onStatistics, includeTerritories = false, setIncludeTerritories = () => {}, onExtraStart = () => {}, initialCategory = null, onChallengeStart = () => {} }) {
  const {locale,t}=useLocale();
  const [regions, setRegions] = useState(() => Object.fromEntries(MODES.map(mode => [mode.id, Object.values(saves).filter(save => save.mode === mode.id).sort((a, b) => b.updatedAt - a.updatedAt)[0]?.region || 'mundo'])));
  const [capitalRegion, setCapitalRegion] = useState('mundo');
  const [municipalityMode, setMunicipalityMode] = useState('all');
  const [municipalityInput, setMunicipalityInput] = useState('');
  const selectedMunicipality = districts.find(item => (normalizeAnswer(item.label) === normalizeAnswer(municipalityInput) || normalizeAnswer(t(item.label)) === normalizeAnswer(municipalityInput)));
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [lastCategory, setLastCategory] = useState(initialCategory);
  const shownCategory = selectedCategory || lastCategory;
  const activeCategory = GAME_CATEGORIES.find(category => category.id === shownCategory);
  const countryTotal = getPool('mundo', false).length;
  const worldTotal = getPool('mundo', includeTerritories).length;
  return <main className="home-shell island-home" data-background="islands">
    <section className="hero restored-hero island-hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h1 id="hero-title" aria-label="O mundo é teu para explorar."><span className="hero-type-line hero-type-first" aria-hidden="true">O MUNDO É TEU</span><span className="hero-type-line hero-type-second" aria-hidden="true">PARA EXPLORAR.<i className="pixel-cursor" /></span></h1>
      </div>
    </section>
    <section className="games-section" id="jogos" aria-labelledby="games-title">
      <div className="section-heading">
        <h2 id="games-title">Escolhe o teu jogo</h2>
      </div>

      <p className="save-explainer"><Icon name="save" size={16} /><span>Progresso guardado automaticamente neste navegador.</span><button onClick={onStatistics}>VER ESTATÍSTICAS <Icon name="chart" size={15} /></button></p>
      <div className="category-grid" aria-label="Categorias de jogos">{GAME_CATEGORIES.map(category => {
        const open = selectedCategory === category.id;
        const hasSave = Object.values(saves).some(save => categoryHasGame(category, save.mode)) || (categoryHasGame(category,8)&&hasChallengeSave('explorer')) || (categoryHasGame(category,9)&&hasChallengeSave('clues')) || (categoryHasGame(category,10)&&hasStadiumSave());
        return <button type="button" key={category.id} className={`category-card accent-${category.color} ${open ? 'is-open' : ''}`} aria-expanded={open} aria-controls="category-games" onClick={() => { setLastCategory(category.id); setSelectedCategory(open ? null : category.id); }}>
          <span className="category-icon"><Icon name={category.icon} size={48}/></span>
          <span className="category-copy"><strong>{category.name}</strong><small>{category.description}</small><span>{category.games.length} {category.games.length===1?'JOGO':'JOGOS'}{hasSave ? ' · PARTIDA GUARDADA' : ''}</span></span>
          <span className="category-toggle" aria-hidden="true"><Icon name={open ? 'minus' : 'plus'} size={17}/></span>
        </button>;
      })}</div>
      <div id="category-games" className={`category-expansion ${selectedCategory ? 'is-open' : ''}`} aria-hidden={!selectedCategory} inert={!selectedCategory}>
        <div className="category-expansion-inner">{activeCategory && <section className={`category-content accent-${activeCategory.color}`} key={activeCategory.id} aria-label={`Jogos de ${activeCategory.name}`}>
          <div className="category-heading"><span>{activeCategory.name}</span><small>ESCOLHE UM JOGO</small></div>
      {['paises','capitais'].includes(activeCategory.id) && <div className="home-map-settings"><MapViewControl value={mapView} onChange={setMapView} /><button type="button" className={`territories-control ${includeTerritories ? 'is-on' : ''}`} role="switch" aria-checked={includeTerritories} onClick={() => setIncludeTerritories(!includeTerritories)}><span><strong>Incluir territórios</strong><small>{countryTotal} países{includeTerritories ? ` + ${worldTotal - countryTotal} territórios` : ''}</small></span><span className="territories-total" aria-live="polite" aria-atomic="true"><b key={worldTotal}>{worldTotal}</b><small>TOTAL · {includeTerritories ? 'LIGADO' : 'DESLIGADO'}</small></span></button><KeepCorrectControl checked={difficulty === 'normal'} onChange={value => setDifficulty(value ? 'normal' : 'dificil')} /></div>}
          {activeCategory.id==='regionais'&&<div className="home-map-settings regional-map-settings"><KeepCorrectControl checked={difficulty==='normal'} onChange={value=>setDifficulty(value?'normal':'dificil')}/></div>}
          <div className="games-grid category-games-grid">
        {MODES.filter(mode => categoryHasGame(activeCategory, mode.id)).map(mode => {
          const region = regions[mode.id];
          const saved = saves[saveKey(mode.id, region, includeTerritories)];
          const legacy = saves[saveKey(mode.id, region)];
          const high = scores[scoreKey(mode.id, region, difficulty, includeTerritories)] || 0;
          return <article className={`game-card simple-game-card accent-${activeCategory.color}`} key={mode.id} aria-labelledby={`mode-title-${mode.id}`}>
            <GameCardHeading mode={mode.id} title={CARD_TITLES[mode.id]} titleId={`mode-title-${mode.id}`}/>
            <div className="region-heading">REGIÕES <span aria-live="polite">{getPool(region, includeTerritories).length} {includeTerritories ? 'países e territórios' : 'países'}</span></div>
            <div className="region-grid" aria-label={`Região do jogo ${mode.id}`}>
              {REGIONS.filter(r => r.id !== 'mundo').map(r => <button key={r.id} aria-pressed={region !== 'mundo' && regionIncludes(region, r.id)} className={`${region !== 'mundo' && regionIncludes(region, r.id) ? 'selected' : ''} ${saves[saveKey(mode.id, r.id, includeTerritories)] ? 'has-save' : ''}`} title={saves[saveKey(mode.id, r.id, includeTerritories)] ? 'Partida guardada nesta região' : undefined} onClick={() => setRegions(previous => ({ ...previous, [mode.id]: toggleRegion(region, r.id) }))}>{r.name}</button>)}
              <button className={`world-region ${region === 'mundo' ? 'selected' : ''}`} aria-pressed={region === 'mundo'} onClick={() => setRegions(previous => ({ ...previous, [mode.id]: 'mundo' }))}><Icon name="globe" size={13} />Mundo Todo<span>{getPool('mundo', includeTerritories).length}</span></button>
            </div>
            <div className="card-score"><span><Icon name="trophy" size={14} /> RECORDE</span><strong>{String(high).padStart(4, '0')}</strong></div>
            {saved ? <div className="saved-run compact-saved-run"><span><Icon name="save" size={14} /> {saved.answers.length}/{saved.queue.length} GUARDADOS · {includeTerritories ? 'COM TERRITÓRIOS' : 'SÓ PAÍSES'}</span><button className="start-button" onClick={() => onResume(saved)}>RETOMAR PARTIDA <Icon name="play" size={16} /></button></div> : legacy && <div className="saved-run compact-saved-run"><span><Icon name="save" size={14} /> PARTIDA ANTIGA · COM TERRITÓRIOS · {legacy.answers.length}/{legacy.queue.length}</span><p className="legacy-save-note">Esta partida antiga inclui territórios, independentemente da opção atual.</p><button className="start-button" onClick={() => onResume(legacy)}>RETOMAR PARTIDA ANTIGA <Icon name="play" size={16} /></button></div>}
            <button className={saved || legacy ? 'new-run-button' : 'start-button'} onClick={() => onStart(mode.id, region)}>{saved || legacy ? 'COMEÇAR NOVO JOGO' : 'JOGAR'} <Icon name="arrow" size={17} /></button>
            {saved && legacy && <details className="other-saved-run"><summary>Outra partida guardada <span>+</span></summary><p>Partida antiga com territórios · {legacy.answers.length}/{legacy.queue.length}</p><button className="new-run-button" onClick={() => onResume(legacy)}>RETOMAR PARTIDA ANTIGA <Icon name="play" size={15} /></button></details>}
          </article>;
        })}
        {[
        {id:5,kind:'municipios',title:'Concelhos de Portugal',detail:'Encontra os 308 concelhos no mapa.',icon:'pin'},
        {id:6,kind:'capitais',title:'Aproximação de capitais',detail:'Coloca o pin perto da capital.',icon:'city'},
        {id:7,kind:'estados',title:'Estados dos EUA',detail:'Encontra os 50 estados no mapa.',icon:'flag'}
      ].filter(item => categoryHasGame(activeCategory, item.id)).map(item => {
        const region = item.kind === 'capitais' ? capitalRegion : 'mundo';
        const waitingForMunicipality = item.kind === 'municipios' && municipalityMode === 'one' && !selectedMunicipality;
        const municipalityId = item.kind === 'municipios' && municipalityMode === 'one' ? selectedMunicipality?.id : null;
        const scope = waitingForMunicipality ? null : extraScope(item.kind, region, includeTerritories, municipalityId);
        const saved = scope ? readExtra(item.kind,scope) : null;
        const high = !scope ? 0 : item.kind === 'capitais' ? readCapitalRecord(scope) : readExtraRecord(item.kind,`${scope}:${difficulty}`);
        return <article className={`game-card simple-game-card accent-${activeCategory.color}`} key={item.kind} aria-labelledby={`mode-title-${item.id}`}><GameCardHeading mode={item.id} title={item.title} titleId={`mode-title-${item.id}`}/>
        {item.kind === 'municipios' && <div className="municipality-picker"><span className="region-heading">ÁREA DE JOGO</span><div className="municipality-options" role="group" aria-label="Escolher zona"><button type="button" className={municipalityMode === 'all' ? 'selected' : ''} aria-pressed={municipalityMode === 'all'} onClick={() => setMunicipalityMode('all')}>Portugal</button><button type="button" className={municipalityMode === 'one' ? 'selected' : ''} aria-pressed={municipalityMode === 'one'} onClick={() => setMunicipalityMode('one')}>Um distrito</button></div>{municipalityMode === 'one' && <><label className="sr-only" htmlFor="municipality-search">Seleciona um distrito</label><input id="municipality-search" type="text" list="municipality-suggestions" autoComplete="off" value={municipalityInput} onChange={event => setMunicipalityInput(event.target.value)} placeholder="Escreve um distrito…"/><datalist id="municipality-suggestions">{districts.map(m => <option key={m.id} value={t(m.label)}/>)}</datalist><small>{selectedMunicipality ? 'Distrito selecionado' : 'Escolhe um nome da lista'}</small></>}</div>}
        {item.kind === 'capitais' && <><div className="region-heading">REGIÕES <span aria-live="polite">{getPool(region, includeTerritories).length} {includeTerritories ? 'países e territórios' : 'países'}</span></div><div className="region-grid">{REGIONS.filter(r=>r.id!=='mundo').map(r=><button key={r.id} aria-pressed={region!=='mundo'&&regionIncludes(region,r.id)} className={region!=='mundo'&&regionIncludes(region,r.id)?'selected':''} onClick={()=>setCapitalRegion(toggleRegion(region,r.id))}>{r.name}</button>)}<button className={`world-region ${region==='mundo'?'selected':''}`} aria-pressed={region==='mundo'} onClick={()=>setCapitalRegion('mundo')}><Icon name="globe" size={13}/> Mundo Todo<span>{getPool('mundo',includeTerritories).length}</span></button></div></>}
        <div className="card-score"><span><Icon name="trophy" size={14}/> RECORDE</span><strong>{String(high).padStart(4,'0')}</strong></div>{saved && <div className="saved-run compact-saved-run"><span>{saved.answers.length}/{saved.queue.length} GUARDADOS</span><button className="start-button" onClick={()=>onExtraStart(item.kind,region,true,municipalityId)}>RETOMAR PARTIDA</button></div>}<button className={saved?'new-run-button':'start-button'} disabled={waitingForMunicipality} onClick={()=>onExtraStart(item.kind,region,false,municipalityId)}>{saved?'COMEÇAR NOVO JOGO':'JOGAR'} <Icon name="arrow" size={17}/></button></article>;
      })}
      {categoryHasGame(activeCategory,8)&&<ChallengeCard key="explorer" kind="explorer" color={activeCategory.color} onStart={onChallengeStart}/>}
      {categoryHasGame(activeCategory,10)&&<StadiumCard color={activeCategory.color} onStart={onChallengeStart}/>}
      {categoryHasGame(activeCategory,9)&&<ChallengeCard key="clues" kind="clues" color={activeCategory.color} onStart={onChallengeStart}/>}
      </div>
        </section>}</div>
      </div>
      <KiwiFacts locale={locale} />
    </section>

  </main>;
}
