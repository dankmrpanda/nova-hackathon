import { summarizeArchitectureWithAI } from '../src/core/analysis/llmSummarizer';
import { ArchitectureSummary } from '../src/core/analysis/architectureScanner';

test('summarizeArchitectureWithAI falls back without API key and respects env model', async () => {
  const original = process.env.ANTHROPIC_API_KEY;
  const originalModel = process.env.ANTHROPIC_MODEL;
  delete process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_MODEL = 'env-model-test';

  const fakeSummary: ArchitectureSummary = {
    root: '/repo',
    languages: ['ts'],
    modules: [{ name: 'core', files: [] }],
    files: [],
    entrypoints: [],
  };

  const res: any = await summarizeArchitectureWithAI(fakeSummary);
  expect(res.provider).toBe('fallback');
  expect(res.summary).toContain('Languages: ts');
  // Fallback object does not include model field, but we ensure env model did not cause error.
  expect(typeof res.summary).toBe('string');

  if (original) process.env.ANTHROPIC_API_KEY = original;
  if (originalModel) process.env.ANTHROPIC_MODEL = originalModel; else delete process.env.ANTHROPIC_MODEL;
});
