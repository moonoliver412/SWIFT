# Swift Consultancy

Static site for Swift Consultancy — a Nairobi overseas-recruitment and visa
agency connecting Kenyan job seekers with verified employers abroad. Six pages
(`index`, `jobs`, `services`, `about`, `faq`, `contact`), no build step, with a
cinematic scroll-driven motion layer built on GSAP 3.13.

## Run locally

```bash
python3 -m http.server 8745 --bind 127.0.0.1
```

Then open <http://127.0.0.1:8745>. Any static file server works — there is
nothing to install or compile.

## Viewing tips

- **Boarding intro** — the airport "NOW BOARDING" overlay plays **once per
  browser session**. To see it again, open a private/incognito window or run
  `sessionStorage.removeItem('swift-intro')` in the console and reload.
- **Scroll-driven story** — on desktop (≥1024×640) the journey film on the
  home page pins to the screen and your scroll drives it: Register →
  Match → Visa → Fly out. It snaps to composed scenes when you pause;
  the chapter buttons scroll-seek; ↺ REWATCH returns to chapter one.
- **`?nosmooth`** — append it to any URL (e.g. `/index.html?nosmooth`) to
  disable ScrollSmoother's inertia scrolling and feel the native-scroll
  version. Useful for comparing or debugging.
- **Reduced motion** — enable "reduce motion" in your OS accessibility
  settings and reload: every animation, overlay and decorative effect is
  removed and the site renders fully static (same story told by the plain
  four-step grid).
- **Mobile / narrow windows** — resize below 1024px width: the film switches
  from scroll-scrub to autoplay-in-view, pinning is disabled, and the heavy
  desktop-only effects (smooth scroll, cursor aura, magnetic buttons, 3D card
  tilt) turn off automatically.
- **Fail-safe by design** — if the GSAP CDN is unreachable (or JS is disabled)
  the site degrades to the same fully static version. Blocking individual
  plugin files only removes their specific effects.

## How the motion layer is organized

| File | Role |
|---|---|
| `assets/js/main.js` | Vanilla JS (nav, micro-interactions) — works without GSAP |
| `assets/js/motion.js` | Core motion layer: plugin registration, ScrollSmoother, shared `window.Swift` API |
| `assets/js/story.js` | Home-page scrollytelling: the pinned journey film, hero takeoff, route draw-ins |
| `assets/js/page-fx.js` | Inner-page enhancements keyed off `body[data-page]` |
| `assets/css/style.css` | Design system + micro-interactions |
| `assets/css/story.css`, `assets/css/page-fx.css` | Page-scoped motion styles |

Fail-safety contract: an inline gate sets `html.motion-ok` before paint; CSS
hides animated elements only under that class; core CDN scripts strip it on
load failure; optional plugins are feature-checked at every call site; the
page modules bail unless the core exported `window.Swift`.

## Before launch

Placeholders still to replace: `assets/img/og-cover.jpg`, hero stats, and
testimonials. The phone/WhatsApp number is live: +254 114 748405.
