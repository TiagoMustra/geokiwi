import '../kiwi-map.css';

/** Repeated seeds stay subtle; a brown stroke supplies the kiwi's skin. */
export default function KiwiMapTexture({ id, scale = 1 }) {
  return <defs><pattern id={id} data-kiwi-texture="true" width="36" height="36" patternUnits="userSpaceOnUse" patternTransform={`scale(${1 / scale})`}>
    <rect width="36" height="36" fill="var(--kiwi-flesh)" />
    <path d="M18 5v8m0 10v8M5 18h8m10 0h8M8 8l6 6m8 8 6 6M8 28l6-6m8-8 6-6" stroke="var(--kiwi-flesh-light)" strokeWidth="1.4" opacity=".65" />
    <path d="M16 14h4v8h-4Z" fill="var(--kiwi-core)" opacity=".7" />
    <path d="M8 7h2v4H8Zm18 0h2v4h-2ZM7 25h2v4H7Zm20 0h2v4h-2ZM4 16h3v2H4Zm25 2h3v2h-3Z" fill="var(--kiwi-seed)" opacity=".78" />
  </pattern></defs>;
}
