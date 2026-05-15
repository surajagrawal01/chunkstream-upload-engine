import type { ChunkMeta, UploadStoreFile } from "../../../shared/types/types";
import { uploadStore } from "../../../store/uploadStore";
import { clearUploadSessionAPI, handleChunkUpload, initUpload } from "../api/uploadApi";
import type { ProcessedFile, UploadFile } from "../types/upload.types";
import { createChunks } from "../utils/helper";
import { clearUploadSession, setUploadSession } from "../utils/uploadSession";

const processedFiles: ProcessedFile[] = []
const apiRequestForm: UploadFile[] = []
const uploadStoreFiles: UploadStoreFile[] = []
let uploadId: string | undefined = undefined

let chunkUploadAbortController: AbortController | null = null

export const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>,
    setActiveUploadId: React.Dispatch<
        React.SetStateAction<string | null>
    >) => {
    try {
        processedFiles.length = 0;
        apiRequestForm.length = 0;
        uploadStoreFiles.length = 0;
        uploadId = undefined;
        uploadStore.getState().clearStore();

        if (!e.target.files) return null;
        const files = e.target.files;
        const arrayFiles = Array.from(files)

        for (let i = 0; i < arrayFiles.length; i++) {
            const file = arrayFiles[i]
            const chunks = createChunks(file);
            const fileId = crypto.randomUUID();
            processedFiles.push({
                fileId,
                fileName: file?.name,
                size: file?.size,
                path: file?.webkitRelativePath || undefined,
                totalChunks: chunks.length,
                chunks: chunks
            })

            apiRequestForm.push({
                fileId,
                totalChunks: chunks.length,
                relativePath: file?.webkitRelativePath || file?.name,
                fileName: file?.name
            })

            const processedChunks: Record<number, ChunkMeta> = {}
            for (let i = 0; i < chunks.length; i++) {
                processedChunks[i] = {
                    index: i,
                    retries: 0,
                    status: 'pending'
                }
            }

            uploadStoreFiles.push({
                fileId,
                file: arrayFiles[i],
                status: 'pending',
                progress: 0,
                uploadedChunks: 0,
                totalChunks: chunks.length,
                chunksMeta: processedChunks
            })
        }

        uploadId = await initUpload(apiRequestForm)
        if (uploadId) {
            setUploadSession(uploadId)
            setActiveUploadId(uploadId)
            uploadStore.getState().addFiles(uploadStoreFiles);
        }

    } catch (err) {
        console.log(err)
    }

}


export const handleFileUpload = async (onBatchFinished?: () => void) => {
    chunkUploadAbortController = new AbortController();
    const signal = chunkUploadAbortController.signal;

    try {
        const result = await Promise.all(
            processedFiles.map(async (file) => {
                try {
                    if (uploadId) {
                        await handleChunkUpload(file, uploadId, signal);
                        return {
                            success: true,
                            fileName: file.fileName,
                        };
                    }
                    return {
                        success: false,
                        fileName: file.fileName,
                    };
                } catch (err) {
                    console.log("Error", err);
                    console.log(`File failed: ${file.fileName}`);
                    return {
                        success: false,
                        fileName: file.fileName,
                    };
                }
            })
        );

        const allUploadsCompleted = result.every((file) => file.success);

        if (allUploadsCompleted) {
            clearUploadSession();
        }
    } finally {
        chunkUploadAbortController = null;
        onBatchFinished?.();
    }
};

export const handleCancelUpload = async (
    uploadId: string | null,
    setActiveUploadId: React.Dispatch<React.SetStateAction<string | null>>
) => {
    chunkUploadAbortController?.abort();
    if (!uploadId) {
        return;
    }
    try {
        const data = await clearUploadSessionAPI(uploadId)
        if (data?.status === 200 && data?.uploadId === uploadId) {
            clearUploadSession()
            uploadStore.getState().clearStore()
            setActiveUploadId(null)
        }
    } catch (err) {
        console.log('Error', err);
    }
}
