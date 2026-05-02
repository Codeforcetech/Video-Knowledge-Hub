export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B0B0B] px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

