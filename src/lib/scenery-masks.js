// Derive low-resolution animation masks from the actual island art. The red
// channel is distance to solid land; green expands the leaf edges slightly.
export function buildSceneryMasks(pixels,width,height,sourceScale=1,portrait=false){
  const count=width*height,stride=width+1;
  const blue=new Uint32Array(stride*(height+1)),green=new Uint32Array(blue.length);
  const isWater=(r,g,b)=>b-r>13&&g-r>7&&b>=g*.92;
  const isLeaf=(r,g,b)=>g-r>-13&&g-b>22&&Math.max(r,g,b)<210;
  for(let y=0;y<height;y++){
    let waterRow=0,greenRow=0;
    for(let x=0;x<width;x++){
      const p=(y*width+x)*4,r=pixels[p],g=pixels[p+1],b=pixels[p+2];
      waterRow+=isWater(r,g,b)?1:0;greenRow+=isLeaf(r,g,b)?1:0;
      const i=(y+1)*stride+x+1;blue[i]=blue[i-stride]+waterRow;green[i]=green[i-stride]+greenRow;
    }
  }
  const fraction=(table,x,y,radius)=>{
    const left=Math.max(0,x-radius),right=Math.min(width,x+radius+1),top=Math.max(0,y-radius),bottom=Math.min(height,y+radius+1);
    return (table[bottom*stride+right]-table[top*stride+right]-table[bottom*stride+left]+table[top*stride+left])/((right-left)*(bottom-top));
  };
  const distance=new Float32Array(count);distance.fill(1e5);
  const nearestY=new Float32Array(count);nearestY.fill(height+100);
  const solid=new Uint8Array(count),queue=new Uint32Array(count),bottom=new Int32Array(width);
  const horizon=portrait ? .415 : .39;
  for(let y=Math.floor(height*(horizon+.008));y<height;y++)for(let x=0;x<width;x++){
    // Thin white reflection streaks surrounded by sea are not islands.
    if(fraction(blue,x,y,3)<.12)solid[y*width+x]=1;
  }
  // Only each island's lower silhouette is a shoreline. Canopies against the
  // distant sea must not acquire a moving foam outline.
  for(let root=0;root<count;root++){
    if(solid[root]!==1)continue;
    let head=0,tail=1;queue[0]=root;solid[root]=2;bottom.fill(-1);
    while(head<tail){
      const i=queue[head++],x=i%width,y=Math.floor(i/width);bottom[x]=Math.max(bottom[x],y);
      for(const n of [x?i-1:-1,x+1<width?i+1:-1,y?i-width:-1,y+1<height?i+width:-1]){
        if(n>=0&&solid[n]===1){solid[n]=2;queue[tail++]=n;}
      }
    }
    if(tail<6)continue;
    for(let x=0;x<width;x++)if(bottom[x]>=0){const i=bottom[x]*width+x;distance[i]=0;nearestY[i]=bottom[x];}
  }
  const diagonal=Math.SQRT2;
  const relax=(i,n,step)=>{const d=distance[n]+step;if(d<distance[i]){distance[i]=d;nearestY[i]=nearestY[n];}};
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=y*width+x;if(x)relax(i,i-1,1);
    if(y){relax(i,i-width,1);if(x)relax(i,i-width-1,diagonal);if(x+1<width)relax(i,i-width+1,diagonal);}
  }
  for(let y=height-1;y>=0;y--)for(let x=width-1;x>=0;x--){
    const i=y*width+x;if(x+1<width)relax(i,i+1,1);
    if(y+1<height){relax(i,i+width,1);if(x)relax(i,i+width-1,diagonal);if(x+1<width)relax(i,i+width+1,diagonal);}
  }
  const output=new Uint8Array(count*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const p=(y*width+x)*4;
    output[p]=Math.round(Math.min(1,distance[y*width+x]/sourceScale/24)*255);
    output[p+1]=Math.round(Math.min(1,fraction(green,x,y,2)*3)*255);
    output[p+2]=isWater(pixels[p],pixels[p+1],pixels[p+2])&&y>=nearestY[y*width+x]-1?255:0;output[p+3]=255;
  }
  return output;
}
