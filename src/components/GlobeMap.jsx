import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { geoArea, geoGraticule10, geoPath } from 'd3';
import { features, byId } from '../data/index.js';
import { clampGlobeZoom, createGlobeProjection, getGlobeCamera, globePointVisible, globeRadius, rotateGlobe, simplifyGlobeFeatures } from '../lib/globe.js';
import { Icon } from './Icon.jsx';
import CapitalPin from './CapitalPin.jsx';

const movingFeatures = simplifyGlobeFeatures(features);
const graticule = geoGraticule10();
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export default function GlobeMap({ decorative = false, region = 'mundo', target, typed = false, showCapitalPin = false, keepCorrect = true, solved = [], flash, onCountryClick, disabled = false }) {
  const boxRef = useRef(null);
  const svgRef = useRef(null);
  const frameRef = useRef(null);
  const wheelTimer = useRef(null);
  const pointers = useRef(new Map());
  const dragStart = useRef(null);
  const ignoreClick = useRef(false);
  const [size, setSize] = useState({ width: 1100, height: 590 });
  const [camera, setCamera] = useState(() => getGlobeCamera({ width: 1100, height: 590, region, typed, target, showCapitalPin, features }));
  const cameraRef = useRef(camera);
  const [moving, setMoving] = useState(false);
  const gradientId = useId().replaceAll(':', '');
  const { width, height } = size;
  const radius = globeRadius(width, height);

  // Coalesce high-frequency pointer events; never drop the latest camera state.
  const updateCamera = useCallback(next => {
    cameraRef.current = next;
    if (frameRef.current === null) frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      setCamera(cameraRef.current);
    });
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    observer.observe(boxRef.current);
    return () => {
      observer.disconnect();
      if (frameRef.current !== null) { cancelAnimationFrame(frameRef.current); frameRef.current = null; }
      clearTimeout(wheelTimer.current);
    };
  }, []);

  const focusId = typed ? target?.id : null;
  useEffect(() => {
    pointers.current.clear();
    setMoving(false);
    updateCamera(getGlobeCamera({ width, height, region, typed, target, showCapitalPin, features }));
    // In click modes, changing the question must NOT reveal or turn toward the
    // answer. Keep the player's orientation until the region or view changes.
  }, [width, height, region, typed, focusId, showCapitalPin, updateCamera]);

  useEffect(() => {
    if (decorative) return;
    const svg = svgRef.current;
    const wheel = event => {
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1);
      setMoving(true);
      updateCamera({ ...cameraRef.current, zoom: clampGlobeZoom(cameraRef.current.zoom * Math.exp(-delta * 0.002)) });
      clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(() => setMoving(false), 160);
    };
    svg.addEventListener('wheel', wheel, { passive: false });
    return () => svg.removeEventListener('wheel', wheel);
  }, [decorative, height, updateCamera]);

  const projection = useMemo(() => createGlobeProjection(width, height, camera), [width, height, camera]);
  const path = useMemo(() => geoPath(projection).digits(moving ? 1 : 2), [projection, moving]);
  const geometries = useMemo(() => (moving ? movingFeatures : features).map(feature => ({ feature, d: path(feature) })), [moving, path]);
  const grid = useMemo(() => path(graticule), [path]);
  const microCountries = useMemo(() => features.filter(f => byId[f.id] && geoArea(f) < 0.000012 && (region === 'mundo' || byId[f.id].continente === region)), [region]);
  const capitalPosition = showCapitalPin && globePointVisible(target?.coordenadas_capital, projection) ? projection(target.coordenadas_capital) : null;

  function pointerDown(event) {
    if (decorative || event.button !== 0) return;
    if (!pointers.current.size) { ignoreClick.current = false; dragStart.current = [event.clientX, event.clientY]; }
    pointers.current.set(event.pointerId, [event.clientX, event.clientY]);
    if (pointers.current.size > 1) { ignoreClick.current = true; setMoving(true); }
  }

  function pointerMove(event) {
    if (!pointers.current.has(event.pointerId)) return;
    const previous = [...pointers.current.values()];
    const oldPoint = pointers.current.get(event.pointerId);
    const nextPoint = [event.clientX, event.clientY];
    pointers.current.set(event.pointerId, nextPoint);
    const current = [...pointers.current.values()];
    if (current.length === 1) {
      const origin = ignoreClick.current ? oldPoint : dragStart.current;
      if (!ignoreClick.current && distance(nextPoint, origin) < 5) return;
      ignoreClick.current = true;
      setMoving(true);
      updateCamera(rotateGlobe(cameraRef.current, nextPoint[0] - origin[0], nextPoint[1] - origin[1], radius));
    } else if (current.length === 2) {
      const before = distance(previous[0], previous[1]);
      const after = distance(current[0], current[1]);
      const dx = (current[0][0] + current[1][0] - previous[0][0] - previous[1][0]) / 2;
      const dy = (current[0][1] + current[1][1] - previous[0][1] - previous[1][1]) / 2;
      let next = rotateGlobe(cameraRef.current, dx, dy, radius);
      if (before > 0) next = { ...next, zoom: clampGlobeZoom(next.zoom * after / before) };
      updateCamera(next);
    }
    event.preventDefault();
    // Capture only after a drag begins: ordinary taps keep their country path
    // as the click target, while drags continue outside the sphere or SVG.
    if (!svgRef.current.hasPointerCapture(event.pointerId)) svgRef.current.setPointerCapture(event.pointerId);
  }

  function pointerUp(event) {
    if (!pointers.current.has(event.pointerId)) return;
    if (event.type === 'pointercancel') ignoreClick.current = true;
    pointers.current.delete(event.pointerId);
    if (svgRef.current.hasPointerCapture(event.pointerId)) svgRef.current.releasePointerCapture(event.pointerId);
    if (!pointers.current.size) { setMoving(false); dragStart.current = null; }
    else dragStart.current = [...pointers.current.values()][0];
  }

  function changeZoom(factor) {
    updateCamera({ ...cameraRef.current, zoom: clampGlobeZoom(cameraRef.current.zoom * factor) });
  }
  function reset() {
    const initial = getGlobeCamera({ width, height, region, typed, target, showCapitalPin, features });
    updateCamera({ ...initial, zoom: 1 });
  }
  function choose(event, feature) {
    if (event.defaultPrevented || decorative || typed || disabled || !byId[feature.id] || (region !== 'mundo' && byId[feature.id].continente !== region)) return;
    onCountryClick?.(feature.id);
  }
  function classes(feature) {
    if (decorative) return `country decoration ${['076', '124', '250', '356', '036', '710', '392'].includes(feature.id) ? 'featured' : ''}`;
    const eligible = byId[feature.id] && (region === 'mundo' || byId[feature.id].continente === region);
    return `country ${eligible ? 'playable' : 'outside'}${typed ? ' typing-country' : ''}${typed && feature.id === target?.id ? ' target' : ''}${keepCorrect && solved.includes(feature.id) ? ' correct' : ''}${flash?.id === feature.id ? flash.correct ? ' correct' : ' wrong' : ''}`;
  }
  function keyDown(event) {
    if (decorative) return;
    const arrows = { ArrowLeft: [-40, 0], ArrowRight: [40, 0], ArrowUp: [0, -40], ArrowDown: [0, 40] };
    if (arrows[event.key]) {
      event.preventDefault();
      updateCamera(rotateGlobe(cameraRef.current, ...arrows[event.key], radius));
    } else if (['+', '=', '-', '_', 'Home'].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'Home') reset();
      else changeZoom(['+', '='].includes(event.key) ? 1.5 : 1 / 1.5);
    }
  }

  return <div ref={boxRef} className={`map-container globe-container ${decorative ? 'decorative-map' : ''}`} data-map-view="globe">
    <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} role={decorative ? 'img' : 'group'} tabIndex={decorative ? undefined : 0} aria-label={decorative ? 'Globo terrestre' : 'Globo terrestre interativo. Arraste ou use as setas para rodar. Use scroll, pinch ou os botões para ampliar.'}
      onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onLostPointerCapture={event => { if (event.target === svgRef.current) pointerUp(event); }} onKeyDown={keyDown}
      onClickCapture={event => { if (ignoreClick.current) { event.preventDefault(); event.stopPropagation(); ignoreClick.current = false; } }}>
      <defs>
        <pattern id={`${gradientId}-dots`} width="22" height="22" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="#456778" opacity="0.35" /></pattern>
        <radialGradient id={`${gradientId}-ocean`} cx="35%" cy="28%" r="80%"><stop stopColor="#234557" /><stop offset="0.64" stopColor="#132a3a" /><stop offset="1" stopColor="#07121c" /></radialGradient>
        <radialGradient id={`${gradientId}-light`} cx="35%" cy="28%" r="72%"><stop stopColor="#c1edff" stopOpacity="0.12" /><stop offset="0.5" stopColor="#06111b" stopOpacity="0" /><stop offset="1" stopColor="#020912" stopOpacity="0.75" /></radialGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${gradientId}-dots)`} />
      <circle className="globe-atmosphere" cx={width / 2} cy={height / 2} r={radius * camera.zoom + 3} />
      <circle className="globe-ocean" cx={width / 2} cy={height / 2} r={radius * camera.zoom} fill={`url(#${gradientId}-ocean)`} />
      <path d={grid} className="graticule" vectorEffect="non-scaling-stroke" />
      {geometries.map(({ feature, d }, index) => {
        const playable = d && !decorative && !typed && !disabled && byId[feature.id] && (region === 'mundo' || byId[feature.id].continente === region);
        return <path key={feature.key} data-country-id={feature.id} d={d || undefined} className={classes(feature)} vectorEffect="non-scaling-stroke" tabIndex={playable ? 0 : undefined} role={playable ? 'button' : undefined} aria-label={playable ? `Selecionar território ${index + 1} no globo` : undefined} onClick={event => choose(event, feature)} onKeyDown={event => { if (playable && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); choose({ defaultPrevented: false }, feature); } }} />;
      })}
      <circle className="globe-light" cx={width / 2} cy={height / 2} r={radius * camera.zoom} fill={`url(#${gradientId}-light)`} />
      {!decorative && microCountries.filter(feature => globePointVisible(byId[feature.id].coordenadas_centro, projection)).map(feature => {
        const position = projection(byId[feature.id].coordenadas_centro);
        return <circle key={feature.key} data-hit-country={feature.id} cx={position[0]} cy={position[1]} r="4" className={`micro-country ${classes(feature)}`} vectorEffect="non-scaling-stroke" onClick={event => choose(event, feature)} />;
      })}
      {!decorative && capitalPosition && <CapitalPin position={capitalPosition} countryId={target.id} />}
    </svg>
    {!decorative && <>
      <div className="map-caption"><span className="status-dot" /> GLOBO INTERATIVO <span className="map-scale">{camera.zoom.toFixed(1)}×</span></div>
      <div className="map-controls">
        <button aria-label="Aumentar zoom" onClick={() => changeZoom(1.6)}><Icon name="plus" /></button>
        <button aria-label="Diminuir zoom" onClick={() => changeZoom(1 / 1.6)}><Icon name="minus" /></button>
        <button aria-label="Recentrar globo" title="Recentrar globo" onClick={reset}><Icon name="crosshair" /></button>
      </div>
      <div className="map-help"><span>ARRASTE PARA RODAR A ESFERA</span><span>SCROLL / PINCH PARA ZOOM</span></div>
      <div className="map-credit">NATURAL EARTH · GLOBO 3D</div>
    </>}
  </div>;
}
