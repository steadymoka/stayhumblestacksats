import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Bitcoin Observatory",
  description: "비트코인 네트워크의 철학적 가치를 시각화하는 대시보드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
