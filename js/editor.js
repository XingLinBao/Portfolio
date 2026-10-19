// Редактор коду: CodeMirror 5 (підсвітка синтаксису, автозакриття тегів і дужок).
// Якщо бібліотека не завантажилась (немає мережі) — автоматично використовується звичайне текстове поле.
const CDN="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/";
const MODES={html:"htmlmixed",css:"css",js:"javascript"};
let cmP=null;
const script=src=>new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=()=>rej(new Error(src));document.head.append(s);});
export function loadCM(){
  if(window.CodeMirror)return Promise.resolve(true);
  if(!cmP){
    const l=document.createElement("link");l.rel="stylesheet";l.href=CDN+"codemirror.min.css";document.head.append(l);
    cmP=(async()=>{
      await script(CDN+"codemirror.min.js");
      await Promise.all(["mode/xml/xml.min.js","mode/css/css.min.js","mode/javascript/javascript.min.js","addon/edit/matchbrackets.min.js","addon/edit/closebrackets.min.js","addon/fold/xml-fold.min.js"].map(f=>script(CDN+f)));
      await Promise.all(["mode/htmlmixed/htmlmixed.min.js","addon/edit/closetag.min.js"].map(f=>script(CDN+f)));
      return true;
    })().catch(()=>false);
  }
  return cmP;
}

// lang: "html" | "css" | "js"
export async function createEditor({lang,value="",readOnly=false,onChange}){
  const ok=await loadCM();
  const el=document.createElement("div");el.className="ed";
  if(ok&&window.CodeMirror){
    const cm=window.CodeMirror(el,{value,mode:MODES[lang]||"htmlmixed",theme:"wl",lineNumbers:true,lineWrapping:true,tabSize:2,indentUnit:2,indentWithTabs:false,
      matchBrackets:true,autoCloseBrackets:true,autoCloseTags:lang==="html",readOnly:!!readOnly,
      spellcheck:false,inputStyle:"contenteditable",
      extraKeys:{Tab:c=>c.somethingSelected()?c.indentSelection("add"):c.replaceSelection("  ","end"),"Shift-Tab":c=>c.indentSelection("subtract")}});
    cm.on("change",()=>onChange&&onChange());
    let marks=[];
    return {el,cm:true,get:()=>cm.getValue(),set:v=>{cm.setValue(v||"");},focus:()=>cm.focus(),refresh:()=>cm.refresh(),
      mark(lines){marks.forEach(n=>cm.removeLineClass(n,"background","wl-err"));marks=[];(lines||[]).forEach(n=>{if(n>=1&&n<=cm.lineCount()){cm.addLineClass(n-1,"background","wl-err");marks.push(n-1);}});},
      goto(n){if(n>=1&&n<=cm.lineCount()){cm.setCursor(n-1,0);cm.focus();}}};
  }
  const ta=document.createElement("textarea");ta.className="ed-ta";ta.value=value;ta.spellcheck=false;ta.readOnly=!!readOnly;ta.setAttribute("aria-label","Редактор коду "+lang.toUpperCase());
  ta.addEventListener("input",()=>onChange&&onChange());
  ta.addEventListener("keydown",e=>{
    if(e.key==="Tab"&&!e.shiftKey){e.preventDefault();const s=ta.selectionStart;ta.setRangeText("  ",s,ta.selectionEnd,"end");ta.dispatchEvent(new Event("input"));}
    else if(e.key==="Enter"){const s=ta.selectionStart,line=ta.value.slice(0,s).split("\n").pop(),ind=line.match(/^\s*/)[0];e.preventDefault();ta.setRangeText("\n"+ind,s,ta.selectionEnd,"end");ta.dispatchEvent(new Event("input"));}
  });
  el.append(ta);
  return {el,cm:false,get:()=>ta.value,set:v=>{ta.value=v||"";},focus:()=>ta.focus(),refresh(){},mark(){},goto(){}};
}
