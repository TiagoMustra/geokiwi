export default function CapitalPin({ position, countryId, scale = 1 }) {
  return <g className="capital-pin" role="img" aria-label="Localização da capital" data-capital-pin={countryId} transform={`translate(${position[0]},${position[1]}) scale(${1 / scale})`}>
    <ellipse cx="0" cy="2" rx="7" ry="3" className="capital-pin-shadow" />
    <path className="capital-pin-body" d="M-6-25H6v3h3v12H6v3H3v4L0 0l-3-3v-4h-3v-3h-3v-12h3Z" />
    <rect x="-3" y="-19" width="6" height="6" className="capital-pin-center" />
  </g>;
}
