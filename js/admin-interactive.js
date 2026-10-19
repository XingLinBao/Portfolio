// Кабінет викладача: запитання тесту, теми й практичні завдання з правилами перевірки.
import {h,ic} from "./render.js";
import {openModal,toast,confirmBox} from "./modal.js";
import {saveRec,saveProfile,delRec,cache} from "./data.js";
import {LANGS,QTYPES,QUIZ_MAX} from "./interactive.js";
import {CHECK_TYPES,checkProblem,validateTask} from "./validator.js";

export const isInteractive=c=>c==="quiz"||c==="practice";
const uid=()=>"t"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const clone=o=>JSON.parse(JSON.stringify(o));
const fld=(label,ctl,hint,req)=>h("div",{class:"fld"},label?h("label",{},label,req?h("span",{class:"rq"}," *"):null):null,ctl,hint?h("small",{},hint):null);
const sel=(opts,val,on)=>{const s=h("select",{onchange:e=>on&&on(e.target.value)},...Object.entries(opts).map(([k,l])=>h("option",{value:k},l)));s.value=val;return s;};
const inp=(val,on,ph,max=300)=>{const i=h("input",{type:"text",maxlength:max,placeholder:ph||""});i.value=val||"";i.addEventListener("input",()=>on(i.value));return i;};
const area=(val,on,rows=4,cls="",ph="")=>{const t=h("textarea",{rows,class:cls,placeholder:ph,spellcheck:cls?"false":"true"});t.value=val||"";t.addEventListener("input",()=>on(t.value));return t;};
const chk=(label,val,on)=>{const i=h("input",{type:"checkbox"});i.checked=!!val;i.addEventListener("change",()=>on(i.checked));return h("label",{class:"chk sm"},i,label);};

function saveModal({title,content,snap,check,save,onSaved,xl,msg="Збережено",okLabel="Зберегти"}){
  const ini=snap();let saved=false;
  const cancel=h("button",{class:"btn"},"Скасувати"),ok=h("button",{class:"btn primary"},okLabel);
  const m=openModal({title,content,actions:[cancel,ok],wide:true,beforeClose:async()=>saved||snap()===ini||confirmBox("Є незбережені зміни. Закрити без збереження?","Закрити",true)});
  if(xl)m.el.classList.add("xl");
  cancel.onclick=()=>m.close();
  ok.onclick=async()=>{const e=check();if(e){toast(e,"err");return;}ok.disabled=true;
    try{await save();saved=true;toast(msg);m.close(true);if(onSaved)await onSaved();}
    catch(x){toast("Не вдалося зберегти: "+(x.message||x),"err");ok.disabled=false;}};
  return m;
}

// ------------------------------------------------------------ ЗАПИТАННЯ ТЕСТУ
export function questionModal(rec,onSaved){
  if(!rec&&(cache.quiz||[]).length>=QUIZ_MAX){toast(`У тесті вже ${QUIZ_MAX} запитань. Видаліть одне, щоб додати нове.`,"err");return;}
  const v=rec||{};
  const S={title:v.title||"",topic:v.topic||"html",type:v.type||"single",code:v.code||"",explain:v.explain||""};
  let opts=(v.opts&&v.opts.length?v.opts:[{t:"",ok:true},{t:"",ok:false},{t:"",ok:false}]).map(o=>({t:o.t||"",ok:!!o.ok}));
  let pairs=(v.pairs&&v.pairs.length?v.pairs:[{l:"",r:""},{l:"",r:""}]).map(p=>({l:p.l||"",r:p.r||""}));
  const body=h("div",{class:"qa"});
  function paint(){
    if(S.type==="match"){
      body.replaceChildren(h("p",{class:"mu s"},"Кожному пункту ліворуч має відповідати один варіант праворуч. Студент побачить праві частини в перемішаному порядку."),
        h("div",{class:"qa-rows"},pairs.map((p,i)=>h("div",{class:"qa-row pair"},inp(p.l,x=>p.l=x,"Пункт (наприклад, <a>)",200),h("span",{class:"qa-ar","aria-hidden":"true"},ic("r")),inp(p.r,x=>p.r=x,"Відповідність",200),
          h("button",{type:"button",class:"mx sm","aria-label":"Видалити пару",disabled:pairs.length<=2,onclick:()=>{pairs.splice(i,1);paint();}},ic("x"))))),
        h("button",{type:"button",class:"btn sm",disabled:pairs.length>=8,onclick:()=>{pairs.push({l:"",r:""});paint();}},ic("plus"),"Додати пару"));
    }else{
      const multi=S.type==="multi";
      body.replaceChildren(h("p",{class:"mu s"},multi?"Позначте прапорцями всі правильні відповіді.":"Позначте перемикачем єдину правильну відповідь."),
        h("div",{class:"qa-rows"},opts.map((o,i)=>{
          const m=h("input",{type:multi?"checkbox":"radio",name:"qa-ok","aria-label":"Правильна відповідь",checked:o.ok||null,onchange:e=>{if(multi)o.ok=e.target.checked;else opts.forEach((x,k)=>x.ok=k===i);}});
          return h("div",{class:"qa-row"},h("label",{class:"qa-ok",title:"Правильна відповідь"},m,h("span",{class:"qa-okm"},ic("check"))),inp(o.t,x=>o.t=x,"Варіант відповіді "+(i+1),300),
            h("button",{type:"button",class:"mx sm","aria-label":"Видалити варіант",disabled:opts.length<=2,onclick:()=>{opts.splice(i,1);if(!multi&&!opts.some(x=>x.ok))opts[0].ok=true;paint();}},ic("x")));})),
        h("button",{type:"button",class:"btn sm",disabled:opts.length>=8,onclick:()=>{opts.push({t:"",ok:false});paint();}},ic("plus"),"Додати варіант"));
    }
  }
  const typeSel=sel(QTYPES,S.type,x=>{S.type=x;if(x==="single"){const f=opts.findIndex(o=>o.ok);opts.forEach((o,i)=>o.ok=i===(f<0?0:f));}paint();});
  const content=h("div",{class:"form"},
    h("div",{class:"row2e"},fld("Тема",sel(LANGS,S.topic,x=>S.topic=x),null,1),fld("Тип запитання",typeSel,null,1)),
    fld("Текст запитання",area(S.title,x=>S.title=x,3,"","Який тег використовується для найбільшого заголовка?"),null,1),
    fld("Фрагмент коду (необов’язково)",area(S.code,x=>S.code=x,4,"mono","<h1>Привіт</h1>"),"Відобразиться під запитанням моноширинним шрифтом."),
    h("div",{class:"fld"},h("label",{},"Варіанти відповідей",h("span",{class:"rq"}," *")),body),
    fld("Пояснення (необов’язково)",area(S.explain,x=>S.explain=x,3),"Студент побачить його після завершення тесту."));
  paint();
  const clean=()=>({opts:S.type==="match"?[]:opts.filter(o=>o.t.trim()).map(o=>({t:o.t.trim(),ok:o.ok})),pairs:S.type==="match"?pairs.filter(p=>p.l.trim()&&p.r.trim()).map(p=>({l:p.l.trim(),r:p.r.trim()})):[]});
  saveModal({title:rec?"Змінити запитання":"Нове запитання",content,xl:true,onSaved,
    snap:()=>JSON.stringify([S,opts,pairs]),
    check(){
      if(!S.title.trim())return "Введіть текст запитання";
      if(S.type==="match"){
        if(pairs.some(p=>!!p.l.trim()!==!!p.r.trim()))return "У кожній парі заповніть обидві частини (або видаліть пару)";
        if(clean().pairs.length<2)return "Додайте щонайменше дві пари";
      }else{
        const o=clean().opts;
        if(opts.some(x=>!x.t.trim()&&x.ok))return "Правильна відповідь не може бути порожньою";
        if(o.length<2)return "Додайте щонайменше два варіанти відповіді";
        const n=o.filter(x=>x.ok).length;
        if(S.type==="single"&&n!==1)return "Позначте одну правильну відповідь";
        if(S.type==="multi"&&n<1)return "Позначте хоча б одну правильну відповідь";
      }
      return null;},
    save:()=>saveRec("quiz",rec&&rec.id,{title:S.title.trim(),topic:S.topic,type:S.type,code:S.code.replace(/\s+$/,""),explain:S.explain.trim(),...clean()})});
}

export function quizMetaModal(onSaved){
  const m=(cache.profile&&cache.profile.quizMeta)||{};const S={title:m.title||"",desc:m.desc||""};
  saveModal({title:"Назва тесту",content:h("div",{class:"form"},
    fld("Назва",inp(S.title,x=>S.title=x,"Тест тижня",120),"Наприклад: «Тест тижня: 14–20 жовтня»."),
    fld("Короткий опис",area(S.desc,x=>S.desc=x,3,"","Перевірте, як ви засвоїли HTML, CSS та JavaScript…"))),
    snap:()=>JSON.stringify(S),check:()=>null,onSaved,save:()=>saveProfile({quizMeta:{title:S.title.trim(),desc:S.desc.trim()}})});
}

export async function clearQuiz(onSaved){
  const q=cache.quiz||[];if(!q.length)return;
  if(!(await confirmBox(`Видалити всі запитання тесту (${q.length})? Цю дію не можна скасувати. Використовуйте це, щоб почати новий тест на наступний тиждень.`,"Видалити все",true,"Очистити тест")))return;
  try{await Promise.all(q.map(x=>delRec("quiz",x.id)));toast("Тест очищено");await onSaved();}catch(e){toast("Не вдалося очистити: "+(e.message||e),"err");}
}

export async function moveRec(col,rec,dir,list,onSaved){
  const i=list.findIndex(x=>x.id===rec.id),j=i+dir;if(i<0||j<0||j>=list.length)return;
  const a=list[i],b=list[j],ka=a.ord??a.createdAt??0,kb=b.ord??b.createdAt??0;
  const na=kb===ka?kb+dir:kb;
  try{await Promise.all([saveRec(col,a.id,{ord:na}),saveRec(col,b.id,{ord:ka})]);await onSaved();}catch(e){toast("Не вдалося змінити порядок: "+(e.message||e),"err");}
}

// ------------------------------------------------------------ ТЕМА ПРАКТИКИ
export function topicModal(rec,onSaved){
  const v=rec||{};
  const S={title:v.title||"",lang:v.lang||"html",desc:v.desc||"",tasks:clone(v.tasks||[])};
  const list=h("div",{class:"tk-list"});
  function paint(){
    list.replaceChildren(...(S.tasks.length?S.tasks.map((t,i)=>h("div",{class:"tk-row"},h("span",{class:"ip-num"},i+1),h("div",{class:"tk-t"},h("b",{},t.title),h("small",{},`${(t.checks||[]).length} перевірок · редагує: ${(t.edit||[]).map(k=>LANGS[k]).join(", ")||"—"}`)),
      h("div",{class:"ab"},
        h("button",{type:"button",class:"btn sm",disabled:i===0,"aria-label":"Вище",onclick:()=>{[S.tasks[i-1],S.tasks[i]]=[S.tasks[i],S.tasks[i-1]];paint();}},ic("up")),
        h("button",{type:"button",class:"btn sm",disabled:i===S.tasks.length-1,"aria-label":"Нижче",onclick:()=>{[S.tasks[i+1],S.tasks[i]]=[S.tasks[i],S.tasks[i+1]];paint();}},ic("down")),
        h("button",{type:"button",class:"btn sm",onclick:()=>taskModal(t,S.lang,nt=>{S.tasks[i]=nt;paint();})},ic("edit"),"Змінити"),
        h("button",{type:"button",class:"btn sm danger",onclick:async()=>{if(await confirmBox(`Видалити завдання «${t.title}»?`,"Видалити",true)){S.tasks.splice(i,1);paint();}}},ic("trash"))))):[h("p",{class:"mu s"},"Завдань ще немає.")]));
  }
  paint();
  const content=h("div",{class:"form"},
    h("div",{class:"row2e"},fld("Назва теми",inp(S.title,x=>S.title=x,"Форматування тексту",200),null,1),fld("Мова",sel(LANGS,S.lang,x=>S.lang=x),null,1)),
    fld("Короткий опис (необов’язково)",area(S.desc,x=>S.desc=x,2)),
    h("div",{class:"fld"},h("label",{},"Завдання теми"),list,
      h("div",{class:"ab"},h("button",{type:"button",class:"btn sm",onclick:()=>taskModal(null,S.lang,nt=>{S.tasks.push(nt);paint();})},ic("plus"),"Додати завдання")),
      h("small",{},"Спочатку збережіть завдання, а потім натисніть «Зберегти» внизу — лише тоді тема оновиться на сайті.")));
  saveModal({title:rec?"Змінити тему":"Нова тема",content,xl:true,onSaved,
    snap:()=>JSON.stringify(S),
    check:()=>!S.title.trim()?"Введіть назву теми":null,
    save:()=>saveRec("practice",rec&&rec.id,{title:S.title.trim(),lang:S.lang,desc:S.desc.trim(),tasks:S.tasks})});
}

// ------------------------------------------------------------ ЗАВДАННЯ
function taskModal(task,topicLang,onDone){
  const v=task||{};
  const T={id:v.id||uid(),title:v.title||"",desc:v.desc||"",html:v.html||"",css:v.css||"",js:v.js||"",edit:v.edit&&v.edit.length?[...v.edit]:[topicLang||"html"],hint:v.hint||"",
    sol:{html:"",css:"",js:"",...(v.sol||{})},showSol:v.showSol!==false,checks:clone(v.checks||[])};
  const code=(k,label)=>h("div",{class:"fld"},h("div",{class:"tk-cl"},h("label",{},label),chk("студент редагує",T.edit.includes(k),on=>{T.edit=T.edit.filter(x=>x!==k);if(on)T.edit.push(k);})),area(T[k],x=>T[k]=x,6,"mono"));
  const solBox=k=>h("div",{class:"fld"},h("label",{},"Розв’язок: "+LANGS[k]),area(T.sol[k],x=>T.sol[k]=x,5,"mono"));

  // --- перевірки ---
  const cbox=h("div",{class:"ck-list"});
  function paintChecks(){
    cbox.replaceChildren(...(T.checks.length?T.checks.map((c,i)=>checkCard(c,i)):[h("p",{class:"mu s"},"Перевірок ще немає. Без них валідатор лише шукатиме помилки в коді студента.")]));
  }
  function checkCard(c,i){
    const def=CHECK_TYPES[c.type]||CHECK_TYPES.exists;
    const typeSel=sel(Object.fromEntries(Object.entries(CHECK_TYPES).map(([k,x])=>[k,x.l])),c.type,x=>{const keep={label:c.label,msg:c.msg};T.checks[i]={type:x,...(x==="exists"?{}:{}),...keep};paintChecks();});
    const fields=def.f.map(([k,l,ph,flag,mode])=>{
      if(flag==="chk")return chk(l,c[k],x=>c[k]=x);
      if(flag==="file")return fld(l,sel({"":"— оберіть —",html:"HTML",css:"CSS",js:"JavaScript"},c[k]||"",x=>c[k]=x));
      if(flag==="num")return fld(l,(()=>{const n=h("input",{type:"number",min:0,step:1,placeholder:ph});n.value=c[k]||"";n.addEventListener("input",()=>c[k]=n.value===""?"":Math.max(0,Math.round(+n.value)));return n;})());
      if(mode==="area")return fld(l,area(c[k],x=>c[k]=x,5,"mono",ph),"Доступні змінні: document, window, output (текст консолі), src ({html, css, js}).");
      return fld(l,inp(c[k],x=>c[k]=x,ph,500),null,flag===1);
    });
    return h("div",{class:"ck"},h("div",{class:"ck-h"},h("span",{class:"ip-num"},i+1),typeSel,
      h("button",{type:"button",class:"mx sm","aria-label":"Видалити перевірку",onclick:()=>{T.checks.splice(i,1);paintChecks();}},ic("x"))),
      h("div",{class:"ck-f"},...fields),
      h("div",{class:"row2e"},fld("Назва пункту для студента (необов’язково)",inp(c.label,x=>c.label=x,"Заголовок має тег h1",200)),fld("Підказка, якщо не виконано",inp(c.msg,x=>c.msg=x,"Додайте заголовок першого рівня",300))));
  }
  paintChecks();

  // --- перевірка за розв'язком ---
  const out=h("div",{class:"ck-out"});
  const frame=h("iframe",{sandbox:"allow-scripts",class:"ck-frame",title:"Службова перевірка","aria-hidden":"true",tabindex:"-1"});
  const test=h("button",{type:"button",class:"btn sm"},ic("play"),"Перевірити валідатор на розв’язку");
  test.onclick=async()=>{
    for(const [i,c] of T.checks.entries()){const p=checkProblem(c);if(p){toast(`Перевірка ${i+1}: ${p}`,"err");return;}}
    if(!["html","css","js"].some(k=>T.sol[k].trim())){toast("Спочатку заповніть розв’язок","err");return;}
    test.disabled=true;out.replaceChildren(h("p",{class:"mu s"},"Виконуємо перевірку…"));
    try{
      const files={html:T.sol.html||T.html,css:T.sol.css||T.css,js:T.sol.js||T.js};
      const r=await validateTask(frame,files,{checks:T.checks,edit:["html","css","js"].filter(k=>T.sol[k].trim())});
      out.replaceChildren(h("div",{class:"ck-sum "+(r.pass?"ok":"bad")},r.pass?"Розв’язок проходить усі перевірки — валідатор налаштовано правильно.":"Розв’язок НЕ проходить усі перевірки. Виправте правила або розв’язок."),
        h("ul",{class:"ws-list"},...r.syntax.map(s=>h("li",{class:s.warn?"warn":"bad"},ic(s.warn?"bulb":"x"),h("span",{},`${s.lang}${s.line?`, рядок ${s.line}`:""}: ${s.msg}`))),
          ...r.items.map(i=>h("li",{class:i.ok?"ok":"bad"},ic(i.ok?"check":"x"),h("span",{},i.label+(i.ok?"":" — "+i.hint))))));
    }catch(e){out.replaceChildren(h("p",{class:"mu"},"Помилка перевірки: "+(e.message||e)));}
    test.disabled=false;
  };

  const content=h("div",{class:"form"},
    fld("Назва завдання",inp(T.title,x=>T.title=x,"Зробіть слово жирним",200),null,1),
    fld("Умова завдання",area(T.desc,x=>T.desc=x,6),"Порожній рядок — новий абзац. Рядки, що починаються з «- », стають списком. Код у зворотних лапках `<h1>` виділяється шрифтом.",1),
    h("h4",{class:"tm-sec"},"Початковий код"),
    h("p",{class:"mu s"},"Це те, що студент побачить у редакторі. Позначте, які частини він може змінювати; решта буде доступна лише для перегляду (корисно, наприклад, коли в CSS-завданні HTML уже готовий)."),
    code("html","HTML"),code("css","CSS"),code("js","JavaScript"),
    fld("Підказка (необов’язково)",area(T.hint,x=>T.hint=x,3)),
    h("h4",{class:"tm-sec"},"Перевірки (валідатор)"),
    h("p",{class:"mu s"},"Код студента запускається в ізольованому вікні, а потім перевіряється за цими правилами. Окремо, автоматично, перевіряється синтаксис: незакриті теги, помилки в CSS, помилки JavaScript."),
    cbox,h("div",{class:"ab"},h("button",{type:"button",class:"btn sm",onclick:()=>{T.checks.push({type:"exists"});paintChecks();}},ic("plus"),"Додати перевірку")),
    h("h4",{class:"tm-sec"},"Еталонний розв’язок"),
    h("p",{class:"mu s"},"Потрібен для перевірки правил і (за бажанням) для кнопки «Показати розв’язок» у студентів."),
    solBox("html"),solBox("css"),solBox("js"),chk("Дозволити студентам переглядати розв’язок",T.showSol,x=>T.showSol=x),
    h("div",{class:"ab"},test),out,frame);

  saveModal({title:task?"Змінити завдання":"Нове завдання",content,xl:true,okLabel:"Готово",msg:"Завдання додано до теми. Щоб зміни потрапили на сайт, збережіть тему.",
    snap:()=>JSON.stringify(T),
    check(){
      if(!T.title.trim())return "Введіть назву завдання";
      if(!T.desc.trim())return "Опишіть умову завдання";
      if(!T.edit.length)return "Позначте хоча б одну частину коду, яку студент може змінювати";
      for(const [i,c] of T.checks.entries()){const p=checkProblem(c);if(p)return `Перевірка ${i+1}: ${p}`;}
      return null;},
    save:async()=>{const t={id:T.id,title:T.title.trim(),desc:T.desc.trim(),html:T.html,css:T.css,js:T.js,edit:T.edit,hint:T.hint.trim(),sol:T.sol,showSol:T.showSol,
        checks:T.checks.map(c=>{const o={};Object.entries(c).forEach(([k,x])=>{if(x!==""&&x!=null&&x!==false)o[k]=x;});return o;})};onDone(t);}});
}

export function interactiveModal(col,rec,onSaved){return col==="quiz"?questionModal(rec,onSaved):topicModal(rec,onSaved);}
