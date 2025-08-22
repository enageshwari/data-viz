import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Data Visualization Renderer extension is now active');
    
    // The notebook renderer is automatically registered via package.json contributes.notebookRenderer
    // No additional registration needed here
}

export function deactivate() {}