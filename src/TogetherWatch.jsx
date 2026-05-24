import { useState, useRef, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=JetBrains+Mono:wght@300;400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07090f;--s1:#0f1219;--s2:#161b27;--s3:#1e2435;
  --b1:rgba(150,130,255,0.10);--b2:rgba(150,130,255,0.20);
  --acc:#a78bfa;--acc2:#60a5fa;--acc3:#f472b6;
  --txt:#dde4f0;--muted:#5a677e;
  --ok:#34d399;--warn:#fbbf24;--err:#f87171;
  --r:10px;--ease:.18s ease;
  --serif:'Playfair Display',Georgia,serif;
  --mono:'JetBrains Mono',monospace;
}
html,body,#root{height:100%;width:100%;overflow:hidden}
body{background:var(--bg);color:var(--txt);font-family:var(--mono);font-size:13px;line-height:1.55}
button{cursor:pointer;font-family:var(--mono)}
input,select,textarea{font-family:var(--mono)}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-thumb{background:var(--b2);border-radius:2px}
::-webkit-scrollbar-track{background:transparent}

/* ── Landing ── */
.land{display:flex;flex-direction:column;align-items:center;justify-content:center;
  min-height:100vh;padding:2rem;gap:2rem;
  background:radial-gradient(ellipse 80% 60% at 30% 10%,rgba(167,139,250,.07) 0%,transparent 55%),
             radial-gradient(ellipse 60% 50% at 75% 90%,rgba(96,165,250,.05) 0%,transparent 55%);}
.land-logo{text-align:center;display:flex;flex-direction:column;align-items:center;gap:.6rem}
.land-icon{width:68px;height:68px;border-radius:50%;
  background:linear-gradient(135deg,var(--acc),var(--acc2));
  display:flex;align-items:center;justify-content:center;font-size:2rem;
  box-shadow:0 0 40px rgba(167,139,250,.35)}
.land-title{font-family:var(--serif);font-size:clamp(2.2rem,5vw,3.8rem);font-weight:600;
  background:linear-gradient(135deg,#fff 30%,var(--acc));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.land-sub{font-size:.72rem;color:var(--muted);letter-spacing:.18em;text-transform:uppercase}
.card{background:var(--s1);border:1px solid var(--b1);border-radius:16px;
  padding:2rem;width:100%;max-width:440px;display:flex;flex-direction:column;gap:1.25rem}
.card-h{font-family:var(--serif);font-size:1.3rem;font-weight:400;text-align:center}
.lbl{color:var(--muted);font-size:.66rem;letter-spacing:.15em;text-transform:uppercase;margin-bottom:.3rem}
.inp{width:100%;background:var(--s2);border:1px solid var(--b1);border-radius:var(--r);
  padding:.65rem .9rem;color:var(--txt);font-size:.82rem;outline:none;transition:border-color var(--ease)}
.inp:focus{border-color:var(--acc)}
.inp::placeholder{color:var(--muted)}
.tabs2{display:flex;gap:.5rem}
.tab2{flex:1;padding:.55rem;border-radius:8px;font-size:.72rem;border:1px solid var(--b1);
  background:transparent;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;
  transition:all var(--ease)}
.tab2.on{background:linear-gradient(135deg,var(--acc),var(--acc2));color:#fff;border-color:transparent;
  box-shadow:0 3px 16px rgba(167,139,250,.3)}
.tab2:hover:not(.on){color:var(--txt);border-color:var(--b2)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;
  padding:.65rem 1.25rem;border-radius:var(--r);font-size:.78rem;border:none;
  letter-spacing:.07em;text-transform:uppercase;transition:all var(--ease);position:relative;overflow:hidden}
.btn:active{transform:scale(.97)}
.btn-p{background:linear-gradient(135deg,var(--acc),var(--acc2));color:#fff;width:100%;
  box-shadow:0 3px 20px rgba(167,139,250,.3)}
.btn-p:hover{box-shadow:0 5px 28px rgba(167,139,250,.45)}
.btn-o{background:transparent;border:1px solid var(--b2);color:var(--txt)}
.btn-o:hover{border-color:var(--acc);color:var(--acc)}
.btn-d{background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.25);color:var(--err)}
.btn-d:hover{background:rgba(248,113,113,.22)}
.btn-sm{padding:.38rem .75rem;font-size:.68rem}
.divdr{display:flex;align-items:center;gap:.75rem;color:var(--muted);font-size:.68rem}
.divdr::before,.divdr::after{content:'';flex:1;height:1px;background:var(--b1)}
.tip{color:var(--muted);font-size:.72rem;line-height:1.8;text-align:center}

/* ── Room shell ── */
.room{display:flex;flex-direction:column;height:100vh;overflow:hidden}
.hdr{display:flex;align-items:center;justify-content:space-between;
  padding:.6rem 1.2rem;border-bottom:1px solid var(--b1);
  background:rgba(7,9,15,.85);backdrop-filter:blur(12px);
  position:relative;z-index:50;gap:.75rem;flex-shrink:0}
.hdr-logo{font-family:var(--serif);font-size:1.25rem;font-weight:600;
  background:linear-gradient(135deg,#fff,var(--acc));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;white-space:nowrap}
.hdr-mid{display:flex;align-items:center;gap:.75rem}
.room-code{display:flex;align-items:center;gap:.4rem;color:var(--muted);font-size:.7rem;
  cursor:pointer;transition:color var(--ease);background:var(--s2);border:1px solid var(--b1);
  border-radius:6px;padding:.3rem .6rem}
.room-code:hover{color:var(--acc);border-color:var(--b2)}
.badge{display:inline-flex;align-items:center;gap:.3rem;padding:.2rem .55rem;
  border-radius:99px;font-size:.62rem;letter-spacing:.09em;text-transform:uppercase}
.badge-ok{background:rgba(52,211,153,.1);color:var(--ok);border:1px solid rgba(52,211,153,.2)}
.badge-warn{background:rgba(251,191,36,.1);color:var(--warn);border:1px solid rgba(251,191,36,.2)}
.dot{width:6px;height:6px;border-radius:50%;display:inline-block}
.dot-ok{background:var(--ok);box-shadow:0 0 6px var(--ok);animation:blink 2s infinite}
.dot-warn{background:var(--warn);animation:blink 1s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
.hdr-right{display:flex;align-items:center;gap:.5rem}

/* ── Layout ── */
.main{display:grid;grid-template-columns:1fr 320px;flex:1;min-height:0;overflow:hidden}
.pcol{display:flex;flex-direction:column;border-right:1px solid var(--b1);min-height:0;position:relative}

/* ── Drop zone ── */
.dropzone{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:1rem;cursor:pointer;transition:all var(--ease);position:relative;
  border:2px dashed var(--b2);margin:1rem;border-radius:14px}
.dropzone:hover,.dropzone.over{border-color:var(--acc);background:rgba(167,139,250,.04)}
.dz-icon{font-size:3.5rem;opacity:.35}
.dz-title{font-family:var(--serif);font-size:1.5rem;color:var(--txt)}
.dz-sub{color:var(--muted);font-size:.72rem;text-align:center;max-width:280px;line-height:1.7}
.dz-btn{margin-top:.5rem}

/* ─────────────────────────────────────────────
   VIDEO WRAPPER
   All controls & overlays live INSIDE this div
   so they stay visible in fullscreen.
───────────────────────────────────────────── */
.vwrap{
  background:#000;position:relative;
  display:flex;flex-direction:column;
  align-items:stretch;justify-content:flex-end;
  overflow:hidden;flex:1;min-height:0;
}

/* The actual <video> tag fills remaining space */
.vwrap .main-vid{
  flex:1;min-height:0;
  width:100%;height:100%;
  object-fit:contain;display:block;cursor:pointer;
  position:absolute;inset:0;
}
.vwrap.rot90  .main-vid{transform:rotate(90deg)  scale(.56)}
.vwrap.rot180 .main-vid{transform:rotate(180deg)}
.vwrap.rot270 .main-vid{transform:rotate(270deg) scale(.56)}

/* ── Subtitle overlay ── */
.sub-overlay{
  position:absolute;bottom:130px;left:50%;transform:translateX(-50%);
  background:rgba(0,0,0,.82);color:#fff;padding:.35rem .9rem;border-radius:6px;
  font-size:clamp(.85rem,2.2vw,1.05rem);text-align:center;max-width:80%;
  white-space:pre-wrap;pointer-events:none;z-index:6;
  text-shadow:0 1px 4px rgba(0,0,0,.9);line-height:1.5;
}
/* lift subtitle above fullscreen controls bar */
.vwrap.is-fs .sub-overlay{ bottom:130px; }

/* ── PiP camera overlays — top corners ── */
.pip-wrap{
  position:absolute;top:1rem;right:1rem;
  display:flex;gap:.6rem;flex-direction:row;
  z-index:210;pointer-events:auto;
  opacity:0;transition:opacity .35s ease;
}
.vwrap.is-fs .pip-wrap,
.pip-wrap.show{ opacity:1; }

.pip-tile{
  width:140px;height:100px;border-radius:10px;overflow:hidden;
  background:#111;border:2px solid rgba(167,139,250,.4);
  position:relative;flex-shrink:0;
  box-shadow:0 6px 24px rgba(0,0,0,.7);
}
.pip-tile video{width:100%;height:100%;object-fit:cover;display:block}
.pip-tile .pip-lbl{
  position:absolute;bottom:.3rem;left:.35rem;
  background:rgba(0,0,0,.75);color:#fff;
  font-size:.58rem;padding:.1rem .35rem;border-radius:3px;
}
.pip-tile .pip-ph{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  height:100%;color:rgba(255,255,255,.3);font-size:.6rem;gap:.3rem;text-align:center;
}
.pip-tile .pip-ph .pip-ph-ic{font-size:1.4rem;opacity:.3}
.pip-tile .pip-muted{
  position:absolute;top:.3rem;right:.3rem;
  background:rgba(248,113,113,.85);color:#fff;font-size:.55rem;
  padding:.1rem .3rem;border-radius:3px;
}

/* ─────────────────────────────────────────────
   FULLSCREEN CONTROLS OVERLAY
   Rendered INSIDE #vwrap — always present,
   slides in from the bottom on hover / activity.
───────────────────────────────────────────── */
.fs-ctrl-wrap{
  position:absolute;bottom:0;left:0;right:0;z-index:200;
  display:flex;flex-direction:column;gap:0;
  background:linear-gradient(to top,
    rgba(0,0,0,.96) 0%,
    rgba(0,0,0,.85) 45%,
    rgba(0,0,0,.5)  70%,
    transparent 100%);
  padding:2.5rem 1.4rem 1.1rem;
  transition:opacity .3s ease;
  /* HIDDEN by default in normal mode — only ctrl-bar-outer shows */
  opacity:0;
  pointer-events:none;
}
/* Only show the overlay controls when actually in fullscreen AND active */
.vwrap.is-fs.ctrl-visible .fs-ctrl-wrap{
  opacity:1;
  pointer-events:auto;
}
/* Hovering the control strip itself keeps it visible */
.vwrap.is-fs .fs-ctrl-wrap:hover{
  opacity:1;
  pointer-events:auto;
}

/* ── Shared control atoms ── */
.seek-row{display:flex;align-items:center;gap:.65rem;margin-bottom:.5rem}
.seek{
  flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,.2);
  -webkit-appearance:none;appearance:none;cursor:pointer;outline:none;
  transition:height var(--ease);
}
.seek:hover{height:6px}
.seek::-webkit-slider-runnable-track{
  height:100%;border-radius:2px;
  background:linear-gradient(to right,var(--acc) var(--pct,0%),rgba(255,255,255,.2) var(--pct,0%));
}
.seek::-webkit-slider-thumb{
  -webkit-appearance:none;width:14px;height:14px;border-radius:50%;
  background:var(--acc);box-shadow:0 0 8px rgba(167,139,250,.6);cursor:pointer;margin-top:-5px;
}
.seek::-moz-range-track{
  background:linear-gradient(to right,var(--acc) var(--pct,0%),rgba(255,255,255,.2) var(--pct,0%));
  height:4px;border-radius:2px;
}
.seek::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:var(--acc);border:none;cursor:pointer}

.tl{font-size:.68rem;color:rgba(255,255,255,.6);white-space:nowrap;min-width:95px;text-align:right}

.ctrl-row{display:flex;align-items:center;gap:.45rem;flex-wrap:wrap}
.ctrl-c{flex:1;display:flex;align-items:center;justify-content:center;gap:.4rem}
.ctrl-r{display:flex;align-items:center;gap:.38rem;margin-left:auto;flex-wrap:wrap}
.ctrl-l{display:flex;align-items:center;gap:.4rem}

.ic-btn{
  display:flex;align-items:center;justify-content:center;
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);
  border-radius:7px;padding:0;width:34px;height:34px;color:rgba(255,255,255,.85);
  transition:all var(--ease);flex-shrink:0;
}
.ic-btn:hover{background:rgba(167,139,250,.25);border-color:var(--acc);color:#fff}
.ic-btn:active{transform:scale(.93)}
.ic-btn.active{background:rgba(167,139,250,.3);border-color:var(--acc);color:var(--acc)}

.play-btn{
  width:46px;height:46px;border-radius:50%;
  background:linear-gradient(135deg,var(--acc),var(--acc2));
  border:none;color:#fff;box-shadow:0 2px 16px rgba(167,139,250,.5);
}
.play-btn:hover{box-shadow:0 3px 24px rgba(167,139,250,.65);transform:scale(1.05)}

.vol-wrap{display:flex;align-items:center;gap:.45rem}
.vol{
  width:72px;height:3px;border-radius:2px;background:rgba(255,255,255,.2);
  -webkit-appearance:none;appearance:none;cursor:pointer;outline:none;
}
.vol::-webkit-slider-runnable-track{
  height:3px;border-radius:2px;
  background:linear-gradient(to right,var(--acc2) var(--vpct,100%),rgba(255,255,255,.2) var(--vpct,100%));
}
.vol::-webkit-slider-thumb{
  -webkit-appearance:none;width:12px;height:12px;border-radius:50%;
  background:var(--acc2);cursor:pointer;margin-top:-4.5px;
}
.vol::-moz-range-track{
  background:linear-gradient(to right,var(--acc2) var(--vpct,100%),rgba(255,255,255,.2) var(--vpct,100%));
  height:3px;border-radius:2px;
}
.vol::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:var(--acc2);border:none}

.spd{
  background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:#fff;
  border-radius:6px;padding:.28rem .5rem;font-size:.7rem;outline:none;cursor:pointer;
}
.spd option{background:var(--s2);color:var(--txt)}
.spd:focus{border-color:var(--acc)}

.fname{
  font-size:.62rem;color:rgba(255,255,255,.4);text-align:center;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  padding-top:.4rem;
}

/* screenshot flash overlay */
.ss-flash{
  position:absolute;inset:0;background:#fff;z-index:300;
  animation:ssFlash .3s ease forwards;pointer-events:none;
}
@keyframes ssFlash{0%{opacity:.6}100%{opacity:0}}

/* ── Regular (non-fullscreen) controls bar — sits BELOW vwrap in normal mode ── */
/* Hidden via React state (fullscreen prop) — not :fullscreen CSS which is unreliable */
.ctrl-bar-outer{
  background:rgba(7,9,15,.97);border-top:1px solid var(--b1);
  padding:.65rem 1rem;display:flex;flex-direction:column;gap:.55rem;flex-shrink:0;
}

/* ── Side panel ── */
.side{display:flex;flex-direction:column;background:var(--s1);overflow:hidden}
.stabs{display:flex;border-bottom:1px solid var(--b1);flex-shrink:0}
.stab{
  flex:1;padding:.65rem;background:none;border:none;border-bottom:2px solid transparent;
  color:var(--muted);font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;
  cursor:pointer;transition:all var(--ease);font-family:var(--mono);
}
.stab.on{color:var(--acc);border-bottom-color:var(--acc)}
.stab:hover:not(.on){color:var(--txt)}

/* ── Camera panel ── */
.cam-panel{flex:1;overflow-y:auto;padding:.85rem;display:flex;flex-direction:column;gap:.75rem}
.cam-grid{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.cam-tile{position:relative;background:#000;border-radius:10px;overflow:hidden;
  aspect-ratio:4/3;border:1px solid var(--b1)}
.cam-tile .tile-lbl{position:absolute;bottom:.35rem;left:.35rem;
  background:rgba(0,0,0,.72);color:#fff;font-size:.6rem;
  padding:.12rem .4rem;border-radius:4px}
.cam-tile .tile-muted{position:absolute;top:.35rem;right:.35rem;
  background:rgba(248,113,113,.85);color:#fff;font-size:.58rem;
  padding:.1rem .35rem;border-radius:3px}
.cam-ph{display:flex;flex-direction:column;align-items:center;justify-content:center;
  height:100%;color:var(--muted);gap:.4rem;font-size:.65rem;text-align:center;padding:0 .5rem}
.ph-ic{font-size:1.8rem;opacity:.25}
.cam-ctrls{display:flex;gap:.5rem}
.info-box{background:var(--s2);border:1px solid var(--b1);border-radius:var(--r);
  padding:.75rem;display:flex;flex-direction:column;gap:.4rem}
.info-lbl{color:var(--muted);font-size:.62rem;letter-spacing:.12em;text-transform:uppercase}
.info-row{display:flex;align-items:center;gap:.4rem;font-size:.7rem;color:var(--muted)}
.info-code{color:var(--acc);letter-spacing:.12em}

/* ── Screenshot gallery ── */
.ss-section{display:flex;flex-direction:column;gap:.5rem}
.ss-head{display:flex;align-items:center;justify-content:space-between}
.ss-grid{display:grid;grid-template-columns:1fr 1fr;gap:.4rem}
.ss-thumb{position:relative;border-radius:6px;overflow:hidden;border:1px solid var(--b1);
  aspect-ratio:16/9;background:var(--s3)}
.ss-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.ss-thumb:hover .ss-actions{opacity:1}
.ss-actions{position:absolute;inset:0;background:rgba(0,0,0,.6);
  display:flex;align-items:center;justify-content:center;gap:.4rem;
  opacity:0;transition:opacity var(--ease)}
.ss-time{position:absolute;bottom:.25rem;left:.3rem;font-size:.55rem;
  background:rgba(0,0,0,.75);color:rgba(255,255,255,.6);padding:.1rem .3rem;border-radius:3px}
.ss-empty{color:var(--muted);font-size:.7rem;text-align:center;padding:1rem 0}

/* ── Chat ── */
.chat-panel{display:flex;flex-direction:column;flex:1;min-height:0}
.msgs{flex:1;overflow-y:auto;padding:.85rem;display:flex;flex-direction:column;gap:.65rem}
.msg{display:flex;flex-direction:column;gap:.15rem;max-width:88%}
.msg.me{align-self:flex-end}
.msg.them{align-self:flex-start}
.msg-who{font-size:.58rem;color:var(--muted);letter-spacing:.05em}
.bubble{padding:.45rem .7rem;border-radius:9px;font-size:.8rem;line-height:1.5}
.me .bubble{background:linear-gradient(135deg,rgba(167,139,250,.22),rgba(96,165,250,.18));
  border:1px solid rgba(167,139,250,.18);border-bottom-right-radius:3px}
.them .bubble{background:var(--s2);border:1px solid var(--b1);border-bottom-left-radius:3px}
.sys-msg{text-align:center;color:var(--muted);font-size:.64rem;padding:.2rem 0;letter-spacing:.04em}
.chat-inp-row{display:flex;gap:.45rem;padding:.65rem;border-top:1px solid var(--b1);flex-shrink:0}
.chat-inp{flex:1;background:var(--s2);border:1px solid var(--b1);border-radius:8px;
  padding:.5rem .7rem;color:var(--txt);font-size:.78rem;outline:none;resize:none;
  max-height:72px;transition:border-color var(--ease)}
.chat-inp:focus{border-color:var(--acc)}
.chat-inp::placeholder{color:var(--muted)}

/* ── Toasts ── */
.toast{
  position:fixed;top:68px;left:50%;transform:translateX(-50%);
  padding:.45rem 1rem;border-radius:8px;font-size:.72rem;letter-spacing:.04em;
  pointer-events:none;z-index:9999;
  animation:tIn .25s ease,tOut .25s ease 2.2s forwards;
}
.toast-sync{background:rgba(52,211,153,.15);border:1px solid rgba(52,211,153,.28);color:var(--ok)}
.toast-copy,
.toast-ss{
  top:auto;bottom:1.5rem;left:auto;right:1.5rem;transform:none;
  animation:ctIn .2s ease,ctOut .2s ease 1.8s forwards;
}
.toast-copy{background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.28);color:var(--acc)}
.toast-ss{right:auto;left:1.5rem;background:rgba(244,114,182,.15);border:1px solid rgba(244,114,182,.28);color:var(--acc3)}
@keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes tOut{to{opacity:0;transform:translateX(-50%) translateY(-8px)}}
@keyframes ctIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes ctOut{to{opacity:0;transform:translateY(6px)}}

/* ── Responsive ── */
@media(max-width:900px){
  .main{grid-template-columns:1fr;overflow-y:auto;height:auto;flex:none}
  .side{max-height:420px;border-top:1px solid var(--b1)}
  .pcol{border-right:none}
  .room{height:auto;min-height:100vh}
  .hdr-logo{font-size:1rem}
  .vol{width:52px}
  .pip-tile{width:110px;height:78px}
}
@media(max-width:580px){
  .cam-grid{grid-template-columns:1fr}
  .ss-grid{grid-template-columns:1fr}
  .hdr{flex-wrap:wrap}
  .ctrl-l .vol-wrap{display:none}
  .pip-tile{width:84px;height:60px}
}
`;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const fmt = (s) => {
  if (!s || isNaN(s)) return "0:00";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sc = Math.floor(s % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2,"0")}:${String(sc).padStart(2,"0")}`
    : `${m}:${String(sc).padStart(2,"0")}`;
};
const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();

/* ─────────────────────────────────────────────
   SRT PARSER
───────────────────────────────────────────── */
function parseSRT(raw) {
  return raw.trim().split(/\n\s*\n/).map(blk => {
    const lines = blk.trim().split("\n");
    if (lines.length < 3) return null;
    const m = lines[1].match(/(\d+:\d+:\d+[,.]?\d*)\s*-->\s*(\d+:\d+:\d+[,.]?\d*)/);
    if (!m) return null;
    const ts = s => {
      const [h,mn,rest] = s.split(":");
      const [sec,ms] = rest.replace(",",".").split(".");
      return +h*3600 + +mn*60 + +sec + (+ms||0)/1000;
    };
    return { start:ts(m[1]), end:ts(m[2]), text:lines.slice(2).join("\n").replace(/<[^>]+>/g,"") };
  }).filter(Boolean);
}

/* ─────────────────────────────────────────────
   SYNC HOOK
───────────────────────────────────────────── */
function useChannel(roomId, handler) {
  const chRef = useRef(null);
  useEffect(() => {
    if (!roomId) return;
    const ch = new BroadcastChannel(`tw_${roomId}`);
    chRef.current = ch;
    ch.onmessage = (e) => handler(e.data);
    return () => { ch.close(); chRef.current = null; };
  }, [roomId]);
  return useCallback((type, payload = {}) => {
    chRef.current?.postMessage({ type, payload, ts: Date.now() });
  }, []);
}

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const I = {
  Play:   <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  Pause:  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>,
  Bwd:    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>,
  Fwd:    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18 6h-2v12h2zm-3.5 6L6 6v12z"/></svg>,
  Bwd5:   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/><text x="7.5" y="15.5" fontSize="5.5" fill="currentColor" fontFamily="monospace" fontWeight="bold">5</text></svg>,
  Fwd5:   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/><text x="7.5" y="15.5" fontSize="5.5" fill="currentColor" fontFamily="monospace" fontWeight="bold">5</text></svg>,
  VolHi:  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>,
  VolMute:<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/></svg>,
  Fs:     <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>,
  FsExit: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>,
  Rot:    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M7.47 21.49C4.2 19.93 1.86 16.76 1.5 13H0c.51 6.16 5.66 11 11.95 11 .23 0 .44-.02.66-.03L9.95 21.5l-2.48-.01zM12.05 0c-.23 0-.44.02-.66.03l2.66 2.47 2.48.01C19.8 4.07 22.14 7.24 22.5 11H24c-.51-6.16-5.66-11-11.95-11zm-.69 14.39L8 11v8l8-4-4.64-3.39zM16 5l-8 4 4.64 3.39L16 16V5z"/></svg>,
  Sub:    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 11H5v-2h7v2zm7 0h-4v-2h4v2zm0-4H5V9h14v2z"/></svg>,
  Cam:    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>,
  CamOff: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6.5l-4-4-9.96 9.96-2.54-2.5L3 11.46 7.04 15.5 21 6.5zM3.27 3 2 4.27l3 3H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 22 21 20.73 3.27 3z"/></svg>,
  Mic:    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>,
  MicOff: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3 3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/></svg>,
  Link:   <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>,
  Send:   <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>,
  Sync:   <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>,
  Load:   <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>,
  Copy:   <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>,
  SS:     <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>,
  Dl:     <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>,
  Trash:  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>,
};

/* ─────────────────────────────────────────────
   LANDING
───────────────────────────────────────────── */
function Landing({ onEnter }) {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState("create");
  const go = () => {
    const n = name.trim();
    const r = mode === "create" ? uid() : roomId.trim().toUpperCase();
    if (!n) return alert("Please enter your name.");
    if (mode === "join" && !r) return alert("Please enter a room code.");
    onEnter({ name: n, roomId: r });
  };
  return (
    <div className="land">
      <div className="land-logo">
        <div className="land-icon">🎬</div>
        <div className="land-title">Together Watch</div>
        <div className="land-sub">Cinema for two · anywhere</div>
      </div>
      <div className="card">
        <div className="card-h">Create or join a room</div>
        <div>
          <div className="lbl">Your name</div>
          <input className="inp" placeholder="e.g. Jordan" value={name} maxLength={22}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key==="Enter" && go()} />
        </div>
        <div className="tabs2">
          <button className={`tab2 ${mode==="create"?"on":""}`} onClick={() => setMode("create")}>Create Room</button>
          <button className={`tab2 ${mode==="join"?"on":""}`} onClick={() => setMode("join")}>Join Room</button>
        </div>
        {mode === "join" && (
          <div>
            <div className="lbl">Room code</div>
            <input className="inp" placeholder="e.g. AB12CD" value={roomId} maxLength={8}
              onChange={e => setRoomId(e.target.value.toUpperCase())}
              onKeyDown={e => e.key==="Enter" && go()} />
          </div>
        )}
        <button className="btn btn-p" onClick={go}>
          {mode === "create" ? "✨ Create Room & Enter" : "→ Join Room"}
        </button>
        <div className="divdr">how it works</div>
        <div className="tip">
          Share your room code with your partner.<br/>
          Each person loads their own copy of the movie locally.<br/>
          Play · Pause · Seek stays in perfect sync — no upload needed.
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONTROLS BAR (reusable — rendered both inside
   vwrap for fullscreen AND below it for normal)
───────────────────────────────────────────── */
function ControlsBar({
  playing, curTime, duration, volume, muted, speed, showSub, fullscreen, hasFile, fileName,
  pct, vpct,
  onTogglePlay, onSeek, onSeekBy, onVolChange, onToggleMute,
  onSpeed, onToggleSub, onLoadSub, onRotate, onScreenshot, onToggleFs, onLoadMovie,
  onActivity,
}) {
  return (
    <>
      <div className="seek-row">
        <input type="range" className="seek"
          min={0} max={duration || 1} step={0.1} value={curTime}
          style={{ "--pct":`${pct}%` }}
          onMouseDown={onActivity}
          onChange={e => onSeek(parseFloat(e.target.value))} />
        <span className="tl">{fmt(curTime)} / {fmt(duration)}</span>
      </div>
      <div className="ctrl-row">
        {/* Left — volume */}
        <div className="ctrl-l">
          <div className="vol-wrap">
            <button className="ic-btn" onClick={onToggleMute} title={muted?"Unmute":"Mute"}>
              {muted || volume===0 ? I.VolMute : I.VolHi}
            </button>
            <input type="range" className="vol"
              min={0} max={1} step={0.01} value={muted ? 0 : volume}
              style={{ "--vpct":`${vpct}%` }}
              onMouseDown={onActivity}
              onChange={e => onVolChange(parseFloat(e.target.value))} />
          </div>
        </div>
        {/* Centre — playback */}
        <div className="ctrl-c">
          <button className="ic-btn" onClick={() => onSeekBy(-10)} title="-10s">{I.Bwd}</button>
          <button className="ic-btn" onClick={() => onSeekBy(-5)}  title="-5s" style={{fontSize:".6rem"}}>-5</button>
          <button className="ic-btn play-btn" onClick={onTogglePlay}>
            {playing ? I.Pause : I.Play}
          </button>
          <button className="ic-btn" onClick={() => onSeekBy(5)}   title="+5s" style={{fontSize:".6rem"}}>+5</button>
          <button className="ic-btn" onClick={() => onSeekBy(10)}  title="+10s">{I.Fwd}</button>
        </div>
        {/* Right — extras */}
        <div className="ctrl-r">
          <select className="spd" value={speed} onFocus={onActivity} onChange={e => onSpeed(parseFloat(e.target.value))} title="Playback speed">
            {[0.25,0.5,0.75,1,1.25,1.5,1.75,2].map(s =>
              <option key={s} value={s}>{s}×</option>)}
          </select>
          <button className={`ic-btn${showSub?" active":""}`} onClick={onToggleSub} title="Toggle subtitles">{I.Sub}</button>
          <button className="ic-btn" onClick={onLoadSub}     title="Load .srt subtitle file"
            style={{fontSize:".58rem",letterSpacing:"0",fontWeight:"bold"}}>CC+</button>
          <button className="ic-btn" onClick={onRotate}      title="Rotate video">{I.Rot}</button>
          <button className="ic-btn" onClick={onScreenshot}  title="Screenshot"
            style={{color:"var(--acc3)",borderColor:"rgba(244,114,182,.3)"}}>{I.SS}</button>
          <button className="ic-btn" onClick={onToggleFs}    title={fullscreen?"Exit fullscreen":"Fullscreen"}>
            {fullscreen ? I.FsExit : I.Fs}
          </button>
          <button className="ic-btn" onClick={onLoadMovie}   title="Load another movie">{I.Load}</button>
        </div>
      </div>
      {fileName && <div className="fname">🎞 {fileName}</div>}
    </>
  );
}

/* ─────────────────────────────────────────────
   CAM TILE
───────────────────────────────────────────── */
function CamTile({ stream, label, muted, micMuted, camOn }) {
  const vidRef = useRef(null);
  useEffect(() => {
    const vid = vidRef.current; if (!vid) return;
    if (camOn && stream) { vid.srcObject = stream; vid.play().catch(()=>{}); }
    else vid.srcObject = null;
  }, [camOn, stream]);
  return (
    <div className="cam-tile">
      <video ref={vidRef} autoPlay muted={muted} playsInline
        style={{ width:"100%",height:"100%",objectFit:"cover",display:camOn?"block":"none" }} />
      {!camOn && <div className="cam-ph"><span className="ph-ic">🙈</span><span>Camera off</span></div>}
      <div className="tile-lbl">{label}</div>
      {micMuted && <div className="tile-muted">🔇</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PIP TILE
───────────────────────────────────────────── */
function PipTile({ stream, label, muted, micMuted, camOn }) {
  const vidRef = useRef(null);
  useEffect(() => {
    const vid = vidRef.current; if (!vid) return;
    if (camOn && stream) { vid.srcObject = stream; vid.play().catch(()=>{}); }
    else vid.srcObject = null;
  }, [camOn, stream]);
  return (
    <div className="pip-tile">
      {camOn
        ? <video ref={vidRef} autoPlay muted={muted} playsInline />
        : <div className="pip-ph"><span className="pip-ph-ic">🙈</span><span>Cam off</span></div>}
      <div className="pip-lbl">{label}</div>
      {micMuted && <div className="pip-muted">🔇</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROOM
───────────────────────────────────────────── */
function Room({ session, onLeave }) {
  const { name, roomId } = session;

  const videoRef     = useRef(null);
  const localVidRef  = useRef(null); // master hidden ref (keeps stream alive)
  const fileInputRef = useRef(null);
  const subInputRef  = useRef(null);
  const chatEndRef   = useRef(null);
  const localStream  = useRef(null);
  const blobUrlRef   = useRef(null);
  const canvasRef    = useRef(document.createElement("canvas"));

  /* ── Load html2canvas from CDN once ── */
  useEffect(() => {
    if (window.html2canvas) return; // already loaded
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);
  const wrapRef      = useRef(null);  // ref to #vwrap div
  const hideTimer    = useRef(null);  // timer for auto-hiding fullscreen controls

  /* player */
  const [hasFile, setHasFile]     = useState(false);
  const [fileName, setFileName]   = useState("");
  const [playing, setPlaying]     = useState(false);
  const [curTime, setCurTime]     = useState(0);
  const [duration, setDuration]   = useState(0);
  const [volume, setVolume]       = useState(1);
  const [muted, setMuted]         = useState(false);
  const [speed, setSpeed]         = useState(1);
  const [rotation, setRotation]   = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [ctrlVisible, setCtrlVisible] = useState(true); // for auto-hide in fullscreen
  const [subtitles, setSubtitles] = useState([]);
  const [activeSub, setActiveSub] = useState("");
  const [showSub, setShowSub]     = useState(true);
  const [dragOver, setDragOver]   = useState(false);
  const [ssFlash, setSsFlash]     = useState(false);

  /* cam */
  const [camOn, setCamOn]   = useState(false);
  const [micOn, setMicOn]   = useState(true);

  /* screenshots */
  const [screenshots, setScreenshots] = useState([]);
  const [ssToast, setSsToast]         = useState(false);

  /* room */
  const [partner, setPartner] = useState(null);
  const [pOnline, setPOnline] = useState(false);
  const [msgs, setMsgs]       = useState([]);
  const [chatVal, setChatVal] = useState("");
  const [syncMsg, setSyncMsg] = useState("");
  const [copyMsg, setCopyMsg] = useState(false);
  const [tab, setTab]         = useState("cam");

  const ignoreRef = useRef(false);

  /* ── Sync ── */
  const emit = useChannel(roomId, ({ type, payload }) => {
    const v = videoRef.current;
    if (type==="hello") {
      setPartner(payload.name); setPOnline(true);
      addSys(`${payload.name} joined ✨`);
      emit("ack", { name });
      if (v && hasFile) emit("state", { time: v.currentTime, playing: !v.paused });
    }
    if (type==="ack")   { setPartner(payload.name); setPOnline(true); }
    if (type==="bye")   { setPOnline(false); addSys(`${payload.name||"Partner"} left`); }
    if (type==="play" && v) {
      ignoreRef.current = true;
      if (Math.abs(v.currentTime - payload.time) > 0.8) v.currentTime = payload.time;
      v.play().catch(()=>{}).finally(() => { ignoreRef.current = false; });
      setPlaying(true); toast("▶ Synced — play");
    }
    if (type==="pause" && v) {
      ignoreRef.current = true;
      if (Math.abs(v.currentTime - payload.time) > 0.8) v.currentTime = payload.time;
      v.pause(); setPlaying(false);
      ignoreRef.current = false; toast("⏸ Synced — pause");
    }
    if (type==="seek"  && v) { v.currentTime = payload.time; toast(`⏩ ${fmt(payload.time)}`); }
    if (type==="speed" && v) { v.playbackRate = payload.speed; setSpeed(payload.speed); }
    if (type==="chat")  { addMsg({ who:"them", name:payload.name, text:payload.text }); }
    if (type==="state" && v && hasFile) {
      if (Math.abs(v.currentTime - payload.time) > 1) v.currentTime = payload.time;
    }
  });

  useEffect(() => {
    emit("hello", { name });
    const t = setInterval(() => emit("ping", { name }), 8000);
    return () => { emit("bye", { name }); clearInterval(t); };
  }, []);

  /* video events */
  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    const onTime  = () => {
      setCurTime(v.currentTime);
      const s = subtitles.find(x => v.currentTime >= x.start && v.currentTime <= x.end);
      setActiveSub(s ? s.text : "");
    };
    const onMeta  = () => setDuration(v.duration || 0);
    const onPlay  = () => { if (!ignoreRef.current) setPlaying(true); };
    const onPause = () => { if (!ignoreRef.current) setPlaying(false); };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("durationchange", onMeta);
    v.addEventListener("play",  onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("durationchange", onMeta);
      v.removeEventListener("play",  onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [subtitles]);

  /* fullscreen tracking */
  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  /* auto-hide controls in fullscreen after 4s of no mouse movement */
  const revealControls = useCallback(() => {
    setCtrlVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (document.fullscreenElement) setCtrlVisible(false);
    }, 4000);
  }, []);

  /* Keep controls visible when mouse enters the control bar area */
  const keepVisible = useCallback(() => {
    setCtrlVisible(true);
    clearTimeout(hideTimer.current);
  }, []);

  useEffect(() => {
    if (!fullscreen) { setCtrlVisible(true); clearTimeout(hideTimer.current); return; }
    // Always show controls immediately on entering fullscreen
    setCtrlVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (document.fullscreenElement) setCtrlVisible(false);
    }, 4000);
    return () => clearTimeout(hideTimer.current);
  }, [fullscreen]);

  /* webcam stream → hidden master ref */
  useEffect(() => {
    const vid = localVidRef.current; if (!vid) return;
    if (camOn && localStream.current) {
      if (vid.srcObject !== localStream.current) {
        vid.srcObject = localStream.current;
        vid.play().catch(() => {});
      }
    } else if (!camOn) vid.srcObject = null;
  }, [camOn]);

  /* chat scroll */
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const addSys = (text) => setMsgs(p => [...p, { id:Date.now()+Math.random(), type:"sys", text }]);
  const addMsg = (m)    => setMsgs(p => [...p, { id:Date.now()+Math.random(), ...m }]);
  const toast  = (msg)  => { setSyncMsg(msg); setTimeout(()=>setSyncMsg(""), 2600); };

  /* ── Load movie ── */
  const loadMovie = useCallback((file) => {
    if (!file) return;
    const isVideo = file.type.startsWith("video/") ||
      /\.(mp4|mkv|webm|avi|mov|m4v|ogv|3gp|ts|flv|wmv)$/i.test(file.name);
    if (!isVideo) { alert("Please select a video file."); return; }
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;
    const v = videoRef.current;
    if (v) { v.pause(); v.removeAttribute("src"); v.load(); v.src = url; v.load(); }
    setFileName(file.name); setHasFile(true); setPlaying(false);
    setCurTime(0); setDuration(0); setActiveSub("");
    addSys(`Loaded: ${file.name}`);
  }, []);

  const loadSub = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = (e) => { setSubtitles(parseSRT(e.target.result)); addSys("Subtitles loaded"); };
    r.readAsText(file);
  };

  /* ── Playback ── */
  const togglePlay = useCallback(() => {
    const v = videoRef.current; if (!v || !hasFile) return;
    if (v.paused) {
      v.play().then(() => {
        setPlaying(true);
        if (!ignoreRef.current) emit("play", { time: v.currentTime });
      }).catch(e => console.warn(e));
    } else {
      v.pause(); setPlaying(false);
      if (!ignoreRef.current) emit("pause", { time: v.currentTime });
    }
  }, [hasFile, emit]);

  const seekTo = useCallback((t) => {
    const v = videoRef.current; if (!v) return;
    const clamped = Math.max(0, Math.min(v.duration||0, t));
    v.currentTime = clamped; setCurTime(clamped); emit("seek", { time: clamped });
  }, [emit]);

  const seekBy = useCallback((delta) => {
    const v = videoRef.current; if (!v || !hasFile) return;
    seekTo(v.currentTime + delta);
  }, [hasFile, seekTo]);

  const onVolChange = useCallback((val) => {
    const v = videoRef.current;
    if (v) { v.volume = val; v.muted = val===0; }
    setVolume(val); setMuted(val===0);
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current; if (!v) return;
    v.muted = !muted; setMuted(!muted);
  }, [muted]);

  const changeSpeed = useCallback((s) => {
    const v = videoRef.current; if (!v) return;
    v.playbackRate = s; setSpeed(s); emit("speed", { speed: s });
  }, [emit]);

  const toggleFs = useCallback(() => {
    const el = wrapRef.current;
    if (!document.fullscreenElement) el?.requestFullscreen?.().catch(()=>{});
    else document.exitFullscreen?.().catch(()=>{});
  }, []);

  /* ── Screenshot — captures the full visible page via html2canvas ── */
  const takeScreenshot = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !hasFile || v.readyState < 2) {
      alert("Load a movie first, then take a screenshot.");
      return;
    }
    const time = v.currentTime;

    /* Flash feedback immediately */
    setSsFlash(true);
    setTimeout(() => setSsFlash(false), 350);

    try {
      if (!window.html2canvas) {
        /* html2canvas not yet loaded — wait up to 5s */
        await new Promise((resolve, reject) => {
          let tries = 0;
          const check = setInterval(() => {
            if (window.html2canvas) { clearInterval(check); resolve(); }
            if (++tries > 50) { clearInterval(check); reject(new Error("html2canvas not loaded")); }
          }, 100);
        });
      }

      /* Capture the full page document */
      const canvas = await window.html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#07090f",
        scale: window.devicePixelRatio || 1,
        logging: false,
        /* html2canvas can't read cross-origin video frames directly;
           we composite the video frame ourselves into the captured image */
        onclone: (clonedDoc) => {
          /* Paint the current video frame into every <video> element in the clone */
          const videos = clonedDoc.querySelectorAll("video.main-vid");
          videos.forEach(clonedVid => {
            const c = clonedDoc.createElement("canvas");
            c.width  = v.videoWidth  || clonedVid.clientWidth  || 1280;
            c.height = v.videoHeight || clonedVid.clientHeight || 720;
            c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
            c.style.cssText = clonedVid.style.cssText;
            c.style.width   = "100%";
            c.style.height  = "100%";
            c.style.objectFit = "contain";
            c.style.position = "absolute";
            c.style.inset = "0";
            clonedVid.parentNode?.replaceChild(c, clonedVid);
          });
        },
      });

      const dataUrl = canvas.toDataURL("image/png");
      setScreenshots(prev => [{ id: Date.now(), dataUrl, time }, ...prev].slice(0, 20));
      setSsToast(true);
      setTimeout(() => setSsToast(false), 2200);
    } catch (err) {
      console.warn("html2canvas failed, falling back to video-frame capture:", err);
      /* Fallback: capture only the video frame */
      const canvas = canvasRef.current;
      canvas.width  = v.videoWidth  || 1280;
      canvas.height = v.videoHeight || 720;
      canvas.getContext("2d").drawImage(v, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/png");
      setScreenshots(prev => [{ id: Date.now(), dataUrl, time }, ...prev].slice(0, 20));
      setSsToast(true);
      setTimeout(() => setSsToast(false), 2200);
    }
  }, [hasFile]);

  const dlScreenshot = (ss) => {
    const a = document.createElement("a");
    a.href = ss.dataUrl;
    a.download = `screenshot_${fmt(ss.time).replace(/:/g,"-")}.png`;
    a.click();
  };

  /* ── Webcam ── */
  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
      localStream.current = stream;
      const vid = localVidRef.current;
      if (vid) { vid.srcObject = stream; vid.play().catch(()=>{}); }
      setCamOn(true);
    } catch(err) {
      alert(
        err?.name==="NotAllowedError" ? "Camera permission denied." :
        err?.name==="NotFoundError"   ? "No camera found." :
        "Camera error: " + (err.message||err)
      );
    }
  };
  const stopCam = () => {
    localStream.current?.getTracks().forEach(t => t.stop());
    localStream.current = null;
    const vid = localVidRef.current;
    if (vid) { vid.srcObject = null; vid.load(); }
    setCamOn(false);
  };
  const toggleMic = () => {
    const next = !micOn;
    localStream.current?.getAudioTracks().forEach(t => { t.enabled = next; });
    setMicOn(next);
  };

  /* ── Chat ── */
  const sendChat = () => {
    const text = chatVal.trim(); if (!text) return;
    emit("chat", { name, text });
    addMsg({ who:"me", name, text });
    setChatVal("");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomId).catch(()=>{});
    setCopyMsg(true); setTimeout(()=>setCopyMsg(false), 2000);
  };

  /* computed */
  const pct    = duration ? (curTime/duration)*100 : 0;
  const vpct   = muted ? 0 : volume*100;
  const rotCls = ["","rot90","rot180","rot270"][rotation/90] || "";

  /* shared props for ControlsBar */
  const ctrlProps = {
    playing, curTime, duration, volume, muted, speed, showSub, fullscreen, hasFile, fileName,
    pct, vpct,
    onTogglePlay : togglePlay,
    onSeek       : (t) => { keepVisible(); seekTo(t); },
    onSeekBy     : seekBy,
    onVolChange,
    onToggleMute : toggleMute,
    onSpeed      : changeSpeed,
    onToggleSub  : () => setShowSub(x=>!x),
    onLoadSub    : () => subInputRef.current?.click(),
    onRotate     : () => setRotation(r=>(r+90)%360),
    onScreenshot : takeScreenshot,
    onToggleFs   : toggleFs,
    onLoadMovie  : () => fileInputRef.current?.click(),
    onActivity   : keepVisible,
  };

  return (
    <div className="room">
      <style>{STYLES}</style>

      {/* Master hidden webcam element — never unmounts */}
      <video ref={localVidRef} autoPlay muted playsInline style={{ display:"none" }} />

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="video/*,.mkv,.avi,.mov,.m4v,.ogv,.3gp"
        style={{ display:"none" }} onChange={e => { loadMovie(e.target.files?.[0]); e.target.value=""; }} />
      <input ref={subInputRef} type="file" accept=".srt,.vtt"
        style={{ display:"none" }} onChange={e => { loadSub(e.target.files?.[0]); e.target.value=""; }} />

      {/* Header */}
      <header className="hdr">
        <div className="hdr-logo">🎬 Together Watch</div>
        <div className="hdr-mid">
          <div className="room-code" onClick={copyCode} title="Click to copy">
            {I.Link} {roomId} {I.Copy}
          </div>
          {pOnline
            ? <span className="badge badge-ok"><span className="dot dot-ok"/>{partner}</span>
            : <span className="badge badge-warn"><span className="dot dot-warn"/>Waiting for partner</span>}
        </div>
        <div className="hdr-right">
          <button className="btn btn-o btn-sm" onClick={copyCode}>{I.Link} Share Code</button>
          <button className="btn btn-d btn-sm" onClick={onLeave}>Leave</button>
        </div>
      </header>

      <div className="main">

        {/* Player column */}
        <div className="pcol">

          {/* Drop zone */}
          {!hasFile && (
            <div className={`dropzone${dragOver?" over":""}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); loadMovie(e.dataTransfer.files[0]); }}
              onClick={() => fileInputRef.current?.click()}>
              <div className="dz-icon">🎬</div>
              <div className="dz-title">Drop your movie here</div>
              <div className="dz-sub">or click to browse — MP4, MKV, WebM, AVI, MOV, M4V and more</div>
              <button className="btn btn-o btn-sm dz-btn"
                onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                {I.Load} Browse Files
              </button>
            </div>
          )}

          {/*
            ══════════════════════════════════════════════════════
            VIDEO WRAPPER — everything inside stays in fullscreen
            ══════════════════════════════════════════════════════
          */}
          <div
            ref={wrapRef}
            id="vwrap"
            className={[
              "vwrap",
              rotCls,
              fullscreen ? "is-fs" : "",
              ctrlVisible ? "ctrl-visible" : "",
            ].filter(Boolean).join(" ")}
            style={{ display: hasFile ? "flex" : "none" }}
            onMouseMove={fullscreen ? revealControls : undefined}
            onTouchStart={fullscreen ? revealControls : undefined}
            onClick={fullscreen ? revealControls : undefined}
          >
            {/* The movie */}
            <video
              ref={videoRef}
              className="main-vid"
              onClick={e => { e.stopPropagation(); togglePlay(); }}
              playsInline
            />

            {/* Screenshot white-flash */}
            {ssFlash && <div className="ss-flash" />}

            {/* Subtitles */}
            {showSub && activeSub && <div className="sub-overlay">{activeSub}</div>}

            {/* PiP overlays (top-right, shown in fullscreen) */}
            <div className={`pip-wrap${fullscreen?" show":""}`}>
              <PipTile
                stream={localStream.current}
                label={`${name} (you)`}
                muted={true}
                micMuted={!micOn}
                camOn={camOn}
              />
              <div className="pip-tile">
                {pOnline
                  ? <div className="pip-ph"><span className="pip-ph-ic">🎭</span><span>{partner}</span></div>
                  : <div className="pip-ph"><span className="pip-ph-ic">⏳</span><span>Waiting</span></div>}
                {pOnline && <div className="pip-lbl">{partner}</div>}
              </div>
            </div>

            {/*
              ── FULLSCREEN CONTROLS OVERLAY ──
              Lives inside #vwrap so it's in fullscreen scope.
              Auto-hides after 3 s of no mouse movement (ctrl-visible class).
              In normal mode, ctrl-visible is always true so it shows as the
              regular bottom bar (transparent gradient blends naturally over video).
            */}
            <div className="fs-ctrl-wrap"
              onMouseEnter={keepVisible}
              onMouseLeave={fullscreen ? revealControls : undefined}
              onTouchStart={e => { e.stopPropagation(); keepVisible(); }}>
              <ControlsBar {...ctrlProps} />
            </div>
          </div>

          {/*
            ── OUTER CONTROLS BAR ──
            Shown only in normal (non-fullscreen) mode.
            In fullscreen the :fullscreen CSS selector hides it.
            This gives a solid dark background bar below the video
            in normal mode, matching the original design.
          */}
          {hasFile && !fullscreen && (
            <div className="ctrl-bar-outer">
              <ControlsBar {...ctrlProps} />
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="side">
          <div className="stabs">
            <button className={`stab${tab==="cam"?" on":""}`} onClick={() => setTab("cam")}>📹 Cams</button>
            <button className={`stab${tab==="chat"?" on":""}`} onClick={() => setTab("chat")}>💬 Chat</button>
          </div>

          {tab === "cam" && (
            <div className="cam-panel">
              <div className="cam-grid">
                <CamTile stream={localStream.current} label={`${name} (you)`}
                  muted={true} micMuted={!micOn} camOn={camOn} />
                <div className="cam-tile">
                  <div className="cam-ph">
                    <span className="ph-ic">{pOnline?"🎭":"⏳"}</span>
                    <span>{pOnline ? partner : "Waiting…"}</span>
                    {pOnline && <span style={{fontSize:".6rem",color:"var(--muted)"}}>
                      Cross-device video needs WebRTC signalling
                    </span>}
                  </div>
                  {pOnline && <div className="tile-lbl">{partner}</div>}
                </div>
              </div>

              <div className="cam-ctrls">
                <button className={`btn btn-sm ${camOn?"btn-d":"btn-o"}`}
                  style={{flex:1}} onClick={camOn ? stopCam : startCam}>
                  {camOn ? <>{I.CamOff} Stop Camera</> : <>{I.Cam} Start Camera</>}
                </button>
                <button className={`ic-btn${!micOn?" active":""}`} onClick={toggleMic} title="Toggle mic">
                  {micOn ? I.Mic : I.MicOff}
                </button>
                <button className="ic-btn" onClick={takeScreenshot}
                  title="Screenshot current video frame"
                  style={{color:"var(--acc3)",borderColor:"rgba(244,114,182,.25)"}}>
                  {I.SS}
                </button>
              </div>

              <div className="info-box">
                <div className="info-lbl">Room status</div>
                <div className="info-row">
                  <span className={`dot ${pOnline?"dot-ok":"dot-warn"}`}/>
                  {pOnline ? "Partner connected" : "No partner yet"}
                </div>
                <div className="info-row">Code: <span className="info-code">{roomId}</span></div>
                <button className="btn btn-o btn-sm" style={{marginTop:".3rem"}} onClick={copyCode}>
                  {I.Link} Copy code
                </button>
              </div>

              {/* Screenshots */}
              <div className="ss-section">
                <div className="ss-head">
                  <span className="info-lbl" style={{margin:0}}>📸 Screenshots ({screenshots.length})</span>
                  {screenshots.length > 0 && (
                    <button className="btn btn-o btn-sm"
                      style={{fontSize:".6rem",padding:".18rem .5rem"}}
                      onClick={() => setScreenshots([])}>Clear all</button>
                  )}
                </div>
                {screenshots.length === 0
                  ? <div className="ss-empty">No screenshots yet — click 📸 during playback</div>
                  : (
                    <div className="ss-grid">
                      {screenshots.map(ss => (
                        <div className="ss-thumb" key={ss.id}>
                          <img src={ss.dataUrl} alt="" />
                          <div className="ss-time">{fmt(ss.time)}</div>
                          <div className="ss-actions">
                            <button className="ic-btn" style={{width:28,height:28}}
                              onClick={() => dlScreenshot(ss)} title="Download">{I.Dl}</button>
                            <button className="ic-btn" style={{width:28,height:28,color:"var(--err)"}}
                              onClick={() => setScreenshots(p=>p.filter(s=>s.id!==ss.id))}
                              title="Delete">{I.Trash}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            </div>
          )}

          {tab === "chat" && (
            <div className="chat-panel">
              <div className="msgs">
                {msgs.length===0 && <div className="sys-msg">No messages yet. Say hi! 👋</div>}
                {msgs.map(m =>
                  m.type==="sys"
                    ? <div key={m.id} className="sys-msg">{m.text}</div>
                    : <div key={m.id} className={`msg ${m.who}`}>
                        <div className="msg-who">{m.name}</div>
                        <div className="bubble">{m.text}</div>
                      </div>
                )}
                <div ref={chatEndRef}/>
              </div>
              <div className="chat-inp-row">
                <textarea className="chat-inp" rows={1} placeholder="Send a message…"
                  value={chatVal}
                  onChange={e => setChatVal(e.target.value)}
                  onKeyDown={e => { if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); sendChat(); } }}/>
                <button className="ic-btn"
                  style={{background:"linear-gradient(135deg,var(--acc),var(--acc2))",border:"none",color:"#fff"}}
                  onClick={sendChat}>{I.Send}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toasts */}
      {syncMsg && <div className="toast toast-sync">{I.Sync} {syncMsg}</div>}
      {copyMsg && <div className="toast toast-copy">{I.Copy} Code copied!</div>}
      {ssToast && <div className="toast toast-ss">{I.SS} Screenshot saved!</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */
export default function App() {
  const [session, setSession] = useState(null);
  return (
    <>
      <style>{STYLES}</style>
      {session
        ? <Room session={session} onLeave={() => setSession(null)} />
        : <Landing onEnter={setSession} />}
    </>
  );
}