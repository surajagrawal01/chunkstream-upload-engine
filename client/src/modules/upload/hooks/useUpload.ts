import type { ChunkMeta, UploadStoreFile } from "../../../shared/types/types";
import { uploadStore } from "../../../store/uploadStore";
import { handleChunkUpload, initUpload } from "../api/uploadApi";
import type { ProcessedFile, UploadFile } from "../types/upload.types";
import { createChunks } from "../utils/helper";
const processedFiles: ProcessedFile[] = []
const apiRequestForm: UploadFile[] = []
const uploadStoreFiles: UploadStoreFile[] = []
let uploadId: string | undefined = undefined

export const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
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
                    retries: 3,
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
            uploadStore.getState().addFiles(uploadStoreFiles);
        }

        console.log("🚀 ~ handleFileSelection ~ processedFiles:", processedFiles)
        console.log("🚀 ~ handleFileSelection ~ apiRequestForm:", apiRequestForm)

    } catch (err) {
        console.log(err)
    }

}


export const handleFileUpload = async () => {
    for (let i = 0; i < processedFiles.length; i++) {
        try {
            console.log("here")
            if (uploadId) {
                const data = await handleChunkUpload(processedFiles[i], uploadId)
                console.log("🚀 ~ handleFileUpload ~ res:", data)
            }
        } catch (err) {
            console.log('Error', err);
            console.log(`File failed: ${processedFiles[i].fileName}`)
        }
    }
}