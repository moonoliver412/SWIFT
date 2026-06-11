/* Swift Consultancy — motion layer (GSAP 3 + ScrollTrigger)
   Contract: the inline gate script sets html.motion-ok (and .intro-pending on
   first visit) before paint; CSS hides .reveal only under .motion-ok. If GSAP
   fails to load, script onerror + the checks below remove the classes so the
   site renders fully static. Everything here is transform/opacity only. */
(() => {
  'use strict';

  const docEl = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const boarding = document.querySelector('.boarding');

  if (reduced || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    docEl.classList.remove('motion-ok', 'intro-pending');
    if (boarding) boarding.remove();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  // optional enhancers — loaded without onerror class-stripping; register what arrived
  ['ScrollSmoother', 'ScrambleTextPlugin', 'DrawSVGPlugin', 'MotionPathPlugin'].forEach(n => {
    if (typeof window[n] !== 'undefined') gsap.registerPlugin(window[n]);
  });

  /* ================= smooth scroll (desktop-only enhancement) =================
     Must be created BEFORE any ScrollTrigger so pinType resolves correctly.
     Kill-switch: append ?nosmooth to the URL. */

  let smoother = null;
  if (typeof ScrollSmoother !== 'undefined' && fine && innerWidth >= 1024
      && !/[?&]nosmooth/.test(location.search)
      && document.querySelector('#smooth-wrapper > #smooth-content')) {
    smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper', content: '#smooth-content',
      smooth: 1.1, effects: true, ignoreMobileResize: true
    });
    docEl.classList.add('smooth-on');
  }

  /* ================= helpers ================= */

  const FLAP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·•';

  // Split-flap (Solari board) effect: chars cycle randomly, settle left→right.
  function splitFlap(el, opts) {
    const { step = 46, settleBase = 240, settlePer = 70 } = opts || {};
    if (el._flapBusy) return;
    if (!el._flap) {
      const text = el.textContent;
      el.textContent = '';
      el._flap = [...text].map(ch => {
        const s = document.createElement('span');
        s.className = 'flap-char';
        s.textContent = ch;
        el.appendChild(s);
        return { s, final: ch };
      });
    }
    el._flapBusy = 0;
    el._flap.forEach(({ s, final }, i) => {
      if (final.trim() === '') return;
      el._flapBusy++;
      const settleAt = performance.now() + settleBase + i * settlePer + Math.random() * 120;
      s.classList.add('flapping');
      let last = 0;
      const tick = now => {
        if (now >= settleAt) {
          s.textContent = final;
          s.classList.remove('flapping');
          s.classList.add('flap-done');
          setTimeout(() => s.classList.remove('flap-done'), 360);
          el._flapBusy--;
          return;
        }
        if (now - last >= step) {
          s.textContent = FLAP_CHARS[(Math.random() * FLAP_CHARS.length) | 0];
          last = now;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // Word/char splitter that preserves nested spans (.accent) and skips .stamp.
  function splitText(el) {
    const stamp = el.querySelector('.stamp');
    el.setAttribute('aria-label', el.textContent.trim().replace(/\s+/g, ' '));
    const frag = document.createDocumentFragment();
    const walk = (node, target) => {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(tok => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { target.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'st-word';
          [...tok].forEach(ch => {
            const c = document.createElement('span');
            c.className = 'st-char';
            c.textContent = ch;
            w.appendChild(c);
          });
          target.appendChild(w);
        });
      } else if (node.nodeType === 1) {
        if (node === stamp) { target.appendChild(node); return; }
        const clone = node.cloneNode(false);
        [...node.childNodes].forEach(n => walk(n, clone));
        target.appendChild(clone);
      }
    };
    [...el.childNodes].forEach(n => walk(n, frag));
    el.textContent = '';
    el.appendChild(frag);
    return { chars: el.querySelectorAll('.st-char'), words: el.querySelectorAll('.st-word'), stamp };
  }

  // 3D tilt-toward-cursor with optional glare layer.
  function addTilt(el, { rx = 8, ry = 10, glare = null } = {}) {
    gsap.set(el, { transformPerspective: 900 });
    const qx = gsap.quickTo(el, 'rotationX', { duration: .5, ease: 'power3' });
    const qy = gsap.quickTo(el, 'rotationY', { duration: .5, ease: 'power3' });
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      qx(-py * rx); qy(px * ry);
      if (glare) gsap.to(glare, { opacity: .35, x: px * 90, duration: .4, overwrite: 'auto' });
    });
    el.addEventListener('mouseleave', () => {
      qx(0); qy(0);
      if (glare) gsap.to(glare, { opacity: 0, duration: .6, overwrite: 'auto' });
    });
  }

  /* ================= global chrome ================= */

  const grain = document.createElement('div');
  grain.className = 'grain';
  grain.setAttribute('aria-hidden', 'true');
  document.body.appendChild(grain);

  const fp = document.createElement('div');
  fp.className = 'flight-progress';
  fp.setAttribute('aria-hidden', 'true');
  fp.innerHTML = '<div class="fp-line"></div><span class="fp-plane">✈</span>';
  document.body.appendChild(fp);
  gsap.to('.fp-line', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .4 } });
  gsap.to('.fp-plane', {
    x: () => window.innerWidth - 24, ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: .4, invalidateOnRefresh: true }
  });

  if (fine) {
    const aura = document.createElement('div');
    aura.className = 'cursor-aura';
    aura.setAttribute('aria-hidden', 'true');
    aura.innerHTML = '<i></i>';
    document.body.appendChild(aura);
    gsap.set(aura, { autoAlpha: 0 });
    const ax = gsap.quickTo(aura, 'x', { duration: .35, ease: 'power3' });
    const ay = gsap.quickTo(aura, 'y', { duration: .35, ease: 'power3' });
    let seen = false;
    window.addEventListener('mousemove', e => {
      if (!seen) { seen = true; gsap.set(aura, { x: e.clientX, y: e.clientY }); gsap.to(aura, { autoAlpha: 1, duration: .3 }); }
      ax(e.clientX); ay(e.clientY);
    }, { passive: true });
    document.addEventListener('mouseover', e => {
      if (e.target.closest('a,button,summary')) aura.classList.add('on');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest('a,button,summary')) aura.classList.remove('on');
    });

    // magnetic buttons
    document.querySelectorAll('.btn').forEach(btn => {
      const bx = gsap.quickTo(btn, 'x', { duration: .4, ease: 'power3' });
      const by = gsap.quickTo(btn, 'y', { duration: .4, ease: 'power3' });
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        bx((e.clientX - r.left - r.width / 2) * .26);
        by((e.clientY - r.top - r.height / 2) * .26);
      });
      btn.addEventListener('mouseleave', () => { bx(0); by(0); });
    });
  }

  /* ================= scroll reveals ================= */

  // .pass and .step have their own timelines below — exclude them here.
  const REVEAL = '.reveal:not(.pass):not(.step)';
  gsap.set(REVEAL, { autoAlpha: 0, y: 40 });
  ScrollTrigger.batch(REVEAL, {
    start: 'top 88%', once: true,
    onEnter: batch => gsap.to(batch, { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .12, overwrite: true })
  });
  ScrollTrigger.batch('.section-head', {
    start: 'top 86%', once: true,
    onEnter: batch => gsap.from(batch, { autoAlpha: 0, y: 30, duration: .8, ease: 'power3.out', stagger: .1 })
  });

  /* ================= count-up stats ================= */

  document.querySelectorAll('.hero-stats strong').forEach(el => {
    const m = el.textContent.match(/^([^\d]*)([\d,]+)(.*)$/);
    if (!m) return;
    const end = parseInt(m[2].replace(/,/g, ''), 10);
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 94%', once: true,
      onEnter: () => gsap.to(obj, {
        v: end, duration: 1.8, ease: 'power2.out',
        onUpdate: () => { el.textContent = m[1] + Math.round(obj.v).toLocaleString('en-US') + m[3]; }
      })
    });
  });

  /* ================= departures board ================= */

  const rows = gsap.utils.toArray('.board-row');
  if (rows.length) {
    gsap.fromTo(rows, { autoAlpha: 0, x: -34 }, {
      autoAlpha: 1, x: 0, duration: .7, ease: 'power3.out', stagger: .09,
      scrollTrigger: { trigger: '.board', start: 'top 82%', once: true }
    });
    const dests = gsap.utils.toArray('.board-row .dest');
    dests.forEach((el, i) => ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => setTimeout(() => splitFlap(el), i * 110)
    }));
    // periodic random re-flap, airport style
    setInterval(() => {
      if (document.hidden) return;
      const vis = dests.filter(d => {
        const r = d.getBoundingClientRect();
        return r.top < innerHeight && r.bottom > 0;
      });
      if (vis.length) splitFlap(vis[(Math.random() * vis.length) | 0], { step: 40, settleBase: 130, settlePer: 52 });
    }, 8000);
  }

  /* ================= process steps ================= */

  const steps = document.querySelector('.steps');
  if (steps) {
    // cards pop in once…
    gsap.timeline({ scrollTrigger: { trigger: steps, start: 'top 78%', once: true } })
      .fromTo(steps.querySelectorAll('.step'), { autoAlpha: 0, y: 36 },
        { autoAlpha: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .16 }, 0)
      .fromTo(steps.querySelectorAll('.step-dot'), { scale: 0 },
        { scale: 1, duration: .7, ease: 'back.out(2.2)', stagger: .16 }, .1);
    // …but the route line draws WITH the scroll: the journey advances as you do
    gsap.matchMedia().add('(min-width: 981px)', () => {
      const plane = document.createElement('span');
      plane.className = 'steps-plane';
      plane.setAttribute('aria-hidden', 'true');
      plane.textContent = '✈';
      steps.appendChild(plane);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: steps, start: 'top 85%', end: 'top 20%', scrub: .8 },
        defaults: { ease: 'none' }
      });
      tl.to(steps, { '--steps-clip': '0%' }, 0)
        .fromTo(plane, { left: '8%', autoAlpha: 1 }, { left: '90%' }, 0)
        .to(plane, { autoAlpha: 0, duration: .08 }, .92);
      return () => plane.remove();
    });
  }

  /* ================= service card tilt ================= */

  if (fine) document.querySelectorAll('.svc').forEach(c => addTilt(c, { rx: 5, ry: 7 }));

  /* ================= FAQ smooth open/close ================= */

  document.querySelectorAll('details').forEach(d => {
    const summary = d.querySelector('summary');
    if (!summary) return;
    const body = document.createElement('div');
    body.className = 'det-body';
    [...d.children].forEach(c => { if (c !== summary) body.appendChild(c); });
    d.appendChild(body);
    let busy = false;
    summary.addEventListener('click', e => {
      e.preventDefault();
      if (busy) return;
      busy = true;
      if (d.open) {
        gsap.to(body, {
          height: 0, autoAlpha: 0, duration: .35, ease: 'power2.inOut',
          onComplete: () => { d.open = false; gsap.set(body, { clearProps: 'all' }); busy = false; ScrollTrigger.refresh(); }
        });
      } else {
        d.open = true;
        gsap.fromTo(body, { height: 0, autoAlpha: 0 }, {
          height: body.scrollHeight, autoAlpha: 1, duration: .45, ease: 'power3.out',
          onComplete: () => { gsap.set(body, { height: 'auto' }); busy = false; ScrollTrigger.refresh(); }
        });
      }
    });
  });

  /* ================= contact form: paper plane + toast ================= */

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.textContent = msg;
    document.body.appendChild(t);
    gsap.fromTo(t, { y: 80, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .5, ease: 'power3.out' });
    gsap.to(t, { y: 60, autoAlpha: 0, delay: 4.2, duration: .5, ease: 'power2.in', onComplete: () => t.remove() });
  }

  const form = document.querySelector('.contact-card form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const r = btn.getBoundingClientRect();
    const plane = document.createElement('span');
    plane.className = 'fly-plane';
    plane.textContent = '✈';
    document.body.appendChild(plane);
    gsap.set(plane, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    gsap.to(plane, {
      x: '+=280', y: '-=220', rotation: -16, scale: .4, autoAlpha: 0,
      duration: 1.05, ease: 'power2.in', onComplete: () => plane.remove()
    });
    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sent ✓';
    gsap.fromTo(btn, { scale: .92 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.45)' });
    toast("Asante! We'll contact you within one business day.");
    setTimeout(() => { form.reset(); btn.disabled = false; btn.textContent = orig; }, 2800);
  });

  /* ================= hero ambience parallax ================= */

  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    gsap.to(heroBg, {
      yPercent: 16, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    if (fine) {
      const hx = gsap.quickTo(heroBg, 'x', { duration: 1.2, ease: 'power3' });
      document.querySelector('.hero').addEventListener('mousemove', e => {
        hx((e.clientX / innerWidth - .5) * -26);
      }, { passive: true });
    }
  }

  /* ================= hero / page intro ================= */

  function pageIntro(delay) {
    const tl = gsap.timeline({ delay, defaults: { ease: 'power3.out' } });
    tl.fromTo('header .logo, header nav ul li, header .nav-cta > *',
      { y: -22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, stagger: .07 }, 0);

    const h1 = document.querySelector('.hero h1, .page-hero h1');
    if (!h1) return tl;
    const scope = h1.closest('.hero, .page-hero');
    const pre = scope.querySelectorAll('.eyebrow, .breadcrumb');
    if (pre.length) tl.fromTo(pre, { autoAlpha: 0, x: -26 }, { autoAlpha: 1, x: 0, duration: .6 }, .15);

    const { chars, words, stamp } = splitText(h1);
    tl.fromTo(chars, { yPercent: 120 }, {
      yPercent: 0, duration: .85, ease: 'power4.out', stagger: .016,
      onComplete: () => words.forEach(w => w.classList.add('st-open'))
    }, .25);
    if (stamp) {
      tl.fromTo(stamp, { scale: 3.4, autoAlpha: 0, rotation: -30 },
        { scale: 1, autoAlpha: 1, rotation: -4, duration: .42, ease: 'power4.in' }, '-=.25')
        .to(h1, { keyframes: [{ x: -4 }, { x: 4 }, { x: -2 }, { x: 0 }], duration: .3, ease: 'power2.out' });
    }
    const lead = scope.querySelector('p.lead');
    if (lead) tl.fromTo(lead, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .7 }, '-=.15');
    const actions = scope.querySelectorAll('.hero-actions .btn');
    if (actions.length) tl.fromTo(actions, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .6, stagger: .1 }, '-=.4');
    const stats = scope.querySelectorAll('.hero-stats > div');
    if (stats.length) tl.fromTo(stats, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .6, stagger: .1 }, '-=.3');

    const pass = document.querySelector('.pass');
    if (pass) {
      const rot = innerWidth <= 980 ? 0 : 2;
      tl.fromTo(pass, { autoAlpha: 0, y: 70, rotation: rot + 7 },
        { autoAlpha: 1, y: 0, rotation: rot, duration: 1.1, ease: 'power3.out' }, '-=.9')
        .add(() => {
          gsap.to(pass, { y: -10, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
          if (fine) {
            const glare = document.createElement('div');
            glare.className = 'pass-glare';
            glare.setAttribute('aria-hidden', 'true');
            pass.appendChild(glare);
            addTilt(pass, { rx: 9, ry: 12, glare });
          }
        });
    }
    return tl;
  }

  /* ================= boarding overlay sequencing ================= */

  const playIntro = !!boarding && docEl.classList.contains('intro-pending');
  if (boarding && !playIntro) boarding.remove();

  if (playIntro) {
    try { sessionStorage.setItem('swift-intro', '1'); } catch (err) { /* private mode */ }
    splitFlap(boarding.querySelector('.boarding-logo'), { step: 34, settleBase: 150, settlePer: 40 });
    gsap.set(boarding, { clipPath: 'inset(0% 0% 0% 0%)' });
    gsap.timeline()
      .fromTo('.boarding-route', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .4 }, .15)
      .fromTo('.boarding-status', { autoAlpha: 0 }, { autoAlpha: 1, duration: .35 }, .5)
      .fromTo('.boarding-line i', { left: '0%' }, { left: '100%', duration: 1, ease: 'power2.inOut' }, .4)
      .to(boarding, { clipPath: 'inset(0% 0% 100% 0%)', duration: .8, ease: 'expo.inOut' }, '+=.2')
      .set(boarding, { display: 'none' });
    pageIntro(2.0);
  } else {
    pageIntro(.1);
  }

  /* ================= ticker velocity skew ================= */

  // The .ticker-row owns a CSS marquee transform, so skew its parent band.
  const tickerBand = document.querySelector('.ticker-band');
  if (tickerBand) {
    const clampSkew = gsap.utils.clamp(-7, 7);
    const proxy = { skew: 0 };
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate(self) {
        const skew = clampSkew(self.getVelocity() / -400);
        if (Math.abs(skew) > Math.abs(proxy.skew)) {
          proxy.skew = skew;
          gsap.to(proxy, {
            skew: 0, duration: .9, ease: 'power3', overwrite: true,
            onUpdate: () => { tickerBand.style.transform = `skewX(${proxy.skew}deg)`; }
          });
        }
      }
    });
  }

  /* ================= airport-code settle on eyebrows ================= */

  // ScrambleText is optional CDN cargo; plain-text eyebrows only (no links inside).
  if (typeof ScrambleTextPlugin !== 'undefined') {
    document.querySelectorAll('.eyebrow').forEach(el => {
      if (el.children.length) return;
      const txt = el.textContent;
      ScrollTrigger.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter: () => gsap.to(el, {
          duration: .9, scrambleText: { text: txt, chars: 'upperCase', speed: .4 }
        })
      });
    });
  }

  /* ================= shared API for page modules ================= */

  // story.js (index) and page-fx.js (inner pages) bail unless this exists,
  // which makes the whole fail-safety contract transitive.
  window.Swift = {
    gsap, ScrollTrigger, smoother, fine, reduced,
    splitFlap, splitText, addTilt, toast,
    scrollToY: (y, smooth = true) => smoother
      ? smoother.scrollTo(y, smooth)
      : window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' })
  };

  /* ================= keep measurements honest ================= */

  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
