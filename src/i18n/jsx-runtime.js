import { useContext } from 'react';
import { jsx as originalJsx, jsxs as originalJsxs, Fragment } from 'react/jsx-runtime';
import { LocaleContext } from './LocaleContext.jsx';
import { translate } from './locale.js';
export { Fragment };
const labelProps=['aria-label','aria-description','title','alt','placeholder'];
const hasText=children=>typeof children==='string'||Array.isArray(children)&&children.some(hasText);
const translatedChildren=(children,locale)=>typeof children==='string'?translate(children,locale):Array.isArray(children)?children.map(child=>translatedChildren(child,locale)):children;
export function LocalizedElement({elementType,elementProps}) {
  const {locale}=useContext(LocaleContext);
  const props={...elementProps};
  for(const key of labelProps) if(typeof props[key]==='string') props[key]=translate(props[key],locale);
  if(hasText(props.children)) props.children=translatedChildren(props.children,locale);
  return (Array.isArray(props.children)?originalJsxs:originalJsx)(elementType,props);
}
export const needsLocalization=(type,props)=>typeof type==='string'&&props&&(hasText(props.children)||labelProps.some(name=>typeof props[name]==='string'));
function render(factory,type,props,key) {
  if(needsLocalization(type,props))
    return originalJsx(LocalizedElement,{elementType:type,elementProps:props},key);
  return factory(type,props,key);
}
export const jsx=(type,props,key)=>render(originalJsx,type,props,key);
export const jsxs=(type,props,key)=>render(originalJsxs,type,props,key);
