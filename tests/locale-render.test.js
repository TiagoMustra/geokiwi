import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';

test('React localizes visible text and accessible labels without changing input values or country IDs',async()=>{
 const vite=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'});
 try {
  const {LocaleContext}=await vite.ssrLoadModule('/src/i18n/LocaleContext.jsx');
  const {jsx,jsxs}=await vite.ssrLoadModule('/src/i18n/jsx-runtime.js');
  const emptyForm=jsxs('form',{children:[jsx('input',{value:'',readOnly:true}), '']});
  const populatedForm=jsxs('form',{children:[jsx('input',{value:'4',readOnly:true}),jsx('output',{children:'4 metros'})]});
  assert.equal(emptyForm.type,populatedForm.type,'showing a numeric preview must preserve the form and focused input identity');
  const element=jsxs('div',{children:[jsx('h1',{children:'Lisboa · Portugal'}),jsx('input',{placeholder:'Nome da capital…',value:'Lisboa',readOnly:true,'data-country-id':'620'}),jsx('button',{'aria-label':'Reiniciar partida',children:'REINICIAR'})]});
  const en=renderToStaticMarkup(React.createElement(LocaleContext.Provider,{value:{locale:'en'}},element));
  assert.match(en,/Lisbon · Portugal/);assert.match(en,/placeholder="Capital name…"/);assert.match(en,/aria-label="Restart game"/);assert.match(en,/value="Lisboa"/);assert.match(en,/data-country-id="620"/);
  const pt=renderToStaticMarkup(React.createElement(LocaleContext.Provider,{value:{locale:'pt'}},element));
  assert.match(pt,/Lisboa · Portugal/);assert.match(pt,/Nome da capital…/);
 }finally{await vite.close();}
});
