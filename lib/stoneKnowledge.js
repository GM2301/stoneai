// lib/stoneKnowledge.js
// ─────────────────────────────────────────────────────────────────────
// StoneAI — Universal Stone Knowledge Base
// Covers: Marble, Granite, Limestone, Travertine, Quartzite, Onyx,
//         Sandstone, Slate, Basalt, Terrazzo, Engineered Stone
// Standards: NSI, ASTM C503, EN 12058, ISO 9001
// ─────────────────────────────────────────────────────────────────────

// ── STONE TYPES ───────────────────────────────────────────────────────
export const STONE_TYPES = {
  marble: {
    name: "Mermer (Marble)",
    origin: "Metamorfik — gëlqeror i transformuar nga nxehtësia dhe presioni",
    hardness_mohs: "3–4",
    characteristics: "Vijet karakteristike, sipërfaqe e lëmuar, absorbon lagështinë",
    common_finishes: ["polished", "honed", "brushed", "sandblasted", "leathered"],
    typical_defects: ["crack", "fissure", "scratch", "stain", "chip", "pit", "etch"],
    use_cases: ["Countertop", "Dysheme", "Mure", "Banje", "Fasada"],
    care_notes: "Poroz — duhet mbrojtur nga acidet dhe lagështia",
    visual_ids: "Vija nga mineralet (calcit, dolomit). Shumëllojshmëri e madhe ngjyrash.",
  },
  granite: {
    name: "Granit (Granite)",
    origin: "Magmatik — formuar nga ftohja e ngadaltë e magmës",
    hardness_mohs: "6–7",
    characteristics: "Shumë i fortë, rezistent ndaj gërvishtes, granulair",
    common_finishes: ["polished", "honed", "flamed", "brushed", "sandblasted"],
    typical_defects: ["crack", "fissure", "stain", "chip", "inclusion", "color_var"],
    use_cases: ["Countertop", "Dysheme trafik intensiv", "Outdoor", "Shkallë", "Fasada"],
    care_notes: "Shumë rezistent — ideal për ambiente me trafik të lartë",
    visual_ids: "Kristale të dukshme të feldspatit, quarcit, mikës. Pa vija lineare.",
  },
  limestone: {
    name: "Gëlqeror (Limestone)",
    origin: "Sedimentar — formuar nga depozitat e kalcitit në ujë",
    hardness_mohs: "3–4",
    characteristics: "I butë, poroz, shpesh me fosile, ngjyra neutrale",
    common_finishes: ["honed", "brushed", "sandblasted", "tumbled"],
    typical_defects: ["pit", "fossil_void", "stain", "scratch", "chip", "erosion"],
    use_cases: ["Dysheme", "Mure", "Outdoor", "Ambient rustik"],
    care_notes: "Shumë poroz — mbrojtja me sealant është e domosdoshme",
    visual_ids: "Ngjyrë beige/krem, shpesh me fosile, teksturë granulare e imët.",
  },
  travertine: {
    name: "Travertin (Travertine)",
    origin: "Sedimentar — depozita kalciumi nga ujërat termale",
    hardness_mohs: "3–4",
    characteristics: "Vrimat (pore) janë karakteristike — mund të mbushen ose lihen",
    common_finishes: ["polished", "honed", "brushed", "unfilled"],
    typical_defects: ["void_unfilled", "crack", "stain", "chip", "erosion"],
    use_cases: ["Dysheme", "Banje", "Pool surroundings", "Outdoor"],
    care_notes: "Vrimat natyrore mbushen gjatë procesimit — normale",
    visual_ids: "Vrima dhe kanalele karakteristike, ngjyrë beige/krem/marron.",
  },
  quartzite: {
    name: "Kuarcit (Quartzite)",
    origin: "Metamorfik — rëre e transformuar nga presioni",
    hardness_mohs: "7",
    characteristics: "Shumë i fortë, shpesh ngatërrohet me mermerin — por shumë më rezistent",
    common_finishes: ["polished", "honed", "brushed", "leathered"],
    typical_defects: ["crack", "chip", "stain", "fissure"],
    use_cases: ["Countertop premium", "Dysheme trafik intensiv", "Outdoor"],
    care_notes: "Rezistent ndaj acideve — ideal si alternativë e mermerit",
    visual_ids: "Sipërfaqe e shtresuar, shpesh me glitter natyror, vija të subtile.",
  },
  onyx: {
    name: "Onyx (Onyx)",
    origin: "Sedimentar — formuar nga depozitat e kalcitit nga uji i rrjedhshëm",
    hardness_mohs: "3–4",
    characteristics: "Translucent — transmeton dritën. Shumë dekorativ por i brishtë.",
    common_finishes: ["polished"],
    typical_defects: ["crack", "chip", "stain", "scratch", "fissure"],
    use_cases: ["Backlit walls", "Bar countertop", "Dekor ekskluzivist"],
    care_notes: "Shumë i brishtë — kërkon trajtim me kujdes të veçantë",
    visual_ids: "Semi-transparent, vija koncentrike, ngjyra të gjalla (gjelbër, portokalli, mjaltë).",
  },
  sandstone: {
    name: "Rëregor (Sandstone)",
    origin: "Sedimentar — grantha e konsoliduar",
    hardness_mohs: "6–7",
    characteristics: "Poroz, teksturë granulare e dukshme, ngjyra tokësore",
    common_finishes: ["natural", "sawn", "sandblasted", "brushed"],
    typical_defects: ["erosion", "stain", "crack", "delamination", "color_var"],
    use_cases: ["Outdoor paving", "Fasada", "Shkallë", "Ambient rustik"],
    care_notes: "Poroz — nevojitet impregnim i rregullt",
    visual_ids: "Granula të dukshme rëre, ngjyra të ngrohta (beige, kafe, rozë).",
  },
  slate: {
    name: "Argjil guri (Slate)",
    origin: "Metamorfik — argjil i transformuar",
    hardness_mohs: "3–4",
    characteristics: "Shtresat e dukshme, shumë rezistent ndaj ujit, sipërfaqe e ashpër",
    common_finishes: ["natural_cleft", "honed", "gauged"],
    typical_defects: ["delamination", "chip", "crack", "color_var"],
    use_cases: ["Çati", "Dysheme outdoor", "Mure", "Pool surroundings"],
    care_notes: "Shtresat mund të ndahen — verifikimi i grosit është i rëndësishëm",
    visual_ids: "Sipërfaqe e shtresuar me plan të qartë, ngjyrë gri-blu-gjelbër.",
  },
  terrazzo: {
    name: "Terrazzo (Terrazzo natyror ose artificial)",
    origin: "Kompozit — gurëza/çakëll të ngulitur në matricë çimentoje ose guri",
    hardness_mohs: "varies",
    characteristics: "Gurëza të dukshme në matricë, shumë i qëndrueshëm, lehtë i restaurueshëm",
    common_finishes: ["polished", "honed", "ground"],
    typical_defects: ["missing_chip", "crack_matrix", "stain", "pit", "color_var"],
    use_cases: ["Dysheme institucionale", "Ambiente publike", "Hotele", "Shkolla"],
    care_notes: "Mund të restorohet duke u polisur — avantazh i madh",
    visual_ids: "Gurëza të dukshme të shpërndara në matricë uniforme.",
  },
  engineered: {
    name: "Gur artificial (Engineered Stone / Quartz)",
    origin: "Artificial — 90-95% quarcit natyror + rezinë poliestere",
    hardness_mohs: "7",
    characteristics: "Konsistent, pa porë, rezistent ndaj njollave",
    common_finishes: ["polished", "honed", "matte"],
    typical_defects: ["crack", "chip", "scratch", "resin_bubble", "color_batch_var"],
    use_cases: ["Countertop kuzhinë", "Banje", "Commercial surfaces"],
    care_notes: "Pa porë — nuk kërkon sealant. Nuk toleron nxehtësinë e lartë.",
    visual_ids: "Sipërfaqe shumë uniforme, pa vija natyrore (ose vija shumë të rregullta).",
  },
};

// ── FINISH TYPES ──────────────────────────────────────────────────────
export const FINISHES = {
  polished: {
    name: "Polished (i lëmuar me shkëlqim)",
    description: "Sipërfaqe shumë e lëmuar me shkëlqim të lartë si pasqyrë",
    shine_level: 10,
    texture: "E lëmuar komplet",
    visual: "Reflekton dritën, vija të gurit duken shumë qartë",
    pros: "Duket luksoze, vija dhe ngjyrat vibrant",
    cons: "Tregon njollat dhe grithurat lehtë",
  },
  honed: {
    name: "Honed (mat i lëmuar)",
    description: "Sipërfaqe e lëmuar por pa shkëlqim — mat uniforme",
    shine_level: 2,
    texture: "E lëmuar por mat — nuk ndjehet granulare",
    visual: "Absorbon dritën, ngjyra duket pak më e zbehur",
    pros: "Fsheh grithurat, pamje moderne",
    cons: "Njollat thithen më shpejt se polished",
  },
  brushed: {
    name: "Brushed (i fërkuar me furçë)",
    description: "Sipërfaqe gjysëm-mat me linja të buta brushing",
    shine_level: 3,
    texture: "E lëmuar me linja të buta të dukshme",
    visual: "Mes polished dhe honed, karakter industrial i butë",
    pros: "Fsheh defektet e vogla, pamje moderne",
    cons: "Linjat e brushing mund të grumbullojnë pluhur",
  },
  sandblasted: {
    name: "Sandblasted (sandblasted)",
    description: "Sipërfaqe granulare e ashpër — nga shpërthimi me rëre nën presion",
    shine_level: 0,
    texture: "E ashpër granulare — ndjehet me dorë qartë",
    visual: "Shpërndan dritën, efekt mat 'rough'",
    pros: "Shumë anti-rrëshqitëse, ideal outdoor",
    cons: "Grumbullon pluhur, kërkon pastrirm",
  },
  leathered: {
    name: "Leathered (leather finish)",
    description: "Sipërfaqe me teksturë organike si lëkurë — pak e ashpër",
    shine_level: 1,
    texture: "Teksturë organike e butë",
    visual: "Ngjyrë e thellë, teksturë ndjellëse",
    pros: "Fsheh njollat dhe grithurat, duket premium",
    cons: "Kosto e lartë procesimi",
  },
  flamed: {
    name: "Flamed (i djegur)",
    description: "Sipërfaqe e trajtuar me flakë — krijon teksturë të ashpër",
    shine_level: 0,
    texture: "E ashpër, kristalet e shplasur",
    visual: "Ngjyrë e çelur nga nxehtësia, teksturë dramatike",
    pros: "Shumë anti-rrëshqitëse, ideal outdoor",
    cons: "Fsheh ngjyrat natyrore të gurit",
  },
};

// ── DEFECT TAXONOMY (industria ndërkombëtare) ─────────────────────────
export const DEFECTS = {
  // STRUKTURORE — rrezik integritetit
  crack: {
    name: "Çarje strukturore",
    severity: "critical",
    repairable: false,
    description: "Ndarja e plotë e materialit përmes grosit",
    distinction: "Gishti futet brenda — nëse jo, mund të jetë fissure",
    impact: "Rrezik thyerjeje — copë duhet refuzuar ose zëvendësuar",
    repair_note: "Epoksi/rezinë mund të konsolidojë por shenja mbetet",
  },
  fissure: {
    name: "Fissure natyrore",
    severity: "minor",
    repairable: true,
    description: "Ndarje interkristaline natyrore stabile — NUK është crack",
    distinction: "Stabile, nuk vazhdon të rritet. Shumë mermere kanë fissure natyrore.",
    impact: "Asnjë — stabile. Vetëm estetike.",
    repair_note: "Rezinë transparente mund ta mbushë",
  },
  scratch: {
    name: "Grithurë",
    severity: "minor",
    repairable: true,
    description: "Dëmtim linear sipërfaqësor — nuk prek strukturën",
    distinction: "Linja e hollë mbi sipërfaqe — pa thellësi strukturore",
    impact: "Estetik — mund të ripolishohet",
    repair_note: "Ripolishim lokal ose i plotë",
  },
  chip: {
    name: "Çip / Thyerje skaji",
    severity: "moderate",
    repairable: true,
    description: "Copë e humbur nga skaji ose sipërfaqja e copës",
    distinction: "Zonja ku materiali mungon fizikisht",
    impact: "Estetik dhe strukturor — varet nga madhësia",
    repair_note: "Mbushje me epoksi të ngjyer",
  },
  pit: {
    name: "Gropëz / Pit",
    severity: "minor",
    repairable: true,
    description: "Hapje e vogël natyrore ose nga procesimi",
    distinction: "E rrumbullakët ose ovale, e izoluar",
    impact: "Estetik, grumbullon pluhur",
    repair_note: "Mbushje me rezinë gjatë fabrikimit",
  },
  stain: {
    name: "Njollë",
    severity: "moderate",
    repairable: true,
    description: "Njollë ngjyrë jo natyrore — nga kontaminim kimik ose organik",
    distinction: "Zona me ngjyrë të ndryshme nga baza — jo karakteristikë e modelit",
    impact: "Estetik — zvogëlon vlerën",
    repair_note: "Pastrim kimik ose mbulim/ripolishim",
  },
  etch: {
    name: "Etch mark (dëmtim kimik)",
    severity: "minor",
    repairable: true,
    description: "Zona e dulur/matlur nga kontakti me acid (limoni, uthull)",
    distinction: "Zona mat mbi sipërfaqe polished — si njolla por mat jo ngjyrë",
    impact: "Estetik — humbje polishimi",
    repair_note: "Ripolishim lokal",
  },
  resin_patch: {
    name: "Njollë rezine",
    severity: "minor",
    repairable: false,
    description: "Zona e mbushur me rezinë gjatë fabrikimit — normale për Grade B/C",
    distinction: "Zona pak më e ndritur ose ndryshe nga rrjeti i gurit",
    impact: "Tregues Grade B/C — jo defekt kritik",
    repair_note: "Normale — pjesë e procesimit standard",
  },
  color_variation: {
    name: "Variacion ngjyre",
    severity: "minor",
    repairable: false,
    description: "Ndryshim toni ose ngjyre brenda copës ose midis copave",
    distinction: "Gradual ose i papritur — mund të jetë lot i ndryshëm",
    impact: "Problem me matching — slab-et nuk koordinohen",
    repair_note: "Zëvendësohet me slab nga e njëjta lot",
  },
  delamination: {
    name: "Shtresëzim",
    severity: "critical",
    repairable: false,
    description: "Shtresat natyrore të gurit po ndahen — shif slate dhe mica-rich marbles",
    distinction: "Sipërfaqja ngrihet ose ndahet në shtresa",
    impact: "Rrezik i lartë thyerjeje — refuzo",
    repair_note: "I pareparueshëm",
  },
  missing_chip: {
    name: "Çip i humbur (konglomerat)",
    severity: "moderate",
    repairable: true,
    description: "Gurëz ose gur i humbur nga Terrazzo ose Ceppo",
    distinction: "Hapje e formës së gurëzës — jo gropëz e rrumbullakët",
    impact: "Estetik dhe funksional",
    repair_note: "Mbushje me gurëz + rezinë ose llaq guri",
  },
  rust_stain: {
    name: "Njollë ndryshku",
    severity: "moderate",
    repairable: true,
    description: "Oksidim i mineraleve të hekurit brenda gurit — njollë e kuqe/kafe",
    distinction: "Ngjyrë portokalli-kafe, shpesh rreth kristaleve të hekurit",
    impact: "Estetik — rritet me kohë nëse nuk trajtohet",
    repair_note: "Produkte specialë chelating (acid oksalik)",
  },
  edge_damage: {
    name: "Dëmtim skaji",
    severity: "moderate",
    repairable: true,
    description: "Skaji i copës i dëmtuar, jo uniform ose i çipëzuar",
    distinction: "Profili i skajit ndryshon nga pritshmëria",
    impact: "Estetik dhe probleme instalimi",
    repair_note: "Reprofilim i skajit me makinë",
  },
};

// ── GRADE SYSTEM (NSI + ASTM C503 + EN 12058) ────────────────────────
export const GRADES = {
  A: {
    name: "Grade A — Premium",
    color: "#4ade80",
    description: "Strukturë e fortë uniforme. Defekte minimale ose zero. Pa mbushje rezine të dukshme. Ideal për çdo aplikim.",
    structural: "Excellent — zero fissure ose fissure të imëta stabile",
    resin_fill: "Jo ose i padukshëm",
    typical_discount: 0,
    applications: ["Countertop horizontal premium", "Dysheme trafik intensiv", "Fasada premium", "Feature wall"],
    nsi_description: "Sound marble with uniform and favorable working qualities",
  },
  B: {
    name: "Grade B — Standard",
    color: "#fbbf24",
    description: "Kualitet i mirë. Fissure natyrore stabile, mbushje rezine e lehtë e pranueshme. Aplikim i gjerë.",
    structural: "Good — fissure të vogla stabile OK",
    resin_fill: "I lehtë — normal",
    typical_discount: 10,
    applications: ["Mure vertikale", "Dysheme standard", "Banje", "Ambient rezidencial"],
    nsi_description: "Similar to A but with less favorable working qualities",
  },
  C: {
    name: "Grade C — Komerciale",
    color: "#fb923c",
    description: "Defekte të dukshme. Mbushje rezine e nevojshme. Aplikim selektiv.",
    structural: "Fair — fissure të dukshme, void-e të mbushura",
    resin_fill: "I dukshëm — i nevojshëm",
    typical_discount: 30,
    applications: ["Mure dekorative", "Projekte me buxhet", "Zona trafik minimal"],
    nsi_description: "Some variation in working qualities, geological flaws common",
  },
  D: {
    name: "Grade D — Dekorativ",
    color: "#f87171",
    description: "Defekte extensive. Vetëm aplikim dekorativ vertikal. Mbushje e gjerë.",
    structural: "Poor — fissure extensive, void-e të mëdha",
    resin_fill: "Extensive",
    typical_discount: 60,
    applications: ["Feature wall ekskluzivist (jo load-bearing)", "Ekspozita", "Showroom"],
    nsi_description: "Similar to C but larger proportion of natural faults",
  },
};

// ── AI ANALYSIS PROMPT BUILDER ─────────────────────────────────────────
export function buildUniversalPrompt(customCatalog = null) {
  const stoneTypesList = Object.entries(STONE_TYPES)
    .map(([id, s]) => `• ${s.name}: ${s.visual_ids} | Finishet: ${s.common_finishes.join(", ")}`)
    .join("\n");

  const finishList = Object.entries(FINISHES)
    .map(([id, f]) => `• ${f.name} (shkëlqim ${f.shine_level}/10): ${f.visual}`)
    .join("\n");

  const defectList = Object.entries(DEFECTS)
    .map(([id, d]) => `• ${id} — "${d.name}" [${d.severity}] ${d.repairable ? "✓ reparueshëm" : "✗ jo reparueshëm"}: ${d.description} | DALLIM: ${d.distinction}`)
    .join("\n");

  const gradeList = Object.entries(GRADES)
    .map(([g, data]) => `• Grade ${g}: ${data.description} | Zbritje tipike: ${data.typical_discount}%`)
    .join("\n");

  let catalogSection = "";
  if (customCatalog && customCatalog.length > 0) {
    catalogSection = `\n\nKATALOGU I KOMPANISË (prioritet — identifiko nga ky listë nëse mundësohet):\n` +
      customCatalog.map(m => `• ${m.name} (${m.series || ""}, ${m.finish || ""}): ${m.description || ""}`).join("\n");
  }

  return { stoneTypesList, finishList, defectList, gradeList, catalogSection };
}

export default { STONE_TYPES, FINISHES, DEFECTS, GRADES, buildUniversalPrompt };
