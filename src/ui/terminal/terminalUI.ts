import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { scanWorkspace } from '../../core/analysis/architectureScanner';
import { summarizeArchitectureWithAI } from '../../core/analysis/llmSummarizer';

export async function startInteractive(root: string) {
  console.clear();
  console.log(chalk.bold.cyan('👋 Codebase Onboarding Agent'));
  console.log(chalk.dim('I will help you explore and understand this repository.'));

  const spinner = ora('Scanning workspace').start();
  const summary = await scanWorkspace(root);
  spinner.succeed('Scan complete');

  await mainLoop(summary.root, summary);
}

async function mainLoop(root: string, summary: Awaited<ReturnType<typeof scanWorkspace>>) {
  let exit = false;
  while (!exit) {
    const choice = await inquirer.prompt<{ action: string }>([
      {
        name: 'action',
        type: 'list',
        message: 'Select an action',
        choices: [
          { name: 'Overview', value: 'overview' },
          { name: 'List modules', value: 'modules' },
          { name: 'List entrypoints', value: 'entrypoints' },
          { name: 'Raw file graph (imports)', value: 'graph' },
          { name: 'AI summary (requires API key)', value: 'ai' },
          { name: 'Quit', value: 'quit' },
        ],
      },
    ]);

    switch (choice.action) {
      case 'overview':
        printOverview(summary);
        break;
      case 'modules':
        printModules(summary);
        break;
      case 'entrypoints':
        printEntrypoints(summary);
        break;
      case 'graph':
        printGraph(summary);
        break;
      case 'ai':
        await runAISummary(summary);
        break;
      case 'quit':
        exit = true;
        break;
    }
  }
  console.log(chalk.green('Bye!'));
}

function printOverview(summary: Awaited<ReturnType<typeof scanWorkspace>>) {
  console.log(chalk.bold('\nOverview'));
  console.log('Root:', summary.root);
  console.log('Languages:', summary.languages.join(', '));
  if (summary.packages?.name) console.log('Package:', summary.packages.name);
  console.log('Modules:', summary.modules.length);
  console.log('Files analyzed:', summary.files.length);
}

function printModules(summary: Awaited<ReturnType<typeof scanWorkspace>>) {
  console.log(chalk.bold('\nModules'));
  for (const m of summary.modules) {
    console.log(chalk.cyan(m.name), '-', m.files.length, 'files');
  }
}

function printEntrypoints(summary: Awaited<ReturnType<typeof scanWorkspace>>) {
  console.log(chalk.bold('\nEntrypoints'));
  for (const e of summary.entrypoints) console.log(e);
}

function printGraph(summary: Awaited<ReturnType<typeof scanWorkspace>>) {
  console.log(chalk.bold('\nImport Graph (file -> deps)'));
  for (const f of summary.files) {
    console.log(chalk.magenta(f.path));
    for (const imp of f.imports) console.log('  ->', imp);
  }
}

async function runAISummary(summary: Awaited<ReturnType<typeof scanWorkspace>>) {
  const { model } = await inquirer.prompt<{ model?: string }>([
    { name: 'model', type: 'input', message: 'Model (optional, e.g. claude-3-opus-20240229):' },
  ]);
  const spinner = ora('Querying AI model...').start();
  try {
    const res = await summarizeArchitectureWithAI(summary, { model });
    spinner.succeed('AI summary ready');
    console.log('\n' + chalk.bold('AI Summary'));
    const text = (res as any).summary;
    console.log(typeof text === 'string' ? text : JSON.stringify(res, null, 2));
  } catch (e: any) {
    spinner.fail('Failed to summarize');
    console.log(chalk.red(e.message || String(e)));
  }
}
