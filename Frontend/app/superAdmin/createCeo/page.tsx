import Sidebar from "../_components/Sidebarr";
import CreateCeoContent from "./_components/CreateCeoContent";

export default function CreateCeoPage() {
    return (
        <div className="flex min-h-screen" style={{ backgroundColor: "var(--bg-color)" }}>
            <Sidebar />
            <main className="flex-1 min-w-0 pt-[57px] lg:pt-0">
                <CreateCeoContent />
            </main>
        </div>
    );
}
