export default function MapAnswerLabel({ position, country, correct, showCapital = false, scale = 1 }) {
  const shorten = text => text.length > 30 ? `${text.slice(0, 28)}…` : text;
  const name = shorten(country.nome_pt);
  const capital = showCapital ? shorten(country.capital) : '';
  const width = Math.max(116, Math.min(248, Math.max(name.length, capital.length) * 6.7 + 24));
  const height = showCapital ? 48 : 31;
  return <g className={`map-answer-label ${correct ? 'is-correct' : 'is-revealed'}`} role="img" aria-label={`${country.nome_pt}${showCapital ? `, capital ${country.capital}` : ''}`} transform={`translate(${position[0]},${position[1]}) scale(${1 / scale})`}>
    <circle r="8" className="answer-marker-ring" /><circle r="3" className="answer-marker-center" />
    <path d="M0-9v-8" className="answer-label-stem" />
    <rect x={-width / 2} y={-height - 17} width={width} height={height} className="answer-label-box" />
    <text textAnchor="middle" y={-height - 17 + 20} className="answer-label-name">{name}</text>
    {capital && <text textAnchor="middle" y="-27" className="answer-label-capital">{capital}</text>}
  </g>;
}
