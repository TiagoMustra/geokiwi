import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { geoPath, geoArea, select, zoom, zoomIdentity } from 'd3';
import { features, byId } from '../data/index.js';
import { Icon } from './Icon.jsx';
import { focusGeometry, getRegionTransform, createFlatProjection, getWorldCopies, createFlatGraticule } from '../lib/map.js';
import { mapPoliticalFeature } from '../lib/catalog.js';
import { loadDetailedWorld } from '../lib/flat-detail.js';
import CapitalPin from './CapitalPin.jsx';
import MapAnswerLabel from './MapAnswerLabel.jsx';

/** React owns country paths; D3 moves their parent. Each horizontal copy uses
 * the same country IDs and game state, so wrapping cannot create new answers. */
export default function WorldMap({ decorative = false, region = 'mundo', target, typed = false, showCapitalPin = false, keepCorrect = true, solved = [], flash, onCountryClick, disabled = false, reveal = null, queue = null }) {
  const boxRef = useRef(null);
  const svgRef = useRef(null);
  const groupRef = useRef(null);
  const zoomRef = useRef(null);
  const [size, setSize] = useState({ width: 1100, height: 590 });
  const [detail, setDetail] = useState(null);
  const [view, setView] = useState(() => getWorldCopies(zoomIdentity, createFlatProjection(1100, 590, decorative ? 'mundo' : region), 1100));
  const { width, height } = size;
  const scale = view.k;

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize(previous => previous.width === width && previous.height === height ? previous : { width, height });
    });
    observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (decorative) return;
    let active = true;
    loadDetailedWorld(features).then(land => { if (active) setDetail(land); }).catch(() => { /* The bundled 1:50m map remains fully playable. */ });
    return () => { active = false; };
  }, [decorative]);

  const projection = useMemo(() => createFlatProjection(width, height, decorative ? 'mundo' : region), [width, height, region, decorative]);
  const path = useMemo(() => geoPath(projection), [projection]);
  const period = 2 * Math.PI * projection.scale();
  const geometries = useMemo(() => (detail || features).map(mapPoliticalFeature).map(feature => ({ feature, d: path(feature) })), [path, detail]);
  const graticule = useMemo(() => path(createFlatGraticule()), [path]);
  const playableIds = useMemo(() => queue ? new Set(queue.map(c => c.id)) : null, [queue]);
  const eligible = useMemo(() => features.filter(f => byId[f.id] && (!playableIds || playableIds.has(f.id)) && (region === 'mundo' || byId[f.id].continente === region)), [region, playableIds]);
  const targets = useMemo(() => eligible.filter(f => geoArea(f) < 0.000012).map(feature => ({ feature, center: projection(byId[feature.id].coordenadas_centro) })), [eligible, projection]);
  const revealPosition = reveal ? projection(reveal.showCapital ? reveal.country.coordenadas_capital : reveal.country.coordenadas_centro) : null;
  const capitalPosition = showCapitalPin && target?.coordenadas_capital ? projection(target.coordenadas_capital) : null;

  useEffect(() => {
    if (decorative) return;
    const element = select(svgRef.current);
    const [, cy] = projection.translate();
    const behavior = zoom().scaleExtent([0.8, 120]).extent([[0, 0], [width, height]])
      // Longitude is unlimited. Only constrain latitude to Mercator's polar bounds.
      .translateExtent([[-Infinity, cy - period / 2], [Infinity, cy + period / 2]])
      .clickDistance(5)
      .on('zoom', event => {
        select(groupRef.current).attr('transform', event.transform);
        const next = getWorldCopies(event.transform, projection, width);
        setView(previous => previous.k === next.k && previous.first === next.first && previous.last === next.last && previous.primary === next.primary ? previous : next);
      });
    zoomRef.current = behavior;
    element.call(behavior).on('dblclick.zoom', null);
    return () => { element.interrupt(); element.on('.zoom', null); };
  }, [decorative, width, height, projection, period]);

  const focusId = typed ? target?.id : null;
  useEffect(() => {
    if (decorative || !zoomRef.current) return;
    if (!typed) {
      select(svgRef.current).interrupt().call(zoomRef.current.transform, getRegionTransform(region, projection, width, height));
      return;
    }
    // Camera bounds intentionally use the bundled geometry: loading extra detail
    // must never reset a camera the player has already moved.
    const selection = features.filter(f => f.id === target.id);
    const center = showCapitalPin ? target.coordenadas_capital : target.coordenadas_centro;
    const [[left, top], [right, bottom]] = path.bounds(focusGeometry(selection, center));
    const pin = showCapitalPin ? projection(target.coordenadas_capital) : null;
    const x0 = pin ? Math.min(left, pin[0]) : left, y0 = pin ? Math.min(top, pin[1]) : top;
    const x1 = pin ? Math.max(right, pin[0]) : right, y1 = pin ? Math.max(bottom, pin[1]) : bottom;
    const k = Math.max(0.8, Math.min(75, 0.76 / Math.max((x1 - x0) / width, (y1 - y0) / height)));
    const transform = zoomIdentity.translate(width / 2, height / 2).scale(k).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    select(svgRef.current).interrupt().transition().duration(reduced ? 0 : 650).call(zoomRef.current.transform, transform);
  }, [decorative, focusId, region, typed, showCapitalPin, width, height, path, projection]);

  const countryClass = useCallback(f => {
    if (decorative) return `country decoration ${['076', '124', '250', '356', '036', '710', '392'].includes(f.id) ? 'featured' : ''}`;
    const inRegion = byId[f.id] && (!playableIds || playableIds.has(f.id)) && (region === 'mundo' || byId[f.id].continente === region);
    let classes = `country ${inRegion ? 'playable' : 'outside'} ${typed ? 'typing-country' : ''}`;
    if (typed && f.id === target?.id) classes += ' target';
    if (keepCorrect && solved.includes(f.id)) classes += ' correct';
    if (flash?.id === f.id) classes += flash.correct ? ' correct' : ' wrong';
    return classes;
  }, [decorative, region, typed, target?.id, keepCorrect, solved, flash, playableIds]);

  const choose = useCallback((event, f) => {
    if (event.defaultPrevented || disabled || typed || !byId[f.id] || (playableIds && !playableIds.has(f.id)) || (region !== 'mundo' && byId[f.id].continente !== region)) return;
    onCountryClick?.(f.id);
  }, [disabled, typed, region, onCountryClick, playableIds]);

  // Reuse the expensive path elements while zooming. Duplicate only the small
  // interactive wrappers; geography remains SVG-sharp at every zoom level.
  const countryPaths = useMemo(() => geometries.map(({ feature: f, d }, index) => <path key={f.key} data-country-id={f.id} d={d} className={countryClass(f)} vectorEffect="non-scaling-stroke" role={!decorative && !typed && byId[f.id] && (!playableIds || playableIds.has(f.id)) ? 'button' : undefined} aria-label={!decorative && !typed && byId[f.id] ? `Selecionar território ${index + 1} no mapa` : undefined} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose({ defaultPrevented: false }, f); } }} onClick={event => choose(event, f)} />), [geometries, countryClass, decorative, typed, choose, playableIds]);
  const copies = Array.from({ length: view.last - view.first + 1 }, (_, index) => view.first + index);

  // Focus only the central visible world via delegated keyboard navigation.
  useEffect(() => {
    const paths = groupRef.current?.querySelectorAll('[data-world-copy] .country[role="button"]');
    paths?.forEach(element => {
      const id = element.dataset.countryId;
      const primary = Number(element.closest('[data-world-copy]').dataset.worldCopy) === view.primary;
      element.setAttribute('tabindex', primary && !disabled && !typed && byId[id] && (region === 'mundo' || byId[id].continente === region) ? '0' : '-1');
    });
  }, [view.primary, view.first, view.last, detail, disabled, typed, region]);

  return <div ref={boxRef} className={`map-container mercator-map ${decorative ? 'decorative-map' : ''}`}>
    <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} aria-label={decorative ? 'Mapa do mundo' : 'Mapa interativo com deslocamento horizontal contínuo. Arraste para mover e use a rolagem ou os botões para ampliar.'} role={decorative ? 'img' : 'group'}>
      <rect width={width} height={height} className="mercator-ocean" />
      <g ref={groupRef}>
        {copies.map(copy => <g key={copy} data-world-copy={copy} transform={`translate(${copy * period},0)`} aria-hidden={!decorative && copy !== view.primary ? true : undefined}>
          <path d={graticule} className="graticule" vectorEffect="non-scaling-stroke" />
          {countryPaths}
          {!decorative && targets.map(({ feature: f, center }) => center && <circle key={`hit-${f.key}`} data-hit-country={f.id} cx={center[0]} cy={center[1]} r={4 / scale} className={`micro-country ${countryClass(f)}`} vectorEffect="non-scaling-stroke" onClick={event => choose(event, f)} />)}
          {!decorative && capitalPosition && !reveal && <CapitalPin position={capitalPosition} countryId={target.id} scale={scale} />}
          {!decorative && revealPosition && <MapAnswerLabel position={revealPosition} {...reveal} scale={scale} />}
          {decorative && [byId['076'], byId['250'], byId['392']].map(c => {
            const [x, y] = projection(c.coordenadas_centro);
            return <g key={c.id} transform={`translate(${x},${y})`} className="hero-map-marker"><path d="M-5-5H5V5H-5Z" /><path d="M-12 0h-5m29 0h5M0-12v-5m0 29v5" /></g>;
          })}
        </g>)}
      </g>
    </svg>
    {!decorative && <>
      <div className="map-caption"><span className="status-dot" /> MAPA INTERATIVO <span className="map-scale">{scale.toFixed(1)}×</span></div>
      <div className="map-controls">
        <button aria-label="Aumentar zoom" onClick={() => select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy, 1.6)}><Icon name="plus" /></button>
        <button aria-label="Diminuir zoom" onClick={() => select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy, 1 / 1.6)}><Icon name="minus" /></button>
        <button aria-label="Recentrar região" title="Recentrar região" onClick={() => select(svgRef.current).transition().duration(350).call(zoomRef.current.transform, getRegionTransform(region, projection, width, height))}><Icon name="crosshair" /></button>
      </div>
      <div className="map-help"><span>ARRASTE SEM LIMITES LATERAIS</span><span>SCROLL PARA ZOOM</span></div>
      <div className="map-credit">NATURAL EARTH · {detail ? '1:10M' : '1:50M'}</div>
    </>}
  </div>;
}
