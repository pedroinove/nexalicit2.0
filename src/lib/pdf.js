// UPDATE - path: src/lib/pdf.js
import PDFDocument from "pdfkit";
import { Buffer } from "node:buffer";
import { supabase } from "./supabase.js";

/** Gera um PDF simples a partir de texto e retorna Buffer */
export function generatePDF(text) {
  const doc = new PDFDocument({ margin: 40 });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  doc.on("end", () => {});
  doc.on("error", (e) => { throw e; });

  doc.fontSize(12).text(String(text || "Documento vazio"), { align: "left" });
  doc.end();

  return Buffer.concat(chunks);
}

/** Converte HTML (simples) para PDF em Base64 */
export function htmlToPdfBase64(html) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
      doc.on("error", reject);

      // Renderização simplificada do "HTML"
      doc.fontSize(12).text(String(html || ""), { align: "left" });
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/** Converte HTML (simples) para PDF e retorna Buffer */
export function htmlToPdfBuffer(html) {
  return htmlToPdfBase64(html).then((b64) => Buffer.from(b64, "base64"));
}

/** Salva PDF no Supabase Storage (bucket público) e retorna URL pública */
export async function salvarPdfNoStorage({ buffer, fileName }) {
  const bucket = process.env.SUPABASE_BUCKET || "nexalicit";
  const safeName = String(fileName || "documento.pdf").replace(/\s+/g, "-");
  const path = `pdfs/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType: "application/pdf", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/** Helper: gera e faz upload em uma chamada */
export async function generateAndUploadPdf({ content, fileName = "documento.pdf" } = {}) {
  const buffer = await htmlToPdfBuffer(content || "");
  const url = await salvarPdfNoStorage({ buffer, fileName });
  return { url, fileName };
}