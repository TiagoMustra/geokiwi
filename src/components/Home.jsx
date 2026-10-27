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

export default function Home({ difficulty, setDifficulty, mapView = 'flat', setMapView, scores, onStart, saves = {}, onResume, onStatistics, includeTerritories = false, setIncludeTerritories = () => {} }) {
  const [regions, setRegions] = useState(() => Object.fromEntries(MODES.map(mode => [mode.id, Object.values(saves).filter(save => save.mode === mode.id).sort((a, b) => b.updatedAt - a.updatedAt)[0]?.region || 'mundo'])));
  const played = Object.keys(scores).length;
  return <main className="home-shell">
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="eyebrow"><span className="tiny-plus">+</span> EXPLORA. APRENDE. REPETE.</div>
        <h1 id="hero-title">O MUNDO É TEU<br /><span>PARA EXPLORAR.</span><span className="pixel-cursor" /></h1>
        <p>De um país ao outro, um desafio de cada vez.<br />Coloque seu conhecimento no mapa.</p>
        <a className="hero-link" href="#jogos">ESCOLHA SUA MISSÃO <Icon name="arrow" size={17} /></a>
        <div className="hero-stats"><span><strong>{getPool('mundo', includeTerritories).length}</strong> {includeTerritories ? 'PAÍSES E TERRITÓRIOS' : 'PAÍSES'}</span><i /><span><strong>04</strong> MODOS DE JOGO</span><i /><span><strong>∞</strong> DESCOBERTAS</span></div>
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
      <div className="games-grid">
        {MODES.map(mode => {
          const region = regions[mode.id];
          const saved = saves[saveKey(mode.id, region, includeTerritories)];
          const legacy = saves[saveKey(mode.id, region)];
          const high = scores[scoreKey(mode.id, region, difficulty, includeTerritories)] || 0;
          return <article className={`game-card simple-game-card accent-${mode.color}`} key={mode.id} aria-labelledby={`mode-title-${mode.id}`}>
            <div className="simple-card-header"><span className="card-action"><Icon name={mode.input ? 'keyboard' : 'crosshair'} size={16} />{mode.input ? 'ESCREVER' : 'CLICAR NO MAPA'}</span><span className="card-number">0{mode.id}</span></div>
            <h3 id={`mode-title-${mode.id}`}>{CARD_TITLES[mode.id]}</h3>
            <ModePreview mode={mode.id} />
            <div className="region-heading">REGIÃO</div>
            <div className="region-grid" aria-label={`Região do jogo ${mode.id}`}>
              {REGIONS.filter(r => r.id !== 'mundo').map(r => <button key={r.id} aria-pressed={region === r.id} className={`${region === r.id ? 'selected' : ''} ${saves[saveKey(mode.id, r.id, includeTerritories)] ? 'has-save' : ''}`} title={saves[saveKey(mode.id, r.id, includeTerritories)] ? 'Partida guardada nesta região' : undefined} onClick={() => setRegions(previous => ({ ...previous, [mode.id]: r.id }))}>{r.name}</button>)}
              <button className={`world-region ${region === 'mundo' ? 'selected' : ''}`} aria-pressed={region === 'mundo'} onClick={() => setRegions(previous => ({ ...previous, [mode.id]: 'mundo' }))}><Icon name="globe" size={13} />Mundo Todo<span>{getPool('mundo', includeTerritories).length}</span></button>
            </div>
            <div className="card-score"><span><Icon name="trophy" size={14} /> RECORDE</span><strong>{String(high).padStart(4, '0')}</strong></div>
            {legacy && <div className="saved-run compact-saved-run"><span><Icon name="save" size={14} /> PARTIDA ANTERIOR · {legacy.answers.length}/{legacy.queue.length}</span><button className="start-button" onClick={() => onResume(legacy)}>RETOMAR ANTERIOR <Icon name="play" size={16} /></button></div>}
            {saved && <div className="saved-run compact-saved-run"><span><Icon name="save" size={14} /> {saved.answers.length}/{saved.queue.length} GUARDADOS</span><button className="start-button" onClick={() => onResume(saved)}>RETOMAR PARTIDA <Icon name="play" size={16} /></button></div>}
            <button className={saved ? 'new-run-button' : 'start-button'} onClick={() => onStart(mode.id, region)}>{saved ? 'COMEÇAR NOVO JOGO' : 'JOGAR'} <Icon name="arrow" size={17} /></button>
          </article>;
        })}
      </div>
    </section>
    <div className="bottom-ribbon"><span><Icon name="trophy" size={17} /><strong>Seu único rival é você.</strong> Supere seus recordes a cada partida.</span><span><span className="status-dot" /> {played ? `${played} DESAFIO${played > 1 ? 'S' : ''} NO SEU HISTÓRICO` : 'SEUS RECORDES FICAM NESTE NAVEGADOR'}</span></div>
  </main>;
}
