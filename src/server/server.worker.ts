// server.worker.ts
import * as mathjs from 'mathjs';
import * as nerdamer from 'nerdamer';
import * as mathsteps from 'mathsteps';

interface WorkerMessage {
  id: string;
  code: string;
}

interface WorkerResponse {
  id: string;
  result?: any;
  steps?: string[];
  graph?: any;
  error?: string;
}

self.addEventListener('message', async (event: MessageEvent) => {
  const msg: WorkerMessage = event.data;

  const response: WorkerResponse = { id: msg.id };

  try {
    const code = msg.code;

    // Example: basic math evaluation using mathjs
    const result = mathjs.evaluate(code);
    response.result = result;

    // Optionally, generate steps using mathsteps (if an expression)
    try {
      const steps = mathsteps.stepThroughExpression(code).map(s => s.changeType);
      response.steps = steps;
    } catch {}

    // Optionally, generate symbolic solves via nerdamer
    try {
      const solve = nerdamer.solveEquations(code);
      if (solve) response.result = solve;
    } catch {}

    // Graph data placeholder (optional)
    response.graph = null;

  } catch (err: any) {
    response.error = err.message;
  }

  // Post result back to main thread
  self.postMessage(response);
});

