import { pointsColor } from '../lib/points-feedback.js';
import { useLocale } from '../i18n/LocaleContext.jsx';
import '../points-feedback.css';

export function PointsBurst({points}){
 return <span className="points-burst" style={{'--points-color':pointsColor(points)}} aria-hidden="true">+{points}</span>;
}
export function EarnedPoints({points,children}){
 const {locale}=useLocale();
 return <strong className="earned-points" style={{color:pointsColor(points)}}>+{points} {locale==='en'?'points':'pontos'}{children}</strong>;
}
