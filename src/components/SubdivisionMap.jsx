import { useEffect, useMemo, useRef } from 'react';
import { geoAlbersUsa, geoMercator, geoPath, select, zoom, zoomIdentity } from 'd3';
import { Icon } from './Icon.jsx';

export default function SubdivisionMap({ kind, features, districts = null, onChoose, answered = false, solved = [], wrong = [], flash, keepCorrect = true }) {
  const svgRef = useRef(null), groupRef = useRef(null), zoomRef = useRef(null);
  const paths = useMemo(() => {
    const collection = fs => ({ type: 'FeatureCollection', features: fs });
    const groups = kind === 'municipios' ? ['continente', 'acores', 'madeira'] : ['usa'];
    return groups.flatMap(group => {
      const list = kind === 'municipios' ? features.filter(f => f.properties.group === group) : features;
      if (!list.length) return [];
      const projection = kind === 'estados' ? geoAlbersUsa().fitExtent([[45,55],[1055,600]], collection(list))
        : geoMercator().fitExtent(group === 'continente' ? [[340,35],[840,585]] : group === 'acores' ? [[25,430],[310,580]] : [[845,460],[1075,590]], collection(list));
      const path = geoPath(projection);
      return list.map(feature => ({ feature, d: path(feature) }));
    });
  }, [features, kind]);
  const districtPath = useMemo(() => {
    if (kind !== 'municipios' || !districts) return null;
    const mainland = features.filter(f => f.properties.group === 'continente');
    const projection = geoMercator().fitExtent([[340,35],[840,585]], { type:'FeatureCollection', features: mainland });
    return geoPath(projection)(districts);
  }, [kind, features, districts]);
  useEffect(() => {
    const behavior = zoom().scaleExtent([1, 20]).extent([[0,0],[1100,650]]).clickDistance(5).on('zoom', e => select(groupRef.current).attr('transform', e.transform));
    zoomRef.current = behavior; const svg=select(svgRef.current); svg.call(behavior).on('dblclick.zoom',null);
    return () => svg.on('.zoom', null);
  }, []);
  return <div className="map-container subdivision-map"><svg ref={svgRef} viewBox="0 0 1100 650" role="group" aria-label="Mapa interativo. Arrasta para mover e usa os botões para ampliar."><rect width="1100" height="650" className="mercator-ocean"/><g ref={groupRef}>{paths.map(({feature,d}) => {
    const id=String(feature.id); const classes=`country playable${keepCorrect && solved.includes(id) ? ' correct' : ''}${wrong.includes(id) ? ' wrong' : ''}${flash?.id===id ? flash.correct ? ' correct':' wrong' : ''}${flash && !flash.correct && flash.targetId===id ? kind === 'municipios' ? ' reveal-answer' : ' correct' : ''}`;
    return <path key={id} data-subdivision-id={id} d={d || undefined} className={classes} vectorEffect="non-scaling-stroke" role="button" tabIndex={answered ? -1 : 0} aria-label={`Selecionar ${feature.properties.name}`} onClick={e => { if (!e.defaultPrevented && !answered) onChoose(id); }} onKeyDown={e => { if (!answered && (e.key==='Enter'||e.key===' ')) {e.preventDefault();onChoose(id);} }} />;
  })}{districtPath && <path d={districtPath} className="district-boundary" vectorEffect="non-scaling-stroke" pointerEvents="none" aria-hidden="true"/>}</g></svg>{kind === 'municipios' && <div className="district-legend"><i/> LIMITE DE DISTRITO</div>}<div className="map-controls"><button aria-label="Aumentar zoom" onClick={() => select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy,1.5)}><Icon name="plus"/></button><button aria-label="Diminuir zoom" onClick={() => select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy,1/1.5)}><Icon name="minus"/></button><button aria-label="Recentrar" onClick={() => select(svgRef.current).transition().duration(200).call(zoomRef.current.transform,zoomIdentity)}><Icon name="crosshair"/></button></div><div className="map-credit">{kind==='municipios' ? 'DGT · CAOP' : 'US CENSUS · US ATLAS'}</div></div>;
}
