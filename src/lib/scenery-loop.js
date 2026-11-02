/** Pause/resume from current browser visibility, without React state racing the event.
 * The clock uses elapsed time, so slow rendering does not slow the animation itself.
 */
export function createSceneryLoop({draw,canRun,requestFrame=callback=>requestAnimationFrame(callback),cancelFrame=id=>cancelAnimationFrame(id),fps=20}){
  let frame=null,previous=null,elapsed=0,live=true;
  const stop=()=>{if(frame!==null)cancelFrame(frame);frame=null;previous=null;};
  const tick=now=>{
    frame=null;if(!live||!canRun()){previous=null;return;}
    if(previous===null||now-previous>=1000/fps){
      if(previous!==null)elapsed+=Math.max(0,now-previous);
      previous=now;draw(elapsed/1000);
    }
    frame=requestFrame(tick);
  };
  return{stop,sync(){if(!live)return;if(canRun()){if(frame===null)frame=requestFrame(tick);}else stop();},get time(){return elapsed/1000;},destroy(){live=false;stop();}};
}
