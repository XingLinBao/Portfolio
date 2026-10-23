/* Learn2Web — SVG-ілюстрації для банерів (замість растрових картинок).
   Кожна сцена — рядок з inline <svg>. Дрібні елементи мають класи .fl1/.fl2/.fl3 (паріння) та .sway (погойдування листя);
   самі keyframes — у css/banners.css. */

let uid = 0;
const FONT = 'Manrope,system-ui,sans-serif';

/* спільні градієнти, фільтри та тіні; p — унікальний префікс, щоб id не конфліктували між сценами */
const defs = p => `<defs>
 <linearGradient id="${p}v" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9b82ff"/><stop offset="1" stop-color="#6c47ff"/></linearGradient>
 <linearGradient id="${p}vd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d5cff"/><stop offset="1" stop-color="#5b3df5"/></linearGradient>
 <linearGradient id="${p}sc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b2857"/><stop offset="1" stop-color="#16142f"/></linearGradient>
 <linearGradient id="${p}lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ebe7fb"/></linearGradient>
 <linearGradient id="${p}bs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f1ff"/><stop offset="1" stop-color="#d9d1fa"/></linearGradient>
 <radialGradient id="${p}bl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e6defe"/><stop offset="1" stop-color="#f4f0ff" stop-opacity="0"/></radialGradient>
 <linearGradient id="${p}lf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6fc08a"/><stop offset="1" stop-color="#2f8f5b"/></linearGradient>
 <linearGradient id="${p}lp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a692ff"/><stop offset="1" stop-color="#6c47ff"/></linearGradient>
 <filter id="${p}sh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#4c34c8" flood-opacity=".22"/></filter>
 <filter id="${p}ss" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#4c34c8" flood-opacity=".24"/></filter>
</defs>`;

const svg = (p, body, vb = "0 0 600 440") =>
  `<svg class="bn-svg" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false">${defs(p)}${body}</svg>`;

/* ---------- примітиви ---------- */
const blob = (p, cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${p}bl)"/>`;
const ring = (cx, cy, r, o = ".5") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#cfc4fb" stroke-opacity="${o}" stroke-width="1.5"/>`;
const dot = (cx, cy, r, c = "#b9a6ff", cls = "fl2", o = ".8") => `<circle class="${cls}" cx="${cx}" cy="${cy}" r="${r}" fill="${c}" opacity="${o}"/>`;

/* фіолетова «таблетка» з підписом; x,y — центр; cls — клас паріння */
const pill = (p, x, y, w, h, t, rot, cls, fs = 20) => `<g transform="translate(${x} ${y}) rotate(${rot})"><g class="${cls}">
 <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h * .3}" fill="url(#${p}v)" filter="url(#${p}ss)"/>
 <text x="0" y="${fs * .36}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${fs}" fill="#fff">${t}</text></g></g>`;

/* плитка з іконкою */
const ICONS = {
  play: '<circle cx="0" cy="0" r="15" fill="none" stroke="#fff" stroke-width="3"/><path d="M-4.5-7.5 8 0-4.5 7.5z" fill="#fff"/>',
  book: '<path d="M0-9v20M0-9c-4-4-11-4-16-3v19c5-1 12-1 16 3 4-4 11-4 16-3v-19c-5-1-12-1-16 3z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>',
  cap: '<path d="M0-13-19-4 0 5 19-4z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M-10 1v9c4 4 16 4 20 0V1" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M19-4v10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
  code: '<path d="M-10-13-24 0l14 13M10-13 24 0 10 13M4-18-4 18" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'
};
const tile = (p, x, y, s, icon, rot, cls) => `<g transform="translate(${x} ${y}) rotate(${rot})"><g class="${cls}">
 <rect x="${-s / 2}" y="${-s / 2}" width="${s}" height="${s}" rx="${s * .26}" fill="url(#${p}v)" filter="url(#${p}ss)"/>
 <rect x="${-s / 2 + 3}" y="${-s / 2 + 3}" width="${s - 6}" height="${s * .45}" rx="${s * .22}" fill="#fff" opacity=".13"/>
 <g transform="scale(${(s / 78).toFixed(2)})">${ICONS[icon]}</g></g></g>`;

/* рядки коду на темному екрані: [відступ, [[довжина, колір], ...]] */
const CC = ["#a78bfa", "#60a5fa", "#f472b6", "#fbbf24", "#34d399"];
const CODE = [
  [0, [[18, 0], [34, 1], [22, 2]]], [1, [[28, 1], [14, 3], [40, 4]]], [2, [[22, 2], [48, 1]]], [2, [[36, 0], [18, 4], [30, 3]]],
  [1, [[16, 3], [44, 1]]], [0, [[26, 2], [20, 0]]], [1, [[34, 4], [22, 1], [16, 2]]], [2, [[20, 1], [52, 0]]],
  [2, [[42, 3], [18, 4]]], [1, [[30, 0], [26, 2]]], [0, [[14, 1], [38, 3]]]
];
const code = (x, y, n = CODE.length, gap = 14, k = 1) => CODE.slice(0, n).map((r, i) => {
  let cx = x + r[0] * 14 * k;
  return r[1].map(([w, c]) => { const s = `<rect x="${cx}" y="${y + i * gap}" width="${w * k * 1.6}" height="4" rx="2" fill="${CC[c]}"/>`; cx += w * k * 1.6 + 6; return s; }).join("");
}).join("");

/* ноутбук: (x,y) — лівий верхній кут кришки; ширина 360, висота екрана 226 */
const laptop = (p, x, y, inner = "", n = 11) => `<g transform="translate(${x} ${y})" filter="url(#${p}sh)">
 <rect x="0" y="0" width="360" height="228" rx="16" fill="url(#${p}lid)" stroke="#e4defb"/>
 <rect x="12" y="12" width="336" height="204" rx="7" fill="url(#${p}sc)"/>
 <circle cx="180" cy="6" r="1.8" fill="#cfc8ee"/>
 <rect x="22" y="22" width="316" height="8" rx="4" fill="#fff" opacity=".07"/>
 <rect x="22" y="40" width="14" height="164" rx="3" fill="#fff" opacity=".05"/>
 ${code(52, 48, n, 15, .9)}${inner}
 <path d="M-24 232h408c0 12-10 20-24 20H0c-14 0-24-8-24-20z" fill="url(#${p}bs)" stroke="#e4defb"/>
 <rect x="150" y="232" width="60" height="7" rx="3.5" fill="#cbc2f3"/></g>`;

/* вікно-картка з «скелетом» сторінки; img — чи показувати картинку-плейсхолдер */
const win = (p, x, y, w, h, rot, cls, img = true, bar = false) => `<g transform="translate(${x} ${y}) rotate(${rot})"><g class="${cls}" filter="url(#${p}ss)">
 <rect width="${w}" height="${h}" rx="12" fill="#fff" stroke="#e8e3fb"/>
 <circle cx="14" cy="14" r="3.5" fill="#ff8aa0"/><circle cx="26" cy="14" r="3.5" fill="#ffd166"/><circle cx="38" cy="14" r="3.5" fill="#6ee7a8"/>
 ${bar ? `<rect x="${w - 52}" y="9" width="40" height="10" rx="5" fill="#8b6cff"/>` : ""}
 <rect x="14" y="30" width="${w * .6}" height="7" rx="3.5" fill="#d9d1fa"/>
 ${img ? `<rect x="14" y="48" width="${w * .42}" height="${h * .4}" rx="8" fill="#e9e3ff"/>
 <path d="M14 ${48 + h * .4}l${w * .13}-${h * .2} ${w * .1} ${h * .12} ${w * .08}-${h * .08} ${w * .11} ${h * .16}z" fill="#9b82ff"/><circle cx="${14 + w * .32}" cy="${48 + h * .1}" r="4.5" fill="#b9a6ff"/>
 <rect x="${w * .52}" y="52" width="${w * .38}" height="6" rx="3" fill="#e4defb"/><rect x="${w * .52}" y="66" width="${w * .3}" height="6" rx="3" fill="#ece8fc"/><rect x="${w * .52}" y="80" width="${w * .34}" height="6" rx="3" fill="#ece8fc"/>
 <rect x="14" y="${h - 26}" width="${w * .5}" height="7" rx="3.5" fill="#ece8fc"/>` :
    `<rect x="14" y="48" width="${w - 28}" height="6" rx="3" fill="#ece8fc"/><rect x="14" y="62" width="${w * .55}" height="6" rx="3" fill="#ece8fc"/>
 <rect x="14" y="${h - 36}" width="${w * .38}" height="14" rx="7" fill="#8b6cff" opacity=".85"/>`}
 </g></g>`;

/* рослина у горщику; green — зелене листя, інакше фіолетове; (x,y) — основа горщика */
const plant = (p, x, y, s = 1, green = true) => {
  const f = green ? `url(#${p}lf)` : `url(#${p}lp)`;
  return `<g transform="translate(${x} ${y}) scale(${s})">
 <g class="sway" style="transform-origin:0 -10px">
  <path d="M0-10C-36-30-46-70-30-92c26 8 38 46 30 82z" fill="${f}"/>
  <path d="M0-10C-4-50 6-92 24-112c16 26 4 76-24 102z" fill="${f}" opacity=".92"/>
  <path d="M0-10C28-26 56-30 70-52c-26-12-60 4-70 42z" fill="${f}" opacity=".85"/>
  <path d="M0-10C-20-24-54-18-64-38c24-14 56-6 64 28z" fill="${f}" opacity=".8"/>
  <path d="M0-10V-80" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/></g>
 <path d="M-30-4h60l-8 50c-1 5-5 8-10 8h-24c-5 0-9-3-10-8z" fill="#fff" stroke="#e4defb"/>
 <path d="M-30-4h60l-1.5 10h-57z" fill="#efeaff"/></g>`;
};

/* стос книг HTML/CSS/JavaScript; (x,y) — лівий верх верхньої книги */
const book = (p, x, y, t, w, h = 52) => `<g transform="translate(${x} ${y})">
 <rect x="${w - 8}" y="6" width="22" height="${h - 6}" rx="3" fill="#f3f0ff" stroke="#ddd5fa"/>
 <path d="M${w - 4} 18h18M${w - 4} 28h18M${w - 4} 38h18" stroke="#ddd5fa" stroke-width="1.5"/>
 <rect width="${w}" height="${h}" rx="7" fill="url(#${p}vd)"/>
 <rect x="0" y="0" width="${w}" height="${h * .35}" rx="7" fill="#fff" opacity=".1"/>
 <text x="22" y="${h * .64}" font-family="${FONT}" font-weight="600" font-size="19" fill="#fff" transform="rotate(-3 22 ${h * .64})">${t}</text></g>`;
const books = (p, x, y) => `<g transform="translate(${x} ${y})" filter="url(#${p}sh)">
 ${book(p, 4, 112, "JavaScript", 188)}${book(p, 0, 58, "CSS", 190)}${book(p, 6, 4, "HTML", 186)}</g>`;

const base = (p, x, y, w) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="14" fill="#cfc4fb" opacity=".35"/>`;

/* ================= СЦЕНИ ================= */

/* головна: ноутбук з тайлом </>, два вікна, дві фіолетові рослини */
function home() {
  const p = "h" + (++uid);
  return svg(p, `
 ${base(p, 320, 405, 200)}
 ${blob(p, 320, 230, 250)}${ring(330, 200, 175, ".35")}
 ${dot(60, 60, 5, "#c9b9ff", "fl2")}${dot(545, 110, 6, "#b9a6ff", "fl3")}${dot(490, 400, 4, "#c9b9ff", "fl1")}
 <circle class="fl2" cx="318" cy="52" r="26" fill="url(#${p}bl)"/><circle class="fl2" cx="318" cy="52" r="14" fill="#d9ccff" opacity=".7"/>
 ${laptop(p, 190, 90, `<g transform="translate(250 112)"><rect x="-58" y="-48" width="116" height="96" rx="22" fill="url(#${p}v)" filter="url(#${p}ss)"/><rect x="-54" y="-44" width="108" height="40" rx="18" fill="#fff" opacity=".12"/><g transform="translate(0 0) scale(.95)">${ICONS.code}</g></g>`, 9)}
 ${win(p, 66, 168, 210, 150, -7, "fl1", true, true)}${win(p, 96, 218, 200, 140, -5, "fl2", false, true)}
 ${plant(p, 62, 372, .95, false)}${plant(p, 548, 360, .62, false)}
 ${pill(p, 150, 74, 92, 40, "HTML", -7, "fl3", 18)}${pill(p, 488, 88, 76, 36, "CSS", 8, "fl1", 17)}`);
}

/* ---- додаткові примітиви ---- */
const STAR = "0,-15 4.4,-5 15,-4.6 6.8,2.6 9.3,13 0,7.4 -9.3,13 -6.8,2.6 -15,-4.6 -4.4,-5";
const lines = (x, y, w, n, gap = 12, c = "#e4defb", h = 5) => Array.from({length: n}, (_, i) =>
  `<rect x="${x}" y="${y + i * gap}" width="${i === n - 1 ? w * .6 : w}" height="${h}" rx="${h / 2}" fill="${c}"/>`).join("");
const star = (_p, x, y, s, cls, c = "#fbbf24") => `<g transform="translate(${x} ${y}) scale(${s})"><g class="${cls}"><polygon points="${STAR}" fill="${c}"/></g></g>`;
const person = (_p, x, y, s, skin, hair, shirt, cls, long = false) => `<g transform="translate(${x} ${y}) scale(${s})"><g class="${cls}">
 ${long ? `<path d="M-31-72c-6 34-4 56 4 70h54c8-14 10-36 4-70z" fill="${hair}"/>` : ""}
 <path d="M-40 0c0-30 16-44 40-44s40 14 40 44z" fill="${shirt}"/>
 <rect x="-8" y="-54" width="16" height="14" rx="6" fill="${skin}"/>
 <circle cx="0" cy="-70" r="25" fill="${skin}"/>
 <path d="M-27-70c-2-22 12-32 27-32s30 10 27 32c-6-12-16-16-27-16s-21 4-27 16z" fill="${hair}"/>
 <circle cx="-8" cy="-68" r="2.4" fill="#2b2857"/><circle cx="8" cy="-68" r="2.4" fill="#2b2857"/>
 <path d="M-6-58q6 5 12 0" fill="none" stroke="#2b2857" stroke-width="2" stroke-linecap="round"/></g></g>`;

/* дисципліни (веб): ноутбук, два вікна, рослина, таблетки HTML / CSS / JS */
function disc() {
  const p = "d" + (++uid);
  return svg(p, `
 ${base(p, 300, 410, 220)}
 ${blob(p, 300, 230, 250)}${ring(300, 210, 200, ".4")}${ring(318, 220, 150, ".25")}
 ${dot(60, 100, 5, "#c9b9ff", "fl2")}${dot(556, 150, 6, "#b9a6ff", "fl3")}${dot(300, 20, 4, "#c9b9ff", "fl1")}${dot(70, 390, 4, "#b9a6ff", "fl3")}
 ${plant(p, 548, 372, 1.0, true)}
 ${laptop(p, 118, 66, "", 11)}
 ${win(p, 24, 200, 190, 150, -3, "fl2", true)}${win(p, 330, 108, 240, 156, 3, "fl1", true, true)}
 ${pill(p, 108, 62, 96, 42, "HTML", -7, "fl3", 19)}${pill(p, 490, 46, 84, 38, "CSS", 6, "fl1", 18)}${pill(p, 330, 372, 62, 34, "JS", 0, "fl2", 17)}`);
}

/* дисципліна «Інтернет-технології»: глобус, орбіта з мітками, вікно браузера */
function discIt() {
  const p = "i" + (++uid);
  const mer = [-60, -30, 0, 30, 60].map(a => `<ellipse cx="0" cy="0" rx="${Math.round(110 * Math.cos(a * Math.PI / 180))}" ry="110" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>`).join("");
  return svg(p, `
 ${base(p, 300, 410, 200)}
 ${blob(p, 300, 225, 250)}${ring(300, 220, 195, ".4")}${ring(300, 220, 150, ".25")}
 ${dot(70, 120, 5, "#c9b9ff", "fl2")}${dot(540, 340, 6, "#b9a6ff", "fl3")}${dot(520, 70, 4, "#c9b9ff", "fl1")}
 <g transform="translate(300 220)" filter="url(#${p}sh)"><circle r="112" fill="url(#${p}v)"/><g class="sway" style="transform-origin:0 0">${mer}</g>
  <path d="M-110 0h220M-96-50h192M-96 50h192" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>
  <path d="M-58-70c18-8 34 6 30 22s-22 14-28 30-24 4-30-10c-6-14 4-34 28-42zM30 10c16-6 34 6 32 24-2 20-24 34-38 22-12-10-8-40 6-46z" fill="#fff" opacity=".25"/></g>
 ${win(p, 36, 250, 190, 130, -4, "fl2", false, true)}
 ${tile(p, 520, 200, 62, "code", 6, "fl1")}
 ${pill(p, 112, 86, 100, 42, "HTTP", -7, "fl3", 19)}${pill(p, 476, 98, 84, 38, "WWW", 6, "fl2", 18)}${pill(p, 428, 372, 70, 36, "IP", -4, "fl1", 18)}
 <g class="fl3"><circle cx="300" cy="62" r="9" fill="#fff" stroke="#8b6cff" stroke-width="3"/></g>`);
}

/* корисні матеріали: ноутбук, плитки «відео / книга / шапка», картки відео та PDF */
function res() {
  const p = "r" + (++uid);
  return svg(p, `
 ${base(p, 250, 392, 200)}
 <circle cx="290" cy="170" r="150" fill="url(#${p}bl)"/>${blob(p, 130, 250, 110)}${blob(p, 470, 230, 120)}
 ${dot(40, 380, 3.5, "#b9a6ff", "fl1")}${dot(56, 396, 3, "#b9a6ff", "fl2")}${dot(74, 386, 3, "#b9a6ff", "fl3")}${dot(560, 150, 4, "#c9b9ff", "fl2")}
 ${laptop(p, 70, 78, "", 11)}
 <g transform="translate(410 214) rotate(4)"><g class="fl2" filter="url(#${p}sh)"><rect width="162" height="104" rx="12" fill="url(#${p}sc)"/><rect x="10" y="10" width="142" height="60" rx="7" fill="#3a3670"/>
  <circle cx="81" cy="40" r="19" fill="#fff" opacity=".92"/><path d="M75 31l16 9-16 9z" fill="#6c47ff"/><rect x="10" y="82" width="142" height="5" rx="2.5" fill="#fff" opacity=".18"/><rect x="10" y="82" width="70" height="5" rx="2.5" fill="#a78bfa"/></g></g>
 <g transform="translate(432 330) rotate(-4)"><g class="fl1" filter="url(#${p}sh)"><rect width="120" height="84" rx="12" fill="#fff" stroke="#e8e3fb"/><rect x="12" y="14" width="34" height="42" rx="5" fill="#ff7a8a"/><text x="29" y="40" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="12" fill="#fff">PDF</text>
  ${lines(56, 18, 52, 3, 12)}<rect x="12" y="64" width="96" height="8" rx="4" fill="#ece8fc"/></g></g>
 ${plant(p, 44, 378, .85, true)}
 ${tile(p, 96, 62, 64, "play", -6, "fl1")}${tile(p, 532, 70, 62, "book", 5, "fl2")}${tile(p, 40, 214, 58, "cap", 6, "fl3")}`);
}

/* підвищення кваліфікації: сертифікат із печаткою */
function cert() {
  const p = "c" + (++uid);
  return svg(p, `
 ${base(p, 300, 412, 200)}
 ${blob(p, 300, 225, 250)}${ring(300, 220, 190, ".35")}
 ${dot(50, 150, 5, "#c9b9ff", "fl2")}${dot(556, 240, 6, "#b9a6ff", "fl3")}${dot(300, 20, 4, "#c9b9ff", "fl1")}
 <g transform="translate(110 64) rotate(-3)"><g class="fl1" filter="url(#${p}sh)">
  <rect width="380" height="270" rx="14" fill="#fff" stroke="#e4defb"/>
  <rect x="14" y="14" width="352" height="242" rx="8" fill="none" stroke="#b9a6ff" stroke-width="2"/>
  <rect x="22" y="22" width="336" height="226" rx="5" fill="none" stroke="#d9d1fa" stroke-dasharray="3 5"/>
  <text x="190" y="66" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="26" letter-spacing="5" fill="#3a2fa0">СЕРТИФІКАТ</text>
  <rect x="140" y="80" width="100" height="3" rx="1.5" fill="#b9a6ff"/>
  <rect x="140" y="104" width="100" height="6" rx="3" fill="#d9d1fa"/>
  <rect x="96" y="128" width="188" height="11" rx="5.5" fill="#6c47ff" opacity=".85"/>
  ${lines(110, 160, 160, 3, 14, "#ece8fc", 6)}
  <path d="M46 226c10-18 16 8 26-8s14 6 24-4" fill="none" stroke="#6c47ff" stroke-width="2.5" stroke-linecap="round"/><rect x="40" y="234" width="76" height="2" fill="#d9d1fa"/>
  <rect x="268" y="234" width="76" height="2" fill="#d9d1fa"/><rect x="282" y="222" width="48" height="6" rx="3" fill="#e4defb"/></g></g>
 <g transform="translate(450 300)"><g class="fl2" filter="url(#${p}ss)">
  <path d="M-18 20-34 76-12 66 2 84 10 30z" fill="#6c47ff"/><path d="M18 20 34 76 12 66-2 84-10 30z" fill="#8b6cff"/>
  <circle r="42" fill="#fbbf24"/><circle r="42" fill="url(#${p}v)" opacity="0"/><circle r="33" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2.5"/>
  <circle r="42" fill="none" stroke="#f59e0b" stroke-width="3"/><g transform="scale(1.35)"><polygon points="${STAR}" fill="#fff"/></g></g></g>
 ${pill(p, 82, 78, 104, 40, "120 год", -7, "fl3", 18)}${tile(p, 532, 96, 62, "cap", 6, "fl1")}
 <g transform="translate(66 346)"><g class="fl1"><circle r="26" fill="#34d399" filter="url(#${p}ss)"/><path d="M-11 0l7 8 15-17" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g></g>`);
}

/* інноваційна робота: стопка статей / публікацій */
function pub() {
  const p = "u" + (++uid);
  const col = (x, y) => lines(x, y, 100, 8, 12, "#e4defb", 5);
  return svg(p, `
 ${base(p, 300, 412, 200)}
 ${blob(p, 300, 225, 250)}${ring(300, 215, 190, ".35")}
 ${dot(56, 130, 5, "#c9b9ff", "fl2")}${dot(552, 330, 6, "#b9a6ff", "fl3")}${dot(310, 22, 4, "#c9b9ff", "fl1")}
 <g transform="translate(120 84) rotate(-12)"><g class="fl3"><rect width="250" height="300" rx="12" fill="#ece8fc" stroke="#ddd5fa"/></g></g>
 <g transform="translate(250 76) rotate(7)"><g class="fl2" filter="url(#${p}ss)"><rect width="250" height="310" rx="12" fill="#f6f3ff" stroke="#e4defb"/>${lines(20, 30, 180, 3, 14, "#d9d1fa", 6)}</g></g>
 <g transform="translate(170 60) rotate(-3)"><g class="fl1" filter="url(#${p}sh)">
  <rect width="270" height="330" rx="12" fill="#fff" stroke="#e8e3fb"/>
  <rect x="22" y="26" width="190" height="11" rx="5.5" fill="#1b1747"/><rect x="22" y="44" width="140" height="11" rx="5.5" fill="#1b1747"/>
  <rect x="22" y="66" width="90" height="5" rx="2.5" fill="#8b6cff"/>
  <path d="M22 84h226" stroke="#e4defb" stroke-width="2"/>
  ${col(22, 98)}${col(148, 98)}
  <rect x="22" y="206" width="104" height="92" rx="8" fill="#f1edff"/>
  <rect x="36" y="262" width="14" height="22" rx="3" fill="#b9a6ff"/><rect x="58" y="246" width="14" height="38" rx="3" fill="#8b6cff"/><rect x="80" y="232" width="14" height="52" rx="3" fill="#6c47ff"/><rect x="102" y="254" width="14" height="30" rx="3" fill="#a78bfa"/>
  <rect x="148" y="206" width="100" height="5" rx="2.5" fill="#e4defb"/>${lines(148, 224, 100, 6, 12, "#ece8fc", 5)}</g></g>
 ${pill(p, 88, 86, 98, 40, "Стаття", -7, "fl3", 18)}${pill(p, 520, 72, 70, 36, "PDF", 7, "fl1", 17)}${tile(p, 532, 250, 60, "book", 6, "fl2")}
 <g transform="translate(70 350)"><g class="fl2"><circle r="26" fill="#fff" stroke="#d9d1fa" filter="url(#${p}ss)"/><text x="0" y="12" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="34" fill="#6c47ff">“</text></g></g>`);
}

/* робота зі студентами: група студентів біля презентації */
function stud() {
  const p = "s" + (++uid);
  return svg(p, `
 ${blob(p, 300, 225, 250)}${ring(300, 220, 190, ".35")}
 ${dot(50, 90, 5, "#c9b9ff", "fl2")}${dot(556, 200, 6, "#b9a6ff", "fl3")}${dot(110, 400, 4, "#c9b9ff", "fl1")}
 <g transform="translate(140 40) rotate(-2)"><g class="fl1" filter="url(#${p}sh)">
  <rect width="320" height="200" rx="14" fill="#fff" stroke="#e8e3fb"/><circle cx="16" cy="15" r="4" fill="#ff8aa0"/><circle cx="30" cy="15" r="4" fill="#ffd166"/><circle cx="44" cy="15" r="4" fill="#6ee7a8"/>
  <rect x="20" y="40" width="130" height="10" rx="5" fill="#1b1747"/>${lines(20, 64, 130, 4, 13, "#e4defb", 5)}
  <rect x="172" y="40" width="128" height="140" rx="10" fill="#f1edff"/>
  <path d="M184 160l28-34 24 18 30-48 24 20" fill="none" stroke="#6c47ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="212" cy="126" r="4.5" fill="#fff" stroke="#6c47ff" stroke-width="2.5"/><circle cx="272" cy="96" r="4.5" fill="#fff" stroke="#6c47ff" stroke-width="2.5"/>
  <rect x="20" y="130" width="130" height="50" rx="8" fill="#f7f4ff"/><circle cx="44" cy="155" r="12" fill="#fbbf24"/>${lines(66, 146, 70, 2, 14, "#d9d1fa", 6)}</g></g>
 ${person(p, 150, 420, 1.05, "#f6c9a6", "#3a2a22", "#8b6cff", "fl2")}
 ${person(p, 300, 430, 1.2, "#e9b48a", "#1b1747", "#6c47ff", "fl1")}
 ${person(p, 452, 420, 1.05, "#fbd9bd", "#b4572a", "#ff8aa0", "fl3")}
 <g transform="translate(94 266)"><g class="fl3"><rect x="-34" y="-20" width="68" height="38" rx="14" fill="#fff" stroke="#d9d1fa" filter="url(#${p}ss)"/><path d="M-6 18l-4 12 14-12z" fill="#fff" stroke="#d9d1fa"/><circle cx="-14" cy="0" r="3.5" fill="#8b6cff"/><circle cx="0" cy="0" r="3.5" fill="#8b6cff"/><circle cx="14" cy="0" r="3.5" fill="#8b6cff"/></g></g>
 ${tile(p, 530, 96, 62, "cap", 6, "fl2")}${pill(p, 520, 290, 80, 36, "Група", 6, "fl1", 17)}${star(p, 66, 70, 1.1, "fl2")}`);
}

/* нагороди: кубок, медаль і зірки */
function awards() {
  const p = "a" + (++uid);
  return svg(p, `
 ${base(p, 300, 408, 190)}
 <defs><linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs>
 ${blob(p, 300, 225, 250)}${ring(300, 220, 190, ".35")}${ring(300, 220, 140, ".25")}
 ${dot(60, 160, 5, "#c9b9ff", "fl2")}${dot(548, 330, 6, "#b9a6ff", "fl3")}${dot(150, 400, 4, "#c9b9ff", "fl1")}
 <g filter="url(#${p}sh)"><g class="fl1">
  <path d="M238 118c-40-4-48 26-34 52 10 18 30 26 46 28" fill="none" stroke="url(#${p}g)" stroke-width="14" stroke-linecap="round"/>
  <path d="M362 118c40-4 48 26 34 52-10 18-30 26-46 28" fill="none" stroke="url(#${p}g)" stroke-width="14" stroke-linecap="round"/>
  <path d="M226 96h148v84c0 54-32 92-74 92s-74-38-74-92z" fill="url(#${p}g)"/>
  <path d="M244 110h22v76c0 36 10 58 26 70-30-8-48-34-48-78z" fill="#fff" opacity=".35"/>
  <g transform="translate(300 170) scale(2.3)"><polygon points="${STAR}" fill="#fff"/></g>
  <rect x="282" y="268" width="36" height="46" fill="#f59e0b"/><rect x="282" y="268" width="36" height="12" fill="#fff" opacity=".25"/>
  <rect x="236" y="312" width="128" height="30" rx="8" fill="url(#${p}vd)"/><rect x="214" y="338" width="172" height="34" rx="10" fill="url(#${p}v)"/>
  <rect x="262" y="320" width="76" height="6" rx="3" fill="#fff" opacity=".6"/></g></g>
 <g transform="translate(112 290)"><g class="fl2" filter="url(#${p}ss)"><path d="M-16-6-30-56h22l8 36zM16-6 30-56H8l-8 36z" fill="#6c47ff"/><circle r="34" fill="url(#${p}g)"/><circle r="26" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2.5"/><g transform="scale(1.1)"><polygon points="${STAR}" fill="#fff"/></g></g></g>
 ${star(p, 80, 86, 1.5, "fl3")}${star(p, 520, 80, 1.9, "fl2", "#fbbf24")}${star(p, 500, 250, 1.1, "fl1", "#fcd34d")}${star(p, 190, 40, 0.9, "fl1", "#fcd34d")}
 ${pill(p, 508, 340, 98, 38, "Грамота", 6, "fl3", 17)}`);
}

/* оголошення: ноутбук, гучномовець, календар, мітки «Новини» / «Конференції» */
function news() {
  const p = "n" + (++uid);
  const cal = Array.from({length: 15}, (_, i) => `<rect x="${14 + (i % 5) * 26}" y="${54 + Math.floor(i / 5) * 24}" width="20" height="17" rx="5" fill="${i === 7 ? `url(#${p}v)` : "#efeaff"}"/>`).join("");
  return svg(p, `
 ${base(p, 300, 418, 210)}
 ${blob(p, 300, 225, 255)}${ring(300, 215, 195, ".35")}${blob(p, 70, 330, 70)}${blob(p, 540, 300, 80)}
 ${dot(40, 150, 5, "#c9b9ff", "fl2")}${dot(560, 200, 6, "#b9a6ff", "fl3")}${dot(250, 18, 5, "#c9b9ff", "fl1")}${dot(96, 400, 4, "#b9a6ff", "fl2")}
 ${laptop(p, 168, 86, `<g transform="translate(34 30)"><rect width="268" height="14" rx="7" fill="#8b6cff"/><rect y="28" width="104" height="82" rx="8" fill="#e9e3ff"/><path d="M0 110l30-36 22 20 24-30 28 46z" fill="#a78bfa"/><circle cx="82" cy="50" r="7" fill="#fff"/>
   <rect x="122" y="34" width="146" height="9" rx="4.5" fill="#d9d1fa"/><rect x="122" y="54" width="120" height="9" rx="4.5" fill="#d9d1fa"/><rect x="122" y="74" width="132" height="9" rx="4.5" fill="#d9d1fa"/></g>`, 0)}
 <g transform="translate(38 214) rotate(-14)"><g class="fl2" filter="url(#${p}sh)">
  <rect x="-16" y="30" width="22" height="46" rx="8" fill="#5b3df5"/><path d="M24 78l8 40c1 5 6 8 11 6l8-2c4-1 6-5 5-9l-8-34z" fill="#6c47ff"/>
  <path d="M0 26 96-6v118L0 80z" fill="url(#${p}v)"/><path d="M0 26 96-6v30L0 50z" fill="#fff" opacity=".18"/>
  <ellipse cx="96" cy="53" rx="18" ry="60" fill="#e4dcff" stroke="#fff" stroke-width="3"/><ellipse cx="96" cy="53" rx="9" ry="42" fill="#8b6cff" opacity=".35"/></g></g>
 <g class="fl1" stroke="#a78bfa" stroke-width="5" stroke-linecap="round"><path d="M172 204l22-17M178 232h32M172 262l22 17" opacity=".85"/></g>
 <g transform="translate(436 190) rotate(5)"><g class="fl3" filter="url(#${p}sh)">
  <rect x="14" y="-6" width="140" height="170" rx="16" fill="url(#${p}vd)"/><rect width="150" height="170" rx="16" fill="#fff" stroke="#e8e3fb"/>
  <path d="M0 16a16 16 0 0 1 16-16h118a16 16 0 0 1 16 16v26H0z" fill="url(#${p}vd)"/><rect x="34" y="-8" width="8" height="20" rx="4" fill="#d9d1fa" stroke="#fff"/><rect x="108" y="-8" width="8" height="20" rx="4" fill="#d9d1fa" stroke="#fff"/>
  ${cal}<circle cx="124" cy="126" r="11" fill="none" stroke="#fff" stroke-width="3"/></g></g>
 ${plant(p, 566, 368, .62, false)}
 <g transform="translate(108 60) rotate(-7)"><g class="fl3"><rect x="-70" y="-24" width="140" height="48" rx="14" fill="url(#${p}v)" filter="url(#${p}ss)"/><rect x="-58" y="-11" width="22" height="22" rx="5" fill="#fff" opacity=".95"/><path d="M-53-4h12M-53 1h12M-53 6h8" stroke="#8b6cff" stroke-width="2.2" stroke-linecap="round"/><text x="-26" y="6" font-family="${FONT}" font-weight="800" font-size="16" fill="#fff">НОВИНИ</text></g></g>
 <g transform="translate(470 54) rotate(6)"><g class="fl1"><rect x="-86" y="-24" width="172" height="48" rx="14" fill="url(#${p}v)" filter="url(#${p}ss)"/><rect x="-74" y="-11" width="22" height="22" rx="5" fill="#fff" opacity=".95"/><path d="M-69-6h12M-69-1h4M-62-1h5M-69 4h12" stroke="#8b6cff" stroke-width="2.2" stroke-linecap="round"/><text x="-42" y="6" font-family="${FONT}" font-weight="800" font-size="15" fill="#fff">КОНФЕРЕНЦІЇ</text></g></g>`);
}

/* інтерактивні заняття: редактор коду + тест */
function lessons() {
  const p = "l" + (++uid);
  const opt = (y, on) => `<circle cx="22" cy="${y}" r="8" fill="${on ? "#6c47ff" : "#fff"}" stroke="${on ? "#6c47ff" : "#cfc4fb"}" stroke-width="2"/>${on ? `<circle cx="22" cy="${y}" r="3" fill="#fff"/>` : ""}<rect x="40" y="${y - 3}" width="${on ? 120 : 96}" height="6" rx="3" fill="${on ? "#b9a6ff" : "#e4defb"}"/>`;
  return svg(p, `
 ${base(p, 300, 412, 200)}
 ${blob(p, 300, 225, 250)}${ring(300, 220, 190, ".35")}
 ${dot(56, 360, 5, "#c9b9ff", "fl2")}${dot(556, 90, 6, "#b9a6ff", "fl3")}${dot(300, 20, 4, "#c9b9ff", "fl1")}
 <g transform="translate(40 80) rotate(-2)"><g class="fl1" filter="url(#${p}sh)"><rect width="320" height="236" rx="14" fill="url(#${p}sc)"/>
  <circle cx="16" cy="15" r="3.5" fill="#ff8aa0"/><circle cx="29" cy="15" r="3.5" fill="#ffd166"/><circle cx="42" cy="15" r="3.5" fill="#6ee7a8"/><rect x="0" y="32" width="320" height="1" fill="#fff" opacity=".08"/>
  ${code(40, 52, 11, 15, .95)}<rect x="40" y="218" width="8" height="4" rx="2" fill="#fff"><animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite"/></rect></g></g>
 <g transform="translate(300 150) rotate(3)"><g class="fl2" filter="url(#${p}sh)"><rect width="250" height="200" rx="14" fill="#fff" stroke="#e8e3fb"/>
  <rect x="20" y="20" width="26" height="26" rx="8" fill="url(#${p}v)"/><rect x="58" y="26" width="150" height="8" rx="4" fill="#1b1747"/><rect x="58" y="40" width="96" height="6" rx="3" fill="#d9d1fa"/>
  <g transform="translate(20 0)">${opt(78, false)}${opt(108, true)}${opt(138, false)}</g>
  <rect x="20" y="162" width="92" height="24" rx="12" fill="url(#${p}v)"/><rect x="38" y="171" width="56" height="6" rx="3" fill="#fff" opacity=".85"/></g></g>
 <g transform="translate(532 150)"><g class="fl3"><circle r="30" fill="#34d399" filter="url(#${p}ss)"/><path d="M-13 0l9 10 17-20" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></g></g>
 ${tile(p, 76, 66, 62, "code", -6, "fl3")}${pill(p, 470, 366, 104, 38, "Тест тижня", 5, "fl1", 15)}`);
}


/* про викладача: викладачка за ноутбуком, плитки та мітки */
function me() {
  const p = "m" + (++uid);
  return svg(p, `
 ${base(p, 320, 412, 215)}
 ${blob(p, 320, 225, 250)}${ring(320, 220, 195, ".35")}${ring(320, 220, 145, ".22")}
 ${dot(40, 150, 5, "#c9b9ff", "fl2")}${dot(566, 210, 6, "#b9a6ff", "fl3")}${dot(300, 22, 4, "#c9b9ff", "fl1")}${dot(70, 388, 4, "#b9a6ff", "fl2")}
 ${laptop(p, 206, 96, "", 11)}
 ${win(p, 424, 250, 150, 112, 5, "fl2", true, true)}
 ${person(p, 150, 424, 1.6, "#f6c9a6", "#4a2f27", "#8b6cff", "fl1", true)}
 ${plant(p, 556, 396, .62, true)}
 ${pill(p, 120, 84, 96, 42, "HTML", -7, "fl3", 19)}${pill(p, 506, 62, 84, 38, "CSS", 7, "fl1", 18)}${pill(p, 372, 30, 62, 32, "JS", -3, "fl2", 16)}
 ${tile(p, 52, 232, 60, "cap", -6, "fl2")}${star(p, 82, 330, 1.1, "fl3")}`);
}

export const ART = { a: home, b: res, home, disc, disc_web: disc, disc_it: discIt, res, cert, pub, stud, awards, news, lessons, me };
export function bannerArt(name) {
  const e = document.createElement("div");
  e.className = "bn-art bn-svgwrap";
  e.innerHTML = (ART[name] || ART.b)();
  return e;
}
