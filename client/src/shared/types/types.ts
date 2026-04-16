export type ChunkStatus = 'pending' | 'uploading' | 'completed' | 'failure';

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'pending';

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