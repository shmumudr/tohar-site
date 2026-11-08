# tohar-site
Landing page for Tohar WhatsApp bot

## Structure

- `index.html`, `about.html`, `privacy.html`, `terms.html` — the site (hand-written).
  The site deliberately shows no personal details of the operator; contact is by email only (bottahara@gmail.com).
- `halacha/` — the halacha guide, generated from the bot's texts
  (`tohar-bot-prod/src/content/halachot.ts`) so the site and the bot always say the same thing.
  To refresh after the bot texts change, re-run the generator from the bot repo and commit the output;
  do not edit these pages by hand.
- `style.css` — one stylesheet for everything: white page, ink #101a2b, one blue #1450d2 (the seven clean days), Rubik.
- `favicon.svg`, `apple-touch-icon.png`, `og-image.png` — built from the mark.

## Calculator

`calculator.html` and `en/calculator.html` run `calc/calculator.js`, which uses the same rule as the bot
(`tohar-bot-prod/src/period/calculate.ts`): hefsek = effective sighting day + (waiting days − 1),
seven clean days follow, mikvah night is the night after day 7.
`calc/hdate.js` is an esbuild bundle of `@hebcal/hdate` 0.22.8 (the version `@hebcal/core` 6.3.0 in the bot uses),
GPL-2.0 — its licence header is kept in the file. Rebuild with:
`echo "export { HDate, months, gematriya } from '@hebcal/hdate';" > entry.js && npx esbuild entry.js --bundle --format=esm --minify --legal-comments=inline --outfile=calc/hdate.js`
