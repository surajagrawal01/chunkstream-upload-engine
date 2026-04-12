import { Router } from "express";
import { chunkUpload, initUpload } from "./upload.controller.js";
import { upload } from "../../multer.js";
const uploadRouter = Router();

uploadRouter.post("/init", initUpload);
uploadRouter.post("/chunk", upload.single("file"), chunkUpload);


export default uploadRouter;