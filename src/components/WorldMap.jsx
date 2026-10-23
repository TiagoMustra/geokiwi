import { useEffect, useMemo, useRef, useState } from 'react';
import { geoNaturalEarth1, geoPath, geoGraticule10, geoArea, select, zoom, zoomIdentity } from 'd3';
import { features, byId } from '../data/index.js';
import { Icon } from './Icon.jsx';
import { focusGeometry } from '../lib/map.js';

/** React owns each SVG country. D3 owns only the parent group's transform. */
export default function WorldMap({ decorative = false, region = 'mundo', target, typed = false, difficulty = 'normal', solved = [], flash, onCountryClick, disabled = false, round = 0 }) {
  const boxRef = useRef(null);
  const svgRef = useRef(null);
  const groupRef = useRef(null);
  const zoomRef = useRef(null);
  const [size, setSize] = useState({ width: 1100, height: 590 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, []);

  const { width, height } = size;
  const projection = useMemo(() => geoNaturalEarth1().fitExtent([[20, 30], [width - 20, height - 30]], { type: 'FeatureCollection', features }), [width, height]);
  const path = useMemo(() => geoPath(projection), [projection]);
  const geometries = useMemo(() => features.map(f => ({ feature: f, d: path(f) })), [path]);
  const graticule = useMemo(() => path(geoGraticule10()), [path]);
  const eligible = useMemo(() => features.filter(f => byId[f.id] && (region === 'mundo' || byId[f.id].continente === region)), [region]);
  const targets = useMemo(() => eligible.filter(f => geoArea(f) < 0.000012), [eligible]);

  useEffect(() => {
    if (decorative) return;
    const element = select(svgRef.current);
    const behavior = zoom().scaleExtent([0.8, 120]).extent([[0, 0], [width, height]])
      .translateExtent([[-width * 8, -height * 8], [width * 9, height * 9]])
      .clickDistance(5)
      .on('zoom', event => {
        select(groupRef.current).attr('transform', event.transform);
        setScale(event.transform.k);
      });
    zoomRef.current = behavior;
    element.call(behavior).on('dblclick.zoom', null);
    return () => { element.interrupt(); element.on('.zoom', null); };
  }, [decorative, width, height]);

  useEffect(() => {
    if (decorative || !zoomRef.current) return;
    const selection = typed && target ? features.filter(f => f.id === target.id) : eligible;
    const bounds = path.bounds(typed && target ? focusGeometry(selection, target.coordenadas_centro) : { type: 'FeatureCollection', features: selection });
    const [[x0, y0], [x1, y1]] = bounds;
    const k = region === 'mundo' && !typed ? 1 : Math.min(typed ? 75 : 8, 0.76 / Math.max((x1 - x0) / width, (y1 - y0) / height));
    const transform = !typed && region === 'mundo' ? zoomIdentity : zoomIdentity.translate(width / 2, height / 2).scale(Math.max(0.8, k)).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    select(svgRef.current).transition().duration(reduced ? 0 : 650).call(zoomRef.current.transform, transform);
  }, [decorative, target?.id, region, typed, width, height, path, eligible, round]);

  function countryClass(f) {
    if (decorative) return `country decoration ${['076', '124', '250', '356', '036', '710', '392'].includes(f.id) ? 'featured' : ''}`;
    const inRegion = byId[f.id] && (region === 'mundo' || byId[f.id].continente === region);
    let classes = `country ${inRegion ? 'playable' : 'outside'} ${typed ? 'typing-country' : ''}`;
    if (typed && f.id === target?.id) classes += ' target';
    if (difficulty === 'normal' && solved.includes(f.id)) classes += ' correct';
    if (flash?.id === f.id) classes += flash.correct ? ' correct' : ' wrong';
    return classes;
  }

  function choose(event, f) {
    if (event.defaultPrevented || disabled || typed || !byId[f.id] || (region !== 'mundo' && byId[f.id].continente !== region)) return;
    onCountryClick?.(f.id);
  }

  return <div ref={boxRef} className={`map-container ${decorative ? 'decorative-map' : ''}`}>
    <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} aria-label={decorative ? 'Mapa do mundo' : 'Mapa interativo. Arraste para mover e use a rolagem ou os botões para ampliar.'} role={decorative ? 'img' : 'group'}>
      <defs><pattern id={decorative ? 'hero-dots' : 'map-dots'} width="18" height="18" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="1" height="1" fill="#33404d" opacity="0.45" /></pattern></defs>
      <rect width={width} height={height} fill={`url(#${decorative ? 'hero-dots' : 'map-dots'})`} />
      <g ref={groupRef}>
        <path d={graticule} className="graticule" vectorEffect="non-scaling-stroke" />
        {geometries.map(({ feature: f, d }, index) => <path key={f.key} data-country-id={f.id} d={d} className={countryClass(f)} vectorEffect="non-scaling-stroke" tabIndex={!decorative && !typed && !disabled && byId[f.id] && (region === 'mundo' || byId[f.id].continente === region) ? 0 : undefined} role={!decorative && !typed && byId[f.id] ? 'button' : undefined} aria-label={!decorative && !typed && byId[f.id] ? `Selecionar território ${index + 1} no mapa` : undefined} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose({ defaultPrevented: false }, f); } }} onClick={event => choose(event, f)} />)}
        {!decorative && targets.map(f => {
          const center = projection(byId[f.id].coordenadas_centro);
          if (!center) return null;
          return <circle key={`hit-${f.key}`} data-hit-country={f.id} cx={center[0]} cy={center[1]} r={4 / scale} className={`micro-country ${countryClass(f)}`} vectorEffect="non-scaling-stroke" onClick={event => choose(event, f)} />;
        })}
        {decorative && [byId['076'], byId['250'], byId['392']].filter(Boolean).map(c => {
          const [x, y] = projection(c.coordenadas_centro);
          return <g key={c.id} transform={`translate(${x},${y})`} className="hero-map-marker"><path d="M-5-5H5V5H-5Z" /><path d="M-12 0h-5m29 0h5M0-12v-5m0 29v5" /></g>;
        })}
      </g>
    </svg>
    {!decorative && <>
      <div className="map-caption"><span className="status-dot" /> MAPA INTERATIVO <span className="map-scale">{scale.toFixed(1)}×</span></div>
      <div className="map-controls">
        <button aria-label="Aumentar zoom" onClick={() => select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy, 1.6)}><Icon name="plus" /></button>
        <button aria-label="Diminuir zoom" onClick={() => select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy, 1 / 1.6)}><Icon name="minus" /></button>
        <button aria-label="Ver mapa inteiro" title="Ver mapa inteiro" onClick={() => select(svgRef.current).transition().duration(350).call(zoomRef.current.transform, zoomIdentity)}><Icon name="crosshair" /></button>
      </div>
      <div className="map-help"><span>ARRASTE PARA EXPLORAR</span><span>SCROLL PARA ZOOM</span></div>
      <div className="map-credit">NATURAL EARTH · D3.JS</div>
    </>}
  </div>;
}
