import type { Task } from '../types';
import type { TaskSource } from './source';

interface RawExternalTask {
  id:          unknown;
  type:        unknown;
  cost:        unknown;
  revenue:     unknown;
  payload:     unknown;
  ttl_ms:      unknown;
  expires_at?: unknown;
}

interface TaskListResponse {
  tasks:  unknown[];
  cursor: string | null;
}

// Validates and normalises a raw task from the external coordinator.
// Returns null for any task that fails validation — bad tasks are silently dropped,
// not propagated to the runner (the runner must never see malformed input).
function validateTask(raw: RawExternalTask, nowMs: number): Task | null {
  if (typeof raw.id !== 'string' || !raw.id) return null;
  if (typeof raw.type !== 'string' || !raw.type) return null;
  if (!Number.isInteger(raw.cost) || (raw.cost as number) <= 0) return null;
  if (!Number.isInteger(raw.revenue) || (raw.revenue as number) <= 0) return null;
  if (!Number.isInteger(raw.ttl_ms) || (raw.ttl_ms as number) <= 0) return null;
  if (typeof raw.payload !== 'object' || raw.payload === null || Array.isArray(raw.payload)) return null;

  // Invariant T1: reject any task that attempts to inject a confidence value.
  // Confidence is always computed internally — the task source is untrusted.
  if ('confidence' in (raw.payload as Record<string, unknown>)) return null;

  // Reject tasks that have already expired at fetch time.
  if (typeof raw.expires_at === 'string') {
    const expiresAtMs = Date.parse(raw.expires_at);
    if (isNaN(expiresAtMs) || expiresAtMs <= nowMs) return null;
  }

  return {
    id:      raw.id,
    type:    raw.type,
    cost:    raw.cost   as number,
    revenue: raw.revenue as number,
    payload: raw.payload as Record<string, unknown>,
    ttl_ms:  raw.ttl_ms  as number,
  };
}

export class HttpTaskSource implements TaskSource {
  constructor(
    private readonly coordinatorUrl: string,
    private readonly timeoutMs: number = 5_000
  ) {}

  async fetchTasks(agentId: string): Promise<Task[]> {
    const url = new URL(`${this.coordinatorUrl}/tasks`);
    url.searchParams.set('agent_id', agentId);
    url.searchParams.set('limit', '10');

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        signal:  AbortSignal.timeout(this.timeoutMs),
        headers: { Accept: 'application/json' },
      });
    } catch (err) {
      throw new Error(`Coordinator unreachable: ${(err as Error).message}`);
    }

    if (!res.ok) {
      throw new Error(`Coordinator returned HTTP ${res.status}`);
    }

    let body: TaskListResponse;
    try {
      body = await res.json() as TaskListResponse;
    } catch {
      throw new Error('Coordinator response is not valid JSON');
    }

    if (!Array.isArray(body.tasks)) {
      throw new Error('Coordinator response missing "tasks" array');
    }

    const nowMs = Date.now();
    const seen  = new Set<string>();
    const valid: Task[] = [];

    for (const raw of body.tasks) {
      const task = validateTask(raw as RawExternalTask, nowMs);
      if (task === null) continue;

      // Deduplicate within a single response (coordinator should not do this,
      // but be defensive against malformed responses).
      if (seen.has(task.id)) continue;
      seen.add(task.id);

      valid.push(task);
    }

    return valid;
  }
}
