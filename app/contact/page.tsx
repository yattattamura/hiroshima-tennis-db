import type { Metadata } from "next";
import Link from "next/link";

import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "広島テニスポータルへのお問い合わせフォームです。",
};

const categories = [
  "大会情報の掲載依頼",
  "掲載情報の訂正・削除",
  "サイトの不具合",
  "その他",
];

export default function ContactPage() {
  return (
    <div className="detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          {" → "}
          <span>お問い合わせ</span>
        </div>

        <section
          className="card"
          style={{
            padding: 28,
            marginTop: 20,
          }}
        >
          <div className="badges">
            <span className="badge">お問い合わせ</span>
          </div>

          <h1 style={{ marginTop: 10 }}>
            お問い合わせ
          </h1>

          <p style={{ lineHeight: 1.9 }}>
            {SITE_NAME}へのお問い合わせ、掲載依頼、情報の訂正・削除依頼などはこちらからお知らせください。
          </p>

          <form
            action="/api/contact"
            method="POST"
            style={{
              display: "grid",
              gap: 16,
              marginTop: 22,
            }}
          >
            <label>
              <span className="muted">お問い合わせ種別 *</span>
              <select
                name="category"
                required
                defaultValue=""
                style={{
                  width: "100%",
                  marginTop: 6,
                }}
              >
                <option value="" disabled>
                  選択してください
                </option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="muted">お名前（任意）</span>
              <input
                name="name"
                type="text"
                maxLength={100}
                style={{
                  width: "100%",
                  marginTop: 6,
                }}
              />
            </label>

            <label>
              <span className="muted">メールアドレス（任意）</span>
              <input
                name="email"
                type="email"
                maxLength={254}
                placeholder="返信が必要な場合に入力してください"
                style={{
                  width: "100%",
                  marginTop: 6,
                }}
              />
            </label>

            <label>
              <span className="muted">お問い合わせ内容 *</span>
              <textarea
                name="message"
                rows={8}
                required
                maxLength={5000}
                style={{
                  width: "100%",
                  marginTop: 6,
                }}
              />
            </label>

            <input
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-9999px",
                width: 1,
                height: 1,
                opacity: 0,
              }}
            />

            <div
              className="card"
              style={{
                padding: 16,
                background: "#fafafa",
              }}
            >
              <p
                className="muted"
                style={{
                  margin: 0,
                  lineHeight: 1.8,
                  fontSize: 13,
                }}
              >
                ご入力いただいた情報は、お問い合わせへの回答、
                掲載情報の確認・修正、サービス運営上の対応に利用します。
                詳細は
                <Link href="/privacy" className="text-link">
                  プライバシーポリシー
                </Link>
                をご確認ください。
              </p>
            </div>

            <button
              type="submit"
              className="primary"
            >
              送信する
            </button>
          </form>
        </section>

        <section
          className="card"
          style={{
            padding: 24,
            marginTop: 20,
            marginBottom: 40,
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            運営者
          </h2>

          <p
            className="muted"
            style={{ marginBottom: 0, lineHeight: 1.8 }}
          >
            運営者：yattatta
          </p>
        </section>
      </div>
    </div>
  );
}
