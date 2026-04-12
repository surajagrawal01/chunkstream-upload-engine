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
    fileName: string,
    totalChunks: number,
    uploadId: string
}

export interface mergeChunkDTO {
    fileId: string
    uploadId: string
    fileName: string
    totalChunks: number
}