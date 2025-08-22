import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { VisualizationWidget } from './visualizationWidget';
import { DisplayData } from './types';

export function activate() {
    return {
        renderOutputItem(outputItem: any, element: HTMLElement) {
            try {
                const data = outputItem.json() as DisplayData;
                
                const root = createRoot(element);
                root.render(
                    React.createElement(VisualizationWidget, {
                        data: data,
                        notebook: {}
                    })
                );

                return {
                    dispose() {
                        root.unmount();
                    }
                };
            } catch (error) {
                console.error('Error rendering visualization:', error);
                element.innerHTML = `<div style="color: red;">Error rendering visualization: ${error}</div>`;
                return { dispose() {} };
            }
        }
    };
}