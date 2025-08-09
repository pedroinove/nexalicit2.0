# NEXALICIT – Backend (Netlify Functions)

Endpoints:
- POST `/.netlify/functions/ask` → { message, userId? }
- POST `/.netlify/functions/analyze` → { tipoDocumento, fileUrl | fileBase64 + fileName }
- POST `/.netlify/functions/generate-pdf` → { title, content }
- POST `/.netlify/functions/history` → { userId, limit? }

## Como rodar
1) `npm install`
2) `cp .env.example .env` e preencher variáveis
3) `npm run dev`