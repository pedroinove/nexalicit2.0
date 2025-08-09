// UPDATE - path: src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import askRoute from "./routes/ask.js";
import analyzeRoute from "./routes/analyze.js";
import generatePdfRoute from "./routes/generatePdf.js";
import historyRoute from "./routes/history.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Domínios autorizados (adicione outros se precisar)
const allowedOrigins = [
  process.env.CORS_ORIGIN,                   // ex.: https://famous-cactus-59b8f9.netlify.app
  "https://famous-cactus-59b8f9.netlify.app"
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // permite requests de ferramentas/health
      return allowedOrigins.includes(origin)
        ? cb(null, true)
        : cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST"],
    credentials: true
  })
);

app.use(express.json({ limit: "25mb" }));

// Rotas
app.use("/ask", askRoute);
app.use("/analyze", analyzeRoute);
app.use("/generate-pdf", generatePdfRoute);
app.use("/history", historyRoute);

// Health & raiz
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.send("🚀 Nexalicit API online"));

// 404
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// Handler de erro
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err?.message || err);
  res.status(500).json({ error: "Erro interno" });
});

// Boot
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Nexalicit API running on port ${port}`);
});