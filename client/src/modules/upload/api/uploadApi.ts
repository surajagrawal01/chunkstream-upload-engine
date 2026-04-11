import axios from "axios"
import type { ProcessedFile, UploadFile } from "../types/upload.types";


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

            console.log("✅ Response:", response.data);
        }


    } catch (err) {
        console.error("❌ Error:", err);
    }
};