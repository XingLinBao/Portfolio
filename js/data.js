import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const MONTHS = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];
export const COLS = [
  "education",
  "subjects",
  "certificates",
  "publications",
  "studentArticles",
  "events",
  "awards",
];
const Y = { k: "year", l: "Рік", t: "year", req: 1 },
  PH = { k: "photos", l: "Фото (до 6, перше — обкладинка)", t: "photos" },
  LK = {
    k: "link",
    l: "Посилання",
    t: "url",
    hint: "У Google Диску: «Доступ» → «Усі, хто має посилання» → «Читач». Лише https://",
  };
const sel = (k, l, opts) => ({ k, l, t: "select", opts, req: 1 });
export const SCHEMA = {
  education: {
    label: "освіту",
    f: [
      {
        k: "degree",
        l: "Ступінь або спеціальність",
        req: 1,
        ph: "Магістр, спеціальність «Педагогіка вищої школи»",
      },
      { k: "place", l: "Заклад", req: 1 },
      Y,
    ],
  },
  subjects: {
    label: "предмет",
    f: [{ k: "name", l: "Назва предмета", req: 1 }],
  },
  certificates: {
    label: "сертифікат",
    f: [
      { k: "title", l: "Назва", req: 1 },
      { k: "org", l: "Організація", req: 1 },
      { k: "my", t: "my", l: "Дата отримання", req: 1 },
      { k: "hours", l: "Кількість годин", t: "number" },
      PH,
      LK,
    ],
  },
  publications: {
    label: "публікацію",
    f: [
      { k: "title", l: "Назва", req: 1 },
      sel("type", "Тип", [
        "Стаття",
        "Монографія",
        "Збірник наукових праць",
        "Методична розробка",
        "Посібник",
      ]),
      { k: "publisher", l: "Видавництво або збірник" },
      Y,
      PH,
      LK,
    ],
  },
  studentArticles: {
    label: "статтю студента",
    f: [
      { k: "student", l: "ПІБ студента", req: 1 },
      Y,
      { k: "title", l: "Назва", req: 1 },
      { k: "venue", l: "Видання" },
      {
        k: "award",
        l: "Нагорода (необов’язково)",
        ph: "І місце на конференції",
      },
      PH,
      LK,
    ],
  },
  events: {
    label: "захід",
    f: [
      { k: "title", l: "Назва", req: 1 },
      sel("type", "Тип", [
        "Екскурсія",
        "Конференція",
        "Форум",
        "Олімпіада",
        "Інше",
      ]),
      { k: "my", t: "my", l: "Дата", req: 1 },
      { k: "count", l: "Кількість учасників", t: "number" },
      PH,
      LK,
    ],
  },
  awards: {
    label: "нагороду",
    f: [
      { k: "title", l: "Назва", req: 1 },
      { k: "desc", l: "Опис", t: "textarea" },
      sel("type", "Тип", [
        "Почесна грамота",
        "Подяка",
        "Диплом",
        "Сертифікат",
        "Інше",
      ]),
      Y,
      PH,
      LK,
    ],
  },
};
export const cache = { loaded: false, profile: {} };
export async function load(force) {
  if (cache.loaded && !force) return cache;
  const [p, ...r] = await Promise.all([
    getDoc(doc(db, "profile", "main")),
    ...COLS.map((c) => getDocs(collection(db, c))),
  ]);
  cache.profile = p.exists() ? p.data() : {};
  COLS.forEach(
    (c, i) => (cache[c] = r[i].docs.map((d) => ({ id: d.id, ...d.data() }))),
  );
  cache.loaded = true;
  return cache;
}
export async function saveRec(col, id, data) {
  cache.loaded = false;
  if (id) {
    await updateDoc(doc(db, col, id), data);
    return id;
  }
  return (await addDoc(collection(db, col), { ...data, createdAt: Date.now() }))
    .id;
}
export async function delRec(col, id) {
  cache.loaded = false;
  await deleteDoc(doc(db, col, id));
}
export async function saveProfile(d) {
  cache.loaded = false;
  await setDoc(doc(db, "profile", "main"), d, { merge: true });
}
