/** Serializable contracts. Coordinates are named to prevent GeoJSON's lng/lat reversal. */
export type Locale = 'pt' | 'en';
export type LocalizedText = Record<Locale, string>;
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type InputType = 'TRUE_FALSE' | 'TEXT_SINGLE' | 'TEXT_MULTIPLE' | 'NUMBER_EXACT'
  | 'MAP_PINPOINT' | 'SLIDER_TIMELINE' | 'SLIDER_DISTANCE';
export interface LatLng { lat: number; lng: number }
export interface Source { title: string; url: string }
export interface TextEntity {
  /** One ID per entity, shared by every translation and alias. */
  id: string;
  label: LocalizedText;
  aliases: string[];
}
export interface Unit { id: string; label: LocalizedText }
export interface BaseQuestion {
  schemaVersion: 1;
  id: string;
  /** Increment when the solution or wording changes; incompatible saves are rejected. */
  revision: number;
  category: string;
  prompt: LocalizedText;
  explanation: LocalizedText;
  sources: Source[];
  checkedAt: string;
  /** Census / ranking reference year, distinct from the source verification date. */
  referenceYear?: number;
  countryIds?: string[];
}
export interface TrueFalseQuestion extends BaseQuestion {
  inputType: 'TRUE_FALSE';
  answer: { value: boolean };
}
export interface TextSingleQuestion extends BaseQuestion {
  inputType: 'TEXT_SINGLE';
  suggestionDomain: 'countries' | 'cities' | 'none';
  /** Any one accepted entity completes the question. */
  answer: { accepted: TextEntity[] };
}
export interface TextMultipleQuestion extends BaseQuestion {
  inputType: 'TEXT_MULTIPLE';
  suggestionDomain: 'countries' | 'cities' | 'none';
  /** Complete, finite and deduplicated answer set. Difficulty chooses the quota. */
  answer: { accepted: TextEntity[] };
}
export interface NumberExactQuestion extends BaseQuestion {
  inputType: 'NUMBER_EXACT';
  unit: Unit;
  bounds?: { min?: number; max?: number };
  answer: { value: number; absoluteTolerance: number };
}
export interface TimelineQuestion extends BaseQuestion {
  inputType: 'SLIDER_TIMELINE';
  range: { min: number; max: number | 'CURRENT_YEAR'; step: 1 };
  /** Negative years are BCE; year zero is excluded. */
  answer: { year: number; toleranceYears: number };
}
export interface DistanceQuestion extends BaseQuestion {
  inputType: 'SLIDER_DISTANCE';
  /** Always 0..20,037 km. Other units use NUMBER_EXACT, never this slider. */
  answer: { km: number; toleranceKm: number };
}
export interface MapPinpointQuestion extends BaseQuestion {
  inputType: 'MAP_PINPOINT';
  answer: { point: LatLng; toleranceKm: number; decayKm: number };
}
export type QuizQuestion = TrueFalseQuestion | TextSingleQuestion | TextMultipleQuestion
  | NumberExactQuestion | TimelineQuestion | DistanceQuestion | MapPinpointQuestion;
export type Submission = string | number | boolean | LatLng;
export type Notice = 'invalid' | 'out-of-range' | 'duplicate' | 'not-found' | null;
export interface QuizAnswer {
  questionId: string;
  value: Submission;
  correct: boolean;
  skipped: boolean;
  points: number;
  foundIds: string[];
  distanceKm?: number;
}
export interface SubmissionEvent {
  index: number;
  value: Submission;
  locale: Locale;
  skipped: boolean;
}
export interface QuizRun {
  version: 2;
  id: string;
  startedAt: number;
  rounds: number;
  difficulty: Difficulty;
  practice: boolean;
  queue: string[];
  revisions: Record<string, number>;
  index: number;
  events: SubmissionEvent[];
  answers: QuizAnswer[];
  foundIds: string[];
  notice: Notice;
  score: number;
  finished: boolean;
}
/** Renderer contract: no renderer computes correctness or changes the score. */
export interface QuestionInputProps<Q extends QuizQuestion = QuizQuestion> {
  question: Q;
  difficulty: Difficulty;
  foundIds: string[];
  disabled: boolean;
  locale: Locale;
  point?: LatLng | null;
  suggestions?: boolean;
  onSubmit: (value: Submission) => void;
}
