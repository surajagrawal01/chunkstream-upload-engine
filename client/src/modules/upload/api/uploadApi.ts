import axios from "axios"
import type { UploadFile } from "../types/upload.types";


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
