// Розділ «Інтерактивні заняття»: Тест тижня + практичні завдання з редактором коду та валідатором.
import {createEditor} from "./editor.js";
import {validateTask,runInFrame} from "./validator.js";

const css=document.createElement("link");css.rel="stylesheet";css.href=new URL("../css/interactive.css",import.meta.url).href;document.head.append(css);

export const QUIZ_MAX=20;
export const LANGS={html:"HTML",css:"CSS",js:"JavaScript"};
export const QTYPES={single:"Одна правильна відповідь",multi:"Кілька правильних відповідей",match:"Співставлення"};
export const byOrd=a=>[...(a||[])].sort((x,y)=>(x.ord??x.createdAt??0)-(y.ord??y.createdAt??0));
const pl=(n,a,b,c)=>{const m=n%100,k=n%10;return m>10&&m<20?c:k===1?a:k>1&&k<5?b:c;};
const ls={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const S={tab:"quiz",lang:"html",open:null,qz:null,sig:""};
let h,ic;

// простий формат тексту завдань: порожній рядок — новий абзац, «- » — список, `код` — моноширинний
function inline(s){return s.split(/(`[^`]+`)/).map(x=>/^`[^`]+`$/.test(x)?h("code",{},x.slice(1,-1)):x).filter(x=>x!=="");}
export function rich(text){
  return String(text||"").split(/\n{2,}/).filter(b=>b.trim()).map(b=>{
    const lines=b.split("\n");
    if(lines.every(l=>/^\s*[-•*]\s+/.test(l)))return h("ul",{},lines.map(l=>h("li",{},inline(l.replace(/^\s*[-•*]\s+/,"")))));
    return h("p",{},lines.flatMap((l,i)=>[i?h("br"):null,...inline(l)]));
  });
}
const TECH={
  html:'<svg viewBox="0 0 64 72" aria-hidden="true"><path d="M4 4h56l-5 56-23 8-23-8z" fill="#e34f26"/><path d="M32 8v56l18-6 4-50z" fill="#ef652a"/><text x="32" y="47" text-anchor="middle" font-size="30" font-weight="800" fill="#fff" font-family="Unbounded,Manrope,sans-serif">5</text></svg>',
  css:'<svg viewBox="0 0 64 72" aria-hidden="true"><path d="M4 4h56l-5 56-23 8-23-8z" fill="#1572b6"/><path d="M32 8v56l18-6 4-50z" fill="#33a9dc"/><text x="32" y="47" text-anchor="middle" font-size="30" font-weight="800" fill="#fff" font-family="Unbounded,Manrope,sans-serif">3</text></svg>',
  js:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="10" fill="#f7df1e"/><text x="58" y="56" text-anchor="end" font-size="28" font-weight="800" fill="#1a1a1a" font-family="Unbounded,Manrope,sans-serif">JS</text></svg>'};
const tech=k=>{const e=h("span",{class:"tb "+k});e.innerHTML=TECH[k]||"";return e;};
const lg=k=>h("span",{class:"lg "+k},LANGS[k]||k);

export function buildInteractive(ctx){
  h=ctx.h;ic=ctx.ic;
  if(window.__interactiveStart){S.tab=window.__interactiveStart.tab||"practice";S.lang=window.__interactiveStart.lang||"html";S.open=null;S.qz=null;window.__interactiveStart=null;}
  const {A,st,soon}=ctx;
  const quiz=byOrd(st.quiz),topics=byOrd(st.practice);
  if(!A&&!quiz.length&&!topics.length)return soon("Інтерактивні заняття","Тут з’являться тест тижня та практичні завдання з HTML, CSS і JavaScript з миттєвою перевіркою коду.","code");
  const sig=JSON.stringify([quiz,topics.map(t=>t.id+":"+(t.tasks||[]).length)]);
  if(S.sig!==sig){S.sig=sig;S.qz=null;}
  const sp=(c,t)=>h("span",{class:"k-"+c},t),ln=(...c)=>h("span",{class:"ln"},...c);
  const ban=h("section",{class:"ilb"},
    h("div",{class:"ilb-l"},h("h1",{},"Інтерактивні ",h("span",{class:"grad"},"заняття")),
      h("p",{},"Перевірте знання в тесті тижня та практикуйтеся: пишіть код у вбудованому редакторі, одразу бачте результат, а валідатор підкаже, що виправити.")),
    h("div",{class:"ilb-r","aria-hidden":"true"},h("div",{class:"ilb-code"},
      h("span",{class:"ilb-tab"},"quiz.js"),
      h("pre",{},h("code",{},ln(sp("c","// Тест тижня")),ln(sp("k","const")," answer = ",sp("s",'"B"'),";"),ln(),
        ln(sp("k","function")," ",sp("f","check"),"(choice) {"),ln("  ",sp("k","return")," choice === answer"),
        ln("    ? ",sp("s",'"Правильно!"')),ln("    : ",sp("s",'"Ще раз"'),";"),ln("}"))),
      h("span",{class:"ilb-ok"},ic("check")))));
  const menu=h("div",{class:"il-menu",role:"tablist","aria-label":"Розділ","aria-orientation":"vertical"});
  const box=h("div",{class:"il-box"});
  const lay=h("div",{class:"il"},menu,box);
  const paint=()=>{
    const ws=S.tab==="practice"&&S.open;
    ban.hidden=menu.hidden=!!ws;lay.classList.toggle("full",!!ws);
    menu.replaceChildren(...[["quiz","Тест тижня","star"],["practice","Практичні завдання","code"]].map(([k,l,i])=>h("button",{role:"tab","aria-selected":String(S.tab===k),class:"il-mi",onclick:()=>{S.tab=k;S.open=null;paint();}},ic(i),h("span",{},l))));
    box.replaceChildren(S.tab==="quiz"?quizView(ctx,quiz):practiceView(ctx,topics,paint));
  };
  paint();
  return [ban,lay];
}

// =============================== ТЕСТ ===============================
function prep(q){
  if(q.type==="match"){const pairs=(q.pairs||[]).map(p=>({l:p.l,r:p.r}));return {q,pairs,rights:shuffle([...new Set(pairs.map(p=>p.r))]),ans:pairs.map(()=>"")};}
  const opts=shuffle((q.opts||[]).map(o=>({t:o.t,ok:!!o.ok})));
  return {q,opts,ans:q.type==="multi"?new Set():null};
}
const answered=it=>it.q.type==="single"?it.ans!==null:it.q.type==="multi"?it.ans.size>0:it.ans.some(Boolean);
function grade(it){
  if(it.q.type==="single")return it.ans!==null&&it.opts[it.ans].ok;
  if(it.q.type==="multi"){const need=it.opts.map((o,i)=>o.ok?i:-1).filter(i=>i>=0);return need.length===it.ans.size&&need.every(i=>it.ans.has(i));}
  return it.pairs.every((p,k)=>it.ans[k]===p.r);
}
function quizView(ctx,quiz){
  const {A,add}=ctx,meta=(ctx.st.profile&&ctx.st.profile.quizMeta)||{};
  const wrap=h("div",{class:"iq"});
  const paint=()=>{wrap.replaceChildren(...(!S.qz?startView():S.qz.done?resultView():runView()));};
  const top=()=>wrap.scrollIntoView({block:"start",behavior:"smooth"});
  const begin=()=>{S.qz={items:quiz.map(prep),i:0,done:false,warn:false};paint();top();};

  function adminList(){
    const full=quiz.length>=QUIZ_MAX;
    return h("section",{class:"card pad iq-adm"},
      h("div",{class:"sch"},h("span",{class:"si big c-blue"},ic("edit")),h("h2",{},`Запитання тесту · ${quiz.length} із ${QUIZ_MAX}`),
        h("button",{class:"btn sm",onclick:A.quizMeta},ic("edit"),"Назва тесту"),
        h("button",{class:"btn primary sm",disabled:full,title:full?"Досягнуто максимум — видаліть одне із запитань":null,onclick:()=>A.add("quiz")},ic("plus"),"Додати запитання")),
      quiz.length?h("ol",{class:"iq-list"},quiz.map((q,i)=>h("li",{},
        h("div",{class:"iq-li-t"},h("div",{class:"iq-li-m"},lg(q.topic),h("span",{class:"chip"},QTYPES[q.type]||q.type)),h("div",{class:"iq-li-q"},q.title)),
        h("div",{class:"ab iq-li-b"},
          h("button",{class:"btn sm",disabled:i===0,"aria-label":"Вище",onclick:()=>A.move("quiz",q,-1,quiz)},ic("up")),
          h("button",{class:"btn sm",disabled:i===quiz.length-1,"aria-label":"Нижче",onclick:()=>A.move("quiz",q,1,quiz)},ic("down")),
          h("button",{class:"btn sm",onclick:()=>A.edit("quiz",q)},ic("edit"),"Змінити"),
          h("button",{class:"btn sm danger",onclick:()=>A.del("quiz",q)},ic("trash"),"Видалити"))))):
        h("p",{class:"mu"},"Запитань ще немає. Додайте до "+QUIZ_MAX+" запитань — вони з’являться у тесті в тому порядку, в якому стоять у списку."),
      quiz.length?h("div",{class:"ab"},h("button",{class:"btn sm danger",onclick:A.clearQuiz},ic("trash"),"Очистити тест (новий тиждень)")):null);
  }
  function startView(){
    const cnt={};quiz.forEach(q=>cnt[q.topic]=(cnt[q.topic]||0)+1);
    const out=[h("section",{class:"card pad iq-start"},
      h("span",{class:"si big c-amb"},ic("star")),
      h("div",{class:"iq-st-b"},h("h2",{},meta.title||"Тест тижня"),
        h("p",{class:"mu"},meta.desc||"Перевірте, як ви засвоїли HTML, CSS та JavaScript. Запитання бувають різних типів: з однією відповіддю, з кількома та на співставлення."),
        quiz.length?h("div",{class:"iq-chips"},h("span",{class:"chip"},ic("list"),`${quiz.length} ${pl(quiz.length,"запитання","запитання","запитань")}`),...Object.keys(LANGS).filter(k=>cnt[k]).map(k=>h("span",{class:"chip"},`${LANGS[k]} · ${cnt[k]}`))):null,
        h("p",{class:"mu s"},"Після завершення ви побачите правильні відповіді та пояснення."),
        quiz.length?h("button",{class:"cta pri",onclick:begin},ic("play"),"Розпочати тест"):h("p",{class:"mu"},"Запитання ще не додано.")))];
    if(A)out.push(adminList());
    return out;
  }
  function body(it){
    const q=it.q;
    if(q.type==="match"){
      return h("div",{class:"iq-match"},it.pairs.map((p,k)=>{
        const sel=h("select",{"aria-label":"Відповідність для: "+p.l,onchange:e=>{it.ans[k]=e.target.value;dots();}},h("option",{value:""},"— оберіть —"),...it.rights.map(r=>h("option",{value:r},r)));
        sel.value=it.ans[k]||"";
        return h("div",{class:"iq-mrow c"+(k%4)},h("div",{class:"iq-ml"},p.l),h("span",{class:"iq-ar","aria-hidden":"true"},ic("r")),sel);}));
    }
    const multi=q.type==="multi",name="o"+Math.random().toString(36).slice(2);
    return h("div",{class:"iq-opts",role:multi?"group":"radiogroup"},it.opts.map((o,k)=>{
      const on=multi?it.ans.has(k):it.ans===k;
      const inp=h("input",{type:multi?"checkbox":"radio",name,checked:on||null,onchange:e=>{if(multi){e.target.checked?it.ans.add(k):it.ans.delete(k);}else it.ans=k;[...e.target.closest(".iq-opts").children].forEach((l,n)=>l.classList.toggle("on",multi?it.ans.has(n):it.ans===n));dots();}});
      return h("label",{class:"iq-opt c"+(k%4)+(on?" on":"")},inp,h("span",{class:"iq-lt","aria-hidden":"true"},String.fromCharCode(65+k)),h("span",{class:"iq-ot"},o.t),h("span",{class:"iq-mk","aria-hidden":"true"},ic("check")));}));
  }
  let dotsEl;const dots=()=>{if(!dotsEl)return;[...dotsEl.children].forEach((d,n)=>d.classList.toggle("done",answered(S.qz.items[n])));};
  function runView(){
    const z=S.qz,it=z.items[z.i],q=it.q,last=z.i===z.items.length-1;
    dotsEl=h("div",{class:"iq-dots",role:"group","aria-label":"Навігація запитаннями"},z.items.map((x,n)=>h("button",{class:(answered(x)?"done ":"")+(n===z.i?"cur":""),"aria-label":"Запитання "+(n+1),"aria-current":n===z.i?"step":null,onclick:()=>{z.i=n;z.warn=false;paint();}},n+1)));
    const miss=z.items.filter(x=>!answered(x)).length;
    return [h("section",{class:"card pad iq-panel"},
      h("div",{class:"iq-meta"},lg(q.topic),h("span",{class:"chip"},QTYPES[q.type])),
      h("h3",{class:"iq-qt"},q.title),q.code?h("pre",{class:"iq-code"},h("code",{},q.code)):null,
      q.type==="multi"?h("p",{class:"iq-hint"},"Оберіть усі правильні відповіді."):q.type==="match"?h("p",{class:"iq-hint"},"До кожного пункту оберіть відповідний варіант."):null,
      body(it),
      z.warn&&last?h("div",{class:"iq-warn",role:"alert"},`Без відповіді залишилось: ${miss}. Завершити тест?`):null,
      h("div",{class:"iq-pg",role:"progressbar","aria-label":"Прогрес тесту","aria-valuemin":"1","aria-valuemax":String(z.items.length),"aria-valuenow":String(z.i+1)},
        h("i",{style:`width:${(z.i+1)/z.items.length*100}%`}),h("span",{},`Запитання ${z.i+1} з ${z.items.length}`))),
      h("div",{class:"iq-nav"},
        h("button",{class:"btn",disabled:z.i===0,onclick:()=>{z.i--;z.warn=false;paint();top();}},ic("l"),"Назад"),
        last?(z.warn?h("div",{class:"iq-nb"},h("button",{class:"btn",onclick:()=>{z.warn=false;paint();}},"Повернутись"),h("button",{class:"cta pri sm",onclick:()=>{z.done=true;paint();top();}},ic("check"),"Завершити все одно")):
          h("button",{class:"cta pri sm",onclick:()=>{if(z.items.some(x=>!answered(x))){z.warn=true;paint();}else{z.done=true;paint();top();}}},ic("check"),"Завершити тест")):
        h("button",{class:"cta pri sm",onclick:()=>{z.i++;paint();top();}},"Далі",ic("r"))),
      dotsEl];
  }
  function show(it){
    const q=it.q;
    if(q.type==="match")return h("ul",{class:"iq-rv"},it.pairs.map((p,k)=>{const ok=it.ans[k]===p.r;return h("li",{class:ok?"ok":"bad"},ic(ok?"check":"x"),h("div",{},h("b",{},p.l+" → "),it.ans[k]||h("i",{},"без відповіді"),ok?null:h("div",{class:"iq-right"},"Правильно: "+p.r)));}));
    const multi=q.type==="multi";
    return h("ul",{class:"iq-rv"},it.opts.map((o,k)=>{const picked=multi?it.ans.has(k):it.ans===k;const cls=o.ok?(picked?"ok":"miss"):(picked?"bad":"");
      return h("li",{class:cls},ic(o.ok?"check":picked?"x":"dot"),h("div",{},o.t,o.ok&&!picked?h("span",{class:"iq-tag"}," — правильна відповідь"):null));}));
  }
  function resultView(){
    const z=S.qz,res=z.items.map(grade),ok=res.filter(Boolean).length,n=z.items.length,pct=Math.round(ok/n*100);
    const msg=pct===100?"Чудово! Усі відповіді правильні.":pct>=75?"Дуже добре! Ви добре орієнтуєтесь у матеріалі.":pct>=50?"Непогано. Перегляньте запитання з помилками.":"Варто ще раз повторити тему — розбір нижче допоможе.";
    const by={};z.items.forEach((it,i)=>{const t=it.q.topic;by[t]=by[t]||[0,0];by[t][1]++;if(res[i])by[t][0]++;});
    return [h("section",{class:"card pad iq-res"},
      h("div",{class:"iq-ring",style:`--p:${pct}`},h("b",{},`${ok}/${n}`),h("span",{},pct+"%")),
      h("div",{class:"iq-rb"},h("h2",{},"Тест завершено"),h("p",{},msg),
        h("div",{class:"iq-bt"},Object.keys(by).map(k=>h("div",{class:"iq-bar"},lg(k),h("div",{class:"iq-track"},h("div",{style:`width:${by[k][0]/by[k][1]*100}%`})),h("span",{},`${by[k][0]}/${by[k][1]}`)))),
        h("div",{class:"iq-ra"},h("button",{class:"cta pri sm",onclick:begin},ic("undo"),"Пройти ще раз"),h("button",{class:"btn",onclick:()=>{S.qz=null;paint();top();}},"До початку")))),
      h("h3",{class:"iq-rh"},"Розбір відповідей"),
      ...z.items.map((it,i)=>h("article",{class:"card pad iq-rq "+(res[i]?"ok":"bad")},
        h("div",{class:"iq-meta"},h("span",{class:"iq-st"},ic(res[i]?"check":"x")),h("b",{},`Запитання ${i+1}`),lg(it.q.topic)),
        h("h4",{class:"iq-qt"},it.q.title),it.q.code?h("pre",{class:"iq-code"},h("code",{},it.q.code)):null,
        answered(it)?null:h("p",{class:"mu s"},"Ви не відповіли на це запитання."),
        show(it),it.q.explain?h("div",{class:"iq-ex"},h("b",{},"Пояснення: "),it.q.explain):null))];
  }
  paint();return wrap;
}

// =============================== ПРАКТИКА ===============================
const doneKey=(t,k)=>t.id+":"+k.id;
const isDone=(t,k)=>!!(ls.get("wl:done",{})[doneKey(t,k)]);
function markDone(t,k){const d=ls.get("wl:done",{});d[doneKey(t,k)]=1;ls.set("wl:done",d);}

function practiceView(ctx,topics,repaint){
  const {A,add,empty}=ctx;
  if(S.open){const t=topics.find(x=>x.id===S.open.tid),i=t?(t.tasks||[]).findIndex(k=>k.id===S.open.kid):-1;
    if(t&&i>=0)return workspace(ctx,t,i,repaint);S.open=null;}
  const langs=Object.keys(LANGS).filter(k=>A||topics.some(t=>t.lang===k));
  if(!langs.includes(S.lang))S.lang=langs[0]||"html";
  const list=topics.filter(t=>t.lang===S.lang);
  const wrap=h("div",{class:"ip"});
  wrap.append(h("div",{class:"ip-top"},
    h("div",{class:"tabs ip-langs",role:"tablist","aria-label":"Мова"},langs.map(k=>h("button",{role:"tab","aria-selected":String(S.lang===k),class:"lt tl-"+k+(S.lang===k?" on":""),onclick:()=>{S.lang=k;repaint();}},tech(k),LANGS[k],h("span",{class:"ip-n"},topics.filter(t=>t.lang===k).length)))),
    A?h("button",{class:"btn primary sm",onclick:()=>A.add("practice")},ic("plus"),"Додати тему"):null));
  if(!list.length){wrap.append(A?h("div",{class:"empty"},ic("plus"),h("p",{},"Тем із "+LANGS[S.lang]+" ще немає"),h("button",{class:"btn primary sm",onclick:()=>A.add("practice")},ic("plus"),"Додати тему")):h("div",{class:"empty"},ic("code"),h("p",{},"Практичні завдання з цієї мови з’являться згодом.")));return wrap;}
  wrap.append(h("div",{class:"ip-grid"},list.map((t,ti)=>{
    const tasks=t.tasks||[],done=tasks.filter(k=>isDone(t,k)).length;
    return h("article",{class:"card hv ip-topic tl-"+t.lang},h("div",{class:"ip-bar","aria-hidden":"true"}),
      h("div",{class:"ip-th"},h("span",{class:"ip-badge"},tech(t.lang)),
        h("div",{class:"ip-tt"},h("h3",{},t.title),tasks.length?h("span",{class:"mu s"},`Виконано ${done} із ${tasks.length}`):null)),
      t.desc?h("p",{class:"mu ip-d"},t.desc):null,
      tasks.length?h("div",{class:"ip-pb","aria-hidden":"true"},h("div",{style:`width:${done/tasks.length*100}%`})):null,
      tasks.length?h("ol",{class:"ip-tasks"},tasks.map((k,i)=>h("li",{},h("button",{class:"ip-task"+(isDone(t,k)?" done":""),onclick:()=>{S.open={tid:t.id,kid:k.id};repaint();window.scrollTo(0,0);}},
        h("span",{class:"ip-num"},isDone(t,k)?ic("check"):i+1),h("span",{class:"ip-tn"},k.title),ic("r"))))):h("p",{class:"mu s"},"У цій темі ще немає завдань."),
      A?h("div",{class:"ab"},
        h("button",{class:"btn sm",disabled:ti===0,"aria-label":"Вище",onclick:()=>A.move("practice",t,-1,list)},ic("up")),
        h("button",{class:"btn sm",disabled:ti===list.length-1,"aria-label":"Нижче",onclick:()=>A.move("practice",t,1,list)},ic("down")),
        h("button",{class:"btn sm",onclick:()=>A.edit("practice",t)},ic("edit"),"Змінити"),
        h("button",{class:"btn sm danger",onclick:()=>A.del("practice",t)},ic("trash"),"Видалити")):null);})));
  return wrap;
}

function workspace(ctx,topic,ti,repaint){
  const tasks=topic.tasks,task=tasks[ti];
  const root=h("div",{class:"ws"});
  const back=()=>{S.open=null;repaint();window.scrollTo(0,0);};
  const go=i=>{S.open={tid:topic.id,kid:tasks[i].id};repaint();window.scrollTo(0,0);};
  root.append(h("div",{class:"ws-top"},
    h("button",{class:"btn",onclick:back},ic("l"),"До тем"),
    h("div",{class:"ws-crumb"},lg(topic.lang),h("span",{},topic.title),h("b",{},`Завдання ${ti+1} з ${tasks.length}`)),
    h("div",{class:"ws-pn"},h("button",{class:"btn sm",disabled:ti===0,"aria-label":"Попереднє завдання",onclick:()=>go(ti-1)},ic("l")),h("button",{class:"btn sm",disabled:ti===tasks.length-1,"aria-label":"Наступне завдання",onclick:()=>go(ti+1)},ic("r")))));
  const side=h("aside",{class:"card ws-side tl-"+topic.lang,"aria-label":"Заняття теми"}),main=h("div",{class:"ws-main"});
  const paintSide=()=>{
    const done=tasks.filter(k=>isDone(topic,k)).length;
    side.replaceChildren(
      h("div",{class:"ws-sh"},h("span",{class:"ip-badge sm"},tech(topic.lang)),h("div",{class:"ws-st"},h("b",{},topic.title),h("span",{class:"mu s"},`Виконано ${done} із ${tasks.length}`))),
      h("div",{class:"ip-pb","aria-hidden":"true"},h("div",{style:`width:${done/tasks.length*100}%`})),
      h("ol",{class:"ws-nav"},tasks.map((k,i)=>h("li",{},h("button",{class:"ws-si"+(i===ti?" cur":"")+(isDone(topic,k)?" done":""),"aria-current":i===ti?"step":null,onclick:()=>go(i)},
        h("span",{class:"ip-num"},isDone(topic,k)?ic("check"):i+1),h("span",{class:"ip-tn"},k.title))))));
  };
  paintSide();
  main.append(h("div",{class:"loading",role:"status"},h("span",{class:"spin"}),"Завантаження редактора…"));
  root.append(h("div",{class:"ws-body"},side,main));
  build();
  return root;

  async function build(){
    const base={html:task.html||"",css:task.css||"",js:task.js||""};
    let edit=(task.edit&&task.edit.length)?task.edit:[topic.lang];
    let tabs=["html","css","js"].filter(k=>edit.includes(k)||base[k].trim());
    if(!tabs.length)tabs=[edit[0]];
    const skey=`wl:code:${topic.id}:${task.id}`,baseSig=JSON.stringify(base),saved=ls.get(skey,null);
    const start={...base};if(saved&&saved.base===baseSig)edit.forEach(k=>{if(typeof saved.files[k]==="string")start[k]=saved.files[k];});
    const eds={},panes={},tbtn={};let cur=tabs.find(k=>edit.includes(k))||tabs[0];
    const getFiles=()=>{const f={};["html","css","js"].forEach(k=>f[k]=eds[k]?eds[k].get():base[k]);return f;};
    const autorun=!edit.includes("js");
    let t1=null,rseq=0;
    const persist=()=>{const f=getFiles(),o={};edit.forEach(k=>o[k]=f[k]);ls.set(skey,{base:baseSig,files:o});};
    const onChange=()=>{clearTimeout(t1);t1=setTimeout(()=>{persist();if(autorun)run();},autorun?500:600);};
    for(const k of tabs)eds[k]=await createEditor({lang:k,value:start[k],readOnly:!edit.includes(k),onChange});

    // --- елементи ---
    const frame=h("iframe",{class:"pv-frame",sandbox:"allow-scripts",title:"Результат",referrerpolicy:"no-referrer"});
    const con=h("div",{class:"pv-con",role:"log","aria-live":"polite"});
    const logLine=(lvl,txt)=>{con.append(h("div",{class:"pv-l "+lvl},txt));con.scrollTop=con.scrollHeight;};
    const errTxt=e=>`${e.msg}${e.line?` (рядок ${e.line})`:""}`;
    const emptyCon=()=>{con.replaceChildren();con.dataset.empty="1";};
    const hooks={onLog:d=>{con.dataset.empty="";logLine(d.level,d.text);},onError:e=>{con.dataset.empty="";logLine("error","Помилка: "+errTxt(e));}};
    const run=async()=>{const s=++rseq;emptyCon();await runInFrame(frame,getFiles(),hooks);if(s!==rseq)return;};

    const res=h("section",{class:"card pad ws-res",hidden:true,"aria-live":"polite"});
    const showRes=r=>{
      const nOk=r.items.filter(i=>i.ok).length;
      const errs=r.syntax.filter(s=>!s.warn),warns=r.syntax.filter(s=>s.warn);
      Object.keys(eds).forEach(k=>eds[k].mark(r.syntax.filter(s=>s.lang.toLowerCase()===k&&s.line).map(s=>s.line)));
      const jump=s=>{const k=s.lang.toLowerCase();if(eds[k]){pick(k);if(s.line)eds[k].goto(s.line);}};
      const nxt=ti<tasks.length-1;
      res.hidden=false;
      res.className="card pad ws-res "+(r.pass?"ok":"bad");
      res.replaceChildren(...[
        h("div",{class:"ws-rh"},h("span",{class:"ws-ri"},ic(r.pass?"check":"x")),h("div",{},
          h("h3",{},r.pass?"Чудово! Завдання виконано":"Ще трохи — і вийде"),
          h("p",{class:"mu"},r.pass?"Усі перевірки пройдено, код без помилок.":(r.items.length?`Виконано пунктів: ${nOk} з ${r.items.length}.`:"")+(errs.length?" У коді є помилки — вони нижче.":" Прочитайте підказки нижче й спробуйте ще раз.")))),
        errs.length?h("div",{class:"ws-grp"},h("h4",{},"Помилки в коді"),h("ul",{class:"ws-list"},errs.map(s=>h("li",{class:"bad"},ic("x"),h("button",{class:"ws-link",onclick:()=>jump(s)},`${s.lang}${s.line?`, рядок ${s.line}`:""}`),h("span",{},s.msg))))):null,
        warns.length?h("div",{class:"ws-grp"},h("h4",{},"Зауваження"),h("ul",{class:"ws-list"},warns.map(s=>h("li",{class:"warn"},ic("bulb"),h("button",{class:"ws-link",onclick:()=>jump(s)},`${s.lang}${s.line?`, рядок ${s.line}`:""}`),h("span",{},s.msg))))):null,
        r.items.length?h("div",{class:"ws-grp"},h("h4",{},"Що перевірено"),h("ul",{class:"ws-list"},r.items.map(i=>h("li",{class:i.ok?"ok":"bad"},ic(i.ok?"check":"x"),h("span",{},h("b",{},i.label),i.ok?null:h("div",{class:"ws-hint"},i.hint)))))):null,
        r.pass?h("div",{class:"ws-ra"},nxt?h("button",{class:"cta pri sm",onclick:()=>go(ti+1)},"Наступне завдання",ic("r")):h("button",{class:"cta pri sm",onclick:back},ic("check"),"Тема завершена — до тем"),h("button",{class:"btn",onclick:()=>res.hidden=true},"Залишитись")):null].filter(Boolean));
      if(r.pass){markDone(topic,task);paintSide();}
      res.scrollIntoView({block:"nearest",behavior:"smooth"});
    };
    const chk=h("button",{class:"cta pri sm"},ic("check"),"Перевірити");
    chk.onclick=async()=>{chk.disabled=true;chk.lastChild.textContent="Перевіряємо…";const s=++rseq;emptyCon();
      try{const r=await validateTask(frame,getFiles(),{...task,edit},hooks);if(s===rseq)showRes(r);}
      catch(e){res.hidden=false;res.className="card pad ws-res bad";res.replaceChildren(h("p",{},"Не вдалося виконати перевірку: "+(e.message||e)));}
      chk.disabled=false;chk.lastChild.textContent="Перевірити";};
    const runB=autorun?null:h("button",{class:"btn primary"},ic("play"),"Запустити");
    if(runB)runB.onclick=()=>{persist();run();};
    let rt=null;
    const reset=h("button",{class:"btn ghost"},ic("undo"),h("span",{},"Скинути"));
    reset.onclick=()=>{if(!rt){reset.lastChild.textContent="Точно скинути?";reset.classList.add("danger");rt=setTimeout(()=>{rt=null;reset.lastChild.textContent="Скинути";reset.classList.remove("danger");},3000);return;}
      clearTimeout(rt);rt=null;reset.lastChild.textContent="Скинути";reset.classList.remove("danger");edit.forEach(k=>eds[k]&&eds[k].set(base[k]));ls.set(skey,null);res.hidden=true;run();};

    // --- вкладки редактора ---
    const tabBar=h("div",{class:"ed-tabs",role:"tablist","aria-label":"Файли"});
    const stack=h("div",{class:"ed-stack"});
    const pick=k=>{cur=k;tabs.forEach(t=>{tbtn[t].classList.toggle("on",t===k);tbtn[t].setAttribute("aria-selected",String(t===k));panes[t].hidden=t!==k;});eds[k].refresh();};
    tabs.forEach(k=>{tbtn[k]=h("button",{role:"tab",class:"ed-tab",onclick:()=>pick(k)},LANGS[k],edit.includes(k)?null:h("span",{class:"ed-lock",title:"Лише для перегляду"},ic("lock")));tabBar.append(tbtn[k]);
      panes[k]=h("div",{class:"ed-pane"},eds[k].el);stack.append(panes[k]);});

    // --- підказка та розв'язок ---
    const sol=task.sol||{},hasSol=task.showSol!==false&&["html","css","js"].some(k=>(sol[k]||"").trim());
    const extra=[];
    if(task.hint&&task.hint.trim())extra.push(h("details",{class:"ws-det"},h("summary",{},ic("bulb"),"Підказка"),h("div",{class:"ws-dd"},...rich(task.hint))));
    if(hasSol)extra.push(h("details",{class:"ws-det"},h("summary",{},ic("eye"),"Показати розв’язок"),h("div",{class:"ws-dd"},
      ...["html","css","js"].filter(k=>(sol[k]||"").trim()).map(k=>h("div",{},h("div",{class:"ws-sl"},lg(k)),h("pre",{class:"iq-code"},h("code",{},sol[k])))),
      h("button",{class:"btn sm",onclick:()=>{["html","css","js"].forEach(k=>{if(edit.includes(k)&&(sol[k]||"").trim())eds[k].set(sol[k]);});persist();run();}},ic("copy"),"Вставити розв’язок у редактор"))));

    const task_card=h("section",{class:"card pad ws-task"},h("h2",{},task.title),h("div",{class:"ws-desc"},...rich(task.desc)),...extra);
    const pvTabs=h("div",{class:"ed-tabs"}),pvRes=h("div",{class:"pv-pane"},frame),pvCon=h("div",{class:"pv-pane",hidden:true},con);
    const pvB=[["Результат",pvRes],["Консоль",pvCon]].map(([l,p],n)=>{const b=h("button",{class:"ed-tab"+(n?"":" on"),onclick:()=>{pvB.forEach((x,m)=>{x[0].classList.toggle("on",m===n);x[1].hidden=m!==n;});}},l);return [b,p];});
    pvB.forEach(x=>pvTabs.append(x[0]));
    const grid=h("div",{class:"ws-grid"},
      h("section",{class:"card ws-ed"},tabBar,stack,h("div",{class:"ws-tb"},chk,runB,reset)),
      h("section",{class:"card ws-pv"},pvTabs,pvRes,pvCon));
    main.querySelector(".loading").remove();
    main.append(task_card,grid,res);
    pick(cur);run();
  }
}
