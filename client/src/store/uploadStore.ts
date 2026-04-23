
import { create } from 'zustand';
import type { ChunkMeta, UploadStatus, UploadStoreFile } from '../shared/types/types';

type UploadStore = {
    files: UploadStoreFile[]
    addFiles: (files: UploadStoreFile[]) => void,
    updateFileStatus: (fileId: string, status: UploadStatus) => void,
    updateProgress: (fileId: string, progress: number) => void,
    updateChunk: (fileId: string, chunkIndex: number, data: Partial<ChunkMeta>) => void
};

export const uploadStore = create<UploadStore>((set) => ({
    files: [],
    addFiles: (files) => set(() => ({ files: files })),
    updateFileStatus: (fileId: string, status: UploadStatus) => {
        set((state) => ({
            files: state.files.map((file) =>
                file.fileId === fileId
                    ? { ...file, status }
                    : file
            )
        }))
    },
    updateProgress: (fileId: string, progress: number) => {
        set((state) => ({
            files: state.files.map((file) =>
                file.fileId === fileId
                    ? { ...file, progress }
                    : file
            )
        }))
    },
    updateChunk: (fileId: string, chunkIndex: number, data: Partial<ChunkMeta>) => {
        const isCompleted = data?.status === 'completed'
        set((state) => ({
            files: state.files.map((file) =>
                file.fileId === fileId
                    ? {
                        ...file,
                        uploadedChunks: isCompleted ? file.uploadedChunks + 1 : file.uploadedChunks,
                        progress: isCompleted ? Math.ceil(((file.uploadedChunks + 1) / file.totalChunks) * 100) : file.progress,
                        chunksMeta: {
                            ...file.chunksMeta, [chunkIndex]: {
                                ...file.chunksMeta[chunkIndex],
                                ...data
                            },

                        }
                    }
                    : file
            )
        }))
    }

}))
