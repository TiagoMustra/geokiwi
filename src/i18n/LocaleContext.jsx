import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react';
import { readLocale, saveLocale, translate, countryName, capitalName } from './locale.js';
import './locale.css';
export const LocaleContext = createContext({locale:'en',setLocale:()=>{}});
export function LocaleProvider({children}) {
  const [locale,updateLocale]=useState(readLocale);
  const setLocale=value=>updateLocale(value==='en'?'en':'pt');
  useEffect(()=>{saveLocale(locale);document.documentElement.lang=locale==='en'?'en':'pt-PT';document.title=locale==='en'?'GeoKiwi — Explore geography':'GeoKiwi — O teu mundo de geografia';},[locale]);
  const value=useMemo(()=>({locale,setLocale}),[locale]);
  return createElement(LocaleContext.Provider,{value},children);
}
export function useLocale() {
  const context=useContext(LocaleContext);
  return {...context,t:text=>translate(text,context.locale),countryName:country=>countryName(country,context.locale),capitalName:country=>capitalName(country,context.locale)};
}
