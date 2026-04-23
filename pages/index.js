import { useState, useRef, useCallback } from "react";
import Head from "next/head";
import { GRADES, STONE_TYPES } from "../lib/stoneKnowledge";

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

const GRADE_STYLE = {
  A: { accent: "#4ade80", dim: "rgba(74,222,128,0.1)", ring: "rgba(74,222,128,0.25)" },
  B: { accent: "#fbbf24", dim: "rgba(251,191,36,0.1)",  ring: "rgba(251,191,36,0.25)" },
  C: { accent: "#fb923c", dim: "rgba(251,146,60,0.1)",  ring: "rgba(251,146,60,0.25)" },
  D: { accent: "#f87171", dim: "rgba(248,113,113,0.1)", ring: "rgba(248,113,113,0.25)" },
};
const REC_STYLE = {
  approve:               { color: "#4ade80", label: "APROVUAR",           icon: "✓" },
  approve_with_discount: { color: "#fbbf24", label: "ME ZBRITJE",         icon: "◑" },
  reject:                { color: "#f87171", label: "REFUZUAR",           icon: "✕" },
};
const SEV_STYLE = {
  minor:    "#64748b",
  moderate: "#fbbf24",
  major:    "#fb923c",
  critical: "#f87171",
};

export default function StoneAI() {
  const [preview, setPreview] = useState(null);
  const [fd, setFd]           = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [drag, setDrag]       = useState(false);
  const [phase, setPhase]     = useState("upload"); // upload | analyzing | result
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file?.type.startsWith("image/")) return;
    const d = await readFile(file);
    setFd(d); setPreview(d.preview);
    setResult(null); setError(null); setPhase("upload");
  }, []);

  const analyze = async () => {
    if (!fd) return;
    setLoading(true); setError(null); setPhase("analyzing");
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: fd.data, mediaType: fd.mediaType }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Gabim");
      setResult(json); setPhase("result");
    } catch (e) { setError(e.message); setPhase("upload"); }
    finally { setLoading(false); }
  };

  const reset = () => {
    setPreview(null); setFd(null); setResult(null);
    setError(null); setPhase("upload");
  };

  const gs = result?.grade ? GRADE_STYLE[result.grade] : null;
  const rs = result?.recommendation ? REC_STYLE[result.recommendation] : null;

  return (
    <>
      <Head>
        <title>StoneAI — Stone Intelligence</title>
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <div id="root">
        <style>{`
          :root {
            --bg: #080a0c;
            --bg1: #0d1117;
            --bg2: #111820;
            --border: rgba(255,255,255,0.07);
            --border2: rgba(255,255,255,0.12);
            --text: #e2e8f0;
            --text2: #94a3b8;
            --text3: #475569;
            --accent: #d4a853;
            --accent-dim: rgba(212,168,83,0.12);
            --accent-ring: rgba(212,168,83,0.3);
            --radius: 12px;
            --radius-sm: 8px;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { height: 100%; background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
          #root { min-height: 100vh; display: flex; flex-direction: column; }
          button { cursor: pointer; border: none; background: none; font-family: inherit; }
          input[type=file] { display: none; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-thumb { background: var(--bg2); border-radius: 4px; }

          /* ANIMATIONS */
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
          @keyframes scanX { 0%{left:-100%} 100%{left:100%} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
          @keyframes scaleIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
          @keyframes barFill { from{width:0} to{width:var(--w)} }

          .spin { animation: spin 0.8s linear infinite; }
          .pulse { animation: pulse 2s ease-in-out infinite; }
          .fadeup { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) forwards; }
          .scalein { animation: scaleIn 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }

          /* HEADER */
          .header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid var(--border);
            position: sticky; top: 0; z-index: 10;
            background: rgba(8,10,12,0.9);
            backdrop-filter: blur(12px);
          }
          .logo { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
          .logo span { color: var(--accent); }
          .status { display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--text3); letter-spacing: 0.08em; }

          /* MAIN */
          .main { flex: 1; padding: 24px 20px; max-width: 480px; margin: 0 auto; width: 100%; }

          /* UPLOAD AREA */
          .upload-area {
            border: 1.5px dashed var(--border2);
            border-radius: var(--radius);
            overflow: hidden;
            position: relative;
            transition: border-color 0.2s, background 0.2s;
            cursor: pointer;
            background: var(--bg1);
          }
          .upload-area:hover, .upload-area.drag {
            border-color: var(--accent);
            background: var(--accent-dim);
          }
          .upload-empty {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            gap: 16px; padding: 56px 24px; text-align: center;
          }
          .upload-icon-wrap {
            width: 64px; height: 64px; border-radius: 16px;
            background: var(--bg2); border: 1px solid var(--border2);
            display: flex; align-items: center; justify-content: center;
          }
          .upload-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 600; color: var(--text); }
          .upload-sub { font-size: 13px; color: var(--text3); line-height: 1.6; }
          .upload-formats { display: flex; gap: 6px; justify-content: center; margin-top: 4px; }
          .fmt-tag {
            font-size: 11px; padding: 3px 8px; border-radius: 6px;
            border: 1px solid var(--border2); color: var(--text3); letter-spacing: 0.05em;
          }
          .upload-img { width: 100%; display: block; max-height: 340px; object-fit: cover; }

          /* SCAN LINE */
          .scan-line {
            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none; overflow: hidden;
          }
          .scan-line::after {
            content: ''; position: absolute; top: 0; bottom: 0; width: 60%;
            background: linear-gradient(90deg, transparent, rgba(212,168,83,0.15), transparent);
            animation: scanX 1.6s ease-in-out infinite;
          }

          /* ACTIONS */
          .actions { display: flex; gap: 10px; margin-top: 14px; }
          .btn-analyze {
            flex: 1; padding: 14px; border-radius: var(--radius-sm);
            background: var(--accent); color: #080a0c;
            font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
            letter-spacing: 0.05em; transition: all 0.2s;
            display: flex; align-items: center; justify-content: center; gap: 8px;
          }
          .btn-analyze:hover:not(:disabled) { background: #e5ba6a; transform: translateY(-1px); }
          .btn-analyze:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
          .btn-reset {
            width: 48px; height: 48px; border-radius: var(--radius-sm);
            border: 1.5px solid var(--border2); color: var(--text3);
            display: flex; align-items: center; justify-content: center;
            font-size: 16px; transition: all 0.2s;
          }
          .btn-reset:hover { border-color: var(--border2); color: var(--text); background: var(--bg2); }

          /* ERROR */
          .error-box {
            margin-top: 12px; padding: 12px 14px; border-radius: var(--radius-sm);
            background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2);
            font-size: 13px; color: #fca5a5; line-height: 1.5;
          }

          /* RESULTS */
          .results { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; }

          /* CARD */
          .card {
            background: var(--bg1); border: 1px solid var(--border);
            border-radius: var(--radius); padding: 18px;
            transition: border-color 0.2s;
          }
          .card-label {
            font-size: 10px; font-weight: 600; letter-spacing: 0.12em;
            color: var(--text3); text-transform: uppercase; margin-bottom: 12px;
          }

          /* STONE ID CARD */
          .stone-name {
            font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700;
            color: var(--text); margin-bottom: 4px; line-height: 1.2;
          }
          .stone-sub { font-size: 13px; color: var(--text2); margin-bottom: 14px; }
          .tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
          .tag {
            font-size: 11px; padding: 4px 10px; border-radius: 6px;
            border: 1px solid var(--border2); color: var(--text2);
            font-weight: 500; letter-spacing: 0.04em;
          }
          .tag.accent { border-color: var(--accent-ring); color: var(--accent); background: var(--accent-dim); }

          /* CONFIDENCE BAR */
          .conf-wrap { margin-bottom: 8px; }
          .conf-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
          .conf-label { font-size: 12px; color: var(--text2); }
          .conf-val { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; }
          .conf-track {
            height: 4px; background: var(--bg2); border-radius: 2px; overflow: hidden;
          }
          .conf-fill {
            height: 100%; border-radius: 2px;
            transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
          }
          .conf-note { font-size: 12px; color: var(--text3); margin-top: 8px; line-height: 1.5; font-style: italic; }

          /* ALTERNATIVES */
          .alts { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); }
          .alts-label { font-size: 10px; color: var(--text3); letter-spacing: 0.1em; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
          .alt-item { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
          .alt-name { font-size: 12px; color: var(--text2); flex: 1; }
          .alt-prob { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; }
          .alt-reason { font-size: 11px; color: var(--text3); font-style: italic; flex: 2; line-height: 1.4; }

          /* GRADE CARD */
          .grade-card {
            display: flex; justify-content: space-between; align-items: center;
          }
          .grade-info {}
          .grade-badge {
            font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
            letter-spacing: 0.04em; margin-bottom: 4px;
          }
          .grade-desc { font-size: 12px; color: var(--text2); line-height: 1.5; max-width: 240px; }
          .grade-letter {
            font-family: 'Syne', sans-serif; font-size: 72px; font-weight: 800;
            opacity: 0.12; line-height: 1;
          }

          /* REC CARD */
          .rec-row { display: flex; align-items: center; justify-content: space-between; }
          .rec-label { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 0.04em; }
          .rec-discount { font-size: 13px; color: #fbbf24; font-weight: 600; }
          .apps-wrap { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
          .apps-label { font-size: 10px; color: var(--text3); letter-spacing: 0.1em; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
          .app-chips { display: flex; flex-wrap: wrap; gap: 6px; }
          .app-chip {
            font-size: 11px; padding: 4px 10px; border-radius: 6px;
            border: 1px solid var(--border2); color: var(--text2); background: var(--bg2);
          }
          .no-app-chip {
            font-size: 11px; padding: 4px 10px; border-radius: 6px;
            border: 1px solid rgba(248,113,113,0.2); color: rgba(248,113,113,0.7);
          }

          /* DEFECTS */
          .no-defects {
            display: flex; align-items: center; gap: 8px;
            font-size: 13px; color: #4ade80; font-weight: 500;
          }
          .defect-item {
            padding: 12px; background: var(--bg2); border-radius: var(--radius-sm);
            margin-bottom: 8px; border: 1px solid var(--border);
          }
          .defect-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
          .defect-name { font-size: 12px; font-weight: 600; color: var(--text); letter-spacing: 0.04em; }
          .defect-sev {
            font-size: 10px; padding: 2px 7px; border-radius: 4px;
            border: 1px solid currentColor; font-weight: 600; letter-spacing: 0.06em;
            opacity: 0.85;
          }
          .defect-meta { font-size: 11px; color: var(--text3); margin-bottom: 4px; }
          .defect-desc { font-size: 12px; color: var(--text2); line-height: 1.5; }
          .repair-badge {
            display: inline-flex; align-items: center; gap: 4px;
            font-size: 10px; margin-top: 6px; font-weight: 500;
          }

          /* NATURAL FEATURES */
          .nat-item { display: flex; gap: 8px; margin-bottom: 6px; }
          .nat-check { color: #4ade80; font-size: 13px; flex-shrink: 0; margin-top: 1px; }
          .nat-text { font-size: 12px; color: var(--text2); line-height: 1.5; }

          /* QUALITY GRID */
          .qual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .qual-item {}
          .qual-label { font-size: 10px; color: var(--text3); letter-spacing: 0.08em; font-weight: 600; text-transform: uppercase; margin-bottom: 6px; }
          .qual-dots { display: flex; gap: 4px; }
          .qual-dot {
            flex: 1; height: 4px; border-radius: 2px;
            background: var(--bg2); transition: background 0.3s;
          }
          .qual-dot.active { }

          /* NOTES */
          .notes-text { font-size: 13px; color: var(--text2); line-height: 1.8; }

          /* CARE */
          .care-text { font-size: 12px; color: var(--text2); line-height: 1.7; }

          /* FOOTER */
          .footer {
            padding: 16px 24px; border-top: 1px solid var(--border);
            display: flex; justify-content: space-between; align-items: center;
          }
          .footer-left { font-size: 11px; color: var(--text3); font-family: 'Syne', sans-serif; font-weight: 600; }
          .footer-right { font-size: 11px; color: var(--text3); }

          /* LOADING STATE */
          .loading-state {
            display: flex; flex-direction: column; align-items: center;
            justify-content: center; gap: 16px; padding: 48px 24px; text-align: center;
          }
          .loading-ring {
            width: 48px; height: 48px; border-radius: 50%;
            border: 3px solid var(--bg2); border-top-color: var(--accent);
          }
          .loading-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: var(--text); }
          .loading-sub { font-size: 13px; color: var(--text3); }

          /* RESPONSIVE */
          @media (min-width: 640px) {
            .main { padding: 32px 24px; }
          }
        `}</style>

        {/* HEADER */}
        <header className="header">
          <div className="logo">Stone<span>AI</span></div>
          <div className="status">
            <div className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} />
            AI AKTIV
          </div>
        </header>

        {/* MAIN */}
        <main className="main">

          {/* Upload zone */}
          <div
            className={`upload-area${drag ? " drag" : ""}`}
            onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onClick={() => !preview && inputRef.current?.click()}
          >
            {loading && preview && <div className="scan-line" />}
            {preview
              ? <img src={preview} alt="" className="upload-img" />
              : (
                <div className="upload-empty">
                  <div className="upload-icon-wrap">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4a853" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                  </div>
                  <div>
                    <div className="upload-title">Ngarko foton e gurit</div>
                    <div className="upload-sub">Çdo lloj guri natyror ose artificial<br/>Ndriçim i mirë, sfond neutral</div>
                  </div>
                  <div className="upload-formats">
                    {["JPG","PNG","WEBP"].map(f => <span key={f} className="fmt-tag">{f}</span>)}
                  </div>
                </div>
              )}
          </div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => handleFile(e.target.files[0])} />

          {/* Actions */}
          {preview && phase !== "analyzing" && (
            <div className="actions">
              <button className="btn-analyze" onClick={analyze} disabled={loading}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                ANALIZО GURIN
              </button>
              <button className="btn-reset" onClick={reset}>✕</button>
            </div>
          )}

          {error && <div className="error-box">⚠ {error}</div>}

          {/* Loading */}
          {loading && (
            <div className="loading-state scalein">
              <div className="loading-ring spin" />
              <div>
                <div className="loading-title">Duke analizuar...</div>
                <div className="loading-sub">GPT-4o Vision po inspekton gurin</div>
              </div>
            </div>
          )}

          {/* RESULTS */}
          {result && !loading && (
            <div className="results fadeup">

              {/* Stone ID */}
              <div className="card">
                <div className="card-label">Lloji i gurit</div>
                <div className="stone-name">{result.stone_type_name}</div>
                <div className="stone-sub">{result.color_description}</div>
                <div className="tags">
                  <span className="tag accent">{result.finish_name}</span>
                  {result.catalog_match_name && <span className="tag accent">{result.catalog_match_name}</span>}
                  {result.stone_type_id && <span className="tag">{STONE_TYPES[result.stone_type_id]?.hardness_mohs ? `Mohs ${STONE_TYPES[result.stone_type_id].hardness_mohs}` : ""}</span>}
                </div>
                {/* Confidence */}
                <div className="conf-wrap">
                  <div className="conf-row">
                    <span className="conf-label">Sigurim identifikimi</span>
                    <span className="conf-val" style={{ color: result.stone_confidence >= 80 ? "#4ade80" : result.stone_confidence >= 60 ? "#fbbf24" : "#f87171" }}>{result.stone_confidence}%</span>
                  </div>
                  <div className="conf-track">
                    <div className="conf-fill" style={{ width: `${result.stone_confidence}%`, background: result.stone_confidence >= 80 ? "#4ade80" : result.stone_confidence >= 60 ? "#fbbf24" : "#f87171" }} />
                  </div>
                  {result.stone_confidence_reason && <div className="conf-note">{result.stone_confidence_reason}</div>}
                </div>
                {/* Alternatives */}
                {result.similar_stones?.length > 0 && (
                  <div className="alts">
                    <div className="alts-label">Mundësi alternative</div>
                    {result.similar_stones.map((s, i) => (
                      <div key={i} className="alt-item">
                        <span className="alt-name">{s.stone}</span>
                        <span className="alt-prob" style={{ color: "var(--accent)" }}>{s.probability}%</span>
                        <span className="alt-reason">{s.reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Grade */}
              {result.grade && gs && (
                <div className="card" style={{ borderColor: gs.ring, background: `linear-gradient(135deg, var(--bg1), ${gs.dim})` }}>
                  <div className="card-label">Gradimi NSI</div>
                  <div className="grade-card">
                    <div className="grade-info">
                      <div className="grade-badge" style={{ color: gs.accent }}>{GRADES[result.grade]?.name}</div>
                      <div className="grade-desc">{result.grade_reasoning}</div>
                    </div>
                    <div className="grade-letter" style={{ color: gs.accent }}>{result.grade}</div>
                  </div>
                </div>
              )}

              {/* Recommendation */}
              {rs && (
                <div className="card">
                  <div className="card-label">Rekomandimi</div>
                  <div className="rec-row">
                    <div className="rec-label" style={{ color: rs.color }}>{rs.icon} {rs.label}</div>
                    {result.discount_percent > 0 && <div className="rec-discount">-{result.discount_percent}%</div>}
                  </div>
                  {result.recommended_applications?.length > 0 && (
                    <div className="apps-wrap">
                      <div className="apps-label">Aplikime të rekomanduara</div>
                      <div className="app-chips">
                        {result.recommended_applications.map((a, i) => <span key={i} className="app-chip">{a}</span>)}
                      </div>
                    </div>
                  )}
                  {result.not_recommended_for?.length > 0 && (
                    <div className="apps-wrap">
                      <div className="apps-label">Mos përdor për</div>
                      <div className="app-chips">
                        {result.not_recommended_for.map((a, i) => <span key={i} className="no-app-chip">{a}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Defects */}
              <div className="card">
                <div className="card-label">Defektet — {result.defects?.length ?? 0} të gjetur</div>
                {!result.defects?.length
                  ? <div className="no-defects"><span>✓</span> Asnjë defekt i dukshëm</div>
                  : result.defects.map((d, i) => (
                    <div key={i} className="defect-item">
                      <div className="defect-header">
                        <div className="defect-name">{d.name || d.id}</div>
                        <div className="defect-sev" style={{ color: SEV_STYLE[d.severity] || SEV_STYLE.minor }}>{(d.severity||"").toUpperCase()}</div>
                      </div>
                      {d.location && <div className="defect-meta">📍 {d.location}{d.size ? ` · ${d.size}` : ""}</div>}
                      <div className="defect-desc">{d.description}</div>
                      {d.repairable !== undefined && (
                        <div className="repair-badge" style={{ color: d.repairable ? "#4ade80" : "#f87171" }}>
                          {d.repairable ? "✓ Reparueshëm" : "✕ Jo reparueshëm"}
                        </div>
                      )}
                    </div>
                  ))
                }
              </div>

              {/* Natural features */}
              {result.natural_features?.length > 0 && (
                <div className="card">
                  <div className="card-label">Karakteristika natyrore</div>
                  {result.natural_features.map((f, i) => (
                    <div key={i} className="nat-item">
                      <span className="nat-check">✓</span>
                      <span className="nat-text">{f}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quality metrics */}
              <div className="card">
                <div className="card-label">Metrikat</div>
                <div className="qual-grid">
                  {[
                    ["Sipërfaqja", result.surface_quality],
                    ["Struktura", result.structural_integrity],
                  ].map(([label, val]) => {
                    const levels = ["poor","fair","good","excellent"];
                    const idx = levels.indexOf(val);
                    const colors = ["#f87171","#fb923c","#fbbf24","#4ade80"];
                    return (
                      <div key={label} className="qual-item">
                        <div className="qual-label">{label}</div>
                        <div className="qual-dots">
                          {levels.map((l, i) => (
                            <div key={l} className={`qual-dot${i <= idx ? " active" : ""}`}
                              style={{ background: i <= idx ? colors[idx] : undefined }} />
                          ))}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4, textTransform: "capitalize" }}>{val}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes + Care */}
              {(result.analysis_notes || result.care_instructions) && (
                <div className="card">
                  {result.analysis_notes && (
                    <>
                      <div className="card-label">Vlerësimi</div>
                      <div className="notes-text" style={{ marginBottom: result.care_instructions ? 14 : 0 }}>{result.analysis_notes}</div>
                    </>
                  )}
                  {result.care_instructions && (
                    <>
                      <div className="card-label" style={{ marginTop: result.analysis_notes ? 14 : 0 }}>Kujdesi</div>
                      <div className="care-text">{result.care_instructions}</div>
                    </>
                  )}
                </div>
              )}

              {/* Analyze another */}
              <button onClick={reset} style={{
                width: "100%", padding: "14px", borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--border2)", color: "var(--text2)",
                fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600,
                letterSpacing: "0.05em", marginTop: 4,
                transition: "all 0.2s", background: "transparent",
              }}
                onMouseOver={e => e.target.style.borderColor = "var(--accent)"}
                onMouseOut={e => e.target.style.borderColor = "var(--border2)"}
              >
                + ANALIZО GUR TJETËR
              </button>
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-left">StoneAI v1.0</div>
          <div className="footer-right">NSI Grade A–D · GPT-4o</div>
        </footer>
      </div>
    </>
  );
}