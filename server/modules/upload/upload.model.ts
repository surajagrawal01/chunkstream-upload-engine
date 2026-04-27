import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema({
    uploadId: { type: String, required: true, index: true },

    fileId: { type: String, required: true, index: true },
    fileName: { type: String, required: true },

    totalChunks: { type: Number, required: true },

    uploadedChunks: {
        type: Map,
        of: Boolean,
        default: {}
    },

    status: {
        type: String,
        enum: ["pending", "uploading", "completed"],
        default: "pending"
    }
}, { timestamps: true });

uploadSchema.index({ uploadId: 1, fileId: 1 }, { unique: true });

export const UploadModel = mongoose.model("Upload", uploadSchema);