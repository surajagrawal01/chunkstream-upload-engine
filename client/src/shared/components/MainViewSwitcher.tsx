export type MainView = "upload" | "library";

type MainViewSwitcherProps = {
    active: MainView;
    onChange: (view: MainView) => void;
};

/**
 * Primary navigation on the main canvas (not in the header) so it stays obvious and easy to use.
 */
const MainViewSwitcher = ({ active, onChange }: MainViewSwitcherProps) => {
    return (
        <section
            className="mb-8 sm:mb-10"
            aria-label="Choose a section"
        >
            <div
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
                role="group"
                aria-label="Upload or Library"
            >
                <button
                    type="button"
                    aria-pressed={active === "upload"}
                    onClick={() => onChange("upload")}
                    className={`cursor-pointer rounded-2xl border-2 p-5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${active === "upload"
                        ? "border-blue-500 bg-white shadow-md shadow-blue-100/80 ring-1 ring-blue-100"
                        : "border-gray-200 bg-white/90 hover:border-blue-300 hover:bg-white"
                        }`}
                >
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Upload
                    </span>
                    <span className="mb-1 block text-lg font-bold text-gray-900">
                        Send files in chunks
                    </span>
                    <span className="block text-sm leading-snug text-gray-600">
                        Pick files or a folder, start the upload, and track chunk progress here.
                    </span>
                </button>
                <button
                    type="button"
                    aria-pressed={active === "library"}
                    onClick={() => onChange("library")}
                    className={`cursor-pointer rounded-2xl border-2 p-5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${active === "library"
                        ? "border-blue-500 bg-white shadow-md shadow-blue-100/80 ring-1 ring-blue-100"
                        : "border-gray-200 bg-white/90 hover:border-blue-300 hover:bg-white"
                        }`}
                >
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Library
                    </span>
                    <span className="mb-1 block text-lg font-bold text-gray-900">
                        Completed uploads
                    </span>
                    <span className="block text-sm leading-snug text-gray-600">
                        Open any finished upload—stream video and audio in your
                        browser, or download everything else with one click.
                    </span>
                </button>
            </div>
        </section>
    );
};

export default MainViewSwitcher;
