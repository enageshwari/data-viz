# Usage Guide

## Testing the Extension

1. **Install and compile:**
   ```bash
   npm install
   npm run compile
   ```

2. **Run in development:**
   - Press `F5` in VSCode to open Extension Development Host
   - Open `test-notebook.ipynb` in the new window
   - The custom visualizations should render automatically

## How it Works

The extension registers a notebook renderer for MIME type `application/sagemaker-display` that:

1. **Loads CDN Widget**: Dynamically loads `@amzn/maxdome-data-visualization-widget` from CDN
2. **Renders Data**: Creates interactive visualizations based on the data type:
   - `cell`: Direct data with embedded JSON
   - `s3`: S3-stored data with path reference
   - `default`: Loading state

## Data Format

The renderer expects data in this format:

```json
{
  "type": "cell|s3|default",
  "kernel_id": "string",
  "interface_id": "string", 
  "connection_name": "string",
  "original_size": number,
  // For cell type:
  "data_str": "string",
  "metadata_str": "string",
  // For s3 type:
  "s3_path": "string",
  "s3_size": number
}
```

## Integration

To use in Python notebooks:

```python
from IPython.display import display

data = {
    "type": "cell",
    "kernel_id": "my-kernel",
    "interface_id": "viz-123",
    "connection_name": "my-connection", 
    "original_size": 1024,
    "data_str": '{"x": [1,2,3], "y": [4,5,6]}',
    "metadata_str": '{"title": "My Chart"}'
}

display({"application/sagemaker-display": data}, raw=True)
```