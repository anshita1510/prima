import Sidebar from "../_components/Sidebarr";
import CreateUserSuperAdmin from "../_components/CreateUserSuperAdmin";

export default function CreateUserPage() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <Sidebar />
      <main className="flex-1" style={{ backgroundColor: 'var(--bg-color)' }}>
        <CreateUserSuperAdmin />
      </main>
    </div>
  );
}
