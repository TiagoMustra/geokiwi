# Conhecimento geral and game cards — 2026-11-06

The bank adds 94 questions: 30 flag variants, 32 continental/country-set variants, and 32 numeric/timeline/city-pin/distance variants. There are 476 eligible questions per locale and 508 authored records including separate name-language variants. Existing IDs, saved queues, scoring, history and records remain compatible.

The mode is named Conhecimento geral / General knowledge. Explore the world belongs to Outros modos alongside Portugal and US states. All nine expanded cards use GameCardHeading with the same pixel artwork, typography, card spacing and action layout. Country/capital region buttons retain their multiselect behavior. The single-game category uses the singular game count and lists only the quiz.

Exports are generated directly from the validated bank in every production build: public/downloads/conhecimento-geral.md and .json. Both include all 508 records, translations, solutions, explanations and sources; the Markdown also documents difficulty quotas. The card links to the readable download.

Verification:

- 155 automated tests passed, including full export equality, all question schemas/aliases, seven types, per-language pools, selection/history, geographic sets, flag counts and difficulty quotas.
- TypeScript contract check and production Vite build passed.
- All four categories inspected in an isolated Brave profile at 1440×1000 and 375×812, in dark/light and PT/EN. No horizontal overflow or runtime exceptions observed.
- Every expanded card has the same 68×68 desktop artwork panel (64×64 mobile). Existing example panels are replaced by a shared image heading.
- Country multiselect still permits Africa + Europe; Explore the world starts and saves from its new category.
- JSON and Markdown HTTP downloads contain all 508 records, with 476 eligible per locale.
- A new 20-round Medium game contains all seven input types and the featured flag/name groups. The in-game accessible name is localized to General knowledge.
- São Tomé and Príncipe submitted through autocomplete correctly earns 100 in the African Equator land question. No map is shown for text/list questions.

Research boundaries and individual primary sources are recorded in quiz-flag-variants-provenance.md, quiz-continental-provenance.md and quiz-world-variants-provenance.md. Question-level citations are included in both exports.
