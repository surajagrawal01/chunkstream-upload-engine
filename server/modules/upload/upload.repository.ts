//Db Layer

import { UploadModel } from "./upload.model.js";
import { initUploadModel, updateFileChunkStatus, updateFileUploadStatus } from "./upload.types.js";

export const createUpload = async (data: initUploadModel) => {
    try {
        const upload = await UploadModel.create(data);
        return upload;
    } catch (err) {
        console.log("🚀 ~ createUpload ~ err:", err)
    }
}

export const updateUploadStatus = async (data: updateFileUploadStatus) => {
    try {
        const file = await UploadModel.findOneAndUpdate({
            uploadId: data?.uploadId,
            fileId: data?.fileId
        }, { $set: { status: data?.status } })
        return file;
    } catch (err) {
        console.log("🚀 ~ createUpload ~ err:", err)
    }
}

export const updateFileUpload = async (data: updateFileChunkStatus) => {
    try {
        const { uploadId, fileId, chunkIndex } = data;
        const file = await UploadModel.updateOne(
            { uploadId, fileId },
            {
                $set: {
                    [`uploadedChunks.${chunkIndex}`]: true
                }
            }
        );
    } catch (err) {
        console.log("🚀 ~ createUpload ~ err:", err)
    }
}

export const getUploadStatus = async (uploadId: string) => {
    try {
        const uploads = await UploadModel.find({
            uploadId: uploadId
        });

        if (!uploads.length) {
            return {
                uploadId: uploadId,
                files: []
            };
        }

        const files = uploads.map((upload) => {
            const uploadedChunksMap = upload.uploadedChunks || new Map();

            // Convert Map → Array<number>
            const uploadedChunks = Array.from(uploadedChunksMap.entries())
                .filter(([_, value]) => value === true)
                .map(([key]) => Number(key)); // keys are strings

            return {
                fileId: upload.fileId,
                uploadedChunks
            };
        });

        return {
            uploadId: uploadId,
            files
        };

    } catch (err) {
        console.log("🚀 ~ getUploadStatus ~ err:", err);
        throw err;
    }
};

export const uploadRepo = { createUpload, updateUploadStatus };