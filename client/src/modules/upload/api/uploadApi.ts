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

        for (let i = 0; i < processedFile.chunks.length; i++) {
            uploadStore.getState().updateFileStatus(processedFile?.fileId, 'uploading')
            const formData = new FormData();

            formData.append("file", processedFile.chunks[i].blob, "chunk.bin");// 👈 actual chunk
            formData.append("fileId", processedFile?.fileId);
            formData.append("uploadId", uploadId);
            formData.append("chunkIndex", String(i));
            formData.append("fileName", processedFile?.fileName)

            const response = await axios.post(
                "http://localhost:5000/api/upload/chunk",
                formData
            );
            const data = response?.data

            if (data?.fileId) {
                uploadStore.getState().updateChunk(data?.fileId, data?.index, { index: data?.index, status: 'completed' })

            }
            console.log("✅ Response:", response.data);

        }
        uploadStore.getState().updateFileStatus(processedFile?.fileId, 'completed')
        return {
            status: 200,
            message: `Chunks Uploaded Successful for - Name - ${processedFile.fileName} - Chunks - ${processedFile.chunks.length}`
        }

    } catch (err) {
        console.error("❌ Error:", err);
    }
};