import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { MODES, REGIONS, countries, getPool } from './data/index.js';
import { createGame, readScores, saveScore, scoreKey, readKeepCorrect, saveKeepCorrect, readMapView, saveMapView, readTheme, saveTheme, readSuggestions, saveSuggestions, readIncludeTerritories, saveIncludeTerritories } from './lib/game.js';
import { Icon, KiwiMark } from './components/Icon.jsx';
import { readExtra, extraScope } from './lib/extra-game.js';
import { readActivity, checkpoint, writeActivity, restoreGame, saveKey } from './lib/activity.js';
import Statistics from './components/Statistics.jsx';
import DailyRanking from './components/DailyRanking.jsx';
import { useLocale } from './i18n/LocaleContext.jsx';
import Home from './components/Home.jsx';
import AccountControl from './auth/AccountControl.jsx';
import HomeBackdrop from './components/HomeBackdrop.jsx';
import Game from './components/Game.jsx';
import ExtraGame from './components/ExtraGame.jsx';
import Modal from './components/Modal.jsx';
import ThemeControl from './components/ThemeControl.jsx';
import LanguageControl from './components/LanguageControl.jsx';
import { readExplorerSave } from './lib/explorer-game.js';
import { readQuizSave } from './quiz/storage.js';
import { readStadiumSave } from './lib/stadium-game.js';
const StadiumGame = lazy(() => import('./components/StadiumGame.jsx'));
const ExplorerGame = lazy(() => import('./components/ExplorerGame.jsx'));
const CountryClueGame = lazy(() => import('./components/CountryClueGame.jsx'));

export default function App() {
  const { locale } = useLocale();
  const [page, setPage] = useState('home');
  const [challenge, setChallenge] = useState(null);
  const [pendingChallenge, setPendingChallenge] = useState(null);
  const [activity, setActivity] = useState(() => readActivity(countries));
  const activityRef = useRef(activity);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [pendingExtra, setPendingExtra] = useState(null);
  const [pendingStart, setPendingStart] = useState(null);
  const [extra, setExtra] = useState(null);
  const [config, setConfig] = useState(null);
  const [gameId, setGameId] = useState(0);
  const [difficulty, setDifficulty] = useState(() => readKeepCorrect() ? 'normal' : 'dificil');
  const [mapView, setMapView] = useState(() => readMapView());
  const [includeTerritories, setIncludeTerritories] = useState(() => readIncludeTerritories());
  const [scoreScope, setScoreScope] = useState('paises');
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(() => readSuggestions());
  const [theme, setTheme] = useState(() => readTheme());
  const [scores, setScores] = useState(() => readScores());
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [modal, setModal] = useState(null);
  const [storageNotice, setStorageNotice] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => { saveKeepCorrect(difficulty === 'normal'); }, [difficulty]);
  useEffect(() => { saveMapView(mapView); }, [mapView]);
  useEffect(() => { saveSuggestions(suggestionsEnabled); }, [suggestionsEnabled]);
  useEffect(() => { saveIncludeTerritories(includeTerritories); }, [includeTerritories]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'light' ? '#f5f0df' : '#101a14';
    saveTheme(theme);
  }, [theme]);

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

  const saveProgress = useCallback(game => {
    const updated = checkpoint(activityRef.current, game);
    activityRef.current = updated; setActivity(updated);
    const persisted = writeActivity(updated);
    setStorageAvailable(persisted);
    if (!persisted) setStorageNotice(true);
  }, []);

  function launch(mode, region, scope = includeTerritories, practicePool = null) {
    const initialGame = createGame({ mode, region, difficulty, includeTerritories: scope, pool: practicePool || getPool(region, scope), practice: Boolean(practicePool) });
    saveProgress(initialGame);
    setConfig({ mode, region, difficulty, initialGame }); setPage('home'); setGameId(id => id + 1);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function start(mode, region) {
    if (activityRef.current.saves[saveKey(mode, region, includeTerritories)]) { setPendingStart({ mode, region }); setModal('new'); }
    else launch(mode, region);
  }
  function resume(snapshot) {
    const initialGame = restoreGame(snapshot, countries);
    if (!initialGame) return;
    setConfig({ mode: initialGame.mode, region: initialGame.region, difficulty: initialGame.difficulty, initialGame });
    setPage('home'); setGameId(id => id + 1); window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function openExtra(next) { setExtra(next); setModal(null); setGameId(id => id + 1); window.scrollTo({top: 0, behavior: 'instant'}); }
  function startExtra(kind, region, resume, municipalityId = null) {
    const next = {kind, region, resume, includeTerritories, municipalityId};
    const scope = extraScope(kind, region, includeTerritories, municipalityId);
    if (!resume && readExtra(kind, scope)) { setPendingExtra(next); setModal('extra-new'); } else openExtra(next);
  }
  function openChallenge(next) { setConfig(null); setExtra(null); setChallenge(next); setModal(null); setGameId(id => id + 1); window.scrollTo({top:0,behavior:'instant'}); }
  function startChallenge(kind,_rounds,resume=false,difficulty='EASY') {
    const rounds=10;
    const next={kind,rounds,resume,difficulty};
    const saved=kind==='stadiums'?readStadiumSave():kind==='explorer'?readExplorerSave(rounds):readQuizSave(rounds,difficulty);
    if(!resume&&saved){setPendingChallenge(next);setModal('challenge-new');}else openChallenge(next);
  }
  function home() { setChallenge(null); setExtra(null); setConfig(null); setPage('home'); setModal(null); }
  function statistics() { setChallenge(null); setExtra(null); setConfig(null); setPage('stats'); setModal(null); window.scrollTo({ top: 0, behavior: 'instant' }); }

  function dailyRanking() { setChallenge(null); setExtra(null); setConfig(null); setPage('daily'); setModal(null); window.scrollTo({ top: 0, behavior: 'instant' }); }

  const finish = useCallback(game => {
    if (game.practice) return;
    setScores(previous => {
      const result = saveScore(previous, game);
      if (!result.persisted) setStorageNotice(true);
      return result.scores;
    });
  }, []);

  return <div className={config || extra || challenge ? 'app is-playing scenic-app' : page === 'home' ? 'app is-home scenic-app' : 'app scenic-app'}>
    <HomeBackdrop />
    <header className="site-header"><div className="header-inner">
      <button className="brand" onClick={() => { if (!config) { home(); window.scrollTo({ top: 0, behavior: 'smooth' }); } else setModal('leave'); }} aria-label="GeoKiwi início"><KiwiMark /><span>GEO<span className="brand-accent">KIWI</span><small>O TEU MUNDO DE GEOGRAFIA</small></span></button>
      <nav aria-label="Navegação principal">
        <button className={page === 'home' && !modal ? 'nav-active' : ''} aria-current={page === 'home' && !modal ? 'page' : undefined} onClick={() => { if (config) setModal('leave'); else { home(); setTimeout(() => document.getElementById('jogos')?.scrollIntoView({ behavior: 'smooth' }), 0); } }}>JOGAR<span>01</span></button>
        <button className={page === 'stats' ? 'stats-nav nav-active' : 'stats-nav'} aria-current={page === 'stats' ? 'page' : undefined} onClick={statistics}>ESTATÍSTICAS<span>02</span></button>
        <button className={page === 'daily' ? 'daily-nav nav-active' : 'daily-nav'} aria-current={page === 'daily' ? 'page' : undefined} onClick={dailyRanking}>{locale === 'en' ? 'DAILY RANKING' : 'RANKING DIÁRIO'}<span>03</span></button>
      </nav>
      <div className="header-right"><AccountControl/><span className="ready-label"><span className="status-dot" /> PRONTO PARA EXPLORAR</span><ThemeControl value={theme} onChange={setTheme} /><button className="sound-toggle" aria-label={soundEnabled ? 'Desativar som' : 'Ativar som'} aria-pressed={soundEnabled} onClick={() => setSoundEnabled(enabled => !enabled)}><Icon name={soundEnabled ? 'volume' : 'muted'} size={18} /></button><LanguageControl /></div>
    </div></header>
    {challenge ? <Suspense fallback={<main className="mode-loading">A preparar o mapa…</main>}>{challenge.kind === 'stadiums' ? <StadiumGame key={gameId} resume={challenge.resume} onExit={home} /> : challenge.kind === 'explorer' ? <ExplorerGame key={gameId} rounds={challenge.rounds} resume={challenge.resume} onExit={home} /> : <CountryClueGame key={gameId} rounds={challenge.rounds} difficulty={challenge.difficulty} resume={challenge.resume} onExit={home} />}</Suspense> : extra ? <ExtraGame key={gameId} config={extra} keepCorrectInitial={difficulty === 'normal'} onExit={home} /> : config ? <Game key={gameId} config={config} suggestionsEnabled={suggestionsEnabled} onSuggestionsChange={setSuggestionsEnabled} theme={theme} onThemeChange={setTheme} soundEnabled={soundEnabled} onSoundChange={setSoundEnabled} onStatistics={statistics} initialGame={config.initialGame} onCheckpoint={saveProgress} storageAvailable={storageAvailable} paused={Boolean(modal)} mapView={mapView} onMapViewChange={setMapView} highScores={scores} onKeepCorrectChange={value => setDifficulty(value ? 'normal' : 'dificil')} onExit={home} onReplay={() => launch(config.mode, config.region, config.initialGame.includeTerritories, config.initialGame.practice ? config.initialGame.queue : null)} onRetry={pool => launch(config.mode, config.region, config.initialGame.includeTerritories, pool)} onFinish={finish} sound={sound} /> : page === 'daily' ? <DailyRanking onPlay={home} /> : page === 'stats' ? <Statistics activity={activity} onBack={home} onRecords={() => setModal('scores')} /> : <Home onChallengeStart={startChallenge} onExtraStart={startExtra} includeTerritories={includeTerritories} setIncludeTerritories={setIncludeTerritories} saves={activity.saves} onResume={resume} onStatistics={statistics} difficulty={difficulty} setDifficulty={setDifficulty} mapView={mapView} setMapView={setMapView} scores={scores} onStart={start} />}
    {!config && !extra && !challenge && <footer className="site-footer"><span><KiwiMark size={14} /> GeoKiwi <b>© 2026</b></span><button onClick={() => setModal('about')}>DADOS & CRÉDITOS <Icon name="northeast" size={12} /></button></footer>}
    {storageNotice && <div className="storage-notice" role="status">Seu navegador bloqueou o armazenamento. O progresso e as estatísticas ficam disponíveis apenas nesta sessão.<button aria-label="Dispensar aviso" onClick={() => setStorageNotice(false)}><Icon name="close" size={14} /></button></div>}
    {modal === 'help' && <Modal title="Pequenas regras. Um mundo de possibilidades." onClose={() => setModal(null)}><div className="help-list">{MODES.map(mode => <div key={mode.id} className={`accent-${mode.color}`}><div className="mode-icon"><Icon name={mode.icon} /></div><div><h3>0{mode.id} / {mode.title}</h3><p>{mode.description} {mode.id === 4 ? 'Um pin sem nome marca a localização da capital.' : ''} {mode.input ? 'O mapa aproxima o país automaticamente. Confirme com Enter ou use Saltar para revelar a resposta sem pontuar.' : 'Arraste para explorar e use + / − ou a rolagem para aproximar.'}</p></div></div>)}</div><div className="rules-box"><p><strong>Stadium Pinpoint:</strong> 10 rondas. Vês só o nome do estádio; coloca e confirma o pin no mapa. Ganhas até 100 pontos por proximidade, com a mesma regra das capitais. Clube, cidade e país só aparecem na solução.</p><p><strong>Concelhos e estados:</strong> encontra a área pedida no mapa. Se errares, a resposta certa fica destacada antes de avançar: amarela nos concelhos e verde nos estados. No mapa de Portugal, as linhas mais fortes marcam os limites de distrito no continente.</p><p><strong>Pin da capital:</strong> ganha até 100 pontos por proximidade. Um palpite fora do país recebe no máximo 25 pontos; uma margem de 5 km no mar ajuda com imprecisões costeiras. Os recordes da antiga escala de 5 000 ficam separados.</p><p><strong>Todos os países da região · 100 pontos por acerto.</strong> Cada país aparece uma vez, em ordem aleatória. Mundo Todo percorre todos os destinos da opção escolhida. Uma tentativa por pergunta; o jogo avança automaticamente. Usa Pausar no feedback se quiseres mais tempo para ler. A última solução continua visível na pergunta seguinte.</p><p><strong>Mapa físico:</strong> nos modos de aproximação, explora o relevo, rios e lagos sem nomes nem destaque de países ao passar o rato. Arrasta e amplia para colocar o pin.</p><p><strong>Desafios:</strong> Partidas de 10 rondas. Em Explora o mundo, coloca o pin perto do lugar; rios e áreas contam em todo o seu traçado ou superfície. Em Conhecimento geral, responde a perguntas de nomes, listas, verdadeiro/falso, números, datas, distâncias e pins. A dificuldade define quantos elementos das listas tens de encontrar: um, metade ou todos. Ambos guardam o progresso. Em Conhecimento geral, os números dão pontos por proximidade. A resposta fica visível até clicares no cartão para continuar. As perguntas sobre letras e nomes não têm sugestões.</p><p><strong>Sugestões de nomes:</strong> nos jogos de escrita, começa a escrever e escolhe um nome para responder imediatamente. As setas e Enter também permitem selecionar. Podes ligar ou desligar a ajuda junto ao switch dos acertos a verde. A escolha fica guardada.</p><p><strong>Incluir territórios:</strong> ativa no menu para acrescentar territórios dependentes; por defeito estão excluídos. Kosovo, Palestina e Taiwan estão incluídos na lista principal. A Somalilândia é selecionada como parte da Somália e o seu estatuto é disputado.</p><p><strong>Guardar e retomar:</strong> o progresso e as estatísticas são guardados automaticamente neste navegador, por jogo e região. Usa Guardar e sair para fazer uma pausa; no cartão do jogo podes retomar ou começar de novo.</p><p><strong>Mapa plano / Globo 3D:</strong> escolha no menu ou durante o jogo, sem perder o progresso. No globo, arraste para rodar a esfera e use scroll, pinch ou + / − para ampliar. As setas do teclado também rodam o globo; Home recentra. A sua escolha fica guardada.</p><p><strong>Manter acertos a verde:</strong> ligue para deixar os países acertados no mapa, ou desligue para a cor desaparecer após o feedback. A opção está visível no menu e durante a partida, nos quatro jogos.</p><p>Respostas em português ou inglês são aceitas, com ou sem acentos. No jogo 3, capitais partilhadas mostram a região como pista. Os recordes distinguem partidas com e sem ajuda visual. Ao ligar o verde em qualquer momento, a partida conta como assistida.</p></div><button className="primary-button full-width" onClick={() => setModal(null)}>ENTENDI, VAMOS EXPLORAR <Icon name="arrow" size={16} /></button></Modal>}
    {modal === 'scores' && <Modal title="Sua coleção de conquistas." onClose={() => setModal(null)}><p>Recordes de percursos completos, por jogo e região. Ligar o verde em qualquer momento conta como ajuda visual; os recordes antigos de 15 perguntas ficam separados.</p><div className="score-scope" aria-label="Tipo de percurso">{[["paises", "Países"], ["territorios", "Com territórios"], ["anteriores", "Anteriores"]].map(([id, label]) => <button key={id} className={scoreScope === id ? "selected" : ""} onClick={() => setScoreScope(id)}>{label}</button>)}</div><div className="scores-scroll"><table className="scores-table"><thead><tr><th>MISSÃO / REGIÃO</th><th>COM AJUDA</th><th>SEM AJUDA</th></tr></thead><tbody>{MODES.map(mode => REGIONS.map(region => <tr key={`${mode.id}-${region.id}`}><td><span>0{mode.id} {mode.title}</span><small>{region.name}</small></td><td>{scores[scoreKey(mode.id, region.id, 'normal', scoreScope === 'anteriores' ? undefined : scoreScope === 'territorios')] ?? '—'}</td><td>{scores[scoreKey(mode.id, region.id, 'dificil', scoreScope === 'anteriores' ? undefined : scoreScope === 'territorios')] ?? '—'}</td></tr>))}</tbody></table></div></Modal>}
    {modal === 'about' && <Modal title="Um mapa feito para descobrir." onClose={() => setModal(null)}><p>GeoKiwi usa React, D3.js, TopoJSON e MapLibre GL. As fronteiras do mapa são cartográficas e podem representar territórios e áreas com status disputado. Países muito pequenos contam com marcadores para facilitar a seleção.</p><ul className="credits-list"><li><a href="/downloads/stadium-pinpoint.md" target="_blank" rel="noreferrer">Stadium Pinpoint · Fontes dos dados ↗</a><span>Estádios e coordenadas · época 2026/27</span></li><li><a href="/licenses/quiz-data.txt" target="_blank" rel="noreferrer">Conhecimento geral · Fontes dos dados ↗</a><span>Fontes das perguntas, estatísticas e fronteiras</span></li><li><a href="/licenses/landmark-photos.txt" target="_blank" rel="noreferrer">Fotografias dos monumentos ↗</a><span>Autores, fontes e licenças das fotografias</span></li><li><a href="https://openfreemap.org/" target="_blank" rel="noreferrer">OpenFreeMap / OpenMapTiles / OpenStreetMap ↗</a><span>Mapa físico dos modos de aproximação · dados ODbL</span></li><li><a href="/licenses/terrain-data.txt" target="_blank" rel="noreferrer">Terrain Tiles / Mapzen ↗</a><span>Relevo e atribuição das fontes de elevação</span></li><li><a href="/licenses/exploration-data.txt" target="_blank" rel="noreferrer">Natural Earth / Wikidata ↗</a><span>Lugares naturais e coordenadas dos desafios · domínio público / CC0</span></li><li><a href="https://www.dgterritorio.gov.pt/atividades/cartografia/cartografia-tematica/caop" target="_blank" rel="noreferrer">DGT / CAOP ↗</a><span>Limites dos concelhos · CC BY 4.0 · versão geográfica disponibilizada por nmota/caop_GeoJSON</span></li><li><a href="https://github.com/topojson/us-atlas" target="_blank" rel="noreferrer">US Atlas / US Census ↗</a><span>Limites dos estados dos EUA · domínio público</span></li><li><a href="https://github.com/topojson/world-atlas" target="_blank" rel="noreferrer">World Atlas / Natural Earth ↗</a><span>Fronteiras 1:10m (plano) / 1:50m (globo) · domínio público</span></li><li><a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames ↗</a><span>Localização das capitais · CC BY 4.0</span></li><li><a href="https://github.com/mledoze/countries" target="_blank" rel="noreferrer">Mledoze / Countries ↗</a><span>Nomes, capitais e continentes · ODbL</span></li><li><a href="https://github.com/lipis/flag-icons" target="_blank" rel="noreferrer">Flag Icons ↗</a><span>Bandeiras SVG · MIT</span></li><li><a href="https://fonts.google.com/specimen/Press+Start+2P" target="_blank" rel="noreferrer">Press Start 2P + Space Grotesk ↗</a><span>Fontes incluídas localmente · SIL Open Font License</span></li></ul></Modal>}
    {modal === 'new' && pendingStart && <Modal title="Começar uma nova exploração?" onClose={() => setModal(null)}><p>Já tens uma partida guardada neste jogo e região. Começar de novo substitui essa partida; as estatísticas e os recordes são mantidos.</p><div className="modal-actions"><button className="primary-button" onClick={() => { resume(activity.saves[saveKey(pendingStart.mode, pendingStart.region, includeTerritories)]); setModal(null); }}>RETOMAR PARTIDA</button><button className="secondary-button" onClick={() => { launch(pendingStart.mode, pendingStart.region); setModal(null); }}>COMEÇAR NOVO JOGO</button></div></Modal>}
    {modal === 'challenge-new' && pendingChallenge && <Modal title="Começar uma nova exploração?" onClose={() => setModal(null)}><p>Já existe uma partida guardada. Começar de novo substitui esse progresso.</p><div className="modal-actions"><button className="primary-button" onClick={() => openChallenge({...pendingChallenge,resume:true})}>RETOMAR PARTIDA</button><button className="secondary-button" onClick={() => openChallenge(pendingChallenge)}>COMEÇAR NOVO JOGO</button></div></Modal>}
    {modal === 'extra-new' && pendingExtra && <Modal title="Começar uma nova exploração?" onClose={() => setModal(null)}><p>Já existe uma partida guardada. Começar de novo substitui esse progresso.</p><div className="modal-actions"><button className="primary-button" onClick={() => openExtra({...pendingExtra, resume:true})}>RETOMAR PARTIDA</button><button className="secondary-button" onClick={() => openExtra(pendingExtra)}>COMEÇAR NOVO JOGO</button></div></Modal>}
    {modal === 'leave'   && <Modal title="Voltar ao ponto de partida?" onClose={() => setModal(null)}><p>O progresso fica guardado automaticamente neste navegador. Podes retomar a partida no cartão deste jogo e região.</p><div className="modal-actions"><button className="primary-button" onClick={() => setModal(null)}>CONTINUAR JOGANDO</button><button className="secondary-button" onClick={home}>GUARDAR E VOLTAR AO MENU</button></div></Modal>}
  </div>;
}
