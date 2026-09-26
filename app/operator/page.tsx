import type { Metadata } from "next";
import Link from "next/link";

import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "運営者情報",
  description:
    "広島テニスポータルの運営者情報を掲載しています。",
};

export default function OperatorPage() {
  return (
    <div className="detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          {" → "}
          <span>運営者情報</span>
        </div>

        <section
          className="card"
          style={{
            padding: 28,
            marginTop: 20,
            marginBottom: 40,
          }}
        >
          <div className="badges">
            <span className="badge">運営者情報</span>
          </div>

          <h1 style={{ marginTop: 10 }}>
            運営者情報
          </h1>

          <div className="info-table" style={{ marginTop: 20 }}>
            <div>サイト名</div>
            <div>{SITE_NAME}</div>

            <div>運営者</div>
            <div>yattatta</div>

            <div>連絡先</div>
            <div>
              <Link
                href="/contact"
                className="text-link"
              >
                お問い合わせフォーム
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
