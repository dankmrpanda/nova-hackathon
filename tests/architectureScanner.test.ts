import path from 'path';
import fs from 'fs';
import { scanWorkspace } from '../src/core/analysis/architectureScanner';

// Minimal smoke test: scanning the current workspace should return a summary object

test('scanWorkspace returns a summary', async () => {
  const root = path.resolve(__dirname, '..');
  const summary = await scanWorkspace(root);
  expect(summary.root).toBe(root);
  expect(Array.isArray(summary.files)).toBe(true);
  expect(Array.isArray(summary.modules)).toBe(true);
});
