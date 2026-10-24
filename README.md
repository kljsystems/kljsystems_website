# KLJ Systems

Marketing site for KLJ Systems: websites, AI automation, custom PC builds, PC repair and IT support.
Plain HTML, CSS and JavaScript. No build step and no dependencies.

## Pages

- `index.html`: the home page. Services, the build estimator ("Price your build"), how it works, starting prices, FAQ.
- `contact.html`: the contact form. Links from the home page pre-fill it, for example `contact.html?service=Website`.
  The "Send this build to KLJ" button carries the whole parts list into the message box.

## The 3D PC on the first screen

`js/pc3d.js` builds a mid-tower PC in Three.js (loaded from the jsDelivr CDN) and loops it apart and back together,
with a label on each part. Visitors can drag to turn it and press Pause. With "reduce motion" switched on it shows
the exploded view, still. If a browser has no 3D support, the motherboard photo underneath shows instead.
Add `?pc=apart` or `?pc=together` to the URL to freeze it in one pose (useful for screenshots).

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
