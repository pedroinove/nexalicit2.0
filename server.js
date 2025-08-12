// UPDATE - path: server.js
const express = require('express');
const cors = require('cors');

const app = express();

/* ================= CORS (antes dos parsers) ================= */
const STATIC_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://famous-cactus-59b8f9.netlify.app',
]);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl/health etc.
    try {
      const { origin: normalized, hostname } = new URL(origin);
      if (STATIC_ORIGINS.has(normalized)) return cb(null, true);
      if (hostname.endsWith('.netlify.app')) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    } catch {
      return cb(new Error(`CORS invalid origin: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* ================= Parsers ================= */
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.set('trust proxy', 1);

/* ================= Logs simples ================= */
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

/* ================= Rotas ================= */
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'Nexalicit API online',
    endpoints: { health: '/health', ask: '/ask' },
  });
});

app.post('/ask', async (req, res) => {
  try {
    const { userId, pergunta } = req.body || {};
    if (!pergunta || typeof pergunta !== 'string' || !pergunta.trim()) {
      return res.status(400).json({
        error: 'Pergunta vazia ou inválida',
        received: { userId, pergunta },
        debug: { contentType: req.get('Content-Type') },
      });
    }
    if (!userId || typeof userId !== 'string' || !userId.trim()) {
      return res.status(400).json({ error: 'UserId vazio ou inválido', received: { userId, pergunta } });
    }

    // 👉 aqui entraria sua chamada real à IA/Assistants
    const answer =
      `Resposta para: "${pergunta}"\n\n` +
      `Baseado na Lei 14.133/2021 e jurisprudência do TCU...\n\n` +
      `**Fundamentação Legal:**\n- Art. X da Lei 14.133/2021\n- Acórdão TCU nº XXXX\n\n` +
      `**Orientação:** texto exemplo.`;

    res.json({ success: true, answer, timestamp: new Date().toISOString(), userId, pergunta });
  } catch (err) {
    console.error('Erro /ask:', err);
    res.status(500).json({ error: 'Erro interno do servidor', message: err.message });
  }
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada', path: req.originalUrl, method: req.method });
});

/* ================= Boot com fallback de porta ================= */
const MAX_TRIES = 20;
const HOST = '0.0.0.0';

// Se a plataforma gerencia a porta (Railway/produção), não faça fallback.
// Dica: Railway define PORT e geralmente RAILWAY_ENVIRONMENT.
const platformManaged =
  !!process.env.RAILWAY_ENVIRONMENT ||
  process.env.NODE_ENV === 'production';

// Porta inicial: PORT (se existir) senão 3000
const START_PORT = Number(process.env.PORT) || 3000;

function listenOn(port, attempt = 1) {
  const server = app
    .listen(port, HOST, () => {
      console.log(`🚀 Servidor rodando na porta ${port}`);
      console.log(`📍 Health:  /health`);
      console.log(`🤖 Ask:     /ask`);
    })
    .on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        if (platformManaged) {
          // Em produção (Railway), não podemos mudar a porta -> falha explícita
          console.error(
            `❌ Porta ${port} ocupada e ambiente gerenciado exige PORT fixa. Encerrando...`
          );
          process.exit(1);
        }
        if (attempt >= MAX_TRIES) {
          console.error(`❌ Não foi possível encontrar porta livre após ${MAX_TRIES} tentativas.`);
          process.exit(1);
        }
        const nextPort = port + 1;
        console.warn(
          `⚠️ Porta ${port} ocupada. Tentando porta ${nextPort} (tentativa ${attempt + 1}/${MAX_TRIES})...`
        );
        setTimeout(() => listenOn(nextPort, attempt + 1), 150);
      } else {
        console.error('❌ Erro ao iniciar servidor:', err);
        process.exit(1);
      }
    });

  // retorna o server caso você precise usar em testes
  return server;
}

listenOn(START_PORT);

module.exports = app;