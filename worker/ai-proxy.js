// Cloudflare Worker: безпечний проксі до Google Gemini API.
// Ключ Gemini лежить тут (як secret), а не в коді сайту. Приймає запити лише від власниці (перевіряється Firebase-токен).
//
// Змінні (Workers → Settings → Variables and Secrets):
//   GEMINI_KEY     — secret: ваш ключ Gemini API
//   PROJECT_ID     — projectId з js/config.js (portfolio-55d2e)
//   OWNER_UID      — OWNER_UID з js/config.js
//   ALLOWED_ORIGIN — адреса сайту без слеша в кінці, напр. https://login.github.io
const MODELS=["gemini-3.8-flash","gemini-3.6-flash","gemini-3.5-flash-lite","gemini-3.1-flash-lite","gemini-4-argon"];
const JWK_URL="https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
let jwkCache=null,jwkAt=0;

const b64=s=>Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0));
const json=(o,status,cors)=>new Response(JSON.stringify(o),{status,headers:{"content-type":"application/json",...cors}});

async function verify(token,env){
  const [h,p,s]=token.split(".");if(!s)throw new Error("bad token");
  const head=JSON.parse(new TextDecoder().decode(b64(h))),pay=JSON.parse(new TextDecoder().decode(b64(p)));
  if(Date.now()-jwkAt>3600e3||!jwkCache){jwkCache=(await (await fetch(JWK_URL)).json()).keys;jwkAt=Date.now();}
  const jwk=jwkCache.find(k=>k.kid===head.kid);if(!jwk||head.alg!=="RS256")throw new Error("unknown key");
  const key=await crypto.subtle.importKey("jwk",jwk,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
  const ok=await crypto.subtle.verify("RSASSA-PKCS1-v1_5",key,b64(s),new TextEncoder().encode(h+"."+p));
  const now=Date.now()/1000;
  if(!ok||pay.aud!==env.PROJECT_ID||pay.iss!=="https://securetoken.google.com/"+env.PROJECT_ID||pay.exp<now||pay.sub!==env.OWNER_UID)throw new Error("forbidden");
}

export default {
  async fetch(req,env){
    const cors={"access-control-allow-origin":env.ALLOWED_ORIGIN,"access-control-allow-headers":"content-type,authorization","access-control-allow-methods":"POST,OPTIONS","vary":"origin"};
    if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
    if(req.method!=="POST"||req.headers.get("origin")!==env.ALLOWED_ORIGIN)return json({error:{message:"forbidden"}},403,cors);
    try{await verify((req.headers.get("authorization")||"").replace(/^Bearer /,""),env);}catch(e){return json({error:{message:"Немає доступу"}},401,cors);}
    let body;try{body=await req.json();}catch(e){return json({error:{message:"bad json"}},400,cors);}
    if(!MODELS.includes(body.model)||!body.request||typeof body.request!=="object")return json({error:{message:"model not allowed"}},400,cors);
    const gc=body.request.generationConfig=body.request.generationConfig||{};
    gc.maxOutputTokens=Math.min(+gc.maxOutputTokens||8000,32000);
    const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+body.model+":generateContent",{method:"POST",headers:{"content-type":"application/json","x-goog-api-key":env.GEMINI_KEY},body:JSON.stringify(body.request)});
    return new Response(r.body,{status:r.status,headers:{"content-type":"application/json",...cors}});
  }
};
