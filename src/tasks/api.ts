import type { Task } from '../types';
import type { TaskSource } from './source';

// Fetches tasks from an external HTTP endpoint.
// In Phase 2: point at the local /tasks route (same process).
// In Phase 3+: point at a real external task marketplace or on-chain indexer.
//
// The interface is the same regardless of what's behind the URL.
export class ApiTaskSource implements TaskSource {
  constructor(private readonly baseUrl: string) {}

  async fetchTasks(agentId: string): Promise<Task[]> {
    const url = `${this.baseUrl}/tasks?agentId=${encodeURIComponent(agentId)}`;

    let res: Response;
    try {
      res = await fetch(url, { signal: AbortSignal.timeout(5_000) });
    } catch (err) {
      throw new Error(`Task API unreachable at ${url}: ${(err as Error).message}`);
    }

    if (!res.ok) {
      throw new Error(`Task API returned ${res.status} at ${url}`);
    }

    return res.json() as Promise<Task[]>;
  }
}
