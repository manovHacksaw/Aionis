import 'dotenv/config';

import express from 'express';
import { agentRouter } from './routes/agent';
import { tasksRouter }  from './routes/tasks';
import { env }          from './config/env';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
app.use('/agent',  agentRouter);
app.use('/tasks',  tasksRouter);

const server = app.listen(env.port, () => {
  console.log(`AutoFi API running on port ${env.port}`);
});

function shutdown(signal: string): void {
  console.log(`${signal} received — shutting down`);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
