import { Router, type Request, type Response } from 'express';
import { createAgent, getAgent } from '../agent/create';
import { AgentRunner } from '../agent/runner';
import { HttpTaskSource } from '../tasks/http';
import { DynamicTaskSource } from '../tasks/dynamic';
import { supabase } from '../config/supabase';
import { env } from '../config/env';

export const agentRouter = Router();

// In-memory map of running agent loops.
// PHASE 1: single process. Production: use a worker queue or job system.
const runners = new Map<string, AgentRunner>();

// POST /agent/create
agentRouter.post('/create', async (req: Request, res: Response) => {
  try {
    const strategy = (req.body?.strategy as string) ?? 'bounty';
    if (!['bounty'].includes(strategy)) {
      res.status(400).json({ error: `Unknown strategy: ${strategy}` });
      return;
    }
    const result = await createAgent(strategy);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /agent/:id
agentRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const agent = await getAgent(req.params['id']!);
    // Never expose the encrypted private key over the API.
    const { encrypted_private_key: _omit, ...safeAgent } = agent;
    res.json(safeAgent);
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

// GET /agent/:id/transactions
agentRouter.get('/:id/transactions', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query['limit'] as string ?? '50', 10), 200);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('agent_id', req.params['id'])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    res.json(data ?? []);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /agent/:id/run — start the autonomous loop for an agent
agentRouter.post('/:id/run', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) { res.status(400).json({ error: 'Missing agent id' }); return; }

  if (runners.has(id)) {
    res.status(409).json({ error: 'Agent is already running' });
    return;
  }

  try {
    await getAgent(id); // Validates the agent exists and is accessible
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
    return;
  }

  const taskSource = env.taskSource === 'http'
    ? new HttpTaskSource(env.coordinatorUrl)
    : new DynamicTaskSource();

  const runner = new AgentRunner(id, { taskSource });
  runners.set(id, runner);

  // Fire-and-forget: the loop runs independently of the HTTP request lifecycle.
  runner.start().catch((err: Error) => {
    console.error(`[Agent:${id.slice(0, 8)}] Runner crashed:`, err.message);
    runners.delete(id);
  });

  res.json({ message: 'Agent started', agentId: id });
});

// POST /agent/:id/stop
agentRouter.post('/:id/stop', (req: Request, res: Response) => {
  const { id } = req.params;
  const runner = runners.get(id!);

  if (!runner) {
    res.status(404).json({ error: 'No running agent with that id' });
    return;
  }

  runner.stop();
  runners.delete(id!);
  res.json({ message: 'Agent stopped', agentId: id });
});

// GET /agents/running — list all currently running agent IDs
agentRouter.get('/', (_req: Request, res: Response) => {
  res.json({ running: [...runners.keys()] });
});
