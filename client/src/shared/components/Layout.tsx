import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50/80">
            <Header />

            <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="mx-auto w-full max-w-6xl">{children}</div>
            </main>

            <Footer />
        </div>
    );
};

export default Layout;