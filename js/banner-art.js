/* WEB.LAB — SVG-ілюстрації для банерів (замість растрових картинок).
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
 ${blob(p, 320, 230, 250)}${ring(330, 200, 175, ".35")}
 ${dot(60, 60, 5, "#c9b9ff", "fl2")}${dot(545, 110, 6, "#b9a6ff", "fl3")}${dot(490, 400, 4, "#c9b9ff", "fl1")}
 <circle class="fl2" cx="318" cy="52" r="26" fill="url(#${p}bl)"/><circle class="fl2" cx="318" cy="52" r="14" fill="#d9ccff" opacity=".7"/>
 ${laptop(p, 190, 90, `<g transform="translate(250 112)"><rect x="-58" y="-48" width="116" height="96" rx="22" fill="url(#${p}v)" filter="url(#${p}ss)"/><rect x="-54" y="-44" width="108" height="40" rx="18" fill="#fff" opacity=".12"/><g transform="translate(0 0) scale(.95)">${ICONS.code}</g></g>`, 9)}
 ${win(p, 66, 168, 210, 150, -7, "fl1", true, true)}${win(p, 96, 218, 200, 140, -5, "fl2", false, true)}
 ${plant(p, 62, 372, .95, false)}${plant(p, 548, 360, .62, false)}
 ${pill(p, 150, 74, 92, 40, "HTML", -7, "fl3", 18)}${pill(p, 488, 88, 76, 36, "CSS", 8, "fl1", 17)}
 ${base(p, 320, 405, 200)}`);
}

/* студентські проєкти: сайт у браузері, фіолетове вікно позаду, вікно з кодом, три таблетки */
function works() {
  const p = "w" + (++uid);
  return svg(p, `
 ${blob(p, 300, 220, 250)}${ring(300, 215, 190, ".4")}${ring(190, 250, 120, ".3")}
 ${dot(40, 150, 5, "#c9b9ff", "fl3")}${dot(560, 230, 5, "#b9a6ff", "fl1")}${dot(110, 400, 4, "#c9b9ff", "fl2")}
 <g transform="translate(200 40) rotate(4)"><g class="fl2" filter="url(#${p}ss)"><rect width="330" height="170" rx="14" fill="url(#${p}v)"/><circle cx="16" cy="15" r="4" fill="#fff" opacity=".7"/><circle cx="30" cy="15" r="4" fill="#fff" opacity=".5"/><circle cx="44" cy="15" r="4" fill="#fff" opacity=".35"/></g></g>
 <g transform="translate(300 118) rotate(2)"><g class="fl3" filter="url(#${p}sh)"><rect width="290" height="220" rx="14" fill="url(#${p}sc)"/><circle cx="16" cy="15" r="3.5" fill="#ff8aa0"/><circle cx="29" cy="15" r="3.5" fill="#ffd166"/><circle cx="42" cy="15" r="3.5" fill="#6ee7a8"/>${code(26, 44, 10, 15, .85)}</g></g>
 <g transform="translate(60 112)"><g class="fl1" filter="url(#${p}sh)">
  <rect width="320" height="236" rx="14" fill="#fff" stroke="#e8e3fb"/>
  <circle cx="16" cy="15" r="4" fill="#8b6cff"/><circle cx="30" cy="15" r="4" fill="#b9a6ff"/><circle cx="44" cy="15" r="4" fill="#d9d1fa"/>
  <rect x="18" y="38" width="46" height="6" rx="3" fill="#2b2857"/><rect x="190" y="38" width="22" height="6" rx="3" fill="#d9d1fa"/><rect x="222" y="38" width="22" height="6" rx="3" fill="#d9d1fa"/><rect x="254" y="38" width="22" height="6" rx="3" fill="#d9d1fa"/>
  <rect x="14" y="56" width="292" height="150" rx="10" fill="#f7f4ff"/>
  <rect x="30" y="86" width="104" height="9" rx="4.5" fill="#1b1747"/><rect x="30" y="102" width="84" height="9" rx="4.5" fill="#1b1747"/>
  <rect x="30" y="124" width="92" height="5" rx="2.5" fill="#c9c2e6"/><rect x="30" y="134" width="70" height="5" rx="2.5" fill="#c9c2e6"/>
  <rect x="30" y="156" width="64" height="20" rx="10" fill="#1b1747"/><rect x="42" y="164" width="40" height="4" rx="2" fill="#fff" opacity=".8"/>
  <rect x="160" y="64" width="138" height="134" rx="10" fill="#efe6dc"/>
  <ellipse cx="224" cy="186" rx="34" ry="6" fill="#d7c8b8"/>
  <path d="M196 182c-8-26 2-48 28-48s36 22 28 48z" fill="#faf6f0"/><path d="M224 136V98" stroke="#7aa886" stroke-width="3"/>
  <ellipse cx="210" cy="112" rx="14" ry="7" transform="rotate(-35 210 112)" fill="#6fa77d"/><ellipse cx="240" cy="106" rx="14" ry="7" transform="rotate(35 240 106)" fill="#5d9a70"/><ellipse cx="224" cy="92" rx="6" ry="12" fill="#7bb78d"/>
  <rect x="150" y="150" width="46" height="34" rx="4" fill="#cdb79c"/>
  <rect x="18" y="214" width="120" height="6" rx="3" fill="#e4defb"/></g></g>
 ${pill(p, 78, 68, 96, 42, "HTML", -8, "fl3", 19)}${pill(p, 520, 62, 80, 38, "CSS", 7, "fl1", 18)}${pill(p, 498, 372, 78, 46, "JS", 0, "fl2", 22)}`);
}

/* дисципліни: ноутбук, два вікна, книги + рослина, таблетки HTML / CSS / JS */
function disc() {
  const p = "d" + (++uid);
  return svg(p, `
 ${blob(p, 300, 230, 250)}${ring(300, 210, 200, ".4")}${ring(318, 220, 150, ".25")}
 ${dot(60, 100, 5, "#c9b9ff", "fl2")}${dot(556, 150, 6, "#b9a6ff", "fl3")}${dot(300, 20, 4, "#c9b9ff", "fl1")}${dot(70, 390, 4, "#b9a6ff", "fl3")}
 ${laptop(p, 118, 66, "", 11)}
 ${win(p, 24, 200, 190, 150, -3, "fl2", true)}${win(p, 330, 108, 240, 156, 3, "fl1", true, true)}
 ${plant(p, 538, 262, 1, true)}
 ${books(p, 380, 250)}
 ${pill(p, 108, 62, 96, 42, "HTML", -7, "fl3", 19)}${pill(p, 490, 46, 84, 38, "CSS", 6, "fl1", 18)}${pill(p, 300, 394, 62, 34, "JS", 0, "fl2", 17)}
 ${base(p, 300, 410, 220)}`);
}

/* корисні матеріали: ноутбук, стос книг із рослиною, плитки play / книга / шапка */
function res() {
  const p = "r" + (++uid);
  return svg(p, `
 <circle cx="290" cy="170" r="150" fill="url(#${p}bl)"/>${blob(p, 130, 250, 110)}${blob(p, 470, 230, 120)}
 ${dot(40, 380, 3.5, "#b9a6ff", "fl1")}${dot(56, 396, 3, "#b9a6ff", "fl2")}${dot(74, 386, 3, "#b9a6ff", "fl3")}${dot(540, 40, 4, "#c9b9ff", "fl2")}
 ${laptop(p, 98, 78, "", 11)}
 ${plant(p, 470, 262, 1.1, true)}${books(p, 342, 232)}
 ${tile(p, 98, 64, 64, "play", -6, "fl1")}${tile(p, 52, 224, 62, "cap", 6, "fl3")}${tile(p, 506, 56, 62, "book", 5, "fl2")}
 ${base(p, 280, 388, 220)}`);
}

export const ART = { a: home, b: res, home, works, disc, res };
export function bannerArt(name) {
  const e = document.createElement("div");
  e.className = "bn-art bn-svgwrap";
  e.innerHTML = (ART[name] || ART.b)();
  return e;
}
