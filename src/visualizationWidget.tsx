import React, { useEffect, useState, useMemo } from 'react';
import { DisplayData } from './types';
import { KernelExecutor } from './kernelExecutor';
import { NotebookUpdater } from './notebookUpdater';

interface VisualizationWidgetProps {
    data: DisplayData;
    notebook: any; // VSCode notebook reference
}

export const VisualizationWidget: React.FC<VisualizationWidgetProps> = ({ 
    data: initData, 
    notebook 
}) => {
    const [data, setData] = useState<DisplayData>(initData);
    const [isS3Storage, setS3Storage] = useState<boolean>(data.type === "s3");
    const [isAsyncLoading, setAsyncLoading] = useState<boolean>(false);

    const kernelExecutor = useMemo(() => 
        new KernelExecutor(notebook, data.kernel_id), 
        [notebook, data.kernel_id]
    );

    const notebookUpdater = useMemo(() => 
        new NotebookUpdater(notebook), 
        [notebook]
    );

    const generateMetadata = useMemo(() => {
        return async () => {
            const value = await kernelExecutor.execute(`display(${data.interface_id}.generate_metadata_str())`);
            if (data.type === "cell") {
                await notebookUpdater.updateCell({...data, metadata_str: value});
            }
            return value;
        };
    }, [data, kernelExecutor, notebookUpdater]);

    const generateSummarySchema = useMemo(() => {
        return async () => {
            const value = await kernelExecutor.execute(`display(${data.interface_id}.generate_summary_schema_str())`);
            if (data.type === "cell") {
                await notebookUpdater.updateCell({...data, summary_schema_str: value});
            }
            return value;
        };
    }, [data, kernelExecutor, notebookUpdater]);

    const generateColumnSchema = useMemo(() => {
        return async (column: string) => {
            const value = await kernelExecutor.execute(`display(${data.interface_id}.generate_column_schema_str(column = "${column}"))`);
            if (data.type === "cell") {
                await notebookUpdater.updateCell({
                    ...data, 
                    column_schema_str_dict: {...data.column_schema_str_dict, [column]: value}
                });
            }
            return value;
        };
    }, [data, kernelExecutor, notebookUpdater]);

    useEffect(() => {
        async function updateOutput(): Promise<DisplayData | undefined> {
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
            } else if (!isS3Storage && data.type !== "cell") {
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

        updateOutput().then(async displayData => {
            if (displayData) {
                setData(displayData);
                await notebookUpdater.updateCell(displayData);
            }
        }).catch(console.error);
    }, [isS3Storage, kernelExecutor, notebookUpdater]);

    if (data.type === "default") {
        return <div>Preparing your data for display...</div>;
    }

    return (
        <div>
            {isAsyncLoading && <div>Uploading data to S3...</div>}
            <div>
                <h3>Data Visualization</h3>
                <p>Interface ID: {data.interface_id}</p>
                <p>Connection: {data.connection_name}</p>
                <p>Original Size: {data.original_size}</p>
                <p>Storage Type: {data.type}</p>
                
                <button onClick={() => setS3Storage(!isS3Storage)}>
                    Switch to {isS3Storage ? 'Cell' : 'S3'} Storage
                </button>
                
                {data.type === "cell" && (
                    <div>
                        <button onClick={generateMetadata}>Generate Metadata</button>
                        <button onClick={generateSummarySchema}>Generate Summary Schema</button>
                        <button onClick={() => generateColumnSchema('example_column')}>
                            Generate Column Schema
                        </button>
                    </div>
                )}
                
                {data.type === "s3" && (
                    <div>
                        <p>S3 Path: {data.s3_path}</p>
                        <p>S3 Size: {data.s3_size}</p>
                    </div>
                )}
            </div>
        </div>
    );
};