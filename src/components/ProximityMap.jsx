import { useEffect, useRef, useState } from 'react';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { features, byId } from '../data/index.js';
import { useLocale } from '../i18n/LocaleContext.jsx';
import { countryAtPoint, wrapLongitude, initialProximityBounds, guessConnection, physicalAnswerFeature, revealMapBounds } from '../lib/proximity-map.js';
import { Icon } from './Icon.jsx';
import '../proximity-map.css';

const selectableLand = features.filter(feature=>byId[feature.id]);
const empty = () => ({type:'FeatureCollection',features:[]});
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const motionDuration = () => reducedMotion() ? 0 : 450;
const colors = {correct:'#5b996c',wrong:'#ce6672',reveal:'#d3a34c'};

/** Dedicated physical map: no country paths, country hover, selection or microstate dots. */
export default function ProximityMap({region='mundo',disabled=false,onPointClick,guessPoint=null,reveal=null,reviewPoints=null,geographicFeature=null,geographicFeatureStatus='reveal',focusReveal=true,revealMaxZoom=8,initialBounds=null}) {
  const {locale,countryName,capitalName}=useLocale(); const en=locale==='en';
  const host=useRef(null), mapRef=useRef(null), library=useRef(null), markers=useRef([]), propsRef=useRef(null);
  const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
  propsRef.current={disabled,onPointClick};
  const reset=()=>{
    const map=mapRef.current;if(!map)return;
    map.fitBounds(initialBounds||initialProximityBounds(region),{padding:24,maxZoom:5,duration:motionDuration()});
  };
  useEffect(()=>{
    let live=true,observer; let map;
    setReady(false);setFailed(false);
    import('maplibre-gl').then(m=>{
      if(!live)return;
      library.current=m;m.setWorkerUrl(workerUrl);m.setWorkerCount(2);
      map=new m.Map({container:host.current,style:'/maps/proximity-style.json',center:[0,20],zoom:1.5,minZoom:0,maxZoom:17,attributionControl:false,dragRotate:false,pitchWithRotate:false,touchPitch:false,maxPitch:0,renderWorldCopies:true,clickTolerance:6,canvasContextAttributes:{antialias:true}});
      mapRef.current=map;map.touchZoomRotate.disableRotation();map.doubleClickZoom.disable();
      map.addControl(new m.AttributionControl({compact:true}),'bottom-right');
      map.getCanvas().setAttribute('aria-label',en?'Physical map. Drag or use arrow keys to move; scroll to zoom. Enter places a pin at the centre.':'Mapa físico. Arrasta ou usa as setas para mover; scroll para ampliar. Enter coloca o pin no centro.');
      const submit=point=>{const current=propsRef.current;if(current.disabled)return;const coords=[wrapLongitude(point.lng),point.lat];current.onPointClick?.(coords,countryAtPoint(coords,selectableLand));};
      map.on('click',event=>{if(!event.originalEvent?.defaultPrevented)submit(event.lngLat);});
      map.getCanvas().addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();submit(map.getCenter());}});
      map.on('load',()=>{
        if(!live)return;
        map.addSource('answer-feature',{type:'geojson',data:empty()});
        map.addLayer({id:'answer-area',type:'fill',source:'answer-feature',filter:['==',['geometry-type'],'Polygon'],paint:{'fill-color':colors.reveal,'fill-opacity':0.16}});
        map.addLayer({id:'answer-outline',type:'line',source:'answer-feature',paint:{'line-color':colors.reveal,'line-width':['case',['==',['geometry-type'],'LineString'],4,2.5]}});
        map.addSource('answer-connection',{type:'geojson',data:empty()});
        map.addLayer({id:'answer-connection-line',type:'line',source:'answer-connection',paint:{'line-color':'#b0784e','line-width':2,'line-dasharray':[2,2],'line-opacity':0.85}});
        setReady(true);
      });
      map.on('error',event=>{if(!event.sourceId&&!event.tile&&live)setFailed(true);});
      map.fitBounds(initialBounds||initialProximityBounds(region),{padding:24,maxZoom:5,duration:0});
      observer=new ResizeObserver(()=>map.resize());observer.observe(host.current);
    }).catch(()=>{if(live)setFailed(true);});
    return()=>{live=false;observer?.disconnect();markers.current.forEach(marker=>marker.remove());markers.current=[];map?.remove();mapRef.current=null;};
  },[attempt]);

  useEffect(()=>{if(ready)reset();},[region,ready,initialBounds]);
  useEffect(()=>{
    const map=mapRef.current;if(!map||!ready)return;
    map.getCanvas().setAttribute('aria-label',en?'Physical map. Drag or use arrow keys to move; scroll to zoom. Enter places a pin at the centre.':'Mapa físico. Arrasta ou usa as setas para mover; scroll para ampliar. Enter coloca o pin no centro.');
    markers.current.forEach(marker=>marker.remove());markers.current=[];
    const m=library.current;
    for(const point of reviewPoints||[]){
      const dot=document.createElement('div');dot.className=`proximity-review-dot ${point.correct?'is-correct':'is-wrong'}`;
      dot.setAttribute('role','img');dot.setAttribute('aria-label',point.label);dot.title=point.label;
      markers.current.push(new m.Marker({element:dot,anchor:'center'}).setLngLat(point.coordinates).addTo(map));
    }
    if(guessPoint){const dot=document.createElement('div');dot.className='proximity-guess-dot';markers.current.push(new m.Marker({element:dot,anchor:'center'}).setLngLat(guessPoint).addTo(map));}
    const answerPoint=reveal?(reveal.showCapital?reveal.country.coordenadas_capital:reveal.country.coordenadas_centro):null;
    if(answerPoint){
      const dot=document.createElement('div');dot.className=`proximity-answer-dot ${reveal.correct?'is-correct':'is-revealed'}`;
      const label=document.createElement('span');label.className='proximity-answer-label';label.textContent=reveal.showCapital?`${capitalName(reveal.country)} · ${countryName(reveal.country)}`:countryName(reveal.country);dot.append(label);
      markers.current.push(new m.Marker({element:dot,anchor:'center'}).setLngLat(answerPoint).addTo(map));
    }
    map.getSource('answer-feature')?.setData(physicalAnswerFeature(geographicFeature));
    map.getSource('answer-connection')?.setData(guessConnection(guessPoint,answerPoint));
    const color=colors[geographicFeatureStatus]||colors.reveal;map.setPaintProperty('answer-area','fill-color',color);map.setPaintProperty('answer-outline','line-color',color);
  },[ready,reveal?.country.id,reveal?.correct,reveal?.showCapital,guessPoint,reviewPoints,geographicFeature,geographicFeatureStatus,locale]);

  useEffect(()=>{
    const map=mapRef.current;if(!map||!ready||!reviewPoints?.length)return;
    const bounds=revealMapBounds({type:'MultiPoint',coordinates:reviewPoints.map(point=>point.coordinates)});
    if(bounds)map.fitBounds(bounds,{padding:50,maxZoom:7,duration:motionDuration()});
  },[ready,reviewPoints]);

  useEffect(()=>{
    const map=mapRef.current;if(!map||!ready||!focusReveal||!reveal)return;
    const point=reveal.showCapital?reveal.country.coordenadas_capital:reveal.country.coordenadas_centro;
    const bounds=revealMapBounds(geographicFeature,point,guessPoint);if(!bounds)return;
    const height=host.current.clientHeight,width=host.current.clientWidth;
    const padding={top:Math.min(height*.28,220),bottom:Math.min(height*.24,175),left:Math.min(width*.1,80),right:Math.min(width*.1,80)};
    map.fitBounds(bounds,{padding,maxZoom:revealMaxZoom,duration:motionDuration()});
  },[ready,focusReveal,reveal?.country.id,geographicFeature,guessPoint,revealMaxZoom]);

  return <div className="proximity-map" data-map-view="physical">
    <div className="proximity-map-host" ref={host}/>
    {!ready&&!failed&&<div className="proximity-loading" role="status">{en?'Loading the physical map…':'A carregar o mapa físico…'}</div>}
    {failed&&<div className="proximity-map-error" role="status"><span>{en?'The map could not load.':'Não foi possível carregar o mapa.'}</span><button type="button" onClick={()=>setAttempt(value=>value+1)}>{en?'Try again':'Tentar novamente'}</button></div>}
    <div className="map-controls proximity-map-controls"><button type="button" aria-label={en?'Zoom in':'Aumentar zoom'} onClick={()=>mapRef.current?.zoomIn({duration:200})}><Icon name="plus"/></button><button type="button" aria-label={en?'Zoom out':'Diminuir zoom'} onClick={()=>mapRef.current?.zoomOut({duration:200})}><Icon name="minus"/></button><button type="button" aria-label={en?'Recenter map':'Recentrar mapa'} onClick={reset}><Icon name="crosshair"/></button></div>
  </div>;
}
