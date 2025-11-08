export type LearningEvent = {
  timestamp: number;
  topic: string;
  note: string;
  confusion?: boolean;
};

export class MemoryStore {
  private events: LearningEvent[] = [];

  record(event: Omit<LearningEvent, 'timestamp'>) {
    this.events.push({ ...event, timestamp: Date.now() });
  }

  list(limit = 50): LearningEvent[] {
    return this.events.slice(-limit);
  }

  summarize(): { topics: Record<string, number>; confusionHotspots: string[] } {
    const topics: Record<string, number> = {};
    const confusion: Record<string, number> = {};
    for (const e of this.events) {
      topics[e.topic] = (topics[e.topic] || 0) + 1;
      if (e.confusion) confusion[e.topic] = (confusion[e.topic] || 0) + 1;
    }
    const confusionHotspots = Object.entries(confusion)
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t);
    return { topics, confusionHotspots };
  }
}
