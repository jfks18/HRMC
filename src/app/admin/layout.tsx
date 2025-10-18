import AdminAuthGuard from "../components/AdminAuthGuard";
import ChatWidget from "../components/ChatWidget";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      {children}
      <ChatWidget />
    </AdminAuthGuard>
  );

}

