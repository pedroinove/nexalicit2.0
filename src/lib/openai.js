import 'dotenv/config';
import OpenAI from 'openai';
import { analisarDocumento, gerarDocumento, buscarHistorico } from './ops.js';

export const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runAssistantOnce({ assistantId, messages }) {
  const thread = await client.threads.create();
  for (const m of messages) await client.threads.messages.create(thread.id, m);

  let run = await client.threads.runs.create(thread.id, { assistant_id: assistantId });

  while (true) {
    const status = await client.threads.runs.retrieve(thread.id, run.id);
    if (status.status === 'completed') break;
    if (['failed', 'cancelled', 'expired'].includes(status.status)) throw new Error(`Run ${status.status}`);

    if (status.status === 'requires_action' && status.required_action?.type === 'submit_tool_outputs') {
      const calls = status.required_action.submit_tool_outputs.tool_calls || [];
      const outputs = await Promise.all(
        calls.map(async (tc) => {
          const name = tc.function.name;
          const args = JSON.parse(tc.function.arguments || '{}');
          let result;
          if (name === 'analisar_documento') result = await analisarDocumento(args);
          else if (name === 'gerar_documento') result = await gerarDocumento(args);
          else if (name === 'buscar_historico') result = await buscarHistorico(args);
          else result = { error: `Função desconhecida: ${name}` };
          return { tool_call_id: tc.id, output: JSON.stringify(result) };
        })
      );
      run = await client.threads.runs.submitToolOutputs(thread.id, run.id, { tool_outputs: outputs });
      continue;
    }
    await new Promise((r) => setTimeout(r, 900));
  }

  const list = await client.threads.messages.list(thread.id, { order: 'desc' });
  const first = list.data[0];
  const part = first?.content?.[0];
  const text = part?.type === 'text' ? part.text.value : '[Sem conteúdo de texto]';
  return { text, threadId: thread.id };
}