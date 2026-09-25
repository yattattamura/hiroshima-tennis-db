import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type EventSource = {
  id: string;
  tournament_id: string;
  source_type: string;
  url: string | null;
  checked_at: string | null;
  notes: string | null;
  created_at: string;
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

function isHttpUrl(
  value: string | null | undefined
): boolean {
  if (!value) {
    return false;
  }

  return (
    value.startsWith("https://") ||
    value.startsWith("http://")
  );
}

function formatDate(
  value: string | null | undefined
): string {
  if (!value) {
    return "未設定";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "未設定";
  }

  return date.toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
}

export default async function TournamentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  // --------------------------------------------------
  // 大会情報取得
  // --------------------------------------------------

  const { data: tournament, error: tournamentError } =
    await supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .single();

  if (
    tournamentError ||
    !tournament
  ) {
    notFound();
  }

  // --------------------------------------------------
  // 情報源取得
  // --------------------------------------------------

  const { data: eventSources, error: sourceError } =
    await supabase
      .from("event_sources")
      .select("*")
      .eq("tournament_id", id)
      .order("created_at", {
        ascending: true,
      });

  const sources: EventSource[] =
    sourceError || !eventSources
      ? []
      : eventSources;

  // --------------------------------------------------
  // 基本情報
  // --------------------------------------------------

  const venueText = [
    tournament.city ?? "",
    tournament.venue_name_raw ?? "",
  ]
    .filter(Boolean)
    .join("・");

  const rows: Array<[string, string]> = [
    [
      "主催者",
      tournament.organizer_name_raw ??
        "未設定",
    ],
    [
      "開催日",
      tournament.date_text ??
        "未設定",
    ],
    [
      "会場",
      venueText ||
        "未設定",
    ],
    [
      "種目",
      tournament.event_type ??
        "未設定",
    ],
    [
      "性別",
      tournament.gender ??
        "未設定",
    ],
    [
      "クラス",
      tournament.level ??
        "未設定",
    ],
    [
      "参加資格",
      tournament.eligibility ??
        "未設定",
    ],
    [
      "参加費",
      tournament.fee_text ??
        "要項をご確認ください",
    ],
    [
      "申込締切",
      tournament.deadline_text ??
        "要項をご確認ください",
    ],
    [
      "申込方法",
      tournament.application_method ??
        "公式サイトをご確認ください",
    ],
  ];

  // --------------------------------------------------
  // 参加資格の整理
  // --------------------------------------------------

  const qualificationMessages: string[] = [];

  if (
    tournament.external_allowed === "可"
  ) {
    qualificationMessages.push(
      "非会員でも参加可能"
    );
  }

  if (
    tournament.other_city_allowed === "可"
  ) {
    qualificationMessages.push(
      "他市協会員も参加可能"
    );
  }

  if (
    tournament.eligibility_category ===
    "ビジター参加可"
  ) {
    qualificationMessages.push(
      "ビジター参加可能"
    );
  }

  if (
    tournament.age_condition
  ) {
    qualificationMessages.push(
      tournament.age_condition
    );
  }

  // --------------------------------------------------
  // 公式URL
  // --------------------------------------------------

  const officialUrl =
    tournament.official_url ?? "";

  // --------------------------------------------------
  // 情報源数
  // --------------------------------------------------

  const sourceCount =
    sources.length +
    (officialUrl &&
    !sources.some(
      (source) =>
        source.url === officialUrl
    )
      ? 1
      : 0);

  // --------------------------------------------------
  // 表示
  // --------------------------------------------------

  return (
    <div className="detail-page">
      <div className="container">

        {/* パンくず */}
        <div className="breadcrumb">
          <Link href="/">
            ホーム
          </Link>

          {" → "}

          <Link href="/tournaments">
            大会を探す
          </Link>

          {" → "}

          <span>
            大会詳細
          </span>
        </div>

        <div className="detail-grid">

          {/* ====================================== */}
          {/* メイン */}
          {/* ====================================== */}

          <article className="card detail-main">

            {/* ステータス */}
            <div className="badges">
              <span className="badge green">
                {tournament.status ??
                  "状況未設定"}
              </span>

              {tournament.level && (
                <span className="badge">
                  {tournament.level}
                </span>
              )}

              {tournament.event_type && (
                <span className="badge">
                  {tournament.event_type}
                </span>
              )}
            </div>

            {/* 大会名 */}
            <h1>
              {tournament.name}
            </h1>

            {/* 基本情報 */}
            <div className="info-table">
              {rows.map(
                ([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "contents",
                    }}
                  >
                    <div>
                      {label}
                    </div>

                    <div>
                      <span
                        style={{
                          whiteSpace:
                            "pre-wrap",
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* 参加資格の整理 */}
            {qualificationMessages.length >
              0 && (
              <div
                className="notice"
                style={{
                  marginTop: 24,
                }}
              >
                <strong>
                  参加資格について
                </strong>

                <div
                  style={{
                    display: "grid",
                    gap: 6,
                    marginTop: 10,
                  }}
                >
                  {qualificationMessages.map(
                    (message) => (
                      <p
                        key={message}
                        style={{
                          margin: 0,
                        }}
                      >
                        ✓ {message}
                      </p>
                    )
                  )}
                </div>
              </div>
            )}

            {/* データ品質メモ */}
            {tournament.data_quality_note && (
              <div
                className="notice"
                style={{
                  marginTop: 24,
                }}
              >
                <strong>
                  情報についての注意
                </strong>

                <p
                  style={{
                    marginBottom: 0,
                    whiteSpace:
                      "pre-wrap",
                  }}
                >
                  {tournament.data_quality_note}
                </p>
              </div>
            )}

            {/* ---------------------------------- */}
            {/* 情報源 */}
            {/* ---------------------------------- */}

            <section
              style={{
                marginTop: 32,
              }}
            >
              <h2>
                情報源
              </h2>

              <p className="muted">
                この大会情報を確認するために登録している情報源です。
              </p>

              {officialUrl && (
                <div
                  className="card"
                  style={{
                    padding: 20,
                    marginTop: 16,
                  }}
                >
                  <div className="badges">
                    <span className="badge">
                      公式情報
                    </span>
                  </div>

                  <h3
                    style={{
                      marginTop: 10,
                    }}
                  >
                    公式情報
                  </h3>

                  {isHttpUrl(
                    officialUrl
                  ) ? (
                    <a
                      href={officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        wordBreak:
                          "break-all",
                      }}
                    >
                      {officialUrl}
                    </a>
                  ) : (
                    <p
                      className="muted"
                      style={{
                        marginBottom: 0,
                      }}
                    >
                      {officialUrl}
                    </p>
                  )}
                </div>
              )}

              {sources.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  {sources.map(
                    (source) => (
                      <div
                        key={source.id}
                        className="card"
                        style={{
                          padding: 20,
                        }}
                      >
                        <div className="badges">
                          <span className="badge">
                            {sourceTypeLabel(
                              source.source_type
                            )}
                          </span>
                        </div>

                        {source.url ? (
                          <div
                            style={{
                              marginTop: 10,
                            }}
                          >
                            {isHttpUrl(
                              source.url
                            ) ? (
                              <a
                                href={
                                  source.url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  wordBreak:
                                    "break-all",
                                }}
                              >
                                {
                                  source.url
                                }
                              </a>
                            ) : (
                              <p
                                className="muted"
                                style={{
                                  marginBottom: 0,
                                }}
                              >
                                {
                                  source.url
                                }
                              </p>
                            )}
                          </div>
                        ) : (
                          <p
                            className="muted"
                            style={{
                              marginTop: 10,
                              marginBottom: 0,
                            }}
                          >
                            URL未登録
                          </p>
                        )}

                        {source.notes && (
                          <p
                            className="muted"
                            style={{
                              marginTop: 10,
                              marginBottom: 0,
                              whiteSpace:
                                "pre-wrap",
                            }}
                          >
                            {source.notes}
                          </p>
                        )}

                        <p
                          className="muted"
                          style={{
                            marginTop: 10,
                            marginBottom: 0,
                          }}
                        >
                          確認日：
                          {formatDate(
                            source.checked_at
                          )}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div
                  className="card"
                  style={{
                    padding: 20,
                    marginTop: 16,
                  }}
                >
                  <p
                    className="muted"
                    style={{
                      margin: 0,
                    }}
                  >
                    個別の情報源はまだ登録されていません。
                  </p>
                </div>
              )}
            </section>

            {/* ---------------------------------- */}
            {/* 最終確認 */}
            {/* ---------------------------------- */}

            <div
              className="notice"
              style={{
                marginTop: 24,
              }}
            >
              <strong>
                情報の更新状況
              </strong>

              <p
                style={{
                  marginTop: 10,
                  marginBottom: 6,
                }}
              >
                最終確認日：
                {formatDate(
                  tournament.last_checked_at
                )}
              </p>

              <p
                className="muted"
                style={{
                  margin: 0,
                }}
              >
                登録情報 {sourceCount}件の情報源を確認できます。
              </p>
            </div>

            {/* ---------------------------------- */}
            {/* アクション */}
            {/* ---------------------------------- */}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 28,
              }}
            >
              <Link
                href={`/tournaments/${id}/suggest`}
                className="outline-button"
              >
                この情報を修正
              </Link>

              <Link
                href="/tournaments"
                className="outline-button"
              >
                大会一覧へ戻る
              </Link>
            </div>
          </article>

          {/* ====================================== */}
          {/* サイドバー */}
          {/* ====================================== */}

          <aside
            className="card detail-side"
          >
            <h3>
              情報の信頼性
            </h3>

            <p>
              ✓ 大会情報をデータベースで管理
            </p>

            <p>
              ✓ 情報源を記録
            </p>

            <p>
              ✓ 最終確認日を記録
            </p>

            <p>
              ✓ ユーザーから修正提案可能
            </p>

            <hr />

            <h3>
              情報源
            </h3>

            <p>
              {sourceCount}件
            </p>

            <p className="muted">
              公式情報や大会要項など、
              登録されている情報源を確認できます。
            </p>

            <hr />

            <h3>
              情報に誤りがある場合
            </h3>

            <p className="muted">
              開催日、会場、参加費、締切などに変更や誤りがある場合は、修正提案からお知らせください。
            </p>

            <Link
              href={`/tournaments/${id}/suggest`}
              className="outline-button"
            >
              修正を提案する
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}