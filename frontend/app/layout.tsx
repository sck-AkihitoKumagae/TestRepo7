import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "サーバー台帳 - Server Inventory",
  description: "Modern server inventory management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
