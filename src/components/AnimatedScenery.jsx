import { useEffect, useRef } from 'react';
import { createSceneryRenderer } from '../lib/scenery-renderer.js';
import { createSceneryLoop } from '../lib/scenery-loop.js';

/** Static picture remains the fallback; motion never captures pointer events. */
export default function AnimatedScenery({imageRef}){
  const canvasRef=useRef(null);
  useEffect(()=>{
    const canvas=canvasRef.current,image=imageRef.current;
    if(!canvas||!image)return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    const app=canvas.closest('.app');
    let renderer=null,contextLost=false;
    const canRun=()=>Boolean(renderer)&&!contextLost&&!document.hidden&&!reduced.matches&&!app?.querySelector('.play-screen');
    const loop=createSceneryLoop({draw:time=>renderer?.render(time),canRun});
    const sync=()=>{
      canvas.dataset.ready=renderer&&!contextLost&&!reduced.matches?'true':'false';
      loop.sync();
    };
    const load=()=>{
      if(!image.complete||!image.naturalWidth)return;
      loop.stop();renderer?.destroy();renderer=createSceneryRenderer(canvas,image);contextLost=false;
      renderer?.render(loop.time);sync();
    };
    const resize=new ResizeObserver(()=>{if(!contextLost)renderer?.render(loop.time);sync();});resize.observe(canvas);
    // The shared background is also present on results/statistics; stop drawing behind active maps.
    const observer=new MutationObserver(sync);if(app)observer.observe(app,{childList:true,subtree:true});
    const onLost=event=>{event.preventDefault();contextLost=true;sync();};
    const restored=()=>{contextLost=false;load();};
    image.addEventListener('load',load);canvas.addEventListener('webglcontextlost',onLost);canvas.addEventListener('webglcontextrestored',restored);
    document.addEventListener('visibilitychange',sync);window.addEventListener('pageshow',sync);window.addEventListener('focus',sync);document.addEventListener('resume',sync);reduced.addEventListener('change',sync);
    load();
    return()=>{loop.destroy();observer.disconnect();resize.disconnect();image.removeEventListener('load',load);canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',restored);document.removeEventListener('visibilitychange',sync);window.removeEventListener('pageshow',sync);window.removeEventListener('focus',sync);document.removeEventListener('resume',sync);reduced.removeEventListener('change',sync);renderer?.destroy();};
  },[imageRef]);
  return <canvas className="scene-artwork-motion" ref={canvasRef} data-ready="false" aria-hidden="true"/>;
}
