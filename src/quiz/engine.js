import { makeQueue, normalizeAnswer } from '../lib/game.js';

export const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];
export const INPUT_TYPES = ['TRUE_FALSE','TEXT_SINGLE','TEXT_MULTIPLE','NUMBER_EXACT','MAP_PINPOINT','SLIDER_TIMELINE','SLIDER_DISTANCE'];
export const MAX_DISTANCE_KM = 20037;
export const validDifficulty = value => DIFFICULTIES.includes(value) ? value : 'EASY';
export const currentYear = () => new Date().getFullYear();
export function requiredAnswers(total, difficulty) {
  if (!Number.isInteger(total) || total < 1) throw new RangeError('Empty answer set');
  return difficulty === 'HARD' ? total : difficulty === 'MEDIUM' ? Math.ceil(total / 2) : 1;
}

/** Decimal comma or point with a suffix; locale-specific thousands without one.
 * K=1e3, M=1e6, B=1e9 in both languages. Never use parseFloat on unvalidated text. */
export function parseSmartNumber(raw, locale = 'pt') {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  if (typeof raw !== 'string' || raw.length > 80) return null;
  const match = raw.trim().match(/^([+-]?[\d.,\s\u00a0]+)\s*([kmb])?$/i);
  if (!match) return null;
  let value = match[1].trim();
  const suffix = match[2]?.toLowerCase();
  // Spaces are allowed only as properly grouped thousands.
  if (/\s/.test(value)) {
    if (!/^[+-]?\d{1,3}(?:[\s\u00a0]\d{3})+(?:[.,]\d+)?$/.test(value)) return null;
    value = value.replace(/[\s\u00a0]/g, '');
  }
  const grouping = locale === 'en' ? ',' : '.';
  const decimal = locale === 'en' ? '.' : ',';
  const escapedGroup = grouping === '.' ? '\\.' : ',';
  const escapedDecimal = decimal === '.' ? '\\.' : ',';
  const grouped = new RegExp(`^[+-]?\\d{1,3}(?:${escapedGroup}\\d{3})+(?:${escapedDecimal}\\d+)?$`);
  if (!suffix && grouped.test(value)) value = value.split(grouping).join('').replace(decimal, '.');
  else if (/^[+-]?\d+(?:[.,]\d+)?$/.test(value)) value = value.replace(',', '.');
  else return null;
  const result = Number(value) * ({k:1e3,m:1e6,b:1e9}[suffix] || 1);
  return Number.isFinite(result) && Math.abs(result) <= Number.MAX_SAFE_INTEGER ? result : null;
}

export function inputBounds(question, year = currentYear()) {
  if (question.inputType === 'SLIDER_DISTANCE') return {min:0,max:MAX_DISTANCE_KM,step:1};
  if (question.inputType === 'SLIDER_TIMELINE') return {
    min:question.range.min,
    max:Math.min(year, question.range.max === 'CURRENT_YEAR' ? year : question.range.max), step:1,
  };
  return {min:question.bounds?.min ?? 0,max:question.bounds?.max ?? Number.MAX_SAFE_INTEGER};
}
export const validPoint = point => Boolean(point && typeof point === 'object' && !Array.isArray(point)
  && Number.isFinite(point.lat) && Number.isFinite(point.lng) && Math.abs(point.lat)<=90 && Math.abs(point.lng)<=180);
export const toLngLat = point => [point.lng,point.lat];
export const fromLngLat = ([lng,lat]) => ({lat,lng});
export function distanceKm(a,b) {
  const rad = value => value * Math.PI / 180;
  const h = Math.sin(rad(b.lat-a.lat)/2)**2 + Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(rad(b.lng-a.lng)/2)**2;
  return 6371.0088 * 2 * Math.asin(Math.sqrt(Math.max(0,Math.min(1,h))));
}
const findEntity = (question,value) => typeof value === 'string' && value.length<=200 && normalizeAnswer(value)
  ? question.answer.accepted.find(entity => [...Object.values(entity.label),...entity.aliases].some(alias=>normalizeAnswer(alias)===normalizeAnswer(value))) : null;

/** @param {import('./types').QuizQuestion} question */
export function evaluateSubmission(question,value,{difficulty='EASY',foundIds=[],skipped=false,locale='pt',year=currentYear()}={}) {
  const base={questionId:question.id,value,skipped,foundIds:[...foundIds],points:0,correct:false};
  if (skipped) return {answer:{...base,value:''},foundIds,notice:null};
  let correct=false,extra={};
  switch(question.inputType) {
    case 'TRUE_FALSE':
      if(typeof value!=='boolean')return {notice:'invalid',foundIds};
      correct=value===question.answer.value;break;
    case 'TEXT_SINGLE': {
      if(typeof value!=='string'||!value.trim()||value.length>200)return {notice:'invalid',foundIds};
      const entity=findEntity(question,value);correct=Boolean(entity);
      extra.foundIds=entity?[entity.id]:[];break;
    }
    case 'TEXT_MULTIPLE': {
      const entity=findEntity(question,value);
      if(!entity)return {notice:'not-found',foundIds};
      if(foundIds.includes(entity.id))return {notice:'duplicate',foundIds};
      const found=[...foundIds,entity.id];
      if(found.length<requiredAnswers(question.answer.accepted.length,difficulty))return {foundIds:found,notice:null,accepted:true};
      correct=true;extra.foundIds=found;break;
    }
    case 'NUMBER_EXACT':
    case 'SLIDER_DISTANCE':
    case 'SLIDER_TIMELINE': {
      const number=parseSmartNumber(value,locale);
      if(number===null)return {notice:'invalid',foundIds};
      const {min,max}=inputBounds(question,year);
      if(number<min||number>max||question.inputType==='SLIDER_TIMELINE'&&(!Number.isInteger(number)||number===0))return {notice:'out-of-range',foundIds};
      const target=question.answer.value??question.answer.year??question.answer.km;
      const tolerance=question.answer.absoluteTolerance??question.answer.toleranceYears??question.answer.toleranceKm;
      correct=Math.abs(number-target)<=tolerance+Number.EPSILON*Math.max(1,Math.abs(target));
      extra.value=number;break;
    }
    case 'MAP_PINPOINT': {
      if(!validPoint(value))return {notice:'invalid',foundIds};
      const distance=distanceKm(value,question.answer.point);
      correct=distance<=question.answer.toleranceKm;
      extra={distanceKm:distance,points:correct?100:Math.max(0,Math.round(100*Math.exp(-distance/question.answer.decayKm)))};
      break;
    }
    default: return {notice:'invalid',foundIds};
  }
  return {answer:{...base,correct,points:correct?100:0,...extra},foundIds:extra.foundIds??foundIds,notice:null};
}

/** Alternate interaction types before returning to the large legacy text bank. */
export function createQuiz({bank,rounds=10,difficulty='EASY',practice=false,random=Math.random}) {
  const size=[10,20,30].includes(rounds)?rounds:10;
  const unique=[...new Map(bank.map(question=>[question.id,question])).values()];
  if(!unique.length)throw new RangeError('Quiz bank is empty');
  for(const question of unique){const errors=validateQuestion(question);if(errors.length)throw new TypeError(`Invalid question ${question.id}: ${errors.join(', ')}`);}
  const groups=makeQueue(INPUT_TYPES,1,random).map(type=>makeQueue(unique.filter(q=>q.inputType===type),1,random));
  const selected=[];
  while(selected.length<(practice?unique.length:Math.min(size,unique.length))) {
    for(const group of groups) {if(group.length&&selected.length<(practice?unique.length:Math.min(size,unique.length)))selected.push(group.shift());}
  }
  return {version:2,id:globalThis.crypto.randomUUID(),startedAt:Date.now(),rounds:size,difficulty:validDifficulty(difficulty),practice,
    queue:selected.map(q=>q.id),revisions:Object.fromEntries(selected.map(q=>[q.id,q.revision])),index:0,events:[],answers:[],foundIds:[],notice:null,score:0,finished:false};
}
export function submitQuiz(game,bankById,value,{skipped=false,locale='pt'}={}) {
  if(game.finished||game.answers[game.index])return game;
  const id=game.queue[game.index];
  const question=Object.hasOwn(bankById,id)?bankById[id]:null;
  if(!question)return game;
  const result=evaluateSubmission(question,value,{difficulty:game.difficulty,foundIds:game.foundIds,skipped,locale});
  if(!result.answer&&!result.accepted)return {...game,notice:result.notice};
  return {...game,notice:null,foundIds:result.foundIds,
    events:[...game.events,{index:game.index,value:skipped?'':value,locale,skipped}],
    answers:result.answer?[...game.answers,result.answer]:game.answers,
    score:game.score+(result.answer?.points||0)};
}
export function nextQuiz(game) {
  if(game.finished||!game.answers[game.index])return game;
  return game.index+1>=game.queue.length?{...game,finished:true,notice:null}:{...game,index:game.index+1,foundIds:[],notice:null};
}

/** Fail closed on authored content that would make a question impossible. */
export function validateQuestion(q,year=currentYear()) {
  const errors=[];
  if(!q||typeof q!=='object'||Array.isArray(q))return ['question'];
  if(q.schemaVersion!==1||!q.id||!Number.isInteger(q.revision)||q.revision<1)errors.push('identity');
  if(!INPUT_TYPES.includes(q.inputType))errors.push('inputType');
  if(!['prompt','explanation'].every(field=>['pt','en'].every(l=>typeof q[field]?.[l]==='string'&&q[field][l].trim())))errors.push('translations');
  if(!q.sources?.length||!q.sources.every(s=>s.title&&/^https:\/\//.test(s.url))||!/^\d{4}-\d{2}-\d{2}$/.test(q.checkedAt))errors.push('provenance');
  if(['TEXT_SINGLE','TEXT_MULTIPLE'].includes(q.inputType)){
    const entities=q.answer?.accepted;
    if(!Array.isArray(entities)||!entities.length||new Set(entities.map(e=>e.id)).size!==entities.length)errors.push('entities');
    else {
      const names=new Map();
      for(const e of entities){
        if(!e.id||!e.label?.pt||!e.label?.en||!Array.isArray(e.aliases))errors.push('entity');
        for(const name of [...Object.values(e.label||{}),...(e.aliases||[])]){
          const key=normalizeAnswer(name);if(!key||names.has(key)&&names.get(key)!==e.id)errors.push('ambiguous-alias');names.set(key,e.id);
        }
      }
    }
    if(!['countries','cities','none'].includes(q.suggestionDomain))errors.push('suggestionDomain');
  } else if(q.inputType==='TRUE_FALSE') {if(typeof q.answer?.value!=='boolean')errors.push('boolean');}
  else if(q.inputType==='MAP_PINPOINT') {
    if(!validPoint(q.answer?.point)||!(q.answer?.decayKm>0)||!Number.isFinite(q.answer?.decayKm)||!(q.answer?.toleranceKm>=0)||!Number.isFinite(q.answer?.toleranceKm))errors.push('point');
  } else if(INPUT_TYPES.includes(q.inputType)) {
    const target=q.answer?.value??q.answer?.year??q.answer?.km;
    const tolerance=q.answer?.absoluteTolerance??q.answer?.toleranceYears??q.answer?.toleranceKm;
    const validRange=q.inputType!=='SLIDER_TIMELINE'||q.range&&Number.isInteger(q.range.min)&&(q.range.max==='CURRENT_YEAR'||Number.isInteger(q.range.max))&&q.range.step===1;
    const bounds=validRange?inputBounds(q,year):{min:NaN,max:NaN};
    if(!Number.isFinite(target)||!Number.isFinite(tolerance)||tolerance<0||!Number.isFinite(bounds.min)||!Number.isFinite(bounds.max)||target<bounds.min||target>bounds.max||bounds.min>bounds.max)errors.push('numeric');
    if(q.inputType==='NUMBER_EXACT'&&(!q.unit?.id||!q.unit?.label?.pt||!q.unit?.label?.en))errors.push('unit');
    if(q.inputType==='SLIDER_TIMELINE'&&(!validRange||!Number.isInteger(target)||target===0))errors.push('timeline');
  }
  return [...new Set(errors)];
}
