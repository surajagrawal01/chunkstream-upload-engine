export type ChunkStatus = 'pending' | 'uploading' | 'completed' | 'failed';

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed';

export interface ChunkMeta {
    status: ChunkStatus,
    index: number,
    retries: number
}

export interface UploadStoreFile {
    fileId: string,
    file: File,
    status: UploadStatus,
    progress: number,
    uploadedChunks: number,
    totalChunks: number,
    chunksMeta: Record<number, ChunkMeta>
}