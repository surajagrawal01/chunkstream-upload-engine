import { Request, Response } from "express";
import { uploadService } from "./upload.service.js";

export const uploadStatus = async (req: Request, res: Response) => {
    try {
        const { uploadId } = req.body;
        console.log("🚀 ~ uploadStatus ~ uploadId:", uploadId)

        const statusResult = await uploadService.uploadStatus(uploadId);

        return res.status(200).json(statusResult);
    } catch (err) {
        console.error("CONTROLLER ERROR:", err);
        res.status(500).json({
            error: (err as Error).message || "Something went wrong",
        });
    }
};

export const initUpload = async (req: Request, res: Response) => {
    try {
        const { data } = req.body;
        /////_> expecting data like this from backend for one single file it will eb only one item
        //         {"data":[
        //     {
        //     "fileId": "file - Screenshot 2026-04-06 at 11.23.28 AM.png - 1775610863182 - c2kxfgfv2w",
        //     "name": "Screenshot 2026-04-06 at 11.23.28 AM.png",
        //     "totalChunks": 1,
        //     "relativePath": "recording/Screenshot 2026-04-06 at 11.23.28 AM.png"
        // },
        // {
        //     "fileId": "file - Screenshot 2026-03-31 at 3.00.51 PM.png - 1775610863223 - ib9s8ym50vh",
        //     "name": "Screenshot 2026-03-31 at 3.00.51 PM.png",
        //     "totalChunks": 3,
        //     "relativePath": "recording/Screenshot 2026-03-31 at 3.00.51 PM.png"
        // }
        // ]
        // }
        const result = await uploadService.initUpload(data);

        res.json(result);
    } catch (err) {
        console.error("CONTROLLER ERROR:", err);
        res.status(500).json({
            error: (err as Error).message || "Something went wrong",
        });
    }
};


export const chunkUpload = async (req: Request, res: Response) => {
    try {

        const { fileId, uploadId, chunkIndex } = req.body;
        console.log("🚀 ~ chunkUpload ~ fileId, uploadId, chunkIndex:", fileId, uploadId, chunkIndex)

        const chunk = req.file;
        console.log("🚀 ~ chunkUpload ~ chunk:", chunk)

        if (!chunk) {
            return res.status(400).json({ message: "No chunk received" });
        }

        const result = await uploadService.uploadChunk({
            fileId,
            uploadId,
            chunkIndex: Number(chunkIndex),
            chunk: chunk.buffer,
        });

        res.json(result);

    } catch (err) {
        console.error("CONTROLLER ERROR:", err);
        res.status(500).json({
            error: (err as Error).message || "Something went wrong"
        });
    }
};