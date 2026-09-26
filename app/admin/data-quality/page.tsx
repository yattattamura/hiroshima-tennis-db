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

type QualityRow = {
  tournament: Tournament;
  issues: string[];
  urgent: boolean;
  stale: boolean;
  past: boolean;
};

const STALE_DAYS = 30;

function getJapanToday(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function getDateKey(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const key = value.slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    return null;
  }

  const date = new Date(`${key}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return key;
}

function daysBetween(
  olderDate: string,
  newerDate: string
): number {
  const older = new Date(`${olderDate}T00:00:00Z`);
  const newer = new Date(`${newerDate}T00:00:00Z`);

  return Math.floor(
    (newer.getTime() - older.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

function isValidUrl(value: string | null): boolean {
  if (!value?.trim()) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function buildIssues(
  tournament: Tournament,
  today: string
): {
  issues: string[];
  urgent: boolean;
  stale: boolean;
} {
  const issues: string[] = [];

  const startDate = getDateKey(
    tournament.start_date
  );
  const deadlineDate = getDateKey(
    tournament.deadline_date
  );
  const checkedDate = getDateKey(
    tournament.last_checked_at
  );

  const past = Boolean(
    startDate && startDate < today
  );

  if (!startDate) {
    issues.push("開催日未設定");
  }

  if (!tournament.venue_name_raw?.trim()) {
    issues.push("会場未設定");
  }

  if (!tournament.fee_text?.trim()) {
    issues.push("参加費未設定");
  }

  if (!tournament.deadline_text?.trim()) {
    issues.push("申込締切未設定");
  }

  if (tournament.deadline_text?.trim() && !deadlineDate) {
    issues.push("締切日未設定");
  }

  if (!tournament.official_url?.trim()) {
    issues.push("公式URL未設定");
  } else if (!isValidUrl(tournament.official_url)) {
    issues.push("公式URL形式要確認");
  }

  let stale = false;

  if (!checkedDate) {
    issues.push("最終確認日未設定");
  } else if (
    !past &&
    daysBetween(checkedDate, today) >= STALE_DAYS
  ) {
    stale = true;
    issues.push("最終確認が30日以上前");
  }

  if (startDate && deadlineDate && !past) {
    if (deadlineDate < today) {
      issues.push("申込締切経過");
    }

    if (deadlineDate > startDate) {
      issues.push("締切日を要確認");
    }
  }

  if (tournament.data_quality_note?.trim()) {
    issues.push("品質メモあり");
  }

  const urgent =
    issues.includes("申込締切経過") ||
    issues.includes("開催日未設定") ||
    issues.includes("公式URL未設定") ||
    issues.includes("公式URL形式要確認");

  return {
    issues,
    urgent,
    stale,
  };
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
            <h1>データ品質</h1>

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

  const today = getJapanToday();

  const rows: QualityRow[] = tournaments
    .map((tournament) => {
      const result = buildIssues(
        tournament,
        today
      );

      const startDate = getDateKey(
        tournament.start_date
      );

      return {
        tournament,
        issues: result.issues,
        urgent: result.urgent,
        stale: result.stale,
        past: Boolean(
          startDate && startDate < today
        ),
      };
    })
    .filter(
      (row) => row.issues.length > 0
    )
    .sort((a, b) => {
      if (a.urgent !== b.urgent) {
        return a.urgent ? -1 : 1;
      }

      if (a.stale !== b.stale) {
        return a.stale ? -1 : 1;
      }

      if (a.issues.length !== b.issues.length) {
        return b.issues.length - a.issues.length;
      }

      const aDate =
        getDateKey(a.tournament.start_date) ??
        "9999-12-31";

      const bDate =
        getDateKey(b.tournament.start_date) ??
        "9999-12-31";

      return aDate.localeCompare(bDate);
    });

  const issueCount = rows.length;

  const issueTotal = rows.reduce(
    (total, row) =>
      total + row.issues.length,
    0
  );

  const staleCount = rows.filter(
    (row) => row.stale
  ).length;

  const urgentCount = rows.filter(
    (row) => row.urgent
  ).length;

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
                大会情報の不足、古い確認日、締切情報などをチェックします。
              </p>

              <p
                className="muted"
                style={{
                  margin: "6px 0 0",
                  fontSize: 13,
                }}
              >
                基準日：{formatDate(today)}
              </p>
            </div>

            <AdminLogoutButton />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(160px, 1fr))",
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

            <div
              className="muted"
              style={{
                marginTop: 6,
                fontSize: 13,
              }}
            >
              / 全{tournaments.length}大会
            </div>
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

          <div
            className="card"
            style={{
              padding: 24,
            }}
          >
            <div className="muted">
              30日以上未確認
            </div>

            <strong
              style={{
                display: "block",
                fontSize: 32,
                marginTop: 8,
              }}
            >
              {staleCount}
            </strong>
          </div>

          <div
            className="card"
            style={{
              padding: 24,
            }}
          >
            <div className="muted">
              優先確認
            </div>

            <strong
              style={{
                display: "block",
                fontSize: 32,
                marginTop: 8,
              }}
            >
              {urgentCount}
            </strong>
          </div>
        </div>

        <div
          className="notice"
          style={{
            marginTop: 20,
          }}
        >
          <strong>
            チェック基準
          </strong>

          <p
            style={{
              marginBottom: 0,
            }}
          >
            開催日・会場・参加費・申込締切・公式URL・最終確認日を確認し、
            今後開催される大会については、最終確認から30日以上経過した情報も表示します。
            また、締切日が開催日より後になっている場合や、公式URLの形式が不正な場合も確認対象です。
          </p>
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
              urgent,
              stale,
              past,
            }) => (
              <article
                className="card"
                key={tournament.id}
                style={{
                  padding: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      className="badges"
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <span className="badge">
                        {issues.length}項目
                      </span>

                      {urgent ? (
                        <span className="badge green">
                          優先確認
                        </span>
                      ) : null}

                      {stale ? (
                        <span className="badge">
                          確認が古い
                        </span>
                      ) : null}

                      {past ? (
                        <span className="badge">
                          開催終了
                        </span>
                      ) : null}
                    </div>

                    <h2
                      style={{
                        marginTop: 12,
                        marginBottom: 0,
                      }}
                    >
                      {tournament.name}
                    </h2>
                  </div>

                  <span
                    className="muted"
                    style={{
                      fontSize: 12,
                    }}
                  >
                    ID: {tournament.id}
                  </span>
                </div>

                <p className="muted">
                  {tournament.city ??
                    "地域未設定"}
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
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 12,
                    marginTop: 18,
                  }}
                >
                  <div
                    className="card"
                    style={{
                      padding: 14,
                      background: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      className="muted"
                      style={{
                        fontSize: 12,
                      }}
                    >
                      開催日
                    </div>

                    <strong>
                      {formatDate(
                        tournament.start_date
                      )}
                    </strong>
                  </div>

                  <div
                    className="card"
                    style={{
                      padding: 14,
                      background: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      className="muted"
                      style={{
                        fontSize: 12,
                      }}
                    >
                      申込締切
                    </div>

                    <strong>
                      {tournament.deadline_text?.trim()
                        ? tournament.deadline_text
                        : "未設定"}
                    </strong>
                  </div>

                  <div
                    className="card"
                    style={{
                      padding: 14,
                      background: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      className="muted"
                      style={{
                        fontSize: 12,
                      }}
                    >
                      最終確認日
                    </div>

                    <strong>
                      {formatDate(
                        tournament.last_checked_at
                      )}
                    </strong>
                  </div>
                </div>

                {tournament.data_quality_note ? (
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
                ) : null}

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 20,
                  }}
                >
                  <Link
                    href={`/admin/tournaments/${tournament.id}/edit`}
                    className="primary"
                  >
                    大会を編集
                  </Link>

                  <Link
                    href={`/tournaments/${tournament.id}`}
                    className="outline-button"
                  >
                    大会詳細を見る →
                  </Link>

                  {isValidUrl(
                    tournament.official_url
                  ) ? (
                    <a
                      href={
                        tournament.official_url ??
                        "#"
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="outline-button"
                    >
                      公式ページ ↗
                    </a>
                  ) : null}
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
            marginBottom: 30,
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
