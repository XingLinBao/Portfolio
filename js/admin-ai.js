// Вікна кабінету для ШІ-генерації: запитання тесту та практичні завдання.
import {h,ic} from "./render.js";
import {openModal,toast} from "./modal.js";
import {saveRec,cache} from "./data.js";
import {LANGS,QTYPES,QUIZ_MAX} from "./interactive.js";
import {usesProxy,getKey,setKey,aiReady,aiStatus,generateQuiz,generateTasks,selfCheck,repairTask} from "./ai.js";

const fld=(label,ctl,hint)=>h("div",{class:"fld"},h("label",{},label),ctl,hint?h("small",{},hint):null);
const sel=(opts,val,on)=>{const s=h("select",{onchange:e=>on&&on(e.target.value)},...Object.entries(opts).map(([k,l])=>h("option",{value:k},l)));s.value=val;return s;};
const txt=(val,on,ph,max=300)=>{const i=h("input",{type:"text",maxlength:max,placeholder:ph||""});i.value=val||"";i.addEventListener("input",()=>on(i.value));return i;};
const num=(val,min,max,on)=>{const i=h("input",{type:"number",min,max,step:1});i.value=val;i.addEventListener("input",()=>on(Math.max(min,Math.min(max,Math.round(+i.value||min)))));return i;};
const chk=(label,val,on)=>{const i=h("input",{type:"checkbox"});i.checked=!!val;i.addEventListener("change",()=>on(i.checked));return h("label",{class:"chk sm"},i,label);};
const LEVELS={"початковий":"Початковий","середній":"Середній","складний":"Складний"};

// Блок ключа API (потрібен лише без проксі)
function keyBlock(onChange){
  if(usesProxy())return null;
  const i=h("input",{type:"password",autocomplete:"off",placeholder:"AQ.… (або AIza…)"});i.value=getKey();
  i.addEventListener("change",()=>{setKey(i.value);onChange&&onChange();});
  return fld("Ключ Gemini API",i,"Безкоштовно: aistudio.google.com/apikey. Зберігається лише в цьому браузері й передається тільки до Google. Для безпечнішої роботи налаштуйте проксі (див. ШІ.md).");
}

// Спільна оболонка: форма → прогрес → попередній перегляд
function shell(title){
  const body=h("div",{class:"form"});
  const cancel=h("button",{class:"btn"},"Закрити");
  const m=openModal({title,content:body,actions:[cancel],wide:true});
  m.el.classList.add("xl");cancel.onclick=()=>m.close(true);
  return {m,body,actions:(...a)=>{const f=m.el.querySelector(".mf");f.replaceChildren(cancel,...a);}};
}
const busy=t=>h("div",{class:"ai-busy",role:"status"},h("span",{class:"ai-spin","aria-hidden":"true"}),h("span",{class:"ai-bt"},t));
const err=t=>h("div",{class:"ck-sum bad",role:"alert"},t);

// ============================================================ ТЕСТ
export function aiQuizModal(onSaved){
  const room=QUIZ_MAX-(cache.quiz||[]).length;
  if(room<=0){toast(`У тесті вже ${QUIZ_MAX} запитань. Видаліть одне, щоб додати нові.`,"err");return;}
  const S={topic:"html",count:Math.min(5,room),level:"початковий",types:{single:true,multi:true,match:false},theme:""};
  const {m,body,actions}=shell("Тест від ШІ");
  const go=h("button",{class:"btn primary"},ic("star"),"Згенерувати");

  function form(msg){
    const kb=keyBlock(()=>form());
    actions(go);go.disabled=false;go.onclick=run;
    body.replaceChildren(
      h("p",{class:"mu s"},`ШІ складе запитання, а ви перегляньте їх перед додаванням. У тесті є місце ще для ${room}.`),
      msg?err(msg):null,
      h("div",{class:"row2e"},fld("Тема",sel(LANGS,S.topic,x=>S.topic=x)),fld("Рівень",sel(LEVELS,S.level,x=>S.level=x))),
      fld("Про що саме (необов’язково)",txt(S.theme,x=>S.theme=x,"Семантичні теги, селектори, цикли…",200)),
      h("div",{class:"row2e"},fld("Кількість запитань",num(S.count,1,Math.min(10,room),x=>S.count=x)),
        fld("Типи запитань",h("div",{class:"ai-types"},...Object.entries(QTYPES).map(([k,l])=>chk(l,S.types[k],on=>S.types[k]=on))))),
      kb);
  }
  async function run(){
    const types=Object.keys(S.types).filter(k=>S.types[k]);
    if(!types.length){toast("Оберіть хоча б один тип запитань","err");return;}
    if(!aiReady()){form("Вкажіть ключ API.");return;}
    go.disabled=true;const st=busy("ШІ складає запитання… Зазвичай до хвилини.");body.replaceChildren(st);
    aiStatus.fn=t=>st.querySelector(".ai-bt").textContent=t;
    try{
      const qs=await generateQuiz({topic:S.topic,count:S.count,level:S.level,types,theme:S.theme.trim()});
      if(!qs.length)throw new Error("ШІ повернув некоректні запитання — спробуйте ще раз");
      preview(qs);
    }catch(e){form(e.message||String(e));}finally{aiStatus.fn=null;}
  }
  function preview(qs){
    const on=qs.map(()=>true);
    const add=h("button",{class:"btn primary"},ic("check"),"Додати вибрані");
    const again=h("button",{class:"btn",onclick:()=>form()},"Змінити параметри");
    const upd=()=>{const n=on.filter(Boolean).length;add.textContent=`Додати вибрані (${n})`;add.disabled=!n||n>room;};
    add.onclick=async()=>{
      const pick=qs.filter((_,i)=>on[i]);add.disabled=true;
      try{const t0=Date.now();for(const [i,q] of pick.entries())await saveRec("quiz",null,{...q,ord:t0+i});
        toast(`Додано запитань: ${pick.length}`);m.close(true);if(onSaved)await onSaved();}
      catch(e){toast("Не вдалося зберегти: "+(e.message||e),"err");add.disabled=false;}
    };
    actions(again,add);upd();
    body.replaceChildren(h("p",{class:"mu s"},"Перегляньте запитання. Зніміть позначку з тих, що не потрібні. Правильні відповіді позначено галочкою. Після додавання кожне запитання можна відредагувати."),
      h("ol",{class:"ai-list"},qs.map((q,i)=>h("li",{class:"ai-item"},
        h("label",{class:"ai-pick"},(()=>{const c=h("input",{type:"checkbox"});c.checked=true;c.addEventListener("change",()=>{on[i]=c.checked;upd();});return c;})(),h("b",{},q.title)),
        h("div",{class:"iq-li-m"},h("span",{class:"chip"},QTYPES[q.type])),
        q.code?h("pre",{class:"iq-code"},h("code",{},q.code)):null,
        h("ul",{class:"ws-list"},...(q.type==="match"?q.pairs.map(p=>h("li",{},ic("r"),h("span",{},`${p.l} → ${p.r}`))):q.opts.map(o=>h("li",{class:o.ok?"ok":""},ic(o.ok?"check":"x"),h("span",{},o.t))))),
        q.explain?h("small",{class:"mu"},"Пояснення: "+q.explain):null))));
  }
  form();
}

// ============================================================ ПРАКТИЧНІ ЗАВДАННЯ
// onAdd(tasks, meta) — повертає вибрані завдання у форму теми.
export function aiTasksModal({lang,topicTitle,room},onAdd){
  const S={lang:lang||"html",theme:topicTitle||"",count:3,level:"початковий"};
  const {m,body,actions}=shell("Завдання від ШІ");
  const go=h("button",{class:"btn primary"},ic("star"),"Згенерувати");
  const frame=h("iframe",{sandbox:"allow-scripts",class:"ck-frame",title:"Службова перевірка","aria-hidden":"true",tabindex:"-1"});

  function form(msg){
    const kb=keyBlock(()=>form());
    actions(go);go.disabled=false;go.onclick=run;
    body.replaceChildren(
      h("p",{class:"mu s"},"ШІ створить завдання з умовою, початковим кодом, підказкою, розв’язком і правилами перевірки. Кожен розв’язок автоматично прогнається через ваш валідатор — ви побачите, які завдання працюють."),
      msg?err(msg):null,
      fld("Тема",txt(S.theme,x=>S.theme=x,"Форматування тексту: жирний, курсив, абзаци",200),"Чим конкретніше — тим краще завдання."),
      h("div",{class:"row2e"},fld("Мова",sel(LANGS,S.lang,x=>S.lang=x)),fld("Рівень",sel(LEVELS,S.level,x=>S.level=x))),
      fld("Кількість завдань",num(S.count,1,Math.min(6,room||6),x=>S.count=x)),
      kb);
  }
  async function run(){
    if(!S.theme.trim()){toast("Вкажіть тему завдань","err");return;}
    if(!aiReady()){form("Вкажіть ключ API.");return;}
    go.disabled=true;
    const status=busy("ШІ створює завдання… Це може тривати 1–2 хвилини.");body.replaceChildren(status,frame);
    const say=t=>status.querySelector(".ai-bt").textContent=t;aiStatus.fn=say;
    try{
      const r=await generateTasks({lang:S.lang,theme:S.theme.trim(),count:S.count,level:S.level});
      if(!r.tasks.length)throw new Error("ШІ не створив жодного завдання — спробуйте ще раз");
      const out=[];
      for(const [i,t0] of r.tasks.entries()){
        let t=t0;say(`Перевіряємо розв’язок ${i+1} із ${r.tasks.length}…`);
        let problem=await selfCheck(frame,t).catch(e=>"Помилка перевірки: "+(e.message||e));
        if(problem){
          say(`Завдання ${i+1} не пройшло перевірку — просимо ШІ виправити…`);
          try{const fixed=await repairTask(t,problem,S.lang);
            if(fixed){const p2=await selfCheck(frame,fixed).catch(e=>"Помилка перевірки: "+(e.message||e));t=fixed;problem=p2;}}catch(e){/* лишаємо первинну версію */}
        }
        out.push({t,problem});
      }
      preview(r,out);
    }catch(e){form(e.message||String(e));}finally{aiStatus.fn=null;}
  }
  function preview(r,out){
    const on=out.map(x=>!x.problem);
    const add=h("button",{class:"btn primary"},ic("check"),"Додати до теми");
    const again=h("button",{class:"btn",onclick:()=>form()},"Змінити параметри");
    const upd=()=>{const n=on.filter(Boolean).length;add.textContent=`Додати до теми (${n})`;add.disabled=!n;};
    add.onclick=()=>{const pick=out.filter((_,i)=>on[i]).map(x=>x.t);onAdd(pick,{title:r.title,desc:r.desc});toast(`Завдань додано до форми теми: ${pick.length}. Натисніть «Зберегти» у вікні теми.`);m.close(true);};
    actions(again,add);upd();
    const okN=out.filter(x=>!x.problem).length;
    body.replaceChildren(
      h("div",{class:"ck-sum "+(okN===out.length?"ok":"bad")},okN===out.length?`Усі ${out.length} завдань пройшли автоматичну перевірку.`:`Пройшли перевірку: ${okN} із ${out.length}. Решту позначено попередженням — її краще відредагувати вручну після додавання.`),
      h("ol",{class:"ai-list"},out.map(({t,problem},i)=>h("li",{class:"ai-item"},
        h("label",{class:"ai-pick"},(()=>{const c=h("input",{type:"checkbox"});c.checked=on[i];c.addEventListener("change",()=>{on[i]=c.checked;upd();});return c;})(),h("b",{},t.title)),
        h("p",{class:"ai-desc"},t.desc),
        h("ul",{class:"ws-list"},h("li",{class:problem?"warn":"ok"},ic(problem?"bulb":"check"),h("span",{},problem?"Розв’язок не пройшов перевірку: "+problem:"Розв’язок проходить усі перевірки"))),
        h("details",{},h("summary",{},`Перевірки (${t.checks.length}) та розв’язок`),
          h("ul",{class:"ws-list"},...t.checks.map(c=>h("li",{},ic("check"),h("span",{},c.label||c.msg||c.type)))),
          ...["html","css","js"].filter(k=>t.sol[k].trim()).map(k=>h("div",{},h("small",{class:"mu"},LANGS[k]),h("pre",{class:"iq-code"},h("code",{},t.sol[k])))))))),
      frame);
  }
  form();
}
