export { Fragment } from './jsx-runtime.js';
import { jsxDEV as originalJsxDEV } from 'react/jsx-dev-runtime';
import { LocalizedElement, needsLocalization } from './jsx-runtime.js';
export const jsxDEV=(type,props,key,isStaticChildren,source,self)=>needsLocalization(type,props) ? originalJsxDEV(LocalizedElement,{elementType:type,elementProps:props},key,false,source,self) : originalJsxDEV(type,props,key,isStaticChildren,source,self);
