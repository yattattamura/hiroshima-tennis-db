import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

type Tournament = {
  id: string;
  name: string;
  city: string | null;
  venue_name_raw: string | null;
  start_date: string | null;
  deadline_date: string | null;
  fee_text: string | null;
  deadline_text: string | null;
  official_url: string | null;
  last_checked_at: string | null;
  data_quality_note: string | null;
};

function buildIssues(
  tournament: Tournament
): string[] {
  const issues: string[] = [];

  if (!tournament.start_date) {
    issues.push("開催日未設定");
  }

  if (!tournament.venue_name_raw) {
    issues.push("会場未設定");
  }

  if (!tournament.fee_text) {
    issues.push("参加費未設定");
  }

  if (!tournament.deadline_text) {
    issues.push("申込締切未設定");
  }

  if (!tournament.official_url) {
    issues.push("公式URL未設定");
  }

  if (!tournament.last_checked_at) {
    issues.push("最終確認日未設定");
  }

  if (tournament.data_quality_note) {
    issues.push("品質メモあり");
  }

  return issues;
}

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "未設定";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "未設定";
  }

  return date.toLocaleDateString(
    "ja-JP",
    {
      timeZone: "Asia/Tokyo",
    }
  );
}

export default async function DataQualityPage() {
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

  const { data, error } = await supabase
    .from("tournaments")
    .select(`
      id,
      name,
      city,
      venue_name_raw,
      start_date,
      deadline_date,
      fee_text,
      deadline_text,
      official_url,
      last_checked_at,
      data_quality_note
    `)
    .order("start_date", {
      ascending: true,
      nullsFirst: false,
    });

  if (error) {
    return (
      <div className="detail-page">
        <div className="container">
          <div
            className="card"
            style={{
              padding: 30,
              marginTop: 20,
            }}
          >
            <h1>
              データ品質
            </h1>

            <p>
              大会データを取得できませんでした。
            </p>

            <p className="muted">
              {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tournaments =
    (data ?? []) as Tournament[];

  const rows = tournaments
    .map((tournament) => ({
      tournament,
      issues: buildIssues(
        tournament
      ),
    }))
    .filter(
      (row) => row.issues.length > 0
    );

  const issueCount =
    rows.length;

  const issueTotal =
    rows.reduce(
      (total, row) =>
        total + row.issues.length,
      0
    );

  return (
    <div className="detail-page">
      <div className="container">

        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          {" → "}
          <Link href="/admin">
            管理者画面
          </Link>
          {" → "}
          <span>
            データ品質
          </span>
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
              gap: 20,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  marginBottom: 8,
                }}
              >
                データ品質
              </h1>

              <p
                className="muted"
                style={{
                  margin: 0,
                }}
              >
                大会情報の不足や確認が必要な項目を確認します。
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
            style={{
              padding: 24,
            }}
          >
            <div className="muted">
              問題のある大会
            </div>

            <strong
              style={{
                display: "block",
                fontSize: 32,
                marginTop: 8,
              }}
            >
              {issueCount}
            </strong>
          </div>

          <div
            className="card"
            style={{
              padding: 24,
            }}
          >
            <div className="muted">
              問題項目数
            </div>

            <strong
              style={{
                display: "block",
                fontSize: 32,
                marginTop: 8,
              }}
            >
              {issueTotal}
            </strong>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 16,
            marginTop: 20,
          }}
        >
          {rows.map(
            ({
              tournament,
              issues,
            }) => (
              <article
                className="card"
                key={tournament.id}
                style={{
                  padding: 24,
                }}
              >
                <div className="badges">
                  <span className="badge">
                    {issues.length}項目
                  </span>
                </div>

                <h2
                  style={{
                    marginTop: 12,
                  }}
                >
                  {tournament.name}
                </h2>

                <p className="muted">
                  {tournament.city ?? "地域未設定"}
                  {tournament.venue_name_raw
                    ? `・${tournament.venue_name_raw}`
                    : ""}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 16,
                  }}
                >
                  {issues.map(
                    (issue) => (
                      <span
                        className="badge"
                        key={issue}
                      >
                        {issue}
                      </span>
                    )
                  )}
                </div>

                <div
                  style={{
                    marginTop: 18,
                  }}
                >
                  <p className="muted">
                    開催日：
                    {formatDate(
                      tournament.start_date
                    )}
                  </p>

                  <p className="muted">
                    最終確認日：
                    {formatDate(
                      tournament.last_checked_at
                    )}
                  </p>
                </div>

                {tournament.data_quality_note && (
                  <div
                    className="notice"
                    style={{
                      marginTop: 18,
                    }}
                  >
                    <strong>
                      データ品質メモ
                    </strong>

                    <p
                      style={{
                        marginBottom: 0,
                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {
                        tournament.data_quality_note
                      }
                    </p>
                  </div>
                )}

                <div
                  style={{
                    marginTop: 20,
                  }}
                >
                  <Link
                    href={`/tournaments/${tournament.id}`}
                    className="outline-button"
                  >
                    大会詳細を見る →
                  </Link>
                </div>
              </article>
            )
          )}

          {rows.length === 0 && (
            <div
              className="card"
              style={{
                padding: 30,
              }}
            >
              <h3>
                現在、確認が必要な大会はありません
              </h3>

              <p className="muted">
                現在のチェック項目では問題が検出されませんでした。
              </p>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 20,
          }}
        >
          <Link
            href="/admin"
            className="outline-button"
          >
            ← 管理者画面へ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}