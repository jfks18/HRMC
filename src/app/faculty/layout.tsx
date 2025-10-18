import FacultyAuthGuard from "../components/FacultyAuthGuard";
import ChatWidget from "../components/ChatWidget";

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  return (
    <FacultyAuthGuard>
      {children}
      <ChatWidget />
    </FacultyAuthGuard>
  );
}
