import { h } from "./render.js";
import {
  SCHEMA,
  saveRec,
  delRec,
  saveProfile,
  load,
  cache,
  COLS,
} from "./data.js";
import {
  openModal,
  buildForm,
  recordModal,
  toast,
  PROFILE_FIELDS,
} from "./modal.js";
const pf = (ks) => PROFILE_FIELDS.filter((f) => ks.includes(f.k));
export async function runWizard(onDone, from) {
  await load(true);
  let n = Math.min(Math.max(from || cache.profile.wizardStep || 1, 1), 7) - 1,
    cur;
  const wrap = h("div"),
    prog = h("div", { class: "prog" }, h("div")),
    lab = h("div", { class: "mu s" });
  const m = openModal({
    title: "Майстер налаштування",
    persistent: true,
    wide: true,
    content: h("div", {}, lab, prog, wrap),
  });
  const CH = [
    ["certificates", "Маю сертифікати"],
    ["publications", "Маю публікації"],
    ["studentArticles", "Працюю зі студентами"],
    ["awards", "Маю нагороди"],
  ];
  const steps = [
    {
      t: "Вітаємо! Основне",
      hint: "Ці дані з’являться на головній сторінці. Приклад: Іванова Олена Петрівна, викладач педагогічних дисциплін.",
      build() {
        const f = buildForm(
          pf(["fullName", "position", "institution", "photo"]),
          cache.profile,
        );
        return {
          node: f.el,
          async commit() {
            const e = f.validate();
            if (e) {
              toast(e, "err");
              return false;
            }
            await saveProfile(await f.finalData());
            return true;
          },
        };
      },
    },
    {
      t: "Контакти",
      hint: "Email і телефон стануть активними посиланнями.",
      build() {
        const f = buildForm(pf(["email", "phone", "address"]), cache.profile);
        return {
          node: f.el,
          async commit() {
            const e = f.validate();
            if (e) {
              toast(e, "err");
              return false;
            }
            await saveProfile(f.get());
            return true;
          },
        };
      },
    },
    {
      t: "Про мене",
      hint: "Приклад: Викладач вищої категорії з 15-річним стажем. Керую науковими роботами студентів, впроваджую інноваційні методики.",
      build() {
        const f = buildForm(pf(["about"]), cache.profile);
        return {
          node: f.el,
          async commit() {
            await saveProfile(f.get());
            return true;
          },
        };
      },
    },
    {
      t: "Освіта",
      hint: "Додайте один чи кілька записів. Приклад: Магістр, спеціальність «Педагогіка вищої школи».",
      build() {
        let f = buildForm(SCHEMA.education.f),
          added = cache.education.length;
        const box = h("div"),
          info = h("p", { class: "mu s" }, "Додано записів: " + added);
        const mk = () => {
          f = buildForm(SCHEMA.education.f);
          box.replaceChildren(f.el);
        };
        mk();
        const saveOne = async () => {
          const e = f.validate();
          if (e) {
            toast(e, "err");
            return false;
          }
          await saveRec("education", null, f.get());
          added++;
          info.textContent = "Додано записів: " + added;
          return true;
        };
        const more = h(
          "button",
          {
            class: "btn sm",
            onclick: async () => {
              if (await saveOne()) {
                mk();
                toast("Запис додано");
              }
            },
          },
          "Додати ще",
        );
        return {
          node: h("div", {}, box, more, info),
          async commit() {
            return f.dirty() ? saveOne() : true;
          },
        };
      },
    },
    {
      t: "Предмети",
      hint: "Вводьте по одному й натискайте Enter або «Додати».",
      build() {
        let L = [...cache.subjects];
        const tags = h("div", { class: "tags" }),
          inp = h("input", {
            placeholder: "Наприклад: Педагогіка",
            "aria-label": "Назва предмета",
            maxlength: 200,
          });
        const draw = () =>
          tags.replaceChildren(
            ...L.map((s) =>
              h(
                "span",
                { class: "subj" },
                s.name,
                h(
                  "button",
                  {
                    class: "tx",
                    "aria-label": "Видалити " + s.name,
                    onclick: async () => {
                      await delRec("subjects", s.id);
                      L = L.filter((x) => x !== s);
                      draw();
                    },
                  },
                  "✕",
                ),
              ),
            ),
          );
        const add = async () => {
          const v = inp.value.trim();
          if (!v) return;
          const id = await saveRec("subjects", null, { name: v });
          L.push({ id, name: v });
          inp.value = "";
          draw();
          inp.focus();
        };
        inp.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        });
        draw();
        return {
          node: h(
            "div",
            {},
            h(
              "div",
              { class: "urlrow" },
              inp,
              h("button", { class: "btn sm primary", onclick: add }, "Додати"),
            ),
            tags,
          ),
          async commit() {
            await add();
            return true;
          },
        };
      },
    },
    {
      t: "Інші розділи",
      hint: "Позначте, що є в портфоліо. Для кожного пункту відкриється форма першого запису. Решта розділів лишаться порожніми й прихованими на сайті.",
      build() {
        const bx = CH.map(([c, l]) =>
          h("input", { type: "checkbox", id: "c_" + c }),
        );
        return {
          node: h(
            "div",
            { class: "checks" },
            CH.map(([c, l], i) => h("label", { class: "chk" }, bx[i], l)),
          ),
          async commit() {
            for (let i = 0; i < CH.length; i++)
              if (bx[i].checked) await recordModal(CH[i][0], null);
            return true;
          },
        };
      },
    },
    {
      t: "Готово",
      build() {
        const L = {
          education: "Освіта",
          subjects: "Предмети",
          certificates: "Сертифікати",
          publications: "Публікації",
          studentArticles: "Статті студентів",
          events: "Заходи",
          awards: "Нагороди",
        };
        return {
          node: h(
            "div",
            {},
            h("p", {}, "Налаштування завершено. Заповнено:"),
            h(
              "ul",
              { class: "sum" },
              COLS.map((c) =>
                h("li", {}, L[c] + ": " + (cache[c] || []).length),
              ),
            ),
            h(
              "p",
              { class: "mu s" },
              "Заходи й інші записи можна додавати в кабінеті кнопками «+ Додати».",
            ),
          ),
          final: true,
        };
      },
    },
  ];
  function show() {
    cur = steps[n].build();
    const s = steps[n];
    lab.textContent = `Крок ${n + 1} з 7 — ${s.t}`;
    prog.firstChild.style.width = ((n + 1) / 7) * 100 + "%";
    const go = async (skip) => {
      nxt.disabled = true;
      try {
        if (!skip && !(await cur.commit())) {
          nxt.disabled = false;
          return;
        }
        if (cur.final) {
          await saveProfile({ setupDone: true, wizardStep: 7 });
          await load(true);
          m.close(true);
          if (onDone) await onDone();
          return;
        }
        n++;
        await saveProfile({ wizardStep: n + 1 });
        await load(true);
        show();
      } catch (e) {
        toast("Не вдалося зберегти: " + (e.message || e), "err");
        nxt.disabled = false;
      }
    };
    const nxt = h(
      "button",
      { class: "btn primary", onclick: () => go(false) },
      cur.final ? "Перейти в кабінет" : "Далі",
    );
    const fin = cur.final
      ? h(
          "a",
          {
            class: "btn",
            href: "index.html",
            target: "_blank",
            rel: "noopener",
          },
          "Переглянути сайт",
        )
      : null;
    wrap.replaceChildren(
      s.hint ? h("p", { class: "hint" }, s.hint) : null,
      cur.node,
      h(
        "div",
        { class: "mf inl" },
        h(
          "button",
          { class: "btn ghost", onclick: () => m.close(true) },
          "Закрити (прогрес збережено)",
        ),
        n > 0
          ? h(
              "button",
              {
                class: "btn",
                onclick: () => {
                  n--;
                  show();
                },
              },
              "Назад",
            )
          : null,
        fin,
        !cur.final
          ? h(
              "button",
              { class: "btn", onclick: () => go(true) },
              "Пропустити крок",
            )
          : null,
        nxt,
      ),
    );
  }
  show();
}
