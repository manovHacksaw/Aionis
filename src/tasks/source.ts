import type { Task } from '../types';

// TaskSource is the interface between the agent runner and wherever tasks come from.
// Phase 1: MockTaskSource implements this with hardcoded bounties.
// Future: replace with on-chain program polling, a job queue, or an API client.
export interface TaskSource {
  fetchTasks(agentId: string): Promise<Task[]>;
}
