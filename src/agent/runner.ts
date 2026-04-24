import { evaluateProfit } from '../engine/profit';
import { computeConfidence } from '../engine/confidence';
import { getStrategy, supportedTypes } from '../strategy/registry';
import { getAgent } from './create';
import { DynamicTaskSource } from '../tasks/dynamic';
import type { TaskSource } from '../tasks/source';
import type { Task } from '../types';

interface RunnerOptions {
  taskSource?:     TaskSource;
  pollIntervalMs?: number;
  maxBackoffMs?:   number;
}

function log(agentId: string, msg: string, data?: unknown): void {
  const prefix = `[${new Date().toISOString()}] [Agent:${agentId.slice(0, 8)}]`;
  console.log(data !== undefined ? `${prefix} ${msg} ${JSON.stringify(data)}` : `${prefix} ${msg}`);
}

export class AgentRunner {
  private running = false;
  private readonly taskSource:     TaskSource;
  private readonly pollIntervalMs: number;
  private readonly maxBackoffMs:   number;

  constructor(
    private readonly agentId: string,
    options: RunnerOptions = {}
  ) {
    this.taskSource     = options.taskSource     ?? new DynamicTaskSource();
    this.pollIntervalMs = options.pollIntervalMs ?? 2_000;
    this.maxBackoffMs   = options.maxBackoffMs   ?? 30_000;
  }

  async start(): Promise<void> {
    if (this.running) throw new Error('Runner already started');
    this.running = true;
    log(this.agentId, `Loop started | strategies: [${supportedTypes().join(', ')}]`);

    let backoff = this.pollIntervalMs;

    while (this.running) {
      try {
        const agent = await getAgent(this.agentId);

        if (agent.status !== 'active') {
          log(this.agentId, `Agent status="${agent.status}" — stopping`);
          this.running = false;
          break;
        }

        const tasks = await this.taskSource.fetchTasks(this.agentId);
        log(this.agentId, `Fetched ${tasks.length} task(s) | balance: ${agent.balance} lamports`);

        const executed = await this.evaluateAndExecute(tasks, agent.balance);

        if (executed === 0) {
          log(this.agentId, `Nothing executed — backoff ${backoff}ms`);
          await this.sleep(backoff);
          backoff = Math.min(Math.floor(backoff * 1.5), this.maxBackoffMs);
        } else {
          backoff = this.pollIntervalMs;
          await this.sleep(this.pollIntervalMs);
        }
      } catch (err) {
        log(this.agentId, `Loop error — backoff ${backoff}ms`, { error: (err as Error).message });
        await this.sleep(backoff);
        backoff = Math.min(backoff * 2, this.maxBackoffMs);
      }
    }

    log(this.agentId, 'Loop stopped');
  }

  stop(): void {
    log(this.agentId, 'Stop signal received');
    this.running = false;
  }

  // Returns the number of tasks actually executed this iteration.
  private async evaluateAndExecute(tasks: Task[], balance: number): Promise<number> {
    let executed = 0;

    for (const task of tasks) {
      if (!this.running) break;

      const strategy = getStrategy(task.type);
      if (!strategy) {
        log(this.agentId, `SKIP  ${task.id.slice(0, 8)} | no strategy for type="${task.type}"`);
        continue;
      }

      // Affordability gate: skip before computing confidence if we can't afford the cost.
      if (task.cost > balance) {
        log(this.agentId, `SKIP  ${task.id.slice(0, 8)} | cost ${task.cost} > balance ${balance}`);
        continue;
      }

      // Compute real confidence from history.
      const { confidence, sampleSize, source } = await computeConfidence(this.agentId, task.type);
      const evaluation = evaluateProfit(task, confidence);

      if (!evaluation.profitable) {
        log(this.agentId, `SKIP  ${task.id.slice(0, 8)} | type=${task.type}`, {
          confidence:     confidence.toFixed(4),
          confidenceSrc:  source,
          sampleSize,
          expectedProfit: evaluation.expectedProfit,
          cost:           task.cost,
          revenue:        task.revenue,
        });
        continue;
      }

      log(this.agentId, `EXEC  ${task.id.slice(0, 8)} | type=${task.type}`, {
        confidence:     confidence.toFixed(4),
        confidenceSrc:  source,
        sampleSize,
        expectedProfit: evaluation.expectedProfit,
        cost:           task.cost,
        revenue:        task.revenue,
      });

      try {
        const outcome = await strategy(this.agentId, task, evaluation);
        executed++;

        if (outcome.succeeded) {
          log(this.agentId, `WIN   ${task.id.slice(0, 8)}`, {
            netProfit:   outcome.netProfit,
            executionMs: outcome.executionMs,
          });
        } else {
          log(this.agentId, `FAIL  ${task.id.slice(0, 8)} | cost refunded`);
        }
      } catch (err) {
        log(this.agentId, `ERROR ${task.id.slice(0, 8)}`, { error: (err as Error).message });
      }
    }

    return executed;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}
