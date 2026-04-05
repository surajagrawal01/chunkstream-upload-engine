import type { UploadChunk } from "../types/upload.types";

export const createChunks = (file: File) => {
    const chunks: UploadChunk[] = []
    const chunkSize = 1024 * 1024;

    let start = 0;
    let i = 0;

    while (start < file.size) {
        const chunk: UploadChunk = {
            index: i,
            start,
            end: Math.min(start + chunkSize, file.size),
            blob: file.slice(start, start + chunkSize)
        }
        chunks.push(chunk);
        start += chunkSize;
        i++;
    }

    return chunks;
}