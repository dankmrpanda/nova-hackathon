export type SandboxResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

export interface ISandbox {
  run(code: string, timeoutMs?: number): Promise<SandboxResult>;
}

// Placeholder sandbox that DOES NOT execute untrusted code. It simulates execution.
export class NoopSandbox implements ISandbox {
  async run(code: string): Promise<SandboxResult> {
    return {
      stdout: `Simulated run. Code length: ${code.length}`,
      stderr: '',
      exitCode: 0,
    };
  }
}
