/* Swift Consultancy — index scrollytelling: the journey film.
   Loads only on index.html, after motion.js. Fail-safety: motion.js exports
   window.Swift only when the motion layer initialized, so this file bails
   (leaving the static .steps fallback) whenever GSAP/motion is unavailable. */
(() => {
  'use strict';
  if (!window.Swift) return;
  const { gsap, ScrollTrigger } = window.Swift;

  /* ================= journey film (one protagonist, four stages) ================= */

  const film = document.querySelector('[data-film]');
  if (film) {
    const stage = film.querySelector('svg');
    const q = sel => stage.querySelectorAll(sel);
    const scenes = gsap.utils.toArray(stage.querySelectorAll('.fs'));
    const wipe = stage.querySelector('.fs-wipe');
    const chBtns = gsap.utils.toArray(film.querySelectorAll('.film-ch'));
    const fills = chBtns.map(b => b.querySelector('i'));
    const replayBtn = film.querySelector('.film-replay');

    gsap.set(scenes, { autoAlpha: 0 });
    gsap.set(wipe, { x: -1500 });

    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: 'power3.out' },
      onComplete: () => replayBtn.classList.add('pulse')
    });

    // green diagonal wipe between scenes; the chapter label lands on the reveal
    const swap = (from, to, label) => {
      tl.fromTo(wipe, { x: -1500 }, { x: 0, duration: .42, ease: 'power2.in' }, '+=.55')
        .set(scenes[from], { autoAlpha: 0 })
        .set(scenes[to], { autoAlpha: 1 })
        .to(wipe, { x: 1500, duration: .5, ease: 'power2.out' })
        .addLabel(label, '-=.5');
    };

    /* ch1 — register & verify */
    tl.addLabel('ch1')
      .set(scenes[0], { autoAlpha: 1 }, 'ch1')
      .fromTo(q('.s1-desk'), { y: 46, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .7 }, 'ch1')
      .fromTo(q('.s1-hero'), { x: 40, autoAlpha: 0 }, { x: 250, autoAlpha: 1, duration: 1, ease: 'power2.inOut' }, 'ch1+=.1')
      .fromTo(q('.s1-card'), { scale: 0, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: .55, ease: 'back.out(1.7)', stagger: .22, transformOrigin: '50% 100%' }, 'ch1+=.9')
      .fromTo(q('.s1-check'), { scale: 0, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: .45, ease: 'back.out(2.4)', stagger: .2, transformOrigin: '50% 50%' }, 'ch1+=1.9')
      .fromTo(q('.s1-band'), { scale: 2.6, autoAlpha: 0, rotation: -12 },
        { scale: 1, autoAlpha: 1, rotation: -3, duration: .4, ease: 'power4.in' }, 'ch1+=2.9');

    /* ch2 — match & interview */
    swap(0, 1, 'ch2');
    tl.fromTo(q('.s2-win'), { scale: .82, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .6, transformOrigin: '50% 50%' }, 'ch2')
      .fromTo(q('.s2-you, .s2-emp'), { y: 66, autoAlpha: 0 }, { y: 40, autoAlpha: 1, duration: .5, stagger: .16 }, 'ch2+=.4')
      .fromTo(q('.s2-b1'), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .35, ease: 'back.out(2)', transformOrigin: '50% 100%' }, 'ch2+=1.05')
      .to(q('.s2-b1'), { autoAlpha: 0, duration: .22 }, 'ch2+=1.85')
      .fromTo(q('.s2-b2'), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .35, ease: 'back.out(2)', transformOrigin: '50% 100%' }, 'ch2+=1.95')
      .to(q('.s2-b2'), { autoAlpha: 0, duration: .22 }, 'ch2+=2.75')
      .fromTo(q('.s2-b1'), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .35, ease: 'back.out(2)', transformOrigin: '50% 100%' }, 'ch2+=2.85')
      .to(q('.s2-b1'), { autoAlpha: 0, duration: .22 }, 'ch2+=3.55')
      .fromTo(q('.s2-match'), { scale: 3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .42, ease: 'power4.in' }, 'ch2+=3.8')
      .fromTo(q('.s2-tag'), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .5 }, 'ch2+=4.25');

    /* ch3 — visa & contract */
    swap(1, 2, 'ch3');
    /* absolute y values here: yPercent on SVG groups bakes into the matrix and
       compounds on every invalidating refresh — the bases are translate(x,310) */
    tl.fromTo(q('.s3-book'), { y: 350, autoAlpha: 0 }, { y: 310, autoAlpha: 1, duration: .65 }, 'ch3')
      .fromTo(q('.s3-doc'), { y: 350, autoAlpha: 0 }, { y: 310, autoAlpha: 1, duration: .65 }, 'ch3+=.15')
      .fromTo(q('.s3-stamp'), { scale: 3.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .38, ease: 'power4.in' }, 'ch3+=1.05')
      .fromTo(q('.s3-ring'), { scale: .4, autoAlpha: .9 }, { scale: 1.7, autoAlpha: 0, duration: .7, ease: 'power2.out', transformOrigin: '50% 50%' }, 'ch3+=1.4')
      .to(q('.s3-book-in'), { keyframes: { x: [0, -5, 5, -2, 0] }, duration: .35, ease: 'none' }, 'ch3+=1.4')
      .fromTo(q('.s3-check'), { scale: 0, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: .4, ease: 'back.out(2.4)', stagger: .3, transformOrigin: '50% 50%' }, 'ch3+=2.0')
      .fromTo(q('.s3-cap'), { autoAlpha: 0 }, { autoAlpha: 1, duration: .5 }, 'ch3+=3.0');

    /* ch4 — fly out */
    swap(2, 3, 'ch4');
    tl.fromTo(q('.s4-sign'), { y: 36, autoAlpha: 0 }, { y: 118, autoAlpha: 1, duration: .65, ease: 'bounce.out' }, 'ch4')
      .fromTo(q('.s4-door'), { autoAlpha: 0 }, { autoAlpha: 1, duration: .5 }, 'ch4+=.15')
      .fromTo(q('.s4-hero'), { autoAlpha: 0 }, { autoAlpha: 1, duration: .3 }, 'ch4+=.5')
      .fromTo(q('.s4-hero'), { x: 160 }, { x: 846, duration: 2.1, ease: 'power1.inOut' }, 'ch4+=.5')
      .to(q('.s4-hero-in'), { keyframes: { y: [0, -6, 0, -6, 0, -6, 0] }, duration: 2.1, ease: 'none' }, 'ch4+=.5')
      .to(q('.s4-hero'), { autoAlpha: 0, duration: .35 }, 'ch4+=2.55')
      .to(q('.s4-sign, .s4-door'), { autoAlpha: .22, duration: .5 }, 'ch4+=2.95')
      .fromTo(q('.s4-trail'), { autoAlpha: 0 }, { autoAlpha: .8, duration: .6 }, 'ch4+=3.05')
      .fromTo(q('.s4-plane'), { autoAlpha: 0 }, { autoAlpha: 1, duration: .25 }, 'ch4+=3.0')
      .fromTo(q('.s4-plane'), { x: 140, y: 470, rotation: 0 }, { x: 430, duration: .9, ease: 'power1.in' }, 'ch4+=3.05');
    // takeoff arc: ride the dashed .s4-trail itself when MotionPath made it onto
    // the plane (optional CDN cargo, registered by motion.js when present)
    if (typeof MotionPathPlugin !== 'undefined') {
      tl.to(q('.s4-plane'), {
        motionPath: {
          path: '.s4-trail', align: '.s4-trail', alignOrigin: [.5, .5],
          autoRotate: true, start: 0.22, end: 1
        },
        duration: 1.5, ease: 'power2.out'
      }, 'ch4+=3.95');
    } else {
      tl.to(q('.s4-plane'), { x: 1000, y: 180, rotation: -17, duration: 1.5, ease: 'power2.out' }, 'ch4+=3.95');
    }
    tl.fromTo(q('.s4-dest'), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .5, ease: 'back.out(2)', transformOrigin: '50% 50%' }, 'ch4+=5.1');

    /* end card */
    tl.addLabel('end', '+=.7')
      .fromTo(scenes[4], { autoAlpha: 0 }, { autoAlpha: 1, duration: .7 }, 'end')
      .fromTo(q('.fe-logo'), { scale: .5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .7, ease: 'back.out(1.6)', transformOrigin: '50% 50%' }, 'end+=.25')
      .fromTo(q('.fe-h, .fe-sub'), { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .7, stagger: .15 }, 'end+=.5');

    /* chapter progress bars live inside the master timeline so seeking stays honest */
    const chLabels = ['ch1', 'ch2', 'ch3', 'ch4'];
    chLabels.forEach((lb, i) => {
      const a = tl.labels[lb];
      const b = i < 3 ? tl.labels[chLabels[i + 1]] : tl.labels.end;
      tl.fromTo(fills[i], { scaleX: 0 }, { scaleX: 1, duration: b - a, ease: 'none', transformOrigin: '0 50%' }, a);
    });

    tl.eventCallback('onUpdate', () => {
      const t = tl.time();
      let idx = 0;
      // small epsilon: at rest exactly on a label, float time can sit a hair
      // under the label value and highlight the previous chapter
      chLabels.forEach((lb, i) => { if (t >= tl.labels[lb] - .01) idx = i; });
      chBtns.forEach((b, i) => b.classList.toggle('on', i === idx));
    });

    // dwell so the end card holds for a beat under scrub. Appended exactly once,
    // OUTSIDE the matchMedia contexts below — inside it would stack on re-entry.
    tl.to({}, { duration: 1.2 });

    /* rest points: the raw chN labels sit at the green-wipe-covered instant, so
       snapping/seeking/reloading onto them parks the viewer on a blank green
       stage. These sit where each scene is fully composed instead. */
    tl.addLabel('ch1v', tl.labels.ch1 + 3.3)
      .addLabel('ch2v', tl.labels.ch2 + 4.5)
      .addLabel('ch3v', tl.labels.ch3 + 3.4)
      .addLabel('ch4v', tl.labels.ch4 + 5.4)
      .addLabel('endv', tl.labels.end + 1.4);
    const restProgress = ['ch1v', 'ch2v', 'ch3v', 'ch4v', 'endv']
      .map(lb => tl.labels[lb] / tl.duration());

    /* controls bind once; each matchMedia context swaps `seek` so the same
       buttons drive the scroll position (pinned mode) or the playhead (autoplay) */
    let seek = () => {};
    chBtns.forEach((b, i) => b.addEventListener('click', () => seek(chLabels[i])));
    replayBtn.addEventListener('click', () => seek('ch1'));

    const mm = gsap.matchMedia();

    /* desktop + tall viewport: pin the player, scroll drives the story */
    mm.add('(min-width: 1024px) and (min-height: 640px)', () => {
      // hero takeoff: text column + boarding pass lift away as you scroll out.
      // Animates .pass-wrap only — motion.js owns .pass transforms (float/tilt).
      const hero = document.querySelector('.hero');
      const passWrap = document.querySelector('.pass-wrap');
      if (hero && passWrap) {
        gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 35%', scrub: .6 }
        })
          .to('.hero-grid > div:first-child', { y: -70, autoAlpha: .25 }, 0)
          .to(passWrap, { y: -130, rotation: 5, autoAlpha: 0 }, 0);
      }

      const st = ScrollTrigger.create({
        trigger: film, start: 'top 90px',
        end: () => '+=' + Math.round(tl.duration() * 240),
        pin: true, scrub: 0.7, anticipatePin: 1,
        animation: tl, invalidateOnRefresh: true,
        // directional so slow notch-at-a-time wheels are never pulled backwards
        snap: { snapTo: [0, ...restProgress, 1], duration: { min: .2, max: .7 }, delay: .15, ease: 'power1.inOut', directional: true }
      });
      seek = label => { replayBtn.classList.remove('pulse'); window.Swift.scrollToY(st.labelToScroll(label + 'v')); };
      replayBtn.textContent = '↺ REWATCH';
      replayBtn.classList.remove('pulse');
      // motion.js created triggers for content below the film before this pin
      // existed — re-sort and refresh so their starts account for the pin spacer
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      // a scrubbed timeline only renders on a scroll DELTA — after a reload
      // mid-pin (restored scroll) or at fresh load the stage would sit
      // unrendered until the first wheel tick. Paint the restored frame now.
      tl.totalProgress(st.progress);
      // same for the pin transform itself: when scroll is restored INSIDE the
      // pin range the film stays at its document position until a NATIVE
      // scroll delta arrives (smoother.scrollTo writes the position directly
      // and never feeds the pin-paint pipeline — only real scroll events do).
      // One imperceptible backward pixel forces the paint; retries cover the
      // browser's unpredictable scroll-restoration timing.
      const ensurePinPaint = () => {
        if (!st.isActive || st.progress <= 0.001) return;
        if (Math.abs(gsap.getProperty(film, 'y')) > 1) return; // already painted
        tl.totalProgress(st.progress);
        window.scrollBy(0, -1);
      };
      [120, 600, 1500].forEach(ms => setTimeout(ensurePinPaint, ms));
      return () => { replayBtn.textContent = '↺ REPLAY'; tl.pause(0); };
    });

    /* phones / short viewports: the original autoplay-in-view behavior */
    mm.add('(max-width: 1023px), (max-height: 639px)', () => {
      let started = false;
      const jump = at => { started = true; replayBtn.classList.remove('pulse'); tl.play(at); };
      seek = jump;

      // autoplay in view, pause out of view; a finished film holds its end card
      ScrollTrigger.create({
        trigger: film, start: 'top 72%', end: 'bottom 12%',
        onToggle(self) {
          if (self.isActive) {
            if (!started) jump(0);
            else if (tl.progress() < 1) tl.play();
          } else tl.pause();
        }
      });
      return () => { tl.pause(0); started = false; };
    });
  }

  /* ================= hero route-lines draw-in (DrawSVG is optional cargo) ================= */

  const routes = document.querySelector('.hero .routes');
  if (routes && typeof DrawSVGPlugin !== 'undefined') {
    // story.css pauses the CSS dash-drift while .routes--drawn is present so the
    // keyframe animation and DrawSVG don't fight over stroke-dashoffset
    routes.classList.add('routes--drawn');
    gsap.fromTo('.routes path', { drawSVG: '0% 0%' }, {
      drawSVG: '0% 100%', duration: 1.6, stagger: .25, ease: 'power2.inOut',
      delay: document.querySelector('.boarding') ? 2.3 : 0.5, // land after the page intro
      onComplete() {
        gsap.set('.routes path', { clearProps: 'strokeDasharray,strokeDashoffset' });
        document.querySelector('.routes').classList.remove('routes--drawn');
      }
    });
  }
})();
