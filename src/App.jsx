import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

/* ─────────────────────────────────────────────
   🎨 PALETA (Papel de Algodão & Editorial Moderno)
───────────────────────────────────────────── */
const PALETTE = {
  bgCotton:  "#F4F1EA",
  cardPaper: "#F9F8F5",
  archGold:  "#D4C5B9",
  textGreen: "#2C422F",
  textGold:  "#947758",
  textMuted: "#6E6359",
  leafGreen: "#7A8C6E",
  white:     "#FFFFFF",
  lightSage: "#EAF0E6",
};

/* ─────────────────────────────────────────────
   ✨ ANIMAÇÕES E TIPOGRAFIA (Inter + Cormorant)
───────────────────────────────────────────── */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Inter:wght@400;500&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(15px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  * { box-sizing: border-box; }
  body { 
    margin: 0; 
    background-color: #F4F1EA;
    background-image: radial-gradient(rgba(0,0,0,0.02) 1px, transparent 0);
    background-size: 24px 24px;
    font-family: 'Inter', sans-serif;
  }

  .fadeUp { animation: fadeUp 0.8s ease forwards; }
  .fadeIn { animation: fadeIn 0.6s ease forwards; }

  .info-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
    border-bottom: 1px dashed rgba(212,197,185,0.6);
  }
  .info-row:last-child { border-bottom: none; }

  .map-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #2C422F;
    font-size: 11px;
    font-weight: 500;
    text-decoration: none;
    margin-top: 2px;
    letter-spacing: 0.03em;
    opacity: 0.85;
    transition: opacity .2s;
  }
  .map-link:hover { opacity: 1; text-decoration: underline; }
`;

/* ─────────────────────────────────────────────
   💾 SUPABASE
───────────────────────────────────────────── */
const PARTY_ADDRESS  = "R. Euclides Pacheco, 1141 – Tatuapé, São Paulo – SP - Salão de Festas";
const MAPS_URL       = "https://maps.google.com/?q=R.+Euclides+Pacheco,+1141,+Tatuapé,+São+Paulo";
const WAZE_URL       = "https://waze.com/ul?q=R.+Euclides+Pacheco+1141+Tatuape+Sao+Paulo";

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
async function getDiaperSizeByTotal() {
  const { data } = await supabase
    .from("guests")
    .select("guests")
    .eq("attending", "yes");
  const totalPeople = (data ?? []).reduce((s, g) => s + (g.guests || 0), 0);
  if (totalPeople <= 25) return { size: "M" };
  return { size: "G" };
}

const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD;

/* ─────────────────────────────────────────────
   🖼 ÍCONES
───────────────────────────────────────────── */
function HeartIcon({ size = 11, color = PALETTE.textGold, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <path d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z" fill={color}/>
    </svg>
  );
}

function CalendarIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={PALETTE.textGold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
      <path d="M12 17 C10 15 10 13 12 13 C14 13 14 15 12 17Z" fill={PALETTE.textGold} stroke="none"/>
    </svg>
  );
}

function ClockIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={PALETTE.textGold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <polyline points="12 7 12 12 15 15"/>
    </svg>
  );
}

function PinIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={PALETTE.textGold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5" fill={PALETTE.textGold} stroke="none"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   📩 RSVP
───────────────────────────────────────────── */
function RSVPPage({ onDone }) {
  const [step, setStep]             = useState("form");
  const [form, setForm]             = useState({ name:"", guests:"1", message:"", attending:"yes" });
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [diaperInfo, setDiaperInfo] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const firstName = form.name.split(" ")[0];

  // Atualiza quantidade de campos de acompanhantes baseado no número de convidados
  useEffect(() => {
    const count = Math.max(0, parseInt(form.guests) - 1);
    setCompanions(prev => {
      if (prev.length === count) return prev;
      const arr = [...prev];
      if (arr.length < count) {
        while (arr.length < count) arr.push("");
      } else {
        arr.length = count;
      }
      return arr;
    });
  }, [form.guests]);

  async function submit() {
    if (!form.name.trim()) { setError("Por favor, informe seu nome."); return; }
    
    // Validar se todos os nomes dos acompanhantes foram preenchidos
    if (form.attending === "yes" && parseInt(form.guests) > 1) {
      if (companions.some(c => !c.trim())) {
        setError("Por favor, preencha o nome de todos os acompanhantes.");
        return;
      }
    }

    setLoading(true); setError("");
    try {
      const { data: existing } = await supabase
        .from("guests").select("id").ilike("name", form.name.trim()).limit(1);
      if (existing && existing.length > 0) { setStep("already"); return; }

      const diaper = form.attending === "yes" ? await getDiaperSizeByTotal() : null;
      if (diaper) setDiaperInfo(diaper);

      const companionNamesStr = companions.filter(c => c.trim()).join(", ");

      await addGuest({
        name:            form.name.trim(),
        attending:       form.attending,
        guests:          form.attending === "yes" ? parseInt(form.guests) : 0,
        message:         form.message.trim() || null,
        diaper_size:     diaper ? diaper.size : null,
        companion_names: companionNamesStr || null,
      });
      setStep("success");
    } catch { setError("Ocorreu um erro ao enviar. Tente novamente."); }
    finally  { setLoading(false); }
  }

  if (step === "success" && form.attending === "yes") return (
    <div style={S.rsvpPage}>
      <div className="fadeIn" style={S.card}>
        <div style={{ fontSize:42, marginBottom:8 }}>🌿</div>
        <h2 style={{ ...S.cardTitle, fontFamily:"'Inter',sans-serif" }}>Que alegria, {firstName}!</h2>
        <p style={{ ...S.cardText, fontFamily:"'Inter',sans-serif" }}>
          Estamos <em>ansiosamente</em> aguardando esse dia tão especial.<br/>
          Mal podemos esperar para te ver por aqui! 💛
        </p>

        {diaperInfo && (
          <div style={S.diaperBox}>
            <p style={S.diaperLabel}>☁️ Sugestão de presente</p>
            <p style={{ ...S.cardText, margin:"0 0 12px", fontSize:13 }}>
              Se quiser nos presentear, sugerimos o kit:
            </p>
            
            <div style={S.diaperCard}>
              {/* Item 1: Fralda */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                <span style={{ fontSize: 26 }}>☁️</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:17, color:PALETTE.textGreen, lineHeight:1.2 }}>
                    Pacote de fralda {diaperInfo.size}
                  </div>
                  <div style={{ fontSize:11.5, color:PALETTE.leafGreen, fontWeight:600, marginTop:2 }}>
                    Pampers ou Huggies
                  </div>
                </div>
              </div>

              {/* Indicador de Soma Centralizado */}
              <div style={{ width: "100%", textAlign: "center", margin: "4px 0", color: PALETTE.textGold, fontWeight: "bold", fontSize: 18 }}>
                +
              </div>

              {/* Item 2: Lenço Umedecido */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                <span style={{ fontSize: 26 }}>💧</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:17, color:PALETTE.textGreen, lineHeight:1.2 }}>
                    Pacote de lenço umedecido
                  </div>
                  <div style={{ fontSize:11.5, color:PALETTE.leafGreen, fontWeight:600, marginTop:2 }}>
                    Huggies ou Pampers
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={S.addressBox}>
          <p style={S.addressLabel}>📍 Local da festa</p>
          <p style={{ margin:"0 0 6px", color:PALETTE.textMuted, fontSize:14, fontWeight:500, lineHeight:1.5, fontFamily:"'Inter',sans-serif" }}>
            {PARTY_ADDRESS}
          </p>
          <div style={{ display:"flex", gap:16, marginTop: 12 }}>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" style={{ color: PALETTE.textGreen, fontSize: 13, fontWeight: "600", textDecoration: "none", fontFamily:"'Inter',sans-serif" }}>
              🗺 Google Maps
            </a>
            <a href={WAZE_URL} target="_blank" rel="noopener noreferrer" style={{ color: PALETTE.textGreen, fontSize: 13, fontWeight: "600", textDecoration: "none", fontFamily:"'Inter',sans-serif" }}>
              🚗 Waze
            </a>
          </div>
        </div>

        <button style={S.btnOutline} onClick={onDone}>← Voltar ao convite</button>
      </div>
    </div>
  );

  if (step === "success" && form.attending === "no") return (
    <div style={S.rsvpPage}>
      <div className="fadeIn" style={S.card}>
        <div style={{ fontSize:42, marginBottom:8 }}>🤍</div>
        <h2 style={{ ...S.cardTitle, fontFamily:"'Inter',sans-serif" }}>Vamos sentir sua falta, {firstName}!</h2>
        <p style={{ ...S.cardText, fontFamily:"'Inter',sans-serif" }}>
          Entendemos perfeitamente. Saiba que você estará em nossos pensamentos nesse dia tão especial. 💛<br/><br/>
          Com carinho, obrigado por nos avisar!
        </p>
        <button style={S.btnOutline} onClick={onDone}>← Voltar ao convite</button>
      </div>
    </div>
  );

  if (step === "already") return (
    <div style={S.rsvpPage}>
      <div className="fadeIn" style={S.card}>
        <div style={{ fontSize:42, marginBottom:8 }}>💛</div>
        <h2 style={{ ...S.cardTitle, fontFamily:"'Inter',sans-serif" }}>Você já confirmou!</h2>
        <p style={{ ...S.cardText, fontFamily:"'Inter',sans-serif" }}>Seu nome já está na nossa lista. Até lá! 🌿</p>
        <button style={S.btnOutline} onClick={onDone}>← Voltar</button>
      </div>
    </div>
  );

  return (
    <div style={S.rsvpPage}>
      <div className="fadeIn" style={S.card}>
        <HeartIcon size={22} style={{ marginBottom:10 }}/>
        <h2 style={{ ...S.cardTitle, fontFamily:"'Inter',sans-serif" }}>Confirme sua presença</h2>
        <p style={{ color:PALETTE.textMuted, fontSize:11, margin:"0 0 22px", letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:"'Inter',sans-serif" }}>
          Chá Fralda do Bento · 29/08/2026
        </p>

        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          {[["yes","✅ Vou comparecer"],["no","❌ Não poderei ir"]].map(([v,label])=>(
            <button key={v} onClick={()=>set("attending",v)} style={{
              flex:1, padding:"12px 6px", borderRadius:8, border:"1px solid",
              borderColor: form.attending===v ? PALETTE.textGreen : PALETTE.archGold,
              background:  form.attending===v ? PALETTE.lightSage : "transparent",
              color:PALETTE.textGreen, fontWeight:600, cursor:"pointer", fontSize:12,
              fontFamily:"'Inter',sans-serif", transition:"all .2s",
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

            {parseInt(form.guests) > 1 && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ ...S.label, marginBottom: 8, color: PALETTE.textGold }}>
                  Nome dos acompanhantes:
                </label>
                {companions.map((comp, idx) => (
                  <input
                    key={idx}
                    style={{ ...S.input, marginBottom: 8 }}
                    placeholder={`Nome do acompanhante ${idx + 1}`}
                    value={comp}
                    onChange={e => {
                      const updated = [...companions];
                      updated[idx] = e.target.value;
                      setCompanions(updated);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <label style={S.label}>Mensagem para o Bento (opcional)</label>
        <textarea style={{ ...S.input, minHeight:80, resize:"vertical" }}
          placeholder="Deixe uma mensagem carinhosa 🌿"
          value={form.message} onChange={e=>set("message",e.target.value)}/>

        {error && <p style={{ color:"#c0392b", fontSize:13, margin:"-6px 0 10px", textAlign:"left", fontFamily:"'Inter',sans-serif" }}>{error}</p>}

        <button style={{ ...S.btn, opacity:loading?0.7:1 }} onClick={submit} disabled={loading}>
          {loading ? "Enviando…" : (form.attending === "yes" ? "🌿  Confirmar presença" : "🤍  Enviar resposta")}
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
    <div style={{ minHeight:"100vh", background:PALETTE.bgCotton, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ ...S.card, maxWidth:320 }}>
        <div style={{ fontSize:36, marginBottom:10 }}>🔐</div>
        <h2 style={{ ...S.cardTitle, fontFamily:"'Inter',sans-serif" }}>Acesso restrito</h2>
        <p style={{ color:PALETTE.textMuted, fontSize:13, margin:"0 0 20px", fontFamily:"'Inter',sans-serif" }}>Apenas para a família do Bento</p>
        <input type="password" style={S.input} placeholder="Senha" value={pwd}
          onChange={e=>{ setPwd(e.target.value); setErr(false); }}
          onKeyDown={e=>e.key==="Enter"&&check()}/>
        {err && <p style={{ color:"#c0392b", fontSize:12, margin:"-8px 0 10px", fontFamily:"'Inter',sans-serif" }}>Senha incorreta.</p>}
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
    try { setGuests(await loadGuests()); }
    finally { setLoading(false); }
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
    <div style={{ minHeight:"100vh", background:PALETTE.bgCotton, padding:"20px 16px" }}>
      <div style={{ maxWidth:600, margin:"0 auto" }}>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button style={S.btnGhost} onClick={onBack}>← Voltar</button>
          <h1 style={{ fontFamily:"'Inter',sans-serif", color:PALETTE.textGreen, fontSize:22, margin:0, fontWeight:600 }}>
            Painel — Chá Fralda do Bento
          </h1>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
          {[["🌿",totalPeople,"Pessoas vindo"],["✅",attending.length,"Confirmados"],["❌",notAttending.length,"Não virão"]].map(([icon,n,label])=>(
            <div key={label} style={{ background:"white", borderRadius:12, padding:"14px 8px", textAlign:"center", border:`1px solid ${PALETTE.archGold}` }}>
              <div style={{ fontSize:22 }}>{icon}</div>
              <div style={{ fontSize:26, fontWeight:700, color:PALETTE.textGreen, lineHeight:1, fontFamily:"'Inter',sans-serif" }}>{n}</div>
              <div style={{ fontSize:11, color:PALETTE.textMuted, marginTop:4, fontFamily:"'Inter',sans-serif" }}>{label}</div>
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
              fontFamily:"'Inter',sans-serif",
            }}>{label}</button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign:"center", color:PALETTE.textMuted, fontFamily:"'Inter',sans-serif" }}>Carregando…</p>
        ) : visible.length === 0 ? (
          <div style={{ ...S.card, textAlign:"center" }}>
            <p style={{ color:PALETTE.textMuted, margin:0, fontFamily:"'Inter',sans-serif" }}>
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
                <span style={{ fontWeight:600, color:PALETTE.textGreen, fontSize:15, fontFamily:"'Inter',sans-serif" }}>{g.name}</span>
                <span style={{
                  fontSize:11, padding:"3px 8px", borderRadius:20, fontWeight:600, fontFamily:"'Inter',sans-serif",
                  background: g.attending==="yes" ? PALETTE.lightSage : "#fde8e8",
                  color: g.attending==="yes" ? PALETTE.textGreen : "#c0392b",
                }}>
                  {g.attending==="yes" ? `✅ ${g.guests} pessoa(s)` : "❌ Não virá"}
                </span>
                {g.attending==="yes" && g.diaper_size && (
                  <span style={{ fontSize:11, padding:"3px 8px", borderRadius:20, fontWeight:600, background:"#F5EFEB", color:PALETTE.textGold, border:`1px solid ${PALETTE.textGold}50`, fontFamily:"'Inter',sans-serif" }}>
                    ☁️ Fralda {g.diaper_size} + Lenço
                  </span>
                )}
                <span style={{ fontSize:11, color:PALETTE.textMuted, marginLeft:"auto", fontFamily:"'Inter',sans-serif" }}>
                  {new Date(g.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              {g.companion_names && (
                <p style={{ margin:"6px 0 0", fontSize:12.5, color:PALETTE.textGreen, fontWeight:500, fontFamily:"'Inter',sans-serif" }}>
                  👥 Acompanhante(s): {g.companion_names}
                </p>
              )}
              {g.message && (
                <p style={{ margin:"6px 0 0", fontSize:13, color:PALETTE.textMuted, fontStyle:"italic", fontFamily:"'Inter',sans-serif" }}>
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
              <p style={{ color:PALETTE.textGreen, marginTop:0, fontWeight:"600", fontFamily:"'Inter',sans-serif" }}>Remover esta confirmação?</p>
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
   🎉 PÁGINA DO CONVITE (Espaçamento Ultra-Reduzido)
───────────────────────────────────────────── */
function InvitePage({ onRSVP, onAdmin }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: PALETTE.bgCotton,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "12px 16px 24px",
    }}>

      {/* Cartão Estilo Papel de Algodão */}
      <div className="fadeUp" style={{
        background: PALETTE.cardPaper,
        borderRadius: 16,
        border: `1.5px solid ${PALETTE.archGold}`,
        boxShadow: "0 12px 40px rgba(44,66,47,0.08), 0 1px 3px rgba(0,0,0,0.04)",
        width: "100%",
        maxWidth: 400,
        overflow: "hidden",
        textAlign: "center",
      }}>
        
        {/* TOPO COM "CHÁ FRALDA" */}
        <div style={{ position: "relative", width: "100%" }}>
          <img 
            src="/topo-arte.png" 
            alt="Topo do Convite" 
            style={{ 
              width: "100%", 
              display: "block", 
              mixBlendMode: "multiply", 
              opacity: 0.95 
            }} 
          />
          
          <div style={{
            position: "absolute",
            top: "28%", 
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            padding: "0 16px",
            textAlign: "center"
          }}>
            <p style={{ fontFamily:"'Inter', sans-serif", letterSpacing:"0.3em", fontSize:11, color:PALETTE.textGreen, margin:"0 0 2px", textTransform:"uppercase", fontWeight:500 }}>
              Chá Fralda
            </p>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
              <HeartIcon size={11}/>
            </div>
          </div>
        </div>

        {/* CONTEÚDO CENTRAL COM MARGEM NEGATIVA (-105px) */}
        <div style={{ padding: "0 24px 6px", marginTop: "-105px", position: "relative", zIndex: 2 }}>
          
          <h1 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(60px, 16vw, 80px)", color:PALETTE.textGreen, margin:"0 0 4px", fontWeight:400, lineHeight:1 }}>
            Bento
          </h1>

          <p style={{ fontFamily:"'Inter', sans-serif", color:PALETTE.textMuted, fontSize:11, letterSpacing:"0.02em", lineHeight:1.45, margin:"0 0 10px", padding:"0 12px", fontWeight:400 }}>
            Reserve esta data para celebrar conosco a chegada do nosso maior presente.
          </p>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
            <HeartIcon size={10}/>
          </div>

          {/* INFORMAÇÕES DE DATA, HORA E LOCAL */}
          <div style={{ margin: "6px 0 0", borderTop: `1px solid ${PALETTE.archGold}60` }}>

            <div className="info-row">
              <CalendarIcon size={20}/>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: PALETTE.textGreen, fontWeight: 500, letterSpacing: "0.01em" }}>
                  29/08/2026 — Sábado
                </div>
              </div>
            </div>

            <div className="info-row">
              <ClockIcon size={20}/>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: PALETTE.textGreen, fontWeight: 500, letterSpacing: "0.01em" }}>
                  Às 16h00
                </div>
              </div>
            </div>

            <div className="info-row" style={{ alignItems: "flex-start" }}>
              <PinIcon size={20}/>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: PALETTE.textGreen, fontWeight: 500, lineHeight: 1.35 }}>
                  R. Euclides Pacheco, 1141<br/>
                  Tatuapé · São Paulo – SP - Salão de Festas
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 3 }}>
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

        </div>

        {/* RODAPÉ */}
        <img 
          src="/rodape-arte.png" 
          alt="Rodapé do Convite" 
          style={{ 
            width: "100%", 
            display: "block", 
            marginTop: "-12px", 
            mixBlendMode: "multiply", 
            opacity: 0.95 
          }} 
        />

        {/* BOTÃO DE AÇÃO */}
        <div style={{ padding: "0 24px 20px" }}>
          <button style={{ ...S.btn, boxShadow: "0 4px 16px rgba(44,66,47,0.15)", marginBottom: 8 }} onClick={onRSVP}>
            🌿  Confirmar Presença
          </button>
          <button style={S.btnGhost} onClick={onAdmin}>
            Painel da Família (Admin)
          </button>
        </div>

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
   🎨 ESTILOS GLOBAIS DE COMPONENTES
───────────────────────────────────────────── */
const S = {
  rsvpPage: {
    minHeight:"100vh", background:PALETTE.bgCotton,
    display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px",
  },
  card: {
    background:"white", borderRadius:16, padding:"30px 24px",
    boxShadow:"0 8px 32px rgba(44,66,47,0.08)",
    width:"100%", maxWidth:400, textAlign:"center",
    border:`1px solid ${PALETTE.archGold}`,
  },
  cardTitle:   { color:PALETTE.textGreen, fontSize:24, margin:"0 0 10px", fontWeight:600 },
  cardText:    { color:PALETTE.textMuted, fontSize:14, lineHeight:1.7, margin:"0 0 16px" },
  diaperBox:   { background:PALETTE.lightSage, borderRadius:12, padding:"16px 18px", marginBottom:16, textAlign:"left", border:`1px solid ${PALETTE.leafGreen}25` },
  diaperLabel: { margin:"0 0 6px", fontWeight:600, color:PALETTE.textGreen, fontSize:13, letterSpacing:0.5, fontFamily:"'Inter',sans-serif" },
  diaperCard:  { background:"white", borderRadius:10, padding:"12px 14px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:6 },
  addressBox:  { background:"white", borderRadius:12, padding:"14px 16px", marginBottom:16, border:`1px dashed ${PALETTE.archGold}`, textAlign:"left" },
  addressLabel:{ margin:"0 0 6px", fontWeight:600, color:PALETTE.textGreen, fontSize:11, letterSpacing:1, textTransform:"uppercase", fontFamily:"'Inter',sans-serif" },
  label:       { display:"block", textAlign:"left", fontSize:11, fontWeight:600, color:PALETTE.textGreen, letterSpacing:1, textTransform:"uppercase", marginBottom:6, fontFamily:"'Inter',sans-serif" },
  input:       { display:"block", width:"100%", padding:"12px 14px", borderRadius:8, fontSize:14, border:`1px solid ${PALETTE.archGold}`, background:"#FAF8F5", color:PALETTE.textGreen, outline:"none", marginBottom:14, fontFamily:"'Inter',sans-serif" },
  btn:         { background:PALETTE.textGreen, color:"white", border:"none", borderRadius:8, padding:"12px 20px", fontSize:13, fontWeight:600, cursor:"pointer", letterSpacing:"0.08em", textTransform:"uppercase", transition:"opacity .2s", width:"100%", fontFamily:"'Inter',sans-serif" },
  btnOutline:  { background:"transparent", color:PALETTE.textGreen, border:`1px solid ${PALETTE.textGreen}`, borderRadius:8, padding:"11px 20px", fontSize:12, fontWeight:600, cursor:"pointer", textTransform:"uppercase", letterSpacing:"0.06em", width:"100%", fontFamily:"'Inter',sans-serif" },
  btnGhost:    { background:"transparent", color:PALETTE.textMuted, border:"none", fontSize:11, cursor:"pointer", padding:"6px 10px", textTransform:"uppercase", letterSpacing:"0.06em", width:"100%", fontFamily:"'Inter',sans-serif" },
};