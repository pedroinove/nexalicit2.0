// UPDATE - path: src/routes/generatePdf.js
import { Router } from "express";
import { htmlToPdfBuffer, salvarPdfNoStorage } from "../lib/pdf.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { content = "", fileName = "documento.pdf", as = "link" } = req.body;
    const buf = await htmlToPdfBuffer(content);

    if (as === "link") {
      const url = await salvarPdfNoStorage({ buffer: buf, fileName });
      return res.json({ url, fileName });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.send(buf);
  } catch (e) {
    console.error("generate-pdf error:", e);
    return res.status(500).json({ error: "Falha ao gerar PDF" });
  }
});

export default router;