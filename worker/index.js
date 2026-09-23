const DAILY_POINT_LIMIT = 300;
const POINT_MEDALS = [
  { code: "points-100", title: "铜牌 · 初露锋芒", threshold: 100, icon: "🥉" },
  { code: "points-500", title: "银牌 · 稳步前进", threshold: 500, icon: "🥈" },
  { code: "points-1500", title: "金牌 · 持之以恒", threshold: 1500, icon: "🥇" },
  { code: "points-5000", title: "钻石 · 挪威语达人", threshold: 5000, icon: "💎" },
];
const CHINESE_FESTIVALS = {
  "2026-02-17": ["chinese-new-year", "春节学习者"], "2026-04-05": ["qingming", "清明读书人"], "2026-06-19": ["dragon-boat", "端午挑战者"], "2026-09-25": ["mid-autumn", "中秋共学"],
  "2027-02-06": ["chinese-new-year", "春节学习者"], "2027-04-05": ["qingming", "清明读书人"], "2027-06-09": ["dragon-boat", "端午挑战者"], "2027-09-15": ["mid-autumn", "中秋共学"],
  "2028-01-26": ["chinese-new-year", "春节学习者"], "2028-04-04": ["qingming", "清明读书人"], "2028-05-28": ["dragon-boat", "端午挑战者"], "2028-10-03": ["mid-autumn", "中秋共学"],
  "2029-02-13": ["chinese-new-year", "春节学习者"], "2029-04-04": ["qingming", "清明读书人"], "2029-06-16": ["dragon-boat", "端午挑战者"], "2029-09-22": ["mid-autumn", "中秋共学"],
  "2030-02-03": ["chinese-new-year", "春节学习者"], "2030-04-05": ["qingming", "清明读书人"], "2030-06-05": ["dragon-boat", "端午挑战者"], "2030-09-12": ["mid-autumn", "中秋共学"],
};

const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", ...extra } });
const now = () => new Date().toISOString();
const osloDate = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
function osloDayStart() { const date=osloDate();const utcNoon=new Date(`${date}T12:00:00.000Z`);const hour=Number(new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Oslo",hour:"2-digit",hourCycle:"h23"}).format(utcNoon));const offset=hour-12;return new Date(Date.parse(`${date}T00:00:00.000Z`)-offset*3600000).toISOString(); }
const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
function osloSpecialDates(date) {
  const [, month, day] = date.split("-"); const mmdd = `${month}-${day}`; const found=[];
  if (mmdd === "01-01") found.push(["norway-new-year", "新年学习者"], ["china-new-year-gregorian", "元旦学习者"]);
  if (mmdd === "02-06") found.push(["sami-national-day", "萨米日共学"]);
  if (mmdd === "05-17") found.push(["norway-national-day", "挪威国庆日学习者"]);
  if (mmdd === "12-24") found.push(["norwegian-christmas", "圣诞学习者"]);
  if (mmdd === "10-01") found.push(["china-national-day", "国庆学习者"]);
  if (CHINESE_FESTIVALS[date]) found.push(CHINESE_FESTIVALS[date]);
  return found;
}
function supabaseUrl(env, path) { if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) throw new Error("AUTH_NOT_CONFIGURED"); return `${env.SUPABASE_URL.replace(/\/$/, "")}/auth/v1/${path}`; }
async function authRequest(env, path, payload, accessToken = "", method = payload === null ? "GET" : "POST") {
  let response;
  try { response = await fetch(supabaseUrl(env,path), { method, headers: { apikey: env.SUPABASE_ANON_KEY, "content-type": "application/json", ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}) }, ...(payload === null ? {} : { body: JSON.stringify(payload) }) }); }
  catch { return { response: null, data: { msg: "登录服务暂时不可用。" } }; }
  let data; try { data = await response.json(); } catch { data = {}; }
  return { response, data };
}
function authError(data, fallback = "认证请求失败，请稍后重试。") { return data?.msg || data?.message || data?.error_description || data?.error || fallback; }
async function authProxy(request, env, path, payload, token = "", method = "POST") {
  const { response, data } = await authRequest(env,path,payload,token,method);
  if (!response) return json({ error: "登录服务暂时不可用。" }, 502);
  return json(response.ok ? data : { error: authError(data), needsVerification: response.status === 400 && /email not confirmed/i.test(authError(data,"")) }, response.status);
}
async function verifiedUser(request, env) {
  const token = (request.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i)?.[1]; if (!token) return null;
  const { response, data } = await authRequest(env,"user",null,token);
  if (!response?.ok || !data?.id || !data.email_confirmed_at) return null;
  return data;
}
async function ensureProfile(env, user) {
  const existing = await env.DB.prepare("SELECT id,nickname,points FROM users WHERE id=?").bind(user.id).first();
  if (existing) return existing;
  const candidate = String(user.user_metadata?.nickname || user.email?.split("@")[0] || "学习者").trim().slice(0,24) || "学习者";
  await env.DB.prepare("INSERT OR IGNORE INTO users (id,nickname,points,created_at) VALUES (?,?,0,?)").bind(user.id,candidate,now()).run();
  return env.DB.prepare("SELECT id,nickname,points FROM users WHERE id=?").bind(user.id).first();
}
async function issueMedals(env, userId, points) {
  const earned=[];
  for(const medal of POINT_MEDALS) if(points>=medal.threshold){const r=await env.DB.prepare("INSERT OR IGNORE INTO medals (user_id,code,title,icon,earned_at) VALUES (?,?,?,?,?)").bind(userId,medal.code,medal.title,medal.icon,now()).run();if(r.meta.changes)earned.push(medal);}
  const date=osloDate();
  for(const [code,title] of osloSpecialDates(date)){const medal={code:`${code}-${date.slice(0,4)}`,title,icon:"🎖️"};const r=await env.DB.prepare("INSERT OR IGNORE INTO medals (user_id,code,title,icon,earned_at) VALUES (?,?,?,?,?)").bind(userId,medal.code,medal.title,medal.icon,now()).run();if(r.meta.changes)earned.push(medal);}
  return earned;
}
async function score(request, env, user) {
  const input=await request.json().catch(()=>({}));const eventId=String(input.eventId||"");const type=String(input.type||"");
  if(!/^[0-9a-f-]{36}$/i.test(eventId)||!("answer vocab completion".split(" ").includes(type)))return json({error:"无效的学习记录。"},400);
  const daily=await env.DB.prepare("SELECT COALESCE(SUM(points),0) AS n FROM score_events WHERE user_id=? AND created_at>=?").bind(user.id,osloDayStart()).first();
  const correct=input.correct===true;const base=type==="answer"?(correct?3:1):type==="vocab"?(correct?5:1):5;const points=Math.max(0,Math.min(base,DAILY_POINT_LIMIT-(daily?.n||0)));
  const inserted=await env.DB.prepare("INSERT INTO score_events (event_id,user_id,event_type,points,created_at) VALUES (?,?,?,?,?) ON CONFLICT(event_id) DO NOTHING RETURNING points").bind(eventId,user.id,type,points,now()).first();let medals=[];
  if(inserted){if(points)await env.DB.prepare("UPDATE users SET points=points+? WHERE id=?").bind(points,user.id).run();const latest=await env.DB.prepare("SELECT points FROM users WHERE id=?").bind(user.id).first();medals=await issueMedals(env,user.id,latest?.points||0);}
  const latest=await env.DB.prepare("SELECT points FROM users WHERE id=?").bind(user.id).first();return json({ok:true,points:latest?.points||0,awarded:inserted?.points||0,newMedals:medals});
}
async function leaderboard(request, env) {
  const period=new URL(request.url).searchParams.get("period")==="week"?"week":"all";let result;
  if(period==="week")result=await env.DB.prepare("SELECT u.nickname,SUM(e.points) AS points FROM score_events e JOIN users u ON u.id=e.user_id WHERE strftime('%Y-%W',e.created_at)=strftime('%Y-%W','now') GROUP BY u.id ORDER BY points DESC,u.nickname COLLATE NOCASE LIMIT 50").all();
  else result=await env.DB.prepare("SELECT nickname,points FROM users ORDER BY points DESC,nickname COLLATE NOCASE LIMIT 50").all();
  return json({period,rows:result.results||[]});
}
async function me(env,user) { const profile=await ensureProfile(env,user);const medals=await env.DB.prepare("SELECT code,title,icon,earned_at AS earnedAt FROM medals WHERE user_id=? ORDER BY earned_at DESC").bind(user.id).all();return json({user:{id:user.id,nickname:profile.nickname,points:profile.points},medals:medals.results||[]}); }
async function verifyLinkPage() {
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>确认邮箱</title><main style="font:16px system-ui;max-width:520px;margin:12vh auto;padding:24px"><h1>Norsk hver dag</h1><p>邮箱验证由 Supabase 安全处理。若链接无法打开，请回到登录页重新发送验证邮件。</p><a href="/">返回学习页面</a></main>`,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","referrer-policy":"no-referrer","content-security-policy":"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"}});
}
export default {
  async fetch(request,env){
    const url=new URL(request.url);if(!url.pathname.startsWith("/api/"))return env.ASSETS.fetch(request);
    if(request.method==="OPTIONS")return new Response(null,{status:204,headers:{allow:"GET,POST,OPTIONS","cache-control":"no-store"}});
    if(!env.DB)return json({error:"账号服务尚未配置 D1 数据库。"},503);
    if(request.method==="POST"&&request.headers.get("origin")&&request.headers.get("origin")!==url.origin)return json({error:"请求来源不允许。"},403);
    try{
      if(url.pathname==="/api/auth/verify-link"&&request.method==="GET")return verifyLinkPage();
      if(url.pathname==="/api/auth/register"&&request.method==="POST"){
        const input=await request.json();const email=String(input.email||"").trim().toLowerCase();const nickname=String(input.nickname||"").trim();const password=String(input.password||"");
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||nickname.length<2||nickname.length>24||password.length<12||password.length>128)return json({error:"请提供有效邮箱、2–24字昵称和至少12位密码。"},400);
        const redirectTo=`${url.origin}/?verified=1#account`;return authProxy(request,env,`signup?redirect_to=${encodeURIComponent(redirectTo)}`,{email,password,data:{nickname}});
      }
      if(url.pathname==="/api/auth/login"&&request.method==="POST"){const input=await request.json();return authProxy(request,env,"token?grant_type=password",{email:String(input.email||"").trim().toLowerCase(),password:String(input.password||"")});}
      if(url.pathname==="/api/auth/resend"&&request.method==="POST"){const input=await request.json();return authProxy(request,env,`resend?redirect_to=${encodeURIComponent(`${url.origin}/?verified=1#account`)}`,{type:"signup",email:String(input.email||"").trim().toLowerCase()});}
      if(url.pathname==="/api/auth/forgot"&&request.method==="POST"){const input=await request.json();const {response,data}=await authRequest(env,`recover?redirect_to=${encodeURIComponent(`${url.origin}/?recovery=1#account`)}`,{email:String(input.email||"").trim().toLowerCase()});if(!response)return json({error:"登录服务暂时不可用。"},502);return response.ok?json({ok:true,message:"如果该邮箱已注册，密码重置链接将会发送。"}):json({error:authError(data)},response.status);}
      if(url.pathname==="/api/auth/reset"&&request.method==="POST"){const input=await request.json();const password=String(input.password||"");if(password.length<12||password.length>128)return json({error:"新密码至少12位。"},400);const token=(request.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");return authProxy(request,env,"user",{password},token,"PUT");}
      if(url.pathname==="/api/auth/refresh"&&request.method==="POST"){const input=await request.json();return authProxy(request,env,"token?grant_type=refresh_token",{refresh_token:String(input.refresh_token||"")});}
      if(url.pathname==="/api/auth/logout"&&request.method==="POST"){const token=(request.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");if(token)await authRequest(env,"logout",null,token,"POST");return json({ok:true});}
      if(url.pathname==="/api/leaderboard"&&request.method==="GET")return leaderboard(request,env);
      if(url.pathname==="/api/auth/me"&&request.method==="GET"){const user=await verifiedUser(request,env);return user?me(env,user):json({user:null,medals:[]});}
      if(url.pathname==="/api/score"&&request.method==="POST"){const user=await verifiedUser(request,env);return user?score(request,env,user):json({error:"请先登录并验证邮箱。"},401);}
      if(url.pathname==="/api/auth/delete"&&request.method==="POST"){const user=await verifiedUser(request,env);if(!user)return json({error:"请先登录。"},401);await env.DB.prepare("DELETE FROM users WHERE id=?").bind(user.id).run();return json({ok:true});}
      return json({error:"找不到此接口。"},404);
    }catch(error){console.error("API error",error);return json({error:error.message==="AUTH_NOT_CONFIGURED"?"尚未配置 Supabase 登录服务。":"服务暂时不可用，请稍后重试。"},error.message==="AUTH_NOT_CONFIGURED"?503:500);}
  }
};
