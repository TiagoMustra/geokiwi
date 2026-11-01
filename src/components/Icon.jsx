import { pixelArtwork, pixelGlyphs, pixelPalette } from './pixel-icons.js';

/** Shared by categories, expanded cards and all game buttons. */
export function Icon({ name, size = 20, className = '', ...props }) {
  const artwork = pixelArtwork[name];
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" className={`pixel-icon ${artwork ? 'pixel-icon-art' : 'pixel-icon-glyph'} ${className}`.trim()} aria-hidden="true" focusable="false" {...props}>
    {artwork ? artwork.map(([color, path], index) => <path key={index} fill={pixelPalette[color]} d={path} />) : <path fillRule="evenodd" d={pixelGlyphs[name] || pixelGlyphs.help} />}
  </svg>;
}

export function KiwiMark({ size = 32, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" className="kiwi-mark" aria-hidden="true" {...props}>
    <path fill="#95683e" d="M8 0h16v4h4v4h4v16h-4v4h-4v4H8v-4H4v-4H0V8h4V4h4Z" />
    <path fill="#b8e96d" d="M8 4h16v4h4v16h-4v4H8v-4H4V8h4Z" />
    <path fill="#f8efc8" d="M12 10h8v2h2v8h-2v2h-8v-2H10v-8h2Z" />
    <path fill="#263421" d="M8 8h2v4H8Zm14 0h2v4h-2ZM6 14h3v3H6Zm17 0h3v3h-3ZM8 21h2v4H8Zm14 0h2v4h-2ZM14 5h4v2h-4Zm0 20h4v2h-4Z" />
  </svg>;
}
