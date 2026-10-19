// Валідатор практичних завдань: перевірка синтаксису HTML/CSS/JS, безпечний запуск коду
// в ізольованому iframe (sandbox) і перевірка результату за правилами, які задає викладач.

const VOID=new Set("area base br col embed hr img input link meta param source track wbr".split(" "));
const OPTIONAL_END=new Set("html head body p li dt dd tr td th thead tbody tfoot option optgroup colgroup caption rt rp".split(" "));
const RAW=new Set(["script","style","textarea","title"]);
const KNOWN=new Set(("a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p param picture pre progress q rp rt ruby s samp script search section select slot small source span strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track u ul var video wbr svg path circle rect line polyline polygon ellipse g defs use text tspan").split(" "));
const BLOCK_CLOSES_P=new Set("address article aside blockquote details div dl fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hgroup hr main menu nav ol p pre section table ul".split(" "));
const lineOf=(s,i)=>s.slice(0,i).split("\n").length;

// ---------- HTML ----------
export function lintHTML(src){
  const out=[],stack=[];
  const re=/<!--[\s\S]*?(?:-->|$)|<!doctype[^>]*>|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>])*)(>|$)/gi;
  let m;
  while((m=re.exec(src))){
    if(m[0].startsWith("<!--")){if(!/-->$/.test(m[0]))out.push({line:lineOf(src,m.index),msg:"Коментар <!-- не закрито знаком -->"});continue;}
    if(m[0][1]==="!")continue;
    const close=m[1]==="/",name=m[2].toLowerCase(),line=lineOf(src,m.index);
    if(m[4]!==">"){out.push({line,msg:`Тег <${name}> не завершено символом «>»`});break;}
    if(!close){
      const q=(m[3].match(/"/g)||[]).length%2||(m[3].match(/'/g)||[]).length%2;
      if(q)out.push({line,msg:`У тезі <${name}> не закрито лапки`});
      if(!KNOWN.has(name)&&!name.includes("-"))out.push({line,msg:`Невідомий тег <${name}> — перевірте написання`,warn:true});
      const top=stack[stack.length-1];
      if(top){const t=top.name;
        if((t==="p"&&BLOCK_CLOSES_P.has(name))||(t==="li"&&name==="li")||((t==="dt"||t==="dd")&&(name==="dt"||name==="dd"))||(t==="tr"&&name==="tr")||((t==="td"||t==="th")&&/^(td|th|tr)$/.test(name))||(t==="option"&&name==="option"))stack.pop();
      }
      if(/\/\s*$/.test(m[3])||VOID.has(name)){
        if(VOID.has(name)||/\/\s*$/.test(m[3]))continue;
      }
      if(RAW.has(name)){
        const end=new RegExp("</"+name+"\\s*>","i");end.lastIndex=0;
        const rest=src.slice(re.lastIndex),k=rest.search(end);
        if(k<0){out.push({line,msg:`Тег <${name}> не закрито (немає </${name}>)`});re.lastIndex=src.length;continue;}
        re.lastIndex+=k+rest.slice(k).match(end)[0].length;continue;
      }
      stack.push({name,line});
    }else{
      if(VOID.has(name)){out.push({line,msg:`Тег <${name}> порожній і не має закриваючого </${name}>`});continue;}
      let k=stack.length-1;while(k>=0&&stack[k].name!==name)k--;
      if(k<0){out.push({line,msg:`Закриваючий тег </${name}> без відповідного відкриваючого`});continue;}
      for(let j=stack.length-1;j>k;j--){const s=stack[j];if(!OPTIONAL_END.has(s.name))out.push({line:s.line,msg:`Тег <${s.name}> не закрито перед </${name}>`});}
      stack.length=k;
    }
  }
  for(const s of stack)if(!OPTIONAL_END.has(s.name))out.push({line:s.line,msg:`Тег <${s.name}> не закрито — додайте </${s.name}>`});
  return out;
}

// ---------- CSS ----------
export function lintCSS(src){
  const out=[];
  const clean=src.replace(/\/\*[\s\S]*?(\*\/|$)/g,m=>m.replace(/[^\n]/g," "));
  const sup=typeof CSS!=="undefined"&&CSS.supports?CSS.supports.bind(CSS):null;
  const frag=typeof document!=="undefined"?document.createDocumentFragment():null;
  let depth=0,i=0,start=0;const ctx=[];
  const decls=(body,off)=>{
    const parts=[];let cur="",p=0,q="",st=0;
    for(let k=0;k<body.length;k++){const c=body[k];
      if(q){cur+=c;if(c===q&&body[k-1]!=="\\")q="";continue;}
      if(c==='"'||c==="'"){q=c;cur+=c;continue;}
      if(c==="(")p++;if(c===")")p--;
      if(c===";"&&p<=0){parts.push([cur,st]);cur="";st=k+1;continue;}
      cur+=c;}
    if(cur.trim())parts.push([cur,st]);
    for(const [d,pos] of parts){
      const t=d.trim();if(!t)continue;
      const line=lineOf(clean,off+pos+(d.length-d.trimStart().length));
      const c=t.indexOf(":");
      if(c<1){out.push({line,msg:`«${t.slice(0,40)}» — пропущено двокрапку або крапку з комою`});continue;}
      const prop=t.slice(0,c).trim().toLowerCase();let val=t.slice(c+1).trim().replace(/\s*!important\s*$/i,"");
      if(!/^-{0,2}[a-z][a-z0-9-]*$/.test(prop)){out.push({line,msg:`Некоректна назва властивості «${prop}»`});continue;}
      if(prop.startsWith("--")||!sup)continue;
      if(!val){out.push({line,msg:`Для властивості «${prop}» не вказано значення`});continue;}
      if(!sup(prop,"inherit")&&!prop.startsWith("-")){out.push({line,msg:`Невідома властивість «${prop}» — перевірте написання`});continue;}
      if(!prop.startsWith("-")&&!sup(prop,val)){
        const multi=/\n/.test(val)&&/:/.test(val);
        out.push({line,msg:`Недійсне значення «${val.replace(/\s+/g," ").slice(0,40)}» для «${prop}»${multi?" (можливо, пропущено «;»)":""}`});}
    }
  };
  for(i=0;i<clean.length;i++){
    const c=clean[i];
    if(c==='"'||c==="'"){let j=i+1;while(j<clean.length&&clean[j]!==c&&clean[j]!=="\n"){if(clean[j]==="\\")j++;j++;}i=j;continue;}
    if(c==="{"){
      const pre=clean.slice(start,i).trim(),line=lineOf(clean,start+(clean.slice(start,i).length-clean.slice(start,i).trimStart().length));
      ctx.push({pre,open:i,line});depth++;start=i+1;
      if(pre&&!pre.startsWith("@")&&!(ctx.length>1&&/^@(-\w+-)?keyframes/i.test(ctx[ctx.length-2].pre))&&frag){
        try{frag.querySelector(pre);}catch(e){out.push({line,msg:`Некоректний селектор «${pre.replace(/\s+/g," ").slice(0,50)}»`});}}
    }else if(c==="}"){
      if(!depth){out.push({line:lineOf(clean,i),msg:"Зайва закриваюча дужка «}»"});start=i+1;continue;}
      const o=ctx.pop();depth--;
      const body=clean.slice(o.open+1,i);
      if(!body.includes("{")&&!o.pre.startsWith("@"))decls(body,o.open+1);
      start=i+1;
    }
  }
  for(const o of ctx)out.push({line:o.line,msg:`Не закрито блок «${o.pre.slice(0,40)}» — додайте «}»`});
  return out;
}

// ---------- JS: захист від нескінченних циклів ----------
export function guardLoops(code){
  let out="",i=0;const n=code.length;
  const skipStr=(q,start)=>{let j=start+1;while(j<n&&code[j]!==q){if(code[j]==="\\")j++;j++;}return j+1;};
  const matchParen=(start)=>{let d=0,j=start;while(j<n){const c=code[j];
    if(c==='"'||c==="'"||c==="`"){j=skipStr(c,j);continue;}
    if(c==="(")d++;else if(c===")"){d--;if(!d)return j;}j++;}return -1;};
  const GUARD="if(++window.__wlg>3e6)throw new Error('Схоже, цикл ніколи не завершується');";
  while(i<n){
    const c=code[i],c2=code[i+1];
    if(c==="/"&&c2==="/"){let j=code.indexOf("\n",i);if(j<0)j=n;out+=code.slice(i,j);i=j;continue;}
    if(c==="/"&&c2==="*"){let j=code.indexOf("*/",i+2);j=j<0?n:j+2;out+=code.slice(i,j);i=j;continue;}
    if(c==='"'||c==="'"||c==="`"){const j=skipStr(c,i);out+=code.slice(i,j);i=j;continue;}
    if(!/[\w$.]/.test(code[i-1]||" ")){
      const m=code.slice(i,i+8).match(/^(for|while|do)(?![\w$])/);
      if(m){
        let j=i+m[1].length;
        if(m[1]!=="do"){let p=j;while(/\s/.test(code[p]||""))p++;if(code[p]==="("){const e=matchParen(p);if(e>0)j=e+1;}}
        let k=j;while(/\s/.test(code[k]||""))k++;
        if(code[k]==="{"){out+=code.slice(i,k+1)+GUARD;i=k+1;continue;}
        out+=code.slice(i,j);i=j;continue;}
    }
    out+=c;i++;
  }
  return out;
}

// ---------- Склад HTML-документа для iframe ----------
function inject(html,snippet,where){
  if(where==="head"){
    if(/<head[^>]*>/i.test(html))return html.replace(/<head[^>]*>/i,m=>m+snippet);
    if(/<html[^>]*>/i.test(html))return html.replace(/<html[^>]*>/i,m=>m+"<head>"+snippet+"</head>");
    if(/^\s*<!doctype[^>]*>/i.test(html))return html.replace(/^\s*<!doctype[^>]*>/i,m=>m+"<head>"+snippet+"</head>");
    return "<!doctype html><head>"+snippet+"</head>"+html;
  }
  if(/<\/body>/i.test(html))return html.replace(/<\/body>/i,m=>snippet+m);
  return html+snippet;
}
const escJS=s=>String(s).replace(/<\/(script)/gi,"<\\/$1").replace(/<!--/g,"<\\!--");
const escCSS=s=>String(s).replace(/<\/(style)/gi,"<\\/$1");
const RUNNER=`(function(){
var P=function(m){try{parent.postMessage(m,"*")}catch(e){}};
var logs=[];window.__wlg=0;window.__wlLogs=logs;
function fmt(a){try{if(typeof a==="string")return a;if(a instanceof Error)return a.message;if(typeof a==="function")return String(a);if(typeof a==="undefined")return "undefined";return typeof a==="object"?JSON.stringify(a):String(a)}catch(e){return String(a)}}
["log","info","warn","error"].forEach(function(l){var o=console[l];console[l]=function(){var t=[].map.call(arguments,fmt).join(" ");logs.push(t);P({t:"log",level:l,text:t});try{o.apply(console,arguments)}catch(e){}}});
var errs=[];
window.addEventListener("error",function(e){var m=(e.error&&e.error.message)||e.message||"Помилка";var ln=(e.filename===""||!e.filename)?e.lineno:e.lineno;errs.push({msg:m,line:ln});P({t:"error",msg:m,line:ln});});
window.addEventListener("unhandledrejection",function(e){var m=(e.reason&&e.reason.message)||String(e.reason);errs.push({msg:m});P({t:"error",msg:m});});
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(a){var h=a.getAttribute("href");e.preventDefault();if(h&&h.charAt(0)==="#"&&h.length>1){var t=document.getElementById(h.slice(1));if(t)t.scrollIntoView()}}},true);
document.addEventListener("submit",function(e){e.preventDefault()},true);
window.prompt=function(){return null};window.alert=function(m){logs.push("alert: "+m);P({t:"log",level:"info",text:"alert: "+fmt(m)})};window.confirm=function(){return true};
function qsa(s){try{return [].slice.call(document.querySelectorAll(s))}catch(e){throw new Error("Некоректний селектор «"+s+"»")}}
function norm(s){return String(s==null?"":s).replace(/\\s+/g," ").trim()}
function deq(a,b){if(typeof a==="number"&&typeof b==="number")return Math.abs(a-b)<1e-9;if(a===b)return true;if(a&&b&&typeof a==="object"&&typeof b==="object"){var ka=Object.keys(a),kb=Object.keys(b);if(ka.length!==kb.length||Array.isArray(a)!==Array.isArray(b))return false;return ka.every(function(k){return deq(a[k],b[k])})}return false}
function cmpStyle(el,prop,val){
  var cs=getComputedStyle(el).getPropertyValue(prop).trim();
  var want=String(val).trim().replace(/\\s*!important$/i,"");
  if(cs.toLowerCase()===want.toLowerCase())return true;
  try{var pr=el.cloneNode(false);pr.removeAttribute("id");pr.style.setProperty(prop,want,"important");(el.parentNode||document.body).insertBefore(pr,el.nextSibling);var w=getComputedStyle(pr).getPropertyValue(prop).trim();pr.remove();return w!==""&&cs===w}catch(e){return false}
}
function rx(v){var m=String(v).match(/^\\/(.+)\\/([gimsu]*)$/);return m?new RegExp(m[1],m[2]):null}
var T={
 exists:function(c){var n=qsa(c.sel).length;return n>=(+c.min||1)&&(!c.max||n<=+c.max)},
 text:function(c){var els=qsa(c.sel);if(!els.length)return false;var w=norm(c.val).toLowerCase();var f=function(e){var t=norm(e.textContent).toLowerCase();return c.exact?t===w:t.indexOf(w)>-1};return c.all?els.every(f):els.some(f)},
 attr:function(c){var els=qsa(c.sel);if(!els.length)return false;var f=function(e){if(!e.hasAttribute(c.attr))return false;if(c.val===""||c.val==null)return true;return norm(e.getAttribute(c.attr)).toLowerCase()===norm(c.val).toLowerCase()||(!c.exact&&norm(e.getAttribute(c.attr)).toLowerCase().indexOf(norm(c.val).toLowerCase())>-1)};return c.all?els.every(f):els.some(f)},
 style:function(c){c=Object.assign({},c,{prop:String(c.prop).replace(/[A-Z]/g,function(m){return "-"+m.toLowerCase()}).trim()});var els=qsa(c.sel);if(!els.length)return false;var f=function(e){return cmpStyle(e,c.prop,c.val)};return c.all?els.every(f):els.some(f)},
 code:function(c,src){var s=String(src[c.file]||""),r=rx(c.val),has=r?r.test(s):s.toLowerCase().replace(/\\s+/g," ").indexOf(norm(c.val).toLowerCase())>-1;return c.not?!has:has},
 output:function(c){var t=logs.join("\\n");return c.exact?norm(t)===norm(c.val):t.indexOf(c.val)>-1},
 fn:function(c){var name=String(c.name||"").trim();if(!/^[A-Za-z_$][\\w$.]*$/.test(name))throw new Error("Некоректна назва функції");var f;try{f=(0,eval)(name)}catch(e){f=undefined}
  if(typeof f!=="function")throw new Error("Функцію «"+name+"» не знайдено — перевірте її назву");
  var args=c.args&&String(c.args).trim()?JSON.parse(c.args):[];var exp=JSON.parse(c.expect);var res=f.apply(null,args);return deq(res,exp)},
 js:function(c,src){var f=new Function("document","window","output","src",'"use strict";'+c.body);var r=f(document,window,logs.join("\\n"),src);return !!r}
};
window.addEventListener("message",function(e){var d=e.data;if(!d||d.t!=="check")return;
  var res=d.checks.map(function(c){try{return {ok:!!T[c.type](c,d.src)}}catch(x){return {ok:false,err:x.message}}});
  P({t:"result",results:res,id:d.id});});
window.addEventListener("load",function(){setTimeout(function(){P({t:"ready",errors:errs})},30)});
})();`;

const MARK="/*wl*/window.__wlg=0;\n";
export function buildDoc({html="",css="",js=""}){
  let d=inject(html,`<script>${escJS(RUNNER)}<\/script><style>${escCSS(css)}</style>`,"head"),line0=0,jsLines=0;
  if(js.trim()){
    let g=js;try{g=guardLoops(js);new Function(g);}catch(e){g=js;}
    d=inject(d,`<script>${MARK}${escJS(g)}\n<\/script>`,"body");
    const idx=d.indexOf(MARK);line0=lineOf(d,idx+MARK.length);jsLines=js.split("\n").length;
  }
  return {doc:d,line0,jsLines};
}

// ---------- Запуск у sandbox ----------
// frame — iframe з sandbox="allow-scripts". Повертає керування з об'єктом {errors,logs,send(checks)}.
export function runInFrame(frame,files,{onLog,onError}={}){
  return new Promise(resolve=>{
    const logs=[],errors=[];let done=false,pend=null;
    const {doc,line0,jsLines}=buildDoc(files);
    const mapLine=l=>{if(!l||!line0)return undefined;const x=l-line0+1;return x>=1&&x<=jsLines?x:undefined;};
    const on=e=>{
      if(e.source!==frame.contentWindow)return;const d=e.data||{};
      if(d.t==="log"){logs.push(d.text);onLog&&onLog(d);}
      else if(d.t==="error"){const er={msg:d.msg,line:mapLine(d.line)};errors.push(er);onError&&onError(er);}
      else if(d.t==="ready"&&!done){done=true;clearTimeout(tm);
        resolve({logs,errors,check:(checks)=>new Promise(r=>{pend=r;try{frame.contentWindow.postMessage({t:"check",checks,src:files,id:1},"*");}catch(x){r(null);}setTimeout(()=>{if(pend===r){pend=null;r(null);}},4000);})});}
      else if(d.t==="result"&&pend){const p=pend;pend=null;p(d.results);}
    };
    frame.__wlOff&&frame.__wlOff();
    window.addEventListener("message",on);frame.__wlOff=()=>window.removeEventListener("message",on);
    const tm=setTimeout(()=>{if(done)return;done=true;resolve({logs,errors,timeout:true,check:async()=>null});},6000);
    frame.srcdoc=doc;
  });
}

// ---------- Опис перевірок ----------
export const CHECK_TYPES={
  exists:{l:"Елемент є на сторінці",f:[["sel","CSS-селектор","h1, p.note, ul li",1],["min","Мінімальна кількість","1","num"],["max","Максимальна кількість (необов’язково)","","num"]]},
  text:{l:"Елемент містить текст",f:[["sel","CSS-селектор","h1",1],["val","Текст","Привіт",1],["exact","Точний збіг (інакше — містить)",null,"chk"],["all","Для всіх знайдених елементів",null,"chk"]]},
  attr:{l:"Атрибут елемента",f:[["sel","CSS-селектор","a",1],["attr","Назва атрибута","href",1],["val","Значення (порожнє — будь-яке)","https://",0],["all","Для всіх знайдених елементів",null,"chk"]]},
  style:{l:"CSS-властивість елемента",f:[["sel","CSS-селектор","h1",1],["prop","Властивість","color",1],["val","Очікуване значення","red",1],["all","Для всіх знайдених елементів",null,"chk"]]},
  code:{l:"У коді є (або немає) фрагмента",f:[["file","Де шукати",null,"file"],["val","Фрагмент або /регулярний вираз/","<strong>",1],["not","Фрагмента НЕ повинно бути",null,"chk"]]},
  output:{l:"Консоль виводить",f:[["val","Текст у консолі","Привіт",1],["exact","Точний збіг усього виводу",null,"chk"]]},
  fn:{l:"Функція повертає потрібне значення",f:[["name","Назва функції","sum",1],["args","Аргументи — масив JSON","[2, 3]",0],["expect","Очікуваний результат — JSON","5",1]]},
  js:{l:"Власна перевірка (JavaScript)",f:[["body","Код: поверніть true, якщо все правильно","return document.querySelectorAll('li').length === 3;",1,"area"]]}
};
export function describe(c){
  const q=s=>"«"+s+"»";
  switch(c.type){
    case "exists":return `Є елемент ${q(c.sel)}`+(+c.min>1?` (щонайменше ${c.min})`:"")+(+c.max?` (не більше ${c.max})`:"");
    case "text":return `Елемент ${q(c.sel)} ${c.exact?"має текст":"містить текст"} ${q(c.val)}`;
    case "attr":return `Елемент ${q(c.sel)} має атрибут ${q(c.attr)}`+(c.val?` зі значенням ${q(c.val)}`:"");
    case "style":return `Для ${q(c.sel)} задано ${c.prop}: ${c.val}`;
    case "code":return c.not?`У ${(c.file||"").toUpperCase()}-коді немає ${q(c.val)}`:`У ${(c.file||"").toUpperCase()}-коді є ${q(c.val)}`;
    case "output":return `Консоль виводить ${q(c.val)}`;
    case "fn":return `${c.name}(${String(c.args||"").replace(/^\[|\]$/g,"")}) повертає ${c.expect}`;
    default:return "Додаткова перевірка виконана";
  }
}
export function checkLabel(c){return (c.label&&c.label.trim())||describe(c);}
export function checkProblem(c){
  for(const [k,l,,req] of CHECK_TYPES[c.type]?CHECK_TYPES[c.type].f:[]){if(req===1&&!String(c[k]||"").trim())return `Заповніть поле «${l}»`;}
  if(c.type==="code"&&!c.file)return "Оберіть, де шукати фрагмент";
  if(c.type==="fn"){try{if(c.args&&c.args.trim())JSON.parse(c.args);}catch(e){return "Аргументи мають бути масивом у форматі JSON, наприклад [2, 3]";}try{JSON.parse(c.expect);}catch(e){return "Очікуваний результат має бути у форматі JSON: 5, \"текст\", true, [1,2]";}}
  if(c.type==="js"){try{new Function("document","window","output","src",c.body);}catch(e){return "Помилка в коді власної перевірки: "+e.message;}}
  return null;
}

// ---------- Повна перевірка завдання ----------
// files: {html,css,js}; task: {checks, edit:[...]} → {pass, syntax:[{lang,line,msg,warn}], items:[{label,ok,hint}], logs}
export async function validateTask(frame,files,task,ui={}){
  const edit=task.edit||[];const syntax=[];
  if(edit.includes("html"))lintHTML(files.html||"").forEach(x=>syntax.push({lang:"HTML",...x}));
  if(edit.includes("css"))lintCSS(files.css||"").forEach(x=>syntax.push({lang:"CSS",...x}));
  const run=await runInFrame(frame,files,ui);
  const checks=task.checks||[];
  const res=checks.length&&!run.timeout?await run.check(checks):null;
  const seen=new Set();
  run.errors.forEach(e=>{const k=e.msg+"|"+e.line;if(seen.has(k))return;seen.add(k);syntax.push({lang:"JS",line:e.line,msg:e.msg});});
  if(run.timeout)syntax.push({lang:"HTML",msg:"Сторінка не завантажилась — перевірте, чи закриті всі теги та коментарі"});
  const items=checks.map((c,i)=>{const r=res&&res[i];return {label:checkLabel(c),ok:!!(r&&r.ok),hint:r&&r.ok?null:(c.msg&&c.msg.trim())||(r&&r.err)||"Поки що не виконано"};});
  const hard=syntax.filter(s=>!s.warn);
  return {pass:!hard.length&&items.every(x=>x.ok),syntax,items,logs:run.logs,empty:!checks.length};
}
