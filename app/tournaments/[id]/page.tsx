import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { FavoriteButton } from "@/components/FavoriteButton";

type Source = {
  id: string;
  source_type: string;
  url: string | null;
  checked_at: string | null;
  notes: string | null;
};

function isUrl(value: string | null | undefined): boolean {
  return Boolean(value && /^https?:\/\//i.test(value));
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "未設定";
  }

  return new Date(value).toLocaleDateString("ja-JP");
}

function renderValue(
  value: string | null | undefined,
  fallback = "未設定"
) {
  return value?.trim() ? value : fallback;
}

function getJapanToday(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find(
    (part) => part.type === "year"
  )?.value;

  const month = parts.find(
    (part) => part.type === "month"
  )?.value;

  const day = parts.find(
    (part) => part.type === "day"
  )?.value;

  return `${year}-${month}-${day}`;
}

function getQualificationTags(tournament: any): string[] {
  const tags: string[] = [];

  if (tournament.external_allowed === "可") {
    tags.push("非会員OK");
  }

  if (tournament.other_city_allowed === "可") {
    tags.push("他市協会員OK");
  }

  if (tournament.eligibility_category === "ビジター参加可") {
    tags.push("ビジターOK");
  }

  return tags;
}

export default async function TournamentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [tournamentResult, sourcesResult] = await Promise.all([
    supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .single(),

    supabase
      .from("event_sources")
      .select("id, source_type, url, checked_at, notes")
      .eq("tournament_id", id)
      .order("checked_at", {
        ascending: false,
        nullsFirst: false,
      }),
  ]);

  const {
    data: tournament,
    error: tournamentError,
  } = tournamentResult;

  const sources: Source[] =
    (sourcesResult.data ?? []) as Source[];

  if (tournamentError || !tournament) {
    notFound();
  }

  const qualificationTags =
    getQualificationTags(tournament);

  const venue = tournament.venue_name_raw
    ? `${tournament.city ?? ""}・${tournament.venue_name_raw}`
    : renderValue(tournament.city);

  const officialUrl = renderValue(
    tournament.official_url,
    ""
  );

  const applicationMethod = renderValue(
    tournament.application_method,
    ""
  );

  const hasOfficialUrl =
    isUrl(officialUrl);

  const hasApplicationUrl =
    isUrl(applicationMethod);

  // ----------------------------------------
  // 関連大会
  // ----------------------------------------

  const today = getJapanToday();

  let relatedTournaments: any[] = [];

  if (tournament.organizer_id) {
    const { data: relatedData } =
      await supabase
        .from("tournaments")
        .select(
          "id, name, date_text, start_date, venue_name_raw, city, event_type, level, status"
        )
        .eq(
          "organizer_id",
          tournament.organizer_id
        )
        .neq("id", tournament.id)
        .gte("start_date", today)
        .order("start_date", {
          ascending: true,
          nullsFirst: false,
        })
        .limit(5);

    relatedTournaments =
      relatedData ?? [];
  }

  return (
    <main className="detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>

          <span aria-hidden="true">
            ›
          </span>

          <Link href="/tournaments">
            大会を探す
          </Link>

          <span aria-hidden="true">
            ›
          </span>

          <span>
            大会詳細
          </span>
        </div>

        <article className="card detail-main">
          <div className="detail-topline">
            <div className="badges">
              <span className="badge green">
                {renderValue(
                  tournament.status,
                  "状況未設定"
                )}
              </span>

              {tournament.level ? (
                <span className="badge">
                  {tournament.level}
                </span>
              ) : null}
            </div>

            <span className="detail-checked">
              確認日{" "}
              {formatDate(
                tournament.last_checked_at
              )}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <h1
              style={{
                marginBottom: 0,
              }}
            >
              {tournament.name}
            </h1>

            <FavoriteButton
              tournamentId={tournament.id}
            />
          </div>

          <div className="detail-keyinfo">
            <div className="detail-keyitem">
              <span className="detail-keylabel">
                開催日
              </span>

              <strong>
                {renderValue(
                  tournament.date_text
                )}
              </strong>
            </div>

            <div className="detail-keyitem">
              <span className="detail-keylabel">
                会場
              </span>

              <strong>
                {venue}
              </strong>
            </div>

            <div className="detail-keyitem">
              <span className="detail-keylabel">
                種目
              </span>

              <strong>
                {renderValue(
                  tournament.event_type
                )}
              </strong>
            </div>

            <div className="detail-keyitem">
              <span className="detail-keylabel">
                参加費
              </span>

              <strong>
                {renderValue(
                  tournament.fee_text
                )}
              </strong>
            </div>

            <div className="detail-keyitem detail-keyitem-emphasis">
              <span className="detail-keylabel">
                申込締切
              </span>

              <strong>
                {renderValue(
                  tournament.deadline_text,
                  "要項を確認"
                )}
              </strong>
            </div>
          </div>

          {qualificationTags.length > 0 ? (
            <section className="detail-section">
              <h2>
                参加資格
              </h2>

              <div className="detail-tags">
                {qualificationTags.map(
                  (tag) => (
                    <span
                      key={tag}
                      className="badge green"
                    >
                      ✓ {tag}
                    </span>
                  )
                )}
              </div>
            </section>
          ) : tournament.eligibility ? (
            <section className="detail-section">
              <h2>
                参加資格
              </h2>

              <p className="detail-text">
                {tournament.eligibility}
              </p>
            </section>
          ) : null}

          <div className="detail-actions">
            {hasOfficialUrl ? (
              <a
                className="primary"
                href={officialUrl}
                target="_blank"
                rel="noreferrer"
              >
                公式情報を見る ↗
              </a>
            ) : null}

            <Link
              className="outline-button"
              href={`/tournaments/${tournament.id}/suggest`}
            >
              情報を修正する
            </Link>
          </div>

          <div className="detail-mobile-actions">
            {hasOfficialUrl ? (
              <a
                className="primary"
                href={officialUrl}
                target="_blank"
                rel="noreferrer"
              >
                公式情報 ↗
              </a>
            ) : null}

            <Link
              className="outline-button"
              href={`/tournaments/${tournament.id}/suggest`}
            >
              修正する
            </Link>
          </div>

          <section className="detail-section">
            <h2>
              大会情報
            </h2>

            <div className="info-table">
              <div>
                主催者
              </div>

              <div>
                {tournament.organizer_id ? (
                  <Link
                    className="text-link"
                    href={`/organizers/${tournament.organizer_id}`}
                  >
                    {renderValue(
                      tournament.organizer_name_raw
                    )}
                  </Link>
                ) : (
                  renderValue(
                    tournament.organizer_name_raw
                  )
                )}
              </div>

              <div>
                開催日
              </div>

              <div>
                {renderValue(
                  tournament.date_text
                )}
              </div>

              <div>
                備考
              </div>

              <div>
                {renderValue(
                  tournament.notes,
                  "記載なし"
                )}
              </div>

              <div>
                会場
              </div>

              <div>
                {venue}
              </div>

              <div>
                種目
              </div>

              <div>
                {renderValue(
                  tournament.event_type
                )}
              </div>

              <div>
                性別
              </div>

              <div>
                {renderValue(
                  tournament.gender,
                  "指定なし"
                )}
              </div>

              <div>
                クラス
              </div>

              <div>
                {renderValue(
                  tournament.level
                )}
              </div>

              <div>
                参加資格
              </div>

              <div>
                {renderValue(
                  tournament.eligibility
                )}
              </div>

              <div>
                参加費
              </div>

              <div>
                {renderValue(
                  tournament.fee_text
                )}
              </div>

              <div>
                申込締切
              </div>

              <div>
                {renderValue(
                  tournament.deadline_text,
                  "要項を確認"
                )}
              </div>

              <div>
                申込方法
              </div>

              <div>
                {hasApplicationUrl ? (
                  <a
                    className="text-link"
                    href={
                      applicationMethod
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    申込ページを開く ↗
                  </a>
                ) : (
                  renderValue(
                    applicationMethod
                  )
                )}
              </div>
            </div>
          </section>

          {tournament.data_quality_note ? (
            <section className="notice detail-quality-note">
              <strong>
                確認メモ
              </strong>

              <p>
                {tournament.data_quality_note}
              </p>
            </section>
          ) : null}
        </article>

        {/* -------------------------------- */}
        {/* 関連する大会 */}
        {/* -------------------------------- */}

        {relatedTournaments.length > 0 ? (
          <section
            className="detail-source-card card"
            style={{
              marginTop: 16,
            }}
          >
            <div className="section-heading">
              <div>
                <h2>
                  この主催者の今後の大会
                </h2>

                <p className="muted">
                  同じ主催者が開催する大会です。
                </p>
              </div>

              {tournament.organizer_id ? (
                <Link
                  href={`/organizers/${tournament.organizer_id}`}
                  className="outline-button"
                >
                  すべて見る
                </Link>
              ) : null}
            </div>

            <div
              style={{
                display: "grid",
                gap: 10,
                marginTop: 14,
              }}
            >
              {relatedTournaments.map(
                (related) => (
                  <Link
                    key={related.id}
                    href={`/tournaments/${related.id}`}
                    className="card"
                    style={{
                      display: "block",
                      padding: 16,
                      textDecoration: "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <strong
                          style={{
                            display:
                              "block",
                            lineHeight:
                              1.5,
                          }}
                        >
                          {related.name}
                        </strong>

                        <div
                          className="muted"
                          style={{
                            marginTop: 6,
                          }}
                        >
                          {renderValue(
                            related.date_text
                          )}

                          {related.venue_name_raw
                            ? ` ・ ${related.venue_name_raw}`
                            : ""}
                        </div>

                        <div
                          className="muted"
                          style={{
                            marginTop: 3,
                          }}
                        >
                          {renderValue(
                            related.event_type,
                            "種目未設定"
                          )}

                          {related.level
                            ? ` ・ ${related.level}`
                            : ""}
                        </div>
                      </div>

                      {related.status ? (
                        <span
                          className="badge green"
                          style={{
                            flexShrink: 0,
                          }}
                        >
                          {related.status}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                )
              )}
            </div>
          </section>
        ) : null}

        {/* -------------------------------- */}
        {/* 情報源 */}
        {/* -------------------------------- */}

        <section
          className="detail-source-card card"
          style={{
            marginTop: 16,
          }}
        >
          <div className="section-heading">
            <div>
              <h2>
                情報源
              </h2>

              <p className="muted">
                公式情報を確認できるリンクです。
              </p>
            </div>
          </div>

          {hasOfficialUrl ? (
            <div className="source-row">
              <span className="badge">
                公式
              </span>

              <a
                className="text-link source-url"
                href={officialUrl}
                target="_blank"
                rel="noreferrer"
              >
                {officialUrl}
              </a>

              <span className="muted">
                {formatDate(
                  tournament.last_checked_at
                )}
              </span>
            </div>
          ) : null}

          {sources.length > 0 ? (
            <div className="source-list">
              {sources.map(
                (source) => (
                  <div
                    key={source.id}
                    className="source-row"
                  >
                    <span className="badge">
                      {
                        source.source_type
                      }
                    </span>

                    {isUrl(
                      source.url
                    ) ? (
                      <a
                        className="text-link source-url"
                        href={
                          source.url ??
                          "#"
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        {
                          source.url
                        }
                      </a>
                    ) : (
                      <span className="source-url">
                        {renderValue(
                          source.url
                        )}
                      </span>
                    )}

                    <span className="muted">
                      {formatDate(
                        source.checked_at
                      )}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : null}

          {!hasOfficialUrl &&
          sources.length === 0 ? (
            <p className="muted">
              情報源は未登録です。
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}