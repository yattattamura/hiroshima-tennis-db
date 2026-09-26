import type { Metadata } from "next";
import Link from "next/link";

import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "このサイトについて",
  description:
    "広島テニスポータルの目的、掲載対象、情報の扱い、掲載基準について説明します。",
};

export default function AboutPage() {
  return (
    <div className="detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          {" → "}
          <span>このサイトについて</span>
        </div>

        <section
          className="card"
          style={{ padding: 28, marginTop: 20 }}
        >
          <div className="badges">
            <span className="badge">このサイトについて</span>
          </div>

          <h1 style={{ marginTop: 10 }}>
            {SITE_NAME}
          </h1>

          <p style={{ lineHeight: 1.9 }}>
            {SITE_NAME}は、広島県内の一般・社会人向けテニス大会を探しやすくするための情報ポータルです。
            大会情報を市町村、種目、性別、レベル、参加資格、申込締切などの条件から検索できるよう整理しています。
          </p>

          <p style={{ lineHeight: 1.9, marginBottom: 0 }}>
            大会情報は主催者・テニス協会・クラブ・スクールなどの公式情報を中心に確認し、掲載情報の修正提案も受け付けています。
          </p>
        </section>

        <section style={{ marginTop: 26 }}>
          <h2>掲載対象</h2>

          <div
            className="card"
            style={{ padding: 24 }}
          >
            <h3 style={{ marginTop: 0 }}>
              エリア
            </h3>
            <p
              className="muted"
              style={{ lineHeight: 1.8 }}
            >
              広島県全域を対象としています。現在掲載している地域は
              <Link href="/areas" className="text-link">掲載エリア一覧</Link>
              から確認できます。
            </p>

            <h3>
              大会
            </h3>
            <p
              className="muted"
              style={{ lineHeight: 1.8 }}
            >
              一般・社会人向けのテニス大会を中心に掲載します。
              シングルス、ダブルス、MIX、団体戦、交流大会、ベテラン大会などを対象とします。
            </p>

            <h3>
              主催者
            </h3>
            <p
              className="muted"
              style={{ lineHeight: 1.8 }}
            >
              テニス協会、クラブ、スクール、その他の大会主催団体などを対象としています。
              現在掲載している主催者は
              <Link href="/organizers" className="text-link">掲載主催者一覧</Link>
              から確認できます。
            </p>
          </div>
        </section>

        <section style={{ marginTop: 26 }}>
          <h2>情報の掲載・更新について</h2>

          <div
            className="card"
            style={{ padding: 24 }}
          >
            <p
              className="muted"
              style={{ lineHeight: 1.9 }}
            >
              掲載情報は、確認できた公式サイト、大会要項、協会・クラブ等の公開情報をもとに整理しています。
              大会によっては情報の更新時期や表記方法が異なるため、掲載内容が最新情報と異なる場合があります。
            </p>

            <p
              className="muted"
              style={{ lineHeight: 1.9, marginBottom: 0 }}
            >
              最新の開催日、申込締切、参加資格、参加費、開催可否などは、
              必ず主催者の公式情報をご確認ください。
            </p>
          </div>
        </section>

        <section style={{ marginTop: 26 }}>
          <h2>掲載情報の修正</h2>

          <div
            className="card"
            style={{ padding: 24 }}
          >
            <p
              className="muted"
              style={{ lineHeight: 1.9 }}
            >
              誤りや変更に気付いた場合は、大会詳細ページの
              「情報を修正する」からお知らせください。
              確認後、必要に応じて管理者が掲載情報を更新します。
            </p>

            <Link
              href="/tournaments"
              className="outline-button"
            >
              大会を探す
            </Link>
          </div>
        </section>

        <section
          className="card"
          style={{
            padding: 24,
            marginTop: 26,
            marginBottom: 40,
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            運営者
          </h2>

          <p style={{ lineHeight: 1.9, marginBottom: 0 }}>
            運営者：yattatta
            <br />
            連絡先：お問い合わせフォームより
          </p>
        </section>
      </div>
    </div>
  );
}
