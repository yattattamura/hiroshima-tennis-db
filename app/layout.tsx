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
      "広島テニスポータル｜広島県のテニス大会検索",
    template:
      "%s | 広島テニスポータル",
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
      "広島テニスポータル｜広島県のテニス大会検索",
    description:
      SITE_DESCRIPTION,
    url: SITE_URL,
  },

  twitter: {
    card: "summary",
    title:
      "広島テニスポータル｜広島県のテニス大会検索",
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

        <footer
          className="site-footer"
          style={{
            padding: "28px 0",
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <strong>{SITE_NAME}</strong>
              <div
                className="muted"
                style={{
                  marginTop: 6,
                  fontSize: 13,
                }}
              >
                広島県の一般・社会人向けテニス大会情報ポータル
              </div>
            </div>

            <nav
              aria-label="フッターナビゲーション"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                fontSize: 13,
              }}
            >
              <a href="/about">このサイトについて</a>
              <a href="/areas">掲載エリア</a>
              <a href="/organizers">掲載主催者</a>
              <a href="/terms">利用規約</a>
              <a href="/privacy">プライバシーポリシー</a>
              <a href="/contact">お問い合わせ</a>
              <a href="/operator">運営者情報</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}