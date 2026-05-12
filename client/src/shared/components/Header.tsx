const Header = () => {
    return (
        <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-lg font-semibold tracking-tight text-gray-900">
                    🚀 Chunk Upload Lab
                </h1>
                <p className="mt-0.5 text-xs text-gray-500">
                    Chunked uploads and in-browser streaming
                </p>
            </div>
        </header>
    );
};

export default Header;