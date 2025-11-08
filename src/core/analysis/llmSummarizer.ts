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
  // Focused, richer CLI-oriented prompt. We keep everything in a single user message for now
  // to avoid changing the OpenRouter client structure. If system-role support is added later,
  // we can split "INSTRUCTIONS" into a system message. Goal: actionable onboarding + architectural
  // insight with clear, terminal-friendly formatting (no markdown tables, no emojis).
  const moduleLines = summary.modules
    .slice(0, 40)
    .map(m => `- ${m.name}: ${m.files.length} files`)
    .join('\n');
  const depLines = summary.files
    .slice(0, 60) // cap to avoid prompt bloat
    .map(f => `${shorten(f.path)}=${f.imports.length}`)
    .join(', ');

  return `INSTRUCTIONS:
You are an expert software architecture & onboarding assistant operating in a plain CLI (ANSI OK, keep it simple UTF-8). Assume the user is a competent engineer new to THIS codebase, seeking a fast mental model and prioritized next steps.

OUTPUT FORMAT RULES:
1. Use ALL CAPS headings with a blank line after each heading.
2. Keep each bullet under ~120 characters; wrap only if essential.
3. NO markdown tables, NO emojis, NO excessive prose. Concise, high-signal language.
4. When listing files or modules, prefer relative short paths and group logically; avoid repeating trivial info.
5. If information is missing, state "(unknown)" rather than guessing.
6. DO NOT invent functionality not implied by provided data.

SECTIONS (in this exact order):
EXECUTIVE SUMMARY: 2-3 sentences describing overall purpose & structure.
ARCHITECTURE MAP: bullets for major modules + role + notable coupling.
ENTRYPOINTS & FLOW: how execution begins; outline high-level data / control flow.
KEY DEPENDENCIES & INTEGRATIONS: internal + external libraries/services of architectural significance.
COMPLEXITY HOTSPOTS: potential risk areas (size, fan-in, fan-out, unclear boundaries) with brief rationale.
FIRST 5 EXPLORATION TASKS: ordered list of concrete actions a newcomer should take (open file X, trace Y...).
RECOMMENDED IMPROVEMENTS: split QUICK WINS vs STRATEGIC.
NEXT READING ORDER: ordered list of files/modules to read after tasks for deeper understanding.
OMISSIONS / DATA GAPS: anything you could not assess from the provided scan.

CONTEXT DATA:
ROOT: ${summary.root}
LANGUAGES: ${summary.languages.join(', ') || '(none)'}
MODULES (${summary.modules.length}):\n${moduleLines || '(none)'}
ENTRYPOINTS: ${summary.entrypoints.join(', ') || '(none)'}
FILE IMPORT FAN-OUT (approx counts): ${depLines || '(none)'}

NOTES:
- Import counts approximate complexity / dependency surface; use to infer hotspots.
- You may infer reasonable architectural patterns ONLY if strongly signaled (e.g. naming conventions, file clustering). If unsure, label as "Possible".

Generate the sections now.`;
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
