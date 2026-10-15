import { h } from "./render.js";
const LIMIT = 800 * 1024;
const sz = (s) => Math.round((s.length - s.indexOf(",") - 1) * 0.75);
function toData(src, max, q) {
  return new Promise((ok, no) => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height)),
        c = document.createElement("canvas");
      c.width = Math.round(im.width * k);
      c.height = Math.round(im.height * k);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      let d = c.toDataURL("image/webp", q);
      if (!d.startsWith("data:image/webp")) d = c.toDataURL("image/jpeg", q);
      ok(d);
    };
    im.onerror = () => no(new Error("Не вдалося прочитати зображення"));
    im.src = src;
  });
}
const read = (f) =>
  new Promise((ok, no) => {
    const r = new FileReader();
    r.onload = () => ok(r.result);
    r.onerror = () => no(new Error("Помилка читання файлу"));
    r.readAsDataURL(f);
  });
export async function compress(file, max = 1200, q = 0.75) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type))
    throw new Error("Дозволені формати: jpg, png, webp");
  return toData(await read(file), max, q);
}
export function photoField(
  init = [],
  { single = false, max = 6, maxSide = 1200, limit = LIMIT } = {},
) {
  let L = [...init];
  const grid = h("div", { class: "pgrid" }),
    info = h("div", { class: "psize", role: "status" }),
    msg = h("div", { class: "pmsg", role: "alert" });
  const inp = h("input", {
    type: "file",
    accept: "image/jpeg,image/png,image/webp",
    multiple: !single,
    class: "sr",
  });
  const total = () => L.reduce((a, s) => a + sz(s), 0);
  const mv = (i, d) => {
    const j = i + d;
    [L[i], L[j]] = [L[j], L[i]];
    draw();
  };
  function draw() {
    grid.replaceChildren(
      ...L.map((s, i) =>
        h(
          "div",
          { class: "pth" },
          h("img", { src: s, alt: "Фото " + (i + 1) }),
          !single && i === 0
            ? h("span", { class: "cover" }, "Обкладинка")
            : null,
          h(
            "div",
            { class: "pact" },
            i > 0
              ? h(
                  "button",
                  {
                    type: "button",
                    "aria-label": "Перемістити ліворуч",
                    onclick: () => mv(i, -1),
                  },
                  "‹",
                )
              : null,
            i < L.length - 1
              ? h(
                  "button",
                  {
                    type: "button",
                    "aria-label": "Перемістити праворуч",
                    onclick: () => mv(i, 1),
                  },
                  "›",
                )
              : null,
            h(
              "button",
              {
                type: "button",
                "aria-label": "Видалити фото",
                onclick: () => {
                  L.splice(i, 1);
                  draw();
                },
              },
              "✕",
            ),
          ),
        ),
      ),
    );
    const t = total();
    info.textContent = `Розмір: ≈ ${Math.round(t / 1024)} КБ із ${Math.round(limit / 1024)} КБ`;
    info.classList.toggle("warn", t > limit);
  }
  inp.addEventListener("change", async () => {
    msg.textContent = "";
    for (const f of [...inp.files]) {
      if (single) L = [];
      else if (L.length >= max) {
        msg.textContent = `Максимум ${max} фото.`;
        break;
      }
      try {
        L.push(await compress(f, maxSide));
      } catch (e) {
        msg.textContent = e.message;
      }
    }
    inp.value = "";
    draw();
  });
  const pick = h(
    "label",
    { class: "btn sm pick" },
    single ? "Обрати фото" : "Додати фото",
    inp,
  );
  draw();
  return {
    el: h(
      "div",
      { class: "pf" },
      grid,
      h("div", { class: "prow" }, pick, info),
      msg,
    ),
    get: () => (single ? L[0] || "" : L),
    async finalize() {
      const st = [
        [1000, 0.65],
        [800, 0.55],
        [640, 0.45],
      ];
      let p = 0;
      while (total() > limit && p < st.length) {
        L = await Promise.all(L.map((s) => toData(s, st[p][0], st[p][1])));
        p++;
      }
      if (total() > limit)
        throw new Error(
          "Фото завеликі навіть після стискання. Зменште їх кількість.",
        );
      draw();
      return single ? L[0] || "" : L;
    },
  };
}
