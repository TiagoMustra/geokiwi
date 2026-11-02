import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSceneryMasks}from'../src/lib/scenery-masks.js';
function image(width,height,color){const p=new Uint8ClampedArray(width*height*4);for(let i=0;i<p.length;i+=4)p.set([...color,255],i);return p;}
test('shore waves follow solid islands, while pale reflection streaks do not become false islands',()=>{
 const width=80,height=70,p=image(width,height,[80,140,160]);
 for(let y=36;y<60;y++)for(let x=27;x<52;x++)p.set([130,110,75,255],(y*width+x)*4);
 for(let x=2;x<20;x++)p.set([230,235,210,255],(29*width+x)*4);
 const mask=buildSceneryMasks(p,width,height),distance=(x,y)=>mask[(y*width+x)*4]/255*24;
 assert.ok(distance(24,62)<distance(10,62));assert.ok(distance(10,29)>15);
 assert.equal(mask[(34*width+38)*4+2],0,'no foam above island canopies');
 assert.ok(mask[(62*width+38)*4+2]>0,'waves can break below the coast');
 assert.ok(distance(54,62)<12);assert.equal(distance(79,48),24);
});
test('leaf masks include warm olive leaves and a small moving silhouette margin, excluding brown rock',()=>{
 const width=30,height=30,p=image(width,height,[80,140,160]);
 for(let y=15;y<25;y++)for(let x=10;x<20;x++)p.set([146,140,55,255],(y*width+x)*4);
 const mask=buildSceneryMasks(p,width,height),green=(x,y)=>mask[(y*width+x)*4+1];
 assert.ok(green(14,19)>0);assert.ok(green(9,19)>0);assert.equal(green(3,19),0);
 const rock=buildSceneryMasks(image(width,height,[145,100,65]),width,height);assert.equal(rock[(19*width+14)*4+1],0);
});
