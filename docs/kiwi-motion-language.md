# Animated scene, kiwi map answers and languages

The islands scene now surrounds the home page, statistics, dialogs and final results. During actual map gameplay its animation is paused and hidden behind the map. Background layers never receive pointer events. CSS animation also stops for reduced-motion preferences, and the scene pauses while the browser tab is hidden.

## Art and movement

- `public/art/kiwi-islands-v2.png`: desktop background with the static boat removed.
- `public/art/kiwi-islands-mobile-v2.png`: matching phone composition.
- `HomeBackdrop.jsx` and `scenery-motion.css`: editable pixel SVG sailboat, gentle waves, flying seabirds and swaying ferns. Fern branches move independently with offset phases for a gentle breeze. The walking kiwi bird was removed; the kiwi fruit remains the brand and logo.

Both raster edits used the built-in image generation tool. Final edit prompt (applied separately to the desktop and mobile originals):

> Use case: precise-object-edit. Edit target: the approved GeoKiwi background. Change ONLY the small cream sailing boat on the sea at the right: remove the entire boat, sails and its immediate wake and fill that small region with matching calm pixel-art sea and existing wave colors. We will draw an animated boat in real HTML/SVG at runtime. Keep everything else unchanged: original framing and aspect ratio, cream sky, globe, all mountains/islands/lighthouse/grass/kiwi fruit/map/hat, same low-saturation palette, same crisp pixel texture. Do not add text, UI, birds or other objects. Return only this same background with that little boat removed.

## Map texture

`KiwiMapTexture.jsx` supplies a shared SVG pattern for flat maps, globe, municipalities and US states. Correct answers get green flesh, small seeds, a subtle pale centre and a brown boundary. The pattern stays at a comfortable screen size during zoom. Wrong answers keep their red fill, and the municipality correction stays yellow. Patterns have unique IDs per map, including result maps.

Initial world framing is only slightly closer: 1.1× on the flat map and 1.08× on the globe. Region-specific and automatic country zooms are preserved.

## Facts and language

`src/data/kiwi-facts.js` contains at least 100 distinct PT/EN facts exclusively about kiwifruit, with individual primary-source links. Bird facts are excluded. `KiwiFacts.jsx` rotates them every 12 seconds, with previous, next and pause controls. Rotation pauses while reading/focusing, while the tab is hidden, and for reduced-motion preferences.

`src/i18n/` holds the PT/EN interface catalog, display names, context and shared JSX text-rendering adapter. Language is stored separately from game progress in `geokiwi.locale.v1`. Inputs, country IDs, answer IDs, queues and storage keys are preserved. English country and capital names remain accepted answers. No translation API or backend is needed.
