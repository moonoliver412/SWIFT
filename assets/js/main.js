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
