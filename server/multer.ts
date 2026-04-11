import multer from "multer";

// storing in memory
export const upload = multer({
    storage: multer.memoryStorage(),
});