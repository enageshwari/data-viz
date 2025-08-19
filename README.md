# Data Visualization Renderer for VSCode

A VSCode extension that provides custom MIME rendering for data visualization, adapted from SageMaker Studio implementation.

## Features

- Custom MIME renderer for `application/sagemaker-display`
- Support for S3 and cell-based data storage
- Interactive data visualization widgets
- Kernel execution capabilities
- Dynamic notebook output updates

## Installation

1. Install dependencies:
```bash
npm install
```

2. Compile the extension:
```bash
npm run compile
```

3. Press F5 to run the extension in a new Extension Development Host window

## Usage

The extension automatically registers a notebook renderer for the MIME type `application/sagemaker-display`. When notebook cells output data with this MIME type, the custom visualization widget will be rendered.

## Architecture

```
Extension Entry Point (extension.ts)
│
├── Renderer (renderer.tsx) - VSCode notebook renderer
│   └── VisualizationWidget - Main React component
│       ├── KernelExecutor - Execute Python code in notebooks
│       └── NotebookUpdater - Update notebook cell outputs
│
└── Types (types.ts) - TypeScript interfaces
```

## Key Differences from SageMaker Implementation

- Uses VSCode Notebook API instead of JupyterLab
- Simplified kernel execution (demo implementation)
- VSCode-specific renderer activation pattern
- Adapted React component lifecycle for VSCode

## Development

- `npm run compile` - Compile TypeScript
- `npm run watch` - Watch for changes and recompile
- Press F5 to test in Extension Development Host