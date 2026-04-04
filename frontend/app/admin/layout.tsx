import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AuthGuard from "./components/AuthGuard";

export const metadata = {
  title: "EventDhara Admin Dashboard",
  description: "Secure administrative console for EventDhara platform",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#0B0F19] font-sans selection:bg-indigo-500/30">
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col min-h-screen relative">
          {/* Glow Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

          <Header />
          <main className="flex-1 p-8 overflow-x-hidden relative z-0">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
