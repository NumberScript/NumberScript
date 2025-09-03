import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import * as mathsteps from 'mathsteps';

interface WorkerRequest { id: string, code: string }
interface WorkerResponse { id: string, result?: any, steps?: string[], graph?: any, error?: string }

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { id, code } = event.data;
  try {
    const statements = code.split(/;|\n/).map(s => s.trim()).filter(Boolean);
    let result: any = null;
    let steps: string[] = [];
    let graph: any = null;

    for (const stmt of statements) {
      if (/^simplify/i.test(stmt)) {
        const inside = stmt.match(/\((.*)\)/)?.[1];
        if (inside) {
          const simp = nerdamer(inside).simplify().toString();
          result = simp;
          const stepObjs = mathsteps.simplifyExpression(inside);
          steps.push(...stepObjs.map(s => s.toString()));
        }
      } else if (/^expand/i.test(stmt)) {
        const inside = stmt.match(/\((.*)\)/)?.[1];
        if (inside) result = nerdamer.expand(inside).toString();
      } else if (/^solve/i.test(stmt)) {
        const match = stmt.match(/solve\((.*),(.*)\)/i);
        if (match) {
          const expr = match[1], variable = match[2].trim();
          const sol = nerdamer.solveEquations([expr], variable);
          result = sol.toString();
        }
      } else if (/^plot/i.test(stmt)) {
        const match = stmt.match(/plot\((.*),(.*),(.*)\.\.(.*)\)/i);
        if (match) {
          const expr = match[1], variable = match[2].trim();
          const start = parseFloat(match[3]), end = parseFloat(match[4]);
          const step = (end - start) / 100;
          const xValues: number[] = [], yValues: number[] = [];
          for (let x = start; x <= end; x += step) {
            try { const scope: any = {}; scope[variable] = x; yValues.push(math.evaluate(expr, scope)); xValues.push(x); } catch{}
          }
          graph = { traces:[{x:xValues,y:yValues,mode:'lines',name:expr}], layout:{title:`Plot of ${expr}`}};
          result = 'Graph generated';
        }
      } else result = math.evaluate(stmt);
    }

    (self as any).postMessage({ id, result, steps, graph });

  } catch (err: any) {
    (self as any).postMessage({ id, error: err.message });
  }
};
