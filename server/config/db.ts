import mongoose from "mongoose";
import { env } from "./env.js";

export const dbConnection = async () => {
    await mongoose.connect(env.MONGO_URI);
    console.log("MongoDB connected");
}
