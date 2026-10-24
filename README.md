# KLJ Systems

Marketing site for KLJ Systems: websites, AI automation, custom PC builds, PC repair and IT support.
Plain HTML, CSS and JavaScript. No build step and no dependencies.

## Pages

- `index.html`: the home page. Services, the build estimator ("Price your build"), how it works, starting prices, FAQ.
- `contact.html`: the contact form. Links from the home page pre-fill it, for example `contact.html?service=Website`.
  The "Send this build to KLJ" button carries the whole parts list into the message box.

## The PC on the first screen

The hero plays a 64-frame image sequence of an exploded PC as you scroll (`js/hero.js`, frames in `assets/pc/d` for wide
screens and `assets/pc/m` for phones, about 1.3 MB each). The frames are rendered from a Three.js model in
`tools/pc3d.js`; nothing 3D runs on the live page, so it stays fast. Hotspot positions and part descriptions live in
`assets/pc/*/hotspots.json`.

To re-render after changing the model: serve the site locally, run `node tools/render-frames.mjs` (uses headless
Chrome), then convert the PNGs in `.frames/` to WebP:

```bash
ffmpeg -i .frames/desktop/%03d.png -c:v libwebp -quality 74 -start_number 0 assets/pc/d/%03d.webp
```

```bash
ffmpeg -i .frames/mobile/%03d.png -c:v libwebp -quality 74 -start_number 0 assets/pc/m/%03d.webp
```

Copy `.frames/*/hotspots.json` into the matching folder.

## Design rules

`design-system.md` is the source of truth for colours, type (Geist), components, imagery, motion and voice.
Update it first when something changes.

## Run it locally

Any static server works. For example:

```bash
python -m http.server 5317
```

Then open http://localhost:5317.

## Before launch: things to replace

These are placeholders or sample details, written so the design could be seen with real content:

| What | Where |
| --- | --- |
| Email `hello@kljsystems.com` | `index.html` footer, `contact.html` (tiles and footer), `js/contact.js` (`CONTACT.email`) |
| Hours "Mon to Sat, 9 am to 6 pm" | both footers, contact page tile |
| Starting prices ($49, $150, $1,200, $500, care plans) | pricing table and phone cards in `index.html` |
| Turnarounds, warranties, "24-hour stress test", "reply within one business day" | `index.html`, `contact.html` |
| Parts and prices in the estimator | `js/build.js` (`BUILDS`). Review them regularly; part prices move. |
| Phone number and address | not on the site yet; add them to the contact tiles and footer if you want them shown |

## Make the form deliver to an inbox

Right now the form opens the visitor's email app with the request already written out.
To receive submissions directly instead, create a free form endpoint (Formspree, Basin, Getform, or your own)
and paste its URL into `js/contact.js`:

```js
const CONTACT = {
  endpoint: 'https://formspree.io/f/your-id',
  email: 'you@yourdomain.com',
};
```

The form already validates, has a spam trap, and shows a thank-you message.

## Pictures

All photos and the one video clip are openly licensed from Wikimedia Commons and credited in each page's footer.
They show computer hardware in general, not KLJ's own work. Swap in photos of your own bench, builds and
setups when you have them (same file names in `assets/img/`, or update the `src` paths). The full list of sources and licences is in
`assets/img/credits.json`.

## Hosting

Upload the folder as-is to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).
