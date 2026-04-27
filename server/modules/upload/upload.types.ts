export interface initUploadDTO {
    fileId: string,
    fileName: string,
    totalChunks: number,
    relativePath: string
}

export interface uploadChunkDTO {
    fileId: string;
    uploadId: string;
    chunkIndex: number;
    chunk: Buffer;
};
export interface UploadResponse {
    uploadId: string;
}

export interface initUploadModel {
    uploadId: string,
    fileId: string,
    fileName: string,
    totalChunks: number,
    status: 'pending' | 'uploading' | 'completed' | 'failed'
}

export interface updateFileUploadStatus {
    uploadId: string,
    fileId: string,
    status: 'pending' | 'uploading' | 'completed' | 'failed'
}

export interface updateFileChunkStatus {
    uploadId: string,
    fileId: string,
    chunkIndex: number
}

export interface mergeChunkDTO {
    fileId: string
    uploadId: string
    fileName: string
    totalChunks: number
    basePath: string
}