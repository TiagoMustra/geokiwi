import test from 'node:test';
import assert from 'node:assert/strict';
import{buildCloudLayer,cloudScrollOffset,CLOUD_SPEED}from'../src/lib/cloud-stream.js';
test('clouds travel at constant positive speed without easing to a stop or reversing',()=>{
 const width=1536;
 for(let t=0;t<100;t++)assert.ok(Math.abs((cloudScrollOffset(t+1,width)-cloudScrollOffset(t,width))*width-CLOUD_SPEED)<1e-9);
 // Sampling from the left makes the same cloud appear farther right each second.
 const x=120;
 for(let t=0;t<10;t++)assert.ok(x+cloudScrollOffset(t+1,width)*width>x+cloudScrollOffset(t,width)*width);
});
test('the stream repeats after a complete crossing and stays continuous through the wrap',()=>{
 const width=1536,period=width/CLOUD_SPEED;
 for(const t of [0,1,30,200])assert.ok(Math.abs(cloudScrollOffset(t,width)-cloudScrollOffset(t+period,width))<1e-9);
 assert.ok(cloudScrollOffset(period-.01,width)>.999);assert.ok(cloudScrollOffset(period+.01,width)<.001);
 assert.equal(cloudScrollOffset(Infinity,width),0);
});
test('cloud extraction removes parchment, protects the globe and mist, and leaves both tile edges transparent',()=>{
 const width=200,height=100,pixels=new Uint8ClampedArray(width*height*4);
 for(let p=0;p<pixels.length;p+=4)pixels.set([248,242,220,255],p);
 for(const [x,y]of[[50,15],[0,15],[199,15],[181,28],[50,60]])pixels.set([130,150,160,255],(y*width+x)*4);
 const layer=buildCloudLayer(pixels,width,height),alpha=(x,y)=>layer[(y*width+x)*4+3];
 assert.equal(alpha(50,15),255);assert.equal(alpha(100,15),0);assert.equal(alpha(0,15),0);assert.equal(alpha(199,15),0);assert.equal(alpha(181,28),0);assert.equal(alpha(50,60),0);
});
