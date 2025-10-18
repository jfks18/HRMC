import DeanAuthGuard from "../components/DeanAuthGuard";
import ChatWidget from "../components/ChatWidget";

export default function DeanLayout({ children }: { children: React.ReactNode }) {
  return (
    <DeanAuthGuard>
      {children}
      <ChatWidget />
    </DeanAuthGuard>
  );
}
