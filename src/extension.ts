// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

const getHtml = (obj: { local: string; vcd: string | vscode.Uri }) => {
  return `
  <html>
	<head>
	  <meta charset="UTF-8">
	  <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline'; worker-src * data: 'unsafe-inline' 'unsafe-eval'; font-src * 'unsafe-inline' 'unsafe-eval';">
	  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 fill=%22grey%22 font-size=%2290%22>🌊</text></svg>">
	  <title>VCDrom</title>
	  <link rel="preload" as="font" href="${obj.local}/iosevka-term-light.woff2" type="font/woff2" crossorigin>
	  <link rel="stylesheet" href="${obj.local}/codemirror.css">
	  <link rel="stylesheet" href="${obj.local}/vcdrom.css">
	  <script src="${obj.local}/vcdrom.js"></script>
	</head>
	<body>
	  <script>
		window.addEventListener('load', () => {
		  VCDrom('waveform1', '${obj.vcd}');
		});
		const api = window.VsCodeApi = acquireVsCodeApi();
		window.addEventListener('message', event => {
		  console.log(event);
		});
	  </script>
	  <div id="waveform1" style="height: 100%"></div>
	</body>
  </html>
  `;
};

const perPanel =
  (extensionContext: vscode.ExtensionContext) => async (vcd: vscode.Uri) => {
    console.log(vcd);
	if (vcd === undefined) {
		console.log('unable to load the .vcd file');
		return;
	}
    const fullName = vcd.path;
    const fullNameArr = fullName.split("/");
    const fileName = fullNameArr.pop()!;

    const fileNameArr = fileName.split(".");
    if (fileNameArr.length > 1) {
      fileNameArr.pop(); // remove extention
    }

    const title = fileNameArr.join(".");
    const vcdDir = fullNameArr.join("/");
    console.log(vcdDir);
    // const title = path.basename(fname);
    // const vcdDir = path.dirname(fname);

    const local = vscode.Uri.file(
      // path.join(extensionContext.extensionPath, 'app')
      extensionContext.extensionPath + "/out"
    );

    const panel = vscode.window.createWebviewPanel(
      "vcdrom", // ID
      title, // Title
      2, // vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [local, vscode.Uri.file(vcdDir)],
      }
    );

	const vcdUri = panel.webview.asWebviewUri(vcd);

    panel.webview.html = getHtml({
      local: "https://drom.io/vcd", // panel.webview.asWebviewUri(local),
      vcd: vcdUri,
    });

    // const s1 = fs.createReadStream(vcd.fsPath);
    // for await (const chunk of s1) {
    //   console.log(chunk.length);
    // }
  };

export function activate(context: vscode.ExtensionContext) {
  console.log("vcdrom is activated!");

  const disposable = vscode.commands.registerCommand(
    "vcdrom.start",
    perPanel(context)
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  console.log("vcdrom is deactivated!");
}
