import { handleChunkUpload, initUpload } from "../api/uploadApi";
import type { ProcessedFile, UploadFile } from "../types/upload.types";
import { createChunks } from "../utils/helper";
const processedFiles: ProcessedFile[] = []
const apiRequestForm: UploadFile[] = []
let uploadId: string | undefined = undefined

export const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
        if (!e.target.files) return null;
        const files = e.target.files;
        const arrayFiles = Array.from(files)
        console.log("🚀 ~ handleMultipleFileSelect ~ arrayFiles:", arrayFiles)

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
        }

        uploadId = await initUpload(apiRequestForm)

        console.log("🚀 ~ handleFileSelection ~ processedFiles:", processedFiles)
        console.log("🚀 ~ handleFileSelection ~ apiRequestForm:", apiRequestForm)

    } catch (err) {
        console.log(err)
    }

}


export const handleFileUpload = async () => {
    try {
        for (let i = 0; i < processedFiles.length; i++) {
            if (uploadId) {
                const res = await handleChunkUpload(processedFiles[i], uploadId)
                console.log("🚀 ~ handleFileUpload ~ res:", res)
            }
        }
    } catch (err) {
        console.log(err)
    }
}