import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

/* ─────────────────────────────────────────────
   🎨 PALETA
───────────────────────────────────────────── */
const PALETTE = {
  bgCream:      "#F6F1EB",
  archGold:     "#D8CDBF",
  textGreen:    "#5A6B4F",
  textGold:     "#A18262",
  textMuted:    "#7A6F63",
  balloonSage:  "#A3AD90",
  balloonBeige: "#E2D6C2",
  leafGreen:    "#8C9B7A",
  leafLight:    "#B0C49E",
  leafDark:     "#5C6B50",
  white:        "#FFFFFF",
  lightSage:    "#EEF3EA",
};

/* ─────────────────────────────────────────────
   ✨ ANIMAÇÕES GLOBAIS
───────────────────────────────────────────── */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Dancing+Script:wght@600&family=Lato:wght@300;400;700&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  * { box-sizing: border-box; }
  body { margin: 0; background: #F6F1EB; }

  .fadeUp { animation: fadeUp  0.9s ease forwards; }
  .fadeIn { animation: fadeIn  0.6s ease forwards; }
  .float  { animation: float   6s ease-in-out infinite; }
`;

/* ─────────────────────────────────────────────
   💾 SUPABASE — funções de dados
───────────────────────────────────────────── */
const PARTY_ADDRESS = "Rua Da Mooca, 1500 – Salão de Festas";

async function loadGuests() {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .order("created_at", { ascending: true });
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
   🍼 FRALDAS
───────────────────────────────────────────── */
function getDiaperSize(pos) {
  if (pos <= 10) return { size: "P"  };
  if (pos <= 19) return { size: "M"  };
  if (pos <= 30) return { size: "G"  };
  return               { size: "GG" };
}

/* ─────────────────────────────────────────────
   🔐 SENHA ADMIN — vem do .env, nunca do código
───────────────────────────────────────────── */
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD;
console.log("A senha que o site leu é:", ADMIN_PASS);

/* ─────────────────────────────────────────────
   🖼 ÍCONES SVG
───────────────────────────────────────────── */
function HeartIcon({ size = 14, color = PALETTE.textGold, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <path d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z" fill={color}/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
      stroke={PALETTE.textGold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
      <path d="M12 17 C10 15 10 13 12 13 C14 13 14 15 12 17Z" fill={PALETTE.textGold} stroke="none"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   🌿 BRANCH
───────────────────────────────────────────── */
function BranchSVG({ style }) {
  return (
    <svg viewBox="0 0 200 250" style={{ ...style, pointerEvents:"none" }} fill="none">
      <path d="M -20 0 C 30 50 80 150 150 250" stroke={PALETTE.leafDark} strokeWidth="1.5" opacity="0.5" fill="none"/>
      <path d="M 40  0 C 60 40 100 100 180 160" stroke={PALETTE.leafDark} strokeWidth="1"   opacity="0.3" fill="none"/>
      {[
        { d:"M -10 10 Q 30 0 60 20 Q 30 40 -10 10",       c:PALETTE.leafLight },
        { d:"M 20 40 Q 70 30 90 60 Q 50 80 20 40",        c:PALETTE.leafGreen },
        { d:"M 10 90 Q 60 70 90 100 Q 50 120 10 90",      c:PALETTE.leafLight },
        { d:"M 50 120 Q 100 100 130 140 Q 90 160 50 120", c:PALETTE.leafGreen },
        { d:"M 80 170 Q 130 150 150 190 Q 110 210 80 170",c:PALETTE.leafLight },
        { d:"M 40 10 Q 70 -10 100 10 Q 80 40 40 10",      c:PALETTE.leafGreen },
        { d:"M 80 50 Q 120 30 150 60 Q 120 90 80 50",     c:PALETTE.leafLight },
        { d:"M 120 100 Q 160 80 190 120 Q 150 140 120 100",c:PALETTE.leafGreen},
      ].map((l,i)=><path key={i} d={l.d} fill={l.c} opacity="0.8"/>)}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   🎈 BALÕES
───────────────────────────────────────────── */
function BalloonsSVG({ style }) {
  return (
    <div className="float" style={style}>
      <svg viewBox="0 0 150 250" width="150" height="250" fill="none">
        <path d="M 60 120 Q 50 180 60 250" stroke={PALETTE.archGold} strokeWidth="1.5" fill="none"/>
        <path d="M 100 90 Q 110 160 90 250" stroke={PALETTE.archGold} strokeWidth="1.5" fill="none"/>
        <ellipse cx="100" cy="50"  rx="40" ry="50" fill={PALETTE.balloonBeige}/>
        <path d="M 95 98 L 105 98 L 100 105 Z" fill={PALETTE.balloonBeige}/>
        <ellipse cx="85" cy="30" rx="15" ry="25" fill="#FFF" opacity="0.2" transform="rotate(-30 85 30)"/>
        <ellipse cx="60" cy="70"  rx="45" ry="55" fill={PALETTE.balloonSage}/>
        <path d="M 55 123 L 65 123 L 60 130 Z" fill={PALETTE.balloonSage}/>
        <ellipse cx="40" cy="45" rx="15" ry="25" fill="#FFF" opacity="0.2" transform="rotate(-30 40 45)"/>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   🧸 RODAPÉ DECORATIVO
───────────────────────────────────────────── */
function FooterDecorSVG({ style }) {
  return (
    <svg viewBox="0 0 400 160" style={{ ...style, pointerEvents:"none" }} fill="none">
      <rect x="290" y="80" width="80" height="60" fill="#CBB69D" rx="2"/>
      <rect x="285" y="70" width="90" height="15" fill="#CBB69D" rx="2"/>
      <rect x="325" y="70" width="10" height="70" fill={PALETTE.leafGreen} opacity="0.8"/>
      <path d="M 330 70 Q 300 40 330 60 Q 360 40 330 70" fill={PALETTE.leafGreen} opacity="0.8"/>
      <path d="M 360 130 Q 390 90 370 70 Q 350 90 360 130" fill={PALETTE.leafLight} opacity="0.9"/>
      <path d="M 280 140 Q 250 110 270 90 Q 290 110 280 140" fill={PALETTE.leafGreen} opacity="0.9"/>
      <rect x="80"  y="110" width="30" height="30" fill="#E2D4C3" rx="2"/>
      <path d="M 95 115 A 5 5 0 0 0 85 125 A 5 5 0 0 0 95 135 A 5 5 0 0 0 105 125 A 5 5 0 0 0 95 115" fill="#FFF" opacity="0.8"/>
      <rect x="40"  y="120" width="30" height="30" fill="#D5C5B1" rx="2"/>
      <path d="M 55 125 A 5 5 0 0 0 45 135 A 5 5 0 0 0 55 145 A 5 5 0 0 0 65 135 A 5 5 0 0 0 55 125" fill="#FFF" opacity="0.6"/>
      <rect x="110" y="125" width="25" height="25" fill="#C9B7A2" rx="2"/>
      <path d="M 160 115 Q 170 95 190 95 L 210 95 Q 230 95 240 115 L 250 115 A 5 5 0 0 1 255 120 L 255 135 A 5 5 0 0 1 250 140 L 150 140 A 5 5 0 0 1 145 135 L 145 120 A 5 5 0 0 1 150 115 Z" fill="#D5C5B1"/>
      <path d="M 180 98 L 200 98 Q 215 98 220 115 L 170 115 Q 175 98 180 98 Z" fill={PALETTE.bgCream}/>
      <circle cx="175" cy="140" r="12" fill="#B4A18D"/>
      <circle cx="175" cy="140" r="4"  fill="#8F7E6D"/>
      <circle cx="225" cy="140" r="12" fill="#B4A18D"/>
      <circle cx="225" cy="140" r="4"  fill="#8F7E6D"/>
      <g transform="translate(-10,0)">
        <circle cx="70" cy="80" r="35" fill="#C4A889"/>
        <circle cx="40" cy="50" r="15" fill="#C4A889"/>
        <circle cx="100" cy="50" r="15" fill="#C4A889"/>
        <circle cx="40" cy="50" r="8"  fill="#D5BEA3"/>
        <circle cx="100" cy="50" r="8"  fill="#D5BEA3"/>
        <ellipse cx="70" cy="90" rx="16" ry="12" fill="#D5BEA3"/>
        <circle cx="62" cy="75" r="3" fill="#5C4D3C"/>
        <circle cx="78" cy="75" r="3" fill="#5C4D3C"/>
        <ellipse cx="70" cy="86" rx="5" ry="3" fill="#5C4D3C"/>
        <path d="M 70 110 L 50 100 L 50 120 Z" fill={PALETTE.leafGreen}/>
        <path d="M 70 110 L 90 100 L 90 120 Z" fill={PALETTE.leafGreen}/>
        <circle cx="70" cy="110" r="6" fill={PALETTE.leafDark}/>
        <path d="M 68 110 L 55 140 L 65 140 Z" fill={PALETTE.leafGreen}/>
        <path d="M 72 110 L 85 140 L 75 140 Z" fill={PALETTE.leafGreen}/>
      </g>
    </svg>
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
      // verificar duplicata
      const { data: existing } = await supabase
        .from("guests")
        .select("id")
        .ilike("name", form.name.trim())
        .limit(1);
      if (existing && existing.length > 0) { setStep("already"); return; }

      // calcular posição para tamanho de fralda
      const { count } = await supabase
        .from("guests")
        .select("*", { count: "exact", head: true })
        .eq("attending", "yes");
      const diaper = form.attending === "yes" ? getDiaperSize((count ?? 0) + 1) : null;
      if (diaper) setDiaperInfo(diaper);

      // inserir no banco
      await addGuest({
        name:        form.name.trim(),
        attending:   form.attending,
        guests:      form.attending === "yes" ? parseInt(form.guests) : 0,
        message:     form.message.trim() || null,
        diaper_size: diaper ? diaper.size : null,
      });
      setStep("success");
    } catch (e) {
      setError("Ocorreu um erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "success" && form.attending === "yes") return (
    <div style={S.rsvpPage}>
      <div className="fadeIn" style={S.card}>
        <div style={{ fontSize:40, marginBottom:10 }}>🌿</div>
        <h2 style={S.cardTitle}>Que alegria, {firstName}!</h2>
        <p style={S.cardText}>
          Estamos <em>ansiosamente</em> aguardando esse dia tão especial.<br/>
          Mal podemos esperar para te ver por aqui! 💛
        </p>
        {diaperInfo && (
          <div style={S.diaperBox}>
            <p style={S.diaperLabel}>☁️ Sugestão de presente</p>
            <p style={{ ...S.cardText, margin:"0 0 10px" }}>
              Um <strong>pacote de fraldas</strong> será muito bem-vindo! Sugerimos para você:
            </p>
            <div style={S.diaperCard}>
              <span style={{ fontSize:30 }}>☁️</span>
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:600, fontSize:22, color:PALETTE.textGreen }}>
                  Fralda {diaperInfo.size}
                </div>
                <div style={{ fontSize:12, color:PALETTE.leafGreen, fontWeight:600, marginTop:3 }}>
                  Pampers ou Huggies
                </div>
              </div>
            </div>
          </div>
        )}
        <div style={S.addressBox}>
          <p style={S.addressLabel}>📍 Local da festa</p>
          <p style={{ margin:0, color:PALETTE.textMuted, fontSize:14, fontWeight:600 }}>{PARTY_ADDRESS}</p>
        </div>
        <button style={S.btnOutline} onClick={onDone}>← Voltar ao convite</button>
      </div>
    </div>
  );

  if (step === "success" && form.attending === "no") return (
    <div style={S.rsvpPage}>
      <div className="fadeIn" style={S.card}>
        <div style={{ fontSize:40, marginBottom:10 }}>🤍</div>
        <h2 style={S.cardTitle}>Vamos sentir sua falta, {firstName}!</h2>
        <p style={S.cardText}>
          Entendemos perfeitamente. Saiba que você estará em nossos pensamentos
          nesse dia tão especial. 💛<br/><br/>
          Com carinho, obrigado por nos avisar!
        </p>
        <button style={S.btnOutline} onClick={onDone}>← Voltar ao convite</button>
      </div>
    </div>
  );

  if (step === "already") return (
    <div style={S.rsvpPage}>
      <div className="fadeIn" style={S.card}>
        <div style={{ fontSize:40, marginBottom:10 }}>💛</div>
        <h2 style={S.cardTitle}>Você já confirmou!</h2>
        <p style={S.cardText}>Seu nome já está na nossa lista. Até lá! 🌿</p>
        <button style={S.btnOutline} onClick={onDone}>← Voltar</button>
      </div>
    </div>
  );

  return (
    <div style={S.rsvpPage}>
      <div className="fadeIn" style={S.card}>
        <HeartIcon size={22} style={{ marginBottom:10 }}/>
        <h2 style={S.cardTitle}>Confirme sua presença</h2>
        <p style={{ color:PALETTE.textMuted, fontSize:11, margin:"0 0 22px", letterSpacing:"0.12em", textTransform:"uppercase" }}>
          Chá do Bento
        </p>
        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          {[["yes","✅ Vou comparecer"],["no","❌ Não poderei ir"]].map(([v,label])=>(
            <button key={v} onClick={()=>set("attending",v)} style={{
              flex:1, padding:"12px 6px", borderRadius:8, border:"1px solid",
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
      </div>
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
    try {
      const data = await loadGuests();
      setGuests(data);
    } finally {
      setLoading(false);
    }
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
            Painel do Chá
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
                    ☁️ Fralda {g.diaper_size}
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
   🎉 CONVITE
───────────────────────────────────────────── */
function InvitePage({ onRSVP, onAdmin }) {
  return (
    <div style={{
      minHeight:"100vh", background:PALETTE.bgCream,
      display:"flex", flexDirection:"column", alignItems:"center",
      position:"relative", overflow:"hidden",
      fontFamily:"'Lato',sans-serif", padding:"20px",
    }}>
      <div style={{ position:"relative", maxWidth:420, width:"100%", display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 20px" }}>
        <div style={{ position:"absolute", top:0, bottom:60, left:10, right:10, border:`1.5px solid ${PALETTE.archGold}`, borderRadius:"200px 200px 0 0", pointerEvents:"none", zIndex:0 }}/>
        <div style={{ position:"absolute", top:10, bottom:68, left:20, right:20, border:`1px solid ${PALETTE.archGold}`, borderRadius:"200px 200px 0 0", pointerEvents:"none", zIndex:0, opacity:0.35 }}/>
        <BranchSVG style={{ position:"absolute", top:-10, left:-40, width:220, zIndex:1 }}/>
        <BalloonsSVG style={{ position:"absolute", top:10, right:-20, zIndex:1 }}/>
        <div className="fadeUp" style={{ position:"relative", zIndex:2, textAlign:"center", width:"100%", marginTop:50 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", color:PALETTE.textGreen, fontSize:34, letterSpacing:"0.3em", margin:0, fontWeight:300 }}>
            SAVE
          </h2>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:15, margin:"8px 0" }}>
            <div style={{ height:1, width:36, background:PALETTE.textGreen, opacity:0.45 }}/>
            <span style={{ fontSize:11, color:PALETTE.textGreen, letterSpacing:"0.3em" }}>THE</span>
            <div style={{ height:1, width:36, background:PALETTE.textGreen, opacity:0.45 }}/>
          </div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", color:PALETTE.textGreen, fontSize:34, letterSpacing:"0.3em", margin:"0 0 18px", fontWeight:300 }}>
            DATE
          </h2>
          <HeartIcon size={14}/>
          <p style={{ color:PALETTE.textMuted, fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", margin:"14px 0 6px", lineHeight:1.7 }}>
            A espera está ficando<br/>cada vez mais especial...
          </p>
          <p style={{ color:PALETTE.textMuted, fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", margin:"0 0 14px", lineHeight:1.7 }}>
            Reserve esta data para celebrar<br/>conosco a chegada do nosso
          </p>
          <p style={{ fontFamily:"'Dancing Script',cursive", fontSize:26, color:PALETTE.textGold, margin:"0 0 -8px", fontWeight:600 }}>
            maior presente:
          </p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(72px,20vw,90px)", color:PALETTE.textGreen, margin:"0 0 14px", fontWeight:400, lineHeight:1 }}>
            Bento
          </h1>
          <HeartIcon size={13}/>
          <div style={{ borderTop:`1px solid ${PALETTE.archGold}`, borderBottom:`1px solid ${PALETTE.archGold}`, padding:"14px 0", margin:"16px 20px", display:"flex", alignItems:"center", justifyContent:"center", gap:14 }}>
            <CalendarIcon/>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:10, color:PALETTE.textMuted, letterSpacing:"0.15em", textTransform:"uppercase" }}>Último final de semana</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:19, color:PALETTE.textGreen, letterSpacing:"0.2em", textTransform:"uppercase", marginTop:2 }}>DE AGOSTO</div>
            </div>
          </div>
          <p style={{ fontFamily:"'Dancing Script',cursive", fontSize:26, color:PALETTE.textGold, margin:"0 0 4px", fontWeight:600 }}>
            Em breve
          </p>
          <HeartIcon size={10} color={PALETTE.textGreen}/>
          <p style={{ fontSize:10, color:PALETTE.textMuted, letterSpacing:"0.15em", textTransform:"uppercase", margin:"6px 0 0" }}>
            Enviaremos mais informações.
          </p>
        </div>
        <FooterDecorSVG style={{ width:"130%", marginTop:10, zIndex:2, marginLeft:"-15%" }}/>
      </div>
      <div style={{ position:"relative", zIndex:10, marginTop:-20, display:"flex", flexDirection:"column", gap:12, width:"100%", maxWidth:340 }}>
        <button style={{ ...S.btn, boxShadow:"0 4px 18px rgba(90,107,79,0.18)" }} onClick={onRSVP}>
          🌿  Confirmar Presença
        </button>
        <button style={S.btnGhost} onClick={onAdmin}>
          Painel da Família (Admin)
        </button>
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
   🎨 ESTILOS
───────────────────────────────────────────── */
const S = {
  rsvpPage: {
    minHeight:"100vh", background:PALETTE.bgCream,
    display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px",
  },
  card: {
    background:"white", borderRadius:16, padding:"30px 24px",
    boxShadow:"0 8px 32px rgba(90,107,79,0.08)",
    width:"100%", maxWidth:420, textAlign:"center",
    border:`1px solid ${PALETTE.archGold}`,
  },
  cardTitle:  { fontFamily:"'Cormorant Garamond',serif", color:PALETTE.textGreen, fontSize:26, margin:"0 0 10px", fontWeight:600 },
  cardText:   { color:PALETTE.textMuted, fontSize:14, lineHeight:1.7, margin:"0 0 18px" },
  diaperBox:  { background:PALETTE.lightSage, borderRadius:12, padding:"16px 18px", marginBottom:16, textAlign:"left", border:`1px solid ${PALETTE.leafGreen}25` },
  diaperLabel:{ margin:"0 0 8px", fontWeight:700, color:PALETTE.textGreen, fontSize:13, letterSpacing:0.5 },
  diaperCard: { background:"white", borderRadius:10, padding:"12px 14px", display:"flex", alignItems:"center", gap:12 },
  addressBox: { background:"white", borderRadius:12, padding:"14px 16px", marginBottom:18, border:`1px dashed ${PALETTE.archGold}` },
  addressLabel:{ margin:"0 0 4px", fontWeight:700, color:PALETTE.textGreen, fontSize:11, letterSpacing:1, textTransform:"uppercase" },
  label:      { display:"block", textAlign:"left", fontSize:11, fontWeight:700, color:PALETTE.textGreen, letterSpacing:1, textTransform:"uppercase", marginBottom:6 },
  input:      { display:"block", width:"100%", padding:"12px 14px", borderRadius:8, fontSize:14, border:`1px solid ${PALETTE.archGold}`, background:"#FDFAF7", color:PALETTE.textGreen, outline:"none", marginBottom:14, fontFamily:"'Lato',sans-serif" },
  btn:        { background:PALETTE.textGreen, color:"white", border:"none", borderRadius:8, padding:"13px 20px", fontSize:13, fontWeight:700, cursor:"pointer", letterSpacing:"0.1em", textTransform:"uppercase", transition:"opacity .2s", width:"100%" },
  btnOutline: { background:"transparent", color:PALETTE.textGreen, border:`1px solid ${PALETTE.textGreen}`, borderRadius:8, padding:"11px 20px", fontSize:12, fontWeight:700, cursor:"pointer", textTransform:"uppercase", letterSpacing:"0.08em", width:"100%" },
  btnGhost:   { background:"transparent", color:PALETTE.textMuted, border:"none", fontSize:12, cursor:"pointer", padding:"8px 12px", textTransform:"uppercase", letterSpacing:"0.08em", width:"100%" },
};
