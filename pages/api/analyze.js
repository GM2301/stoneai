// pages/api/analyze.js
import OpenAI from "openai";
import { STONE_TYPES, FINISHES, DEFECTS, GRADES, buildUniversalPrompt } from "../../lib/stoneKnowledge";

export const config = { api: { bodyParser: { sizeLimit: "15mb" } } };

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  
  const { imageBase64, customCatalog = [] } = req.body;
let { mediaType } = req.body;
if (!mediaType || !["image/jpeg","image/png","image/webp","image/gif"].includes(mediaType)) mediaType = "image/jpeg";
  // Normalize media type — iPhone dërgon HEIC, OpenAI nuk e pranon
  const allowed = ["image/jpeg","image/png","image/webp","image/gif"];
  if (!mediaType || !allowed.includes(mediaType)) mediaType = "image/jpeg";

  const { stoneTypesList, finishList, defectList, gradeList, catalogSection } = buildUniversalPrompt(customCatalog);

  const systemPrompt = `Ti je StoneAI — sistemi më i avancuar i analizës vizuale të gurit natyror dhe artificial në botë.

Ke njohuri enciklopedike të:
- Gjeologjisë dhe mineralogji të gurit natyror
- Standardeve ndërkombëtare (NSI, ASTM C503, EN 12058, ISO 9001)
- Të gjitha llojet e finisheve dhe si ndikojnë pamjen
- Defekteve dhe dallimit të tyre nga karakteristikat natyrore
- Aplikimeve arkitekturore dhe kufizimeve të secilit grade

RREGULLË FONDAMENTALE — DEFEKTET vs KARAKTERISTIKAT NATYRORE:
Karakteristikat natyrore NUK janë defekte. Gabimi më i zakonshëm është të klasifikosh si defekt:
- Fissure stabile (≠ crack)
- Vija dhe venjet natyrore
- Inkluzionet minerale (pika, njolla natyrore brenda gurit)
- Fosile në gëlqeror/travertin
- Gurëzat në terrazzo/ceppo
- Variacioni i patternit brenda së njëjtës copë
- Vrimat natyrore të travertinit (kur nuk janë mbushur)

CRACK vs FISSURE — dallim kritik:
• Crack: ndarja e plotë strukturore — gishti futet, copa mund të thyhet. REFUZO.
• Fissure: ndarje interkristaline natyrore — stabile, s'rritet. GRADE B normal.`;

  const userPrompt = `Analizoi me saktësi maksimale foton e këtij guri/mermeri.

LLOJET E GURIT QË NJOH:
${stoneTypesList}

LLOJET E FINISHEVE:
${finishList}

TAXONOMIA E DEFEKTEVE (STRIK — mos shto defekte që nuk janë):
${defectList}

SISTEMI I GRADIMIT (NSI Standard):
${gradeList}
${catalogSection}

INSTRUKSIONE SPECIFIKE:
1. Identifiko llojin e gurit bazuar në karakteristikat vizuale
2. Identifiko finishin
3. Nëse kompania ka katalog, kërko matching me katalogun e tyre
4. Detekto VETËM defekte reale — mos i ngatërroni me karakteristikat natyrore
5. Jep grade sipas NSI
6. Jep aplikime të rekomanduara bazuar në grade dhe tip guri
7. Nëse foto është e dobët, thuaje — mos bëj supozime

KTHE VETËM JSON valid (zero tekst tjetër, zero markdown):
{
  "stone_type_id": "marble",
  "stone_type_name": "Mermer (Marble)",
  "catalog_match": null,
  "catalog_match_name": null,
  "catalog_confidence": 0,
  "finish_id": "polished",
  "finish_name": "Polished",
  "color_description": "E bardhë me vija gri të çelëta diagonale",
  "pattern_description": "Vijëzim linear diagonal, ton i ftohtë",
  "stone_confidence": 88,
  "stone_confidence_reason": "Vijëzimi linear diagonal dhe shkëlqimi i lartë sugjerojnë mermer të lëmuar",
  "similar_stones": [
    {"stone": "Quartzite", "probability": 8, "reason": "Ngjason por mungon translucency"}
  ],
  "grade": "A",
  "grade_reasoning": "Sipërfaqe uniforme, zero defekte strukturore, vijëzim natyror i pastër",
  "defects": [
    {
      "id": "scratch",
      "name": "Grithurë",
      "severity": "minor",
      "repairable": true,
      "location": "Çereku i sipërm djathtas",
      "size": "~4cm lineare",
      "description": "Grithurë e hollë sipërfaqësore — nuk prek strukturën"
    }
  ],
  "defect_count": 0,
  "natural_features": ["Vijët gri diagonale janë karakteristikë natyrore e mermerit"],
  "surface_quality": "excellent",
  "structural_integrity": "excellent",
  "recommendation": "approve",
  "discount_percent": 0,
  "recommended_applications": ["Countertop premium", "Feature wall", "Dysheme trafik mesatar"],
  "not_recommended_for": [],
  "care_instructions": "Mbro nga acidet (limoni, uthull). Sealant çdo 1-2 vjet.",
  "photo_quality": "good",
  "lighting": "adequate",
  "analysis_confidence": "high",
  "analysis_notes": "Vlerësim i shkurtër profesional 1-2 fjali."
}

recommendation: "approve" | "approve_with_discount" | "reject"
surface_quality / structural_integrity: "excellent" | "good" | "fair" | "poor"
severity: "minor" | "moderate" | "major" | "critical"
analysis_confidence: "high" | "medium" | "low"`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 2000,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mediaType || "image/jpeg"};base64,${imageBase64}`, detail: "high" } },
            { type: "text", text: userPrompt },
          ],
        },
      ],
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("No JSON:", raw.slice(0, 200));
      return res.status(500).json({ error: "Format i gabuar nga AI" });
    }

    const result = JSON.parse(match[0]);

    // Enrich with knowledge base data
    const stoneData = STONE_TYPES[result.stone_type_id];
    const gradeData = GRADES[result.grade];
    const finishData = FINISHES[result.finish_id];

    if (stoneData) {
      result._stone_info = {
        hardness: stoneData.hardness_mohs,
        care_notes: stoneData.care_notes,
        typical_defects: stoneData.typical_defects,
      };
    }
    if (gradeData) {
      result._grade_info = {
        color: gradeData.color,
        structural: gradeData.structural,
        nsi: gradeData.nsi_description,
      };
    }
    if (finishData) {
      result._finish_info = {
        shine: finishData.shine_level,
        pros: finishData.pros,
        cons: finishData.cons,
      };
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Analiza dështoi", detail: err.message });
  }
}