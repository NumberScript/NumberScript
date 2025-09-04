// src/server/server.worker.ts

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

self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { id, code } = event.data;
  const response: WorkerResponse = { id };

  try {
    // Example evaluation (replace with your own logic)
    const steps = mathsteps.simplify(code);
    const result = nerdamer(code).toString();

    response.result = result;
    response.steps = steps.map((s: any) => s.text); // map to string if needed

    // Optionally generate graph data here
    response.graph = null;
  } catch (err: any) {
    response.error = err.message || String(err);
  }

  (self as any).postMessage(response);
});
