import { useRef, useEffect } from "react";
import { uploadStore } from "../../../store/uploadStore";
import { handleFileUpload, handleFileSelection } from "../hooks/useUpload";

const UploadBox = () => {
    const storeFiles = uploadStore((state) => state.files);
    const dirInputRef = useRef<HTMLInputElement>(null);

    const isUploading = storeFiles.some((file) => {
        return file.status === 'uploading' || file.status === 'completed'
    })

    // Set directory attributes safely
    useEffect(() => {
        if (dirInputRef.current) {
            dirInputRef.current.setAttribute("webkitdirectory", "");
            dirInputRef.current.setAttribute("directory", "");
        }
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">File Manager</h1>
                <p className="text-gray-500">Upload individual files or entire folders.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-xl p-6 bg-blue-50 hover:bg-blue-100 transition-colors">
                    <label className="cursor-pointer text-center">
                        <span className="text-blue-600 font-semibold">Select Files</span>
                        <input type="file" className="hidden" onChange={handleFileSelection} />
                        <p className="text-xs text-gray-400 mt-1">Click to browse</p>
                    </label>
                </div>

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-purple-200 rounded-xl p-6 bg-purple-50 hover:bg-purple-100 transition-colors">
                    <label className="cursor-pointer text-center">
                        <span className="text-purple-600 font-semibold">Select Folder</span>
                        <input type="file" multiple ref={dirInputRef} className="hidden" onChange={handleFileSelection} />
                        <p className="text-xs text-gray-400 mt-1">Upload directory</p>
                    </label>
                </div>
            </div>

            {storeFiles.length > 0 && (
                <button
                    onClick={handleFileUpload}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all transform active:scale-[0.98]
                    disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                    disabled={isUploading}
                >
                    Start Upload ({storeFiles.length} {storeFiles.length === 1 ? 'file' : 'files'})
                </button>
            )
            }


            <div className="space-y-4">
                {storeFiles.map((file, index) => (
                    <div key={index} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-gray-900 truncate">
                                    {file?.file?.name}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Chunks: {file?.uploadedChunks} / {file?.totalChunks}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-uppercase tracking-wider font-bold ${file?.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    file?.status === 'uploading' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {file?.status?.toUpperCase()}
                                </span>
                                <span className="text-sm font-mono font-medium text-gray-700">
                                    {Math.round(file?.progress || 0)}%
                                </span>
                            </div>
                        </div>

                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ease-out ${file?.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                                    }`}
                                style={{ width: `${file?.progress}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
};

export default UploadBox;