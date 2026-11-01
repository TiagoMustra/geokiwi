# Islands homepage theme

The selected islands proposal is now the homepage scene. The original KiwiMark logo and wordmark are preserved. A fixed backdrop stays continuous behind expanded category content; opaque panels preserve readable game options. Games and their maps have their own backgrounds. Day/night contrast follows the existing theme setting.

## Assets

- `public/art/kiwi-islands-v1.png`: desktop panorama (1536 × 1024).
- `public/art/kiwi-islands-mobile-v1.png`: mobile composition (1086 × 1448).
- Responsive image preloads in index.html start only the matching image download.

Both raster assets were generated with the built-in image generation tool. Kiwi always means fruit. The selected comparison was the style reference; no generated UI or lettering is used in the real interface.

## Icon system

`src/components/pixel-icons.js` defines the shared 16px palette, illustrated SVG paths and stepped control glyphs. `Icon.jsx` uses this one library in categories, game cards, previews, settings and game buttons. The original KiwiMark implementation is retained verbatim. These are editable code-native icons, with no external image requests.

## Future background choices

`HomeBackdrop.jsx` owns the responsive scene; `src/islands.css` owns its treatment. The menu has `data-background="islands"`. Other choices can be added here later without touching game state, scores or map rendering. No theme selector has been added yet.

## Desktop generation prompt

Use case: stylized-concept.
Asset type: final full-page website background illustration, not a mockup.
Reference: ONLY concept 02 ILHAS in the MIDDLE panel of the reference board. Re-create its continuous illustrated archipelago as ONE standalone scene with NO UI, NO lettering, NO logo, NO title, NO panels or cards, NO borders. Do NOT reproduce the comparison board.
Primary request: approved GeoKiwi kiwi-FRUIT island background, expanded to fill the whole website. Kiwi means fruit: visible cut green kiwi with cream center, radial tiny black seeds, thin brown skin, a whole brown kiwi, a small folded map and soft explorer hat resting on a lower-left grassy island. Absolutely NO kiwi birds or other animal mascots.
Composition: landscape 3:2 panorama. Upper 28% pale warm cream sky, calm empty central sky for real HTML title. Distant softly drawn blue-grey mountains near horizon, a SMALL decorative Earth globe on far upper right among distant mountains. Calm desaturated dusty-blue sea through the central and lower page. Small pine-covered islands along left and right margins, a tiny lighthouse on a mid-left island, one small cream sailboat near lower-right, rocky grass-framed lower corners. Kiwi fruit and map visible toward the lower-left foreground, not huge. Preserve focal objects within central 85% so minor responsive cropping works. Centre 60% predominantly quiet open sea, sufficient clear space for webpage cards. Scene flows continuously from sky through mountains to sea and islands all the way to bottom, no banner seam.
Style: detailed but restrained crisp pixel art, square pixel edges, warm beige, muted sage/olive, soft brown, greyish blue. Same subdued palette and cosy geography exploration mood as the reference middle panel. No neon, no bright turquoise, no photographic texture, no gradients pretending to be pixel art, no watermark, no text of any kind. Output only the finished landscape artwork.

## Mobile generation prompt

Use case: style-transfer. Asset: final MOBILE version of the approved GeoKiwi island background.
Adapt the reference scene to a tall portrait 3:4 composition, not a website mockup. Keep its exact subdued crisp pixel-art style, pale cream sky, dusty grey-blue ocean, small pine-covered islands, mountains, tiny lighthouse, small sailboat, kiwi FRUIT and folded map. Absolutely no birds or animal mascots.
Recompose, do not stretch: the upper 32% is mostly empty warm cream sky for real HTML title, a small Earth globe by distant mountains at upper right, central 45% predominantly quiet sea for cards. The small lighthouse sits at left edge at mid-height, sailboat right. At the BOTTOM left place the recognizable whole brown kiwi and cut green kiwi fruit with pale centre and black seeds, hat and folded map among grass, flowers and rocks, all comfortably inside the frame so it is visible on a narrow phone. Crisp restrained pixels, same palette and landscape as the reference, no new major objects. Continuous artwork fills whole canvas. NO UI, NO lettering, NO logo, NO title, NO cards, NO watermark, NO frame.
