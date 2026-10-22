import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut,sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {app,cache,delRec} from "./data.js";
import {OWNER_UID} from "./config.js";
import {mount,h,ic} from "./render.js";
import {recordModal,profileModal,bannerModal,confirmBox,toast} from "./modal.js";
import {runWizard} from "./wizard.js";
import {isInteractive,interactiveModal,quizMetaModal,clearQuiz,moveRec} from "./admin-interactive.js";
const auth=getAuth(app),root=document.getElementById("app");
let site=null,denied=null;
const ERR={"auth/invalid-credential":"Невірний email або пароль.","auth/wrong-password":"Невірний email або пароль.","auth/user-not-found":"Невірний email або пароль.",
 "auth/too-many-requests":"Забагато спроб. Спробуйте пізніше або скиньте пароль.","auth/network-request-failed":"Немає мережі. Перевірте інтернет.","auth/invalid-email":"Некоректний email."};
onAuthStateChanged(auth,async u=>{
 root.replaceChildren();site=null;
 if(!u)return login();
 if(u.uid!==OWNER_UID){denied="Немає доступу: цей обліковий запис не належить власниці сайту.";await signOut(auth);return;}
 start();
});
function login(){
 const err=h("div",{class:"lerr",role:"alert"},denied||"");denied=null;
 const em=h("input",{id:"em",type:"email",required:true,autocomplete:"username"}),pw=h("input",{id:"pw",type:"password",required:true,autocomplete:"current-password"});
 const btn=h("button",{class:"btn primary",type:"submit"},"Увійти");
 const forgot=h("button",{type:"button",class:"link",onclick:async()=>{if(!em.value){err.textContent="Спочатку введіть email.";return;}
  try{await sendPasswordResetEmail(auth,em.value.trim());err.textContent="";toast("Лист для скидання пароля надіслано");}catch(e){err.textContent=ERR[e.code]||"Не вдалося надіслати лист.";}}},"Забули пароль?");
 const f=h("form",{class:"card login",onsubmit:async e=>{e.preventDefault();btn.disabled=true;err.textContent="";
  try{await signInWithEmailAndPassword(auth,em.value.trim(),pw.value);}catch(x){err.textContent=ERR[x.code]||"Помилка входу: "+x.code;btn.disabled=false;}}},
  h("div",{class:"logo big"},ic("user")),h("h1",{},"Вхід до кабінету"),
  h("div",{class:"fld"},h("label",{for:"em"},"Email"),em),h("div",{class:"fld"},h("label",{for:"pw"},"Пароль"),pw),err,btn,forgot);
 root.append(h("div",{class:"loginwrap"},f));em.focus();
}
function start(){
 const refresh=()=>site.refresh(true);
 const bar=h("div",{class:"bar"},h("b",{},"Кабінет"),h("div",{class:"barb"},
  h("a",{class:"btn sm",href:"index.html",target:"_blank",rel:"noopener"},"Переглянути сайт"),
  h("button",{class:"btn sm",onclick:()=>profileModal(refresh)},"Профіль"),
  h("button",{class:"btn sm",onclick:()=>runWizard(refresh,1)},"Майстер налаштування"),
  h("button",{class:"btn sm",onclick:()=>signOut(auth)},"Вийти")));
 const holder=h("div");root.append(bar,holder);
 const title=r=>r.title||r.subject||r.degree||r.name||r.student||"запис";
 site=mount(holder,{admin:{add:(c,p)=>isInteractive(c)?interactiveModal(c,null,refresh):recordModal(c,p||null,refresh),edit:(c,r)=>isInteractive(c)?interactiveModal(c,r,refresh):recordModal(c,r,refresh),
  quizMeta:()=>quizMetaModal(refresh),banner:(k,c)=>bannerModal(k,c,refresh),clearQuiz:()=>clearQuiz(refresh),move:(c,r,d,l)=>moveRec(c,r,d,l,refresh),profile:()=>profileModal(refresh),
  async del(c,r){const kids=c==="resSections"?(cache.resources||[]).filter(x=>x.section===r.id):[];
   if(!(await confirmBox(kids.length?`Видалити розділ «${title(r)}» разом з усіма матеріалами в ньому (${kids.length})? Цю дію не можна скасувати.`:`Видалити «${title(r)}»? Цю дію не можна скасувати.`,"Видалити",true,"Видалення")))return;
   try{await Promise.all(kids.map(k=>delRec("resources",k.id)));await delRec(c,r.id);toast("Видалено");await refresh();}catch(e){toast("Не вдалося видалити: "+(e.message||e),"err");}}}});
 site.refresh(true).then(()=>{if(cache.loaded&&!cache.profile.setupDone)runWizard(refresh);});
}
