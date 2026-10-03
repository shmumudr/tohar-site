# tohar-site
Landing page for Tohar WhatsApp bot

## Structure

- `index.html`, `about.html`, `privacy.html`, `terms.html` — the site (hand-written).
  `about.html` and the footer name the operator (Pardes Net / Shmuel Dror, Bnei Brak) so the site matches the Meta business profile.
- `halacha/` — the halacha guide, generated from the bot's texts
  (`tohar-bot-prod/src/content/halachot.ts`) so the site and the bot always say the same thing.
  To refresh after the bot texts change, re-run the generator from the bot repo and commit the output;
  do not edit these pages by hand.
- `style.css` — one stylesheet for everything; palette and type follow the logo (ink #22304a, copper #b9764b, paper #f6f1e8).
- `favicon.svg`, `apple-touch-icon.png`, `og-image.png` — built from the mark.
