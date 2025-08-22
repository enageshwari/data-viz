import React, { useEffect, useState } from 'react';
import { DisplayData } from './types';

interface VisualizationWidgetProps {
    data: DisplayData;
    notebook: any;
}

interface DataVisualizationWidgetExport {
    renderToDom: (config: any) => () => void;
}

interface PackageMetadataResponse {
    metadata: {
        module?: {
            path: string;
        };
    };
    basePath: string;
}

const LOTUS_HOST = 'public.lotus.awt.aws.a2z.com';
const LOTUS_METADATA_PATH = '/metadata';

const buildPackageMetadataApiUrl = (packageName: string, majorVersion: string, aliasName?: string): URL => {
    const url = new URL(`https://${LOTUS_HOST}${LOTUS_METADATA_PATH}`);
    url.searchParams.append('packageName', packageName);
    url.searchParams.append('majorVersion', majorVersion);
    if (aliasName) {
        url.searchParams.append('aliasName', aliasName);
    }
    return url;
};

const importWidget = async (stage = 'prod', aliasName = ''): Promise<DataVisualizationWidgetExport> => {
    const packageName = '@amzn/maxdome-data-visualization-widget';
    const majorVersion = '1';
    const packageNameSuffix = stage === 'prod' ? '' : `-${stage}`;
    const fullPackageName = `${packageName}${packageNameSuffix}`;

    const metadataUrl = buildPackageMetadataApiUrl(fullPackageName, majorVersion, aliasName);
    console.log('Fetching metadata from:', metadataUrl.toString());
    
    const metadataResponse = await fetch(metadataUrl.toString());
    console.log('Metadata response status:', metadataResponse.status);
    
    if (!metadataResponse.ok) {
        throw new Error(`Failed to fetch package metadata: ${metadataResponse.status} ${metadataResponse.statusText}`);
    }
    
    const packageMetadata: PackageMetadataResponse = await metadataResponse.json();
    console.log('Package metadata received:', packageMetadata);
    
    if (!packageMetadata.basePath || !packageMetadata.metadata.module?.path) {
        throw new Error('Invalid package metadata structure');
    }
    
    const moduleUrl = packageMetadata.basePath + packageMetadata.metadata.module.path;
    console.log('Importing widget from:', moduleUrl);
    
    const widgetModule = await import(
        /* webpackIgnore: true */ 
        moduleUrl
    );
    console.log('Widget module imported:', Object.keys(widgetModule));
    
    return widgetModule;
};

export const VisualizationWidget: React.FC<VisualizationWidgetProps> = ({ data }) => {
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let unmount: () => void;
        
        const loadWidget = () => {
            const element = document.getElementById(data.interface_id);
            if (!element) {
                setTimeout(loadWidget, 10);
                return;
            }
            
            const props = {
                domId: data.interface_id,
                visualizationProps: data.type === "s3" ? {
                    type: "s3",
                    visualizationDataProps: {
                        originalSize: data.original_size,
                        s3Path: data.s3_path,
                        s3Size: data.s3_size,
                    }
                } : data.type === "cell" ? {
                    type: "cell",
                    visualizationDataProps: {
                        originalSize: data.original_size,
                        dataId: data.interface_id,
                        dataStr: data.data_str,
                        metadataStr: data.metadata_str,
                        summarySchemaStr: data.summary_schema_str,
                        columnSchemaStrDict: data.column_schema_str_dict || {},
                        plotDataStrDict: data.echart_data_str_dict || {},
                    }
                } : {}
            };
            
            importWidget()
                .then(widgetExport => {
                    unmount = widgetExport.renderToDom(props);
                })
                .catch(error => {
                    console.error('Failed to import widget', error);
                    setError(error);
                });
        };
        
        loadWidget();
            
        return () => unmount?.();
    }, [data]);

    if (data.type === "default") {
        return <div>Preparing your data for display...</div>;
    }

    if (error) {
        return <div>Unable to load display widget.</div>;
    }

    return <div id={data.interface_id} style={{ display: 'contents' }} />;
};