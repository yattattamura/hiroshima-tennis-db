import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "お問い合わせ完了",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ContactCompletePage() {
  return (
    <div className="detail-page">
      <div className="container">
        <section
          className="card"
          style={{
            padding: 30,
            marginTop: 30,
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          <div className="badges">
            <span className="badge green">送信完了</span>
          </div>

          <h1 style={{ marginTop: 12 }}>
            お問い合わせを受け付けました
          </h1>

          <p
            className="muted"
            style={{
              lineHeight: 1.8,
              marginBottom: 22,
            }}
          >
            ご連絡ありがとうございます。
            内容を確認のうえ、必要に応じて対応します。
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/"
              className="primary"
            >
              トップへ戻る
            </Link>

            <Link
              href="/tournaments"
              className="outline-button"
            >
              大会を探す
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
