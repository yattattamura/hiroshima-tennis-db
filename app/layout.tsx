import "./globals.css";
import { Header } from "@/components/Header";

export const metadata = {
  title: "広島テニスポータルサイト",
  description: "広島県のテニス大会を横断検索できるポータルサイト",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="site-footer">広島テニスポータルサイト</footer>
      </body>
    </html>
  );
}
