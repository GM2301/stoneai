import { useState, useRef, useCallback } from "react";
import Head from "next/head";
import { GRADES, DEFECTS, STONE_TYPES } from "../lib/stoneKnowledge";

// ── HELPERS ────────────────────────────────────────────────────────────────────
function readFile(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const d = r.result;
      const mt = d.split(";")[0].replace("data:", "");
      res({ data: d.split(",")[1], mediaType: ["image/jpeg","image/png","image/webp"].includes(mt) ? mt : "image/jpeg", preview: d });
    };
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

const G_COLOR = { A: "#4ade80", B: "#fbbf24", C: "#fb923c", D: "#f87171" };
const G_BG    = { A: "rgba(74,222,128,.07)", B: "rgba(251,191,36,.07)", C: "rgba(251,146,60,.07)", D: "rgba(248,113,113,.07)" };
const G_BORDER= { A: "rgba(74,222,128,.18)", B: "rgba(251,191,36,.18)", C: "rgba(251,146,60,.18)", D: "rgba(248,113,113,.18)" };
const REC = {
  approve:               { color: "#4ade80", icon: "✓", label: "APROVUAR" },
  approve_with_discount: { color: "#fbbf24", icon: "◑", label: "APROVUAR ME ZBRITJE" },
  reject:                { color: "#f87171", icon: "✕", label: "REFUZUAR" },
};
const SEV_C = { minor: "#5a7590", moderate: "#fbbf24", major: "#fb923c", critical: "#f87171" };
const SEV_B = { minor: "rgba(90,117,144,.2)", moderate: "rgba(251,191,36,.22)", major: "rgba(251,146,60,.22)", critical: "rgba(248,113,113,.25)" };
const QUAL_C = { excellent: "#4ade80", good: "#a3d977", fair: "#fbbf24", poor: "#f87171" };

function Tag({ children, color = "rgba(80,150,190,.75)", border = "rgba(80,150,190,.2)" }) {
  return (
    <span style={{ fontSize: 8, padding: "2px 8px", border: `1px solid ${border}`, borderRadius: 2, color, letterSpacing: ".1em", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Section({ label, children, style = {} }) {
  return (
    <div style={{ padding: "15px 16px", border: "1px solid rgba(255,255,255,.055)", borderRadius: 3, background: "rgba(255,255,255,.013)", ...style }}>
      {label && <div style={{ fontSize: 7, letterSpacing: ".4em", color: "#1a2838", marginBottom: 9, textTransform: "uppercase" }}>{label}</div>}
      {children}
    </div>
  );
}

function ConfBar({ value, label }) {
  const color = value >= 80 ? "#4ade80" : value >= 60 ? "#fbbf24" : "#f87171";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,.05)", borderRadius: 1, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, transition: "width 1.2s cubic-bezier(.4,0,.2,1)", borderRadius: 1 }} />
      </div>
      <span style={{ fontSize: 9, color: "#1a2838", minWidth: 64 }}>{value}%{label ? ` ${label}` : ""}</span>
    </div>
  );
}

function QualBadge({ value }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {["excellent","good","fair","poor"].map(q => {
        const active = value === q;
        return (
          <div key={q} style={{ flex: 1, padding: "5px 3px", textAlign: "center", border: `1px solid ${active ? "rgba(80,150,190,.3)" : "rgba(255,255,255,.04)"}`, background: active ? "rgba(80,150,190,.07)" : "transparent", borderRadius: 2, fontSize: 7, letterSpacing: ".06em", textTransform: "uppercase", color: active ? "rgba(80,150,190,.9)" : "#1a2838", transition: "all .2s" }}>
            {q.slice(0,3)}
          </div>
        );
      })}
    </div>
  );
}

// ── COMPONENT ──────────────────────────────────────────────────────────────────
export default function StoneAI() {
  const [preview, setPreview] = useState(null);
  const [fd, setFd]           = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [drag, setDrag]       = useState(false);
  const [tab, setTab]         = useState("result"); // result | stone | tips
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file?.type.startsWith("image/")) return;
    const d = await readFile(file);
    setFd(d); setPreview(d.preview); setResult(null); setError(null);
  }, []);

  const analyze = async () => {
    if (!fd) return;
    setLoading(true); setError(null);
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: fd.data, mediaType: fd.mediaType }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Gabim");
      setResult(json); setTab("result");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const reset = () => { setPreview(null); setFd(null); setResult(null); setError(null); };

  const grade = result?.grade;
  const rec   = result?.recommendation ? REC[result.recommendation] : null;
  const stoneInfo = result?.stone_type_id ? STONE_TYPES[result.stone_type_id] : null;

  return (
    <>
      <Head>
        <title>StoneAI — Universal Stone Intelligence</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#07090b", display: "flex", flexDirection: "column", fontFamily: "'DM Mono','Courier New',monospace", color: "#b8c8d4" }}>
        <style>{`
          .drop{transition:border-color .2s,background .2s}
          .drop:hover{border-color:rgba(80,148,188,.38)!important;background:rgba(80,148,188,.03)!important}
          .drag{border-color:rgba(80,148,188,.55)!important;background:rgba(80,148,188,.06)!important}
          .abtn{transition:all .22s}
          .abtn:hover:not(:disabled){background:rgba(80,148,188,.1)!important;border-color:rgba(80,148,188,.5)!important}
          .abtn:disabled{opacity:.28;cursor:not-allowed}
          .spin{animation:spin .7s linear infinite}
          @keyframes spin{to{transform:rotate(360deg)}}
          .blink{animation:blink 2s ease-in-out infinite}
          @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
          .scanline{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(80,148,188,.65),transparent);animation:sl 1.8s ease-in-out infinite;pointer-events:none}
          @keyframes sl{0%{top:0;opacity:0}8%{opacity:1}92%{opacity:1}100%{top:100%;opacity:0}}
          .fade{animation:fade .45s cubic-bezier(.4,0,.2,1)}
          @keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
          .tab{transition:all .18s;cursor:pointer;border-bottom:2px solid transparent;padding:8px 12px;font-size:8px;letter-spacing:.24em;color:#1a2838}
          .tab:hover{color:#5a8090}
          .tab.active{color:rgba(80,148,188,.9);border-bottom-color:rgba(80,148,188,.6)}
          .app-tag{font-size:8px;padding:3px 8px;border:1px solid rgba(255,255,255,.06);border-radius:2px;color:#253a50;white-space:nowrap}
        `}</style>

        {/* ── HEADER ── */}
        <header style={{ borderBottom: "1px solid rgba(255,255,255,.045)", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 300, color: "#dde8f2", letterSpacing: ".04em" }}>StoneAI</div>
            <div style={{ fontSize: 7, letterSpacing: ".4em", color: "#1a2838", marginTop: 1 }}>UNIVERSAL STONE INTELLIGENCE</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="blink" style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80" }} />
            <span style={{ fontSize: 7, letterSpacing: ".28em", color: "#1a2838" }}>AI AKTIV</span>
          </div>
        </header>

        {/* ── BODY ── */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: result ? "340px 1fr" : "420px", justifyContent: "center", gap: 20, padding: "22px 18px", maxWidth: 1060, margin: "0 auto", width: "100%" }}>

          {/* ── LEFT ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Upload */}
            <div
              className={`drop${drag ? " drag" : ""}`}
              style={{ border: "1px dashed rgba(255,255,255,.07)", borderRadius: 4, minHeight: preview ? 0 : 220, cursor: preview ? "default" : "pointer", position: "relative", overflow: "hidden" }}
              onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onClick={() => !preview && inputRef.current?.click()}
            >
              {loading && preview && <div className="scanline" />}
              {preview
                ? <img src={preview} alt="" style={{ width: "100%", display: "block", maxHeight: 300, objectFit: "cover", borderRadius: 3 }} />
                : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "40px 20px", textAlign: "center" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1.2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: ".2em", color: "#2a4a60", marginBottom: 5 }}>NGARKO FOTON E GURIT</div>
                      <div style={{ fontSize: 8, color: "#1a2838" }}>Kliko ose tërhiq · JPG · PNG · WEBP</div>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,.04)", paddingTop: 12, width: "100%" }}>
                      <div style={{ fontSize: 8, color: "#152030", lineHeight: 2 }}>
                        🪨 Çdo lloj guri natyror ose artificial<br/>
                        📸 Ndriçim uniform, sfond neutral<br/>
                        📐 Foto nga lart, mostra e pastër
                      </div>
                    </div>
                  </div>
                )}
            </div>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => handleFile(e.target.files[0])} />

            {preview && (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="abtn" onClick={analyze} disabled={loading}
                  style={{ flex: 1, padding: "11px", border: "1px solid rgba(80,148,188,.35)", color: "rgba(80,148,188,.88)", fontSize: 9, letterSpacing: ".22em", borderRadius: 2, background: "transparent" }}>
                  {loading
                    ? <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                        <span className="spin" style={{width:11,height:11,border:"1.5px solid rgba(80,148,188,.8)",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block"}}/>
                        DUKE ANALIZUAR...
                      </span>
                    : <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        ANALIZО GURIN
                      </span>
                  }
                </button>
                <button onClick={reset} style={{ padding: "11px 13px", border: "1px solid rgba(255,255,255,.06)", color: "#1a2838", borderRadius: 2, fontSize: 12 }}>✕</button>
              </div>
            )}

            {error && (
              <div style={{ padding: "10px 12px", background: "rgba(248,113,113,.05)", border: "1px solid rgba(248,113,113,.16)", borderRadius: 2, fontSize: 9, color: "#f87171", lineHeight: 1.7 }}>
                ⚠ {error}
              </div>
            )}

            {/* Stone type reference */}
            <Section label="Llojet e gurit të njohur">
              {Object.entries(STONE_TYPES).map(([id, s]) => (
                <div key={id} style={{ borderBottom: "1px solid rgba(255,255,255,.025)", padding: "4px 0", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 9, color: result?.stone_type_id === id ? "rgba(80,148,188,.9)" : "#253a50" }}>{s.name}</span>
                  <span style={{ fontSize: 7, color: "#1a2838" }}>Mohs {s.hardness_mohs}</span>
                </div>
              ))}
              <div style={{ paddingTop: 8, fontSize: 7, color: "#1a2838" }}>Grade A–D sipas NSI + ASTM C503</div>
            </Section>
          </div>

          {/* ── RIGHT — RESULTS ── */}
          {result && (
            <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 0, overflowY: "auto", maxHeight: "calc(100vh - 120px)" }}>

              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,.04)", marginBottom: 14 }}>
                {[["result","REZULTATI"],["stone","INFORMACION GURI"],["tips","KËSHILLA"]].map(([id, label]) => (
                  <button key={id} className={`tab${tab===id?" active":""}`} onClick={() => setTab(id)}>{label}</button>
                ))}
              </div>

              {/* ── TAB: RESULT ── */}
              {tab === "result" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                  {/* Stone ID */}
                  <Section>
                    <div style={{ fontSize: 7, letterSpacing: ".4em", color: "#1a2838", marginBottom: 6 }}>LLOJI I GURIT</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: "#dde8f2", marginBottom: 5 }}>{result.stone_type_name}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      <Tag>{result.finish_name}</Tag>
                      {result.catalog_match_name && <Tag color="#c8a96e" border="rgba(200,169,110,.25)">{result.catalog_match_name}</Tag>}
                    </div>
                    <div style={{ fontSize: 9, color: "#2a4060", marginBottom: 10, lineHeight: 1.65 }}>
                      <span style={{ color: "#3a5570" }}>Ngjyrë: </span>{result.color_description}<br/>
                      <span style={{ color: "#3a5570" }}>Pattern: </span>{result.pattern_description}
                    </div>
                    <ConfBar value={result.stone_confidence} label="sigurim" />
                    {result.stone_confidence_reason && (
                      <div style={{ fontSize: 9, color: "#1a2838", fontStyle: "italic", marginTop: 5, lineHeight: 1.55 }}>{result.stone_confidence_reason}</div>
                    )}
                    {result.catalog_match && result.catalog_confidence > 0 && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.04)" }}>
                        <div style={{ fontSize: 7, letterSpacing: ".3em", color: "#1a2838", marginBottom: 5 }}>MATCH NGA KATALOGU</div>
                        <ConfBar value={result.catalog_confidence} label="match katalog" />
                      </div>
                    )}
                    {result.similar_stones?.length > 0 && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.04)" }}>
                        <div style={{ fontSize: 7, letterSpacing: ".3em", color: "#1a2838", marginBottom: 7 }}>GURI I NGJASHËM</div>
                        {result.similar_stones.map((s, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "baseline" }}>
                            <span style={{ fontSize: 9, color: "#253a50", flex: 1 }}>{s.stone}</span>
                            <span style={{ fontSize: 8, color: "rgba(80,148,188,.6)" }}>{s.probability}%</span>
                            <span style={{ fontSize: 8, color: "#1a2838", fontStyle: "italic" }}>{s.reason}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>

                  {/* Grade */}
                  {grade && (
                    <div style={{ padding: "15px 16px", border: `1px solid ${G_BORDER[grade]}`, borderRadius: 3, background: G_BG[grade], display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 7, letterSpacing: ".4em", color: "#253a50", marginBottom: 4 }}>GRADIMI (NSI Standard)</div>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: G_COLOR[grade], marginBottom: 3 }}>{GRADES[grade]?.name}</div>
                        <div style={{ fontSize: 9, color: "#253a50", lineHeight: 1.55, maxWidth: 280 }}>{result.grade_reasoning}</div>
                        {result._grade_info?.structural && (
                          <div style={{ fontSize: 8, color: "#1a2838", marginTop: 4 }}>Strukturë: {result._grade_info.structural}</div>
                        )}
                      </div>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 62, fontWeight: 600, color: G_COLOR[grade], opacity: .14, lineHeight: 1 }}>{grade}</div>
                    </div>
                  )}

                  {/* Recommendation */}
                  {rec && (
                    <Section>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: result.recommended_applications?.length ? 10 : 0 }}>
                        <span style={{ fontSize: 11, letterSpacing: ".2em", color: rec.color, fontWeight: 500 }}>{rec.icon} {rec.label}</span>
                        {result.discount_percent > 0 && <span style={{ fontSize: 9, color: "#fbbf24" }}>-{result.discount_percent}% çmim</span>}
                      </div>
                      {result.recommended_applications?.length > 0 && (
                        <>
                          <div style={{ fontSize: 7, letterSpacing: ".3em", color: "#1a2838", marginBottom: 6 }}>APLIKIME TÖ REKOMANDUARA</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {result.recommended_applications.map((a, i) => <span key={i} className="app-tag">{a}</span>)}
                          </div>
                        </>
                      )}
                      {result.not_recommended_for?.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: 7, letterSpacing: ".3em", color: "#1a2838", marginBottom: 5 }}>MOS PËRDOR PËR</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {result.not_recommended_for.map((a, i) => <span key={i} style={{ fontSize: 8, padding: "2px 8px", border: "1px solid rgba(248,113,113,.18)", borderRadius: 2, color: "rgba(248,113,113,.6)" }}>{a}</span>)}
                          </div>
                        </div>
                      )}
                    </Section>
                  )}

                  {/* Defects */}
                  <Section label={`Defektet — ${result.defect_count ?? result.defects?.length ?? 0} të gjetur`}>
                    {!result.defects?.length
                      ? <div style={{ fontSize: 9, color: "#4ade80" }}>✓ Asnjë defekt strukturor i dukshëm</div>
                      : result.defects.map((d, i) => (
                        <div key={i} style={{ padding: "9px 11px", background: "rgba(255,255,255,.015)", border: "1px solid rgba(255,255,255,.04)", borderRadius: 2, marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <span style={{ fontSize: 9, color: "rgba(80,148,188,.8)", letterSpacing: ".1em", textTransform: "uppercase" }}>{d.name || d.id}</span>
                            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                              {d.repairable !== undefined && (
                                <span style={{ fontSize: 7, color: d.repairable ? "#4ade80" : "#f87171" }}>
                                  {d.repairable ? "✓ reparueshëm" : "✕ jo reparueshëm"}
                                </span>
                              )}
                              <span style={{ fontSize: 7, padding: "1px 5px", border: `1px solid ${SEV_B[d.severity]||SEV_B.minor}`, borderRadius: 1, color: SEV_C[d.severity]||SEV_C.minor, letterSpacing: ".1em" }}>
                                {(d.severity||"").toUpperCase()}
                              </span>
                            </div>
                          </div>
                          {d.location && <div style={{ fontSize: 8, color: "#1a2838", marginBottom: 3 }}>📍 {d.location}</div>}
                          {d.size && <div style={{ fontSize: 8, color: "#1a2838", marginBottom: 3 }}>📏 {d.size}</div>}
                          <div style={{ fontSize: 9, color: "#253a50", lineHeight: 1.55 }}>{d.description}</div>
                        </div>
                      ))
                    }
                  </Section>

                  {/* Natural features */}
                  {result.natural_features?.length > 0 && (
                    <Section label="Karakteristika natyrore (jo defekte)">
                      {result.natural_features.map((f, i) => (
                        <div key={i} style={{ display: "flex", gap: 7, marginBottom: 5 }}>
                          <span style={{ color: "#4ade80", fontSize: 9 }}>✓</span>
                          <span style={{ fontSize: 9, color: "#253a50", lineHeight: 1.5 }}>{f}</span>
                        </div>
                      ))}
                    </Section>
                  )}

                  {/* Quality */}
                  <Section label="Metrikat">
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[["Kualitet sipërfaqes", result.surface_quality], ["Integriteti strukturor", result.structural_integrity]].map(([lbl, val]) => (
                        <div key={lbl}>
                          <div style={{ fontSize: 7, color: "#1a2838", letterSpacing: ".2em", marginBottom: 5 }}>{lbl.toUpperCase()}</div>
                          <QualBadge value={val} />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.03)", display: "flex", gap: 12 }}>
                      {[["Foto", result.photo_quality], ["Ndriçim", result.lighting], ["Analizë", result.analysis_confidence]].map(([lbl, val]) => (
                        <div key={lbl}>
                          <div style={{ fontSize: 7, color: "#1a2838" }}>{lbl}</div>
                          <div style={{ fontSize: 8, color: val === "good" || val === "high" || val === "excellent" || val === "adequate" ? "#4ade80" : "#fbbf24" }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Notes */}
                  {result.analysis_notes && (
                    <Section label="Vlerësimi">
                      <div style={{ fontSize: 9, color: "#2a4a60", lineHeight: 1.8 }}>{result.analysis_notes}</div>
                    </Section>
                  )}
                </div>
              )}

              {/* ── TAB: STONE INFO ── */}
              {tab === "stone" && stoneInfo && (
                <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Section>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: "#dde8f2", marginBottom: 8 }}>{stoneInfo.name}</div>
                    <div style={{ fontSize: 9, color: "#2a4060", lineHeight: 1.8 }}>
                      <div><span style={{ color: "#3a5570" }}>Origjina: </span>{stoneInfo.origin}</div>
                      <div><span style={{ color: "#3a5570" }}>Fortësia Mohs: </span>{stoneInfo.hardness_mohs}</div>
                      <div><span style={{ color: "#3a5570" }}>Karakteristika: </span>{stoneInfo.characteristics}</div>
                    </div>
                  </Section>
                  <Section label="Kujdesi dhe mbrojtja">
                    <div style={{ fontSize: 9, color: "#2a4060", lineHeight: 1.8 }}>{stoneInfo.care_notes}</div>
                    {result.care_instructions && (
                      <div style={{ marginTop: 8, fontSize: 9, color: "#1a2838", fontStyle: "italic", lineHeight: 1.6 }}>{result.care_instructions}</div>
                    )}
                  </Section>
                  <Section label="Finishet e mundshme">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {stoneInfo.common_finishes.map(f => (
                        <Tag key={f} color={result.finish_id === f ? "rgba(80,148,188,.9)" : "#253a50"} border={result.finish_id === f ? "rgba(80,148,188,.3)" : "rgba(255,255,255,.06)"}>{f}</Tag>
                      ))}
                    </div>
                  </Section>
                  <Section label="Aplikimet tipike">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {stoneInfo.use_cases.map(u => <span key={u} className="app-tag">{u}</span>)}
                    </div>
                  </Section>
                  {result._finish_info && (
                    <Section label={`Finish: ${result.finish_name}`}>
                      <div style={{ fontSize: 9, color: "#2a4060", lineHeight: 1.8 }}>
                        <div style={{ marginBottom: 4 }}>Shkëlqimi: {result._finish_info.shine}/10</div>
                        <div style={{ color: "#4ade80", marginBottom: 2 }}>✓ {result._finish_info.pros}</div>
                        <div style={{ color: "#fbbf24" }}>⚠ {result._finish_info.cons}</div>
                      </div>
                    </Section>
                  )}
                </div>
              )}

              {/* ── TAB: TIPS ── */}
              {tab === "tips" && (
                <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Section label="Si të bësh foto të mirë">
                    {[
                      ["📸 Ndriçim", "Ndriçim i barabartë nga të dyja anët. Shmang hijen e fortë dhe dritën direkte mbi sipërfaqe."],
                      ["📐 Pozicionimi", "Foto nga lart (90°), drejtpërdrejt. Shmang këndet e pjerrëta."],
                      ["🪨 Pastërtia", "Pastro sipërfaqen para fotografimit. Pluhuri dhe papastërtia imitojnë defekte."],
                      ["🔍 Distanca", "Afër sa të kapet e gjithë copla, por jo shumë larg. 30-60cm ideale."],
                      ["⬛ Sfondi", "Sfond neutral — tryezë druri ose bora e zezë. Kurrë mbi carpet."],
                      ["☁️ Ndriçim natyror", "Drita e ditës (pa diell direkt) jep rezultatin më të mirë."],
                    ].map(([title, desc]) => (
                      <div key={title} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,.03)" }}>
                        <div style={{ fontSize: 9, color: "#3a5570", marginBottom: 3 }}>{title}</div>
                        <div style={{ fontSize: 9, color: "#1a2838", lineHeight: 1.6 }}>{desc}</div>
                      </div>
                    ))}
                  </Section>
                  <Section label="Sistemi i gradimit NSI">
                    {["A","B","C","D"].map(g => (
                      <div key={g} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "baseline" }}>
                        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: G_COLOR[g], minWidth: 16 }}>{g}</span>
                        <div>
                          <div style={{ fontSize: 8, color: "#2a4060" }}>{GRADES[g].name.split("—")[1]?.trim()}</div>
                          <div style={{ fontSize: 8, color: "#1a2838", lineHeight: 1.5 }}>{GRADES[g].description.split(".")[0]}.</div>
                        </div>
                      </div>
                    ))}
                  </Section>
                </div>
              )}
            </div>
          )}

          {!result && preview && !loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed rgba(255,255,255,.04)", borderRadius: 3, color: "#1a2838", fontSize: 9, letterSpacing: ".2em" }}>
              KLIKO "ANALIZО" PËR REZULTATIN
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,.04)", padding: "10px 28px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 7, color: "#0d1820", letterSpacing: ".22em" }}>STONEAI v1.0 · UNIVERSAL STONE INTELLIGENCE</span>
          <span style={{ fontSize: 7, color: "#0d1820", letterSpacing: ".22em" }}>10 LLOJE GURI · NSI GRADE A–D · GPT-4o</span>
        </footer>
      </div>
    </>
  );
}
