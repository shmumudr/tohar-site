/* Demo video in the "one cycle" section.
 * - Plays muted and looped while at least 40% of it is on screen, pauses
 *   when scrolled away. Nothing is downloaded until it first comes into view.
 * - Visitors who asked their device for reduced motion get the poster and a
 *   play button instead of autoplay.
 * - The sound button unmutes (and starts playback if needed); browsers only
 *   allow sound after a tap, so autoplay is always muted.
 */
(function () {
  'use strict';
  var fig = document.querySelector('.demo');
  if (!fig) return;
  var video = fig.querySelector('video');
  var soundBtn = fig.querySelector('.demo-sound');
  var playBtn = fig.querySelector('.demo-play');
  var he = (document.documentElement.lang || 'he').indexOf('he') === 0;
  var L = he
    ? { on: 'השתקה', off: 'הפעלת קול', play: 'הפעלת הסרטון' }
    : { on: 'Mute', off: 'Turn sound on', play: 'Play the video' };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var userPaused = false;

  function track(name) { if (typeof window.gtag === 'function') window.gtag('event', name, { page_language: he ? 'he' : 'en' }); }
  function load() { if (video.preload !== 'auto') { video.preload = 'auto'; video.load(); } }
  function play() { load(); var p = video.play(); if (p && p.catch) p.catch(function () {}); }
  function syncButtons() {
    soundBtn.setAttribute('aria-pressed', String(!video.muted));
    soundBtn.querySelector('.demo-sound-text').textContent = video.muted ? L.off : L.on;
    soundBtn.classList.toggle('is-on', !video.muted);
    playBtn.hidden = !video.paused;
    playBtn.setAttribute('aria-label', L.play);
  }

  video.muted = true;
  syncButtons();

  soundBtn.addEventListener('click', function () {
    video.muted = !video.muted;
    if (!video.muted) { userPaused = false; play(); track('demo_sound_on'); }
    syncButtons();
  });
  playBtn.addEventListener('click', function () { userPaused = false; play(); track('demo_play'); });
  video.addEventListener('click', function () {
    if (video.paused) { userPaused = false; play(); } else { userPaused = true; video.pause(); }
  });
  video.addEventListener('play', syncButtons);
  video.addEventListener('pause', syncButtons);

  if (reduce || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && e.intersectionRatio >= 0.4) { if (!userPaused) play(); }
      else if (!video.paused) video.pause();
    });
  }, { threshold: [0, 0.4] }).observe(video);
})();
