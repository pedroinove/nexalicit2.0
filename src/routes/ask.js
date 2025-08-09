// UPDATE - path: src/routes/ask.js
import express from "express";
import { client } from "../lib/openai.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { question = "", userId = "anon" } = req.body || {};
    if (!question.trim()) return res.status(400).json({ error: "Pergunta vazia" });

    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: "Você é um assistente especializado em licitações e contratos." },
        { role: "user", content: `Usuário: ${userId}\nPergunta: ${question}` },
      ],
    });

    const answer = r.choices?.[0]?.message?.content?.trim() || "Sem resposta.";
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno em /ask" });
  }
});

export default router;