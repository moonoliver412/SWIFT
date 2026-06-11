// mobile nav toggle (scroll reveals live in motion.js)
const menuBtn = document.querySelector('.menu-btn');
const mnav = document.getElementById('mnav');
if (menuBtn && mnav) {
  menuBtn.addEventListener('click', () => {
    const open = mnav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mnav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mnav.classList.remove('open')));
}

/* ============================================================
   MICRO-INTERACTIONS — workstream D.
   Vanilla JS only: must keep working when GSAP/motion.js fail.
   ============================================================ */
(function () {
  'use strict';
  var motionOk = document.documentElement.classList.contains('motion-ok');

  /* hero scroll hint — index only, decorative, motion-ok only */
  if (motionOk && document.body && document.body.dataset.page === 'index') {
    var heroBox = document.querySelector('.hero .container');
    if (heroBox) {
      var hint = document.createElement('div');
      hint.className = 'scroll-hint';
      hint.setAttribute('aria-hidden', 'true');
      hint.innerHTML = '<span>SCROLL</span><i>✈</i>';
      heroBox.appendChild(hint);
      window.addEventListener('scroll', function () {
        hint.classList.add('gone');
      }, { once: true, passive: true });
    }
  }

  /* footer route line — flag the footer once it scrolls into view */
  var foot = document.querySelector('footer');
  if (foot && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          foot.classList.add('foot-in');
          io.disconnect();
          break;
        }
      }
    }, { threshold: 0.25 });
    io.observe(foot);
  }

  /* tab-blur title swap — restore the exact original on return */
  var awayTitle = '✈ Your job abroad is waiting — Swift Consultancy';
  var homeTitle = null;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      homeTitle = document.title;
      document.title = awayTitle;
    } else if (homeTitle !== null) {
      document.title = homeTitle;
      homeTitle = null;
    }
  });
})();
