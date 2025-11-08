import { summarizeArchitectureWithAI } from '../src/core/analysis/llmSummarizer';
import { ArchitectureSummary } from '../src/core/analysis/architectureScanner';

// Ensure that when OpenRouter is selected but no key is present, we gracefully fallback.

test('OpenRouter provider without key falls back', async () => {
  const oldProvider = process.env.LLM_PROVIDER;
  const oldOrKey = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  process.env.LLM_PROVIDER = 'openrouter';

  const summary: ArchitectureSummary = {
    root: '/repo',
    languages: ['ts'],
    modules: [{ name: 'core', files: [] }],
    files: [],
    entrypoints: [],
  };

  const res: any = await summarizeArchitectureWithAI(summary);
  expect(res.provider).toBe('fallback');

  // restore
  if (oldProvider) process.env.LLM_PROVIDER = oldProvider; else delete process.env.LLM_PROVIDER;
  if (oldOrKey) process.env.OPENROUTER_API_KEY = oldOrKey; else delete process.env.OPENROUTER_API_KEY;
});
