import { useEffect, useRef } from 'react';
import { createSceneryRenderer } from '../lib/scenery-renderer.js';

/** Static picture remains the fallback; motion never captures pointer events. */
export default function AnimatedScenery({imageRef,hidden}){
  const canvasRef=useRef(null);
  const hiddenRef=useRef(hidden);hiddenRef.current=hidden;
  useEffect(()=>{
    const canvas=canvasRef.current,image=imageRef.current;
    if(!canvas||!image)return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    const app=canvas.closest('.app');
    let renderer=null,frame=0,last=0,elapsed=0,live=true;
    const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;};
    const canAnimate=()=>!hiddenRef.current&&!document.hidden&&!reduced.matches&&!app?.querySelector('.play-screen');
    const tick=now=>{
      frame=0;if(!live||!renderer){last=0;return;}
      if(!canAnimate()){sync();return;}
      if(!last||now-last>=1000/20){elapsed+=last?Math.min(now-last,100):0;last=now;renderer.render(elapsed/1000);}
      frame=requestAnimationFrame(tick);
    };
    const sync=()=>{
      if(!renderer)return;
      if(reduced.matches){stop();canvas.dataset.ready='false';return;}
      canvas.dataset.ready='true';
      if(canAnimate()){if(!frame)frame=requestAnimationFrame(tick);}else stop();
    };
    const load=()=>{
      if(!image.complete||!image.naturalWidth)return;
      stop();renderer?.destroy();renderer=createSceneryRenderer(canvas,image);
      if(renderer){renderer.render(elapsed/1000);sync();}else canvas.dataset.ready='false';
    };
    const resize=new ResizeObserver(()=>{renderer?.render(elapsed/1000);sync();});resize.observe(canvas);
    // The shared background is also present on results/statistics; stop drawing behind active maps.
    const observer=new MutationObserver(sync);if(app)observer.observe(app,{childList:true,subtree:true});
    const onLost=event=>{event.preventDefault();stop();canvas.dataset.ready='false';};
    image.addEventListener('load',load);canvas.addEventListener('webglcontextlost',onLost);canvas.addEventListener('webglcontextrestored',load);document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
    load();
    return()=>{live=false;stop();observer.disconnect();resize.disconnect();image.removeEventListener('load',load);canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',load);document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);renderer?.destroy();};
  },[imageRef]);
  return <canvas className="scene-artwork-motion" ref={canvasRef} data-ready="false" aria-hidden="true"/>;
}
