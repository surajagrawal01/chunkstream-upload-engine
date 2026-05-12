import { useCallback, useEffect, useState } from "react";
import {
    fetchCompletedLibrary,
    getStreamUrl,
    type LibraryItem,
} from "../api/uploadApi";

function previewKind(fileName: string): "video" | "audio" | "download" {
    const n = fileName.toLowerCase();
    if (/\.(mp4|webm|ogv)$/i.test(n)) return "video";
    if (/\.(mp3|wav|m4a|aac|flac|opus)$/i.test(n)) return "audio";
    if (/\.ogg$/i.test(n)) return "audio";
    return "download";
}

type UploadLibraryProps = {
    refreshKey: number;
};

const UploadLibrary = ({ refreshKey }: UploadLibraryProps) => {
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<LibraryItem | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchCompletedLibrary();
            setItems(data);
        } catch (e) {
            setError((e as Error).message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load, refreshKey]);

    const streamKey = selected
        ? `${selected.uploadId}-${selected.fileId}`
        : "none";

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <header className="border-b border-gray-200 pb-5">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    Library
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-600 sm:text-base">
                    Tap a file to preview it here. Videos and audio stream in
                    the browser; other types open as a download.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-100 lg:col-span-2">
                    <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Your files
                        </h3>
                        <p className="text-xs text-gray-400">
                            {loading
                                ? "Loading…"
                                : `${items.length} ready to open`}
                        </p>
                    </div>

                    {loading && (
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8">
                            <div
                                className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"
                                aria-hidden
                            />
                            <p className="text-sm text-gray-500">
                                Loading your library…
                            </p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                            <p className="text-sm text-red-700">{error}</p>
                            <button
                                type="button"
                                onClick={() => void load()}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {!loading && !error && items.length === 0 && (
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
                            <p className="text-sm font-medium text-gray-700">
                                Nothing here yet
                            </p>
                            <p className="max-w-[240px] text-xs text-gray-500">
                                Complete an upload from the Upload tab, then
                                come back—finished files show up here
                                automatically.
                            </p>
                        </div>
                    )}

                    {!loading && !error && items.length > 0 && (
                        <ul
                            className="max-h-[min(480px,55vh)] divide-y divide-gray-100 overflow-y-auto overscroll-contain"
                            aria-label="Completed uploads"
                        >
                            {items.map((item) => {
                                const isSelected =
                                    selected?.fileId === item.fileId &&
                                    selected?.uploadId === item.uploadId;
                                return (
                                    <li key={`${item.uploadId}-${item.fileId}`}>
                                        <button
                                            type="button"
                                            aria-selected={isSelected}
                                            onClick={() => setSelected(item)}
                                            className={`w-full px-4 py-3 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${isSelected
                                                ? "bg-blue-50 font-medium text-blue-950"
                                                : "text-gray-800 hover:bg-gray-50"
                                                }`}
                                        >
                                            <span className="block truncate font-medium">
                                                {item.fileName}
                                            </span>
                                            <span className="mt-0.5 block truncate font-mono text-[11px] text-gray-400">
                                                {item.uploadId.slice(0, 8)}…
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <div className="flex min-h-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:p-6 lg:col-span-3">
                    {!selected && (
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
                            <p className="text-sm font-medium text-gray-600">
                                No file selected
                            </p>
                            <p className="max-w-sm text-xs text-gray-500">
                                Choose an item from the list to play media or
                                download.
                            </p>
                        </div>
                    )}

                    {selected && (
                        <div className="flex flex-1 flex-col gap-4">
                            <div className="min-w-0 border-b border-gray-100 pb-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Preview
                                </p>
                                <h3 className="truncate text-base font-semibold text-gray-900">
                                    {selected.fileName}
                                </h3>
                            </div>

                            {previewKind(selected.fileName) === "video" && (
                                <video
                                    key={streamKey}
                                    className="max-h-[min(420px,50vh)] w-full rounded-xl bg-black object-contain"
                                    controls
                                    playsInline
                                    crossOrigin="anonymous"
                                    src={getStreamUrl(
                                        selected.uploadId,
                                        selected.fileId,
                                        false
                                    )}
                                />
                            )}
                            {previewKind(selected.fileName) === "audio" && (
                                <div className="rounded-xl bg-gray-50 p-4">
                                    <audio
                                        key={streamKey}
                                        className="w-full"
                                        controls
                                        crossOrigin="anonymous"
                                        src={getStreamUrl(
                                            selected.uploadId,
                                            selected.fileId,
                                            false
                                        )}
                                    />
                                </div>
                            )}
                            {previewKind(selected.fileName) === "download" && (
                                <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
                                    <p className="max-w-sm text-sm text-gray-600">
                                        This format is not shown inline. Save it
                                        to your device instead.
                                    </p>
                                    <a
                                        href={getStreamUrl(
                                            selected.uploadId,
                                            selected.fileId,
                                            true
                                        )}
                                        download={selected.fileName}
                                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    >
                                        Download {selected.fileName}
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadLibrary;
