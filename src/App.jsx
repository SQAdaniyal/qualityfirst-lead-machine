import { useState } from "react";

const T = {
  bg: '#07080e', surface: '#0d0f18', card: '#111420', border: '#1a1f2e',
  accent: '#00d87a', accentBg: 'rgba(0,216,122,0.08)',
  blue: '#4a80f5', blueBg: 'rgba(74,128,245,0.08)',
  text: '#dce3f0', sub: '#4e5a74', warn: '#f0a020', danger: '#f04050',
  mono: "'Consolas','Courier New',monospace",
};

const SM = {
  'Not Contacted':     { c: '#4e5a74', bg: 'rgba(26,31,46,0.6)' },
  'Email Sent':        { c: '#60a5fa', bg: 'rgba(25,55,95,0.4)' },
  'LinkedIn Connected':{ c: '#a78bfa', bg: 'rgba(45,25,95,0.4)' },
  'Replied':           { c: '#34d399', bg: 'rgba(12,58,44,0.5)' },
  'Call Scheduled':    { c: '#fbbf24', bg: 'rgba(60,45,10,0.5)' },
  'Proposal Sent':     { c: '#f472b6', bg: 'rgba(60,12,44,0.5)' },
  'Closed Won':        { c: '#00d87a', bg: 'rgba(8,44,24,0.7)' },
  'Closed Lost':       { c: '#f04050', bg: 'rgba(44,8,14,0.5)' },
};
const STATUSES = Object.keys(SM);

const LEADS_DATA = [
  { id:1, company:'Swif.ai', contact:'Angelo Huang', title:'Founder & CEO', email:'angelo@swif.ai', linkedin:'https://linkedin.com/company/swifai', industry:'MDM / Security SaaS', employees:'31', funding:'YC W20 | $4.7M ARR', location:'Sunnyvale, CA, USA', signal:'Actively hiring QA Engineer — prime outsource candidate', status:'Not Contacted', score:95 },
  { id:2, company:'Alaan', contact:'Parthasarathi Mandayam', title:'Co-Founder & CEO', email:'[verify: hunter.io]', linkedin:'https://linkedin.com/company/alaancard', industry:'Fintech / Expense Management', employees:'50-100', funding:'YC | Series A', location:'Dubai, UAE', signal:'Hiring QA Analyst urgently — fast-growing Middle East fintech', status:'Not Contacted', score:88 },
  { id:3, company:'LunaJoy Health', contact:'Nandini Tandon', title:'Co-Founder & CEO', email:'[verify: hunter.io]', linkedin:'https://linkedin.com/company/lunajoy-health', industry:'Mental Health SaaS', employees:'25', funding:'YC | Seed Stage', location:'San Francisco, CA', signal:'Hiring Senior QA Tester — healthcare compliance is critical', status:'Not Contacted', score:82 },
  { id:4, company:'Instawork', contact:'Sumir Meghani', title:'Co-Founder & CEO', email:'[verify: hunter.io]', linkedin:'https://linkedin.com/company/instawork', industry:'Labor Marketplace', employees:'200+', funding:'YC | Series C | $60M+', location:'San Francisco, CA', signal:'Hiring QA Lead — scaling fast, sprint testing bottleneck', status:'Not Contacted', score:79 },
  { id:5, company:'Optery', contact:'Eric Datres', title:'Founder & CEO', email:'[verify: hunter.io]', linkedin:'https://linkedin.com/company/optery', industry:'Data Privacy SaaS', employees:'30', funding:'YC | 3x Revenue YoY', location:'Remote / USA', signal:'3x revenue growth = 3x bug risk — perfect QA pitch moment', status:'Not Contacted', score:75 },
];

const DAILY = [
  { id:'d1', time:'8:00–8:20', task:'Find 10 new leads', where:'workatastartup.com → search "QA"', mins:20 },
  { id:'d2', time:'8:20–8:40', task:'Generate & send 10 cold emails', where:'Use AI Generator tab', mins:20 },
  { id:'d3', time:'8:40–8:55', task:'Send 5 LinkedIn requests', where:'Boolean search: CTO + SaaS + Series A', mins:15 },
  { id:'d4', time:'8:55–9:00', task:'Follow up 3-day-old leads', where:'Check Pipeline tab', mins:5 },
  { id:'d5', time:'Evening', task:'Add fresh leads to tracker', where:'Product Hunt / Crunchbase new launches', mins:10 },
];

const SOURCES = [
  { name:'workatastartup.com', url:'https://workatastartup.com', desc:'YC job board. Search "QA" — every job post is a warm lead who already has budget.', color:T.accent },
  { name:'apollo.io', url:'https://apollo.io', desc:'50 verified leads/month free. Filter: Industry=SaaS, Title=CTO or Founder, Size=10-100.', color:T.blue },
  { name:'hunter.io', url:'https://hunter.io', desc:'25 free email lookups/month. Use to verify founder emails before sending.', color:T.warn },
  { name:'producthunt.com', url:'https://producthunt.com', desc:'New products launch daily. Every product that launched this week needs QA.', color:T.danger },
];

const PROJECTIONS = [
  { label:'1 Starter client', rev:'$350 profit', when:'Week 2–3' },
  { label:'2 Growth clients', rev:'$1,700/mo', when:'Month 1' },
  { label:'1 Retainer + 2 Growth', rev:'$4,400/mo', when:'Month 2' },
  { label:'Full capacity', rev:'$8,000+/mo', when:'Month 3' },
];

const emptyLead = { company:'', contact:'', title:'', email:'', linkedin:'', industry:'', location:'', signal:'' };
const btn = (extra={}) => ({ cursor:'pointer', fontFamily:T.mono, fontWeight:700, letterSpacing:1, border:'none', borderRadius:4, transition:'opacity 0.15s', ...extra });

export default function App() {
  const [tab, setTab] = useState('leads');
  const [leads, setLeads] = useState(LEADS_DATA);
  const [sel, setSel] = useState(null);
  const [msgType, setMsgType] = useState('email');
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [checks, setChecks] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('All');
  const [newL, setNewL] = useState(emptyLead);
  const [apiKey, setApiKey] = useState(localStorage.getItem('qf_gemini_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('qf_gemini_key', key);
    setShowKeyInput(false);
  };

  const updateStatus = (id, s) => setLeads(p => p.map(l => l.id === id ? {...l, status:s} : l));

  const addLead = () => {
    if (!newL.company || !newL.contact) return;
    setLeads(p => [...p, {...newL, id:Date.now(), status:'Not Contacted', score:70, funding:'', employees:''}]);
    setNewL(emptyLead);
    setShowAdd(false);
  };

  const generate = async () => {
    if (!sel || loading) return;
    setLoading(true);
    setGenerated(null);
    const sys = `You are an expert B2B sales copywriter for "QualityFirst Agency" — a QA outsourcing agency from Pakistan.
Value prop: Sprint-based manual QA testing for SaaS startups. 60–70% cheaper than a full-time hire. Bug reports in 5–7 days.
COLD EMAIL: subject=6–8 words specific to their product, body=4–5 short sentences MAX, reference their exact signal, single CTA: 15-min call. Never start with "I hope this email". Peer tone, not salesy.
LINKEDIN: under 200 characters, reference company, soft ask only.
Return ONLY valid JSON: {"subject":"...","body":"...","cta":"..."} — for LinkedIn use "opening" instead of "subject".`;
    const usr = `Write a ${msgType==='email'?'cold email':'LinkedIn message'} for:
Company: ${sel.company}
Contact: ${sel.contact} (${sel.title})
Industry: ${sel.industry}
Stage: ${sel.funding}
Location: ${sel.location}
Why they need QA NOW: ${sel.signal}
Be hyper-specific. Return ONLY valid JSON.`;
    try {
      const res = await fetch('/api/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ system: sys, user: usr, apiKey }),
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      const txt = d.content?.find(c=>c.type==='text')?.text || '';
      setGenerated(JSON.parse(txt.replace(/```json|```/g,'').trim()));
    } catch (e) {
      setGenerated({subject:'Error', body: e.message || 'Generation failed. Make sure your API key is set correctly.', cta:''});
    }
    setLoading(false);
  };

  const copy = (text, key) => {
    try { navigator.clipboard.writeText(text); } catch {}
    setCopied(key);
    setTimeout(()=>setCopied(''), 2200);
  };

  const filteredLeads = filter==='All' ? leads : leads.filter(l=>l.status===filter);
  const stats = {
    total: leads.length,
    active: leads.filter(l=>!['Not Contacted','Closed Lost'].includes(l.status)).length,
    replied: leads.filter(l=>['Replied','Call Scheduled','Proposal Sent','Closed Won'].includes(l.status)).length,
    won: leads.filter(l=>l.status==='Closed Won').length,
  };
  const checkedN = Object.values(checks).filter(Boolean).length;
  const pipeline = {};
  STATUSES.forEach(s => { pipeline[s] = leads.filter(l=>l.status===s); });
  const inp = { width:'100%', background:T.surface, border:`1px solid ${T.border}`, color:T.text, padding:'7px 9px', borderRadius:4, fontFamily:T.mono, fontSize:12 };

  return (
    <div style={{background:T.bg, color:T.text, minHeight:'100vh', fontFamily:T.mono, fontSize:13}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:${T.surface}}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}
        .lr:hover{background:${T.surface}!important}
        .hb:hover{opacity:0.8!important}
        .tb:hover{color:${T.text}!important}
        select option{background:${T.card};color:${T.text}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.35}}
      `}</style>

      {/* HEADER */}
      <div style={{background:T.surface, borderBottom:`1px solid ${T.border}`, padding:'13px 22px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div style={{width:8, height:8, borderRadius:'50%', background:T.accent, boxShadow:`0 0 10px ${T.accent}`}} />
          <span style={{color:T.accent, fontWeight:700, fontSize:15, letterSpacing:3}}>QUALITYFIRST</span>
          <span style={{color:T.sub, fontSize:10, letterSpacing:1.5}}>/ AI LEAD MACHINE</span>
        </div>
        <div style={{display:'flex', gap:20, alignItems:'center'}}>
          {[['TOTAL',stats.total,false],['ACTIVE',stats.active,false],['REPLIED',stats.replied,false],['WON $',stats.won,true]].map(([lbl,val,ac])=>(
            <div key={lbl} style={{textAlign:'center'}}>
              <div style={{fontSize:20, fontWeight:700, color:ac?T.accent:T.text, lineHeight:1}}>{val}</div>
              <div style={{fontSize:9, color:T.sub, letterSpacing:2, marginTop:2}}>{lbl}</div>
            </div>
          ))}
          <button className="hb" onClick={()=>setShowKeyInput(!showKeyInput)}
            style={{...btn(), background:apiKey?T.accentBg:T.card, border:`1px solid ${apiKey?T.accent:T.border}`, color:apiKey?T.accent:T.sub, padding:'5px 12px', fontSize:10}}>
            {apiKey ? 'API KEY SET' : 'SET API KEY'}
          </button>
        </div>
      </div>

      {/* API KEY MODAL */}
      {showKeyInput && (
        <div style={{background:T.surface, borderBottom:`1px solid ${T.border}`, padding:'12px 22px', display:'flex', gap:10, alignItems:'center'}}>
          <span style={{fontSize:10, color:T.sub, fontWeight:700, letterSpacing:1, flexShrink:0}}>GEMINI API KEY (FREE):</span>
          <input type="password" defaultValue={apiKey} id="apiKeyInp" placeholder="AIza..." style={{...inp, flex:1, maxWidth:400}} />
          <button className="hb" onClick={()=>saveApiKey(document.getElementById('apiKeyInp').value)}
            style={{...btn(), background:T.accentBg, border:`1px solid ${T.accent}`, color:T.accent, padding:'7px 14px', fontSize:11}}>SAVE</button>
          <span style={{fontSize:10, color:T.sub}}>Free key from aistudio.google.com — stored locally only.</span>
        </div>
      )}

      {/* TABS */}
      <div style={{borderBottom:`1px solid ${T.border}`, display:'flex', padding:'0 22px', background:T.surface}}>
        {[['leads','01  LEADS'],['generator','02  AI GENERATOR'],['pipeline','03  PIPELINE'],['daily','04  DAILY PLAN']].map(([id,lbl])=>(
          <button key={id} className="tb"
            onClick={()=>setTab(id)}
            style={{...btn(), background:'none', border:'none', borderBottom:tab===id?`2px solid ${T.accent}`:'2px solid transparent', color:tab===id?T.accent:T.sub, padding:'12px 18px', fontSize:11, marginBottom:-1}}>
            {lbl}
          </button>
        ))}
      </div>

      <div style={{padding:22}}>

        {/* LEADS TAB */}
        {tab==='leads' && (
          <div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:13, gap:8, flexWrap:'wrap'}}>
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                {['All','Not Contacted','Email Sent','Replied','Call Scheduled','Closed Won'].map(f=>(
                  <button key={f} className="hb" onClick={()=>setFilter(f)}
                    style={{...btn(), background:filter===f?T.accentBg:T.card, border:`1px solid ${filter===f?T.accent:T.border}`, color:filter===f?T.accent:T.sub, padding:'4px 11px', fontSize:10}}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
              <button className="hb" onClick={()=>setShowAdd(!showAdd)}
                style={{...btn(), background:T.accentBg, border:`1px solid ${T.accent}`, color:T.accent, padding:'4px 14px', fontSize:11}}>
                + ADD LEAD
              </button>
            </div>

            {showAdd && (
              <div style={{background:T.card, border:`1px solid ${T.accent}`, borderRadius:8, padding:18, marginBottom:14}}>
                <div style={{fontSize:10, color:T.accent, fontWeight:700, letterSpacing:1.5, marginBottom:13}}>NEW LEAD</div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10}}>
                  {[['Company *','company'],['Contact *','contact'],['Title','title'],['Email','email'],['LinkedIn URL','linkedin'],['Industry','industry'],['Location','location']].map(([lbl,key])=>(
                    <div key={key}>
                      <div style={{fontSize:9,color:T.sub,marginBottom:4,letterSpacing:1}}>{lbl}</div>
                      <input value={newL[key]} onChange={e=>setNewL(p=>({...p,[key]:e.target.value}))} style={inp} />
                    </div>
                  ))}
                  <div style={{gridColumn:'span 3'}}>
                    <div style={{fontSize:9,color:T.sub,marginBottom:4,letterSpacing:1}}>SIGNAL — why they need QA right now</div>
                    <input value={newL.signal} onChange={e=>setNewL(p=>({...p,signal:e.target.value}))} style={inp} />
                  </div>
                </div>
                <div style={{display:'flex', gap:8, marginTop:13}}>
                  <button className="hb" onClick={addLead} style={{...btn(), background:T.accent, color:'#000', padding:'8px 20px', fontSize:12}}>SAVE LEAD</button>
                  <button className="hb" onClick={()=>setShowAdd(false)} style={{...btn(), background:T.surface, border:`1px solid ${T.border}`, color:T.sub, padding:'8px 16px', fontSize:12}}>CANCEL</button>
                </div>
              </div>
            )}

            <div style={{overflowX:'auto'}}>
              <div style={{minWidth:860, background:T.card, border:`1px solid ${T.border}`, borderRadius:8, overflow:'hidden'}}>
                <div style={{display:'grid', gridTemplateColumns:'22px 175px 120px 95px 1fr 130px 148px 115px', padding:'9px 14px', background:T.surface, borderBottom:`1px solid ${T.border}`, gap:10}}>
                  {['#','COMPANY / CONTACT','INDUSTRY','LOCATION','WHY NOW','FUNDING','STATUS','ACTIONS'].map(h=>(
                    <div key={h} style={{fontSize:9,color:T.sub,fontWeight:700,letterSpacing:1.5}}>{h}</div>
                  ))}
                </div>
                {filteredLeads.map((lead,i)=>(
                  <div key={lead.id} className="lr"
                    style={{display:'grid', gridTemplateColumns:'22px 175px 120px 95px 1fr 130px 148px 115px', padding:'13px 14px', borderBottom:`1px solid ${T.border}`, gap:10, transition:'background 0.15s', alignItems:'start', background:'transparent'}}>
                    <div style={{color:T.sub,fontSize:10,paddingTop:2}}>{String(i+1).padStart(2,'0')}</div>
                    <div>
                      <div style={{fontWeight:700,color:T.text,fontSize:13}}>{lead.company}</div>
                      <div style={{fontSize:11,color:T.sub,marginTop:2}}>{lead.contact}</div>
                      <div style={{fontSize:10,color:T.sub}}>{lead.title}</div>
                      <div style={{fontSize:9,color:T.accent,fontWeight:700,letterSpacing:1,marginTop:5}}>SCORE {lead.score}</div>
                    </div>
                    <div style={{fontSize:11,color:T.text,paddingTop:2}}>{lead.industry}</div>
                    <div style={{fontSize:11,color:T.sub,paddingTop:2}}>{lead.location}</div>
                    <div style={{fontSize:11,color:T.warn,paddingTop:2,lineHeight:1.5}}>{lead.signal}</div>
                    <div style={{fontSize:10,color:T.sub,paddingTop:2,lineHeight:1.5}}>{lead.funding}</div>
                    <div>
                      <select value={lead.status} onChange={e=>updateStatus(lead.id,e.target.value)}
                        style={{width:'100%', background:SM[lead.status].bg, border:`1px solid ${SM[lead.status].c}`, color:SM[lead.status].c, padding:'5px 5px', borderRadius:4, fontSize:10, fontFamily:T.mono, fontWeight:700, cursor:'pointer'}}>
                        {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:5}}>
                      <button className="hb" onClick={()=>{setSel(lead);setTab('generator');setGenerated(null);}}
                        style={{...btn(), background:T.accentBg, border:`1px solid ${T.accent}`, color:T.accent, padding:'5px 7px', fontSize:10}}>GENERATE</button>
                      <a href={lead.linkedin} target="_blank" rel="noreferrer"
                        style={{...btn(), background:T.blueBg, border:`1px solid ${T.blue}`, color:T.blue, padding:'5px 7px', fontSize:10, textDecoration:'none', textAlign:'center', display:'block'}}>LINKEDIN</a>
                    </div>
                  </div>
                ))}
                {filteredLeads.length===0 && <div style={{padding:40,textAlign:'center',color:T.sub}}>No leads match this filter.</div>}
              </div>
            </div>
          </div>
        )}

        {/* GENERATOR TAB */}
        {tab==='generator' && (
          <div style={{display:'grid', gridTemplateColumns:'300px 1fr', gap:20}}>
            <div>
              <div style={{fontSize:9,color:T.sub,fontWeight:700,letterSpacing:2,marginBottom:12}}>SELECT TARGET LEAD</div>
              {leads.map(lead=>(
                <div key={lead.id} onClick={()=>{setSel(lead);setGenerated(null);}}
                  style={{background:sel?.id===lead.id?T.accentBg:T.card, border:`1px solid ${sel?.id===lead.id?T.accent:T.border}`, borderRadius:8, padding:'11px 13px', cursor:'pointer', marginBottom:8, transition:'all 0.15s'}}>
                  <div style={{display:'flex', justifyContent:'space-between'}}>
                    <span style={{fontWeight:700, color:sel?.id===lead.id?T.accent:T.text, fontSize:13}}>{lead.company}</span>
                    <span style={{fontSize:10,color:T.accent,fontWeight:700}}>{lead.score}</span>
                  </div>
                  <div style={{fontSize:11,color:T.sub,marginTop:3}}>{lead.contact} · {lead.title}</div>
                  <div style={{fontSize:10,color:T.warn,marginTop:6,lineHeight:1.4}}>{lead.signal}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:9,color:T.sub,fontWeight:700,letterSpacing:2,marginBottom:12}}>AI OUTREACH GENERATOR</div>
              {!sel ? (
                <div style={{background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:60, textAlign:'center', color:T.sub, fontSize:14}}>← Select a lead to begin</div>
              ) : (
                <div style={{background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:20}}>
                  <div style={{fontWeight:700,fontSize:15,color:T.text}}>{sel.company}</div>
                  <div style={{fontSize:11,color:T.sub,marginBottom:16}}>{sel.contact} · {sel.industry} · {sel.location}</div>
                  <div style={{display:'flex', gap:8, marginBottom:16}}>
                    {[['email','COLD EMAIL'],['linkedin','LINKEDIN MSG']].map(([t,lbl])=>(
                      <button key={t} className="hb" onClick={()=>{setMsgType(t);setGenerated(null);}}
                        style={{...btn(), flex:1, background:msgType===t?T.accentBg:T.surface, border:`1px solid ${msgType===t?T.accent:T.border}`, color:msgType===t?T.accent:T.sub, padding:'10px', fontSize:11}}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                  <button className="hb" onClick={generate} disabled={loading}
                    style={{...btn(), width:'100%', background:loading?T.surface:T.accent, color:loading?T.sub:'#000', padding:'13px', fontSize:13, marginBottom:16, opacity:loading?0.65:1}}>
                    {loading ? 'GENERATING...' : `GENERATE ${msgType==='email'?'COLD EMAIL':'LINKEDIN MESSAGE'}`}
                  </button>
                  {loading && <div style={{textAlign:'center', color:T.sub, fontSize:11, marginBottom:12, animation:'blink 1.4s infinite'}}>Claude is crafting your message...</div>}
                  {generated && (
                    <div>
                      {(generated.subject||generated.opening) && (
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:9,color:T.sub,letterSpacing:1.5,marginBottom:6}}>{msgType==='email'?'SUBJECT LINE':'OPENING'}</div>
                          <div style={{background:T.surface, border:`1px solid ${T.border}`, borderRadius:4, padding:'9px 12px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:10}}>
                            <span style={{color:T.accent,fontWeight:700,fontSize:12}}>{generated.subject||generated.opening}</span>
                            <button className="hb" onClick={()=>copy(generated.subject||generated.opening,'sub')}
                              style={{...btn(), background:'none', border:'none', color:copied==='sub'?T.accent:T.sub, fontSize:10, padding:'2px 6px'}}>
                              {copied==='sub'?'COPIED!':'COPY'}
                            </button>
                          </div>
                        </div>
                      )}
                      <div style={{marginBottom:12}}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
                          <span style={{fontSize:9,color:T.sub,letterSpacing:1.5}}>MESSAGE BODY</span>
                          <button className="hb" onClick={()=>copy(generated.body,'body')}
                            style={{...btn(), background:'none', border:'none', color:copied==='body'?T.accent:T.sub, fontSize:10}}>
                            {copied==='body'?'COPIED!':'COPY'}
                          </button>
                        </div>
                        <div style={{background:T.surface, border:`1px solid ${T.border}`, borderRadius:4, padding:'12px', color:T.text, fontSize:12, lineHeight:1.8, whiteSpace:'pre-wrap'}}>{generated.body}</div>
                      </div>
                      {generated.cta && (
                        <div style={{marginBottom:14}}>
                          <div style={{fontSize:9,color:T.sub,letterSpacing:1.5,marginBottom:6}}>CALL TO ACTION</div>
                          <div style={{background:T.surface, border:`1px solid ${T.border}`, borderRadius:4, padding:'9px 12px', color:T.text, fontSize:12}}>{generated.cta}</div>
                        </div>
                      )}
                      <button className="hb"
                        onClick={()=>{
                          const full = msgType==='email'
                            ? `Subject: ${generated.subject||''}\n\n${generated.body}\n\n${generated.cta||''}`
                            : `${generated.opening||''}\n\n${generated.body}\n\n${generated.cta||''}`;
                          copy(full,'all');
                          updateStatus(sel.id, msgType==='email'?'Email Sent':'LinkedIn Connected');
                        }}
                        style={{...btn(), width:'100%', background:copied==='all'?T.accentBg:T.surface, border:`1px solid ${copied==='all'?T.accent:T.border}`, color:copied==='all'?T.accent:T.sub, padding:'10px', fontSize:11}}>
                        {copied==='all'?'COPIED! STATUS AUTO-UPDATED':'COPY FULL MESSAGE + UPDATE STATUS'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PIPELINE TAB */}
        {tab==='pipeline' && (
          <div style={{overflowX:'auto', paddingBottom:8}}>
            <div style={{display:'flex', gap:12, minWidth:'max-content'}}>
              {STATUSES.map(s=>{
                const grp = pipeline[s]||[];
                const sc = SM[s];
                return (
                  <div key={s} style={{width:188, flexShrink:0}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
                      <span style={{fontSize:9,color:sc.c,fontWeight:700,letterSpacing:1.5}}>{s.toUpperCase()}</span>
                      <span style={{background:sc.bg, color:sc.c, borderRadius:12, padding:'2px 8px', fontSize:10, fontWeight:700}}>{grp.length}</span>
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:8}}>
                      {grp.map(lead=>(
                        <div key={lead.id} style={{background:T.card, border:`1px solid ${T.border}`, borderRadius:6, padding:'10px 12px'}}>
                          <div style={{fontWeight:700, fontSize:12, color:T.text}}>{lead.company}</div>
                          <div style={{fontSize:10, color:T.sub, marginTop:2}}>{lead.contact}</div>
                          <div style={{fontSize:10, color:T.warn, marginTop:6, lineHeight:1.4}}>{lead.signal.substring(0,52)}...</div>
                          <button className="hb" onClick={()=>{setSel(lead);setTab('generator');setGenerated(null);}}
                            style={{...btn(), background:T.accentBg, border:`1px solid ${T.accent}`, color:T.accent, padding:'4px 8px', fontSize:9, marginTop:8, width:'100%'}}>GENERATE MSG</button>
                        </div>
                      ))}
                      {grp.length===0 && <div style={{border:`1px dashed ${T.border}`, borderRadius:6, padding:'20px 10px', textAlign:'center', color:T.sub, fontSize:11}}>—</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DAILY PLAN TAB */}
        {tab==='daily' && (
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
            <div>
              <div style={{fontSize:9,color:T.sub,fontWeight:700,letterSpacing:2,marginBottom:13}}>DAILY EXECUTION — 1 HOUR/DAY</div>
              {DAILY.map(task=>{
                const done = !!checks[task.id];
                return (
                  <div key={task.id} onClick={()=>setChecks(p=>({...p,[task.id]:!p[task.id]}))}
                    style={{background:done?T.accentBg:T.card, border:`1px solid ${done?T.accent:T.border}`, borderRadius:8, padding:'12px 13px', cursor:'pointer', marginBottom:8, transition:'all 0.2s'}}>
                    <div style={{display:'flex', gap:11, alignItems:'flex-start'}}>
                      <div style={{width:17, height:17, borderRadius:3, border:`2px solid ${done?T.accent:T.border}`, background:done?T.accent:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1}}>
                        {done && <span style={{color:'#000',fontSize:10,fontWeight:900}}>✓</span>}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700, color:done?T.accent:T.text, fontSize:13, textDecoration:done?'line-through':'none'}}>{task.task}</div>
                        <div style={{fontSize:10, color:T.sub, marginTop:3}}>{task.where}</div>
                      </div>
                      <div style={{textAlign:'right', flexShrink:0}}>
                        <div style={{fontSize:11,color:T.accent,fontWeight:700}}>{task.mins}m</div>
                        <div style={{fontSize:9,color:T.sub}}>{task.time}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div style={{background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:14, marginTop:6}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                  <span style={{fontSize:9,color:T.sub,fontWeight:700,letterSpacing:1}}>TODAY'S PROGRESS</span>
                  <span style={{fontSize:11,color:T.accent,fontWeight:700}}>{checkedN}/{DAILY.length} DONE</span>
                </div>
                <div style={{background:T.surface, borderRadius:3, height:5, overflow:'hidden'}}>
                  <div style={{background:T.accent, height:'100%', width:`${(checkedN/DAILY.length)*100}%`, transition:'width 0.4s', borderRadius:3}} />
                </div>
              </div>
            </div>
            <div>
              <div style={{fontSize:9,color:T.sub,fontWeight:700,letterSpacing:2,marginBottom:13}}>FREE LEAD SOURCES</div>
              {SOURCES.map(src=>(
                <div key={src.name} style={{background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:13, marginBottom:10}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5}}>
                    <span style={{fontWeight:700, fontSize:12, color:src.color}}>{src.name}</span>
                    <a href={src.url} target="_blank" rel="noreferrer"
                      style={{fontSize:9,color:src.color,fontWeight:700,letterSpacing:1,textDecoration:'none',border:`1px solid ${src.color}`,padding:'3px 8px',borderRadius:3}}>OPEN</a>
                  </div>
                  <div style={{fontSize:11,color:T.sub,lineHeight:1.6}}>{src.desc}</div>
                </div>
              ))}
              <div style={{background:T.card, border:`1px solid ${T.accent}`, borderRadius:8, padding:14}}>
                <div style={{fontSize:9,color:T.accent,fontWeight:700,letterSpacing:2,marginBottom:12}}>REVENUE ROADMAP</div>
                {PROJECTIONS.map((row,i)=>(
                  <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:i<PROJECTIONS.length-1?`1px solid ${T.border}`:'none'}}>
                    <div>
                      <div style={{fontSize:12,color:T.text,fontWeight:700}}>{row.label}</div>
                      <div style={{fontSize:10,color:T.sub}}>{row.when}</div>
                    </div>
                    <div style={{fontSize:16,color:T.accent,fontWeight:700}}>{row.rev}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
