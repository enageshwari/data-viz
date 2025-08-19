import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { VisualizationWidget } from './visualizationWidget';
export function activate() {
    return {
        renderOutputItem(outputItem, element) {
            try {
                const data = outputItem.json();
                const root = createRoot(element);
                root.render(React.createElement(VisualizationWidget, {
                    data: data,
                    notebook: {}
                }));
                return {
                    dispose() {
                        root.unmount();
                    }
                };
            }
            catch (error) {
                console.error('Error rendering visualization:', error);
                element.innerHTML = `<div style="color: red;">Error rendering visualization: ${error}</div>`;
                return { dispose() { } };
            }
        }
    };
}
//# sourceMappingURL=renderer.js.map