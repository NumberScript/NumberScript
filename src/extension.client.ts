import * as vscode from 'vscode';
import * as fs from 'fs';

// ======================= Worker Code =======================
// We'll inline the server.worker code as a string to avoid separate files
const workerCode = `
self.onmessage = async (e) => {
  const { id, code } = e.data;
  let result;
  let steps = [];
  let graph = null;

  try {
    // Example evaluation: replace this with your real NumberScript execution logic
    result = eval(code);
    steps = [\`Executed code: \${code}\`];
  } catch (err) {
    result = null;
    self.postMessage({ id, error: err.message });
    return;
  }

  self.postMessage({ id, result, steps, graph });
};
`;

// Create a Blob URL for the worker
const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
const workerURL = URL.createObjectURL(workerBlob);
const worker = new Worker(workerURL, { type: 'module' });

// ======================= Webview Classes =======================
class ShowWorkViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private steps: string[] = [];
  constructor(private readonly _extensionUri: vscode.Uri) {}

  setSteps(steps: string[]) {
    this.steps = steps;
    if (this._view) this._view.webview.postMessage({ steps });
  }

  resolveWebviewView(view: vscode.WebviewView) {
    this._view = view;
    view.webview.options = { enableScripts: true };
    const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'webviews', 'showWork.html');
    view.webview.html = fs.readFileSync(htmlPath.fsPath, 'utf8');
  }
}

class GraphPanel {
  static current?: GraphPanel;

  static createOrShow(extensionUri: vscode.Uri, graphData: any) {
    const column = vscode.ViewColumn.Beside;
    if (GraphPanel.current) {
      GraphPanel.current.panel.reveal(column);
      GraphPanel.current.update(graphData);
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      'numberscriptGraph',
      'NumberScript Graph',
      column,
      { enableScripts: true }
    );
    GraphPanel.current = new GraphPanel(panel, extensionUri, graphData);
  }

  constructor(private panel: vscode.WebviewPanel, extensionUri: vscode.Uri, private data: any) {
    const htmlPath = vscode.Uri.joinPath(extensionUri, 'webviews', 'graph.html');
    this.panel.webview.html = fs.readFileSync(htmlPath.fsPath, 'utf8');
    this.panel.onDidDispose(() => { GraphPanel.current = undefined; });
    this.update(data);
  }

  update(data: any) {
    this.panel.webview.postMessage({ graph: data });
  }
}

// ======================= Extension Activation =======================
export function activate(context: vscode.ExtensionContext) {
  const output = vscode.window.createOutputChannel('NumberScript');
  const showWorkProvider = new ShowWorkViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('showWorkView', showWorkProvider)
  );

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
