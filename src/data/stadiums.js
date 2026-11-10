import west from './stadiums-west.json' with {type:'json'};
import east from './stadiums-east.json' with {type:'json'};
/** A verified selection of top-flight venues, not every stadium in Europe. */
export const stadiums=[...west,...east];
