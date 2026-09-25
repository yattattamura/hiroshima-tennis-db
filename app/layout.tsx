import type { Metadata } from "next";

import "./globals.css";
import { Header } from "@/components/Header";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
} from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:
      "広島テニスDB｜広島県のテニス大会検索",
    template:
      "%s | 広島テニスDB",
  },

  description:
    SITE_DESCRIPTION,

  applicationName:
    SITE_NAME,

  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
    title:
      "広島テニスDB｜広島県のテニス大会検索",
    description:
      SITE_DESCRIPTION,
    url: SITE_URL,
  },

  twitter: {
    card: "summary",
    title:
      "広島テニスDB｜広島県のテニス大会検索",
    description:
      SITE_DESCRIPTION,
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Header />

        <main>
          {children}
        </main>

        <footer className="site-footer">
          {SITE_NAME}
        </footer>
      </body>
    </html>
  );
}