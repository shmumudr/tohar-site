/* Google Analytics 4 with Consent Mode v2 and a cookie banner.
 *
 * - Nothing is stored before the visitor chooses: consent defaults to
 *   "denied", so Google receives only cookieless pings.
 * - "Accept" grants analytics and ad-measurement storage (so ad clicks can be
 *   counted as conversions). Ad personalization (remarketing) stays denied
 *   always: the site's subject is sensitive and is never used for targeting.
 * - Google signals and ad personalization signals are off in the config.
 * - The choice is kept in localStorage ("tohar_consent"); any element with
 *   [data-consent-reset] reopens the banner.
 * - Events: whatsapp_click (every wa.me link), calculator_use (first change in
 *   the calculator form on a page view).
 */
(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-1C6FX1JYJP';
  var KEY = 'tohar_consent';
  if (!/^G-[A-Z0-9]{6,}$/.test(MEASUREMENT_ID) || MEASUREMENT_ID === 'G-XXXXXXXXXX') return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  function readChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function saveChoice(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: ask again next visit */ }
  }
  function grantedState(on) {
    var v = on ? 'granted' : 'denied';
    return { analytics_storage: v, ad_storage: v, ad_user_data: v, ad_personalization: 'denied' };
  }

  var choice = readChoice();
  gtag('consent', 'default', Object.assign(grantedState(false), { wait_for_update: 500 }));
  if (choice === 'granted') gtag('consent', 'update', grantedState(true));
  gtag('set', 'url_passthrough', true);
  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
  document.head.appendChild(s);

  var he = (document.documentElement.lang || 'he').indexOf('he') === 0;
  var T = he ? {
    text: 'האתר משתמש בעוגיות של Google Analytics כדי לדעת כמה נכנסים ואילו עמודים נקראים. לא נאסף מידע אישי.',
    more: 'פרטים במדיניות הפרטיות',
    href: '/privacy.html#cookies',
    yes: 'אישור',
    no: 'לא, תודה'
  } : {
    text: 'This site uses Google Analytics cookies to count visits and see which pages are read. No personal details are collected.',
    more: 'Privacy policy',
    href: '/en/privacy.html#cookies',
    yes: 'Accept',
    no: 'No thanks'
  };

  function closeBanner() {
    var b = document.getElementById('consent-banner');
    if (b) b.remove();
  }

  function choose(v) {
    saveChoice(v);
    gtag('consent', 'update', grantedState(v === 'granted'));
    closeBanner();
  }

  function showBanner() {
    if (document.getElementById('consent-banner')) return;
    var b = document.createElement('div');
    b.id = 'consent-banner';
    b.className = 'consent';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', he ? 'הסכמה לעוגיות' : 'Cookie consent');
    var p = document.createElement('p');
    p.textContent = T.text + ' ';
    var a = document.createElement('a');
    a.href = T.href;
    a.textContent = T.more;
    p.appendChild(a);
    var row = document.createElement('div');
    row.className = 'consent-actions';
    var yes = document.createElement('button');
    yes.type = 'button';
    yes.className = 'btn btn-primary';
    yes.textContent = T.yes;
    yes.addEventListener('click', function () { choose('granted'); });
    var no = document.createElement('button');
    no.type = 'button';
    no.className = 'btn btn-ghost';
    no.textContent = T.no;
    no.addEventListener('click', function () { choose('denied'); });
    row.appendChild(yes);
    row.appendChild(no);
    b.appendChild(p);
    b.appendChild(row);
    document.body.appendChild(b);
  }

  function linkLocation(el) {
    var sec = el.closest('header, footer, section, main');
    if (!sec) return 'page';
    return sec.id || String(sec.className || '').split(' ')[0] || sec.tagName.toLowerCase();
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!(t instanceof Element)) return;
    var reset = t.closest('[data-consent-reset]');
    if (reset) { e.preventDefault(); showBanner(); return; }
    var a = t.closest('a[href*="wa.me/"]');
    if (a) {
      gtag('event', 'whatsapp_click', {
        link_location: linkLocation(a),
        page_language: he ? 'he' : 'en',
        transport_type: 'beacon'
      });
    }
  });

  var calcSent = false;
  document.addEventListener('change', function (e) {
    if (calcSent) return;
    var t = e.target;
    if (t instanceof Element && t.closest('#calc-form')) {
      calcSent = true;
      gtag('event', 'calculator_use', { page_language: he ? 'he' : 'en' });
    }
  });

  function init() { if (readChoice() === null) showBanner(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
