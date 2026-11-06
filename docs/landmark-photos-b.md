# Landmark photographs: batch B

Five actual photographs selected for location-pin questions. Each local file is an unedited, provider-generated Wikimedia Commons JPEG thumbnail, 960 pixels wide. Only the downloaded thumbnail is shipped; no photo was generated, cropped, retouched, or recompressed locally. Retain each listed photo license and credit when displaying or redistributing it.

All five delivered files were opened with `view_image` and visually inspected at the delivered resolution. No visible national flags, country labels, watermarks, or overlaid country text were identified in these chosen images. Neutral asset paths and alt text avoid city and country names.

| Question | Local file | Dimensions | Credit | License | Source |
| --- | --- | --- | --- | --- | --- |
| historic-eiffel | `public/art/landmarks-v1/eiffel-tower.jpg` | 960 × 1438 | Joe deSousa | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [File:The Eiffel Tower, Paris 29 June 2015.jpg](https://commons.wikimedia.org/wiki/File:The_Eiffel_Tower,_Paris_29_June_2015.jpg) |
| historic-liberty | `public/art/landmarks-v1/statue-of-liberty.jpg` | 960 × 1326 | Elcobbola | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | [File:Statue of Liberty 7.jpg](https://commons.wikimedia.org/wiki/File:Statue_of_Liberty_7.jpg) |
| historic-sydney-opera | `public/art/landmarks-v1/opera-house.jpg` | 960 × 680 | Thomas Schoch | [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/) | [File:Sydney Opera House Australia.jpg](https://commons.wikimedia.org/wiki/File:Sydney_Opera_House_Australia.jpg) |
| historic-christ-redeemer | `public/art/landmarks-v1/christ-redeemer.jpg` | 960 × 1440 | Nico Kaiser | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | [File:Cristo Redentor - Rio de Janeiro, Brasil.jpg](https://commons.wikimedia.org/wiki/File:Cristo_Redentor_-_Rio_de_Janeiro,_Brasil.jpg) |
| historic-angkor-wat | `public/art/landmarks-v1/angkor-wat.jpg` | 960 × 540 | Radek Kucharski | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | [File:Angkor Wat Reflection (46810498612).jpg](https://commons.wikimedia.org/wiki/File:Angkor_Wat_Reflection_(46810498612).jpg) |

## Inspection notes

- Eiffel Tower: clear daylight photograph against a blue sky. The whole tower is recognizable; no nighttime illumination, flag, or text is visible. Portrait source, so preserve the entire image in the quiz layout.
- Statue of Liberty: clear front-left photograph of the original monument on Liberty Island, confirmed by the source page's object location and photograph description. The entire statue and pedestal are visible without the flag seen in an earlier, rejected candidate. This is not a replica. Portrait source.
- Opera House: clear daytime overview showing the distinctive complete roof forms, foreground water, and building facade. No visible national flags or readable country labels. Alt text intentionally uses the building type without its city.
- Christ the Redeemer: frontal daylight photograph with both hands fully visible and a small crowd below. No visible national flags or country labels. Portrait source; preserve the head and hands. Photograph by Nico Kaiser; sculpture by Paul Landowski. Commons identifies this photo as covered by freedom of panorama.
- Angkor Wat: clear late-afternoon overview with all central towers and their reflection. No visible national flags or readable country labels.

## Attribution verification

Source title, source page URL, thumbnail dimensions, photographer credit, and license were fetched from the Commons `imageinfo` API with `iiprop=url|size|extmetadata` and `iiurlwidth=960`. The file description pages were also consulted where needed. URLs in the JSON are HTTPS.

For **Statue of Liberty 7.jpg**, the API's top-level `LicenseShortName` reports the depicted sculpture's public-domain status. The source page explicitly distinguishes **Object** (public domain) from **Photograph** (**CC BY-SA 3.0**). The delivered JSON correctly applies the photograph's CC BY-SA 3.0 license and credits Elcobbola; do not replace it with the API's generic public-domain value.

The Eiffel Tower photo is CC0 1.0; the Opera House photo is CC BY-SA 2.5; the Christ the Redeemer and Angkor Wat photos are CC BY 2.0. The files remain under their source licenses. Provider resizing only; no local creative modifications.
