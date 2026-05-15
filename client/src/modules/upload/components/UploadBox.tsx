import { useRef, useEffect, useState } from "react";
import { uploadStore } from "../../../store/uploadStore";
import {
    handleFileUpload,
    handleFileSelection,
    handleCancelUpload,
} from "../hooks/useUpload";
import { getUploadSession } from "../utils/uploadSession";

type UploadBoxProps = {
    onUploadBatchFinished?: () => void;
};

const UploadBox = ({ onUploadBatchFinished }: UploadBoxProps) => {
    const storeFiles = uploadStore((state) => state.files);
    const dirInputRef = useRef<HTMLInputElement>(null);
    const [activeUploadId, setActiveUploadId] = useState(
        getUploadSession()
    );

    const isUploadCompleted =
        storeFiles.length > 0 &&
        storeFiles.every(
            (file) =>
                file.status === "completed" || file.status === "failed"
        );

    const isUploadSessionActive = !!activeUploadId;

    const isUploading = storeFiles.some((file) => file.status === "uploading");

    useEffect(() => {
        if (isUploadCompleted && storeFiles.length > 0) {
            localStorage.removeItem("active-upload-id");
            setActiveUploadId(null);
        }
    }, [isUploadCompleted, storeFiles.length]);

    useEffect(() => {
        if (dirInputRef.current) {
            dirInputRef.current.setAttribute("webkitdirectory", "");
            dirInputRef.current.setAttribute("directory", "");
        }
    }, []);

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <header className="border-b border-gray-200 pb-5">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    Upload
                </h2>
                <p className="mt-1 text-sm text-gray-600 sm:text-base">
                    Add individual files or an entire folder, then start a
                    chunked upload.
                </p>
            </header>

            {isUploadSessionActive && (
                <p
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                    role="status"
                >
                    A batch is in progress. Finish uploading or cancel before
                    choosing new files.
                </p>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div
                    className={`flex min-h-[140px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${isUploadSessionActive
                        ? "cursor-not-allowed border-gray-200 bg-gray-50"
                        : "cursor-pointer border-blue-200 bg-blue-50/70 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                >
                    <label
                        className={`text-center ${isUploadSessionActive ? "cursor-not-allowed" : "cursor-pointer"}`}
                        aria-disabled={isUploadSessionActive}
                    >
                        <span
                            className={`text-sm font-semibold sm:text-base ${isUploadSessionActive ? "text-gray-400" : "text-blue-700"}`}
                        >
                            Select files
                        </span>
                        <input
                            type="file"
                            className="sr-only"
                            multiple
                            onChange={(e) =>
                                handleFileSelection(e, setActiveUploadId)
                            }
                            disabled={isUploadSessionActive}
                            aria-label="Choose one or more files to upload"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            {isUploadSessionActive
                                ? "Unavailable until this batch ends"
                                : "Click or tap to browse"}
                        </p>
                    </label>
                </div>

                <div
                    className={`flex min-h-[140px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors focus-within:ring-2 focus-within:ring-violet-500 focus-within:ring-offset-2 ${isUploadSessionActive
                        ? "cursor-not-allowed border-gray-200 bg-gray-50"
                        : "cursor-pointer border-violet-200 bg-violet-50/70 hover:border-violet-300 hover:bg-violet-50"
                        }`}
                >
                    <label
                        className={`text-center ${isUploadSessionActive ? "cursor-not-allowed" : "cursor-pointer"}`}
                        aria-disabled={isUploadSessionActive}
                    >
                        <span
                            className={`text-sm font-semibold sm:text-base ${isUploadSessionActive ? "text-gray-400" : "text-violet-700"}`}
                        >
                            Select folder
                        </span>
                        <input
                            type="file"
                            multiple
                            ref={dirInputRef}
                            className="sr-only"
                            onChange={(e) =>
                                handleFileSelection(e, setActiveUploadId)
                            }
                            disabled={isUploadSessionActive}
                            aria-label="Choose a folder to upload"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            {isUploadSessionActive
                                ? "Unavailable until this batch ends"
                                : "Directory upload preserves structure"}
                        </p>
                    </label>
                </div>
            </div>

            {storeFiles.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <button
                        type="button"
                        onClick={() =>
                            void handleFileUpload(onUploadBatchFinished)
                        }
                        className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"
                        disabled={isUploading || isUploadCompleted}
                    >
                        {isUploading
                            ? "Uploading…"
                            : `Start upload (${storeFiles.length} ${storeFiles.length === 1 ? "file" : "files"})`}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            void handleCancelUpload(
                                activeUploadId,
                                setActiveUploadId
                            );
                        }}
                        className="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:border-red-300 hover:bg-red-50/50 hover:text-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                        disabled={isUploading || isUploadCompleted}
                    >
                        Cancel batch
                    </button>
                </div>
            )}

            <div className="space-y-3">
                {storeFiles.map((file) => (
                    <article
                        key={file.fileId}
                        className={`rounded-xl border bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md ${file?.status === "failed" ? "border-red-300 ring-red-100" : "border-gray-200"}`}
                    >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-sm font-semibold text-gray-900">
                                    {file?.file?.name}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Chunks {file?.uploadedChunks} /{" "}
                                    {file?.totalChunks}
                                </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${file?.status === "completed"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : file?.status === "uploading"
                                            ? "bg-blue-100 text-blue-800"
                                            : file?.status === "failed"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    {file?.status}
                                </span>
                                <span
                                    className="text-sm font-medium tabular-nums text-gray-700"
                                    aria-live="polite"
                                >
                                    {Math.round(file?.progress || 0)}%
                                </span>
                            </div>
                        </div>

                        <div
                            className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100"
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(file?.progress || 0)}
                            aria-label={`Upload progress for ${file?.file?.name}`}
                        >
                            <div
                                className={`h-full rounded-full transition-all duration-300 ease-out ${file?.status === "completed"
                                    ? "bg-emerald-500"
                                    : file?.status === "failed"
                                        ? "bg-red-500"
                                        : "bg-blue-500"
                                    }`}
                                style={{
                                    width: `${Math.min(100, Math.round(file?.progress || 0))}%`,
                                }}
                            />
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default UploadBox;