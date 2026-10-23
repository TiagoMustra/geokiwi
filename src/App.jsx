import { useCallback, useEffect, useRef, useState } from 'react';
import { MODES, REGIONS } from './data/index.js';
import { readScores, saveScore, scoreKey } from './lib/game.js';
import { Icon, PixelGlobe } from './components/Icon.jsx';
import Home from './components/Home.jsx';
import Game from './components/Game.jsx';
import Modal from './components/Modal.jsx';

export default function App() {
  const [config, setConfig] = useState(null);
  const [gameId, setGameId] = useState(0);
  const [difficulty, setDifficulty] = useState('normal');
  const [scores, setScores] = useState(() => readScores());
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [modal, setModal] = useState(null);
  const [storageNotice, setStorageNotice] = useState(false);
  const audioRef = useRef(null);
  const startingHighRef = useRef(0);

  useEffect(() => {
    const listener = () => setScores(readScores());
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, []);

  const sound = useCallback(correct => {
    if (!soundEnabled) return;
    try {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      audioRef.current ||= new AudioClass();
      const audio = audioRef.current;
      audio.resume();
      [0, 0.1].forEach((delay, index) => {
        const oscillator = audio.createOscillator();
        const volume = audio.createGain();
        oscillator.type = 'square';
        oscillator.frequency.value = correct ? (index ? 880 : 587) : (index ? 130 : 196);
        volume.gain.setValueAtTime(0.025, audio.currentTime + delay);
        volume.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + delay + 0.15);
        oscillator.connect(volume); volume.connect(audio.destination);
        oscillator.start(audio.currentTime + delay); oscillator.stop(audio.currentTime + delay + 0.15);
      });
    } catch { /* Sound is optional on browsers without Web Audio. */ }
  }, [soundEnabled]);

  function start(mode, region) {
    startingHighRef.current = scores[scoreKey(mode, region, difficulty)] || 0;
    setConfig({ mode, region, difficulty }); setGameId(id => id + 1);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  const finish = useCallback(game => {
    setScores(previous => {
      const result = saveScore(previous, game);
      if (!result.persisted) setStorageNotice(true);
      return result.scores;
    });
  }, []);

  return <div className={config ? 'app is-playing' : 'app'}>
    <header className="site-header"><div className="header-inner">
      <button className="brand" onClick={() => { if (!config) window.scrollTo({ top: 0, behavior: 'smooth' }); else setModal('leave'); }} aria-label="GEOQUEST início"><PixelGlobe /><span>GEO<span className="brand-accent">QUEST</span><small>THE WORLD IS YOUR PLAYGROUND</small></span></button>
      <nav aria-label="Navegação principal"><button className={!modal ? 'nav-active' : ''} onClick={() => { if (!config) document.getElementById('jogos')?.scrollIntoView({ behavior: 'smooth' }); else setModal('leave'); }}>JOGAR<span>01</span></button><button className={modal === 'help' ? 'nav-active' : ''} onClick={() => setModal('help')}>COMO JOGAR<span>02</span></button><button className={modal === 'scores' ? 'nav-active' : ''} onClick={() => setModal('scores')}>RECORDES<span>03</span></button></nav>
      <div className="header-right"><span className="ready-label"><span className="status-dot" /> PRONTO PARA EXPLORAR</span><button className="sound-toggle" aria-label={soundEnabled ? 'Desativar som' : 'Ativar som'} aria-pressed={soundEnabled} onClick={() => setSoundEnabled(enabled => !enabled)}><Icon name={soundEnabled ? 'volume' : 'muted'} size={18} /></button><span className="language-label">PT-BR</span></div>
    </div></header>
    {config ? <Game key={gameId} config={config} highScore={startingHighRef.current} onExit={() => setConfig(null)} onReplay={() => start(config.mode, config.region)} onFinish={finish} sound={sound} /> : <Home difficulty={difficulty} setDifficulty={setDifficulty} scores={scores} onStart={start} />}
    {!config && <footer className="site-footer"><span><PixelGlobe size={14} /> GEOQUEST <b>© 2026</b></span><span>SEM PASSAPORTE. SEM LIMITES. SÓ CONHECIMENTO.</span><button onClick={() => setModal('about')}>DADOS & CRÉDITOS <Icon name="northeast" size={12} /></button></footer>}
    {storageNotice && <div className="storage-notice" role="status">Seu navegador bloqueou o armazenamento. O recorde está disponível nesta sessão.<button aria-label="Dispensar aviso" onClick={() => setStorageNotice(false)}><Icon name="close" size={14} /></button></div>}
    {modal === 'help' && <Modal title="Pequenas regras. Um mundo de possibilidades." onClose={() => setModal(null)}><div className="help-list">{MODES.map(mode => <div key={mode.id} className={`accent-${mode.color}`}><div className="mode-icon"><Icon name={mode.icon} /></div><div><h3>0{mode.id} / {mode.title}</h3><p>{mode.description} {mode.input ? 'O mapa aproxima o país automaticamente. Confirme com Enter.' : 'Arraste para explorar e use + / − ou a rolagem para aproximar.'}</p></div></div>)}</div><div className="rules-box"><p><strong>15 perguntas · 100 pontos por acerto.</strong> Cada país aparece uma vez por partida. Uma tentativa por pergunta; depois, avance no seu ritmo.</p><p><strong>Normal:</strong> acertos ficam verdes. <strong>Difícil:</strong> a cor aparece por um instante e desaparece. Válido nos jogos de clicar.</p><p>Respostas em português ou inglês são aceitas, com ou sem acentos. O Mundo Todo inclui países e territórios. Seus recordes são locais, por jogo, região e dificuldade.</p></div><button className="primary-button full-width" onClick={() => setModal(null)}>ENTENDI, VAMOS EXPLORAR <Icon name="arrow" size={16} /></button></Modal>}
    {modal === 'scores' && <Modal title="Sua coleção de conquistas." onClose={() => setModal(null)}><p>Melhores pontuações neste navegador. Cada região e dificuldade tem seu próprio recorde.</p><div className="scores-scroll"><table className="scores-table"><thead><tr><th>MISSÃO / REGIÃO</th><th>NORMAL</th><th>DIFÍCIL</th></tr></thead><tbody>{MODES.map(mode => REGIONS.map(region => <tr key={`${mode.id}-${region.id}`}><td><span>0{mode.id} {mode.title}</span><small>{region.name}</small></td><td>{scores[scoreKey(mode.id, region.id, 'normal')] ?? '—'}</td><td>{mode.input ? '—' : scores[scoreKey(mode.id, region.id, 'dificil')] ?? '—'}</td></tr>))}</tbody></table></div></Modal>}
    {modal === 'about' && <Modal title="Um mapa feito para descobrir." onClose={() => setModal(null)}><p>GEOQUEST usa React, D3.js e TopoJSON. As fronteiras do mapa são cartográficas e podem representar territórios e áreas com status disputado. Países muito pequenos contam com marcadores para facilitar a seleção.</p><ul className="credits-list"><li><a href="https://github.com/topojson/world-atlas" target="_blank" rel="noreferrer">World Atlas / Natural Earth ↗</a><span>Fronteiras em escala 1:50m · domínio público</span></li><li><a href="https://github.com/mledoze/countries" target="_blank" rel="noreferrer">Mledoze / Countries ↗</a><span>Nomes, capitais e continentes · ODbL</span></li><li><a href="https://github.com/lipis/flag-icons" target="_blank" rel="noreferrer">Flag Icons ↗</a><span>Bandeiras SVG · MIT</span></li><li><a href="https://fonts.google.com/specimen/Press+Start+2P" target="_blank" rel="noreferrer">Press Start 2P + Space Grotesk ↗</a><span>Fontes incluídas localmente · SIL Open Font License</span></li></ul></Modal>}
    {modal === 'leave' && <Modal title="Voltar ao ponto de partida?" onClose={() => setModal(null)}><p>O progresso desta partida será perdido ao voltar ao menu.</p><div className="modal-actions"><button className="primary-button" onClick={() => setModal(null)}>CONTINUAR JOGANDO</button><button className="secondary-button" onClick={() => { setConfig(null); setModal(null); }}>VOLTAR AO MENU</button></div></Modal>}
  </div>;
}
