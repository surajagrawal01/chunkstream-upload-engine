import type { UploadFile } from "../types/upload.types";
import { createChunks } from "../utils/helper";

export const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return null;
    const files = e.target.files;
    const arrayFiles = Array.from(files)
    console.log("🚀 ~ handleMultipleFileSelect ~ arrayFiles:", arrayFiles)
    const processedFiles: UploadFile[] = []
    const apiRequestForm = []

    for (let i = 0; i < arrayFiles.length; i++) {
        const file = arrayFiles[i]
        const chunks = createChunks(file);
        processedFiles.push({
            fileId: `file - ${file?.name} - ${Date.now()} - ${Math.random().toString(36).slice(2)}`,
            name: file?.name,
            size: file?.size,
            path: file?.webkitRelativePath || undefined,
            totalChunks: chunks.length,
            chunks: chunks
        })

        apiRequestForm.push({
            fileId: `file - ${file?.name} - ${Date.now()} - ${Math.random().toString(36).slice(2)}`,
            fileName: file?.name,
            totalChunks: chunks.length,
            relativePath: file?.webkitRelativePath || file?.name,
        })
    }
    console.log("🚀 ~ handleFileSelection ~ processedFiles:", processedFiles)
    console.log("🚀 ~ handleFileSelection ~ apiRequestForm:", apiRequestForm)

}