import { Router } from "express";
import { chunkUpload, clearUploadSession, initUpload, uploadStatus } from "./upload.controller.js";
import { upload } from "../../multer.js";
const uploadRouter = Router();

uploadRouter.post("/status", uploadStatus)
uploadRouter.post("/init", initUpload);
uploadRouter.post("/clear", clearUploadSession)
uploadRouter.post("/chunk", upload.single("file"), chunkUpload);


export default uploadRouter;