export interface UploadChunk {
    index: number,
    blob: Blob,
    start: number,
    end: number
}

export interface UploadFile {
    fileId: string,
    uploadId?: string,
    name: string,
    size: number,
    path?: string | "",
    totalChunks: number,
    chunks: UploadChunk[]
}