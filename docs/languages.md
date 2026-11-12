# PT / EN localization

The language switch stores only `geokiwi.locale.v1` (`pt` or `en`); existing games, scores, theme and other preferences are untouched. English and the dark palette are the defaults on a first visit; saved Portuguese and light-theme preferences are respected. Document language is `pt-PT` or `en`. A second selector is available inside the country-game settings while the main header is hidden.

`useLocale()` from `src/i18n/LocaleContext.jsx` exposes `locale`, `setLocale`, `t`, `countryName` and `capitalName`. `catalog.js` contains English UI copy; `geography.js` contains country and capital display names. All displayed English names are checked against existing accepted typed answers.

Vite uses the small local JSX runtime in `src/i18n/`. It localizes text children, titles, alt text, placeholders and accessible labels through React context while rendering. There is no DOM scan, DOM mutation, remote translation service or HTML injection. It leaves element types, refs, handlers, input values, option values, IDs, classes, keys, data and map geometry unchanged. Development JSX retains static-child metadata. Compound strings use the catalog and Unicode word boundaries; full paragraphs have explicit translations.

For text shortened before it is rendered, use `countryName` / `capitalName` first, as in MapAnswerLabel. User-entered strings are never translated. English autocomplete prioritizes English labels and accepts either language.

The Home widget receives `locale` explicitly and has its own bilingual factual copy. HomeBackdrop stays mounted on all app branches; the parent scenery rules let game maps cover it during active play and expose it on results and statistics.
