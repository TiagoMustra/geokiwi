import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { normalizeAnswer } from '../../lib/game.js';
import { inputBounds, parseSmartNumber, requiredAnswers } from '../../quiz/engine.js';
import { suggestionEntities } from '../../quiz/questions.js';
import { Icon } from '../Icon.jsx';

const numberFormat=(value,locale)=>new Intl.NumberFormat(locale==='en'?'en-GB':'pt-PT',{maximumFractionDigits:2}).format(value);
export const formatYear=(value,locale)=>value<0?`${Math.abs(value)} ${locale==='en'?'BCE':'a.C.'}`:String(value);
export function TrueFalseInput({onSubmit,disabled,locale}) {
  return <div className="quiz-boolean" role="group" aria-label={locale==='en'?'True or false':'Verdadeiro ou falso'}>{[true,false].map(value=><button key={String(value)} type="button" disabled={disabled} onClick={()=>onSubmit(value)}><Icon name={value?'check':'close'} size={19}/>{locale==='en'?value?'True':'False':value?'Verdadeiro':'Falso'}</button>)}</div>;
}

/** Suggestions span the entity domain; the correct answer is never prioritised. */
export function EntityTextInput({question,foundIds,disabled,onSubmit,locale,suggestions=true}) {
  const [value,setValue]=useState(''),[open,setOpen]=useState(false),[active,setActive]=useState(-1);
  const id=useId(),listId=`${id}-list`,input=useRef(null),list=useRef(null);
  const items=useMemo(()=>{
    const prefix=normalizeAnswer(value.trim());
    if(!suggestions||!prefix)return [];
    return (suggestionEntities[question.suggestionDomain]||[]).filter(e=>!foundIds.includes(e.id)&&[...Object.values(e.label),...e.aliases].some(name=>normalizeAnswer(name).startsWith(prefix)))
      .sort((a,b)=>a.label[locale].localeCompare(b.label[locale],locale)).slice(0,6);
  },[question.suggestionDomain,foundIds,value,locale,suggestions]);
  useEffect(()=>{input.current?.focus({preventScroll:true});},[]);
  useEffect(()=>{if(active>=0)list.current?.children[active]?.scrollIntoView({block:'nearest'});},[active]);
  const visible=open&&!disabled&&items.length>0;
  const submit=answer=>{if(!answer.trim()||disabled)return;onSubmit(answer);setValue('');setOpen(false);setActive(-1);input.current?.focus({preventScroll:true});};
  function keyDown(event){
    if(event.nativeEvent.isComposing)return;
    if(items.length&&['ArrowDown','ArrowUp'].includes(event.key)){
      event.preventDefault();setOpen(true);setActive(i=>event.key==='ArrowDown'?(i+1)%items.length:i<=0?items.length-1:i-1);
    }else if(event.key==='Escape'){setOpen(false);setActive(-1);}
    else if(event.key==='Enter'&&visible&&active>=0){event.preventDefault();submit(items[active].label[locale]);}
  }
  return <form className="quiz-entry-row" onSubmit={e=>{e.preventDefault();submit(value);}}>
    <div className="answer-combobox"><label className="sr-only" htmlFor={id}>{locale==='en'?'Your answer':'A tua resposta'}</label><input ref={input} id={id} value={value} maxLength={200} disabled={disabled} autoComplete="off" spellCheck={false} placeholder={locale==='en'?'Your answer…':'A tua resposta…'}
      role={suggestions?'combobox':undefined} aria-autocomplete={suggestions?'list':undefined} aria-expanded={suggestions?visible:undefined} aria-controls={visible?listId:undefined} aria-activedescendant={visible&&active>=0?`${listId}-${active}`:undefined}
      onChange={e=>{setValue(e.target.value);setActive(-1);setOpen(true);}} onKeyDown={keyDown} onFocus={()=>setOpen(true)} onBlur={()=>{setOpen(false);setActive(-1);}}/>
    {visible&&<ul className="answer-suggestions" ref={list} id={listId} role="listbox" aria-label={locale==='en'?'Suggestions':'Sugestões'}>{items.map((item,index)=><li id={`${listId}-${index}`} key={item.id} role="option" aria-selected={active===index} className={active===index?'is-active':''} onPointerDown={e=>e.preventDefault()} onPointerMove={()=>setActive(index)} onClick={()=>submit(item.label[locale])}>{item.label[locale]}</li>)}</ul>}</div>
    <button type="submit" className="quiz-submit" disabled={disabled||!value.trim()} aria-label={locale==='en'?'Submit answer':'Confirmar resposta'}><Icon name="enter" size={19}/></button>
  </form>;
}

export function MultipleProgress({question,difficulty,foundIds,locale}) {
  const total=question.answer.accepted.length,required=requiredAnswers(total,difficulty),found=foundIds.length;
  return <div className="quiz-multiple-progress"><div className="quiz-progress-label" role="status"><strong>{locale==='en'?`Found ${found} of ${required}`:`Acertaste ${found} de ${required}`}</strong><span>{total} {locale==='en'?'possible':'possíveis'}</span></div><div className="quiz-progress-track" role="progressbar" aria-label={locale==='en'?'Answers found':'Respostas descobertas'} aria-valuenow={found} aria-valuemin={0} aria-valuemax={required}><i style={{width:`${Math.min(100,found/required*100)}%`}}/></div>{foundIds.length>0&&<ul className="quiz-found-list">{foundIds.map(id=><li key={id}><Icon name="check" size={12}/>{question.answer.accepted.find(e=>e.id===id)?.label[locale]}</li>)}</ul>}</div>;
}

export function NumberExactInput({question,disabled,onSubmit,locale}) {
  const [value,setValue]=useState('');const id=useId(),parsed=parseSmartNumber(value,locale);
  return <form onSubmit={e=>{e.preventDefault();onSubmit(value);}}><label className="sr-only" htmlFor={id}>{question.unit.label[locale]}</label><div className="quiz-entry-row"><div className="quiz-unit-field"><input id={id} type="text" inputMode="decimal" autoComplete="off" placeholder={locale==='en'?'Enter a number':'Escreve um número'} value={value} maxLength={80} disabled={disabled} onChange={e=>setValue(e.target.value)}/><span>{question.unit.label[locale]}</span></div><button type="submit" className="quiz-submit" disabled={disabled||!value.trim()} aria-label={locale==='en'?'Submit answer':'Confirmar resposta'}><Icon name="enter" size={19}/></button></div><p className="quiz-input-hint">K = 1 000 · M = 1 000 000 · B = 1 000 000 000</p>{value&&parsed!==null&&<output className="quiz-number-preview">{numberFormat(parsed,locale)} {question.unit.label[locale]}</output>}<small className="quiz-tolerance">{question.answer.absoluteTolerance===0?(locale==='en'?'Exact answer':'Resposta exata'):`± ${numberFormat(question.answer.absoluteTolerance,locale)} ${question.unit.label[locale]}`}</small></form>;
}

export function SliderInput({question,disabled,onSubmit,locale}) {
  const timeline=question.inputType==='SLIDER_TIMELINE',bounds=inputBounds(question);
  const [raw,setRaw]=useState(String(Math.round((bounds.min+bounds.max)/2))),id=useId();
  const parsed=parseSmartNumber(raw,locale),thumb=Math.max(bounds.min,Math.min(bounds.max,parsed??bounds.min));
  const display=number=>timeline?formatYear(number,locale):`${numberFormat(number,locale)} km`;
  const tolerance=timeline?question.answer.toleranceYears:question.answer.toleranceKm;
  return <form className="quiz-slider" onSubmit={e=>{e.preventDefault();onSubmit(raw);}}><label className="sr-only" htmlFor={`${id}-range`}>{locale==='en'?timeline?'Choose a year':'Choose a distance':timeline?'Escolhe um ano':'Escolhe uma distância'}</label><input id={`${id}-range`} type="range" min={bounds.min} max={bounds.max} step={bounds.step} value={thumb} disabled={disabled} aria-valuetext={display(thumb)} onChange={e=>setRaw(e.target.value)}/><div className="quiz-range-limits"><span>{display(bounds.min)}</span><span>{display(bounds.max)}</span></div><div className="quiz-entry-row"><div className="quiz-unit-field"><label className="sr-only" htmlFor={`${id}-manual`}>{locale==='en'?'Enter the value manually':'Escreve o valor manualmente'}</label><input id={`${id}-manual`} type="text" inputMode={timeline?'text':'decimal'} maxLength={80} value={raw} disabled={disabled} onChange={e=>setRaw(e.target.value)}/><span>{timeline?(locale==='en'?'year':'ano'):'km'}</span></div><button type="submit" className="quiz-submit" disabled={disabled||!raw.trim()}>{locale==='en'?'Confirm':'Confirmar'}</button></div><small className="quiz-tolerance">{tolerance===0?(locale==='en'?'Exact answer':'Resposta exata'):`± ${tolerance} ${timeline?(locale==='en'?'years':'anos'):'km'}`}{timeline&&bounds.min<0&&` · ${locale==='en'?'Negative years = BCE':'Anos negativos = a.C.'}`}</small></form>;
}
export function MapPinpointInput({point,disabled,onSubmit,locale}) {
  return <div className="quiz-pin-input"><p>{point?`${point.lat.toFixed(3)}°, ${point.lng.toFixed(3)}°`:locale==='en'?'Click the map to place a pin.':'Clica no mapa para colocar o pin.'}</p><button type="button" className="quiz-submit" disabled={disabled||!point} onClick={()=>onSubmit(point)}><Icon name="pin" size={17}/>{locale==='en'?'Confirm pin':'Confirmar pin'}</button></div>;
}

/** One exhaustive routing point; validation and scoring live in the pure engine.
 * @param {import('../../quiz/types').QuestionInputProps} props
 */
export default function QuestionInput(props) {
  switch(props.question.inputType){
    case 'TRUE_FALSE':return <TrueFalseInput {...props}/>;
    case 'TEXT_SINGLE':return <EntityTextInput {...props}/>;
    case 'TEXT_MULTIPLE':return <><MultipleProgress {...props}/><EntityTextInput {...props}/></>;
    case 'NUMBER_EXACT':return <NumberExactInput {...props}/>;
    case 'SLIDER_TIMELINE':
    case 'SLIDER_DISTANCE':return <SliderInput {...props}/>;
    case 'MAP_PINPOINT':return <MapPinpointInput {...props}/>;
    default:throw new Error(`Unsupported quiz input: ${props.question.inputType}`);
  }
}
