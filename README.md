# Data Visualization Renderer for VSCode

A VSCode extension that provides custom MIME rendering for data visualization using dynamic widget loading from Lotus CDN.

## Features

- **Custom MIME Renderer**: Handles `application/sagemaker-display` MIME type in VSCode notebooks
- **Dynamic Widget Loading**: Imports visualization widgets from Lotus CDN (`@amzn/maxdome-data-visualization-widget`)
- **Multiple Data Types**: Supports S3, cell-based, and default data formats
- **Error Resilience**: Graceful fallbacks for network or loading failures
- **React Integration**: Modern React 18 with TypeScript

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

The extension automatically registers as a notebook renderer for `application/sagemaker-display` MIME type. When notebook cells output data with this MIME type, the extension:

1. Parses the JSON data structure
2. Dynamically imports the visualization widget from Lotus CDN
3. Renders the interactive visualization in the notebook output

### Supported Data Formats

- **S3 Data**: References data stored in S3 buckets
- **Cell Data**: Inline data with metadata and schema information
- **Default**: Placeholder for data preparation states

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system architecture and component descriptions.

## Development

### Build Commands
- `npm run compile` - Compile TypeScript and bundle with Webpack
- `npm run watch` - Watch for changes and recompile
- `npm run vscode:prepublish` - Prepare for publishing

### Testing
- Press F5 to launch Extension Development Host
- Open `test-notebook.ipynb` to see sample visualizations
- Check browser console for debugging information

### Key Files
- `src/extension.ts` - Extension entry point (minimal activation)
- `src/renderer.tsx` - VSCode notebook renderer
- `src/visualizationWidget.tsx` - Main React visualization component
- `src/types.ts` - TypeScript type definitions
- `package.json` - Extension manifest with renderer registration

## External Dependencies

- **Lotus CDN**: `@amzn/maxdome-data-visualization-widget` for visualization rendering
- **React 18**: Modern React with createRoot API
- **VSCode Notebook API**: For renderer integration