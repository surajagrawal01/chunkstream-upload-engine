import axios from "axios"
import type { ProcessedFile, UploadFile } from "../types/upload.types";
import { uploadStore } from "../../../store/uploadStore";

export const initUpload = async (data: UploadFile[]) => {
    try {
        const response = await axios.post('http://localhost:5000/api/upload/init', {
            data
        })
        return response?.data?.uploadId
    } catch (err) {
        console.error("❌ Error:", err);
    }
}

export const handleChunkUpload = async (processedFile: ProcessedFile, uploadId: string) => {
    try {

        uploadStore.getState().updateFileStatus(processedFile?.fileId, 'uploading')
        for (let i = 0; i < processedFile.chunks.length; i++) {

            let attempt = 0
            const MAX_RETRIES = 3

            while (attempt < MAX_RETRIES) {
                const formData = new FormData();

                formData.append("file", processedFile.chunks[i].blob, "chunk.bin");// 👈 actual chunk
                formData.append("fileId", processedFile?.fileId);
                formData.append("uploadId", uploadId);
                formData.append("chunkIndex", String(i));
                formData.append("fileName", processedFile?.fileName)
                try {
                    const response = await axios.post(
                        "http://localhost:5000/api/upload/chunk",
                        formData
                    );
                    const data = response?.data;

                    uploadStore.getState().updateChunk(data?.fileId, data?.index, { index: data?.index, status: 'completed' })

                    break

                } catch (err) {
                    attempt++

                    uploadStore.getState().updateChunk(processedFile?.fileId, i, { index: i, status: 'failed', retries: attempt })
                    console.error("❌ Error:", err);
                    if (attempt === MAX_RETRIES) {
                        throw new Error("Chunk failed max retries")
                    }

                    //  Delay between retries
                    await new Promise(res => setTimeout(res, 300))

                }
            }
        }
        uploadStore.getState().updateFileStatus(processedFile?.fileId, 'completed')
        return {
            status: 200,
            message: `Chunks Uploaded Successful for - Name - ${processedFile.fileName} - Chunks - ${processedFile.chunks.length}`
        }

    } catch (err) {
        uploadStore.getState().updateFileStatus(processedFile.fileId, "failed")

        // rethrow for setting file into failure
        throw err
    }
};