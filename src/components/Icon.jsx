const paths = {
  save: 'M4 3h13l4 4v14H3V3Zm3 0v7h10V3M7 21v-7h10v7',
  pause: 'M7 4v16M17 4v16',
  play: 'm7 4 13 8-13 8V4Z',
  chart: 'M4 3v18h18M8 16v-4m5 4V8m5 8V4',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  northeast: 'M6 18 18 6M6 6h12v12',
  pin: 'M18 9c0 5-6 11-6 11S6 14 6 9a6 6 0 1 1 12 0Z M10 9h4M12 7v4',
  keyboard: 'M3 5h18v14H3zM6 9h1m3 0h1m3 0h1m3 0h0M6 12h1m3 0h1m3 0h1m3 0h0M7 16h10',
  flag: 'M5 21V3m0 1h13l-2 4 2 4H5',
  city: 'M3 21V9h6v12m0 0V3h7v18m0-12h5v12M1 21h22M12 6h1m-1 4h1m-1 4h1m-7-2h0m0 4h0m13-3h0m0 4h0',
  trophy: 'M8 3h8v8a4 4 0 0 1-8 0V3ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 3v5m-5 1h10',
  globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 6 5 12 0 18-5-6-5-12 0-18Z',
  map: 'm3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16',
  sun: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
  moon: 'M20 15.5A9 9 0 0 1 8.5 4 9 9 0 1 0 20 15.5Z',
  crosshair: 'M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM12 2v5m0 10v5M2 12h5m10 0h5',
  bolt: 'm13 2-9 12h7l-1 8 10-13h-8l1-7Z',
  volume: 'M11 5 6 9H3v6h3l5 4V5Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',
  muted: 'M11 5 6 9H3v6h3l5 4V5Zm5 4 6 6m0-6-6 6',
  chevron: 'm9 5 7 7-7 7',
  close: 'm5 5 14 14M5 19 19 5',
  back: 'M19 12H5m6-6-6 6 6 6',
  check: 'm5 12 5 5L20 7',
  reset: 'M3 10a9 9 0 1 1 1 7M3 4v6h6',
  plus: 'M5 12h14M12 5v14',
  minus: 'M5 12h14',
  help: 'M9 8a3 3 0 1 1 5 2c-1 1-2 1-2 4m0 3v1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  enter: 'M19 5v9H5m5-5-5 5 5 5',
};

export function Icon({ name, size = 20, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" {...props}><path d={paths[name] || paths.globe} /></svg>;
}

export function PixelGlobe({ size = 30 }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M8 0h16v4h4v4h4v16h-4v4h-4v4H8v-4H4v-4H0V8h4V4h4z"/><path fill="var(--bg, #0b1015)" d="M8 8h4v4H8zm8-4h4v8h8v4H16zm-12 12h12v4h4v8h-4v-4h-4v-4H4zm20 4h4v4h-4z"/></svg>;
}
