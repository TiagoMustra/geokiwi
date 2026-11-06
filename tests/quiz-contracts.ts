import type { Difficulty, QuizQuestion, LatLng } from '../src/quiz/types';

// Compile-time contract checks; run with tsc --noEmit, not the Node test runner.
const difficulty: Difficulty = 'MEDIUM';
const point: LatLng = {lat:38.72,lng:-9.14};
void difficulty; void point;
// @ts-expect-error Longitude/latitude arrays are not the domain's named coordinates.
const reversed: LatLng = [-9.14,38.72];
// @ts-expect-error Arbitrary difficulty names are not permitted.
const unknownDifficulty: Difficulty = 'VERY_HARD';
void reversed; void unknownDifficulty;

function exhaustive(question: QuizQuestion): string {
  switch(question.inputType){
    case 'TRUE_FALSE':return String(question.answer.value);
    case 'TEXT_SINGLE':
    case 'TEXT_MULTIPLE':return question.answer.accepted.map(entity=>entity.id).join(',');
    case 'NUMBER_EXACT':return `${question.answer.value} ${question.unit.id}`;
    case 'SLIDER_TIMELINE':return String(question.answer.year);
    case 'SLIDER_DISTANCE':return String(question.answer.km);
    case 'MAP_PINPOINT':return String(question.answer.point.lat);
    default:{const never:never=question;return never;}
  }
}
void exhaustive;
function wrongAnswerShape(question: Extract<QuizQuestion,{inputType:'TRUE_FALSE'}>){
  // @ts-expect-error Boolean questions cannot carry a text-entity answer.
  return question.answer.accepted;
}
void wrongAnswerShape;
