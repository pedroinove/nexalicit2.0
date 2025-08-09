import fetch from 'node-fetch';
import { htmlToPdfBase64 } from './pdf.js';
import { supabase } from './supabase.js';

const NF_BASE = process.env.NETLIFY_FUNCTIONS_BASE || '';

export async function analisarDocumento({ tipoDocumento, fileUrl, fileBase64, fileName }) {
  if (NF_BASE) {
    const resp = await fetch(`${NF_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipoDocumento, fileUrl, fileBase64, fileName })
    });
    return await resp.json();
  }
  return { warning: 'Defina NETLIFY_FUNCTIONS_BASE para análise real.' };
}

export async function gerarDocumento({ titulo, conteudo }) {
  if (NF_BASE) {
    const resp = await fetch(`${NF_BASE}/generate-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: titulo, content: conteudo })
    });
    return await resp.json();
  }
  const base64 = await htmlToPdfBase64({ title: titulo, content: conteudo });
  return { fileName: `${titulo.replace(/\s+/g, '_')}.pdf`, mime: 'application/pdf', base64 };
}

export async function buscarHistorico({ userId, limit = 20 }) {
  if (NF_BASE) {
    const resp = await fetch(`${NF_BASE}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, limit })
    });
    return await resp.json();
  }
  if (!supabase) return { items: [], info: 'Sem Supabase configurado.' };

  const { data: chat } = await supabase.from('chats').select('id').eq('user_id', userId).maybeSingle();
  if (!chat?.id) return { items: [] };

  const { data: msgs, error } = await supabase
    .from('chat_messages')
    .select('role, content, created_at')
    .eq('chat_id', chat.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { items: [], error: error.message };
  return { items: msgs || [] };
}