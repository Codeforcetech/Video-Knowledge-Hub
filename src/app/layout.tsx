import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "Video Knowledge Hub",
  description: "社内向け 動画ナレッジ管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-[#0B0B0B] text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
