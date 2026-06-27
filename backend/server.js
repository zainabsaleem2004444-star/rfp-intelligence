// server.js
// Backend proxy for the RFP Intelligence app.
//
// Why this exists: the Gemini API key must never live in browser/frontend code.
// Anyone can open dev tools and read it out of page source or network requests
// if it's called from the browser directly. This server holds the key in an
// environment variable (.env, NOT committed to git) and the frontend calls
// THIS server instead of calling Google directly.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('\n[FATAL] GEMINI_API_KEY is not set.');
  console.error('Create a .env file in /backend (copy .env.example) and paste your key in.\n');
  process.exit(1);
}

// --- CORS ---
// In dev, allow your local frontend. In production, set FRONTEND_ORIGIN in .env
// to your deployed frontend's URL and lock this down (avoid '*').
const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin }));

app.use(express.json({ limit: '5mb' })); // RFP text can be long; allow a generous body size

// --- Basic rate limiting ---
// Protects your free Gemini quota from being burned by retries/abuse.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,                  // 30 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a few minutes and try again.' }
});
app.use('/api/', limiter);

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// --- Main analysis endpoint ---
// Frontend sends: { rfpText, strengths, gaps }
// We build the prompt server-side, call Gemini with the server-side key,
// and return the parsed JSON result to the frontend.
app.post('/api/analyze', async (req, res) => {
  try {
    const { rfpText, strengths, gaps } = req.body;

    if (!rfpText || typeof rfpText !== 'string' || rfpText.trim().length < 200) {
      return res.status(400).json({ error: 'rfpText is missing or too short. Upload a valid RFP document.' });
    }

    const prompt = buildPrompt(rfpText, strengths || '', gaps || '');
    const result = await callGemini(prompt);
    res.json(result);

  } catch (err) {
    console.error('Analysis error:', err.message);
    res.status(502).json({ error: err.message || 'Analysis failed. Please try again.' });
  }
});

function buildPrompt(rfpText, strengths, gaps) {
  const truncated = rfpText.length > 60000 ? rfpText.slice(0, 60000) + '\n\n[TRUNCATED]' : rfpText;
  return `You are a proposal/bid analyst. Analyze the following RFP document text and the company's stated capabilities. Return ONLY valid JSON, no markdown fences, no commentary, matching exactly this schema:

{
  "deliverables": [
    {"title": "string", "description": "string", "mandatory": true, "estimate_weeks": 2}
  ],
  "evaluation_criteria": [
    {"name": "string", "weight_percent": 35, "description": "string"}
  ],
  "compliance_departments": [
    {
      "department": "Legal" | "Accounting" | "Technical" | "Operations" | "Other",
      "items": [
        {"requirement": "string", "status": "met" | "gap" | "needs_review", "note": "short reason referencing the company's stated capabilities or gaps"}
      ]
    }
  ],
  "fit_score": 72,
  "recommendation": "GO" | "NO-GO" | "CAUTION",
  "recommendation_summary": "2-3 sentence summary of the recommendation",
  "key_reasons": ["short bullet reason 1", "short bullet reason 2", "short bullet reason 3"],
  "disqualifiers": ["any hard disqualifying requirement the company clearly fails, or empty array"]
}

Rules:
- fit_score is 0-100, reflecting how well the company's stated strengths match the RFP's requirements and how favorable the terms are, factoring in any gaps.
- "GO" generally means fit_score >= 70 and no unaddressed disqualifiers. "NO-GO" generally means fit_score < 40 or a clear disqualifier the company cannot meet. "CAUTION" is the middle ground.
- estimate_weeks should be a realistic effort/duration estimate per deliverable based on its described scope, not a guess of zero.
- Group compliance_departments to match the kinds of requirements actually present (legal/contractual terms -> Legal; payment/financial/insurance/cost terms -> Accounting; system/security/architecture terms -> Technical; project management/timeline/staffing terms -> Operations). Only include departments that have at least one relevant requirement in this RFP.
- Mark a compliance item "gap" only if the company's stated gaps text directly conflicts with or fails to meet that requirement. Mark "met" if their stated strengths clearly satisfy it. Use "needs_review" if it's unclear from what they told you.
- Be specific and reference actual language/numbers from the RFP (deadlines, dollar amounts, percentages, page limits) where relevant.
- Output strictly valid JSON. No trailing commas. No comments. No markdown code fences.

COMPANY STATED STRENGTHS:
${strengths || '(not provided)'}

COMPANY STATED GAPS / LIMITATIONS:
${gaps || '(not provided)'}

RFP DOCUMENT TEXT:
"""
${truncated}
"""`;
}

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!resp.ok) {
    const errText = await resp.text();
    let msg = `Gemini API error (HTTP ${resp.status})`;
    try {
      const j = JSON.parse(errText);
      msg = j.error?.message || msg;
    } catch (e) { /* ignore parse failure, use default msg */ }
    throw new Error(msg);
  }

  const json = await resp.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini. Try again.');

  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error('Gemini returned malformed JSON. Try analyzing again.');
  }
}

app.listen(PORT, () => {
  console.log(`RFP Intelligence backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
