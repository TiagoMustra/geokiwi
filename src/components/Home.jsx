import { GAME_CATEGORIES, categoryHasGame } from '../lib/categories.js';
import { readExtra, readExtraRecord, readCapitalRecord } from '../lib/extra-game.js';
import { toggleRegion, regionIncludes } from '../lib/regions.js';
import { useState } from 'react';
import { MODES, REGIONS, countries, getPool } from '../data/index.js';
import { saveKey } from '../lib/activity.js';
import { scoreKey } from '../lib/game.js';
import { Icon, KiwiMark } from './Icon.jsx';
import WorldMap from './WorldMap.jsx';
import KeepCorrectControl from './KeepCorrectControl.jsx';
import MapViewControl from './MapViewControl.jsx';
import GlobeMap from './GlobeMap.jsx';
import ModePreview, { CARD_TITLES } from './ModePreview.jsx';

export default function Home({ difficulty, setDifficulty, mapView = 'flat', setMapView, scores, onStart, saves = {}, onResume, onStatistics, includeTerritories = false, setIncludeTerritories = () => {}, onExtraStart = () => {}, initialCategory = null }) {
  const [regions, setRegions] = useState(() => Object.fromEntries(MODES.map(mode => [mode.id, Object.values(saves).filter(save => save.mode === mode.id).sort((a, b) => b.updatedAt - a.updatedAt)[0]?.region || 'mundo'])));
  const [capitalRegion, setCapitalRegion] = useState('mundo');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [lastCategory, setLastCategory] = useState(initialCategory);
  const shownCategory = selectedCategory || lastCategory;
  const activeCategory = GAME_CATEGORIES.find(category => category.id === shownCategory);
  const played = Object.keys(scores).length;
  return <main className="home-shell">
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="eyebrow"><span className="tiny-plus">+</span> EXPLORA. APRENDE. REPETE.</div>
        <h1 id="hero-title">O MUNDO É TEU<br /><span>PARA EXPLORAR.</span><span className="pixel-cursor" /></h1>
        <p>De um país ao outro, um desafio de cada vez.<br />Coloque seu conhecimento no mapa.</p>
        <a className="hero-link" href="#jogos">ESCOLHA SUA MISSÃO <Icon name="arrow" size={17} /></a>
        <div className="hero-stats"><span><strong>{getPool('mundo', includeTerritories).length}</strong> {includeTerritories ? 'PAÍSES E TERRITÓRIOS' : 'PAÍSES'}</span><i /><span><strong>07</strong> MODOS DE JOGO</span><i /><span><strong>∞</strong> DESCOBERTAS</span></div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="art-topline"><span><span className="status-dot" /> KIWI EXPLORER</span><span>LIVE ATLAS / 01</span></div>
        {mapView === 'globe' ? <GlobeMap decorative /> : <WorldMap decorative />}
        {mapView === 'flat' && <><div className="art-coordinate coordinate-one">23°33′ S<br /><span>46°38′ W</span></div>
        <div className="art-coordinate coordinate-two">35°40′ N<br /><span>139°41′ E</span></div></>}
        <div className="map-floating-tag"><KiwiMark size={18} /><span>UMA DOSE FRESCA DE GEOGRAFIA</span></div>
        <span className="corner top-left" /><span className="corner bottom-right" />
      </div>
    </section>

    <section className="games-section" id="jogos" aria-labelledby="games-title">
      <div className="section-heading">
        <div><div className="section-kicker">SELEÇÃO DE MISSÃO</div><h2 id="games-title">Escolhe o teu jogo<span>.</span></h2></div>
      </div>
      <div className="home-map-settings"><MapViewControl value={mapView} onChange={setMapView} /><button type="button" className={`territories-control ${includeTerritories ? 'is-on' : ''}`} role="switch" aria-checked={includeTerritories} onClick={() => setIncludeTerritories(!includeTerritories)}><span><strong>Incluir territórios</strong><small>Ex.: Guernsey e Jersey</small></span><b>{includeTerritories ? 'LIGADO' : 'DESLIGADO'}</b></button><KeepCorrectControl checked={difficulty === 'normal'} onChange={value => setDifficulty(value ? 'normal' : 'dificil')} /></div>
      <p className="save-explainer"><Icon name="save" size={16} /><span>Progresso guardado automaticamente neste navegador.</span><button onClick={onStatistics}>VER ESTATÍSTICAS <Icon name="chart" size={15} /></button></p>
      <div className="category-grid" aria-label="Categorias de jogos">{GAME_CATEGORIES.map(category => {
        const open = selectedCategory === category.id;
        const hasSave = Object.values(saves).some(save => categoryHasGame(category, save.mode));
        return <button type="button" key={category.id} className={`category-card accent-${category.color} ${open ? 'is-open' : ''}`} aria-expanded={open} aria-controls="category-games" onClick={() => { setLastCategory(category.id); setSelectedCategory(open ? null : category.id); }}>
          <span className="category-icon"><Icon name={category.icon} size={26}/></span>
          <span className="category-copy"><strong>{category.name}</strong><small>{category.description}</small><span>{category.games.length} JOGOS{hasSave ? ' · PARTIDA GUARDADA' : ''}</span></span>
          <span className="category-toggle" aria-hidden="true"><Icon name={open ? 'minus' : 'plus'} size={17}/></span>
        </button>;
      })}</div>
      <div id="category-games" className={`category-expansion ${selectedCategory ? 'is-open' : ''}`} aria-hidden={!selectedCategory} inert={!selectedCategory}>
        <div className="category-expansion-inner">{activeCategory && <section className="category-content" key={activeCategory.id} aria-label={`Jogos de ${activeCategory.name}`}>
          <div className="category-heading"><span>{activeCategory.name}</span><small>ESCOLHE UM JOGO</small></div>
          <div className="games-grid category-games-grid">
        {MODES.filter(mode => categoryHasGame(activeCategory, mode.id)).map(mode => {
          const region = regions[mode.id];
          const saved = saves[saveKey(mode.id, region, includeTerritories)];
          const legacy = saves[saveKey(mode.id, region)];
          const high = scores[scoreKey(mode.id, region, difficulty, includeTerritories)] || 0;
          return <article className={`game-card simple-game-card accent-${mode.color}`} key={mode.id} aria-labelledby={`mode-title-${mode.id}`}>
            <div className="simple-card-header"><span className="card-action"><Icon name={mode.input ? 'keyboard' : 'crosshair'} size={16} />{mode.input ? 'ESCREVER' : 'CLICAR NO MAPA'}</span><span className="card-number">0{mode.id}</span></div>
            <h3 id={`mode-title-${mode.id}`}>{CARD_TITLES[mode.id]}</h3>
            <ModePreview mode={mode.id} />
            <div className="region-heading">REGIÕES</div>
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
        const scope = item.kind === 'capitais' ? `${region}:${includeTerritories ? 'territorios' : 'paises'}` : region;
        const saved=readExtra(item.kind,scope);
        const high = item.kind === 'capitais' ? readCapitalRecord(scope) : readExtraRecord(item.kind,`${scope}:${difficulty}`);
        return <article className="game-card simple-game-card accent-lime" key={item.kind}><div className="simple-card-header"><span className="card-action"><Icon name={item.icon} size={16}/> CLICAR NO MAPA</span><span className="card-number">0{item.id}</span></div><h3>{item.title}</h3><ModePreview mode={item.id} />
        {item.kind === 'capitais' && <><div className="region-heading">REGIÕES</div><div className="region-grid">{REGIONS.filter(r=>r.id!=='mundo').map(r=><button key={r.id} aria-pressed={region!=='mundo'&&regionIncludes(region,r.id)} className={region!=='mundo'&&regionIncludes(region,r.id)?'selected':''} onClick={()=>setCapitalRegion(toggleRegion(region,r.id))}>{r.name}</button>)}<button className={`world-region ${region==='mundo'?'selected':''}`} aria-pressed={region==='mundo'} onClick={()=>setCapitalRegion('mundo')}><Icon name="globe" size={13}/> Mundo Todo<span>{getPool('mundo',includeTerritories).length}</span></button></div></>}
        <div className="card-score"><span><Icon name="trophy" size={14}/> RECORDE</span><strong>{String(high).padStart(4,'0')}</strong></div>{saved && <div className="saved-run compact-saved-run"><span>{saved.answers.length}/{saved.queue.length} GUARDADOS</span><button className="start-button" onClick={()=>onExtraStart(item.kind,region,true)}>RETOMAR PARTIDA</button></div>}<button className={saved?'new-run-button':'start-button'} onClick={()=>onExtraStart(item.kind,region,false)}>{saved?'COMEÇAR NOVO JOGO':'JOGAR'} <Icon name="arrow" size={17}/></button></article>;
      })}</div>
        </section>}</div>
      </div>
    </section>
    <div className="bottom-ribbon"><span><Icon name="trophy" size={17} /><strong>Seu único rival é você.</strong> Supere seus recordes a cada partida.</span><span><span className="status-dot" /> {played ? `${played} DESAFIO${played > 1 ? 'S' : ''} NO SEU HISTÓRICO` : 'SEUS RECORDES FICAM NESTE NAVEGADOR'}</span></div>
  </main>;
}
