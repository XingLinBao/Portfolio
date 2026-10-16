import {load,cache,MONTHS,MONTHS_GEN} from "./data.js";
export const h=(t,a={},...c)=>{const e=document.createElement(t);
 for(const[k,v]of Object.entries(a)){if(v==null||v===false)continue;if(k==="class")e.className=v;else if(k.startsWith("on"))e.addEventListener(k.slice(2),v);else e.setAttribute(k,v===true?"":v);}
 c.flat().forEach(x=>{if(x!=null&&x!==false)e.append(x.nodeType?x:document.createTextNode(x));});return e;};
const P={user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
award:'<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/>',
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
medal:'<circle cx="12" cy="15" r="6"/><path d="M8.500 2h7L12 9z"/>',eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>'};
export const ic=n=>{const s=h("span",{class:"ic","aria-hidden":"true"});s.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${P[n]||""}</svg>`;return s;};
const SEC={about:{t:"Про викладача",i:"user"},cert:{t:"Підвищення кваліфікації",i:"award",cols:["certificates"]},
pub:{t:"Інноваційна робота",i:"bulb",cols:["publications"]},stud:{t:"Робота зі студентами",i:"users",cols:["studentArticles","events"]},
awards:{t:"Нагороди",i:"trophy",cols:["awards"]}};
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

const names=r=>r.students&&r.students.length?r.students:(r.student?[r.student]:[]);
const subjLinks=s=>{const a=[["materials","Матеріали курсу","book"],["program","Робоча програма","file"]].filter(x=>/^https:\/\//.test(s[x[0]]||"")).map(x=>h("a",{href:s[x[0]],target:"_blank",rel:"noopener"},ic(x[2]),x[1]));return a.length?h("div",{class:"sl"},a):null;};
export function mount(root,opts={}){
 const A=opts.admin;let st=cache,tab="studentArticles";
 const nav=h("nav",{class:"nav","aria-label":"Розділи"}),sub=h("div",{class:"brand-s"}),
 head=h("header",{class:"top"},h("div",{class:"top-in"},h("div",{class:"logo"},ic("user")),h("div",{class:"brand"},h("div",{class:"brand-t"},"Портфоліо викладача"),sub),nav)),
 view=h("main",{class:"wrap"}),foot=h("footer",{class:"foot"});
 root.append(head,view,foot);
 const cnt=k=>SEC[k].cols?SEC[k].cols.reduce((a,c)=>a+(st[c]||[]).length,0):1;
 const vis=()=>Object.keys(SEC).filter(k=>k==="about"||A||cnt(k)>0);
 const ab=(col,r)=>A?h("div",{class:"ab"},h("button",{class:"btn sm",onclick:()=>A.edit(col,r)},ic("edit"),"Змінити"),h("button",{class:"btn sm danger",onclick:()=>A.del(col,r)},ic("trash"),"Видалити")):null;
 const add=(col,l="Додати")=>A?h("button",{class:"btn primary sm",onclick:()=>A.add(col)},ic("plus"),l):null;
 const empty=(col,l)=>h("div",{class:"empty"},ic("plus"),h("p",{},"Додайте перший запис"),add(col,l));
 const banner=(k,t,d,...btn)=>h("section",{class:"banner"},h("div",{class:"bh"},h("span",{class:"bi"},ic(SEC[k].i)),h("h1",{},t)),h("p",{},d),btn.some(Boolean)?h("div",{class:"bb"},btn):null);
 const grid=(c,cls="")=>h("div",{class:"grid "+cls},c);
 const secCard=(i,c,t,col,body)=>h("section",{class:"card pad"},h("div",{class:"sch"},h("span",{class:"si big c-"+c},ic(i)),h("h2",{},t),add(col)),body);

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
  const out=[hero],ed=sorted(st.education),sb=[...(st.subjects||[])].sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
  if(ed.length||A)out.push(secCard("cap","blue","Освіта","education",ed.length?h("div",{class:"tl"},ed.map(e=>h("div",{class:"tli"},h("h3",{},e.degree),h("p",{class:"mu"},e.place),h("span",{class:"yr"},e.year),ab("education",e)))):empty("education")));
  if(sb.length||A)out.push(secCard("book","green","Предмети, які викладаю","subjects",sb.length?h("div",{class:"tags"},sb.map(s=>h("div",{class:"subj"},h("div",{class:"sn"},h("span",{},s.name),subjLinks(s)),ab("subjects",s)))):empty("subjects")));
  return out;
 }
 function cert(){
  const a=sorted(st.certificates);
  return [banner("cert","Підвищення кваліфікації","Систематично підвищую свою кваліфікацію, беру участь у тренінгах, семінарах та курсах для покращення професійної майстерності.",add("certificates")),
  h("div",{class:"stats s3"},stat("award","blue",a.length,"Сертифікатів отримано"),stat("cal","green",sum(a,"hours"),"Годин навчання"),stat("star","pur",period(a),"Період навчання")),
  a.length?grid(a.map(r=>h("article",{class:"card hv"},media(r.photos||[],r.title),h("div",{class:"cb"},h("h3",{},r.title),h("p",{class:"mu"},r.org),
   h("div",{class:"ft"},h("span",{class:"dt"},ic("cal"),fmt(r)),r.hours?h("span",{class:"chip"},r.hours+" год."):null),lk("certificates",r),ab("certificates",r))))):empty("certificates")];
 }
 function pub(){
  const a=sorted(st.publications);
  return [banner("pub","Інноваційна робота викладача","Публікації у наукових виданнях, збірниках, методичні розробки та інші напрацювання у сфері педагогіки та освіти.",add("publications")),
  h("div",{class:"stats s4"},stat("file","pur",typ(a,"стаття"),"Статей"),stat("book","blue",typ(a,"монографія"),"Монографій"),stat("edit","green",typ(a,"методична розробка","посібник"),"Методичних"),stat("bulb","amb",a.length,"Всього публікацій")),
  a.length?grid(a.map(r=>h("article",{class:"card hv"},media(r.photos||[],r.title,r.type),h("div",{class:"cb"},h("h3",{},r.title),h("p",{class:"mu"},[r.publisher,fmt(r)].filter(Boolean).join(", ")),lk("publications",r),ab("publications",r)))),"feature"):empty("publications")];
 }
 function stud(){
  const ar=sorted(st.studentArticles),ev=sorted(st.events);
  const tabs=[["studentArticles","Статті студентів","file",ar],["events","Екскурсії та заходи","camera",ev]].filter(t=>A||t[3].length);
  if(!tabs.find(t=>t[0]===tab))tab=tabs[0][0];
  const body=tab==="studentArticles"?(ar.length?h("div",{class:"list"},ar.map(r=>h("article",{class:"card hv sa-card"},r.photos&&r.photos.length?media(r.photos,r.title):null,h("div",{class:"cb"},
   h("div",{class:"who"},h("span",{class:"si c-green"},ic("users")),h("div",{},h("b",{},r.group?"Група "+r.group:(names(r)[0]||"Студент")),h("div",{class:"mu s"},r.year))),(r.group||names(r).length>1)&&names(r).length?h("ul",{class:"stl"},names(r).map(n=>h("li",{},n))):null,h("h3",{},r.title),r.venue?h("p",{class:"mu"},r.venue):null,
   r.award?h("span",{class:"chip amb"},ic("award"),r.award):null,lk("studentArticles",r),ab("studentArticles",r))))):empty("studentArticles","Додати статтю")):
   (ev.length?grid(ev.map(r=>h("article",{class:"card hv"},media(r.photos||[],r.title,r.type),h("div",{class:"cb"},h("h3",{},r.title),
   h("div",{class:"ft"},h("span",{class:"dt"},ic("cal"),fmt(r)),r.count?h("span",{class:"dt g"},ic("users"),r.count):null),lk("events",r),ab("events",r))))):empty("events","Додати захід"));
  return [banner("stud","Робота зі студентами","Наукове керівництво студентськими роботами, організація екскурсій, конференцій та інших освітніх заходів.",add("studentArticles","Додати статтю"),add("events","Додати захід")),
  h("div",{class:"stats s4"},stat("file","green",ar.length,"Статей студентів"),stat("camera","blue",ev.length,"Заходів проведено"),stat("award","amb",ar.filter(r=>r.award).length,"Нагород отримано"),stat("users","pur",sum(ev,"count"),"Учасників")),
  h("div",{class:"tabs",role:"tablist"},tabs.map(t=>h("button",{role:"tab","aria-selected":t[0]===tab,class:t[0]===tab?"on":"",onclick:()=>{tab=t[0];draw("stud");}},ic(t[2]),t[1]))),body];
 }
 function awards(){
  const a=sorted(st.awards);
  return [banner("awards","Нагороди викладача","Визнання професійних досягнень, нагороди та відзнаки за внесок у розвиток освіти та педагогічної науки.",add("awards")),
  h("div",{class:"stats s4"},stat("trophy","amb",a.length,"Всього нагород"),stat("medal","pur",typ(a,"почесна грамота","подяка"),"Грамоти та подяки"),stat("star","blue",typ(a,"диплом","сертифікат"),"Дипломи та сертифікати"),stat("cal","green",period(a),"Період отримання")),
  a.length?h("div",{class:"hlist"},a.map(r=>h("article",{class:"card hv aw"},media(r.photos||[],r.title),h("div",{class:"cb"},h("div",{class:"awt"},h("span",{class:"si big c-amb"},ic("trophy")),h("span",{class:"chip solid"},fmt(r))),
   h("h3",{},r.title),r.desc?h("p",{class:"mu"},r.desc):null,r.type?h("span",{class:"chip"},ic("medal"),r.type):null,lk("awards",r),ab("awards",r))))):empty("awards")];
 }
 const B={about,cert,pub,stud,awards};
 function draw(k){
  view.dataset.t=k;view.classList.remove("in");view.replaceChildren(...B[k]());void view.offsetWidth;view.classList.add("in");
  [...nav.children].forEach(a=>a.setAttribute("aria-current",a.dataset.k===k?"page":"false"));
  document.title=SEC[k].t+" — Портфоліо викладача";
 }
 function route(){
  let k=location.hash.slice(1);
  if(!vis().includes(k)){k="about";if(location.hash)history.replaceState(null,"","#about");}
  draw(k);window.scrollTo(0,0);
 }
 function header(){
  const p=st.profile||{};sub.textContent=p.institution||"";
  nav.replaceChildren(...vis().map(k=>h("a",{class:"pill",href:"#"+k,"data-k":k},ic(SEC[k].i),SEC[k].t,A&&k!=="about"&&!cnt(k)?h("span",{class:"hid",title:"Зараз прихований від відвідувачів"},ic("eye")):null)));
  foot.textContent=`© ${new Date().getFullYear()} ${p.institution||"Портфоліо викладача"}`;
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
