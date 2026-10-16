import {h,ic} from "./render.js";
import {SCHEMA,MONTHS,saveRec,saveProfile,cache} from "./data.js";
import {photoField} from "./images.js";
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
  const id="f"+(++uid);let ctl,get,fin;
  if(f.t==="textarea"){ctl=h("textarea",{id,rows:5,maxlength:3000,placeholder:f.ph||""});ctl.value=v[f.k]||"";get=()=>({[f.k]:ctl.value.trim()});}
  else if(f.t==="select"){ctl=h("select",{id},h("option",{value:""},"— оберіть —"),...f.opts.map(o=>h("option",{value:o},o)));ctl.value=v[f.k]||"";get=()=>({[f.k]:ctl.value});}
  else if(f.t==="year"){ctl=ysel(id,v[f.k]);get=()=>({[f.k]:+ctl.value||0});}
  else if(f.t==="my"){const m=h("select",{id,"aria-label":"Місяць"},h("option",{value:""},"Місяць"),...MONTHS.map((n,i)=>h("option",{value:i+1},n))),y=ysel(id+"y",v.year);m.value=v.month||"";
   ctl=h("div",{class:"row2"},m,y);get=()=>({month:+m.value||0,year:+y.value||0});}
  else if(f.t==="number"){ctl=h("input",{id,type:"number",min:0,step:1,inputmode:"numeric"});ctl.value=v[f.k]||"";get=()=>({[f.k]:ctl.value===""?0:Math.max(0,Math.round(+ctl.value))});}
  else if(f.t==="url"){const i=h("input",{id,type:"url",placeholder:"https://",maxlength:500});i.value=v[f.k]||"";
   ctl=h("div",{class:"urlrow"},i,h("button",{type:"button",class:"btn sm",onclick:()=>/^https:\/\/\S+$/.test(i.value.trim())?window.open(i.value.trim(),"_blank","noopener"):toast("Вкажіть посилання, що починається з https://","err")},"Перевірити посилання"));
   get=()=>({[f.k]:i.value.trim()});}
  else if(f.t==="photos"||f.t==="photo"){const one=f.t==="photo",pf=photoField(one?(v[f.k]?[v[f.k]]:[]):(v[f.k]||[]),{single:one,maxSide:one?800:1200});
   ctl=pf.el;get=()=>({[f.k]:pf.get()});fin=async()=>({[f.k]:await pf.finalize()});}
  else{ctl=h("input",{id,type:f.t||"text",maxlength:300,placeholder:f.ph||""});ctl.value=v[f.k]||"";get=()=>({[f.k]:ctl.value.trim()});}
  G.push({f,get,fin,ctl});
  el.append(h("div",{class:"fld"},h("label",{for:id},f.l,f.req?h("span",{class:"rq",title:"Обов’язкове"}," *"):null),ctl,f.hint?h("small",{},f.hint):null));
 }
 const get=()=>Object.assign({},...G.map(g=>g.get()));
 const ini=JSON.stringify(get());
 return {el,get,dirty:()=>JSON.stringify(get())!==ini,
  validate(){
   for(const g of G){const d=g.get(),f=g.f,foc=()=>(g.ctl.matches("input,select,textarea")?g.ctl:g.ctl.querySelector("input,select,textarea")||g.ctl).focus();
    if(f.req&&!(f.t==="my"?d.month&&d.year:d[f.k])){foc();return `Заповніть поле «${f.l}»`;}
    if(f.t==="url"&&d[f.k]&&!/^https:\/\/\S+$/.test(d[f.k])){foc();return "Посилання має починатися з https://";}
    if(f.t==="email"&&d[f.k]&&!/^\S+@\S+\.\S+$/.test(d[f.k])){foc();return "Некоректна адреса email";}}
   return null;},
  async finalData(){const d=get();for(const g of G)if(g.fin)Object.assign(d,await g.fin());return d;}};
}
function saveFlow({title,form,save,onSaved}){
 return new Promise(res=>{let saved=false;
  const cancel=h("button",{class:"btn"},"Скасувати"),ok=h("button",{class:"btn primary"},"Зберегти");
  const m=openModal({title,content:form.el,actions:[cancel,ok],wide:true,
   beforeClose:async()=>saved||!form.dirty()||confirmBox("Є незбережені зміни. Закрити без збереження?","Закрити",true),onClosed:()=>res(saved)});
  cancel.onclick=()=>m.close();
  ok.onclick=async()=>{const err=form.validate();if(err){toast(err,"err");return;}
   ok.disabled=true;
   try{await save(await form.finalData());saved=true;toast("Збережено");m.close(true);if(onSaved)await onSaved();}
   catch(e){toast("Не вдалося зберегти: "+(e.message||e),"err");ok.disabled=false;}};
 });
}
export function recordModal(col,rec,onSaved){
 const S=SCHEMA[col];
 return saveFlow({title:(rec?"Змінити: ":"Додати: ")+S.label,form:buildForm(S.f,rec||{}),save:d=>saveRec(col,rec&&rec.id,d),onSaved});
}
export const PROFILE_FIELDS=[{k:"fullName",l:"ПІБ",req:1,ph:"Іванова Олена Петрівна"},{k:"position",l:"Посада",req:1,ph:"Викладач педагогічних дисциплін"},{k:"institution",l:"Назва закладу",req:1,ph:"Коледж"},
 {k:"email",l:"Email",t:"email"},{k:"phone",l:"Телефон",t:"tel",ph:"+380 44 123-45-67"},{k:"address",l:"Адреса",ph:"м. Київ, вул. Університетська, 26"},
 {k:"about",l:"Про мене",t:"textarea"},{k:"photo",l:"Фото профілю",t:"photo"}];
export function profileModal(onSaved){
 return saveFlow({title:"Профіль",form:buildForm(PROFILE_FIELDS,cache.profile||{}),save:d=>saveProfile(d),onSaved});
}
