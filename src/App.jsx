import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

/* ─────────────────────────────────────────────
   🎨 PALETA
───────────────────────────────────────────── */
const PALETTE = {
  bgCream:   "#F5EFE8",
  archGold:  "#D8CDBF",
  textGreen: "#3D5A40",
  textGold:  "#A18262",
  textMuted: "#7A6F63",
  leafGreen: "#8C9B7A",
  white:     "#FFFFFF",
  lightSage: "#EEF3EA",
};

/* ─────────────────────────────────────────────
   ✨ ANIMAÇÕES & CSS GLOBAL
───────────────────────────────────────────── */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Dancing+Script:wght@500;600;700&family=Lato:wght@300;400;700&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  * { box-sizing: border-box; }
  body { margin: 0; background: #F5EFE8; }

  .fadeUp { animation: fadeUp 0.9s cubic-bezier(.22,.68,0,1.2) forwards; }
  .fadeIn { animation: fadeIn 0.7s ease forwards; }

  .invite-card {
    background: #F5EFE8;
    border-radius: 20px;
    border: 1.5px solid #D8CDBF;
    box-shadow: 0 12px 48px rgba(61,90,64,0.10), 0 2px 8px rgba(61,90,64,0.06);
    width: 100%;
    max-width: 400px;
    overflow: hidden;
    text-align: center;
  }

  .invite-body {
    padding: 4px 28px 8px;
  }

  .divider-gold {
    width: 60%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #D8CDBF, transparent);
    margin: 0 auto;
    border: none;
  }

  .info-block {
    margin: 14px 0 4px;
    border-top: 1px solid #D8CDBF60;
  }

  .info-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 0;
    border-bottom: 1px dashed #D8CDBF90;
  }
  .info-row:last-child { border-bottom: none; }

  .info-text-main {
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px;
    font-weight: 600;
    color: #3D5A40;
    letter-spacing: 0.04em;
    line-height: 1.3;
  }

  .info-text-sub {
    font-size: 11px;
    color: #7A6F63;
    letter-spacing: 0.06em;
    margin-top: 2px;
    font-family: 'Lato', sans-serif;
  }

  .map-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #3D5A40;
    font-family: 'Lato', sans-serif;
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
    letter-spacing: 0.06em;
    opacity: 0.8;
    transition: opacity .2s;
    padding: 3px 8px;
    border: 1px solid #D8CDBF;
    border-radius: 20px;
    background: white;
    margin-top: 6px;
  }
  .map-link:hover { opacity: 1; border-color: #3D5A40; }

  .em-breve {
    border-top: 1px dashed #D8CDBF70;
    padding: 10px 0 12px;
    margin-top: 6px;
  }

  .btn-primary {
    width: 100%;
    background: #3D5A40;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 14px 20px;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Lato', sans-serif;
    cursor: pointer;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    transition: opacity .2s, transform .15s;
    box-shadow: 0 4px 16px rgba(61,90,64,0.22);
  }
  .btn-primary:hover { opacity: 0.92; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }

  .btn-ghost {
    width: 100%;
    background: transparent;
    color: #9B8B7E;
    border: none;
    font-size: 11px;
    font-family: 'Lato', sans-serif;
    cursor: pointer;
    padding: 8px 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .btn-ghost:hover { color: #3D5A40; }
`;

/* ─────────────────────────────────────────────
   💾 SUPABASE
───────────────────────────────────────────── */
const PARTY_ADDRESS = "R. Euclides Pacheco, 1141 – Tatuapé, São Paulo – SP";
const MAPS_URL      = "https://maps.google.com/?q=R.+Euclides+Pacheco,+1141,+Tatuapé,+São+Paulo";
const WAZE_URL      = "https://waze.com/ul?q=R.+Euclides+Pacheco+1141+Tatuape+Sao+Paulo";

async function loadGuests() {
  const { data, error } = await supabase
    .from("guests").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
async function addGuest(entry) {
  const { error } = await supabase.from("guests").insert([entry]);
  if (error) throw error;
}
async function deleteGuest(id) {
  const { error } = await supabase.from("guests").delete().eq("id", id);
  if (error) throw error;
}

/* ─────────────────────────────────────────────
   🍼 FRALDAS — 0-25 pessoas → M, 26+ → G
───────────────────────────────────────────── */
async function getDiaperSizeByTotal() {
  const { data } = await supabase.from("guests").select("guests").eq("attending", "yes");
  const total = (data ?? []).reduce((s, g) => s + (g.guests || 0), 0);
  return total <= 25 ? { size: "M" } : { size: "G" };
}

const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD;

/* ─────────────────────────────────────────────
   🖼 ÍCONES SVG
───────────────────────────────────────────── */
function HeartIcon({ size = 12, color = "#A18262" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display:"inline-block", verticalAlign:"middle" }}>
      <path d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z" fill={color}/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="#A18262" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <path d="M12 17 C10 15 10 13 12 13 C14 13 14 15 12 17Z" fill="#A18262" stroke="none"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="#A18262" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
      <circle cx="12" cy="12" r="9"/>
      <polyline points="12 7 12 12 15 15"/>
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="#A18262" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:2 }}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5" fill="#A18262" stroke="none"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   🎉 PÁGINA DO CONVITE
───────────────────────────────────────────── */
function InvitePage({ onRSVP, onAdmin }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: PALETTE.bgCream,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Lato', sans-serif",
      padding: "20px 16px 28px",
    }}>

      {/* ── card principal ── */}
      <div className="invite-card fadeUp">

        {/* TOPO — folhas + balões */}
        <img src="/topo-arte.png" alt=""
          style={{ width:"100%", display:"block", mixBlendMode:"multiply" }}/>

        {/* ── corpo do convite ── */}
        <div className="invite-body">

          {/* título */}
          <p style={{
            fontFamily:"'Cormorant Garamond',serif",
            letterSpacing:"0.35em", fontSize:11,
            color: PALETTE.textGreen, margin:"0",
            textTransform:"uppercase", fontWeight:300,
          }}>Chá</p>

          <p style={{
            fontFamily:"'Dancing Script',cursive",
            fontSize:50, color: PALETTE.textGreen,
            margin:"-6px 0 6px", fontWeight:600, lineHeight:1,
          }}>Fralda</p>

          <HeartIcon size={13}/>

          <hr className="divider-gold" style={{ margin:"12px auto" }}/>

          <p style={{
            color: PALETTE.textMuted, fontSize:11,
            letterSpacing:"0.12em", textTransform:"uppercase",
            margin:"0 0 4px", lineHeight:1.7,
          }}>
            A espera está ficando cada vez mais especial...
          </p>
          <p style={{
            color: PALETTE.textMuted, fontSize:11,
            letterSpacing:"0.08em", textTransform:"uppercase",
            margin:"0 0 12px", lineHeight:1.7,
          }}>
            Reserve esta data para celebrar<br/>conosco a chegada do nosso
          </p>

          <p style={{
            fontFamily:"'Dancing Script',cursive",
            fontSize:22, color: PALETTE.textGold,
            margin:"0 0 -4px", fontWeight:600,
          }}>maior presente:</p>

          <h1 style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontSize:"clamp(58px,15vw,76px)",
            color: PALETTE.textGreen,
            margin:"0 0 8px", fontWeight:400, lineHeight:1,
            letterSpacing:"-0.01em",
          }}>Bento</h1>

          <HeartIcon size={12}/>

          <hr className="divider-gold" style={{ margin:"12px auto" }}/>

          {/* DATA / HORA / LOCAL */}
          <div className="info-block">

            <div className="info-row">
              <CalendarIcon/>
              <div style={{ textAlign:"left" }}>
                <div className="info-text-main">29/08/2026 — Sábado</div>
              </div>
            </div>

            <div className="info-row">
              <ClockIcon/>
              <div style={{ textAlign:"left" }}>
                <div className="info-text-main">Às 16h00</div>
              </div>
            </div>

            <div className="info-row" style={{ alignItems:"flex-start" }}>
              <PinIcon/>
              <div style={{ textAlign:"left" }}>
                <div className="info-text-main">
                  R. Euclides Pacheco, 1141<br/>
                  <span style={{ fontSize:14, fontWeight:400 }}>Tatuapé · São Paulo – SP</span>
                </div>
                <div style={{ display:"flex", gap:8, marginTop:6, flexWrap:"wrap" }}>
                  <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="map-link">
                    🗺 Google Maps
                  </a>
                  <a href={WAZE_URL} target="_blank" rel="noopener noreferrer" className="map-link">
                    🚗 Waze
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* em breve */}
          <div className="em-breve">
            <p style={{
              fontFamily:"'Dancing Script',cursive",
              fontSize:22, color: PALETTE.textGold,
              margin:"0 0 4px", fontWeight:600,
            }}>Em breve</p>
            <HeartIcon size={10} color={PALETTE.textGreen}/>
            <p style={{
              fontSize:10, color: PALETTE.textMuted,
              letterSpacing:"0.15em", textTransform:"uppercase",
              margin:"5px 0 0",
            }}>Enviaremos mais informações.</p>
          </div>

        </div>

        {/* RODAPÉ — ursinho + presente */}
        <img src="/rodape-arte.png" alt=""
          style={{ width:"100%", display:"block", mixBlendMode:"multiply" }}/>

      </div>

      {/* ── botões ── */}
      <div className="fadeIn" style={{
        width:"100%", maxWidth:400,
        display:"flex", flexDirection:"column", gap:8,
        marginTop:16,
      }}>
        <button className="btn-primary" onClick={onRSVP}>
          🌿  Confirmar Presença
        </button>
        <button className="btn-ghost" onClick={onAdmin}>
          Painel da Família (Admin)
        </button>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────────
   📩 RSVP
───────────────────────────────────────────── */
function RSVPPage({ onDone }) {
  const [step, setStep]             = useState("form");
  const [form, setForm]             = useState({ name:"", guests:"1", message:"", attending:"yes" });
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [diaperInfo, setDiaperInfo] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const firstName = form.name.split(" ")[0];

  async function submit() {
    if (!form.name.trim()) { setError("Por favor, informe seu nome."); return; }
    setLoading(true); setError("");
    try {
      const { data: existing } = await supabase
        .from("guests").select("id").ilike("name", form.name.trim()).limit(1);
      if (existing && existing.length > 0) { setStep("already"); return; }
      const diaper = form.attending === "yes" ? await getDiaperSizeByTotal() : null;
      if (diaper) setDiaperInfo(diaper);
      await addGuest({
        name:        form.name.trim(),
        attending:   form.attending,
        guests:      form.attending === "yes" ? parseInt(form.guests) : 0,
        message:     form.message.trim() || null,
        diaper_size: diaper ? diaper.size : null,
      });
      setStep("success");
    } catch { setError("Ocorreu um erro ao enviar. Tente novamente."); }
    finally  { setLoading(false); }
  }

  const Card = ({ children }) => (
    <div className="fadeIn" style={S.card}>{children}</div>
  );

  /* success YES */
  if (step === "success" && form.attending === "yes") return (
    <div style={S.rsvpPage}>
      <Card>
        <div style={{ fontSize:40, marginBottom:8 }}>🌿</div>
        <h2 style={S.cardTitle}>Que alegria, {firstName}!</h2>
        <p style={S.cardText}>
          Estamos <em>ansiosamente</em> aguardando esse dia tão especial.<br/>
          Mal podemos esperar para te ver por aqui! 💛
        </p>
        {diaperInfo && (
          <div style={S.diaperBox}>
            <p style={S.diaperLabel}>☁️ Sugestão de presente</p>
            <p style={{ ...S.cardText, margin:"0 0 10px", fontSize:13 }}>
              Se quiser nos presentear, sugerimos para você:
            </p>
            <div style={S.diaperCard}>
              {/* Item 1 — Fralda */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:"100%", textAlign:"center", paddingBottom:10 }}>
                <span style={{ fontSize:28, marginBottom:6 }}>☁️</span>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:600, fontSize:20, color:PALETTE.textGreen, lineHeight:1.2 }}>
                  Pacote de Fralda {diaperInfo.size}
                </div>
                <div style={{ fontSize:12, color:PALETTE.leafGreen, fontWeight:600, marginTop:5, lineHeight:1.7 }}>
                  Pampers — Premium Care ou Confort Sec<br/>
                  <span style={{ color:PALETTE.textGold, fontSize:11 }}>ou</span><br/>
                  Huggies — Natural Care ou Pants
                </div>
              </div>

              {/* Separador + */}
              <div style={{ width:"80%", borderTop:`1px dashed ${PALETTE.archGold}`, margin:"0 auto 10px", position:"relative" }}>
                <span style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:"white", padding:"0 8px", color:PALETTE.textGold, fontWeight:"bold", fontSize:18 }}>+</span>
              </div>

              {/* Item 2 — Lenço */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:"100%", textAlign:"center", paddingTop:4 }}>
                <span style={{ fontSize:28, marginBottom:6 }}>💧</span>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:600, fontSize:20, color:PALETTE.textGreen, lineHeight:1.2 }}>
                  Pacote de Lenço Umedecido
                </div>
                <div style={{ fontSize:12, color:PALETTE.leafGreen, fontWeight:600, marginTop:5, lineHeight:1.7 }}>
                  Sem Fragrância
                </div>
              </div>
            </div>
          </div>
        )}
        <div style={S.addressBox}>
          <p style={S.addressLabel}>📍 Local da festa</p>
          <p style={{ margin:"0 0 8px", color:PALETTE.textMuted, fontSize:14, fontWeight:600, lineHeight:1.5 }}>
            {PARTY_ADDRESS}
          </p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="map-link">🗺 Google Maps</a>
            <a href={WAZE_URL} target="_blank" rel="noopener noreferrer" className="map-link">🚗 Waze</a>
          </div>
        </div>
        <button style={S.btnOutline} onClick={onDone}>← Voltar ao convite</button>
      </Card>
    </div>
  );

  /* success NO */
  if (step === "success" && form.attending === "no") return (
    <div style={S.rsvpPage}>
      <Card>
        <div style={{ fontSize:40, marginBottom:8 }}>🤍</div>
        <h2 style={S.cardTitle}>Vamos sentir sua falta, {firstName}!</h2>
        <p style={S.cardText}>
          Entendemos perfeitamente. Saiba que você estará em nossos
          pensamentos nesse dia tão especial. 💛<br/><br/>
          Com carinho, obrigado por nos avisar!
        </p>
        <button style={S.btnOutline} onClick={onDone}>← Voltar ao convite</button>
      </Card>
    </div>
  );

  /* already */
  if (step === "already") return (
    <div style={S.rsvpPage}>
      <Card>
        <div style={{ fontSize:40, marginBottom:8 }}>💛</div>
        <h2 style={S.cardTitle}>Você já confirmou!</h2>
        <p style={S.cardText}>Seu nome já está na nossa lista. Até lá! 🌿</p>
        <button style={S.btnOutline} onClick={onDone}>← Voltar</button>
      </Card>
    </div>
  );

  /* form */
  return (
    <div style={S.rsvpPage}>
      <Card>
        <HeartIcon size={20} style={{ marginBottom:10 }}/>
        <h2 style={S.cardTitle}>Confirme sua presença</h2>
        <p style={{ color:PALETTE.textMuted, fontSize:11, margin:"0 0 20px", letterSpacing:"0.12em", textTransform:"uppercase" }}>
          Chá Fralda do Bento · 29/08/2026
        </p>
        <div style={{ display:"flex", gap:10, marginBottom:18 }}>
          {[["yes","✅ Vou comparecer"],["no","❌ Não poderei ir"]].map(([v,label])=>(
            <button key={v} onClick={()=>set("attending",v)} style={{
              flex:1, padding:"11px 6px", borderRadius:8, border:"1px solid",
              borderColor: form.attending===v ? PALETTE.textGreen : PALETTE.archGold,
              background:  form.attending===v ? PALETTE.lightSage : "transparent",
              color:PALETTE.textGreen, fontWeight:600, cursor:"pointer", fontSize:12,
              fontFamily:"'Lato',sans-serif", transition:"all .2s",
            }}>{label}</button>
          ))}
        </div>
        <label style={S.label}>Seu nome completo *</label>
        <input style={S.input} placeholder="Maria da Silva"
          value={form.name} onChange={e=>set("name",e.target.value)}/>
        {form.attending === "yes" && (
          <>
            <label style={S.label}>Quantas pessoas virão com você?</label>
            <select style={S.input} value={form.guests} onChange={e=>set("guests",e.target.value)}>
              {[1,2,3,4,5].map(n=>(
                <option key={n} value={n}>{n} {n===1?"pessoa":"pessoas"}</option>
              ))}
            </select>
          </>
        )}
        <label style={S.label}>Mensagem para o Bento (opcional)</label>
        <textarea style={{ ...S.input, minHeight:80, resize:"vertical" }}
          placeholder="Deixe uma mensagem carinhosa 🌿"
          value={form.message} onChange={e=>set("message",e.target.value)}/>
        {error && <p style={{ color:"#c0392b", fontSize:13, margin:"-6px 0 10px", textAlign:"left" }}>{error}</p>}
        <button style={{ ...S.btn, opacity:loading?0.7:1 }} onClick={submit} disabled={loading}>
          {loading ? "Enviando…" : "🌿  Confirmar presença"}
        </button>
        <button style={S.btnGhost} onClick={onDone}>← Voltar ao convite</button>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────
   🔐 ADMIN GATE
───────────────────────────────────────────── */
function AdminGate({ onUnlock, onBack }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState(false);
  const check = () => pwd === ADMIN_PASS ? onUnlock() : setErr(true);
  return (
    <div style={{ minHeight:"100vh", background:PALETTE.bgCream, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ ...S.card, maxWidth:320 }}>
        <div style={{ fontSize:36, marginBottom:10 }}>🔐</div>
        <h2 style={S.cardTitle}>Acesso restrito</h2>
        <p style={{ color:PALETTE.textMuted, fontSize:13, margin:"0 0 20px" }}>Apenas para a família do Bento</p>
        <input type="password" style={S.input} placeholder="Senha" value={pwd}
          onChange={e=>{ setPwd(e.target.value); setErr(false); }}
          onKeyDown={e=>e.key==="Enter"&&check()}/>
        {err && <p style={{ color:"#c0392b", fontSize:12, margin:"-8px 0 10px" }}>Senha incorreta.</p>}
        <button style={S.btn} onClick={check}>Entrar</button>
        <button style={{ ...S.btnGhost, marginTop:10 }} onClick={onBack}>← Voltar</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   📊 ADMIN PANEL
───────────────────────────────────────────── */
function AdminPanel({ onBack }) {
  const [guests, setGuests]   = useState([]);
  const [filter, setFilter]   = useState("all");
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const [del, setDel]         = useState(null);

  useEffect(() => { refresh(); }, []);
  async function refresh() {
    setLoading(true);
    try { setGuests(await loadGuests()); } finally { setLoading(false); }
  }
  async function remove(id) {
    await deleteGuest(id);
    setGuests(g => g.filter(x => x.id !== id));
    setDel(null);
  }

  const attending    = guests.filter(g => g.attending === "yes");
  const totalPeople  = attending.reduce((s, g) => s + (g.guests || 0), 0);
  const notAttending = guests.filter(g => g.attending === "no");
  const visible = guests
    .filter(g => filter === "all" ? true : g.attending === filter)
    .filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight:"100vh", background:PALETTE.bgCream, padding:"20px 16px" }}>
      <div style={{ maxWidth:600, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button style={S.btnGhost} onClick={onBack}>← Voltar</button>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", color:PALETTE.textGreen, fontSize:24, margin:0, fontWeight:400 }}>
            Painel — Chá Fralda do Bento
          </h1>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
          {[["🌿",totalPeople,"Pessoas vindo"],["✅",attending.length,"Confirmados"],["❌",notAttending.length,"Não virão"]].map(([icon,n,label])=>(
            <div key={label} style={{ background:"white", borderRadius:12, padding:"14px 8px", textAlign:"center", border:`1px solid ${PALETTE.archGold}` }}>
              <div style={{ fontSize:22 }}>{icon}</div>
              <div style={{ fontSize:26, fontWeight:700, color:PALETTE.textGreen, lineHeight:1 }}>{n}</div>
              <div style={{ fontSize:11, color:PALETTE.textMuted, marginTop:4 }}>{label}</div>
            </div>
          ))}
        </div>
        <input style={{ ...S.input, marginBottom:10 }} placeholder="🔍 Buscar convidado..."
          value={search} onChange={e=>setSearch(e.target.value)}/>
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {[["all","Todos"],["yes","✅ Confirmados"],["no","❌ Recusados"]].map(([v,label])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{
              padding:"8px 14px", borderRadius:20, border:"1px solid",
              borderColor: filter===v ? PALETTE.textGreen : PALETTE.archGold,
              background:  filter===v ? PALETTE.lightSage : "white",
              color:PALETTE.textGreen, fontSize:12, fontWeight:600, cursor:"pointer",
              fontFamily:"'Lato',sans-serif",
            }}>{label}</button>
          ))}
        </div>
        {loading ? (
          <p style={{ textAlign:"center", color:PALETTE.textMuted }}>Carregando…</p>
        ) : visible.length === 0 ? (
          <div style={{ ...S.card, textAlign:"center" }}>
            <p style={{ color:PALETTE.textMuted, margin:0 }}>
              {guests.length === 0 ? "Nenhuma confirmação ainda." : "Nenhum resultado."}
            </p>
          </div>
        ) : visible.map(g => (
          <div key={g.id} style={{
            background:"white", borderRadius:12, padding:"16px", marginBottom:10,
            border:`1px solid ${PALETTE.archGold}`,
            borderLeft:`5px solid ${g.attending==="yes" ? PALETTE.leafGreen : "#e0b8b8"}`,
            display:"flex", alignItems:"flex-start", gap:12,
          }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span style={{ fontWeight:700, color:PALETTE.textGreen, fontSize:15 }}>{g.name}</span>
                <span style={{
                  fontSize:11, padding:"3px 8px", borderRadius:20, fontWeight:600,
                  background: g.attending==="yes" ? PALETTE.lightSage : "#fde8e8",
                  color: g.attending==="yes" ? PALETTE.textGreen : "#c0392b",
                }}>
                  {g.attending==="yes" ? `✅ ${g.guests} pessoa(s)` : "❌ Não virá"}
                </span>
                {g.attending==="yes" && g.diaper_size && (
                  <span style={{ fontSize:11, padding:"3px 8px", borderRadius:20, fontWeight:700, background:"#F5EFEB", color:PALETTE.textGold, border:`1px solid ${PALETTE.textGold}50` }}>
                    ☁️ Fralda {g.diaper_size} + Lenço
                  </span>
                )}
                <span style={{ fontSize:11, color:PALETTE.textMuted, marginLeft:"auto" }}>
                  {new Date(g.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              {g.message && (
                <p style={{ margin:"8px 0 0", fontSize:13, color:PALETTE.textMuted, fontStyle:"italic" }}>
                  "{g.message}"
                </p>
              )}
            </div>
            <button onClick={()=>setDel(g.id)}
              style={{ background:"none", border:"none", cursor:"pointer", color:"#ccc", fontSize:22, lineHeight:1, padding:0 }}>×</button>
          </div>
        ))}
        {del && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:20 }}>
            <div style={{ background:"white", borderRadius:16, padding:24, maxWidth:320, width:"100%", textAlign:"center" }}>
              <p style={{ color:PALETTE.textGreen, marginTop:0, fontWeight:"bold" }}>Remover esta confirmação?</p>
              <div style={{ display:"flex", gap:10, marginTop:20 }}>
                <button style={S.btnOutline} onClick={()=>setDel(null)}>Cancelar</button>
                <button style={{ ...S.btn, background:"#e74c3c" }} onClick={()=>remove(del)}>Remover</button>
              </div>
            </div>
          </div>
        )}
        <button style={{ ...S.btnOutline, marginTop:16 }} onClick={refresh}>🔄 Atualizar lista</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   🧠 ROOT
───────────────────────────────────────────── */
export default function App() {
  const [view, setView] = useState("invite");
  return (
    <>
      <style>{globalCSS}</style>
      {view==="invite" && <InvitePage onRSVP={()=>setView("rsvp")} onAdmin={()=>setView("gate")}/>}
      {view==="rsvp"   && <RSVPPage   onDone={()=>setView("invite")}/>}
      {view==="gate"   && <AdminGate  onUnlock={()=>setView("admin")} onBack={()=>setView("invite")}/>}
      {view==="admin"  && <AdminPanel onBack={()=>setView("invite")}/>}
    </>
  );
}

/* ─────────────────────────────────────────────
   🎨 ESTILOS COMPARTILHADOS
───────────────────────────────────────────── */
const S = {
  rsvpPage:    { minHeight:"100vh", background:PALETTE.bgCream, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px" },
  card:        { background:"white", borderRadius:16, padding:"28px 24px", boxShadow:"0 8px 32px rgba(61,90,64,0.08)", width:"100%", maxWidth:400, textAlign:"center", border:`1px solid ${PALETTE.archGold}` },
  cardTitle:   { fontFamily:"'Cormorant Garamond',serif", color:PALETTE.textGreen, fontSize:26, margin:"0 0 10px", fontWeight:600 },
  cardText:    { color:PALETTE.textMuted, fontSize:14, lineHeight:1.7, margin:"0 0 16px" },
  diaperBox:   { background:PALETTE.lightSage, borderRadius:12, padding:"14px 16px", marginBottom:14, textAlign:"left", border:`1px solid ${PALETTE.leafGreen}25` },
  diaperLabel: { margin:"0 0 6px", fontWeight:700, color:PALETTE.textGreen, fontSize:12, letterSpacing:0.5 },
  diaperCard:  { background:"white", borderRadius:10, padding:"14px 16px", display:"flex", flexDirection:"column", alignItems:"center", gap:0, textAlign:"center" },
  addressBox:  { background:"white", borderRadius:12, padding:"14px 16px", marginBottom:14, border:`1px dashed ${PALETTE.archGold}`, textAlign:"left" },
  addressLabel:{ margin:"0 0 6px", fontWeight:700, color:PALETTE.textGreen, fontSize:11, letterSpacing:1, textTransform:"uppercase" },
  label:       { display:"block", textAlign:"left", fontSize:11, fontWeight:700, color:PALETTE.textGreen, letterSpacing:1, textTransform:"uppercase", marginBottom:6 },
  input:       { display:"block", width:"100%", padding:"11px 14px", borderRadius:8, fontSize:14, border:`1px solid ${PALETTE.archGold}`, background:"#FDFAF7", color:PALETTE.textGreen, outline:"none", marginBottom:14, fontFamily:"'Lato',sans-serif" },
  btn:         { background:PALETTE.textGreen, color:"white", border:"none", borderRadius:8, padding:"12px 20px", fontSize:13, fontWeight:700, cursor:"pointer", letterSpacing:"0.1em", textTransform:"uppercase", transition:"opacity .2s", width:"100%" },
  btnOutline:  { background:"transparent", color:PALETTE.textGreen, border:`1px solid ${PALETTE.textGreen}`, borderRadius:8, padding:"11px 20px", fontSize:12, fontWeight:700, cursor:"pointer", textTransform:"uppercase", letterSpacing:"0.08em", width:"100%" },
  btnGhost:    { background:"transparent", color:PALETTE.textMuted, border:"none", fontSize:11, cursor:"pointer", padding:"6px 10px", textTransform:"uppercase", letterSpacing:"0.1em", width:"100%" },
};