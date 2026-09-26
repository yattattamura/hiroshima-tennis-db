import type { Metadata } from "next";
import Link from "next/link";

import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "利用規約",
  description:
    "広島テニスポータルの利用規約です。",
};

export default function TermsPage() {
  return (
    <div className="detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          {" → "}
          <span>利用規約</span>
        </div>

        <article
          className="card"
          style={{
            padding: 28,
            marginTop: 20,
            marginBottom: 40,
          }}
        >
          <h1>利用規約</h1>

          <p className="muted">
            最終更新日：2026年9月26日
          </p>

          <p style={{ lineHeight: 1.9 }}>
            この利用規約（以下「本規約」）は、{SITE_NAME}（以下「当サイト」）が提供する大会情報検索その他のサービスの利用条件を定めるものです。
            当サイトを利用することで、本規約に同意したものとして取り扱います。
          </p>

          <h2>1. サービス内容</h2>
          <p className="muted" style={{ lineHeight: 1.9 }}>
            当サイトは、広島県内の一般・社会人向けテニス大会等の情報を整理し、検索・閲覧できるよう提供します。
            掲載内容やサービスの仕様は、予告なく変更または終了する場合があります。
          </p>

          <h2>2. 大会情報について</h2>
          <p className="muted" style={{ lineHeight: 1.9 }}>
            当サイトは大会主催者等の公開情報をもとに情報を掲載していますが、
            掲載内容の完全性、正確性、最新性を保証するものではありません。
            参加申込や大会参加にあたっては、必ず主催者の公式情報をご確認ください。
          </p>

          <h2>3. 利用者からの情報提供</h2>
          <p className="muted" style={{ lineHeight: 1.9 }}>
            利用者が修正提案や問い合わせ等を送信する場合、第三者の権利を侵害する情報、
            虚偽の情報、その他不適切な情報を送信してはいけません。
            当サイトは、必要に応じて送信内容を確認し、掲載・反映を行わないことがあります。
          </p>

          <h2>4. 禁止事項</h2>
          <p className="muted" style={{ lineHeight: 1.9 }}>
            当サイトの運営を妨害する行為、法令または公序良俗に反する行為、
            不正アクセス、過度な自動取得、他者になりすます行為、
            当サイトまたは第三者に不利益・損害を与える行為を禁止します。
          </p>

          <h2>5. 免責</h2>
          <p className="muted" style={{ lineHeight: 1.9 }}>
            当サイトの利用または掲載情報に関連して利用者に生じた損害について、
            当サイトに故意または重過失がある場合を除き、運営者は責任を負わないものとします。
            また、通信障害、サービス停止、外部サイトの変更等によって生じた不利益についても、
            運営者は責任を負わないものとします。
          </p>

          <h2>6. 規約の変更</h2>
          <p className="muted" style={{ lineHeight: 1.9 }}>
            運営者は、必要に応じて本規約を変更できます。
            変更後の規約は当サイトに掲載した時点から適用します。
          </p>

          <h2>7. 準拠法・管轄</h2>
          <p className="muted" style={{ lineHeight: 1.9 }}>
            本規約は日本法に準拠します。
            当サイトの利用に関して紛争が生じた場合、運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
          </p>

          <div style={{ marginTop: 24 }}>
            <Link href="/contact" className="outline-button">
              お問い合わせ
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
