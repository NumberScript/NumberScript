declare const __webpack_public_path__: string; // fix Webpack warning

import * as mathjs from 'mathjs';
import * as nerdamer from 'nerdamer';
import mathsteps from 'mathsteps';

self.addEventListener('message', async (event) => {
  const { id, code } = event.data;
  let result: any = {};
  try {
    // Example: run code using mathjs / nerdamer / mathsteps
    const simplified = mathsteps.simplifyExpression(code);
    result = { result: simplified.steps.map((s: any) => s.change).join('\n'), steps: simplified.steps };
  } catch (err: any) {
    result = { error: err.message };
  }
  (self as any).postMessage({ id, ...result });
});
