import crypto from "crypto";
import type { Request, Response } from "express";
import { initUploadDTO, LibraryUploadRow, mergeChunkDTO, uploadChunkDTO } from "./upload.types.js";
import fs from "fs/promises";
import fsNonPromise from "fs";
import { createReadStream } from "fs";
import { pipeline } from "stream/promises";
import {
    findCompletedUploadFile,
    getUploadFiles,
    getUploadStatus,
    listCompletedUploads,
    updateFileUpload,
    updateUploadStatus,
    uploadRepo,
} from "./upload.repository.js";
import path from "path";
//in-memory upload session
const uploadSessions = new Map();

export const initUpload = async (data: initUploadDTO[]) => {
    const uploadId = crypto.randomUUID();

    uploadSessions.set(uploadId, {
        uploadId,
        files: new Map()
    })

    const session = uploadSessions.get(uploadId);
    if (!session) {
        throw new Error("Failed to create upload session");
    }

    const result = await Promise.all(data.map(async (fileData: initUploadDTO) => {
        const relativePath = fileData?.relativePath
        const filePath = `/${relativePath.substring(0, relativePath.lastIndexOf("/"))}/${fileData?.fileId}`
        const folderPath = `${uploadId}${filePath}`

        session.files.set(fileData?.fileId, {
            fileName: fileData?.fileName,
            relativePath: fileData?.relativePath,
            totalChunks: fileData?.totalChunks,
            receivedChunks: new Set()
        })

        await fs.mkdir(`uploads/${folderPath}`, { recursive: true });

        //for db to store each file info
        await uploadRepo.createUpload({
            uploadId: uploadId,
            fileId: fileData?.fileId,
            fileName: fileData?.fileName,
            relativePath: fileData?.relativePath,
            totalChunks: fileData?.totalChunks,
            status: 'pending'
        })
    }))

    console.log({ uploadSessions })
    return { uploadId };
};

export const uploadChunk = async (data: uploadChunkDTO) => {
    let uploadSessionById = uploadSessions.get(data.uploadId);
    console.log("🚀 ~ uploadChunk ~ uploadSessionById:", uploadSessionById)

    if (!uploadSessionById) {
        const dbFiles = await getUploadFiles(data.uploadId);
        if (dbFiles && dbFiles.length > 0) {
            const restoredSession = {
                uploadId: data.uploadId,
                files: new Map()
            };
            for (const fileRecord of dbFiles) {
                const relativePath =
                    fileRecord.relativePath ?? fileRecord.fileName;
                restoredSession.files.set(fileRecord.fileId, {
                    fileName: fileRecord.fileName,
                    relativePath,
                    totalChunks: fileRecord.totalChunks,
                    receivedChunks: new Set(fileRecord.uploadedChunks)
                });
            }
            uploadSessions.set(data.uploadId, restoredSession);
            uploadSessionById = uploadSessions.get(data.uploadId);
        }
    }

    const filesMap = uploadSessionById.files;
    const fileUploadSession = filesMap.get(data?.fileId)

    if (!uploadSessionById || !fileUploadSession) {
        throw new Error("Invalid upload session or fileId")
    }

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
        try {
            if (fileUploadSession.receivedChunks.size === 1) {
                await updateUploadStatus({
                    fileId: data?.fileId,
                    uploadId: data?.uploadId,
                    status: 'uploading'
                })
            }
            await fs.writeFile(
                `${dirPath}/chunk-${data.chunkIndex}`,
                data.chunk
            );
            await updateFileUpload({
                fileId: data?.fileId,
                uploadId: data?.uploadId,
                chunkIndex: data?.chunkIndex
            })
        } catch (err) {
            console.error("Chunk write failed", err)
            throw err
        }

        if (fileUploadSession.receivedChunks.size == fileUploadSession.totalChunks) {
            try {
                await mergeChunks({ fileId: data?.fileId, basePath: basePath, uploadId: data?.uploadId, fileName: fileUploadSession?.fileName, totalChunks: fileUploadSession.totalChunks })
                await updateUploadStatus({
                    fileId: data?.fileId,
                    uploadId: data?.uploadId,
                    status: 'completed'
                })
            } catch (err) {
                console.error("Merge failed", err)
                throw err
            }
        }

    } else {
        console.log(`⚠️ Chunk ${data.chunkIndex} already exists`);
    }

    return {
        status: "Upload Done",
        index: data?.chunkIndex,
        fileId: data?.fileId
    };
};


export const mergeChunks = async (data: mergeChunkDTO) => {
    console.log("🚀 ~ mergeChunks ~ data:", data)

    const finalPath = `uploads/${data?.uploadId}/${data?.basePath}/${data?.fileId}/${data?.fileName}`
    const writeStream = fsNonPromise.createWriteStream(finalPath);


    for (let i = 0; i < data?.totalChunks; i++) {
        const chunkPath = `uploads/${data?.uploadId}/${data?.basePath}/${data?.fileId}/chunks/chunk-${i}`
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

export const uploadStatus = async (uploadId: string) => {
    try {
        const statusData = await getUploadStatus(uploadId);
        return statusData;
    } catch (err) {
        throw new Error("Error in data fetching")
    }
}

export const clearUploadSession = async (uploadId: string) => {
    try {
        const folderPath = path.join(
            process.cwd(),
            "uploads",
            uploadId
        );

        await fs.rm(folderPath, {
            recursive: true,
            force: true
        });

        return {
            status: 200,
            uploadId
        }
    } catch (err) {
        throw new Error(`Error in clearing uploadSession for ${uploadId}`)
    }
}

const MIME_BY_EXT: Record<string, string> = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".ogv": "video/ogg",
    ".ogg": "video/ogg",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
    ".aac": "audio/aac",
    ".flac": "audio/flac",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
};

function guessMime(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

function mergedFileAbsolutePath(row: LibraryUploadRow): string {
    const rel =
        row.relativePath && row.relativePath.length > 0
            ? row.relativePath
            : row.fileName;
    const slash = rel.lastIndexOf("/");
    const basePath = slash === -1 ? "" : rel.slice(0, slash);
    const mergedPath = path.join(
        process.cwd(),
        "uploads",
        row.uploadId,
        basePath,
        row.fileId,
        row.fileName
    );
    const resolved = path.resolve(mergedPath);
    const allowedRoot = path.resolve(process.cwd(), "uploads");
    if (
        !resolved.startsWith(allowedRoot + path.sep) &&
        resolved !== allowedRoot
    ) {
        throw new Error("Invalid merged file path");
    }
    return resolved;
}

export const listLibrary = async () => listCompletedUploads();

export const streamMergedFile = async (
    uploadId: string,
    fileId: string,
    req: Request,
    res: Response
) => {
    const row = await findCompletedUploadFile(uploadId, fileId);
    if (!row) {
        res.status(404).json({ error: "Upload not found or not completed" });
        return;
    }

    let absolutePath: string;
    try {
        absolutePath = mergedFileAbsolutePath(row);
    } catch {
        res.status(400).json({ error: "Invalid path" });
        return;
    }

    let stat: Awaited<ReturnType<typeof fs.stat>>;
    try {
        stat = await fs.stat(absolutePath);
    } catch {
        res.status(404).json({ error: "File not on disk" });
        return;
    }

    const mime = guessMime(row.fileName);
    const attachment = req.query.disposition === "attachment";
    const disposition = attachment ? "attachment" : "inline";

    res.setHeader("Content-Type", mime);
    res.setHeader(
        "Content-Disposition",
        `${disposition}; filename*=UTF-8''${encodeURIComponent(row.fileName)}`
    );
    res.setHeader("Accept-Ranges", "bytes");

    const size = stat.size;
    const range = req.headers.range;

    const destroyReadStreamOnClose = (rs: ReturnType<typeof createReadStream>) => {
        const cleanup = () => {
            rs.destroy();
        };
        req.on("close", cleanup);
        res.on("close", cleanup);
        rs.once("close", () => {
            req.removeListener("close", cleanup);
            res.removeListener("close", cleanup);
        });
    };

    try {
        if (range) {
            const match = /^bytes=(\d*)-(\d*)$/i.exec(range);
            if (!match) {
                res.status(416);
                res.setHeader("Content-Range", `bytes */${size}`);
                res.end();
                return;
            }
            let start = match[1] === "" ? 0 : parseInt(match[1]!, 10);
            let end = match[2] === "" ? size - 1 : parseInt(match[2]!, 10);
            if (Number.isNaN(start)) start = 0;
            if (Number.isNaN(end)) end = size - 1;
            if (start >= size || end >= size || start > end || start < 0) {
                res.status(416);
                res.setHeader("Content-Range", `bytes */${size}`);
                res.end();
                return;
            }
            end = Math.min(end, size - 1);
            const chunkLen = end - start + 1;
            res.status(206);
            res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
            res.setHeader("Content-Length", String(chunkLen));
            const readStream = createReadStream(absolutePath, { start, end });
            destroyReadStreamOnClose(readStream);
            await pipeline(readStream, res);
            return;
        }

        res.setHeader("Content-Length", String(size));
        const readStream = createReadStream(absolutePath);
        destroyReadStreamOnClose(readStream);
        await pipeline(readStream, res);
    } catch (err) {
        if (!res.headersSent) {
            console.error("streamMergedFile error:", err);
            res.status(500).json({ error: "Stream failed" });
        }
    }
};

export const uploadService = {
    initUpload,
    uploadChunk,
    mergeChunks,
    uploadStatus,
    clearUploadSession,
    listLibrary,
    streamMergedFile,
};
