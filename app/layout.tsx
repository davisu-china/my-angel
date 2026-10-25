import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "偏偏是你 · 私人放映",
  description: "一场只为你的私人放映。星落倾心，万千星光，最后汇成你。",
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
