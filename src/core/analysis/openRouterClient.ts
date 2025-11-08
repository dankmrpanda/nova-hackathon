export interface OpenRouterConfig {
  apiKey: string;
  model: string;
  baseUrl?: string; // default https://openrouter.ai/api/v1
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string; // optional system role message
}

export interface OpenRouterResponseChunk {
  role?: string;
  content?: string;
}

export async function callOpenRouter(prompt: string, cfg: OpenRouterConfig): Promise<string> {
  const url = cfg.baseUrl || 'https://openrouter.ai/api/v1/chat/completions';
  const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
  if (cfg.systemPrompt) messages.push({ role: 'system', content: cfg.systemPrompt });
  messages.push({ role: 'user', content: prompt });
  const body = {
    model: cfg.model,
    messages,
    temperature: cfg.temperature ?? 0.2,
    max_tokens: cfg.maxTokens ?? 600,
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenRouter request failed: ${resp.status} ${text}`);
  }
  const json: any = await resp.json();
  // The OpenRouter response typically includes choices[0].message.content
  const content = json?.choices?.[0]?.message?.content;
  if (!content) return 'No content returned';
  return content;
}
