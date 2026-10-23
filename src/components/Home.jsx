import { useState } from 'react';
import { MODES, REGIONS, countries } from '../data/index.js';
import { scoreKey } from '../lib/game.js';
import { Icon } from './Icon.jsx';
import WorldMap from './WorldMap.jsx';
import KeepCorrectControl from './KeepCorrectControl.jsx';
import MapViewControl from './MapViewControl.jsx';
import GlobeMap from './GlobeMap.jsx';

export default function Home({ difficulty, setDifficulty, mapView = 'flat', setMapView, scores, onStart }) {
  const [regions, setRegions] = useState({ 1: 'mundo', 2: 'mundo', 3: 'mundo', 4: 'mundo' });
  const played = Object.keys(scores).length;
  return <main className="home-shell">
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="eyebrow"><span className="tiny-plus">+</span> EXPLORE. APRENDA. SUBA DE NÍVEL.</div>
        <h1 id="hero-title">O MUNDO É SEU<br /><span>PLAYGROUND.</span><span className="pixel-cursor" /></h1>
        <p>De um país ao outro, um desafio de cada vez.<br />Coloque seu conhecimento no mapa.</p>
        <a className="hero-link" href="#jogos">ESCOLHA SUA MISSÃO <Icon name="arrow" size={17} /></a>
        <div className="hero-stats"><span><strong>{countries.length}</strong> PAÍSES E TERRITÓRIOS</span><i /><span><strong>04</strong> MODOS DE JOGO</span><i /><span><strong>∞</strong> DESCOBERTAS</span></div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="art-topline"><span><span className="status-dot" /> WORLD EXPLORER</span><span>LIVE ATLAS / 01</span></div>
        {mapView === 'globe' ? <GlobeMap decorative /> : <WorldMap decorative />}
        {mapView === 'flat' && <><div className="art-coordinate coordinate-one">23°33′ S<br /><span>46°38′ W</span></div>
        <div className="art-coordinate coordinate-two">35°40′ N<br /><span>139°41′ E</span></div></>}
        <div className="map-floating-tag"><Icon name="crosshair" size={15} /><span>PRÓXIMO DESTINO: O ACERTO</span></div>
        <span className="corner top-left" /><span className="corner bottom-right" />
      </div>
    </section>

    <section className="games-section" id="jogos" aria-labelledby="games-title">
      <div className="section-heading">
        <div><div className="section-kicker">SELEÇÃO DE MISSÃO</div><h2 id="games-title">Onde começa sua aventura<span>?</span></h2></div>
      </div>
      <div className="home-map-settings"><MapViewControl value={mapView} onChange={setMapView} /><KeepCorrectControl checked={difficulty === 'normal'} onChange={value => setDifficulty(value ? 'normal' : 'dificil')} /></div>
      <p className="difficulty-note">Todos os países da região, em ordem aleatória e sem repetição. <span>O verde dos acertos é opcional nos quatro jogos e pode ser alterado durante a partida.</span></p>
      <div className="games-grid">
        {MODES.map(mode => {
          const region = regions[mode.id];
          const high = scores[scoreKey(mode.id, region, difficulty)] || 0;
          return <article className={`game-card accent-${mode.color}`} key={mode.id}>
            <div className="card-top"><div className="mode-icon"><Icon name={mode.icon} size={27} /></div><span className="mode-number">JOGO <b>0{mode.id}</b></span></div>
            <span className="card-eyebrow">{mode.label}</span>
            <h3>{mode.title}</h3>
            <p className="card-description">{mode.description}</p>
            <div className="action-tag"><Icon name={mode.input ? 'keyboard' : 'crosshair'} size={13} />{mode.action}<span>{mode.input ? 'ZOOM IN' : 'PINPOINT'}</span></div>
            <div className="region-heading">ESCOLHA A REGIÃO <span>↙</span></div>
            <div className="region-grid" aria-label={`Região do jogo ${mode.id}`}>
              {REGIONS.filter(r => r.id !== 'mundo').map(r => <button key={r.id} aria-pressed={region === r.id} className={region === r.id ? 'selected' : ''} onClick={() => setRegions(previous => ({ ...previous, [mode.id]: r.id }))}>{r.name}</button>)}
              <button className={`world-region ${region === 'mundo' ? 'selected' : ''}`} aria-pressed={region === 'mundo'} onClick={() => setRegions(previous => ({ ...previous, [mode.id]: 'mundo' }))}><Icon name="globe" size={13} />Mundo Todo<span>200+</span></button>
            </div>
            <div className="card-score"><span><Icon name="trophy" size={14} /> MELHOR PONTUAÇÃO</span><strong>{String(high).padStart(4, '0')}</strong></div>
            <div className="full-run-label">{REGIONS.find(r => r.id === region).count} DESTINOS · SEM REPETIÇÃO</div>
            <button className="start-button" onClick={() => onStart(mode.id, region)}>JOGAR AGORA <Icon name="arrow" size={17} /></button>
          </article>;
        })}
      </div>
    </section>
    <div className="bottom-ribbon"><span><Icon name="trophy" size={17} /><strong>Seu único rival é você.</strong> Supere seus recordes a cada partida.</span><span><span className="status-dot" /> {played ? `${played} DESAFIO${played > 1 ? 'S' : ''} NO SEU HISTÓRICO` : 'SEUS RECORDES FICAM NESTE NAVEGADOR'}</span></div>
  </main>;
}
