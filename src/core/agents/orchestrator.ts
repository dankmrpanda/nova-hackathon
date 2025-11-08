import { scanWorkspace, ArchitectureSummary } from '../analysis/architectureScanner';

export class Orchestrator {
  private summary: ArchitectureSummary | null = null;

  async bootstrap(root: string) {
    this.summary = await scanWorkspace(root);
  }

  getSummary(): ArchitectureSummary | null {
    return this.summary;
  }
}
