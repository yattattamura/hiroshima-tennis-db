import type { Metadata } from "next";
import Link from "next/link";

import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "広島テニスポータルにおける個人情報の取扱いについて説明します。",
};

export default function PrivacyPage() {
  return (
    <div className="detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          {" → "}
          <span>プライバシーポリシー</span>
        </div>

        <article
          className="card"
          style={{
            padding: 28,
            marginTop: 20,
            marginBottom: 40,
          }}
        >
          <h1>プライバシーポリシー</h1>

          <p className="muted">
            最終更新日：2026年9月26日
          </p>

          <p style={{ lineHeight: 1.9 }}>
            {SITE_NAME}（以下「当サイト」）は、利用者から提供された情報を適切に取り扱います。
            本ポリシーでは、当サイトが収集する情報、その利用目的、管理について説明します。
          </p>

          <h2>1. 取得する情報</h2>
          <p className="muted" style={{ lineHeight: 1.9 }}>
            お問い合わせや大会情報の修正提案などの際に、
            利用者が入力した氏名、メールアドレス、問い合わせ内容、修正内容、参考URL等を取得することがあります。
            必要のない情報を収集することはありません。
          </p>

          <h2>2. 利用目的</h2>
          <p className="muted" style={{ lineHeight: 1.9 }}>
            取得した情報は、問い合わせへの回答、掲載情報の確認・修正、
            サービスの運営・改善、迷惑行為や不正利用への対応等のために利用します。
            利用目的は、取得する情報と利用場面に応じてできる限り具体的に明示します。
          </p>

          <h2>3. 第三者提供</h2>
          <p className="muted" style={{ lineHeight: 1.9 }}>
            法令に基づく場合等を除き、利用者の個人情報を本人の同意なく第三者へ提供しません。
          </p>

          <h2>4. 安全管理</h2>
          <p className="muted" style={{ lineHeight: 1.9 }}>
            取得した情報は、漏えい、滅失、毀損、不正アクセス等の防止に必要な範囲で適切に管理します。
          </p>

          <h2>5. 開示・訂正・削除等</h2>
          <p className="muted" style={{ lineHeight: 1.9 }}>
            自身の個人情報に関する問い合わせ、訂正、削除等を希望する場合は、
            <Link href="/contact" className="text-link">お問い合わせフォーム</Link>
            からご連絡ください。本人確認等が必要な場合があります。
          </p>

          <h2>6. ポリシーの変更</h2>
          <p className="muted" style={{ lineHeight: 1.9 }}>
            必要に応じて本ポリシーを変更することがあります。
            変更後の内容は当サイトに掲載した時点から適用します。
          </p>

          <h2>7. お問い合わせ窓口</h2>
          <p className="muted" style={{ lineHeight: 1.9 }}>
            運営者：yattatta
            <br />
            連絡先：お問い合わせフォームより
          </p>

          <p className="muted" style={{ lineHeight: 1.8, marginBottom: 0 }}>
            ※本ポリシーは現在のサイト構成を前提に作成しています。
            外部サービスの追加や機能変更に伴い、内容を見直す場合があります。
          </p>
        </article>
      </div>
    </div>
  );
}
