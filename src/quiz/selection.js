import { makeQueue } from '../lib/game.js';

/** Novel questions across all types take precedence over exhausted small pools.
 * History is ordered oldest -> newest, so recycling favours older questions. */
export function selectQuizQuestions(bank,{limit,random=Math.random,recentQuestionIds=[]}) {
  const history=new Map(recentQuestionIds.map((id,index)=>[id,index]));
  const selected=[],selectedIds=new Set(),topics=new Set();
  const topic=question=>question.topicId||question.id;
  const take=question=>{selected.push(question);selectedIds.add(question.id);topics.add(topic(question));};
  function append(pool,{recycle=false,uniqueTopics=true}={}) {
    const types=makeQueue([...new Set(pool.map(q=>q.inputType))],1,random);
    const groups=types.map(type=>{
      const shuffled=makeQueue(pool.filter(q=>q.inputType===type&&!selectedIds.has(q.id)),1,random);
      return recycle?shuffled.sort((a,b)=>history.get(a.id)-history.get(b.id)):shuffled;
    });
    while(selected.length<limit) {
      let added=false;
      for(const group of groups) {
        if(selected.length>=limit)break;
        const index=group.findIndex(q=>!selectedIds.has(q.id)&&(!uniqueTopics||!topics.has(topic(q))));
        if(index<0)continue;
        const [question]=group.splice(index,1);
        take(question);added=true;
      }
      if(!added)break;
    }
  }
  const fresh=bank.filter(q=>!history.has(q.id)),seen=bank.filter(q=>history.has(q.id));
  // These promised subjects otherwise disappear inside much larger type pools.
  // Reserve only unseen questions: an exhausted subject never forces repetition.
  if(limit>=10){
    for(const category of ['flags','names']){
      const options=makeQueue(fresh.filter(q=>q.category===category&&!selectedIds.has(q.id)&&!topics.has(topic(q))),1,random);
      if(options.length)take(options[0]);
    }
  }
  append(fresh);append(fresh,{uniqueTopics:false});
  append(seen,{recycle:true});append(seen,{recycle:true,uniqueTopics:false});
  return makeQueue(selected,1,random);
}
