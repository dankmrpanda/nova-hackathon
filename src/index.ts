#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanWorkspace } from './core/analysis/architectureScanner';
import { summarizeArchitectureWithAI } from './core/analysis/llmSummarizer';
import { startInteractive } from './ui/terminal/terminalUI';

const program = new Command();

program
  .name('onboard')
  .description('Interactive codebase onboarding agent')
  .version('0.1.0');

program
  .command('scan')
  .description('Scan current workspace and summarize architecture')
  .option('-r, --root <path>', 'Root path to scan', process.cwd())
  .action(async (opts) => {
    const summary = await scanWorkspace(opts.root);
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(summary, null, 2));
  });

program
  .command('interactive')
  .description('Launch interactive terminal UI')
  .option('-r, --root <path>', 'Root path to scan', process.cwd())
  .action(async (opts) => {
    await startInteractive(opts.root);
  });

program
  .command('ai-scan')
  .description('Scan workspace and produce an AI-generated summary (uses .env OPENROUTER_API_KEY / OPENROUTER_MODEL / OPENROUTER_MAX_TOKENS)')
  .option('-r, --root <path>', 'Root path to scan', process.cwd())
  .option('-m, --model <name>', 'Override model (default from env OPENROUTER_MODEL)')
  .option('--maxTokens <number>', 'Override max tokens (default from env OPENROUTER_MAX_TOKENS)', parseInt)
  .action(async (opts) => {
    const summary = await scanWorkspace(opts.root);
    const envModel = process.env.OPENROUTER_MODEL;
    const envMaxTokens = process.env.OPENROUTER_MAX_TOKENS ? parseInt(process.env.OPENROUTER_MAX_TOKENS) : undefined;
    const ai = await summarizeArchitectureWithAI(summary, {
      model: opts.model || envModel,
      maxTokens: opts.maxTokens || envMaxTokens,
    });
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(ai, null, 2));
  });

program.parseAsync(process.argv);
