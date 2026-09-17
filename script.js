// Shared blood spill — mousemove → --x/--y for #back and #join-form button
document.addEventListener('DOMContentLoaded', () => {
  function addBlood(el) {
    if (!el) return;
    let raf;
    el.addEventListener('mousemove', e => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--x', ((e.clientX - r.left) / r.width * 100) + '%');
        el.style.setProperty('--y', ((e.clientY - r.top) / r.height * 100) + '%');
        raf = null;
      });
    }, {passive: true});
  }
  addBlood(document.getElementById('back'));
  addBlood(document.querySelector('#join-form button'));
});
