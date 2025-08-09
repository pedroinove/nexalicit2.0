import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

/**
 * Gera um PDF simples com o texto informado e retorna o buffer
 * @param {string} text - Texto a ser colocado no PDF
 * @returns {Buffer}
 */
export function generatePDF(text) {
  const doc = new PDFDocument();
  const chunks = [];

  doc.on('data', chunk => chunks.push(chunk));
  doc.on('end', () => {});

  doc.text(text);
  doc.end();

  return Buffer.concat(chunks);
}

/**
 * Converte HTML (simples) para PDF em Base64
 * @param {string} html - HTML que será convertido
 * @returns {Promise<string>} - PDF em Base64
 */
export function htmlToPdfBase64(html) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer.toString('base64'));
      });

      // Aqui renderizamos de forma simplificada
      doc.text(html);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}