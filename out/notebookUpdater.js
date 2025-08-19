import * as vscode from 'vscode';
export class NotebookUpdater {
    constructor(notebook) {
        this.notebook = notebook;
    }
    async updateCell(newData) {
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
                new vscode.NotebookEdit(new vscode.NotebookRange(cell.index, cell.index + 1), [{
                        kind: vscode.NotebookCellKind.Code,
                        languageId: cell.document.languageId,
                        value: cell.document.getText(),
                        outputs: outputs
                    }])
            ]);
            return await vscode.workspace.applyEdit(edit);
        }
        catch (error) {
            console.error('Error updating notebook output:', error);
            return false;
        }
    }
    async findOutputLocation(interfaceId) {
        for (const cell of this.notebook.getCells()) {
            for (let outputIndex = 0; outputIndex < cell.outputs.length; outputIndex++) {
                const output = cell.outputs[outputIndex];
                for (const item of output.items) {
                    if (item.mime === 'application/sagemaker-display') {
                        try {
                            const data = JSON.parse(item.data.toString());
                            if (data.interface_id === interfaceId) {
                                return { cell, outputIndex };
                            }
                        }
                        catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        }
        return undefined;
    }
}
//# sourceMappingURL=notebookUpdater.js.map