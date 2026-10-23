import {h,ic} from "./render.js";
import {SCHEMA,MONTHS,saveRec,saveProfile,cache} from "./data.js";
import {photoField} from "./images.js";
import {parseVideo,setThumb} from "./media.js";
const stack=[];let uid=0;
const FOC='a[href],button:not([disabled]),input:not([disabled]):not(.sr),select,textarea,[tabindex="0"]';
document.addEventListener("keydown",e=>{
 const m=stack[stack.length-1];if(!m||document.querySelector(".gal"))return;
 if(e.key==="Escape"&&!m.persistent){e.preventDefault();m.close();}
 if(e.key==="Tab"){const f=[...m.el.querySelectorAll(FOC)];if(!f.length)return;const a=f[0],z=f[f.length-1];
  if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}
});
export function openModal({title,content,actions=[],persistent=false,beforeClose,onClosed,wide}){
 const prev=document.activeElement,id="mt"+(++uid);
 const body=h("div",{class:"mb"},content);
 const box=h("div",{class:"modal"+(wide?" wide":""),role:"dialog","aria-modal":"true","aria-labelledby":id},
  h("div",{class:"mh"},h("h2",{id},title),persistent?null:h("button",{class:"mx","aria-label":"Закрити",onclick:()=>api.close()},ic("x"))),body,actions.length?h("div",{class:"mf"},actions):null);
 const ov=h("div",{class:"ov"},box);
 const api={el:box,body,persistent,
  async close(force){
   if(!force&&beforeClose&&!(await beforeClose()))return;
   ov.remove();stack.splice(stack.indexOf(api),1);if(!stack.length)document.body.classList.remove("lock");
   if(prev&&prev.focus)prev.focus();if(onClosed)onClosed();
  }};
 ov.addEventListener("mousedown",e=>{if(e.target===ov&&!persistent)api.close();});
 stack.push(api);document.body.append(ov);document.body.classList.add("lock");
 box.tabIndex=-1;const f0=box.querySelector("input,select,textarea,button");(f0||box).focus();
 return api;
}
export function toast(m,t="ok"){
 let c=document.getElementById("toasts");if(!c){c=h("div",{id:"toasts","aria-live":"polite"});document.body.append(c);}
 const e=h("div",{class:"toast "+t},m);c.append(e);setTimeout(()=>e.remove(),4500);
}
export function confirmBox(text,ok="Ок",danger=false,title="Підтвердження"){
 return new Promise(res=>{let done=false;const fin=v=>{if(!done){done=true;res(v);}};
  const no=h("button",{class:"btn"},"Скасувати"),yes=h("button",{class:"btn "+(danger?"danger solid":"primary")},ok);
  const m=openModal({title,content:h("p",{},text),actions:[no,yes],onClosed:()=>fin(false)});
  no.onclick=()=>m.close(true);yes.onclick=()=>{fin(true);m.close(true);};});
}
const years=()=>{const y=new Date().getFullYear();return Array.from({length:y+2-1970},(_,i)=>y+1-i);};
const ysel=(id,v)=>{const s=h("select",{id,"aria-label":"Рік"},h("option",{value:""},"Рік"),...years().map(y=>h("option",{value:y},y)));s.value=v||"";return s;};
export function buildForm(fields,v={}){
 const el=h("div",{class:"form"}),G=[];
 for(const f of fields){
  const id="f"+(++uid);let ctl,get,fin,extra=null;
  if(f.t==="textarea"){ctl=h("textarea",{id,rows:5,maxlength:3000,placeholder:f.ph||""});ctl.value=v[f.k]||"";get=()=>({[f.k]:ctl.value.trim()});}
  else if(f.t==="select"){ctl=h("select",{id},h("option",{value:""},f.blank||"— оберіть —"),...f.opts.map(o=>Array.isArray(o)?h("option",{value:o[0]},o[1]):h("option",{value:o},o)));ctl.value=v[f.k]||"";get=()=>({[f.k]:ctl.value});}
  else if(f.t==="check"){const i=h("input",{id,type:"checkbox"});i.checked=!!v[f.k];ctl=h("label",{class:"chk"},i,f.l);get=()=>({[f.k]:i.checked});}
  else if(f.t==="year"){ctl=ysel(id,v[f.k]);get=()=>({[f.k]:+ctl.value||0});}
  else if(f.t==="my"){const dd=h("select",{id,"aria-label":"Число"},h("option",{value:""},"Число"),...Array.from({length:31},(_,i)=>h("option",{value:i+1},i+1))),m=h("select",{"aria-label":"Місяць"},h("option",{value:""},"Місяць"),...MONTHS.map((n,i)=>h("option",{value:i+1},n))),y=ysel(id+"y",v.year);dd.value=v.day||"";m.value=v.month||"";
   ctl=h("div",{class:"row3"},dd,m,y);get=()=>({day:+dd.value||0,month:+m.value||0,year:+y.value||0});}
  else if(f.t==="number"){ctl=h("input",{id,type:"number",min:0,step:1,inputmode:"numeric"});ctl.value=v[f.k]||"";get=()=>({[f.k]:ctl.value===""?0:Math.max(0,Math.round(+ctl.value))});}
  else if(f.t==="url"){const i=h("input",{id,type:"url",placeholder:"https://",maxlength:500});i.value=v[f.k]||"";
   const row=h("div",{class:"urlrow"},i,h("button",{type:"button",class:"btn sm",onclick:()=>/^https:\/\/\S+$/.test(i.value.trim())?window.open(i.value.trim(),"_blank","noopener"):toast("Вкажіть посилання, що починається з https://","err")},"Перевірити посилання"));
   ctl=row;
   if(f.preview){
    const pv=h("div",{class:"vprev",hidden:true});let timer,tok=0;
    const upd=()=>{const t=++tok,v=parseVideo(i.value);
     if(!v){pv.hidden=true;pv.replaceChildren();return;}
     pv.hidden=false;
     const img=h("img",{alt:"Прев’ю відео"}),fail=()=>{if(t===tok)pv.replaceChildren(h("span",{class:"mu s"},"Прев’ю для цього відео отримати не вдалося — додайте обкладинку нижче."));};
     const ok=()=>{if(t===tok)pv.replaceChildren(img,h("span",{class:"mu s"},"Так відео виглядатиме на сайті. Власна обкладинка, якщо її додати, замінить це прев’ю."));};
     pv.replaceChildren(h("span",{class:"mu s"},"Завантажуємо прев’ю…"));
     img.addEventListener("load",()=>{if(img.naturalWidth>160)ok();});
     setThumb(img,i.value,fail);
     if(v.kind==="file")fail();};
    i.addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(upd,400);});upd();
    ctl=h("div",{},row,pv);}
   get=()=>({[f.k]:i.value.trim()});}
  else if(f.t==="multi"){const on=new Set(v[f.k]||[]);
   ctl=h("div",{class:"mchk"},f.opts.map(o=>{const i=h("input",{type:"checkbox",value:o[0]});i.checked=on.has(o[0]);return h("label",{class:"chk"},i,o[1]);}));
   get=()=>({[f.k]:[...ctl.querySelectorAll("input:checked")].map(i=>i.value)});}
  else if(f.t==="list"){
   const inputs=[],rows=h("div",{class:"lrows"}),addB=h("button",{type:"button",class:"btn sm",onclick:()=>mk("",true)},ic("plus"),"Додати студента");
   function sync(){addB.hidden=!inputs.length||!inputs[inputs.length-1].value.trim();}
   function mk(val,foc){const i=h("input",{type:"text",maxlength:200,placeholder:"ПІБ студента","aria-label":"ПІБ студента"});i.value=val;
    const row=h("div",{class:"lrow"},i,h("button",{type:"button",class:"mx sm","aria-label":"Видалити студента",onclick:()=>{if(inputs.length<2){i.value="";sync();return;}inputs.splice(inputs.indexOf(i),1);row.remove();sync();}},ic("x")));
    i.addEventListener("input",sync);i.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();if(i.value.trim()&&i===inputs[inputs.length-1])mk("",true);}});
    inputs.push(i);rows.append(row);sync();if(foc)i.focus();}
   const init=v[f.k]&&v[f.k].length?v[f.k]:(f.legacy&&v[f.legacy]?[v[f.legacy]]:[""]);
   init.forEach(x=>mk(x));ctl=h("div",{},rows,addB);get=()=>({[f.k]:inputs.map(i=>i.value.trim()).filter(Boolean)});}
  else if(f.t==="photos"||f.t==="photo"){const one=f.t==="photo",pf=photoField(one?(v[f.k]?[v[f.k]]:[]):(v[f.k]||[]),{single:one,maxSide:one?800:1200,limit:one?500000:800000});
   ctl=pf.el;get=()=>({[f.k]:pf.get()});fin=async()=>({[f.k]:await pf.finalize()});}
  else{ctl=h("input",{id,type:f.t||"text",maxlength:300,placeholder:f.ph||""});ctl.value=v[f.k]||"";get=()=>({[f.k]:ctl.value.trim()});
   if(f.sugg){extra=h("datalist",{id:"dl"+id},...f.sugg().map(x=>h("option",{value:x})));ctl.setAttribute("list","dl"+id);ctl.setAttribute("autocomplete","off");}}
  G.push({f,get,fin,ctl});
  el.append(h("div",{class:"fld"},f.t==="check"?null:h("label",{for:id},f.l,f.req?h("span",{class:"rq",title:"Обов’язкове"}," *"):null),ctl,extra,f.hint?h("small",{},f.hint):null));
 }
 const get=()=>Object.assign({},...G.map(g=>g.get()));
 const ini=JSON.stringify(get());
 return {el,get,dirty:()=>JSON.stringify(get())!==ini,
  validate(){
   for(const g of G){const d=g.get(),f=g.f,foc=()=>(g.ctl.matches("input,select,textarea")?g.ctl:g.ctl.querySelector("input,select,textarea")||g.ctl).focus();
    if(f.req&&!(f.t==="my"?d.month&&d.year:f.t==="list"?d[f.k].length:d[f.k])){foc();return `Заповніть поле «${f.l}»`;}
    if(f.t==="my"&&d.day&&new Date(d.year,d.month-1,d.day).getMonth()!==d.month-1){foc();return "У вибраному місяці немає такого числа";}
    if(f.t==="url"&&d[f.k]&&!/^https:\/\/\S+$/.test(d[f.k])){foc();return "Посилання має починатися з https://";}
    if(f.t==="email"&&d[f.k]&&!/^\S+@\S+\.\S+$/.test(d[f.k])){foc();return "Некоректна адреса email";}}
   return null;},
  async finalData(){const d=get();for(const g of G)if(g.fin)Object.assign(d,await g.fin());return d;}};
}
function saveFlow({title,form,save,onSaved,again}){
 return new Promise(res=>{let saved=false;
  const cancel=h("button",{class:"btn"},"Скасувати"),ok=h("button",{class:"btn primary"},"Зберегти"),more=again?h("button",{class:"btn"},again):null;
  const m=openModal({title,content:form.el,actions:[cancel,more,ok].filter(Boolean),wide:true,
   beforeClose:async()=>saved||!form.dirty()||confirmBox("Є незбережені зміни. Закрити без збереження?","Закрити",true),onClosed:()=>res(saved)});
  cancel.onclick=()=>m.close();
  const go=async kind=>{const err=form.validate();if(err){toast(err,"err");return;}
   ok.disabled=true;if(more)more.disabled=true;
   try{await save(await form.finalData());saved=kind;toast("Збережено");m.close(true);if(onSaved)await onSaved();}
   catch(e){toast("Не вдалося зберегти: "+(e.message||e),"err");ok.disabled=false;if(more)more.disabled=false;}};
  ok.onclick=()=>go(true);if(more)more.onclick=()=>go("again");
 });
}
function mkForm(S,rec){const f=buildForm(typeof S.f==="function"?S.f():S.f,rec||{});if(S.check){const v0=f.validate;f.validate=()=>v0()||S.check(f.get());}return f;}
export async function recordModal(col,rec,onSaved){
 const S=SCHEMA[col],isNew=!(rec&&rec.id),ONE={materials:"Зберегти й додати ще",resources:"Зберегти й додати ще"},again=isNew&&col==="studentArticles"?"Зберегти й додати ще одну групу":(isNew&&col==="studentWorks"?"Зберегти й додати ще одну роботу":(isNew&&ONE[col])||null);
 let r;
 do{r=await saveFlow({title:(isNew?"Додати: ":"Змінити: ")+S.label,form:mkForm(S,S.pre?S.pre(rec):rec),save:d=>saveRec(col,rec&&rec.id,S.post?S.post(d):d),onSaved,again});}while(r==="again");
 return !!r;
}
export const PROFILE_FIELDS=[{k:"fullName",l:"ПІБ",req:1,ph:"Іванова Олена Петрівна"},{k:"position",l:"Посада",req:1,ph:"Викладач педагогічних дисциплін"},{k:"institution",l:"Назва закладу",req:1,ph:"Коледж"},
 {k:"email",l:"Email",t:"email"},{k:"phone",l:"Телефон",t:"tel",ph:"+380 44 123-45-67"},{k:"address",l:"Адреса",ph:"м. Київ, вул. Університетська, 26"},
 {k:"about",l:"Про мене",t:"textarea"},{k:"photo",l:"Фото профілю",t:"photo"}];
export function profileModal(onSaved){
 return saveFlow({title:"Профіль",form:buildForm(PROFILE_FIELDS,cache.profile||{}),save:d=>saveProfile(d),onSaved});
}

/* Тексти на головних банерах сторінок. Порожнє поле = стандартний текст. */
const BANNER_FIELDS=[
 {k:"eyebrow",l:"Надзаголовок",ph:"Невеликий напис над заголовком",hint:"Малі літери зверху, як «Навчальний матеріал»."},
 {k:"title",l:"Заголовок",ph:"Навчаємо створювати"},
 {k:"accent",l:"Виділена частина заголовка",ph:"сучасні вебрішення",hint:"Показується фіолетовим кольором з нового рядка. Можна не заповнювати."},
 {k:"desc",l:"Підпис під заголовком",t:"textarea",hint:"До 300 символів. Якщо очистити всі поля — буде показано стандартні тексти."}];
export function bannerModal(key,cur,onSaved){
 const form=buildForm(BANNER_FIELDS,cur||{});
 const v0=form.validate;form.validate=()=>v0()||(form.get().desc.length>300?"Підпис задовгий: до 300 символів":null);
 let saved=false;
 const cancel=h("button",{class:"btn",type:"button"},"Скасувати"),reset=h("button",{class:"btn ghost",type:"button"},ic("undo"),"Стандартні тексти"),ok=h("button",{class:"btn primary",type:"button"},"Зберегти");
 const send=async d=>{ok.disabled=reset.disabled=true;
  try{await saveProfile({banners:{[key]:d}});saved=true;toast("Збережено");m.close(true);if(onSaved)await onSaved();}
  catch(e){toast("Не вдалося зберегти: "+(e.message||e),"err");ok.disabled=reset.disabled=false;}};
 const m=openModal({title:"Змінити текст банера",content:form.el,actions:[reset,cancel,ok],wide:true,
  beforeClose:async()=>saved||!form.dirty()||confirmBox("Є незбережені зміни. Закрити без збереження?","Закрити",true)});
 cancel.onclick=()=>m.close();
 ok.onclick=()=>{const e=form.validate();if(e){toast(e,"err");return;}send(form.get());};
 reset.onclick=async()=>{if(await confirmBox("Повернути стандартні тексти цього банера?","Повернути",false))send({eyebrow:"",title:"",accent:"",desc:""});};
}
