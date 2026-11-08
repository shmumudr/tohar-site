// Seven clean days / mikvah night calculator.
// Same rule as the Tohar bot (src/period/calculate.ts):
//   effective day = sighting date, or the next day when the sighting was after sunset
//   hefsek        = effective day + (waiting days - 1)
//   seven clean   = the 7 days after the hefsek
//   mikvah night  = the night after day 7 (the Hebrew day hefsek + 8 begins at nightfall)
import { HDate, months, gematriya } from './hdate.js';

const LANG = document.documentElement.lang === 'en' ? 'en' : 'he';
const T = {
  he: {
    weekdays: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
    dayShort: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'שבת'],
    sighting: 'ראייה', hefsek: 'הפסק', clean: n => `יום ${n}`, tevila: 'ליל טבילה',
    hefsekLabel: 'יום הפסק הטהרה (המוקדם ביותר)',
    cleanLabel: 'שבעה נקיים',
    tevilaLabel: 'ליל הטבילה',
    nightOf: d => `ליל ${d}`,
    eveningOf: d => `${d} בערב, אחרי צאת הכוכבים`,
    range: (a, b) => `מ${a} עד ${b}`,
    day: d => `יום ${d}`,
    special: l => `ליל הטבילה חל ב${l}. יש לכך דינים מיוחדים, ומומלץ לשאול רב מראש.`,
    shabbat: 'ליל שבת', yomkippur: 'יום כיפור', tishabav: 'תשעה באב', yomtov: 'ליל יום טוב',
    legend: ['ראייה', 'ימי המתנה', 'הפסק טהרה', 'שבעה נקיים', 'טבילה'],
  },
  en: {
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Shabbat'],
    dayShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Shabbat'],
    sighting: 'Sighting', hefsek: 'Hefsek', clean: n => `Day ${n}`, tevila: 'Mikvah night',
    hefsekLabel: 'Hefsek tahara (earliest)',
    cleanLabel: 'Seven clean days',
    tevilaLabel: 'Mikvah night',
    nightOf: d => `The night of ${d}`,
    eveningOf: d => `${d} in the evening, after nightfall`,
    range: (a, b) => `${a} to ${b}`,
    day: d => d,
    special: l => `Mikvah night falls on ${l}. Special halachot apply; ask a rav in advance.`,
    shabbat: 'Friday night (Shabbat)', yomkippur: 'Yom Kippur', tishabav: 'Tisha B’Av', yomtov: 'the night of Yom Tov',
    legend: ['Sighting', 'Waiting days', 'Hefsek tahara', 'Seven clean days', 'Mikvah'],
  },
}[LANG];

const HE_MONTH = {
  [months.NISAN]: 'ניסן', [months.IYYAR]: 'אייר', [months.SIVAN]: 'סיוון', [months.TAMUZ]: 'תמוז',
  [months.AV]: 'אב', [months.ELUL]: 'אלול', [months.TISHREI]: 'תשרי', [months.CHESHVAN]: 'חשוון',
  [months.KISLEV]: 'כסלו', [months.TEVET]: 'טבת', [months.SHVAT]: 'שבט',
};
function monthName(m, y) {
  if (LANG === 'en') return new HDate(1, m, y).getMonthName();
  if (m === months.ADAR_I) return HDate.isLeapYear(y) ? 'אדר א׳' : 'אדר';
  if (m === months.ADAR_II) return 'אדר ב׳';
  return HE_MONTH[m];
}
function yearName(y) { return LANG === 'en' ? String(y) : gematriya(y % 1000); }
function hebDate(h) {
  const d = LANG === 'en' ? h.getDate() : gematriya(h.getDate());
  return `${d} ${monthName(h.getMonth(), h.getFullYear())} ${yearName(h.getFullYear())}`;
}
function gregDate(d) {
  return d.toLocaleDateString(LANG === 'en' ? 'en-GB' : 'he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}
function fullDay(d) { return `${T.day(T.weekdays[d.getDay()])}, ${hebDate(new HDate(d))} (${gregDate(d)})`; }
function addDays(d, n) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
function monthsOfYear(y) {
  const list = [months.TISHREI, months.CHESHVAN, months.KISLEV, months.TEVET, months.SHVAT, months.ADAR_I];
  if (HDate.isLeapYear(y)) list.push(months.ADAR_II);
  list.push(months.NISAN, months.IYYAR, months.SIVAN, months.TAMUZ, months.AV, months.ELUL);
  return list;
}

export function compute(sighting, afterSunset, waitingDays) {
  const effective = afterSunset ? addDays(sighting, 1) : sighting;
  const hefsek = addDays(effective, waitingDays - 1);
  return { sighting, effective, hefsek, cleanStart: addDays(hefsek, 1), cleanEnd: addDays(hefsek, 7), tevilaDay: addDays(hefsek, 8) };
}

// What the night of mikvah falls on, by the Hebrew day that begins that night (Israel).
function specialNight(day) {
  const h = new HDate(day); const m = h.getMonth(); const d = h.getDate();
  if (m === months.TISHREI && d === 10) return T.yomkippur;
  const av9 = new HDate(9, months.AV, h.getFullYear());
  const fast = av9.getDay() === 6 ? 10 : 9;
  if (m === months.AV && d === fast) return T.tishabav;
  const yomTov = (m === months.NISAN && (d === 15 || d === 21)) || (m === months.SIVAN && d === 6) ||
    (m === months.TISHREI && (d === 1 || d === 2 || d === 15 || d === 22));
  if (yomTov) return T.yomtov;
  if (day.getDay() === 6) return T.shabbat;
  return null;
}

// ---------- UI ----------
const $ = id => document.getElementById(id);
const form = $('calc-form'); if (!form) throw new Error('calculator form missing');
const fDay = $('h-day'), fMonth = $('h-month'), fYear = $('h-year'), fGreg = $('g-date');

function fillYears() {
  const y = new HDate().getFullYear();
  fYear.innerHTML = [y, y - 1].map(v => `<option value="${v}">${yearName(v)}</option>`).join('');
}
function fillMonths(keep) {
  const y = +fYear.value;
  fMonth.innerHTML = monthsOfYear(y).map(m => `<option value="${m}">${monthName(m, y)}</option>`).join('');
  if (keep && [...fMonth.options].some(o => +o.value === keep)) fMonth.value = String(keep);
  else if (keep === months.ADAR_II || keep === months.ADAR_I) fMonth.value = String(months.ADAR_I);
}
function fillDays(keep) {
  const n = HDate.daysInMonth(+fMonth.value, +fYear.value);
  fDay.innerHTML = Array.from({ length: n }, (_, i) => `<option value="${i + 1}">${LANG === 'en' ? i + 1 : gematriya(i + 1)}</option>`).join('');
  fDay.value = String(Math.min(keep || 1, n));
}
function setFromGreg(d) {
  const h = new HDate(d);
  fYear.value = String(h.getFullYear());
  if (fYear.value !== String(h.getFullYear())) { fYear.insertAdjacentHTML('beforeend', `<option value="${h.getFullYear()}">${yearName(h.getFullYear())}</option>`); fYear.value = String(h.getFullYear()); }
  fillMonths(h.getMonth()); fillDays(h.getDate());
}
function hebToGreg() { return new HDate(+fDay.value, +fMonth.value, +fYear.value).greg(); }
function iso(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }

function renderBoards(r) {
  const out = []; const start = new HDate(r.sighting); const end = new HDate(r.tevilaDay);
  let m = start.getMonth(), y = start.getFullYear();
  const sAbs = new HDate(r.sighting).abs(), eAbs = new HDate(r.effective).abs(), hAbs = new HDate(r.hefsek).abs(), tAbs = end.abs();
  for (let guard = 0; guard < 3; guard++) {
    const n = HDate.daysInMonth(m, y); const first = new HDate(1, m, y); const offset = first.getDay();
    const cells = Array.from({ length: offset }, () => '<div class="day" aria-hidden="true"></div>');
    for (let d = 1; d <= n; d++) {
      const h = new HDate(d, m, y); const a = h.abs(); const cls = ['day']; let tag = '';
      if (h.getDay() === 6) cls.push('shab');
      if (a === sAbs) { cls.push('seen'); tag = T.sighting; }
      else if (a >= eAbs && a < hAbs) cls.push('wait');
      if (a === hAbs) { cls.push('hefsek'); tag = T.hefsek; }
      if (a > hAbs && a <= hAbs + 7) { cls.push('clean'); tag = T.clean(a - hAbs); }
      if (a === tAbs) { cls.push('tevila'); tag = T.tevila; }
      const g = h.greg().getDate();
      cells.push(`<div class="${cls.join(' ')}"><span class="h">${LANG === 'en' ? d : gematriya(d)}</span><span class="g">${g}</span>${tag ? `<span class="t">${tag}</span>` : ''}</div>`);
    }
    out.push(`<div class="board"><div class="board-head"><b>${monthName(m, y)} ${yearName(y)}</b></div>
      <div class="board-days" aria-hidden="true">${T.dayShort.map(x => `<div>${x}</div>`).join('')}</div>
      <div class="board-grid">${cells.join('')}</div></div>`);
    if (m === end.getMonth() && y === end.getFullYear()) break;
    const next = new HDate(n, m, y).next(); m = next.getMonth(); y = next.getFullYear();
  }
  const L = T.legend;
  out.push(`<div class="board-legend"><span><i style="box-shadow:inset 0 0 0 2px var(--ink)"></i>${L[0]}</span><span><i style="background:var(--wait)"></i>${L[1]}</span><span><i style="box-shadow:inset 0 0 0 2px var(--blue)"></i>${L[2]}</span><span><i style="background:var(--blue)"></i>${L[3]}</span><span><i style="background:var(--ink)"></i>${L[4]}</span></div>`);
  return out.join('');
}

function update() {
  const sighting = hebToGreg();
  fGreg.value = iso(sighting);
  const after = form.querySelector('input[name="sunset"]:checked').value === 'after';
  const wait = +form.querySelector('input[name="wait"]:checked').value;
  const r = compute(sighting, after, wait);
  const special = specialNight(r.tevilaDay);
  $('r-hefsek').textContent = fullDay(r.hefsek);
  $('r-clean').textContent = T.range(fullDay(r.cleanStart), fullDay(r.cleanEnd));
  $('r-tevila').textContent = `${T.nightOf(hebDate(new HDate(r.tevilaDay)))}: ${T.eveningOf(fullDay(r.cleanEnd))}`;
  const note = $('r-special');
  note.hidden = !special; note.textContent = special ? T.special(special) : '';
  $('r-boards').innerHTML = renderBoards(r);
}

fillYears(); setFromGreg(new Date());
fYear.addEventListener('change', () => { const m = +fMonth.value, d = +fDay.value; fillMonths(m); fillDays(d); update(); });
fMonth.addEventListener('change', () => { fillDays(+fDay.value); update(); });
fDay.addEventListener('change', update);
fGreg.addEventListener('change', () => { if (fGreg.value) { const [Y, M, D] = fGreg.value.split('-').map(Number); setFromGreg(new Date(Y, M - 1, D)); update(); } });
form.addEventListener('change', e => { if (e.target.name === 'sunset' || e.target.name === 'wait') update(); });
form.addEventListener('submit', e => { e.preventDefault(); update(); });
update();
