// ШІ-генерація тестів і практичних завдань на Google Gemini (лише для кабінету).
// Два режими:
//  1) AI_PROXY_URL заданий у config.js → запит іде на ваш проксі (Cloudflare Worker), ключ лишається на сервері. РЕКОМЕНДОВАНО.
//  2) AI_PROXY_URL порожній → ключ Gemini вводиться в кабінеті й зберігається лише в цьому браузері (localStorage).
import {getAuth} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {app} from "./data.js";
import {AI_PROXY_URL,AI_MODEL} from "./config.js";
import {validateTask,checkProblem} from "./validator.js";

const KEY="ai:geminiKey",API="https://generativelanguage.googleapis.com/v1beta/models/";
const tidy=k=>String(k||"").replace(/[\s"'`]/g,"");
export const usesProxy=()=>!!AI_PROXY_URL;
export const getKey=()=>{try{return tidy(localStorage.getItem(KEY));}catch(e){return "";}};
export const setKey=k=>{k=tidy(k);try{k?localStorage.setItem(KEY,k):localStorage.removeItem(KEY);}catch(e){}};
export const aiReady=()=>usesProxy()||!!getKey();
const model=()=>AI_MODEL||"gemini-3.8-flash";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

// ---------- Транспорт ----------
// Основний формат структурованої відповіді (REST: generationConfig.responseFormat). Якщо API його не прийме — запасний (responseJsonSchema).
function reqBody({system,user,schema,maxTokens},legacy){
  const gc={maxOutputTokens:Math.min(32000,maxTokens*2),temperature:0.7};
  if(legacy){gc.responseMimeType="application/json";gc.responseJsonSchema=schema;}
  else gc.responseFormat={text:{mimeType:"APPLICATION_JSON",schema}};
  return {systemInstruction:{parts:[{text:system}]},contents:[{role:"user",parts:[{text:user}]}],generationConfig:gc};
}
async function send(body){
  if(usesProxy()){
    const token=await getAuth(app).currentUser.getIdToken();
    return fetch(AI_PROXY_URL,{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+token},body:JSON.stringify({model:model(),request:body})});
  }
  if(!getKey())throw new Error("Не вказано ключ Gemini API");
  return fetch(API+encodeURIComponent(model())+":generateContent",{method:"POST",headers:{"content-type":"application/json","x-goog-api-key":getKey()},body:JSON.stringify(body)});
}
async function request(args,legacy){
  let res,data;
  for(let n=0;;n++){
    try{res=await send(reqBody(args,legacy));}catch(e){throw new Error("Немає зв’язку з ШІ: "+(e.message||e));}
    data=await res.json().catch(()=>({}));
    if((res.status===429||res.status===503)&&n<2){await sleep(res.status===429?20000:3000);continue;}
    break;
  }
  return {res,data};
}
async function call({system,user,tool,maxTokens=8000}){
  const args={system,user,schema:tool.input_schema,maxTokens};
  let {res,data}=await request(args,false);
  if(res.status===400&&!/API key|api_key/i.test(JSON.stringify(data)))({res,data}=await request(args,true));
  if(!res.ok){
    const m=(data.error&&(data.error.message||data.error))||res.statusText;
    if(res.status===400&&/API key/i.test(m))throw new Error("Ключ Gemini API недійсний");
    if(res.status===401||res.status===403){const k=getKey();throw new Error("Доступ заборонено ("+res.status+"). "+(usesProxy()?"":(k.length<40?"Ключ надто короткий — схоже, він скопійований не повністю. Скопіюйте його кнопкою «Copy key». ":"Перевірте, що ключ скопійовано повністю. "))+"Відповідь Google: "+String(m).slice(0,200));}
    if(res.status===429)throw new Error("Вичерпано ліміт безкоштовного тарифу (хвилинний або добовий). Зачекайте або спробуйте пізніше");
    if(res.status===503)throw new Error("Сервери Gemini перевантажені — спробуйте за кілька хвилин");
    if(res.status===404)throw new Error("Модель «"+model()+"» недоступна. Змініть AI_MODEL у js/config.js");
    throw new Error("Помилка ШІ ("+res.status+"): "+m);
  }
  if(data.promptFeedback&&data.promptFeedback.blockReason)throw new Error("Запит заблоковано фільтром безпеки — переформулюйте тему");
  const cand=(data.candidates||[])[0];
  if(!cand)throw new Error("ШІ не повернув результат — спробуйте ще раз");
  if(cand.finishReason==="MAX_TOKENS")throw new Error("Відповідь обірвалась — зменште кількість елементів");
  const text=((cand.content&&cand.content.parts)||[]).filter(p=>!p.thought&&typeof p.text==="string").map(p=>p.text).join("").trim();
  try{return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g,""));}
  catch(e){throw new Error("ШІ повернув некоректну відповідь — спробуйте ще раз");}
}

// ---------- Схеми ----------
const STR={type:"string"};
const QUESTION={type:"object",additionalProperties:false,
  required:["title","type","explain"],
  properties:{
    title:{...STR,description:"Текст запитання українською, до 300 символів"},
    type:{type:"string",enum:["single","multi","match"]},
    code:{...STR,description:"Короткий фрагмент коду до запитання (необов’язково, до 300 символів)"},
    opts:{type:"array",description:"Для single/multi: 3–5 варіантів. Для single рівно один ok=true, для multi — щонайменше один, але не всі.",
      items:{type:"object",additionalProperties:false,required:["t","ok"],properties:{t:STR,ok:{type:"boolean"}}}},
    pairs:{type:"array",description:"Для match: 3–5 пар (l — пункт, r — відповідність). Праві частини мають бути різними.",
      items:{type:"object",additionalProperties:false,required:["l","r"],properties:{l:STR,r:STR}}},
    explain:{...STR,description:"Пояснення правильної відповіді, 1–2 речення"}}};
const CHECK={type:"object",required:["type"],properties:{
  type:{type:"string",enum:["exists","text","attr","style","code","output","fn","js"]},
  label:{...STR,description:"Назва пункту для студента, напр. «Є заголовок h1»"},
  msg:{...STR,description:"Підказка, якщо не виконано"},
  sel:STR,min:{type:"integer"},max:{type:"integer"},val:STR,exact:{type:"boolean"},all:{type:"boolean"},
  attr:STR,prop:STR,file:{type:"string",enum:["html","css","js"]},not:{type:"boolean"},
  name:STR,args:{...STR,description:"JSON-масив аргументів, напр. [2,3]"},expect:{...STR,description:"JSON-значення, напр. 5 або \"текст\""},
  body:{...STR,description:"Для type=js: тіло функції (document, window, output, src), що повертає true/false"}}};
const TASK={type:"object",additionalProperties:false,required:["title","desc","html","css","js","edit","hint","sol","checks"],
  properties:{
    title:{...STR,description:"Коротка назва завдання"},
    desc:{...STR,description:"Умова: абзаци через порожній рядок, список — рядки з «- », код у зворотних лапках"},
    html:STR,css:STR,js:STR,
    edit:{type:"array",items:{type:"string",enum:["html","css","js"]},description:"Які частини редагує студент"},
    hint:STR,
    sol:{type:"object",additionalProperties:false,required:["html","css","js"],properties:{html:STR,css:STR,js:STR},description:"Повний еталонний розв’язок (кожна частина, навіть якщо порожня)"},
    checks:{type:"array",items:CHECK,description:"3–6 перевірок, які ПРОХОДИТЬ розв’язок"}}};

export const QUIZ_TOOL={name:"save_quiz",description:"Зберегти згенеровані запитання тесту",
  input_schema:{type:"object",additionalProperties:false,required:["questions"],properties:{questions:{type:"array",items:QUESTION}}}};
export const TASKS_TOOL={name:"save_tasks",description:"Зберегти згенеровані практичні завдання",
  input_schema:{type:"object",additionalProperties:false,required:["tasks"],properties:{
    topicTitle:{...STR,description:"Назва теми"},topicDesc:{...STR,description:"Опис теми, 1 речення"},tasks:{type:"array",items:TASK}}}};

// ---------- Очищення й перевірка даних (відповідає правилам firestore.rules) ----------
const cut=(s,n)=>String(s==null?"":s).trim().slice(0,n);
export function cleanQuestion(q,topic){
  const type=["single","multi","match"].includes(q.type)?q.type:"single";
  const o={title:cut(q.title,1000),topic,type,code:cut(q.code,3000),explain:cut(q.explain,2000),opts:[],pairs:[]};
  if(type==="match"){
    o.pairs=(q.pairs||[]).filter(p=>p&&cut(p.l,1)&&cut(p.r,1)).slice(0,8).map(p=>({l:cut(p.l,200),r:cut(p.r,200)}));
    if(o.pairs.length<2)return null;
    if(new Set(o.pairs.map(p=>p.r)).size!==o.pairs.length)return null;
  }else{
    o.opts=(q.opts||[]).filter(x=>x&&cut(x.t,1)).slice(0,8).map(x=>({t:cut(x.t,300),ok:!!x.ok}));
    const n=o.opts.filter(x=>x.ok).length;
    if(o.opts.length<2||n<1)return null;
    if(type==="single"&&n!==1)return null;
    if(type==="multi"&&n===o.opts.length)return null;
  }
  return o.title?o:null;
}

// ---------- Генерація тесту ----------
export async function generateQuiz({topic,count,level,types,theme}){
  const LN={html:"HTML",css:"CSS",js:"JavaScript"}[topic];
  const system="Ти — досвідчений викладач веб-технологій у виші. Складаєш тестові запитання для студентів-початківців. Пишеш українською, коротко й однозначно. Не вигадуй неіснуючих тегів, властивостей чи методів. Кожне запитання має лише одну однозначно правильну відповідь (або чітко визначений набір для multi). Хибні варіанти — правдоподібні типові помилки, а не абсурд. Правильні відповіді розташовуй у різному порядку.";
  const user=`Склади ${count} запитань з теми ${LN}${theme?`: «${theme}»`:""}.\nРівень: ${level}.\nДозволені типи запитань: ${types.join(", ")} (single — одна відповідь, multi — кілька, match — співставлення). Розподіли типи різноманітно.\nДо кожного запитання додай пояснення.`;
  const r=await call({system,user,tool:QUIZ_TOOL,maxTokens:Math.min(16000,1200+count*600)});
  return (r.questions||[]).map(q=>cleanQuestion(q,topic)).filter(Boolean);
}

// ---------- Генерація практичних завдань + самоперевірка валідатором ----------
export function cleanTask(t,lang){
  const edit=(t.edit||[]).filter(k=>["html","css","js"].includes(k));
  const checks=(t.checks||[]).map(c=>{const o={};Object.entries(c||{}).forEach(([k,v])=>{if(v!==""&&v!=null&&v!==false)o[k]=v;});return o;});
  return {id:"t"+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
    title:cut(t.title,200),desc:cut(t.desc,4000),html:t.html||"",css:t.css||"",js:t.js||"",
    edit:edit.length?edit:[lang],hint:cut(t.hint,1000),
    sol:{html:(t.sol&&t.sol.html)||"",css:(t.sol&&t.sol.css)||"",js:(t.sol&&t.sol.js)||""},showSol:true,checks};
}

// Запускає розв’язок через валідатор. Повертає null, якщо все гаразд, або текст проблеми.
export async function selfCheck(frame,task){
  for(const [i,c] of task.checks.entries()){const p=checkProblem(c);if(p)return `Перевірка ${i+1}: ${p}`;}
  if(!task.checks.length)return "Немає жодної перевірки";
  const sol=task.sol;
  if(!["html","css","js"].some(k=>sol[k].trim()))return "Порожній розв’язок";
  const files={html:sol.html||task.html,css:sol.css||task.css,js:sol.js||task.js};
  const r=await validateTask(frame,files,{checks:task.checks,edit:["html","css","js"].filter(k=>sol[k].trim())});
  if(r.pass)return null;
  const bad=[...r.syntax.filter(s=>!s.warn).map(s=>`${s.lang}${s.line?` (рядок ${s.line})`:""}: ${s.msg}`),...r.items.filter(i=>!i.ok).map(i=>`не пройдено «${i.label}»`)];
  return bad.join("; ");
}

const TASK_SYSTEM=`Ти — викладач веб-технологій, що створює інтерактивні практичні завдання для студентів-початківців. Українською.
Як працює платформа: студент бачить умову та початковий код (html/css/js) і редагує дозволені частини (edit). Його код запускається в ізольованому iframe, після чого перевіряється правилами checks.
Правила:
- html — лише вміст <body> (без <html>, <head>, <body>), css — без <style>, js — без <script>.
- Початковий код: заготовка з пропусками або коментарями «// ваш код тут»; не містить готової відповіді.
- sol — повний робочий розв’язок: в кожній частині (html/css/js) повний код, який ЗАМІНЮЄ початковий. Розв’язок обов’язково проходить усі checks.
- checks: 3–6 перевірок різних типів. Типи: exists(sel,min,max), text(sel,val,exact,all), attr(sel,attr,val,all), style(sel,prop,val: обчислене значення, напр. color → rgb(255, 0, 0)), code(file,val,not), output(val: текст console.log), fn(name,args — JSON-масив,expect — JSON), js(body).
- Для style використовуй обчислені значення: кольори у форматі rgb(r, g, b), розміри в px.
- Перевірки не мають залежати від порядку пробілів. Кожній додай зрозумілі label та msg українською.
- Складність наростає від першого завдання до останнього. Одне завдання — одна ідея.`;

export async function generateTasks({lang,theme,count,level,onProgress}){
  const LN={html:"HTML",css:"CSS",js:"JavaScript"}[lang];
  const user=`Тема: «${theme}». Мова: ${LN}. Кількість завдань: ${count}. Рівень: ${level}.\n`+
    (lang==="html"?"Студент редагує html.":lang==="css"?"html уже готовий і недоступний для редагування (edit=[\"css\"]); студент пише css.":"Студент редагує js (за потреби html — заготовка з елементами, недоступна для редагування).");
  const r=await call({system:TASK_SYSTEM,user,tool:TASKS_TOOL,maxTokens:Math.min(16000,1500+count*2500)});
  return {title:cut(r.topicTitle,300),desc:cut(r.topicDesc,1000),tasks:(r.tasks||[]).map(t=>cleanTask(t,lang))};
}

// Одна спроба виправлення: передаємо ШІ завдання та помилку валідатора.
export async function repairTask(task,problem,lang){
  const user=`Це завдання не пройшло автоматичну перевірку. Проблема: ${problem}\n\nЗавдання (JSON):\n${JSON.stringify({title:task.title,desc:task.desc,html:task.html,css:task.css,js:task.js,edit:task.edit,hint:task.hint,sol:task.sol,checks:task.checks})}\n\nВиправ розв’язок і/або перевірки так, щоб розв’язок проходив усі перевірки. Поверни одне завдання у масиві tasks.`;
  const r=await call({system:TASK_SYSTEM,user,tool:TASKS_TOOL,maxTokens:5000});
  const t=(r.tasks||[])[0];return t?{...cleanTask(t,lang),id:task.id}:null;
}
