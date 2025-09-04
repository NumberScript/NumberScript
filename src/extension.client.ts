import * as vscode from 'vscode';
import * as fs from 'fs';
import ShowWorkViewProvider from './showWorkViewProvider';
import GraphPanel from './graphPanel';

// Import the Web Worker using worker-loader
import Worker from './server.worker.ts';

export function activate(context: vscode.ExtensionContext) {
  const output = vscode.window.createOutputChannel('NumberScript');

  const showWorkProvider = new ShowWorkViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('showWorkView', showWorkProvider)
  );

  // Instantiate the worker
  const worker = new Worker();

  function sendToWorker(code: string): Promise<any> {
    return new Promise((resolve) => {
      const id = Math.random().toString(36).slice(2);
      function listener(e: MessageEvent) {
        if (e.data && e.data.id === id) {
          worker.removeEventListener('message', listener);
          resolve(e.data);
        }
      }
      worker.addEventListener('message', listener);
      worker.postMessage({ id, code });
    });
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('numberscript.run', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const code = editor.document.getText();
      output.appendLine(`Running NumberScript:\n${code}`);

      try {
        const result: any = await sendToWorker(code);
        if (result.error) output.appendLine(`Error: ${result.error}`);
        else {
          output.appendLine(`Result: ${result.result}`);
          if (result.steps) showWorkProvider.setSteps(result.steps);
          if (result.graph) GraphPanel.createOrShow(context.extensionUri, result.graph);
        }
      } catch (err: any) {
        output.appendLine(`Runtime error: ${err.message}`);
      }
    })
  );
}
