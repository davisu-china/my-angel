import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "我的天使 · 私人告白",
  description: "写给王梓烨的私人告白。一些温柔的光影，一场只为你的星落倾心。",
  robots: { index: false, follow: false },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}
