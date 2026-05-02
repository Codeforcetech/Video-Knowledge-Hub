"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        theme="dark"
        position="top-center"
        closeButton
        toastOptions={{
          classNames: {
            toast:
              "border border-[#2A2A2A] bg-[#181818] text-white shadow-[0_16px_48px_rgba(0,0,0,0.5)]",
            title: "text-white",
            description: "text-[#A1A1AA]",
            closeButton: "text-[#A1A1AA] hover:text-white",
          },
        }}
      />
    </SessionProvider>
  );
}
