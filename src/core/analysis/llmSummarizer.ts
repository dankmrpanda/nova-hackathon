import { ArchitectureSummary } from './architectureScanner';
import chalk from 'chalk';
import { callOpenRouter } from './openRouterClient';

export type AISummaryOptions = {
  model?: string; // e.g. "claude-3-opus-20240229" (default from env ANTHROPIC_MODEL)
  maxTokens?: number;
  temperature?: number;
};

export async function summarizeArchitectureWithAI(summary: ArchitectureSummary, opts: AISummaryOptions = {}) {
  const provider = (process.env.LLM_PROVIDER || '').toLowerCase();
  const prompt = buildPrompt(summary);

  // OpenRouter branch (if provider explicitly set or OPENROUTER_API_KEY present)
  if (provider === 'openrouter' || process.env.OPENROUTER_API_KEY) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = opts.model || process.env.OPENROUTER_MODEL || 'anthropic/claude-3-opus:latest';
    const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1/chat/completions';
    const maxTokens = opts.maxTokens || (process.env.OPENROUTER_MAX_TOKENS ? parseInt(process.env.OPENROUTER_MAX_TOKENS) : undefined);
    if (!apiKey) return fallbackSummary(summary, 'Missing OPENROUTER_API_KEY');
    try {
      const text = await callOpenRouter(prompt, { apiKey, model, baseUrl, maxTokens, temperature: opts.temperature });
      return { provider: 'openrouter', model, rawPromptTokens: prompt.length, summary: text };
    } catch (err: any) {
      return fallbackSummary(summary, `OpenRouter error: ${err.message}`);
    }
  }

  // Fallback branch
  return fallbackSummary(summary, 'No OpenRouter key or provider specified');
}

function buildPrompt(summary: ArchitectureSummary): string {
  return `You are an onboarding assistant. Summarize this codebase for a new engineer.
Return sections: Overview, Key Modules, Entrypoints, Potential Architectural Patterns, Suggested Next Files to Read.

Data:
Root: ${summary.root}
Languages: ${summary.languages.join(', ')}
Modules: ${summary.modules.map((m) => m.name + '(' + m.files.length + ' files)').join(', ')}
Entrypoints: ${summary.entrypoints.join(', ')}
Dependency Counts (approx): ${summary.files
    .map((f) => `${shorten(f.path)}:${f.imports.length}`)
    .slice(0, 50)
    .join(', ')}
(Trim details; avoid listing every file.)`;
}

function shorten(p: string) {
  return p.replace(/\\/g, '/').split('/').slice(-2).join('/');
}

function fallbackSummary(summary: ArchitectureSummary, reason: string) {
  return {
    provider: 'fallback',
    reason,
    summary: `Overview:\nLanguages: ${summary.languages.join(', ')}\nModules: ${summary.modules
      .map((m) => m.name)
      .join(', ')}\nEntrypoints: ${summary.entrypoints.join(', ')}\n(Provide OPENROUTER_API_KEY to enable full AI summary.)`,
  };
}
