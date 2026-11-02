// A small, dependency-free effect over the existing artwork. All distances are
// source-image pixels so the pixel texture and the islands remain stationary.
const vertex = `
attribute vec2 position;
varying vec2 screen;
void main(){screen=vec2(position.x*.5+.5,.5-position.y*.5);gl_Position=vec4(position,0.,1.);}`;
const fragment = `
precision highp float;
uniform sampler2D artwork;
uniform vec2 imageSize;
uniform vec2 viewport;
uniform float bottomAligned;
uniform float time;
uniform float portrait;
varying vec2 screen;
float blueWater(vec3 c){return smoothstep(.035,.12,c.b-c.r)*smoothstep(.01,.065,c.g-c.r)*step(c.g*.92,c.b);}
void main(){
  float cover=max(viewport.x/imageSize.x,viewport.y/imageSize.y);
  vec2 crop=(imageSize*cover-viewport)*vec2(.5,mix(.5,1.,bottomAligned));
  vec2 uv=(screen*viewport+crop)/(imageSize*cover);
  vec3 original=texture2D(artwork,uv).rgb;
  float horizon=mix(.39,.415,portrait);
  vec2 globe=mix(vec2(.905,.29),vec2(.9,.325),portrait);
  vec2 globeRadius=mix(vec2(.07,.09),vec2(.11,.075),portrait);
  float outsideGlobe=smoothstep(.95,1.18,length((uv-globe)/globeRadius));
  float sky=(1.-smoothstep(mix(.265,.305,portrait),mix(.31,.35,portrait),uv.y))*outsideGlobe;
  vec2 fruit=mix(vec2(.19,.84),vec2(.32,.855),portrait);
  vec2 fruitRadius=mix(vec2(.18,.135),vec2(.25,.105),portrait);
  float outsideFruit=smoothstep(.95,1.12,length((uv-fruit)/fruitRadius));
  float green=smoothstep(.012,.07,original.g-original.r)*smoothstep(.025,.10,original.g-original.b);
  green*=smoothstep(horizon-.055,horizon+.02,uv.y)*outsideFruit;
  float water=blueWater(original)*smoothstep(horizon,horizon+.025,uv.y);
  // Pick up the pale streaks of the existing sun reflection between water rows.
  vec3 above=texture2D(artwork,uv+vec2(0.,-5.)/imageSize).rgb;
  vec3 below=texture2D(artwork,uv+vec2(0.,5.)/imageSize).rgb;
  float brightness=dot(original,vec3(.2126,.7152,.0722));
  float reflection=smoothstep(.58,.76,brightness)*max(blueWater(above),blueWater(below));
  reflection*=smoothstep(horizon,horizon+.03,uv.y)*(1.-smoothstep(.66,.74,uv.y));
  reflection*=1.-smoothstep(.10,.19,abs(uv.x-.51));
  vec2 displacement=vec2(0.);
  displacement.x+=sky*sin(time*.095+uv.y*3.)*11.;
  displacement.x+=green*sin(time*1.05+uv.x*31.+uv.y*19.)*1.65;
  displacement.y+=green*sin(time*.8+uv.x*24.)*.4;
  displacement.x+=max(water,reflection)*sin(uv.y*250.-time*.8)*1.5;
  displacement.y+=max(water,reflection)*sin(uv.x*45.+time*.65)*.5;
  vec3 color=texture2D(artwork,clamp(uv+displacement/imageSize,vec2(0.),vec2(1.))).rgb;
  float ripple=sin(uv.y*650.-time*1.2+sin(uv.x*36.));
  color+=vec3(.70,.83,.78)*water*ripple*.016;
  color+=vec3(1.,.96,.80)*reflection*sin(time*1.1-uv.y*410.)*.055;
  color*=1.+green*sin(time*.8+uv.x*40.+uv.y*21.)*.015;
  gl_FragColor=vec4(clamp(color,0.,1.),1.);
}`;

export function createSceneryRenderer(canvas, image) {
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
  if(!gl)return null;
  const shaders=[],buffers=[],textures=[],programs=[];
  const destroy=()=>{textures.forEach(x=>gl.deleteTexture(x));buffers.forEach(x=>gl.deleteBuffer(x));programs.forEach(x=>gl.deleteProgram(x));shaders.forEach(x=>gl.deleteShader(x));};
  try{
    const compile=(type,source)=>{const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Scenery shader unavailable');return shader;};
    const program=gl.createProgram();programs.push(program);gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Scenery renderer unavailable');gl.useProgram(program);
    const buffer=gl.createBuffer();buffers.push(buffer);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const texture=gl.createTexture();textures.push(texture);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    const uniform=name=>gl.getUniformLocation(program,name);
    const clock=uniform('time'),viewport=uniform('viewport'),alignment=uniform('bottomAligned');
    gl.uniform1i(uniform('artwork'),0);gl.uniform2f(uniform('imageSize'),image.naturalWidth,image.naturalHeight);gl.uniform1f(uniform('portrait'),image.naturalHeight>image.naturalWidth?1:0);
    return {destroy,render(time){
      // The art is pixelated: a bounded drawing buffer keeps this inexpensive on phones.
      const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;
      const ratio=Math.min(window.devicePixelRatio||1,1.25,1800/width,1400/height);
      const w=Math.max(1,Math.round(width*ratio)),h=Math.max(1,Math.round(height*ratio));
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      gl.viewport(0,0,w,h);gl.uniform2f(viewport,width,height);gl.uniform1f(alignment,width<=680?1:0);gl.uniform1f(clock,time);gl.drawArrays(gl.TRIANGLES,0,6);
    }};
  }catch{destroy();return null;}
}
