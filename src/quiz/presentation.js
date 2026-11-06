import { inputBounds } from './engine.js';
export const difficultyLabel=(difficulty,locale)=>({EASY:{pt:'Fácil',en:'Easy'},MEDIUM:{pt:'Médio',en:'Medium'},HARD:{pt:'Difícil',en:'Hard'}}[difficulty]?.[locale]||difficulty);
export const inputLabel=(type,locale)=>({TRUE_FALSE:{pt:'Verdadeiro ou falso',en:'True or false'},TEXT_SINGLE:{pt:'Escreve a resposta',en:'Type the answer'},TEXT_MULTIPLE:{pt:'Várias respostas',en:'Multiple answers'},NUMBER_EXACT:{pt:'Quantos?',en:'How many?'},MAP_PINPOINT:{pt:'Coloca o pin',en:'Place the pin'},SLIDER_TIMELINE:{pt:'Em que ano?',en:'Which year?'},SLIDER_DISTANCE:{pt:'Qual é a distância?',en:'How far?'}}[type]?.[locale]||'');
export function solutionLabel(question,locale){
  const answer=question.answer;
  const format=n=>new Intl.NumberFormat(locale==='en'?'en-GB':'pt-PT',{maximumFractionDigits:5}).format(n);
  switch(question.inputType){
    case 'TRUE_FALSE':return locale==='en'?answer.value?'True':'False':answer.value?'Verdadeiro':'Falso';
    case 'TEXT_SINGLE':
    case 'TEXT_MULTIPLE':return answer.accepted.map(e=>e.label[locale]).join(question.inputType==='TEXT_MULTIPLE'?' · ':' / ');
    case 'NUMBER_EXACT':return `${format(answer.value)} ${question.unit.label[locale]}`;
    case 'SLIDER_TIMELINE':return answer.year<0?`${Math.abs(answer.year)} ${locale==='en'?'BCE':'a.C.'}`:String(answer.year);
    case 'SLIDER_DISTANCE':return `${format(answer.km)} km`;
    case 'MAP_PINPOINT':return `${answer.point.lat.toFixed(3)}°, ${answer.point.lng.toFixed(3)}°`;
    default:return '';
  }
}
export function noticeLabel(notice,question,locale){
  const en=locale==='en';
  if(notice==='duplicate')return en?'You already found that one. Try another.':'Essa já foi descoberta. Tenta outra.';
  if(notice==='not-found')return en?'That answer is not on the list. Try another.':'Essa resposta não faz parte da lista. Tenta outra.';
  if(notice==='invalid')return en?'Enter a valid answer. Numbers accept K, M and B.':'Escreve uma resposta válida. Os números aceitam K, M e B.';
  if(notice==='out-of-range'){
    const {min,max}=inputBounds(question);
    if(question.inputType==='SLIDER_TIMELINE')return en?`Use a whole year from ${min} to ${max}, excluding year zero.`:`Usa um ano inteiro entre ${min} e ${max}, sem ano zero.`;
    return en?`Enter a number from ${min} to ${max}.`:`Escreve um número entre ${min} e ${max}.`;
  }
  return '';
}
