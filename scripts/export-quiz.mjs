import { mkdir,writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { quizQuestions,getQuizPool } from '../src/quiz/questions.js';
import { INPUT_TYPES,requiredAnswers,validateQuestion } from '../src/quiz/engine.js';
import { inputLabel,solutionLabel } from '../src/quiz/presentation.js';

for(const question of quizQuestions){const errors=validateQuestion(question);if(errors.length)throw Error(`${question.id}: ${errors.join(', ')}`);}
const counts={pt:getQuizPool('pt').length,en:getQuizPool('en').length};
const metadata={schemaVersion:1,title:{pt:'Conhecimento geral',en:'General knowledge'},eligibleCounts:counts,storedQuestionCount:quizQuestions.length,
  checkedThrough:quizQuestions.map(q=>q.checkedAt).sort().at(-1),
  notes:{pt:'Inclui perguntas, soluções e fontes. Variantes de nomes PT/EN são registos separados; a partida seleciona a língua escolhida. A dificuldade só altera a quota de respostas das listas. Números, datas, distâncias e pins dão pontos por proximidade.',
    en:'Includes questions, answers and sources. Portuguese/English name variants are separate records; a run selects its chosen language. Difficulty only changes multiple-answer quotas. Numbers, dates, distances and pins score by proximity.'},
  difficulty:{EASY:'1 valid list item',MEDIUM:'ceil(50% of list items)',HARD:'all list items'},questions:quizQuestions};
const lines=['# Conhecimento geral — banco completo de perguntas','',`**${counts.pt} perguntas elegíveis em PT · ${counts.en} em EN · ${quizQuestions.length} registos no ficheiro.**`,'',metadata.notes.pt,'',
  'Cada pergunta inclui a tradução inglesa, a solução, a explicação e as fontes. Em perguntas de nomes/letras, a língua de referência está indicada no enunciado.','',
  '## Índice por tipo','',...INPUT_TYPES.map(type=>`- ${inputLabel(type,'pt')} (${type}): ${getQuizPool('pt').filter(q=>q.inputType===type).length} elegíveis em PT`),''];
for(const type of INPUT_TYPES){
  const group=quizQuestions.filter(q=>q.inputType===type);
  lines.push(`## ${inputLabel(type,'pt')} — ${type}`,'');
  for(const q of group){
    lines.push(`### ${q.id}`,'',`**PT:** ${q.prompt.pt}`,'',`**EN:** ${q.prompt.en}`,'',`**Resposta:** ${solutionLabel(q,'pt')}`,'');
    if(q.inputType.startsWith('TEXT'))lines.push(`**Respostas em inglês:** ${q.answer.accepted.map(e=>e.label.en).join(' · ')}`,'');
    if(q.inputType==='TEXT_MULTIPLE')lines.push(`**Quota de dificuldade:** Fácil ${requiredAnswers(q.answer.accepted.length,'EASY')} · Médio ${requiredAnswers(q.answer.accepted.length,'MEDIUM')} · Difícil ${requiredAnswers(q.answer.accepted.length,'HARD')}`,'');
    lines.push(`**Explicação PT:** ${q.explanation.pt}`,'',`**Explanation EN:** ${q.explanation.en}`,'',`**Categoria:** ${q.category}${q.referenceYear?` · Ano dos dados: ${q.referenceYear}`:''} · Verificado: ${q.checkedAt}`,'');
    lines.push('**Fontes:**','',...q.sources.map(source=>`- [${source.title}](${source.url})`),'');
    if(q.image)lines.push(`**Foto:** ${q.image.author} · [${q.image.license}](${q.image.licenseUrl}) · [Original](${q.image.sourceUrl})`,'');
  }
}
const directory=fileURLToPath(new URL('../public/downloads/',import.meta.url));await mkdir(directory,{recursive:true});
await Promise.all([writeFile(directory+'conhecimento-geral.json',JSON.stringify(metadata,null,2)+'\n'),writeFile(directory+'conhecimento-geral.md',lines.join('\n')+'\n')]);
console.log(`Quiz exports: ${quizQuestions.length} records; PT ${counts.pt}, EN ${counts.en}.`);
