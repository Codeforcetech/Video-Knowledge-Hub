import { Header } from "@/components/Header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-5">
        {children}
      </main>
    </div>
  );
}

