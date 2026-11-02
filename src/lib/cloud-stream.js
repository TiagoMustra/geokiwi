// Keep the previous doubled peak speed, now constant and always left-to-right.
export const CLOUD_SPEED=2.1;
export function cloudScrollOffset(seconds,width){
  if(!Number.isFinite(seconds)||!Number.isFinite(width)||width<=0)return 0;
  return ((seconds*CLOUD_SPEED%width)+width)%width/width;
}
const smooth=(a,b,value)=>{const t=Math.max(0,Math.min(1,(value-a)/(b-a)));return t*t*(3-2*t);};

/** Separate the existing cloud pixels from the parchment sky; no extra artwork download.
 * Transparent tile edges make horizontal repetition seamless. Mountain mist is left alone.
 */
export function buildCloudLayer(pixels,width,height,portrait=false){
  const result=new Uint8Array(width*height*4);
  const bottom=portrait ? .31 : .295;
  const globe=portrait?[.9,.325,.11,.075]:[.905,.29,.07,.09];
  for(let y=0;y<Math.ceil(height*bottom);y++){
    const ref=(y*width+Math.floor(width*.5))*4;
    const reference=pixels[ref]>230?pixels[ref]:247;
    for(let x=0;x<width;x++){
      const p=(y*width+x)*4,r=pixels[p],g=pixels[p+1],b=pixels[p+2];
      if(b-r < -12||b-g < -20)continue;
      const outsideGlobe=smooth(.95,1.18,Math.hypot((x/width-globe[0])/globe[2],(y/height-globe[1])/globe[3]));
      const edge=smooth(0,20,Math.min(x,width-1-x));
      const alpha=smooth(10,24,reference-r)*outsideGlobe*edge;
      if(alpha<=0)continue;
      result[p]=r;result[p+1]=g;result[p+2]=b;result[p+3]=Math.round(alpha*255);
    }
  }
  return result;
}
