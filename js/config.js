// Вставте дані зі свого проєкту Firebase (Project settings → Your apps → Web app)
export const firebaseConfig = {
  apiKey: "AIzaSyAsM2671BxcDMf8Jr6HrwhUpCeKvwaeGM0",
  authDomain: "portfolio-55d2e.firebaseapp.com",
  projectId: "portfolio-55d2e",
  appId: "1:614678111680:web:70425f98a6026ab05e1425"
};
// UID власниці (Authentication → Users → колонка «User UID»)
export const OWNER_UID = "x3HxqzCj41cdDOy2aTF2MUaBeGH2";

// ---- ШІ (Google Gemini, лише для кабінету) ----
// Адреса вашого проксі (Cloudflare Worker, див. worker/ai-proxy.js та ШІ.md). Якщо порожньо — ключ вводиться в кабінеті.
export const AI_PROXY_URL = "";
// Модель. Якщо вичерпується ліміт — спробуйте "gemini-3.5-flash-lite". Актуальні назви: aistudio.google.com
export const AI_MODEL = "gemini-3.8-flash";
// Запасні моделі: якщо основна перевантажена або вичерпала ліміт, програма автоматично пробує наступну.
export const AI_FALLBACK = ["gemini-3.5-flash-lite", "gemini-3.6-flash"];
