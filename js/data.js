import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {getFirestore,doc,getDoc,setDoc,collection,getDocs,addDoc,updateDoc,deleteDoc} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {firebaseConfig} from "./config.js";
export const app=initializeApp(firebaseConfig);
export const db=getFirestore(app);
export const MONTHS=["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"];
export const MONTHS_GEN=["січня","лютого","березня","квітня","травня","червня","липня","серпня","вересня","жовтня","листопада","грудня"];
export const COLS=["education","subjects","certificates","publications","studentArticles","events","awards","studentWorks","lessons","quiz","practice"];
const Y={k:"year",l:"Рік",t:"year",req:1},D={k:"my",t:"my",l:"Дата",req:1,hint:"Число можна не вказувати — тоді буде показано лише місяць і рік."},PH={k:"photos",l:"Фото або PDF (до 6, перше — обкладинка)",t:"photos",hint:"PDF автоматично перетворюється на зображення (кожна сторінка — окреме фото)."},
LK={k:"link",l:"Посилання",t:"url",hint:"У Google Диску: «Доступ» → «Усі, хто має посилання» → «Читач». Лише https://"};
const sel=(k,l,opts)=>({k,l,t:"select",opts,req:1});
export const SCHEMA={
 education:{label:"освіту",f:[{k:"degree",l:"Ступінь або спеціальність",req:1,ph:"Магістр, спеціальність «Педагогіка вищої школи»"},{k:"place",l:"Заклад",req:1},Y,{...PH,l:"Фото диплома або PDF (до 6)"}]},
 subjects:{label:"предмет",f:[{k:"name",l:"Назва предмета",req:1},{k:"materials",l:"Посилання на матеріали курсу",t:"url",hint:"Google Диск: «Доступ» → «Усі, хто має посилання» → «Читач». Лише https://"},{k:"program",l:"Посилання на робочу програму",t:"url"}]},
 certificates:{label:"сертифікат",f:[{k:"title",l:"Назва",req:1},{k:"org",l:"Організація",req:1},{...D,l:"Дата отримання"},{k:"hours",l:"Кількість годин",t:"number"},PH,LK]},
 publications:{label:"публікацію",f:[{k:"title",l:"Назва",req:1},sel("type","Тип",["Стаття","Монографія","Збірник наукових праць","Методична розробка","Посібник","Участь у конференції","Участь у засіданні","Інша діяльність"]),{k:"publisher",l:"Видавництво, збірник або назва заходу"},D,PH,LK]},
 studentArticles:{label:"роботу групи студентів",f:[{k:"group",l:"Група",req:1,ph:"Наприклад: КН-21"},{k:"students",l:"Студенти",t:"list",req:1,legacy:"student",hint:"Введіть ПІБ студента — після цього з’явиться кнопка для додавання наступного."},{k:"title",l:"Назва роботи",req:1},Y,{k:"venue",l:"Видання"},{k:"award",l:"Нагорода (необов’язково)",ph:"І місце на конференції"},PH,LK]},
 events:{label:"захід",f:[{k:"title",l:"Назва",req:1},sel("type","Тип",["Екскурсія","Конференція","Форум","Олімпіада","Інше"]),D,{k:"count",l:"Кількість учасників",t:"number"},PH,LK]},
 studentWorks:{label:"студентську роботу",f:[
  {k:"title",l:"Назва проєкту",req:1,ph:"Studio Forma"},
  sel("category","Категорія",["Лендінг","Інтернет-магазин","Портфоліо","Інформаційний сайт","Інше"]),
  {k:"desc",l:"Короткий опис",ph:"Сайт творчої студії дизайну"},
  {k:"tech",l:"Технології",t:"multi",opts:[["html","HTML"],["css","CSS"],["js","JavaScript"],["bootstrap","Bootstrap"],["react","React"]]},
  {k:"author",l:"Автор",req:1,ph:"Марія К.",hint:"Для конфіденційності достатньо імені та першої літери прізвища."},
  {k:"year",l:"Рік",t:"year"},
  {k:"link",l:"Посилання на сайт",t:"url",req:1,hint:"Адреса опублікованого сайту (наприклад, GitHub Pages). Лише https://"},
  {k:"photo",l:"Скриншот сайту",t:"photo",hint:"Знімок головної сторінки, бажано з пропорціями 16:10."}]},
 awards:{label:"нагороду",f:[{k:"title",l:"Назва",req:1},{k:"desc",l:"Опис",t:"textarea"},sel("type","Тип",["Почесна грамота","Подяка","Диплом","Сертифікат","Інше"]),D,PH,LK]}
,
 lessons:{label:"заняття",f:()=>{const sc=getSched();return[
  {k:"g",l:"Група",t:"select",opts:[["g1",sc.groups[0]],["g2",sc.groups[1]]],req:1},
  {k:"subject",l:"Дисципліна",req:1,sugg:subjectSuggestions,hint:"Оберіть зі списку раніше внесених дисциплін або введіть нову."},
  {k:"type",l:"Вид заняття",t:"select",opts:["Лекція","Практичне","Лабораторне","Семінар","Консультація","Інше"],req:1},
  {k:"rep",l:"Повторення",t:"select",opts:[["all","Щотижня"],["odd","Лише непарні тижні"],["even","Лише парні тижні"],["once","Одноразове (за датою)"]],req:1},
  {k:"day",l:"День тижня",t:"select",opts:[["1","Понеділок"],["2","Вівторок"],["3","Середа"],["4","Четвер"],["5","П’ятниця"],["6","Субота"]],hint:"Для одноразового заняття не потрібен."},
  {k:"date",l:"Дата (лише для одноразового заняття)",t:"date"},
  {k:"pair",l:"Пара",t:"select",opts:sc.pairs.map((p,i)=>[String(i+1),`${i+1} пара (${p.replace("-"," — ")})`]),req:1},
  {k:"mode",l:"Формат",t:"select",opts:[["online","Онлайн"],["offline","Офлайн"]],req:1},
  {k:"link",l:"Посилання на заняття (для онлайн)",t:"url",hint:"Лише https://, наприклад Google Meet або Zoom."},
  {k:"building",l:"Корпус (для офлайн)"},{k:"room",l:"Аудиторія (для офлайн)"},
  {k:"changed",l:"Позначити як «Нещодавно змінено»",t:"check"}];},
  check:d=>{if(d.rep==="once"&&!d.date)return "Вкажіть дату одноразового заняття";if(d.rep!=="once"&&!d.day)return "Оберіть день тижня";if(d.mode==="offline"&&!d.room&&!d.building)return "Вкажіть корпус або аудиторію";return null;}}
};
function subjectSuggestions(){const set=new Set();[...(cache.lessons||[]).map(l=>l.subject),...(cache.subjects||[]).map(s=>s.name)].forEach(x=>{if(x&&String(x).trim())set.add(String(x).trim());});return [...set].sort((a,b)=>a.localeCompare(b,"uk"));}
export const DEF_SCHED={groups:["ІДП-31","БТ-31"],start:"",pairs:["09:00-10:20","10:30-11:50","12:10-13:30","13:40-15:00","15:10-16:30"]};
export function getSched(){const s=(cache.profile&&cache.profile.sched)||{},g=s.groups||[];return{groups:[g[0]||DEF_SCHED.groups[0],g[1]||DEF_SCHED.groups[1]],start:s.start||"",pairs:s.pairs&&s.pairs.length?s.pairs:DEF_SCHED.pairs};}
const SOFT=["lessons","quiz","practice","studentWorks"];
export const cache={loaded:false,profile:{}};
export async function load(force){
 if(cache.loaded&&!force)return cache;
 const [p,...r]=await Promise.all([getDoc(doc(db,"profile","main")),...COLS.map(c=>getDocs(collection(db,c)).catch(e=>{if(SOFT.includes(c))return{docs:[]};throw e;}))]);
 cache.profile=p.exists()?p.data():{};
 COLS.forEach((c,i)=>cache[c]=r[i].docs.map(d=>({id:d.id,...d.data()})));
 cache.loaded=true;return cache;
}
export async function saveRec(col,id,data){
 cache.loaded=false;
 if(id){await updateDoc(doc(db,col,id),data);return id;}
 return (await addDoc(collection(db,col),{...data,createdAt:Date.now()})).id;
}
export async function delRec(col,id){cache.loaded=false;await deleteDoc(doc(db,col,id));}
export async function saveProfile(d){cache.loaded=false;await setDoc(doc(db,"profile","main"),d,{merge:true});}
