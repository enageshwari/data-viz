import * as vscode from 'vscode';
import { DisplayData } from './types';

export class NotebookUpdater {
    private notebook: vscode.NotebookDocument;

    constructor(notebook: vscode.NotebookDocument) {
        this.notebook = notebook;
    }

    async updateCell(newData: DisplayData): Promise<boolean> {
        try {
            const location = await this.findOutputLocation(newData.interface_id);
            if (!location) {
                console.warn('Could not find matching output for interface_id:', newData.interface_id);
                return false;
            }

            const { cell, outputIndex } = location;
            const outputs = [...cell.outputs];
            
            // Update the output with new data
            outputs[outputIndex] = new vscode.NotebookCellOutput([
                vscode.NotebookCellOutputItem.json(newData, 'application/sagemaker-display')
            ]);

            // Apply the edit using notebook edit API
            const edit = new vscode.WorkspaceEdit();
            edit.set(this.notebook.uri, [
                new vscode.NotebookEdit(
                    new vscode.NotebookRange(cell.index, cell.index + 1),
                    [{
                        kind: vscode.NotebookCellKind.Code,
                        languageId: cell.document.languageId,
                        value: cell.document.getText(),
                        outputs: outputs
                    }]
                )
            ]);
            
            return await vscode.workspace.applyEdit(edit);
        } catch (error) {
            console.error('Error updating notebook output:', error);
            return false;
        }
    }

    private async findOutputLocation(interfaceId: string): Promise<{ cell: vscode.NotebookCell; outputIndex: number } | undefined> {
        for (const cell of this.notebook.getCells()) {
            for (let outputIndex = 0; outputIndex < cell.outputs.length; outputIndex++) {
                const output = cell.outputs[outputIndex];
                
                for (const item of output.items) {
                    if (item.mime === 'application/sagemaker-display') {
                        try {
                            const data = JSON.parse(item.data.toString()) as DisplayData;
                            if (data.interface_id === interfaceId) {
                                return { cell, outputIndex };
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        }
        return undefined;
    }
}