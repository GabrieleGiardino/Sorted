# Q Beauty — libreria visual Higgsfield

Prompt e reference usati per generare la nuova libreria immagini Q Beauty
(homepage hero + sezione "Progetti selezionati"). Modello Higgsfield:
`marketing_studio_image`, risoluzione 2k.

## Reference reali usate come base (packaging, logo, mani)

Scaricate dal sito live qbeautyshop.it (non presenti in precedenza nella repo):

- Packaging/prodotto: `https://www.qbeautyshop.it/Home-Prodotti.png`
- Logo oro: `https://www.qbeautyshop.it/img/qbeautyshop-logo.png`
- Riferimento mani/pelle: `https://www.qbeautyshop.it/img/founder3.jpg`

Prodotti reali: flacone spray cilindrico nero opaco con pompa oro satinato,
vasetto nero opaco con spatola oro satinato, wordmark oro "Q•BEAUTY /
YOUR PEDICURE EXPERIENCE".

## Prompt base (creativo, fornito dal cliente)

> Create premium editorial beauty campaign imagery based on the attached real
> product reference images. Keep packaging, bottle geometry, label design,
> logo placement and brand colors faithful to the references. The result must
> feel like a high-end skincare/pedicure luxury campaign: clean studio
> lighting, elegant composition, premium materials, realistic hands, refined
> shadows, subtle styling, modern beauty art direction, highly realistic
> product rendering, no surreal anatomy, no fake typography, no distorted
> packaging, no generic AI look.

## Negative guidance (fornita dal cliente, incorporata inline in ogni prompt)

> no extra fingers, no warped hands, no altered label text, no invented
> packaging, no floating objects, no cheap collage aesthetic, no plastic
> skin, no low resolution, no random ribbons, no overdecorated background,
> no unrealistic reflections, no duplicate objects, no malformed caps or
> bottles

## Asset generati

| File | Formato | Uso | Note |
|---|---|---|---|
| `assets/qbeauty-hero-desktop.webp` | 16:9 | Hero homepage (desktop) | Bottiglia + vasetto su marmo caldo, spazio negativo a sinistra per il titolo |
| `assets/qbeauty-hero-mobile.webp` | 4:5 | Hero homepage (mobile, `<picture>` art direction) | Flacone singolo centrato |
| `assets/qbeauty-stilllife.webp` | 4:5 | Libreria / futuro uso | Still life editoriale, profondità di campo ridotta |
| `assets/qbeauty-texture-hand.webp` | 1:1 | Libreria / futuro uso | Macro texture, mano che preleva la crema con la spatola |
| `assets/qbeauty-lineup.webp` | 3:4 | Card featured "Progetti selezionati" | Lineup completo (spray + 2 vasetti) su vassoio oro satinato |

## Prompt esatti per shot

### 1. Hero desktop (16:9)
```
Create premium editorial beauty campaign imagery based on the attached real Q•BEAUTY product reference images. Keep packaging, bottle geometry, label design, gold logo placement and brand colors faithful to the references: matte black cylindrical spray bottle with a satin-gold pump head, matte black jar with a satin-gold spatula, gold engraved Q•BEAUTY wordmark. High-end pedicure and skincare luxury campaign, website hero banner composition: the black-and-gold spray bottle and jar standing together on a warm honey-toned marble surface, soft directional studio lighting with controlled gentle shadows, generous elegant negative space on the left third of the frame for a headline, premium materials in the scene such as brushed satin metal, natural stone and a folded ivory spa towel, refined modern beauty art direction, highly realistic product rendering, sharp packaging geometry, no people, no hands. Warm, clean, sophisticated background — not pitch black and empty. Strictly avoid: extra fingers, warped or deformed hands, altered or invented label text, invented packaging shapes, floating objects, cheap collage aesthetic, plastic-looking skin, low resolution, ribbons, glitter, overdecorated background, unrealistic reflections, duplicated objects, malformed caps or bottles, AI-slop look.
```

### 2. Hero mobile (4:5)
```
Create premium editorial beauty campaign imagery based on the attached real Q•BEAUTY product reference images. Keep packaging, bottle geometry, label design, gold logo placement and brand colors faithful to the references: matte black cylindrical spray bottle with a satin-gold pump head, gold engraved Q•BEAUTY wordmark. Vertical mobile hero banner for a luxury pedicure/skincare brand website: the black-and-gold spray bottle standing tall and centered on a warm honey-toned stone surface, soft top-down studio light with gentle realistic shadow, clean negative space above and below the product for text overlay, premium minimal styling with a hint of brushed satin metal and natural stone texture, refined modern beauty art direction, highly realistic product rendering, sharp packaging geometry, no people, no hands. Warm, clean, sophisticated background — not pitch black and empty. Strictly avoid: extra fingers, warped or deformed hands, altered or invented label text, invented packaging shapes, floating objects, cheap collage aesthetic, plastic-looking skin, low resolution, ribbons, glitter, overdecorated background, unrealistic reflections, duplicated objects, malformed caps or bottles, AI-slop look.
```

### 3. Still life premium (4:5)
```
Create a premium editorial beauty still life based on the attached real Q•BEAUTY product reference images. Keep packaging, bottle geometry, label design, gold logo placement and brand colors faithful to the references: matte black spray bottle with satin-gold pump, matte black jar with satin-gold spatula resting beside it, gold engraved Q•BEAUTY wordmark clearly legible and undistorted. High-end skincare/pedicure product still life: bottle and jar arranged together on a warm neutral stone surface with soft natural shadow, one clean prop such as a folded ivory spa towel or a small brushed-metal tray nearby, soft diffused studio lighting from the side, shallow depth of field, elegant minimal composition, luxury magazine product photography quality, highly realistic rendering, sharp packaging geometry, no people, no hands. Strictly avoid: extra fingers, warped or deformed hands, altered or invented label text, invented packaging shapes, floating objects, cheap collage aesthetic, plastic-looking skin, low resolution, ribbons, glitter, overdecorated background, unrealistic reflections, duplicated objects, malformed caps or bottles, AI-slop look.
```

### 4. Close-up texture / hand interaction (1:1)
```
Create a premium editorial beauty close-up based on the attached real Q•BEAUTY product reference images (including the hand/skin reference for realistic anatomy). Keep packaging, jar geometry, label design, gold logo placement and brand colors faithful to the references: matte black jar with satin-gold spatula, cream-colored product texture inside, gold engraved Q•BEAUTY wordmark on the lid. Close-up texture and hand-interaction shot: one realistic well-manicured hand with completely correct anatomy (five natural fingers, no distortion) gently holding the open jar while the other hand's fingers hold the gold spatula scooping the soft cream product, macro focus on the product texture, soft warm studio light, shallow depth of field, luxury spa editorial mood, highly realistic skin and product rendering. Strictly avoid: extra fingers, missing fingers, warped or deformed hands, unnatural hand poses, altered or invented label text, invented packaging shapes, floating objects, cheap collage aesthetic, plastic-looking skin, low resolution, ribbons, glitter, overdecorated background, unrealistic reflections, duplicated objects, malformed caps or bottles, AI-slop look.
```

### 5. Lineup / tray shot (3:4)
```
Premium editorial beauty lineup shot of Q BEAUTY products, based on the attached real product reference images. Match packaging faithfully: one matte black cylindrical spray bottle with a satin-gold pump head, and two matte black jars with satin-gold lids, each showing the gold Q BEAUTY wordmark clearly and correctly spelled. Arrange the three items upright and neatly grouped on a satin brushed-gold tray resting on a warm beige natural stone surface, three-quarter elevated angle, soft even studio lighting, gentle realistic shadows, minimal refined luxury spa styling, magazine-quality product photography, sharp realistic packaging geometry, consistent scale between products, empty scene with no people. Avoid: distorted or extra bottles, incorrect label text, floating objects, cheap collage look, low resolution, ribbons, glitter, cluttered background, unrealistic reflections, duplicated products, malformed lids.
```

> Nota: la prima versione dello shot #5 (lineup, aspect ratio 3:4) è fallita
> (`status: failed`) senza messaggio d'errore esplicito dall'API Higgsfield;
> il retry con un prompt leggermente più corto e senza i riferimenti al logo
> come media separato è andato a buon fine.

## Rigenerare / creare varianti

Per rigenerare o creare varianti in futuro: usare lo stesso modello
(`marketing_studio_image`, 2k) passando come reference le due immagini reali
sopra elencate (packaging + logo), riprendere i prompt qui sopra e cambiare
solo l'inquadratura/aspect ratio richiesta.
