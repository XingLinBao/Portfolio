import {load,cache,MONTHS,MONTHS_GEN,getSched} from "./data.js";
import {buildInteractive} from "./interactive.js";
export const h=(t,a={},...c)=>{const e=document.createElement(t);
 for(const[k,v]of Object.entries(a)){if(v==null||v===false)continue;if(k==="class")e.className=v;else if(k.startsWith("on"))e.addEventListener(k.slice(2),v);else e.setAttribute(k,v===true?"":v);}
 c.flat().forEach(x=>{if(x!=null&&x!==false)e.append(x.nodeType?x:document.createTextNode(x));});return e;};
const P={user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
award:'<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/>',
globe:'<circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20M12 2v20M4 6.500c2.300 1.300 5 2 8 2s5.700-.7 8-2M4 17.500c2.300-1.300 5-2 8-2s5.700.7 8 2"/>',
bulb:'<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
trophy:'<path d="M6 9H4a2 2 0 0 1-2-2V4h4M18 9h2a2 2 0 0 0 2-2V4h-4M6 4h12v6a6 6 0 0 1-12 0zM12 16v3M8 22h8M9 19h6"/>',
mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
phone:'<path d="M22 17v3a2 2 0 0 1-2 2A19 19 0 0 1 2 4a2 2 0 0 1 2-2h3l2 5-2 2a14 14 0 0 0 6 6l2-2 5 2z"/>',
pin:'<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
book:'<path d="M2 4h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
cap:'<path d="M22 10 12 5 2 10l10 5zM6 12v5c3 2 9 2 12 0v-5"/>',
camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
star:'<path d="m12 2 3 7 7 .6-5.3 4.6L18.300 22 12 18l-6.300 4 1.600-7.800L2 9.600 9 9z"/>',
ext:'<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>',
x:'<path d="M18 6 6 18M6 6l12 12"/>',l:'<path d="m15 18-6-6 6-6"/>',r:'<path d="m9 18 6-6-6-6"/>',
plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M12 20h9M16.500 3.500a2.100 2.100 0 0 1 3 3L7 19l-4 1 1-4z"/>',
trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
img:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.500" cy="8.500" r="1.500"/><path d="m21 15-5-5L5 21"/>',
medal:'<circle cx="12" cy="15" r="6"/><path d="M8.500 2h7L12 9z"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',video:'<path d="m22 8-6 4 6 4z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',code:'<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',play:'<path d="m6 4 14 8-14 8z"/>',home:'<path d="m3 11 9-8 9 8M5 10v10h14V10"/>',check:'<path d="m5 13 4 4L19 7"/>',undo:'<path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 3-6.700"/>',up:'<path d="m6 15 6-6 6 6"/>',down:'<path d="m6 9 6 6 6-6"/>',lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',dot:'<circle cx="12" cy="12" r="2"/>',layout:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.300-4.300"/>',adown:'<path d="M12 5v14M19 12l-7 7-7-7"/>',eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>'};
export const ic=n=>{const s=h("span",{class:"ic","aria-hidden":"true"});s.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${P[n]||""}</svg>`;return s;};
const SEC={about:{t:"Головна",i:"home"},lessons:{t:"Інтерактивні заняття",i:"code"},schedule:{t:"Розклад",i:"cal"},
works:{t:"Студентські роботи",i:"layout",cols:["studentWorks"]},me:{t:"Про викладача",i:"user",g:"me"},
cert:{t:"Підвищення кваліфікації",i:"award",g:"me",cols:["certificates"]},pub:{t:"Інноваційна робота",i:"bulb",g:"me",cols:["publications"]},
stud:{t:"Робота зі студентами",i:"users",g:"me",cols:["studentArticles","events"]},awards:{t:"Нагороди",i:"trophy",g:"me",cols:["awards"]}};
const LBL={certificates:"Переглянути сертифікат",publications:"Переглянути публікацію",studentArticles:"Переглянути матеріали",events:"Переглянути матеріали",awards:"Переглянути документ"};
const fmt=r=>r.month?(r.day?`${r.day} ${MONTHS_GEN[r.month-1]} ${r.year}`:`${MONTHS[r.month-1]} ${r.year}`):`${r.year||""}`;
const key=r=>(r.year||0)*10000+(r.month||0)*100+(r.day||0);
const sorted=a=>[...(a||[])].sort((x,y)=>key(y)-key(x)||(y.createdAt||0)-(x.createdAt||0));
const period=a=>{const y=a.map(r=>r.year).filter(Boolean);if(!y.length)return"—";const m=Math.min(...y),M=Math.max(...y);return m===M?""+m:m+"–"+M;};
const sum=(a,k)=>a.reduce((s,r)=>s+(+r[k]||0),0);
const typ=(a,...t)=>a.filter(r=>t.includes((r.type||"").toLowerCase())).length;

export function gallery(ph,start=0){
 let i=start;const prev=document.activeElement;
 const img=h("img",{alt:""}),cnt=h("div",{class:"gcount"}),th=h("div",{class:"gthumbs"});
 const go=n=>{i=(n+ph.length)%ph.length;img.src=ph[i];img.alt="Фото "+(i+1);cnt.textContent=`${i+1} / ${ph.length}`;[...th.children].forEach((t,k)=>t.classList.toggle("on",k===i));};
 ph.forEach((s,k)=>th.append(h("button",{class:"gth","aria-label":"Фото "+(k+1),onclick:()=>go(k)},h("img",{src:s,alt:""}))));
 const closeB=h("button",{class:"gx","aria-label":"Закрити",onclick:()=>close()},ic("x"));
 const many=ph.length>1;
 const ov=h("div",{class:"gal",role:"dialog","aria-modal":"true","aria-label":"Галерея"},closeB,cnt,
  h("div",{class:"gstage"},many&&h("button",{class:"gnav l","aria-label":"Назад",onclick:()=>go(i-1)},ic("l")),img,many&&h("button",{class:"gnav r","aria-label":"Вперед",onclick:()=>go(i+1)},ic("r"))),many&&th);
 const kd=e=>{if(e.key==="Escape"){e.stopPropagation();close();}else if(many&&e.key==="ArrowLeft")go(i-1);else if(many&&e.key==="ArrowRight")go(i+1);};
 function close(){document.removeEventListener("keydown",kd,true);ov.remove();document.body.classList.remove("lock");prev&&prev.focus&&prev.focus();}
 ov.addEventListener("click",e=>{if(e.target===ov||e.target.classList.contains("gstage"))close();});
 document.addEventListener("keydown",kd,true);document.body.append(ov);document.body.classList.add("lock");go(i);closeB.focus();
}
function slider(ph,alt){
 let i=0,x0=null;const tr=h("div",{class:"track"}),dots=h("div",{class:"dots"});
 ph.forEach((s,n)=>{tr.append(h("img",{src:s,alt:`${alt} — фото ${n+1}`,loading:"lazy",onclick:()=>gallery(ph,n)}));dots.append(h("button",{"aria-label":"Фото "+(n+1),onclick:e=>{e.stopPropagation();go(n);}}));});
 const go=n=>{i=(n+ph.length)%ph.length;tr.style.transform=`translateX(-${i*100}%)`;[...dots.children].forEach((d,k)=>d.classList.toggle("on",k===i));};
 const box=h("div",{class:"slider",tabindex:"0","aria-roledescription":"слайдер",onkeydown:e=>{if(e.key==="ArrowLeft")go(i-1);if(e.key==="ArrowRight")go(i+1);},
  ontouchstart:e=>{x0=e.touches[0].clientX;},ontouchend:e=>{if(x0==null)return;const d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>40)go(i+(d<0?1:-1));x0=null;}},
  tr,h("button",{class:"sa l","aria-label":"Попереднє фото",onclick:()=>go(i-1)},ic("l")),h("button",{class:"sa r","aria-label":"Наступне фото",onclick:()=>go(i+1)},ic("r")),dots);
 go(0);return box;
}
function media(ph,alt,tag){
 const m=h("div",{class:"media"});
 if(!ph.length)m.append(h("div",{class:"ph"},ic("img")));
 else if(ph.length===1)m.append(h("img",{src:ph[0],alt,loading:"lazy",tabindex:"0",onclick:()=>gallery(ph,0),onkeydown:e=>{if(e.key==="Enter")gallery(ph,0);}}));
 else m.append(slider(ph,alt));
 if(tag)m.append(h("span",{class:"tag"},tag));return m;
}
const stat=(i,c,v,l)=>h("div",{class:"stat"},h("span",{class:"si c-"+c},ic(i)),h("b",{},v),h("span",{},l));
const lk=(col,r)=>/^https:\/\//.test(r.link||"")?h("a",{class:"lk",href:r.link,target:"_blank",rel:"noopener"},LBL[col],ic("ext")):null;

const DN=["Понеділок","Вівторок","Середа","Четвер","П’ятниця","Субота"],MS=["січ.","лют.","бер.","квіт.","трав.","черв.","лип.","серп.","вер.","жовт.","лист.","груд."];
const pad=n=>String(n).padStart(2,"0");
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const addDays=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
const mondayOf=d=>addDays(d,-((d.getDay()+6)%7));
const dm=d=>`${pad(d.getDate())}.${pad(d.getMonth()+1)}`;
const fd=d=>`${d.getDate()} ${MS[d.getMonth()]}`;
const fmtPair=s=>String(s).replace(/\s*[-–—]\s*/," — ");
function isoWeek(d){const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const n=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-n);const y0=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil(((t-y0)/864e5+1)/7);}
function weekNo(mon,sc){if(sc.start){const p=sc.start.split("-").map(Number);return Math.round((mon-mondayOf(new Date(p[0],p[1]-1,p[2])))/604800000)+1;}return isoWeek(mon);}
const names=r=>r.students&&r.students.length?r.students:(r.student?[r.student]:[]);
const subjLinks=s=>{const a=[["materials","Матеріали курсу","book"],["program","Робоча програма","file"]].filter(x=>/^https:\/\//.test(s[x[0]]||"")).map(x=>h("a",{href:s[x[0]],target:"_blank",rel:"noopener"},ic(x[2]),x[1]));return a.length?h("div",{class:"sl"},a):null;};
const PER=8,PG={};
/* Список карток: не більше PER на сторінці, внизу — перемикач сторінок. mk(items) повертає вузол зі списком. */
function paged(key,items,mk){
 const box=h("div",{class:"pgd"}),pager=h("nav",{class:"wk-pg","aria-label":"Сторінки"}),pages=Math.max(1,Math.ceil(items.length/PER));
 function paint(){
  const p=PG[key]=Math.min(Math.max(1,PG[key]||1),pages);
  const go=n=>{PG[key]=n;paint();box.scrollIntoView({behavior:"smooth",block:"start"});};
  const nums=[];for(let i=1;i<=pages;i++)if(pages<=7||i===1||i===pages||Math.abs(i-p)<=1)nums.push(i);
  const mid=[];nums.forEach((n,k)=>{if(k&&n-nums[k-1]>1)mid.push(h("span",{class:"pg-gap","aria-hidden":"true"},"…"));
   mid.push(h("button",{class:"pgb"+(n===p?" on":""),type:"button","aria-label":"Сторінка "+n,"aria-current":n===p?"page":null,onclick:()=>go(n)},n));});
  box.replaceChildren(mk(items.slice((p-1)*PER,p*PER)),pager);
  pager.replaceChildren(...(pages>1?[
   h("button",{class:"pgb",type:"button","aria-label":"Попередня сторінка",disabled:p===1,onclick:()=>go(p-1)},ic("l")),...mid,
   h("button",{class:"pgb",type:"button","aria-label":"Наступна сторінка",disabled:p===pages,onclick:()=>go(p+1)},ic("r"))]:[]));
 }
 paint();return box;
}
export function mount(root,opts={}){
 const A=opts.admin;let st=cache,tab="studentArticles";
 const nav=h("nav",{class:"menu","aria-label":"Розділи"}),sub=h("div",{class:"brand-s"}),
  help=h("div",{class:"help"}),crumb=h("div",{class:"crumb"}),
  burger=h("button",{class:"burger",type:"button","aria-label":"Меню","aria-controls":"nav","aria-expanded":"false"},ic("menu")),
  scrim=h("div",{class:"scrim"}),view=h("main",{class:"wrap"}),foot=h("footer",{class:"foot"}),
  side=h("header",{class:"side",id:"side"},h("div",{class:"hd-in"},h("a",{class:"brand",href:"#about"},h("span",{class:"logo"},ic("code")),h("span",{class:"brand-t"},"WEB.LAB")),burger,nav,help)),
  shell=h("div",{class:"app"},side,scrim,h("div",{class:"col"},view,foot));
 nav.id="nav";root.append(shell);
 const openNav=o=>{shell.classList.toggle("nav-open",o);burger.setAttribute("aria-expanded",String(o));};
 burger.addEventListener("click",()=>openNav(!shell.classList.contains("nav-open")));
 scrim.addEventListener("click",()=>openNav(false));
 document.addEventListener("keydown",e=>{if(e.key==="Escape")openNav(false);});
 nav.addEventListener("click",e=>{if(e.target.closest("a"))openNav(false);});
 const cnt=k=>SEC[k].cols?SEC[k].cols.reduce((a,c)=>a+(st[c]||[]).length,0):1;
 const vis=()=>Object.keys(SEC).filter(k=>k==="about"||A||cnt(k)>0);
 const ab=(col,r)=>A?h("div",{class:"ab"},h("button",{class:"btn sm",onclick:()=>A.edit(col,r)},ic("edit"),"Змінити"),h("button",{class:"btn sm danger",onclick:()=>A.del(col,r)},ic("trash"),"Видалити")):null;
 const add=(col,l="Додати")=>A?h("button",{class:"btn primary sm",onclick:()=>A.add(col)},ic("plus"),l):null;
 const empty=(col,l)=>h("div",{class:"empty"},ic("plus"),h("p",{},"Додайте перший запис"),add(col,l));
 const banner=(k,t,d,...btn)=>h("section",{class:"banner"},h("div",{class:"bh"},h("span",{class:"bi"},ic(SEC[k].i)),h("h1",{},t)),h("p",{},d),btn.some(Boolean)?h("div",{class:"bb"},btn):null);
 const grid=(c,cls="")=>h("div",{class:"grid "+cls},c);
 const secCard=(i,c,t,col,body)=>h("section",{class:"card pad"},h("div",{class:"sch"},h("span",{class:"si big c-"+c},ic(i)),h("h2",{},t),add(col)),body);

 const TECH={
  html:'<svg viewBox="0 0 64 72" aria-hidden="true"><path d="M4 4h56l-5 56-23 8-23-8z" fill="#e34f26"/><path d="M32 8v56l18-6 4-50z" fill="#ef652a"/><text x="32" y="47" text-anchor="middle" font-size="30" font-weight="800" fill="#fff" font-family="Unbounded,Manrope,sans-serif">5</text></svg>',
  css:'<svg viewBox="0 0 64 72" aria-hidden="true"><path d="M4 4h56l-5 56-23 8-23-8z" fill="#1572b6"/><path d="M32 8v56l18-6 4-50z" fill="#33a9dc"/><text x="32" y="47" text-anchor="middle" font-size="30" font-weight="800" fill="#fff" font-family="Unbounded,Manrope,sans-serif">3</text></svg>',
  js:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="10" fill="#f7df1e"/><text x="58" y="56" text-anchor="end" font-size="28" font-weight="800" fill="#1a1a1a" font-family="Unbounded,Manrope,sans-serif">JS</text></svg>'};
 const tech=(k,cls="")=>{const e=h("span",{class:"tb "+k+" "+cls});e.innerHTML=TECH[k];return e;};
 const sp=(c,t)=>h("span",{class:"k-"+c},t);
 const codeWin=()=>h("div",{class:"cw","aria-hidden":"true"},h("div",{class:"cw-h"},h("i"),h("i"),h("i"),h("span",{},"index.html")),
  h("pre",{},h("code",{},sp("t","<h1"),sp("a"," class"),"=",sp("s",'"hero"'),sp("t",">"),"Hello, WebLab!",sp("t","</h1>"),"\n",
  sp("p",".hero")," {\n  ",sp("a","color"),": ",sp("s","#7c3aed"),";\n}\n\n",sp("k","button"),".onclick = () => ",sp("f","alert"),"(",sp("s",'"Привіт!"'),");")));
 const soon=(t,d,i)=>[h("section",{class:"soon"},h("span",{class:"soon-i"},ic(i)),h("h1",{},t),h("p",{},d),h("span",{class:"chip"},"Незабаром"))];
 const sh=(i,c,t,col)=>h("div",{class:"sch"},h("span",{class:"si big c-"+c},ic(i)),h("h2",{},t),col?add(col):null);
 function homeBanner(){
  const p=st.profile||{};
  return h("section",{class:"hbanner"},
   h("div",{class:"hb-l"},
    h("h1",{},"Навчаємо створювати ",h("span",{class:"grad"},"сучасні вебрішення")),
    h("p",{},"Освітній простір з веброзробки: інтерактивні заняття, завдання й матеріали з HTML, CSS та JavaScript для студентів і колег-педагогів."),
    h("div",{class:"hb-b"},h("a",{class:"cta light",href:"#lessons"},ic("play"),"Інтерактивні заняття"),h("a",{class:"cta glass",href:"#schedule"},ic("cal"),"Розклад")),
    h("div",{class:"hb-tech"},[["html","HTML"],["css","CSS"],["js","JavaScript"]].map(x=>h("span",{class:"tp"},tech(x[0]),x[1])))),
   h("div",{class:"hb-r"},codeWin(),tech("html","fb"),tech("css","fb"),tech("js","fb")));
 }
 function journalBanner(){
  const shot=h("img",{src:"img/journal.png",alt:"Електронний журнал: приклад сторінки студента",loading:"lazy",onerror:e=>e.target.closest(".jbanner").classList.add("no-shot")});
  return h("section",{class:"jbanner"},
   h("div",{class:"jb-l"},
    h("span",{class:"jb-tag"},ic("cap"),"Для студентів"),
    h("h2",{},"Ти студент і хочеш дізнатись свої оцінки?"),
    h("p",{},"Зареєструйся в електронному журналі — оцінки, відвідуваність і результати завдань завжди під рукою."),
    h("a",{class:"cta light",href:"https://zhongbaolin.github.io/Journal/index-student.html",target:"_blank",rel:"noopener noreferrer"},ic("ext"),"Перейти до журналу")),
   h("div",{class:"jb-r","aria-hidden":"true"},h("div",{class:"jb-shot"},shot)));
 }
 function disciplines(){
  const sb=[...(st.subjects||[])].sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
  if(!sb.length&&!A)return null;
  const PAL=[["#2563eb","#06b6d4","blue","book"],["#f59e0b","#f97316","amb","code"],["#10b981","#06b6d4","green","file"],["#a855f7","#ec4899","pur","bulb"],["#f43f5e","#f97316","red","star"],["#6366f1","#8b5cf6","blue","cap"]];
  return h("section",{class:"blk"},sh("book","blue","Дисципліни","subjects"),
   sb.length?h("div",{class:"dgrid"},sb.map((s,i)=>{const p=PAL[i%PAL.length];
    return h("article",{class:"dcard hv",style:`--a1:${p[0]};--a2:${p[1]};--glow:${p[0]}88`},h("div",{class:"dbar"}),
     h("div",{class:"dcb"},h("div",{class:"dh"},h("span",{class:"si big c-"+p[2]},ic(/інтернет/i.test(s.name)?"globe":p[3])),h("h3",{},s.name)),subjLinks(s),ab("subjects",s)));})):empty("subjects"));
 }
 function about(){
  const p=st.profile||{};
  const ct=h("ul",{class:"ct"});
  if(p.email)ct.append(h("li",{},ic("mail"),h("a",{href:"mailto:"+p.email},p.email)));
  if(p.phone)ct.append(h("li",{},ic("phone"),h("a",{href:"tel:"+p.phone.replace(/[^\d+]/g,"")},p.phone)));
  if(p.address)ct.append(h("li",{},ic("pin"),p.address));
  const hero=h("section",{class:"card hero"},h("div",{class:"hero-ph"},p.photo?h("img",{src:p.photo,alt:p.fullName||"Фото викладача"}):h("div",{class:"ph"},ic("user"))),
   h("div",{class:"hero-b"},h("h1",{},p.fullName||"ПІБ не вказано"),p.position?h("p",{class:"pos"},p.position):null,ct,
   p.about?h("div",{class:"about"},h("h2",{},"Про мене"),h("p",{},p.about)):null,
   A?h("button",{class:"btn primary sm",onclick:A.profile},ic("edit"),"Змінити профіль"):null));
  const out=[h("section",{class:"blk"},sh("user","pur","Про викладача"),hero)],ed=sorted(st.education);
  if(ed.length||A)out.push(secCard("cap","blue","Освіта","education",ed.length?h("div",{class:"tl"},ed.map(e=>h("div",{class:"tli"},h("div",{class:"tli-r"},h("div",{class:"tli-t"},h("h3",{},e.degree),h("p",{class:"mu"},e.place),h("span",{class:"yr"},e.year)),e.photos&&e.photos.length?h("button",{class:"dipl",type:"button","aria-label":"Переглянути фото диплома",onclick:()=>gallery(e.photos,0)},h("img",{src:e.photos[0],alt:"Диплом: "+e.degree}),e.photos.length>1?h("span",{},"+"+(e.photos.length-1)):null):null),ab("education",e)))):empty("education")));
  return out.filter(Boolean);
 }
 function home(){return [homeBanner(),disciplines(),journalBanner()].filter(Boolean);}
 function cert(){
  const a=sorted(st.certificates);
  return [banner("cert","Підвищення кваліфікації","Систематично підвищую свою кваліфікацію, беру участь у тренінгах, семінарах та курсах для покращення професійної майстерності.",add("certificates")),
  h("div",{class:"stats s3"},stat("award","blue",a.length,"Сертифікатів отримано"),stat("cal","green",sum(a,"hours"),"Годин навчання"),stat("star","pur",period(a),"Період навчання")),
  a.length?paged("cert",a,l=>grid(l.map(r=>h("article",{class:"card hv"},media(r.photos||[],r.title),h("div",{class:"cb"},h("h3",{},r.title),h("p",{class:"mu"},r.org),
   h("div",{class:"ft"},h("span",{class:"dt"},ic("cal"),fmt(r)),r.hours?h("span",{class:"chip"},r.hours+" год."):null),lk("certificates",r),ab("certificates",r)))))):empty("certificates")];
 }
 function pub(){
  const a=sorted(st.publications);
  return [banner("pub","Інноваційна робота викладача","Публікації у наукових виданнях і збірниках, методичні розробки, участь у конференціях і засіданнях та інші напрацювання у сфері педагогіки та освіти.",add("publications")),
  h("div",{class:"stats s5"},stat("file","pur",typ(a,"стаття"),"Статей"),stat("book","blue",typ(a,"монографія"),"Монографій"),stat("edit","green",typ(a,"методична розробка","посібник"),"Методичних"),stat("users","amb",typ(a,"участь у конференції","участь у засіданні","інша діяльність"),"Участь у заходах"),stat("bulb","blue",a.length,"Всього")),
  a.length?paged("pub",a,l=>grid(l.map(r=>h("article",{class:"card hv"},media(r.photos||[],r.title,r.type),h("div",{class:"cb"},h("h3",{},r.title),h("p",{class:"mu"},[r.publisher,fmt(r)].filter(Boolean).join(", ")),lk("publications",r),ab("publications",r)))),"feature")):empty("publications")];
 }
 function stud(){
  const ar=sorted(st.studentArticles),ev=sorted(st.events);
  const tabs=[["studentArticles","Статті студентів","file",ar],["events","Екскурсії та заходи","camera",ev]].filter(t=>A||t[3].length);
  if(!tabs.find(t=>t[0]===tab))tab=tabs[0][0];
  const body=tab==="studentArticles"?(ar.length?paged("sa",ar,l=>h("div",{class:"list"},l.map(r=>h("article",{class:"card hv sa-card"},r.photos&&r.photos.length?media(r.photos,r.title):null,h("div",{class:"cb"},
   h("div",{class:"who"},h("span",{class:"si c-green"},ic("users")),h("div",{},h("b",{},r.group?"Група "+r.group:(names(r)[0]||"Студент")),h("div",{class:"mu s"},r.year))),(r.group||names(r).length>1)&&names(r).length?h("ul",{class:"stl"},names(r).map(n=>h("li",{},n))):null,h("h3",{},r.title),r.venue?h("p",{class:"mu"},r.venue):null,
   r.award?h("span",{class:"chip amb"},ic("award"),r.award):null,lk("studentArticles",r),ab("studentArticles",r)))))):empty("studentArticles","Додати статтю")):
   (ev.length?paged("ev",ev,l=>grid(l.map(r=>h("article",{class:"card hv"},media(r.photos||[],r.title,r.type),h("div",{class:"cb"},h("h3",{},r.title),
   h("div",{class:"ft"},h("span",{class:"dt"},ic("cal"),fmt(r)),r.count?h("span",{class:"dt g"},ic("users"),r.count):null),lk("events",r),ab("events",r)))))):empty("events","Додати захід"));
  return [banner("stud","Робота зі студентами","Наукове керівництво студентськими роботами, організація екскурсій, конференцій та інших освітніх заходів.",add("studentArticles","Додати статтю"),add("events","Додати захід")),
  h("div",{class:"stats s4"},stat("file","green",ar.length,"Статей студентів"),stat("camera","blue",ev.length,"Заходів проведено"),stat("award","amb",ar.filter(r=>r.award).length,"Нагород отримано"),stat("users","pur",sum(ev,"count"),"Учасників")),
  h("div",{class:"tabs",role:"tablist"},tabs.map(t=>h("button",{role:"tab","aria-selected":t[0]===tab,class:t[0]===tab?"on":"",onclick:()=>{tab=t[0];draw("stud");}},ic(t[2]),t[1]))),body];
 }
 function awards(){
  const a=sorted(st.awards);
  return [banner("awards","Нагороди викладача","Визнання професійних досягнень, нагороди та відзнаки за внесок у розвиток освіти та педагогічної науки.",add("awards")),
  h("div",{class:"stats s4"},stat("trophy","amb",a.length,"Всього нагород"),stat("medal","pur",typ(a,"почесна грамота","подяка"),"Грамоти та подяки"),stat("star","blue",typ(a,"диплом","сертифікат"),"Дипломи та сертифікати"),stat("cal","green",period(a),"Період отримання")),
  a.length?paged("aw",a,l=>h("div",{class:"hlist"},l.map(r=>h("article",{class:"card hv aw"},media(r.photos||[],r.title),h("div",{class:"cb"},h("div",{class:"awt"},h("span",{class:"si big c-amb"},ic("trophy")),h("span",{class:"chip solid"},fmt(r))),
   h("h3",{},r.title),r.desc?h("p",{class:"mu"},r.desc):null,r.type?h("span",{class:"chip"},ic("medal"),r.type):null,lk("awards",r),ab("awards",r)))))):empty("awards")];
 }

 /* ---------- Студентські роботи ---------- */
 const WC={"Лендінг":["#7c3aed","#ec4899"],"Інтернет-магазин":["#2563eb","#06b6d4"],"Портфоліо":["#f59e0b","#f97316"],"Інформаційний сайт":["#10b981","#06b6d4"]};
 const WT={html:"HTML",css:"CSS",js:"JavaScript",bootstrap:"Bootstrap",react:"React"},WPAGE=6;
 let wq="",wcat="",wpage=1;
 const okUrl=u=>/^https:\/\//.test(u||"");
 function mockWin(r,cls){
  const body=r&&r.photo?h("img",{src:r.photo,alt:"",loading:"lazy"}):h("div",{class:"mw-sk"},h("i"),h("i"),h("i"));
  return h("div",{class:"mw "+cls,"aria-hidden":"true"},h("div",{class:"mw-h"},h("i"),h("i"),h("i"),h("span",{},r?r.title:"mysite.html")),h("div",{class:"mw-b"},body));
 }
 function worksBanner(list){
  const ph=list.filter(r=>r.photo),yr=Math.max(0,...list.map(r=>+r.year||0))||new Date().getFullYear();
  return h("section",{class:"wbanner"},
   h("div",{class:"wb-l"},h("span",{class:"wb-chip"},"Студентське портфоліо • "+yr),
    h("h1",{},"Ідеї, що стають ",h("span",{class:"wb-grad"},"вебсайтами.")),
    h("p",{},"Добірка навчальних проєктів з вебдизайну та розробки — від першого макета до готового сайту."),
    h("div",{class:"wb-b"},
     h("button",{class:"cta pri",type:"button",onclick:()=>{const t=document.getElementById("wk-list");if(t)t.scrollIntoView({behavior:"smooth",block:"start"});}},"Переглянути проєкти",ic("adown")),
     add("studentWorks","Додати роботу"))),
   h("div",{class:"wb-r"},h("div",{class:"mw-stack"},mockWin(ph[0]||null,"m1"),mockWin(ph[1]||null,"m2"),mockWin(ph[2]||null,"m3")),tech("html","fb"),tech("css","fb"),tech("js","fb")));
 }
 function works(){
  const all=sorted(st.studentWorks);
  if(!all.length)return [worksBanner(all),empty("studentWorks","Додати роботу")];
  const order=Object.keys(WC),cats=[...new Set(all.map(r=>r.category).filter(Boolean))].sort((a,b)=>(order.indexOf(a)+1||99)-(order.indexOf(b)+1||99));
  if(wcat&&!cats.includes(wcat))wcat="";
  const norm=s=>String(s||"").toLowerCase(),hay=r=>norm([r.title,r.desc,r.author,r.category,...(r.tech||[]).map(t=>WT[t]||t)].join(" "));
  const card=r=>{
   const p=WC[r.category]||["#6366f1","#8b5cf6"],ok=okUrl(r.link);
   const img=r.photo?h("img",{src:r.photo,alt:"Скриншот проєкту «"+r.title+"»",loading:"lazy"}):h("div",{class:"ph"},ic("layout"));
   const shot=ok?h("a",{class:"wk-shot",href:r.link,target:"_blank",rel:"noopener noreferrer",tabindex:"-1","aria-hidden":"true"},img):h("div",{class:"wk-shot"},img);
   return h("article",{class:"card hv wk-card",style:`--a1:${p[0]};--a2:${p[1]};--glow:${p[0]}88`},shot,
    h("div",{class:"wk-body"},h("h3",{},r.title),r.category?h("span",{class:"chip"},r.category):null,r.desc?h("p",{class:"mu"},r.desc):null,
     (r.tech||[]).length?h("ul",{class:"wk-tech"},r.tech.map(t=>h("li",{},TECH[t]?tech(t):null,WT[t]||t))):null),
    h("div",{class:"wk-f"},h("span",{class:"who wk-au"},h("span",{class:"wk-av"},ic("user")),h("span",{},r.author||"—")),
     ok?h("a",{class:"lk",href:r.link,target:"_blank",rel:"noopener noreferrer"},"Відкрити сайт",ic("ext")):null),
    ab("studentWorks",r));
  };
  const list=h("div",{class:"wk-grid"}),pager=h("nav",{class:"wk-pg","aria-label":"Сторінки"});
  const pills=[["","Усі проєкти"],...cats.map(c=>[c,c])].map(([v,l])=>{const b=h("button",{class:"wk-pill",type:"button",onclick:()=>{wcat=v;wpage=1;paint();}},l);b.dataset.v=v;return b;});
  const inp=h("input",{type:"search",class:"wk-in",placeholder:"Знайти проєкт…","aria-label":"Пошук проєкту",maxlength:100,value:wq,oninput:e=>{wq=e.target.value;wpage=1;paint();}});
  const bar=h("div",{class:"wk-bar",id:"wk-list"},h("div",{class:"wk-pills",role:"group","aria-label":"Категорії"},pills),h("label",{class:"wk-search"},ic("search"),inp));
  function paint(){
   const q=norm(wq).trim(),f=all.filter(r=>(!wcat||r.category===wcat)&&(!q||hay(r).includes(q)));
   const pages=Math.max(1,Math.ceil(f.length/WPAGE));wpage=Math.min(wpage,pages);
   pills.forEach(b=>{const on=b.dataset.v===wcat;b.classList.toggle("on",on);b.setAttribute("aria-pressed",String(on));});
   list.replaceChildren(...(f.length?f.slice((wpage-1)*WPAGE,wpage*WPAGE).map(card):[h("div",{class:"empty wk-empty"},ic("search"),h("p",{},"За вашим запитом проєктів не знайдено."))]));
   const go=n=>{wpage=n;paint();bar.scrollIntoView({behavior:"smooth",block:"start"});};
   pager.replaceChildren(...(pages>1?[
    h("button",{class:"pgb",type:"button","aria-label":"Попередня сторінка",disabled:wpage===1,onclick:()=>go(wpage-1)},ic("l")),
    ...Array.from({length:pages},(_,i)=>h("button",{class:"pgb"+(i+1===wpage?" on":""),type:"button","aria-label":"Сторінка "+(i+1),"aria-current":i+1===wpage?"page":null,onclick:()=>go(i+1)},i+1)),
    h("button",{class:"pgb",type:"button","aria-label":"Наступна сторінка",disabled:wpage===pages,onclick:()=>go(wpage+1)},ic("r"))]:[]));
  }
  paint();
  return [worksBanner(all),bar,list,pager];
 }
 let grp="g1",sel=mondayOf(new Date()),tabBase=sel;
 function schedBody(paint){
  const sc=getSched(),today=iso(new Date()),wn=weekNo(sel,sc);
  const go=d=>{sel=d;if(d<tabBase)tabBase=d;else if(d>addDays(tabBase,7))tabBase=d;paint();};
  const all=(st.lessons||[]).filter(l=>l.g===grp);
  const lab=m=>{const n=weekNo(m,sc);return n>=1?"Тиждень "+n:"Поза семестром";};
  const top=h("div",{class:"sc-top"},
   h("div",{class:"seg",role:"tablist","aria-label":"Група"},["g1","g2"].map((g,i)=>h("button",{role:"tab","aria-selected":String(g===grp),class:g===grp?"on":"",onclick:()=>{grp=g;paint();}},ic("users"),sc.groups[i]))),
   h("div",{class:"wk-n"},h("button",{class:"wk-b","aria-label":"Попередній тиждень",onclick:()=>go(addDays(sel,-7))},ic("l")),
    h("button",{class:"wk-b txt",onclick:()=>{const c=mondayOf(new Date());sel=c;tabBase=c;paint();}},"Поточний тиждень"),
    h("button",{class:"wk-b","aria-label":"Наступний тиждень",onclick:()=>go(addDays(sel,7))},ic("r")),
    h("input",{type:"date",class:"wk-d","aria-label":"Перейти до дати",value:iso(sel),onchange:e=>{const v=e.target.value;if(v){const p=v.split("-").map(Number);go(mondayOf(new Date(p[0],p[1]-1,p[2])));}}})));
  const tabs=h("div",{class:"wk-t",role:"tablist","aria-label":"Тижні"},[tabBase,addDays(tabBase,7)].map(m=>{const on=m.getTime()===sel.getTime();
   return h("button",{role:"tab","aria-selected":String(on),class:on?"on":"",onclick:()=>go(m)},h("b",{},lab(m)),h("span",{},dm(m)+" — "+dm(addDays(m,5))));}));
  const days=[0,1,2,3,4,5].map(i=>addDays(sel,i));
  const head=h("div",{class:"wk-h"},h("span",{},wn>=1?"Навчальний тиждень "+wn:"Тиждень"),h("b",{},fd(sel)+" — "+fd(days[5])));
  if(!all.length)return [top,tabs,head,A?empty("lessons","Додати заняття"):h("div",{class:"empty"},ic("cal"),h("p",{},"Для цієї групи розклад ще не додано."))];
  const on=(l,i,d)=>l.rep==="once"?l.date===iso(d):(+l.day===i+1&&(!l.rep||l.rep==="all"||(l.rep==="odd")===(wn%2!==0)));
  const lc=l=>h("article",{class:"lc"},   h("div",{class:"lc-b"},h("h4",{},l.subject),
    h("div",{class:"lc-c"},l.type?h("span",{class:"chip"},l.type.toLowerCase()):null,l.changed?h("span",{class:"chip ok"},"Нещодавно змінено"):null),
    l.mode==="online"?(/^https:\/\//.test(l.link||"")?h("a",{class:"onl",href:l.link,target:"_blank",rel:"noopener"},ic("video"),"Онлайн"):h("span",{class:"onl off"},ic("video"),"Онлайн")):
     h("div",{class:"loc"},l.building?h("div",{},h("small",{},"Корпус"),h("b",{},l.building)):null,l.room?h("div",{},h("small",{},"Аудиторія"),h("b",{},l.room)):null),
    ab("lessons",l)));
  const cell=(pi,i,d)=>all.filter(l=>+l.pair===pi+1&&on(l,i,d));
  const table=h("div",{class:"g-wrap"},h("div",{class:"g-t"},
   h("div",{class:"g-h corner"},"Пари"),days.map((d,i)=>h("div",{class:"g-h"+(iso(d)===today?" now":"")},h("b",{},DN[i]),h("span",{},dm(d)))),
   sc.pairs.flatMap((pr,pi)=>[h("div",{class:"g-p"},h("span",{class:"pn"},pi+1),h("small",{},"Пара"),h("em",{},fmtPair(pr))),
    ...days.map((d,i)=>{const ls=cell(pi,i,d);return h("div",{class:"g-c"+(iso(d)===today?" now":"")},ls.length?ls.map(lc):h("span",{class:"dash"},"—"));})])));
  const list=h("div",{class:"g-m"},days.map((d,i)=>{const items=sc.pairs.map((pr,pi)=>({pi,ls:cell(pi,i,d)})).filter(x=>x.ls.length);
   return h("section",{class:"g-d"+(iso(d)===today?" now":"")},h("h3",{},DN[i],h("span",{},dm(d))),
    items.length?items.map(x=>h("div",{class:"g-mp"},h("div",{class:"g-mh"},h("span",{class:"pn"},x.pi+1),h("em",{},fmtPair(sc.pairs[x.pi]))),x.ls.map(lc))):h("p",{class:"mu s"},"Занять немає"));}));
  return [top,tabs,head,table,list];
 }
 function schedule(){
  const box=h("div",{class:"sched"});const paint=()=>box.replaceChildren(...schedBody(paint));paint();
  return [banner("schedule","Розклад занять","Оберіть групу й тиждень. Онлайн-заняття відкриваються за посиланням, для очних занять вказано корпус і аудиторію.",add("lessons","Додати заняття"),A?h("button",{class:"btn primary sm",onclick:A.sched},ic("edit"),"Налаштування розкладу"):null),box];
 }
 const B={about:home,me:about,lessons:()=>buildInteractive({h,ic,A,st,banner,soon,stat}),
  schedule,works,cert,pub,stud,awards};
 function draw(k){
  view.dataset.t=k;view.classList.remove("in");view.replaceChildren(...B[k]());void view.offsetWidth;view.classList.add("in");
  nav.querySelectorAll("a").forEach(a=>a.setAttribute("aria-current",a.dataset.k===k?"page":"false"));const db=nav.querySelector(".dd-b");if(db){db.classList.toggle("on",SEC[k].g==="me");nav.querySelector(".dd")?.classList.remove("open");}
  crumb.textContent=SEC[k].t;document.title=SEC[k].t+" — WebLab";
 }
 function route(){
  let k=location.hash.slice(1);
  if(!vis().includes(k)){k="about";if(location.hash)history.replaceState(null,"","#about");}
  draw(k);window.scrollTo(0,0);
 }
 function header(){
  const p=st.profile||{};sub.textContent=p.institution||"";
  const item=k=>h("a",{class:"mi",href:"#"+k,"data-k":k},h("span",{},SEC[k].t),A&&SEC[k].cols&&!cnt(k)?h("span",{class:"hid",title:"Зараз прихований від відвідувачів"},ic("eye")):null);
  const v=vis(),top=v.filter(k=>!SEC[k].g).map(item),kids=v.filter(k=>SEC[k].g==="me");
  const dd=h("div",{class:"dd"},
   h("button",{class:"mi dd-b",type:"button","aria-haspopup":"true","aria-expanded":"false",onclick:e=>{const o=dd.classList.toggle("open");e.currentTarget.setAttribute("aria-expanded",String(o));}},h("span",{},"Про мене"),ic("down")),
   h("div",{class:"dd-m",role:"menu"},kids.map(k=>{const a=item(k);a.setAttribute("role","menuitem");a.prepend(ic(SEC[k].i));return a;})));
  dd.addEventListener("keydown",e=>{if(e.key==="Escape"){dd.classList.remove("open");dd.querySelector(".dd-b").setAttribute("aria-expanded","false");dd.querySelector(".dd-b").focus();}});
  document.addEventListener("click",e=>{if(!dd.contains(e.target)){dd.classList.remove("open");dd.querySelector(".dd-b").setAttribute("aria-expanded","false");}});
  nav.replaceChildren(...top,dd);
  help.replaceChildren(h("a",{class:"cta pri sm",href:"https://zhongbaolin.github.io/Journal/index-student.html",target:"_blank",rel:"noopener noreferrer"},"Навчальний простір",ic("ext")));
  foot.replaceChildren(h("div",{class:"ft-in"},h("span",{class:"brand-t"},h("span",{class:"logo"},ic("code")),"WEB.LAB"),h("span",{class:"ft-m"},"Разом до твого першого проєкту",ic("star")),h("span",{class:"ft-r"},`© ${new Date().getFullYear()} WebLab${p.institution?" · "+p.institution:""}`)));
 }
 async function refresh(force){
  view.replaceChildren(h("div",{class:"loading",role:"status"},h("span",{class:"spin"}),"Завантаження…"));
  try{await load(force);}catch(e){view.replaceChildren(h("div",{class:"err",role:"alert"},"Не вдалося завантажити дані. Перевірте інтернет-з’єднання та налаштування config.js. ("+(e.code||e.message)+")"));return;}
  st=cache;header();
  const y=window.scrollY;route();if(force)window.scrollTo(0,y);
 }
 window.addEventListener("hashchange",()=>{if(st.loaded)route();});
 return {refresh};
}
