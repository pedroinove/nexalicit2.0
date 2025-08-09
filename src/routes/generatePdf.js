// UPDATE - path: src/routes/generatePdf.js
import express from "express";
import { generatePDF } from "../lib/pdf.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { content = "", fileName = "documento.pdf" } = req.body || {};
    if (!content.trim()) return res.status(400).json({ error: "Conteúdo vazio" });

    const buf = await generatePDF(content);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(buf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar PDF" });
  }
});

export default router;