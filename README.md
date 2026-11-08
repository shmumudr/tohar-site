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
