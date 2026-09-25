import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

type Source = {
  id: string;
  tournament_id: string;
  source_type: string;
  url: string | null;
  checked_at: string | null;
  notes: string | null;
  created_at: string;
  tournaments:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

function sourceTypeLabel(
  sourceType: string
): string {
  switch (sourceType) {
    case "official":
      return "公式サイト";

    case "pdf":
      return "大会要項・PDF";

    case "application":
      return "申込ページ";

    case "organizer":
      return "主催者情報";

    default:
      return sourceType || "情報源";
  }
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

function getTournamentName(
  tournament:
    | Source["tournaments"]
): string {
  if (!tournament) {
    return "大会名不明";
  }

  if (Array.isArray(tournament)) {
    return tournament[0]?.name ??
      "大会名不明";
  }

  return tournament.name;
}

export default async function SourcesPage() {
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
    .from("event_sources")
    .select(`
      id,
      tournament_id,
      source_type,
      url,
      checked_at,
      notes,
      created_at,
      tournaments (
        name
      )
    `)
    .order("created_at", {
      ascending: false,
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
              情報源管理
            </h1>

            <p>
              情報源の取得に失敗しました。
            </p>

            <p className="muted">
              {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sources =
    (data ?? []) as Source[];

  const uncheckedCount =
    sources.filter(
      (source) => !source.checked_at
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
            情報源管理
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
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  marginBottom: 8,
                }}
              >
                情報源管理
              </h1>

              <p
                className="muted"
                style={{
                  margin: 0,
                }}
              >
                大会情報に登録されている情報源を確認します。
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
              情報源数
            </div>

            <strong
              style={{
                display: "block",
                fontSize: 32,
                marginTop: 8,
              }}
            >
              {sources.length}
            </strong>
          </div>

          <div
            className="card"
            style={{
              padding: 24,
            }}
          >
            <div className="muted">
              確認日未設定
            </div>

            <strong
              style={{
                display: "block",
                fontSize: 32,
                marginTop: 8,
              }}
            >
              {uncheckedCount}
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
          {sources.map(
            (source) => (
              <article
                className="card"
                key={source.id}
                style={{
                  padding: 24,
                }}
              >
                <div className="badges">
                  <span className="badge">
                    {sourceTypeLabel(
                      source.source_type
                    )}
                  </span>

                  <span className="badge">
                    {source.checked_at
                      ? "確認済み"
                      : "確認日未設定"}
                  </span>
                </div>

                <h2
                  style={{
                    marginTop: 12,
                  }}
                >
                  {getTournamentName(
                    source.tournaments
                  )}
                </h2>

                {source.url ? (
                  <div
                    style={{
                      marginTop: 16,
                    }}
                  >
                    <p>
                      <strong>
                        URL
                      </strong>
                    </p>

                    {source.url.startsWith(
                      "http://"
                    ) ||
                    source.url.startsWith(
                      "https://"
                    ) ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          wordBreak:
                            "break-all",
                        }}
                      >
                        {source.url}
                      </a>
                    ) : (
                      <p
                        className="muted"
                        style={{
                          margin: 0,
                        }}
                      >
                        {source.url}
                      </p>
                    )}
                  </div>
                ) : (
                  <p
                    className="muted"
                    style={{
                      marginTop: 16,
                    }}
                  >
                    URL未登録
                  </p>
                )}

                {source.notes && (
                  <div
                    style={{
                      marginTop: 16,
                    }}
                  >
                    <p>
                      <strong>
                        メモ
                      </strong>
                    </p>

                    <p
                      className="muted"
                      style={{
                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {source.notes}
                    </p>
                  </div>
                )}

                <p
                  className="muted"
                  style={{
                    marginTop: 16,
                    marginBottom: 0,
                  }}
                >
                  確認日：
                  {formatDate(
                    source.checked_at
                  )}
                </p>

                <div
                  style={{
                    marginTop: 18,
                  }}
                >
                  <Link
                    href={`/tournaments/${source.tournament_id}`}
                    className="outline-button"
                  >
                    大会詳細を見る →
                  </Link>
                </div>
              </article>
            )
          )}

          {sources.length === 0 && (
            <div
              className="card"
              style={{
                padding: 30,
              }}
            >
              <h3>
                情報源はまだありません
              </h3>

              <p className="muted">
                `event_sources` に登録された情報源がここに表示されます。
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