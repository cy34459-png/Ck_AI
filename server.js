import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = Number(process.env.PORT || 8787);

if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY. Put it in backend/.env, never in the Android app.");
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN === "*" ? true : process.env.ALLOWED_ORIGIN,
  methods: ["POST", "GET"]
}));
app.use(express.json({ limit: "256kb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "CK Phase 2 backend" });
});

app.post("/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();
    const studyMode = Boolean(req.body?.studyMode);
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-12) : [];

    if (!message) return res.status(400).json({ error: "message is required" });
    if (message.length > 8000) return res.status(413).json({ error: "message too long" });

    const system = `
You are CK, a friendly and professional Android AI assistant.
Be clear, helpful and age-appropriate.
Never claim you verified current information unless a real web/search tool was used.
If you do not know a current fact, say so rather than inventing it.
${studyMode ? `
STUDY MODE:
The student is studying Class 10 in Delhi/CBSE-style school context.
Explain in simple exam-friendly language.
Prefer: definition -> key points -> example -> quick revision.
Do not help cheat in an active exam.
` : ""}
`;

    const input = [
      { role: "system", content: system },
      ...history
        .filter(x => x && (x.role === "user" || x.role === "assistant"))
        .map(x => ({ role: x.role, content: String(x.content || "").slice(0, 8000) })),
      { role: "user", content: message }
    ];

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input,
      max_output_tokens: 1200
    });

    res.json({
      ok: true,
      answer: response.output_text || "I couldn't generate a response.",
      response_id: response.id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "CK backend error" });
  }
});

app.listen(port, () => {
  console.log(`CK backend listening on http://localhost:${port}`);
});
