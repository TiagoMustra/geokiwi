# Fun facts — visual verification, 2026-11-06

Production Vite preview checked in an isolated Brave profile at 1360 × 900 and 375 × 812.

- Taj Mahal: local photo renders, Monument label present, no country in the question and no static map reticle. Physical map loads below the compact panel.
- Photo viewer: full landscape and portrait images remain contained; credits stay visible; mobile dialog fits without horizontal overflow. Close button and keyboard Escape work. Opening the photo during feedback pauses automatic progression.
- All ten local photographs load at their expected 960-pixel width.
- Portuguese country-name-length question: choosing Portugal in autocomplete immediately adds one answer to the Medium quota; there is no map behind the question.
- Switching the interface to English preserves the Portuguese reference-language rule and the already discovered answer in that saved run.
- Nordic-cross flag question: choosing Denmark in autocomplete immediately submits the Easy answer for 100 points.
- The new-run counter displays 382 questions in PT and EN. English monument prompts and type labels are localized.
- No JavaScript runtime exceptions were observed during these flows.

Automated validation: 151 tests passed, standalone TypeScript contract check passed, production build passed. Bank/selection regression checks cover unseen flag/name subjects, per-language pools and difficulty quotas.
