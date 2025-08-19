import React, { useEffect, useState, useMemo } from 'react';
import { KernelExecutor } from './kernelExecutor';
import { NotebookUpdater } from './notebookUpdater';
export const VisualizationWidget = ({ data: initData, notebook }) => {
    const [data, setData] = useState(initData);
    const [isS3Storage, setS3Storage] = useState(data.type === "s3");
    const [isAsyncLoading, setAsyncLoading] = useState(false);
    const kernelExecutor = useMemo(() => new KernelExecutor(notebook, data.kernel_id), [notebook, data.kernel_id]);
    const notebookUpdater = useMemo(() => new NotebookUpdater(notebook), [notebook]);
    const generateMetadata = useMemo(() => {
        return async () => {
            const value = await kernelExecutor.execute(`display(${data.interface_id}.generate_metadata_str())`);
            if (data.type === "cell") {
                await notebookUpdater.updateCell({ ...data, metadata_str: value });
            }
            return value;
        };
    }, [data, kernelExecutor, notebookUpdater]);
    const generateSummarySchema = useMemo(() => {
        return async () => {
            const value = await kernelExecutor.execute(`display(${data.interface_id}.generate_summary_schema_str())`);
            if (data.type === "cell") {
                await notebookUpdater.updateCell({ ...data, summary_schema_str: value });
            }
            return value;
        };
    }, [data, kernelExecutor, notebookUpdater]);
    const generateColumnSchema = useMemo(() => {
        return async (column) => {
            const value = await kernelExecutor.execute(`display(${data.interface_id}.generate_column_schema_str(column = "${column}"))`);
            if (data.type === "cell") {
                await notebookUpdater.updateCell({
                    ...data,
                    column_schema_str_dict: { ...data.column_schema_str_dict, [column]: value }
                });
            }
            return value;
        };
    }, [data, kernelExecutor, notebookUpdater]);
    useEffect(() => {
        async function updateOutput() {
            await kernelExecutor.execute(`${data.interface_id}.set_storage("${isS3Storage ? "s3" : "cell"}")`);
            if (isS3Storage && data.type !== "s3") {
                const s3Path = await kernelExecutor.execute(`display(${data.interface_id}.get_s3_path())`);
                const s3Size = parseInt(await kernelExecutor.execute(`display(${data.interface_id}.get_s3_df_size())`));
                setAsyncLoading(true);
                await kernelExecutor.execute(`display(${data.interface_id}.upload_dataframe_to_s3())`, 1000000);
                setAsyncLoading(false);
                return {
                    type: "s3",
                    kernel_id: data.kernel_id,
                    interface_id: data.interface_id,
                    connection_name: data.connection_name,
                    original_size: data.original_size,
                    s3_path: s3Path,
                    s3_size: s3Size,
                };
            }
            else if (!isS3Storage && data.type !== "cell") {
                const data_str = await kernelExecutor.execute(`display(${data.interface_id}.generate_sample_dataframe_str())`);
                const metadata = await kernelExecutor.execute(`display(${data.interface_id}.generate_metadata_str())`);
                const summary_schema = await kernelExecutor.execute(`display(${data.interface_id}.generate_summary_schema_str())`);
                return {
                    type: "cell",
                    kernel_id: data.kernel_id,
                    interface_id: data.interface_id,
                    connection_name: data.connection_name,
                    original_size: data.original_size,
                    data_str: data_str,
                    metadata_str: metadata,
                    summary_schema_str: summary_schema,
                    column_schema_str_dict: {},
                    echart_data_str_dict: {}
                };
            }
            return undefined;
        }
        updateOutput().then(async (displayData) => {
            if (displayData) {
                setData(displayData);
                await notebookUpdater.updateCell(displayData);
            }
        }).catch(console.error);
    }, [isS3Storage, kernelExecutor, notebookUpdater]);
    if (data.type === "default") {
        return React.createElement("div", null, "Preparing your data for display...");
    }
    return (React.createElement("div", null,
        isAsyncLoading && React.createElement("div", null, "Uploading data to S3..."),
        React.createElement("div", null,
            React.createElement("h3", null, "Data Visualization"),
            React.createElement("p", null,
                "Interface ID: ",
                data.interface_id),
            React.createElement("p", null,
                "Connection: ",
                data.connection_name),
            React.createElement("p", null,
                "Original Size: ",
                data.original_size),
            React.createElement("p", null,
                "Storage Type: ",
                data.type),
            React.createElement("button", { onClick: () => setS3Storage(!isS3Storage) },
                "Switch to ",
                isS3Storage ? 'Cell' : 'S3',
                " Storage"),
            data.type === "cell" && (React.createElement("div", null,
                React.createElement("button", { onClick: generateMetadata }, "Generate Metadata"),
                React.createElement("button", { onClick: generateSummarySchema }, "Generate Summary Schema"),
                React.createElement("button", { onClick: () => generateColumnSchema('example_column') }, "Generate Column Schema"))),
            data.type === "s3" && (React.createElement("div", null,
                React.createElement("p", null,
                    "S3 Path: ",
                    data.s3_path),
                React.createElement("p", null,
                    "S3 Size: ",
                    data.s3_size))))));
};
//# sourceMappingURL=visualizationWidget.js.map