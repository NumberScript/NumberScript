import * as mathjs from 'mathjs';
import * as nerdamer from 'nerdamer';
import * as mathsteps from 'mathsteps';

interface WorkerMessage { id: string; code: string; }
interface WorkerResponse { id: string; result?: any; steps?: string[]; error?: string; }

self.addEventListener('message', async (event: MessageEvent) => {
  const msg: WorkerMessage = event.data;
  const response: WorkerResponse = { id: msg.id };

  try {
    const code = msg.code;

    // Evaluate math expressions
    const result = mathjs.evaluate(code);
    response.result = result;

    // Optional steps using mathsteps
    try {
      const steps = mathsteps.stepThroughExpression(code).map(s => s.changeType);
      response.steps = steps;
    } catch {}

    // Symbolic solves using nerdamer
    try {
      const solve = nerdamer.solveEquations(code);
      if (solve) response.result = solve;
    } catch {}
  } catch (err: any) {
    response.error = err.message;
  }

  self.postMessage(response);
});
