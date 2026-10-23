/* Читач PDF для оголошень: сторінки документа малюються на canvas (pdf.js), тому працює і на телефоні.
   PDF зберігається в самому оголошенні як data-URL. */
const CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
let lib;
function loadLib() {
  if (lib) return lib;
  return lib = new Promise((ok, no) => {
    if (window.pdfjsLib) return ok(window.pdfjsLib);
    const s = document.createElement("script");
    s.src = CDN + "pdf.min.js";
    s.onload = () => {const l = window.pdfjsLib; l.GlobalWorkerOptions.workerSrc = CDN + "pdf.worker.min.js"; ok(l);};
    s.onerror = () => {lib = null; no(new Error("Не вдалося завантажити модуль читання PDF."));};
    document.head.appendChild(s);
  });
}
const bytes = url => {
  const b = atob(url.slice(url.indexOf(",") + 1)), a = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
  return a;
};
export const okPdf = u => /^data:application\/pdf;base64,/.test(u || "");

/* Повертає вузол-читач. h — функція створення елементів, ic — іконки. */
export function pdfViewer(h, ic, url, name) {
  const pages = h("div", {class: "pv-pages"}), status = h("div", {class: "pv-st", role: "status"}, h("span", {class: "spin"}), "Завантаження документа…");
  const blobUrl = URL.createObjectURL(new Blob([bytes(url)], {type: "application/pdf"}));
  const dl = h("a", {class: "pv-dl", href: blobUrl, download: (name || "document").replace(/\.pdf$/i, "") + ".pdf", title: "Завантажити PDF"}, ic("dl"), "Завантажити");
  const open = h("a", {class: "pv-dl ghost", href: blobUrl, target: "_blank", rel: "noopener", title: "Відкрити в новій вкладці"}, ic("ext"), "Нова вкладка");
  const root = h("div", {class: "pv"}, h("div", {class: "pv-bar"}, h("span", {class: "pv-n"}, ic("file"), h("b", {}, name || "Документ.pdf")), h("span", {class: "pv-a"}, open, dl)), h("div", {class: "pv-view"}, status, pages));
  (async () => {
    try {
      const l = await loadLib(), doc = await l.getDocument({data: bytes(url)}).promise, n = Math.min(doc.numPages, 40);
      const w = 900, dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (let i = 1; i <= n; i++) {
        const pg = await doc.getPage(i), v0 = pg.getViewport({scale: 1}), v = pg.getViewport({scale: w * dpr / v0.width});
        const c = h("canvas", {class: "pv-pg", "aria-label": `Сторінка ${i} з ${doc.numPages}`});
        c.width = Math.round(v.width); c.height = Math.round(v.height);
        await pg.render({canvasContext: c.getContext("2d"), viewport: v}).promise;
        pages.append(c); if (i === 1) status.remove();
      }
      if (doc.numPages > n) pages.append(h("p", {class: "pv-more"}, `Показано перші ${n} стор. із ${doc.numPages}. Завантажте файл, щоб прочитати повністю.`));
    } catch (e) {
      status.replaceChildren(h("span", {}, "Не вдалося показати документ. Скористайтеся кнопкою «Завантажити»."));
    }
  })();
  return root;
}

/* Перша сторінка PDF як картинка-обкладинка (jpeg data-URL). Результат кешується. */
const covers = new Map();
export function pdfCover(url, width = 560) {
  const k = url.length + ":" + url.slice(-64);
  if (!covers.has(k)) covers.set(k, (async () => {
    const l = await loadLib(), doc = await l.getDocument({data: bytes(url)}).promise, pg = await doc.getPage(1), v0 = pg.getViewport({scale: 1}), v = pg.getViewport({scale: width / v0.width});
    const c = document.createElement("canvas"); c.width = Math.round(v.width); c.height = Math.round(v.height);
    const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height);
    await pg.render({canvasContext: x, viewport: v}).promise;
    return c.toDataURL("image/jpeg", .82);
  })().catch(e => {covers.delete(k); throw e;}));
  return covers.get(k);
}
