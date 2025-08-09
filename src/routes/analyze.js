// UPDATE - path: src/routes/analyze.js
import express from "express";
import { client } from "../lib/openai.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { tipoDocumento = "CONTRATO", textoDocumento = "" } = req.body || {};
    if (!textoDocumento.trim()) return res.status(400).json({ error: "Texto do documento vazio" });

    const prompt = `
Você é especialista em compras públicas (Lei 14.133/2021).
Tipo: ${tipoDocumento}.
Analise o texto abaixo e aponte:
- riscos e cláusulas críticas
- base legal aplicável
- recomendações práticas de mitigação
- checklist de atenção rápida

Documento:
"""${textoDocumento}"""
`;

    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: "Faça a análise detalhada, em tópicos objetivos." },
      ],
    });

    const result = r.choices?.[0]?.message?.content?.trim() || "Sem análise.";
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno em /analyze" });
  }
});

export default router;