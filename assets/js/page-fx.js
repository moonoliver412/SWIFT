/* Swift Consultancy — inner-page motion enhancements.
   Loads on jobs/services/about/faq/contact after motion.js. Fail-safety:
   motion.js exports window.Swift only when the motion layer initialized,
   so this file bails to the static experience whenever it is absent.
   Transforms/opacity (plus text settles) only; every hide-then-reveal
   initial state is applied here via gsap.set, never by CSS. */
(() => {
  'use strict';
  if (!window.Swift) return;
  const { gsap, ScrollTrigger } = window.Swift;
  const page = document.body.dataset.page;

  /* Slide cards in along x while the core .reveal batch owns autoAlpha/y.
     The core tween runs with overwrite:true on these same elements, which
     would kill a direct x tween that starts in the same batch flush — so
     tween a proxy (different target, immune to overwrite) and write x per
     frame; gsap merges the transform components. */
  function slideX(targets, fromX, start) {
    const els = gsap.utils.toArray(targets);
    if (!els.length) return;
    // ≥768px only: positive pre-offsets widen the layout viewport on phones
    // (horizontal overflow at load); matchMedia auto-reverts the sets on shrink
    gsap.matchMedia().add('(min-width: 768px)', () => {
      els.forEach((el, i) => gsap.set(el, { x: fromX(i) }));
      ScrollTrigger.batch(els, {
        start, once: true,
        onEnter: batch => batch.forEach(el => {
          const p = { x: gsap.getProperty(el, 'x') };
          gsap.to(p, {
            x: 0, duration: .9, ease: 'power3.out',
            onUpdate: () => gsap.set(el, { x: p.x })
          });
        })
      });
    });
  }

  const fx = {

    /* ============ jobs ============ */
    jobs() {
      // "40 slots" → count up from 0, keeping the suffix (mono font in core)
      gsap.utils.toArray('.board-row .pos').forEach(el => {
        const m = el.textContent.match(/^(\d+)([\s\S]*)$/);
        if (!m) return;
        const target = +m[1], suffix = m[2], n = { v: 0 };
        ScrollTrigger.create({
          trigger: el, start: 'top 90%', once: true,
          onEnter: () => gsap.to(n, {
            v: target, duration: 1.2, ease: 'power2.out',
            onUpdate: () => { el.textContent = Math.round(n.v) + suffix; }
          })
        });
      });

      // status badges settle like gate announcements (optional CDN cargo)
      if (typeof ScrambleTextPlugin !== 'undefined') {
        const badges = gsap.utils.toArray('.board-row .status');
        if (badges.length) ScrollTrigger.create({
          trigger: '.board', start: 'top 82%', once: true,
          onEnter: () => badges.forEach((el, i) => gsap.to(el, {
            duration: .8, delay: .2 + i * .09,
            scrambleText: { text: el.textContent, chars: 'upperCase', speed: .4 }
          }))
        });
      }

      // sector cards approach from alternating sides
      slideX('.services-grid .svc', i => (i % 2 ? 36 : -36), 'top 88%');
    },

    /* ============ services ============ */
    services() {
      // icon strokes draw in as each card reveals — DrawSVG is optional;
      // without it the icons simply render fully stroked, as in static.
      if (typeof DrawSVGPlugin === 'undefined') return;
      ScrollTrigger.batch('.services-grid .svc', {
        start: 'top 88%', once: true,
        onEnter: batch => batch.forEach((card, i) => {
          const strokes = card.querySelectorAll('.svc-icon svg *');
          if (strokes.length) gsap.fromTo(strokes,
            { drawSVG: '0% 0%' },
            { drawSVG: '0% 100%', duration: .7, stagger: .08, ease: 'power2.inOut', delay: .15 + i * .12 });
        })
      });
    },

    /* ============ about ============ */
    about() {
      // trust checklist ticks stagger in (the .trust container is core-revealed)
      const ticks = gsap.utils.toArray('.trust li');
      if (ticks.length) {
        gsap.set(ticks, { autoAlpha: 0, x: -24 });
        ScrollTrigger.batch(ticks, {
          start: 'top 85%', once: true,
          onEnter: batch => gsap.to(batch, { autoAlpha: 1, x: 0, duration: .7, ease: 'power3.out', stagger: .12 })
        });
      }

      // warning-card red accent draws across (strip is motion-ok-gated in CSS)
      const strip = document.querySelector('.warning-card .warn-draw');
      if (strip) ScrollTrigger.create({
        trigger: '.warning-card', start: 'top 85%', once: true,
        onEnter: () => gsap.fromTo(strip, { scaleX: 0 }, { scaleX: 1, duration: .8, ease: 'power2.out' })
      });

      // avatars pop once the testimonial grid arrives
      const avatars = gsap.utils.toArray('.testi-grid .avatar');
      if (avatars.length) {
        gsap.set(avatars, { scale: .4 });
        ScrollTrigger.create({
          trigger: '.testi-grid', start: 'top 85%', once: true,
          onEnter: () => gsap.to(avatars, { scale: 1, duration: .6, ease: 'back.out(2.4)', stagger: .12, delay: .25 })
        });
      }
    },

    /* ============ faq ============ */
    faq() {
      // accordion items are not core-revealed — stagger them in here
      const items = gsap.utils.toArray('.faq-list details');
      if (items.length) {
        gsap.set(items, { autoAlpha: 0, x: -22 });
        ScrollTrigger.batch(items, {
          start: 'top 90%', once: true,
          onEnter: batch => gsap.to(batch, { autoAlpha: 1, x: 0, duration: .8, ease: 'power3.out', stagger: .1 })
        });
      }
    },

    /* ============ contact ============ */
    contact() {
      // form fields cascade inside the core-revealed card. .field rows own a
      // CSS transform transition (focus nudge), so suspend it while gsap holds
      // the transform, then hand everything back to the stylesheet.
      const card = document.querySelector('.contact-card');
      const fields = card ? gsap.utils.toArray(card.querySelectorAll('.field')) : [];
      if (fields.length) {
        gsap.set(fields, { autoAlpha: 0, y: 18, transition: 'none' });
        ScrollTrigger.create({
          trigger: card, start: 'top 80%', once: true,
          onEnter: () => gsap.to(fields, {
            autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out', stagger: .08,
            onComplete: () => gsap.set(fields, { clearProps: 'transform,opacity,visibility,transition' })
          })
        });
      }

      // info rows slide in from the right (core reveal owns autoAlpha/y)
      slideX('.contact-info .info-row', () => 30, 'top 88%');
    }
  };

  if (fx[page]) fx[page]();
})();
