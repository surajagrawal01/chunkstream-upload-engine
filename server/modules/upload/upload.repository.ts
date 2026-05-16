//Db Layer

import { UploadModel } from "./upload.model.js";
import { initUploadModel, LibraryUploadRow, updateFileChunkStatus, updateFileUploadStatus } from "./upload.types.js";

export const createUpload = async (data: initUploadModel) => {
    try {
        return await UploadModel.create(data);
    } catch (err) {
        console.error("createUpload error:", err)
        throw err;
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
        console.error("updateUploadStatus error:", err)
        throw err;
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
        return file;
    } catch (err) {
        console.error("updateFileUpload error:", err)
        throw err;
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
        console.error("getUploadStatus error:", err);
        throw err;
    }
};

//function used by the service to reconstruct an in-memory session after
export const getUploadFiles = async (uploadId: string) => {
    try {
        const uploads = await UploadModel.find({ uploadId });
        return uploads.map((upload) => {
            const uploadedChunksMap = upload.uploadedChunks || new Map();
            const uploadedChunks = Array.from(uploadedChunksMap.entries())
                .filter(([_, value]) => value === true)
                .map(([key]) => Number(key));

            return {
                fileId: upload.fileId,
                fileName: upload.fileName,
                relativePath: upload.relativePath as string | undefined,
                totalChunks: upload.totalChunks,
                uploadedChunks
            };
        });
    } catch (err) {
        console.error("getUploadFiles error:", err);
        throw err;
    }
};

/** All merged-ready files for the global library UI */
export const listCompletedUploads = async (): Promise<LibraryUploadRow[]> => {
    const uploads = await UploadModel.find({ status: "completed" })
        .sort({ updatedAt: -1 })
        .select("uploadId fileId fileName relativePath createdAt updatedAt")
        .lean();

    return uploads.map((u) => ({
        uploadId: u.uploadId,
        fileId: u.fileId,
        fileName: u.fileName,
        relativePath: u.relativePath ?? undefined,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
    }));
};

export const findCompletedUploadFile = async (
    uploadId: string,
    fileId: string
): Promise<LibraryUploadRow | null> => {
    const doc = await UploadModel.findOne({
        uploadId,
        fileId,
        status: "completed",
    })
        .select("uploadId fileId fileName relativePath")
        .lean();

    if (!doc) return null;

    return {
        uploadId: doc.uploadId,
        fileId: doc.fileId,
        fileName: doc.fileName,
        relativePath: doc.relativePath ?? undefined,
    };
};

export const uploadRepo = { createUpload, updateUploadStatus };