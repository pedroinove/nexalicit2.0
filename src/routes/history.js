// UPDATE - path: src/routes/history.js
import express from "express";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { userId, limit = 20 } = req.query || {};
    if (!userId) return res.status(400).json({ error: "userId é obrigatório" });
    if (!supabase) return res.json({ items: [], info: "Supabase não configurado" });

    // pega (ou cria) chat do usuário
    let chatId;
    const { data: existing } = await supabase.from("chats").select("id").eq("user_id", userId).maybeSingle();
    if (existing?.id) chatId = existing.id;

    if (!chatId) return res.json({ items: [] });

    const { data: msgs, error } = await supabase
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false })
      .limit(Number(limit));

    if (error) return res.status(500).json({ error: error.message });
    res.json({ items: msgs || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno em /history" });
  }
});

export default router;