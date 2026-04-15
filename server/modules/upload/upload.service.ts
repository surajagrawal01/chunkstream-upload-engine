import crypto from "crypto";
import * as uploadRepo from "./upload.repository.js";
import { initUploadDTO, mergeChunkDTO, uploadChunkDTO } from "./upload.types.js";
import fs from "fs/promises";
import fsNonPromise from "fs";


//in-memory upload session
const uploadSessions = new Map();

////Session is getting like this for each uploadIs there can be multiple files and
//  based on relative path creating folders inside folderId folder inside uploads folder

// {
//   [uploadId]: {
//     uploadId,
//     files: {
//       f1: {
//         fileName: "video.mp4",
//         relativePath: "video.mp4",
//         totalChunks: 100,
//         receivedChunks: new Set()
//       }
//     }
//   }
// };

export const initUpload = async (data: initUploadDTO[]) => {
    const uploadId = crypto.randomUUID();

    uploadSessions.set(uploadId, {
        uploadId,
        files: new Map()
    })

    const session = uploadSessions.get(uploadId);

    data.forEach(async (fileData: initUploadDTO) => {
        const relativePath = fileData?.relativePath
        const filePath = `/${relativePath.substring(0, relativePath.lastIndexOf("/"))}/${fileData?.fileId}`
        const folderPath = `${uploadId}${filePath}`

        // await uploadRepo.createUpload({
        //     uploadId,
        //     fileName: fileData?.fileName,
        //     totalChunks: fileData?.totalChunks,
        // });

        session.files.set(fileData?.fileId, {
            fileName: fileData?.fileName,
            relativePath: fileData?.relativePath,
            totalChunks: fileData?.totalChunks,
            receivedChunks: new Set()
        })


        await fs.mkdir(`uploads/${folderPath}`, { recursive: true });
    })

    console.log({ uploadSessions })
    return { uploadId };
};

export const uploadChunk = async (data: uploadChunkDTO) => {
    const uploadSessionById = uploadSessions.get(data.uploadId);

    const filesMap = uploadSessionById.files;
    const fileUploadSession = filesMap.get(data?.fileId)

    const basePath = fileUploadSession.relativePath.substring(
        0,
        fileUploadSession.relativePath.lastIndexOf("/")
    );

    const filePath = `${data.uploadId}/${basePath}/${data?.fileId}`;
    const dirPath = `uploads/${filePath}/chunks`;

    await fs.mkdir(dirPath, { recursive: true });
    // ✅ Prevent duplicate chunk write
    if (!fileUploadSession.receivedChunks.has(data.chunkIndex)) {
        fileUploadSession.receivedChunks.add(data.chunkIndex);

        await fs.writeFile(
            `${dirPath}/chunk-${data.chunkIndex}`,
            data.chunk
        );

        console.log(`✅ Chunk ${data.chunkIndex} saved`);
        console.log(`Map`, fileUploadSession.receivedChunks)

        if (fileUploadSession.receivedChunks.size == fileUploadSession.totalChunks) {
            const result = mergeChunks({ fileId: data?.fileId, basePath: basePath, uploadId: data?.uploadId, fileName: fileUploadSession?.fileName, totalChunks: fileUploadSession.totalChunks })
            console.log("🚀 ~ uploadChunk ~ result:", result)
        }

    } else {
        console.log(`⚠️ Chunk ${data.chunkIndex} already exists`);
    }

    return {
        status: "Upload Done",
        index: data?.chunkIndex
    };
};


export const mergeChunks = async (data: mergeChunkDTO) => {
    console.log("🚀 ~ mergeChunks ~ data:", data)

    const finalPath = `uploads/${data?.uploadId}/${data?.basePath}/${data?.fileId}/${data?.fileName}`
    const writeStream = fsNonPromise.createWriteStream(finalPath);


    for (let i = 0; i < data?.totalChunks; i++) {
        const chunkPath = `uploads/${data?.uploadId}/${data?.basePath}/${data?.fileId}/chunks/chunk-${i}`
        console.log("Chunk Index", i)
        const readStream = fsNonPromise.createReadStream(chunkPath);

        await new Promise((resolve, reject) => {
            readStream
                .on("end", resolve)
                .on("error", reject)
                .pipe(writeStream, { end: false })
        })
    }

    writeStream.end();

    return {
        status: "Merge Done",
        fileId: data?.fileId
    }
}


export const uploadService = { initUpload, uploadChunk, mergeChunks };