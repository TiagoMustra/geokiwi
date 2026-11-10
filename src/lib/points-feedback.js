/** One muted score palette for every mode, including the quiz. */
export const pointsColor = points => `hsl(${Math.round(Math.max(0,Math.min(100,Number(points)||0))*1.2)} 30% var(--points-lightness,66%))`;
