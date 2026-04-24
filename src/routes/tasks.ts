import { Router, type Request, type Response } from 'express';
import { DynamicTaskSource } from '../tasks/dynamic';

export const tasksRouter = Router();

const source = new DynamicTaskSource();

// GET /tasks?agentId=xxx
// Returns a dynamic set of available tasks.
// Used by ApiTaskSource and useful for manual inspection.
tasksRouter.get('/', async (req: Request, res: Response) => {
  try {
    const agentId = (req.query['agentId'] as string | undefined) ?? 'anonymous';
    const tasks   = await source.fetchTasks(agentId);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
