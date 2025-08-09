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

app.use(cors());
app.use(express.json({ limit: "25mb" }));

app.use("/ask", askRoute);
app.use("/analyze", analyzeRoute);
app.use("/generate-pdf", generatePdfRoute);
app.use("/history", historyRoute);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(port, () => console.log(`✅ Nexalicit API http://localhost:${port}`));