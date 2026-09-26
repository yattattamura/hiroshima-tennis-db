import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminUser) {
    redirect("/admin/login");
  }

  const [
    tournamentResult,
    pendingResult,
    approvedResult,
    rejectedResult,
    sourceResult,
    qualityResult,
  ] = await Promise.all([
    supabase
      .from("tournaments")
      .select("id", {
        count: "exact",
        head: true,
      }),
    supabase
      .from("correction_proposals")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "pending"),
    supabase
      .from("correction_proposals")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "approved"),
    supabase
      .from("correction_proposals")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "rejected"),
    supabase
      .from("event_sources")
      .select("id", {
        count: "exact",
        head: true,
      }),
    supabase
      .from("tournaments")
      .select("id", {
        count: "exact",
        head: true,
      })
      .is("official_url", null),
  ]);

  const tournamentCount =
    tournamentResult.count ?? 0;

  const pendingCount =
    pendingResult.count ?? 0;

  const approvedCount =
    approvedResult.count ?? 0;

  const rejectedCount =
    rejectedResult.count ?? 0;

  const sourceCount =
    sourceResult.count ?? 0;

  const noOfficialUrlCount =
    qualityResult.count ?? 0;

  return (
    <div className="detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          {" → "}
          <span>管理者画面</span>
        </div>

        <div
          className="card"
          style={{
            padding: 30,
            marginTop: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ marginBottom: 8 }}>
                管理者ダッシュボード
              </h1>

              <p
                className="muted"
                style={{ margin: 0 }}
              >
                広島テニスDBのデータ管理画面です。
              </p>
            </div>

            <AdminLogoutButton />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginTop: 20,
          }}
        >
          <div
            className="card"
            style={{ padding: 24 }}
          >
            <div className="muted">
              登録大会
            </div>
            <strong
              style={{
                display: "block",
                fontSize: 32,
                marginTop: 8,
              }}
            >
              {tournamentCount}
            </strong>

            <div
              style={{
                marginTop: 12,
              }}
            >
              <Link
                href="/admin/tournaments"
                className="section-link"
              >
                大会を管理 →
              </Link>
            </div>
          </div>

          <div
            className="card"
            style={{ padding: 24 }}
          >
            <div className="muted">
              未処理の修正提案
            </div>
            <strong
              style={{
                display: "block",
                fontSize: 32,
                marginTop: 8,
              }}
            >
              {pendingCount}
            </strong>
          </div>

          <div
            className="card"
            style={{ padding: 24 }}
          >
            <div className="muted">
              承認済み
            </div>
            <strong
              style={{
                display: "block",
                fontSize: 32,
                marginTop: 8,
              }}
            >
              {approvedCount}
            </strong>
          </div>

          <div
            className="card"
            style={{ padding: 24 }}
          >
            <div className="muted">
              情報源
            </div>
            <strong
              style={{
                display: "block",
                fontSize: 32,
                marginTop: 8,
              }}
            >
              {sourceCount}
            </strong>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            marginTop: 20,
          }}
        >
          <Link
            href="/admin/tournaments"
            className="card"
            style={{
              padding: 26,
              textDecoration: "none",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              大会データ管理
            </h2>
            <p className="muted">
              登録大会を検索して、情報を直接編集します。
            </p>
            <strong>
              大会を管理する →
            </strong>
          </Link>

          <Link
            href="/admin/corrections"
            className="card"
            style={{
              padding: 26,
              textDecoration: "none",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              修正提案管理
            </h2>
            <p className="muted">
              ユーザーから届いた修正提案を確認・承認・却下します。
            </p>
            <strong>
              未処理 {pendingCount}件 →
            </strong>
          </Link>

          <Link
            href="/admin/corrections/history"
            className="card"
            style={{
              padding: 26,
              textDecoration: "none",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              変更履歴
            </h2>
            <p className="muted">
              大会情報の変更履歴を確認します。
            </p>
            <strong>
              履歴を見る →
            </strong>
          </Link>

          <Link
            href="/admin/data-quality"
            className="card"
            style={{
              padding: 26,
              textDecoration: "none",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              データ品質
            </h2>
            <p className="muted">
              大会情報の不足や確認が必要なデータを確認します。
            </p>
            <strong>
              確認する →
            </strong>
          </Link>

          <Link
            href="/admin/sources"
            className="card"
            style={{
              padding: 26,
              textDecoration: "none",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              情報源管理
            </h2>
            <p className="muted">
              大会に登録されている公式サイトやPDFなどを確認します。
            </p>
            <strong>
              情報源を見る →
            </strong>
          </Link>
        </div>

        <div
          className="card"
          style={{
            padding: 24,
            marginTop: 20,
          }}
        >
          <h2>
            データ品質の注意
          </h2>

          <p className="muted">
            現在、公式URLが未登録の大会：
            <strong
              style={{
                color: "inherit",
                marginLeft: 6,
              }}
            >
              {noOfficialUrlCount}件
            </strong>
          </p>

          <p className="muted">
            この数字は今後のデータ品質チェック項目として拡張していきます。
          </p>
        </div>
      </div>
    </div>
  );
}
