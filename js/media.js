// Допоміжні функції: розпізнавання відео (прев’ю, програвач) та типів файлів за посиланням.

const ytMax = id => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
const ytMq = id => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

/** Повертає опис відео або null, якщо посилання не схоже на відео. */
export function parseVideo(url) {
  url = String(url || "").trim();
  let m;
  if ((m = url.match(/^https:\/\/(?:www\.|m\.|music\.)?youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)([\w-]{11})/)) ||
      (m = url.match(/^https:\/\/youtu\.be\/([\w-]{11})/))) {
    const id = m[1];
    return { kind: "youtube", id, thumbs: [ytMax(id), ytMq(id)], embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` };
  }
  if ((m = url.match(/^https:\/\/(?:www\.)?vimeo\.com\/(?:[^?#]*\/)?(\d{5,})/)) ||
      (m = url.match(/^https:\/\/player\.vimeo\.com\/video\/(\d+)/))) {
    const id = m[1];
    return { kind: "vimeo", id, thumbs: [], oembed: `https://vimeo.com/api/oembed.json?url=${encodeURIComponent("https://vimeo.com/" + id)}`, embed: `https://player.vimeo.com/video/${id}?autoplay=1` };
  }
  if ((m = url.match(/^https:\/\/drive\.google\.com\/file\/d\/([\w-]+)/))) {
    const id = m[1];
    return { kind: "drive", id, thumbs: [`https://drive.google.com/thumbnail?id=${id}&sz=w640`], embed: `https://drive.google.com/file/d/${id}/preview` };
  }
  if (/^https:\/\/[^\s?#]+\.(mp4|webm|ogv)(\?[^\s#]*)?$/i.test(url)) {
    return { kind: "file", thumbs: [], src: url };
  }
  return null;
}

/**
 * Підставляє прев’ю відео в <img>. Якщо прев’ю отримати неможливо — викликає onFail.
 * Для YouTube береться велике зображення, а якщо його немає — менше; для Vimeo прев’ю запитується в сервісу oEmbed.
 */
export function setThumb(img, url, onFail) {
  const v = parseVideo(url);
  if (!v || (!v.thumbs.length && !v.oembed)) { if (onFail) onFail(); return; }
  const chain = [...v.thumbs];
  const next = () => { const s = chain.shift(); if (!s) { if (onFail) onFail(); return; } img.src = s; };
  img.onerror = next;
  img.onload = () => { if (img.naturalWidth && img.naturalWidth <= 160 && chain.length) next(); };
  if (v.oembed) {
    fetch(v.oembed).then(r => r.json()).then(j => { if (j && j.thumbnail_url) chain.unshift(String(j.thumbnail_url).replace(/_\d+x\d+/, "_640")); next(); })
      .catch(() => { if (onFail) onFail(); });
  } else next();
}

const EXT = { pdf: "PDF", doc: "Word", docx: "Word", ppt: "PowerPoint", pptx: "PowerPoint", xls: "Excel", xlsx: "Excel", zip: "ZIP", rar: "RAR", "7z": "7Z", txt: "TXT", epub: "EPUB", odt: "ODT", csv: "CSV" };
const GDOC = { document: ["Документ", "pdf"], presentation: ["Презентація", "pdf"], spreadsheets: ["Таблиця", "xlsx"] };

/** Формат файлу (для позначки) і пряме посилання для завантаження, якщо його можна визначити. */
export function fileInfo(url, ftype) {
  let label = "", dl = "", u;
  try { u = new URL(url); } catch (e) { return { label: ftype || "", dl: "" }; }
  const ext = (u.pathname.toLowerCase().match(/\.([a-z0-9]{2,5})$/) || [])[1] || "";
  label = EXT[ext] || "";
  let m;
  if (u.hostname === "drive.google.com") {
    const id = ((u.pathname.match(/\/file\/d\/([\w-]+)/) || [])[1]) || u.searchParams.get("id");
    if (id) dl = `https://drive.google.com/uc?export=download&id=${id}`;
  } else if (u.hostname === "docs.google.com" && (m = u.pathname.match(/^\/(document|presentation|spreadsheets)\/d\/([\w-]+)/))) {
    label = label || GDOC[m[1]][0];
    dl = `https://docs.google.com/${m[1]}/d/${m[2]}/export?format=${GDOC[m[1]][1]}`;
  } else if (EXT[ext]) dl = url;
  if (ftype) label = ftype;
  return { label, dl };
}

export const okUrl = u => /^https:\/\/\S+$/.test(u || "");
export const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };

/** Тип матеріалу: video | book | link | tool. Якщо не вказано — визначається за посиланням. */
export function resType(r) {
  if (r.type) return r.type;
  const v = parseVideo(r.link);
  if (v && v.kind !== "drive") return "video";
  return fileInfo(r.link).dl || (v && v.kind === "drive") ? "book" : "link";
}

/**
 * Дані для вбудованого перегляду документа та прев’ю першої сторінки.
 * Повертає {embed, thumb}: embed — адреса для iframe, thumb — адреса картинки-прев’ю (може бути порожньою).
 */
export function docView(url) {
  let u;
  try { u = new URL(url); } catch (e) { return { embed: "", thumb: "" }; }
  let m;
  if (u.hostname === "drive.google.com") {
    const id = ((u.pathname.match(/\/file\/d\/([\w-]+)/) || [])[1]) || u.searchParams.get("id");
    if (id) return { embed: `https://drive.google.com/file/d/${id}/preview`, thumb: `https://drive.google.com/thumbnail?id=${id}&sz=w500` };
  }
  if (u.hostname === "docs.google.com" && (m = u.pathname.match(/^\/(document|presentation|spreadsheets)\/d\/([\w-]+)/))) {
    const id = m[2];
    return { embed: `https://docs.google.com/${m[1]}/d/${id}/${m[1] === "presentation" ? "embed" : "preview"}`, thumb: `https://drive.google.com/thumbnail?id=${id}&sz=w500` };
  }
  const ext = (u.pathname.toLowerCase().match(/\.([a-z0-9]{2,5})$/) || [])[1] || "";
  if (ext === "pdf") return { embed: url, thumb: "" };
  if (["doc", "docx", "ppt", "pptx", "xls", "xlsx", "odt"].includes(ext)) return { embed: `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(url)}`, thumb: "" };
  return { embed: "", thumb: "" };
}
