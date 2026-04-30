import Sidebar from "../_components/Sidebarr";
import ManageCompaniesContent from "./_components/ManageCompaniesContent";

export default function ManageCompaniesPage() {
    return (
        <div className="flex min-h-screen" style={{ backgroundColor: "var(--bg-color)" }}>
            <Sidebar />
            <main className="flex-1 min-w-0 pt-[57px] lg:pt-0">
                <ManageCompaniesContent />
            </main>
        </div>
    );
}
