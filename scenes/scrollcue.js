'use strict';
// ================= MORE BELOW: a cue on any box that scrolls (v9.29) =================
// Will: "in some chats it's not obvious there is a scroll". On a phone the choices (and long words) scroll in
// their own box. When there is more below, the bottom of the box fades and says so; at the end the cue goes.
// Looks only: no canvas (the headless tests), nothing happens.
const CUE_BOXES = ['opts', 'text', 'cards'];
function scrollCue() {
  for (const id of CUE_BOXES) {
    const el = typeof document !== 'undefined' && document.getElementById(id);
    if (!el || !el.classList) continue;
    if (!el.cueOn) {
      el.cueOn = 1;
      el.addEventListener('scroll', () => scrollCueOne(el), { passive: true });
    }
    scrollCueOne(el);
  }
}
function scrollCueOne(el) {
  el.classList.toggle('more', el.scrollHeight - el.scrollTop - el.clientHeight > 6);
}
if (typeof window !== 'undefined' && typeof canDraw === 'function' && canDraw()) {
  const _showCue = show;
  show = v => {
    const r = _showCue(v);
    try {
      scrollCue();
      requestAnimationFrame(scrollCue); // again once it's laid out (pictures, the map)
      setTimeout(scrollCue, 250);
    } catch (e) {}
    return r;
  };
  window.addEventListener('resize', () => scrollCue());
}
