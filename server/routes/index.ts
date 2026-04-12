import { Router } from "express";
import uploadRouter from "../modules/upload/upload.routes.js";

const router = Router();

//write all routes here
router.use('/upload', uploadRouter)
export default router;