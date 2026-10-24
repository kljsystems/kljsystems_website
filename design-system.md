# KLJ Systems — design system

The source of truth for every page and component. Change this file first, then the code.

## Project brief

- **What the site is for:** KLJ Systems, a local IT business: websites, AI automation, custom PC builds, PC repair, IT support.
- **Audience:** people and small businesses near the shop who need something built, fixed or set up, and gamers and
  creators who want a custom PC. They want a fair price, in writing, from someone who knows what they are doing.
- **Main goal:** get a request through the contact form (often pre-filled from the build estimator).
- **Pages:** home (`index.html`), contact (`contact.html`).
- **Stack:** plain HTML, CSS and JavaScript. No build step. Hosted as static files.
- **Reference:** Apple's MacBook Pro page, dark mode ("black theater with luminous hardware",
  via styles.refero.design), adapted to the KLJ palette.

## Voice and personality

Calm, exact, hands-on, fair, unflashy. Short sentences. Real numbers (prices, days, hours). Talk to one person ("you"),
use contractions (we'll, you'd, what's). Describe the moment the problem goes away ("a printer nobody can find"), not the
category ("printers").

Never: hype words (unlock, elevate, seamless, empower, cutting-edge, leverage, robust, journey), "not just X, it's Y",
habitual lists of three, vague claims, em dashes in running copy, rhetorical questions as headings, exclamation marks,
or the same heading pattern twice in a row (e.g. "X. No Y.").

## Colour

Apple's colour rationing, with purple in place of Apple's blue. Everything is black-to-white; purple marks actions.

| Token | Value | Use |
|---|---|---|
| `--black` | `#000000` | Page canvas, hero, nav backdrop |
| `--charcoal` | `#1d1d1f` | Cards on black, footer |
| `--smoke` | `#333336` | Secondary button fills and tags on dark |
| `--graphite` | `#424245` | Base of the glass colour |
| `--ash` | `#86868b` | Muted body text on dark, helper copy |
| `--platinum` | `#cccccc` | Nav links at 80% |
| `--silk` | `#f5f5f7` | Text on dark; light band background |
| `--white` | `#ffffff` | Light cards (the build sheet) |
| `--neu-bg` | `#eeeef2` | Neumorphic bands (estimator, contact form) |
| `--accent` | `#7c4dff` | **Primary buttons only** (white text, 5.8:1) |
| `--link` | `#b794ff` | Links and short emphasis on dark |
| `--link-deep` | `#6d3df5` | Links and selected states on light |
| `--spectrum` | `linear-gradient(108deg, #4b2bd6, #7c4dff 33%, #b794ff 66%, #f0e6ff)` | Small decorative pieces only: the logo chip, slider fill, the highlighted price card's edge |
| error | `#d70015` | Form errors |

No gradients behind text blocks. The only atmospheric gradients are the soft purple glows behind the hero PC and the
closing call to action.

## Typography

**Geist** for headings and body (Google Fonts, free, OFL), chosen in Level 3 for being the closest open font to Apple's SF Pro.
Stack: `"Geist", -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif`. Weights 300 / 400 / 600 only.
Loaded with `https://fonts.googleapis.com/css2?family=Geist:wght@300;400;600&display=swap`.

| Role | Desktop | Mobile | Line height | Tracking | Weight |
|---|---|---|---|---|---|
| display | 80px | 48px | 1.05 | -0.015em | 600 |
| heading | 56px | 36px | 1.07 | -0.005em | 600 |
| heading-sm | 40px | 28px | 1.1 | 0 | 600 |
| sub | 28px | 22px | 1.14 | 0.007em | 600 |
| tagline | 21px | 21px | 1.19 | 0.011em | 600 or 400 |
| body | 17px | 17px | 1.47 | -0.022em | 400 |
| caption | 14px | 14px | 1.29 | -0.01em | 400 / 600 |
| micro | 12px | 12px | 1.33 | -0.01em | 400 |

## Space and layout

- Base unit 4px. Max width 1440px; side padding 20–48px.
- Sections: full-bleed bands, 88–144px top and bottom. Alternate black / light (`--silk` or `--neu-bg`) / charcoal.
- Grids: services bento (3 columns, one wide, one tall), pricing 4 columns, 20px gaps. Collapse to 2 then 1.
- Section openers: heading left, one link or short line right.

## Shape and depth

- Cards **28px**, small cards 22px, buttons and inputs pills (9999px), links 10px.
- Dark sections: no shadows. Depth from tone (charcoal on black) and **glass**:
  `rgba(66,66,69,0.72)` with `backdrop-filter: saturate(180%) blur(20px)` for the nav, the hero price bar,
  hotspot labels and their cards, media captions.
- Light sections: **neumorphism** on hands-on controls only.
  Raised `8px 8px 18px #d0d0d8, -8px -8px 18px #fff`; small `4px 4px 10px …`; inset `inset 4px 4px 10px #d0d0d8, inset -4px -4px 10px #fff`.
  Selected options and focused fields go from raised to inset.
- The build sheet is the one white card, with a soft purple-tinted shadow underneath.

## Components

- **Primary pill:** `--accent` fill, white 17px/400 text, 11px 22px padding, 44px tall; hover `#8e63ff`; press `scale(0.97)`.
- **Small pill:** 14px text, 7px 15px padding (nav and hero bar).
- **Ghost pill:** no fill, `--link` text (or `--link-deep` on light), underline on hover, chevron `›` nudges right.
- **Nav:** sticky, 48px, black glass, wordmark with the spectrum chip, 12px links at 80% white, small primary pill.
  Hides while scrolling down, returns on any scroll up.
- **Tile (services):** charcoal, 28px radius, 28px padding, tag chip, 28px title, ash body, link at the bottom,
  optional photo filling the lower part with a short charcoal fade.
- **Price card:** charcoal; the recommended plan gets a 1.5px spectrum edge and a small spectrum flag.
- **Hotspot:** glass pill with a lit purple dot; hover, focus or tap shows a glass card with the part's description.
- **FAQ:** native `details`, hairline separators, neumorphic plus button that turns into a cross.
- **Form fields:** inset neumorphic pills (textarea 22px radius); focus adds a 2px `--link-deep` ring; errors a red ring.

## Imagery

- **Hero:** the in-house 3D render of a KLJ build (`tools/pc3d.js`), exported as a 64-frame image sequence
  (`assets/pc/d` 1600×1000, `assets/pc/m` 900×1200, WebP). Pure black background, purple light.
- **Other photos:** currently openly licensed Wikimedia Commons photos (credited in the footer). To replace with custom
  visuals: real photos of KLJ's bench and builds, or AI-generated images (needs Higgsfield credits).
- **Interface fragments** (code, automation log) are built in HTML, not screenshots.
- Photos sit inside 28px cards, never full-bleed behind text.

## Motion

- Hero: scroll-scrubbed image sequence over ~4 screens; headline fades and lifts; three captions take turns;
  hotspots appear once the PC is apart.
- Entrances: fade and rise 24px, 800–1000ms, expo-out, 80ms stagger, once. Headings rise line by line.
- Hover: colour changes 200ms; pills press to `scale(0.97)`; photos zoom to 104% over 900ms.
- Reduced motion: no scroll story (the assembled PC and headline show as a still first screen), no travel, loops stop.
