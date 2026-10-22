// Розділи «Дисципліни» (два підрозділи) та «Корисні матеріали» (розділи з книгами, відео, посиланнями).
import {parseVideo, setThumb, fileInfo, okUrl, hostOf, resType, docView} from "./media.js";

export const DISC = {
  it: {
    title: "Інтернет-технології в інформаційній діяльності",
    head: ["Інтернет-технології", "в інформаційній діяльності"],
    lead: "Усі необхідні матеріали для успішного навчання: лекції, практичні роботи, самостійне вивчення та корисні ресурси в одному місці."
  },
  web: {
    title: "Веб-дизайн та веб-технології",
    head: ["Веб-дизайн", "та веб-технології"],
    lead: "Усі необхідні матеріали для успішного навчання: лекції, практичні роботи, самостійне вивчення та корисні ресурси в одному місці."
  }
};

export const KINDS = [
  {k: "lecture", n: "Лекція", t: "Лекції", i: "book", w: ["лекція", "лекції", "лекцій"], d: "Теоретичні матеріали, які допомагають краще зрозуміти основи дисципліни.", add: "Додати лекцію", none: "Лекції ще не додано."},
  {k: "present", n: "Презентація", t: "Презентації", i: "layout", w: ["презентація", "презентації", "презентацій"], d: "Слайди до занять: перегляньте онлайн або завантажте на свій пристрій.", add: "Додати презентацію", none: "Презентації ще не додано."},
  {k: "practice", n: "Практична робота", t: "Практичні роботи", i: "code", w: ["практична", "практичні", "практичних"], d: "Завдання для практичних занять та методичні вказівки до їх виконання.", add: "Додати практичну", none: "Практичні роботи ще не додано."},
  {k: "self", n: "Матеріал", t: "Самостійне вивчення", i: "file", w: ["матеріал", "матеріали", "матеріалів"], d: "Матеріали, які варто опрацювати самостійно поза аудиторією.", add: "Додати матеріал", none: "Матеріали для самостійного вивчення ще не додано."},
  {k: "info", n: "", t: "Додаткова інформація", i: "info", w: ["матеріал", "матеріали", "матеріалів"], d: "Програма, критерії оцінювання та інші довідкові документи.", add: "Додати матеріал", none: "Додаткової інформації ще немає."}
];

export const pl = (n, w) => {
  const m = n % 100, k = n % 10;
  return m > 10 && m < 20 ? w[2] : k === 1 ? w[0] : k > 1 && k < 5 ? w[1] : w[2];
};
const ordKey = r => r.ord ?? r.createdAt ?? 0;
export const byOrd = a => [...(a || [])].sort((x, y) => ordKey(x) - ordKey(y));
const norm = s => String(s || "").toLowerCase();
const DT = {it: "lecture", web: "lecture"};

/* ============================================================ ДИСЦИПЛІНА */
export function buildDiscipline(ctx, id) {
  const {h, ic, A, st, add, ab, empty, bn} = ctx;
  const D = DISC[id], info = (st.profile && st.profile.discs && st.profile.discs[id]) || {};
  const mats = (st.materials || []).filter(m => m.disc === id);

  const hero = bn("disc_" + id, {eyebrow: "Навчальний матеріал", title: D.head, desc: info.desc || D.lead}, "disc_" + id);

  const box = h("div", {class: "ds-body"});

  const isLand = (r, kind) => kind.k === "present" || /docs\.google\.com\/presentation\/|\.pptx?(\?|#|$)/i.test(r.link || "");
  function thumb(r, i, kind, view, card) {
    const num = kind.k === "info" ? ic("info") : String(i + 1).padStart(2, "0");
    const ph = h("span", {class: "dd-ph", "aria-hidden": "true"},
      h("i", {class: "dd-l1"}), h("b", {class: "dd-n"}, num), h("i", {class: "dd-l2"}), h("i", {class: "dd-l3"}), h("i", {class: "dd-l2"}), h("i", {class: "dd-l3"}));
    const box = h(view ? "button" : "div", view ? {type: "button", class: "dd-th", "aria-label": "Переглянути: " + r.title, title: "Переглянути", onclick: () => openDoc(h, ic, r)} : {class: "dd-th"}, ph);
    const src = r.photo || (view ? view.thumb : "");
    if (src) {
      const img = h("img", {alt: "", loading: "lazy", src});
      img.onerror = () => img.remove();
      img.onload = () => {
        const w = img.naturalWidth, hh = img.naturalHeight;
        if (!r.photo && w && w <= 160) {img.remove(); return;}
        if (!w || !hh) return;
        const land = w > hh * 1.05;
        card.classList.toggle("land", land);
        box.style.aspectRatio = String(Math.min(1.9, Math.max(0.6, w / hh)));
      };
      box.append(img);
    }
    if (view) box.append(h("span", {class: "dd-zoom", "aria-hidden": "true"}, ic("ext")));
    return box;
  }

  function row(r, i, list, kind) {
    const fi = fileInfo(r.link, r.ftype), ok = okUrl(r.link), dv = ok ? docView(r.link) : {embed: "", thumb: ""};
    const canView = ok && (dv.embed || r.photo);
    const mv = A ? h("div", {class: "ds-mv"},
      h("button", {type: "button", class: "btn sm", "aria-label": "Перемістити вище", disabled: i === 0, onclick: () => A.move("materials", r, -1, list)}, ic("up")),
      h("button", {type: "button", class: "btn sm", "aria-label": "Перемістити нижче", disabled: i === list.length - 1, onclick: () => A.move("materials", r, 1, list)}, ic("down"))) : null;
    const eye = kind.n ? kind.n + (kind.k === "self" ? "" : " " + String(i + 1).padStart(2, "0")) : "";
    const card = h("article", {class: "dd-card" + (isLand(r, kind) ? " land" : "")});
    card.append(...[
      thumb(r, i, kind, canView ? dv : null, card),
      h("div", {class: "dd-in"},
        h("div", {class: "dd-top"}, fi.label ? h("span", {class: "dd-ft"}, ic("file"), fi.label) : null),
        h("div", {class: "dd-tt"}, eye ? h("small", {}, eye) : null, h("h3", {}, r.title)),
        r.desc ? h("p", {class: "mu"}, r.desc) : null,
        h("div", {class: "dd-bot"},
          r.size ? h("span", {class: "dd-sz"}, ic("file"), r.size) : h("span"),
          ok ? h("a", {class: "dd-btn", href: fi.dl || r.link, target: "_blank", rel: "noopener noreferrer", "aria-label": "Завантажити: " + r.title}, "Завантажити", ic("dl")) : null)),
      A ? h("div", {class: "ds-adm"}, mv, ab("materials", r)) : null].filter(Boolean));
    return card;
  }

  function quickBlock() {
    const q = byOrd(mats).filter(m => m.quick && okUrl(m.link));
    if (!q.length && !A) return null;
    return h("aside", {class: "ds-side card"}, h("h2", {}, "Швидкий доступ"),
      q.length ? h("ul", {}, q.map(m => {
        const k = KINDS.find(x => x.k === m.kind) || KINDS[3];
        return h("li", {}, h("a", {href: m.link, target: "_blank", rel: "noopener noreferrer"},
          h("span", {class: "ds-qi"}, ic(k.i)), h("span", {class: "ds-qt"}, h("b", {}, m.title), m.desc ? h("small", {}, m.desc) : null)));
      })) : h("p", {class: "mu s"}, "Позначте матеріал прапорцем «Показати у швидкому доступі» — він з’явиться тут."));
  }

  function paint() {
    const kind = KINDS.find(k => k.k === DT[id]) || KINDS[0];
    const list = byOrd(mats.filter(m => m.kind === kind.k));
    const tabs = h("div", {class: "ds-tabs", role: "tablist", "aria-label": "Види матеріалів"}, KINDS.map(k =>
      h("button", {role: "tab", type: "button", class: "ds-tab" + (k.k === kind.k ? " on" : ""), "aria-selected": String(k.k === kind.k), onclick: () => {DT[id] = k.k; paint();}}, ic(k.i), k.t)));
    const head = h("div", {class: "ds-ch"},
      h("span", {class: "ds-ci"}, ic(kind.i)),
      h("div", {class: "ds-cm"}, h("h2", {}, kind.t), h("p", {class: "mu"}, kind.d)),
      h("div", {class: "ds-cr"}, list.length ? h("span", {class: "ds-tot"}, `Всього: ${list.length} ${pl(list.length, kind.w)}`) : null,
        add("materials", kind.add, {disc: id, kind: kind.k})));
    const body = list.length ? h("div", {class: "ds-list dd-grid"}, list.map((r, i) => row(r, i, list, kind)))
      : (A ? empty("materials", kind.add, {disc: id, kind: kind.k}) : h("div", {class: "empty"}, ic("file"), h("p", {}, kind.none)));
    const note = list.length ? h("div", {class: "ds-note"}, h("span", {class: "ds-ni"}, ic("info")),
      h("p", {}, "Натисніть на картинку, щоб переглянути матеріал онлайн, або завантажте його на свій пристрій.")) : null;
    const side = quickBlock();
    box.replaceChildren(tabs, h("div", {class: "ds-layout" + (side ? "" : " one")}, h("section", {class: "ds-card card"}, head, body, note), side));
  }
  paint();
  return [hero, box];
}

/* ============================================================ КОРИСНІ МАТЕРІАЛИ */
const RS = {sel: "", q: {}, sort: {}, tag: {}, lim: {}};
const COVERS = ["#2b1b5e,#6c47ff", "#1d1a4a,#4f46e5", "#3b1d8f,#8b6cff", "#14213d,#5b3df5"];
const hash = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/* Вбудований перегляд документів (PDF та інші файли) у вікні поверх сторінки */
export function openDoc(h, ic, r) {
  const dv = docView(r.link), fi = fileInfo(r.link, r.ftype);
  if (!dv.embed) { if (okUrl(r.link)) window.open(r.link, "_blank", "noopener"); return; }
  const prev = document.activeElement;
  const x = h("button", {class: "vm-x dm-x", type: "button", "aria-label": "Закрити перегляд", onclick: () => close()}, ic("x"));
  const frame = h("iframe", {src: dv.embed, title: r.title, allow: "fullscreen", referrerpolicy: "no-referrer"});
  const wait = h("div", {class: "dm-wait"}, h("span", {class: "dm-sp"}), "Завантаження документа…");
  frame.addEventListener("load", () => wait.remove());
  const bar = h("div", {class: "dm-bar"},
    h("div", {class: "dm-tt"}, h("b", {}, r.title), fi.label ? h("span", {class: "ds-ft"}, fi.label) : null),
    h("div", {class: "dm-ac"},
      h("a", {class: "dd-btn sm", href: fi.dl || r.link, target: "_blank", rel: "noopener noreferrer"}, "Завантажити", ic("dl")),
      h("a", {class: "dd-btn sm ghost", href: r.link, target: "_blank", rel: "noopener noreferrer", title: "Відкрити в новій вкладці"}, ic("ext"), h("span", {class: "dm-lb"}, "Нова вкладка")),
      x));
  const ov = h("div", {class: "vm dm", role: "dialog", "aria-modal": "true", "aria-label": r.title}, h("div", {class: "dm-box"}, bar, h("div", {class: "dm-view"}, wait, frame)));
  const kd = e => {if (e.key === "Escape") {e.stopPropagation(); close();}};
  function close() {document.removeEventListener("keydown", kd, true); ov.remove(); document.body.classList.remove("lock"); if (prev && prev.focus) prev.focus();}
  ov.addEventListener("click", e => {if (e.target === ov) close();});
  document.addEventListener("keydown", kd, true);
  document.body.append(ov); document.body.classList.add("lock"); x.focus();
}

export function playVideo(h, ic, r) {
  const v = parseVideo(r.link);
  if (!v || (!v.embed && !v.src)) { if (okUrl(r.link)) window.open(r.link, "_blank", "noopener"); return; }
  const prev = document.activeElement;
  const media = v.embed
    ? h("iframe", {src: v.embed, title: r.title, allow: "autoplay; encrypted-media; picture-in-picture; fullscreen", allowfullscreen: true, referrerpolicy: "strict-origin-when-cross-origin"})
    : h("video", {src: v.src, controls: true, autoplay: true, playsinline: true});
  const x = h("button", {class: "vm-x", type: "button", "aria-label": "Закрити відео", onclick: () => close()}, ic("x"));
  const ov = h("div", {class: "vm", role: "dialog", "aria-modal": "true", "aria-label": r.title}, x, h("div", {class: "vm-box"}, media));
  const kd = e => {if (e.key === "Escape") {e.stopPropagation(); close();}};
  function close() {document.removeEventListener("keydown", kd, true); ov.remove(); document.body.classList.remove("lock"); if (prev && prev.focus) prev.focus();}
  ov.addEventListener("click", e => {if (e.target === ov) close();});
  document.addEventListener("keydown", kd, true);
  document.body.append(ov); document.body.classList.add("lock"); x.focus();
}

export function buildResources(ctx) {
  const {h, ic, A, st, add, ab, empty, bn} = ctx;
  const all = st.resources || [];
  let secs = byOrd(st.resSections);
  if (!A) secs = secs.filter(s => all.some(r => r.section === s.id));
  if (RS.sel && !secs.some(s => s.id === RS.sel)) RS.sel = "";
  const itemsOf = s => all.filter(r => r.section === s.id);
  const total = secs.reduce((a, s) => a + itemsOf(s).length, 0);
  const isVid = r => resType(r) === "video";

  const secIcon = s => {
    const t = itemsOf(s).map(resType), c = k => t.filter(x => x === k).length;
    return !t.length ? "book" : c("video") * 2 > t.length ? "play" : c("link") + c("tool") > t.length / 2 ? (c("tool") >= c("link") ? "tool" : "link") : "book";
  };

  const hero = bn("res", {eyebrow: "Корисні матеріали", title: ["Підручники, відео", "та додаткові ресурси"],
      desc: "Збираємо для вас найкорисніші матеріали для вивчення веб-технологій: підручники, відеоуроки, корисні посилання та інструменти."}, "res",
    h("button", {class: "cta pri", type: "button", onclick: () => {const t = document.getElementById("rs-tabs"); if (t) t.scrollIntoView({behavior: "smooth", block: "start"});}}, "Обрати категорію", ic("adown")),
    add("resSections", "Додати розділ"));

  const content = h("div", {class: "rs-main"}), tiles = h("div", {class: "rs-tabs", id: "rs-tabs", role: "group", "aria-label": "Розділи матеріалів"});

  function paintTiles() {
    const tile = (id, icon, name, n, w) => h("button", {type: "button", class: "rs-tile" + (RS.sel === id ? " on" : ""), "aria-pressed": String(RS.sel === id), onclick: () => {RS.sel = id; paintTiles(); paintMain(); if (id) tiles.scrollIntoView({behavior: "smooth", block: "start"});}},
      h("span", {class: "rs-ti"}, ic(icon)), h("span", {class: "rs-tn"}, h("b", {}, name), h("small", {}, `${n} ${pl(n, w)}`)));
    tiles.replaceChildren(tile("", "layout", "Усі матеріали", secs.length, ["розділ", "розділи", "розділів"]),
      ...secs.map(s => tile(s.id, secIcon(s), s.name, itemsOf(s).length, ["матеріал", "матеріали", "матеріалів"])));
  }

  /* --- картки --- */
  function cover(r) {
    const fi = fileInfo(r.link, r.ftype), c = COVERS[hash(r.title) % COVERS.length].split(",");
    const box = h("div", {class: "rs-cover"});
    if (r.photo) box.append(h("img", {src: r.photo, alt: "Обкладинка: " + r.title, loading: "lazy"}));
    else {
      box.style.background = `linear-gradient(150deg,${c[0]},${c[1]})`;
      box.append(h("span", {class: "rs-cv"}, ic(resType(r) === "book" ? "book" : resType(r) === "tool" ? "tool" : "link"), h("b", {}, (r.title || "").slice(0, 38)), fi.label ? h("small", {}, fi.label) : null));
    }
    return box;
  }
  function fileCard(r) {
    const t = resType(r), fi = fileInfo(r.link, r.ftype), ok = okUrl(r.link);
    const act = !ok ? null : t === "book" && fi.dl
      ? h("a", {class: "rs-dl", href: fi.dl, target: "_blank", rel: "noopener noreferrer"}, "Завантажити", ic("dl"))
      : h("a", {class: "rs-dl", href: r.link, target: "_blank", rel: "noopener noreferrer"}, "Відкрити", ic("ext"));
    return h("article", {class: "rs-card rs-file"}, cover(r),
      h("div", {class: "rs-info"}, h("h3", {}, r.title), r.desc ? h("p", {class: "mu"}, r.desc) : null,
        h("div", {class: "rs-meta"}, t === "book" && fi.label ? h("span", {class: "chip"}, ic("file"), fi.label) : (t !== "book" && ok ? h("span", {class: "chip"}, ic("ext"), hostOf(r.link)) : null),
          r.size ? h("span", {class: "chip"}, r.size) : null, r.author ? h("span", {class: "mu s"}, r.author) : null),
        act, ab("resources", r)));
  }
  function videoCard(r) {
    const img = h("img", {alt: "", loading: "lazy"}), th = h("button", {class: "rs-thumb", type: "button", "aria-label": "Дивитися відео: " + r.title, onclick: () => playVideo(h, ic, r)},
      h("span", {class: "rs-ph"}, ic("video")), img, h("span", {class: "rs-play"}, ic("play")), r.duration ? h("span", {class: "rs-dur"}, r.duration) : null);
    if (r.photo) img.src = r.photo; else setThumb(img, r.link, () => img.remove());
    return h("article", {class: "rs-card rs-vid"}, th,
      h("div", {class: "rs-info"}, h("h3", {}, r.title), r.desc ? h("p", {class: "mu"}, r.desc) : null,
        h("div", {class: "rs-vf"}, r.author ? h("span", {class: "rs-au"}, h("span", {class: "rs-av"}, (r.author.trim()[0] || "•").toUpperCase()), r.author) : h("span"), r.tag ? h("span", {class: "chip"}, r.tag) : null),
        ab("resources", r)));
  }

  /* --- розділ --- */
  function section(s, i) {
    const items = itemsOf(s), focus = RS.sel === s.id;
    const tags = [...new Set(items.map(r => (r.tag || "").trim()).filter(Boolean))].slice(0, 10);
    if (RS.tag[s.id] && !tags.includes(RS.tag[s.id])) RS.tag[s.id] = "";
    const grid = h("div", {class: "rs-grid-wrap"}), more = h("div", {class: "rs-more"});
    function paintGrid() {
      const q = norm(RS.q[s.id]).trim(), tg = RS.tag[s.id] || "", sort = RS.sort[s.id] || "new";
      let f = items.filter(r => (!tg || (r.tag || "").trim() === tg) && (!q || norm([r.title, r.desc, r.author, r.tag].join(" ")).includes(q)));
      f = sort === "name" ? [...f].sort((a, b) => String(a.title).localeCompare(String(b.title), "uk")) : [...f].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const lim = RS.lim[s.id] || (focus ? 12 : 6), shown = f.slice(0, lim);
      const files = shown.filter(r => !isVid(r)), vids = shown.filter(isVid);
      grid.replaceChildren(...[
        files.length ? h("div", {class: "rs-grid f"}, files.map(fileCard)) : null,
        vids.length ? h("div", {class: "rs-grid v"}, vids.map(videoCard)) : null,
        !f.length ? (items.length ? h("div", {class: "empty"}, ic("search"), h("p", {}, "За вашим запитом нічого не знайдено.")) : (A ? empty("resources", "Додати матеріал", {section: s.id}) : null)) : null].filter(Boolean));
      more.replaceChildren(...(f.length > lim ? [focus
        ? h("button", {class: "btn", type: "button", onclick: () => {RS.lim[s.id] = lim + 12; paintGrid();}}, "Показати ще (" + (f.length - lim) + ")")
        : h("button", {class: "btn", type: "button", onclick: () => {RS.sel = s.id; paintTiles(); paintMain(); tiles.scrollIntoView({behavior: "smooth", block: "start"});}}, `Усі матеріали розділу (${f.length})`)] : []));
    }
    const inp = h("input", {type: "search", class: "wk-in", placeholder: `Пошук у розділі «${s.name}»…`, "aria-label": "Пошук у розділі " + s.name, maxlength: 100, value: RS.q[s.id] || "", oninput: e => {RS.q[s.id] = e.target.value; paintGrid();}});
    const sortSel = h("select", {class: "rs-sort", "aria-label": "Сортування", onchange: e => {RS.sort[s.id] = e.target.value; paintGrid();}},
      h("option", {value: "new"}, "Спочатку нові"), h("option", {value: "name"}, "За назвою"));
    sortSel.value = RS.sort[s.id] || "new";
    const pills = tags.length ? h("div", {class: "rs-pills", role: "group", "aria-label": "Теги"}, ["", ...tags].map(t => {
      const b = h("button", {type: "button", class: "wk-pill sm" + ((RS.tag[s.id] || "") === t ? " on" : ""), "aria-pressed": String((RS.tag[s.id] || "") === t), onclick: () => {RS.tag[s.id] = t; pills.querySelectorAll("button").forEach(x => {const on = x.dataset.v === t; x.classList.toggle("on", on); x.setAttribute("aria-pressed", String(on));}); paintGrid();}}, t || "Усі");
      b.dataset.v = t; return b;
    })) : null;
    const adm = A ? h("div", {class: "ds-adm rs-adm"},
      h("div", {class: "ds-mv"},
        h("button", {type: "button", class: "btn sm", "aria-label": "Перемістити розділ вище", disabled: i === 0, onclick: () => A.move("resSections", s, -1, secs)}, ic("up")),
        h("button", {type: "button", class: "btn sm", "aria-label": "Перемістити розділ нижче", disabled: i === secs.length - 1, onclick: () => A.move("resSections", s, 1, secs)}, ic("down"))),
      add("resources", "Додати матеріал", {section: s.id}), ab("resSections", s)) : null;
    paintGrid();
    return h("section", {class: "rs-sec card", id: "rs-" + s.id},
      h("div", {class: "rs-sh"}, h("span", {class: "ds-ci"}, ic(secIcon(s))),
        h("div", {class: "ds-cm"}, h("h2", {}, s.name), s.desc ? h("p", {class: "mu"}, s.desc) : null),
        !focus && secs.length > 1 && items.length ? h("button", {class: "rs-all", type: "button", onclick: () => {RS.sel = s.id; paintTiles(); paintMain(); tiles.scrollIntoView({behavior: "smooth", block: "start"});}}, "Усі " + s.name.toLowerCase(), ic("r")) : null),
      adm,
      items.length ? h("div", {class: "rs-tb"}, h("label", {class: "wk-search"}, ic("search"), inp), sortSel) : null, pills,
      grid, more);
  }

  function paintMain() {
    const list = RS.sel ? secs.filter(s => s.id === RS.sel) : secs;
    if (!secs.length) {content.replaceChildren(A ? empty("resSections", "Додати перший розділ") : h("div", {class: "empty"}, ic("book"), h("p", {}, "Матеріали ще не додано."))); return;}
    content.replaceChildren(...[...list.map(s => section(s, secs.indexOf(s))),
      RS.sel ? h("button", {class: "btn rs-back", type: "button", onclick: () => {RS.sel = ""; paintTiles(); paintMain(); tiles.scrollIntoView({behavior: "smooth", block: "start"});}}, ic("l"), "Усі матеріали") : null].filter(Boolean));
  }

  const side = h("div", {class: "rs-side"},
    h("aside", {class: "ds-side card"}, h("h2", {}, "Швидкий доступ"), h("ul", {},
      [["#disc_it", "globe", DISC.it.title, "Лекції, практичні та матеріали"], ["#disc_web", "layout", DISC.web.title, "Лекції, практичні та матеріали"], ["#schedule", "cal", "Розклад занять", "Коли і де проходять пари"], ["#lessons", "code", "Інтерактивні заняття", "Тест тижня та практика з кодом"]]
        .map(x => h("li", {}, h("a", {href: x[0]}, h("span", {class: "ds-qi"}, ic(x[1])), h("span", {class: "ds-qt"}, h("b", {}, x[2]), h("small", {}, x[3]))))))),
    h("aside", {class: "rs-quote"}, h("span", {class: "rs-qm", "aria-hidden": "true"}, "“"),
      h("p", {}, "Найкращий спосіб вчитися — це робити. Але хороші ресурси допомагають робити це ефективніше."),
      h("span", {class: "rs-qa"}, ic("star"), "Learn2Web")));

  paintTiles(); paintMain();
  return [hero, secs.length ? tiles : null, h("div", {class: "rs-layout"}, content, side)].filter(Boolean);
}
