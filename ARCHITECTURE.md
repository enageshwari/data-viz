# Architecture

## System Overview

The VSCode Data Visualization Extension provides custom MIME rendering for `application/sagemaker-display` content in Jupyter notebooks within VSCode.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    VSCode Extension Host                        │
├─────────────────────────────────────────────────────────────────┤
│  Extension Entry Point (extension.ts)                          │
│  └─ Minimal activation - renderer auto-registered via manifest │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Notebook Renderer (renderer.tsx)               │
│  ├─ React Root Creation & Management                           │
│  ├─ Output Item JSON Parsing                                   │
│  ├─ Error Handling & Fallback Display                          │
│  └─ Component Lifecycle Management                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│            VisualizationWidget (visualizationWidget.tsx)       │
│  ├─ Dynamic Widget Import from Lotus CDN                      │
│  ├─ Data Type Processing (S3/Cell/Default)                    │
│  ├─ Props Configuration & Mapping                             │
│  ├─ DOM Element Management                                     │
│  └─ Error State Handling                                       │
└─────────────────────────────────────────────────────────────────┘
                    │                           │
                    ▼                           ▼
┌─────────────────────────┐    ┌─────────────────────────────────┐
│   KernelExecutor        │    │      NotebookUpdater            │
│   (kernelExecutor.ts)   │    │   (notebookUpdater.ts)          │
│  ├─ Demo Implementation │    │  ├─ Cell Output Updates         │
│  ├─ Timeout Handling    │    │  ├─ Interface ID Matching       │
│  └─ Controller Mgmt     │    │  └─ Workspace Edit API          │
└─────────────────────────┘    └─────────────────────────────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Type Definitions (types.ts)                 │
│  ├─ DisplayData Union Type                                     │
│  ├─ S3DisplayData Interface                                    │
│  ├─ CellDisplayData Interface                                  │
│  └─ DefaultDisplayData Interface                               │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Extension Entry Point (`extension.ts`)
- **Purpose**: Minimal VSCode extension activation
- **Functionality**: Logs activation message only
- **Registration**: Notebook renderer registered via `package.json` manifest

### 2. Notebook Renderer (`renderer.tsx`)
- **Purpose**: VSCode notebook output renderer
- **Key Features**:
  - Creates React root for each output item
  - Parses JSON data from notebook output
  - Handles rendering errors gracefully
  - Manages component disposal

### 3. Visualization Widget (`visualizationWidget.tsx`)
- **Purpose**: Main React component for data visualization
- **Key Features**:
  - Dynamic import from Lotus CDN (`@amzn/maxdome-data-visualization-widget`)
  - Supports three data types: S3, Cell, and Default
  - Configures visualization props based on data type
  - Error handling with fallback UI

### 4. Support Components
- **KernelExecutor**: Demo implementation for notebook kernel interaction
- **NotebookUpdater**: Handles updating notebook cell outputs
- **Types**: TypeScript interfaces for data structures

## Data Flow

1. **Notebook Output**: Cell outputs `application/sagemaker-display` MIME type
2. **Renderer Activation**: VSCode calls renderer for matching MIME type
3. **Data Parsing**: JSON data extracted and typed as `DisplayData`
4. **Widget Loading**: Dynamic import from Lotus CDN
5. **Visualization**: External widget renders data visualization
6. **Error Handling**: Fallback UI for loading failures

## Build System

- **TypeScript**: Source compilation with `tsc`
- **Webpack**: Renderer bundling for web environment
- **Target**: ES2020 with browser compatibility
- **Output**: `out/extension.js` and `out/renderer.js`

## Key Design Decisions

1. **Minimal Extension**: Extension entry point only logs activation
2. **External Widget**: Visualization logic delegated to Lotus CDN package
3. **Error Resilience**: Graceful fallbacks for network/loading failures
4. **Type Safety**: Strong TypeScript typing throughout
5. **React Integration**: Modern React 18 with createRoot API