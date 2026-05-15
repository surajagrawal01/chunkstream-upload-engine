import type { ProcessedFile, UploadFile } from "../types/upload.types";
import { uploadStore } from "../../../store/uploadStore";
import { api } from "../../../lib/axiosInstance";
import { CanceledError } from "axios";

export type LibraryItem = {
    uploadId: string;
    fileId: string;
    fileName: string;
    relativePath?: string;
    createdAt?: string;
    updatedAt?: string;
};

const apiOrigin = () =>
    (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

/** Public URL for `<video src>` / `<audio src>` (must match API host; CORS enabled on server). */
export const getStreamUrl = (
    uploadId: string,
    fileId: string,
    attachment: boolean
) => {
    const q = attachment ? "?disposition=attachment" : "";
    return `${apiOrigin()}/api/upload/stream/${encodeURIComponent(uploadId)}/${encodeURIComponent(fileId)}${q}`;
};

export const fetchCompletedLibrary = async (): Promise<LibraryItem[]> => {
    const response = await api.get<{ items: LibraryItem[] }>("/api/upload/library");
    return response.data.items ?? [];
};

export const initUpload = async (data: UploadFile[]) => {
    try {
        const response = await api.post('/api/upload/init', {
            data
        })
        return response?.data?.uploadId
    } catch (err) {
        console.error("❌ Error:", err);
    }
}

const uploadSingleChunk = async (
    processedFile: ProcessedFile,
    chunkIndex: number,
    uploadId: string,
    signal?: AbortSignal
) => {
    let attempt = 0
    const MAX_ATTEMPTS = 3

    while (attempt < MAX_ATTEMPTS) {
        const formData = new FormData()

        formData.append("file", processedFile.chunks[chunkIndex].blob, "chunk.bin")
        formData.append("fileId", processedFile.fileId)
        formData.append("uploadId", uploadId)
        formData.append("chunkIndex", String(chunkIndex))
        formData.append("fileName", processedFile.fileName)

        try {
            uploadStore.getState().updateChunk(processedFile.fileId, chunkIndex, {
                index: chunkIndex,
                status: "uploading",
            })

            const response = await api.post("/api/upload/chunk", formData, {
                signal,
            });

            const data = response.data;

            uploadStore.getState().updateChunk(data.fileId, data.index, {
                index: data.index,
                status: "completed",
            })

            return
        } catch (err) {
            if (err instanceof CanceledError) {
                throw err;
            }
            console.log("error", err);
            //To increase retries attempt for each chunk
            attempt++

            uploadStore.getState().updateChunk(processedFile.fileId, chunkIndex, {
                index: chunkIndex,
                status: "failed",
                retries: attempt,
            })

            //if reached to max_attempts(3) then finally fail that particular file
            if (attempt === MAX_ATTEMPTS) {
                throw new Error(`Chunk ${chunkIndex} failed`)
            }

            // retrying after some delay 
            await new Promise((res) => setTimeout(res, 300 * attempt))
        }
    }
}


export const handleChunkUpload = async (
    processedFile: ProcessedFile,
    uploadId: string,
    signal?: AbortSignal
) => {
    const CONCURRENCY = 3
    let active = 0
    let currentIndex = 0
    let hasError = false

    //-> With promise 
    //one central controller for the whole system whether the file is completely uploaded or rejected
    //All flows are coordinated under ONE lifecycle, all async calls happen INSIDE
    //All async actions coordinated under ONE resolve()

    //-> With async-await
    //with async await Multiple async chains running, But no single controller tracking all of them
    //Execution splits into multiple independent flows, No central lifecycle tracking, spawns more async calls (not awaited)
    //Multiple independent microtask chains, No single completion signal
    // Chain A ──────┐
    //               ├── ends early ❌
    // Chain B ──────┤
    // Chain C ──────┘ (still running)

    return new Promise<Record<string, string>>((resolve, reject) => {
        uploadStore.getState().updateFileStatus(processedFile.fileId, "uploading")

        const next = () => {
            //stop if error occurred to handle the final error (if chunk upload fails for more than three times)
            if (hasError) return

            // upload done
            if (currentIndex >= processedFile.chunks.length && active === 0) {
                uploadStore.getState().updateFileStatus(processedFile.fileId, "completed")
                return resolve({
                    message: "File Upload Done",
                    fileName: processedFile?.fileName
                })
            }

            // refill the slot -> for parallel uploads
            while (active < CONCURRENCY && currentIndex < processedFile.chunks.length) {
                const chunkIndex = currentIndex++
                active++

                uploadSingleChunk(processedFile, chunkIndex, uploadId, signal)
                    .catch((err) => {
                        if (signal?.aborted || err instanceof CanceledError) {
                            hasError = true;
                            reject(err);
                            return;
                        }
                        hasError = true;
                        uploadStore
                            .getState()
                            .updateFileStatus(processedFile.fileId, "failed");
                        reject(err);
                    })
                    .finally(() => {
                        active--
                        next() // refill slot
                    })
            }
        }

        next()
    })
}

export const clearUploadSessionAPI = async (uploadId: string) => {
    try {
        const response = await api.post(`/api/upload/clear?uploadId=${uploadId}`)
        return response?.data
    } catch (err) {
        console.error("❌ Error:", err);
    }
}