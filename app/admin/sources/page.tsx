import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

type SearchParams = {
  keyword?: string;
  filter?: string;
  page?: string;
};

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
        start_date: string | null;
        status: string | null;
      }
    | {
        name: string;
        start_date: string | null;
        status: string | null;
      }[]
    | null;
};

const PAGE_SIZE = 20;
const STALE_DAYS = 30;

function sourceTypeLabel(sourceType: string): string {
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

function formatDate(value: string | null): string {
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

function getTournament(
  tournament: Source["tournaments"]
): {
  name: string;
  startDate: string | null;
  status: string | null;
} {
  if (!tournament) {
    return {
      name: "大会名不明",
      startDate: null,
      status: null,
    };
  }

  const item = Array.isArray(tournament)
    ? tournament[0]
    : tournament;

  return {
    name: item?.name ?? "大会名不明",
    startDate: item?.start_date ?? null,
    status: item?.status ?? null,
  };
}

function getPageNumber(value: string | undefined): number {
  const parsed = Number(value ?? "1");

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function buildPageHref(
  params: SearchParams,
  page: number
): string {
  const search = new URLSearchParams();

  const keyword = params.keyword?.trim() ?? "";
  const filter = params.filter ?? "";

  if (keyword) {
    search.set("keyword", keyword);
  }

  if (filter) {
    search.set("filter", filter);
  }

  if (page > 1) {
    search.set("page", String(page));
  }

  const query = search.toString();

  return query
    ? `/admin/sources?${query}`
    : "/admin/sources";
}

function isValidUrl(value: string | null): boolean {
  if (!value?.trim()) {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function getAgeInDays(
  value: string | null,
  today: string
): number | null {
  if (!value) {
    return null;
  }

  const checked = new Date(
    `${value.slice(0, 10)}T00:00:00Z`
  );
  const current = new Date(
    `${today}T00:00:00Z`
  );

  if (
    Number.isNaN(checked.getTime()) ||
    Number.isNaN(current.getTime())
  ) {
    return null;
  }

  return Math.floor(
    (current.getTime() - checked.getTime()) /
      (1000 * 60 * 60 * 24)
  );
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

function filterLabel(filter: string): string {
  switch (filter) {
    case "unchecked":
      return "確認日未設定";
    case "stale":
      return "30日以上未確認";
    case "missingUrl":
      return "URL未登録";
    case "invalidUrl":
      return "URL要確認";
    default:
      return "すべて";
  }
}

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const keyword =
    params.keyword?.trim() ?? "";
  const filter = params.filter ?? "";
  const currentPage = getPageNumber(
    params.page
  );

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminUser } =
    await supabase
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
        name,
        start_date,
        status
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return (
      <div className="detail-page">
        <div className="container">
          <div className="card" style={{ padding: 30, marginTop: 20 }}>
            <h1>情報源管理</h1>
            <p className="muted">
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

  const allSources = (data ?? []) as Source[];
  const today = getJapanToday();

  const filteredSources = allSources
    .filter((source) => {
      const tournament = getTournament(
        source.tournaments
      );

      if (!keyword) {
        return true;
      }

      const keywordLower =
        keyword.toLocaleLowerCase("ja-JP");

      return [
        tournament.name,
        source.source_type,
        source.url ?? "",
        source.notes ?? "",
      ].some((value) =>
        value
          .toLocaleLowerCase("ja-JP")
          .includes(keywordLower)
      );
    })
    .filter((source) => {
      const age = getAgeInDays(
        source.checked_at,
        today
      );

      switch (filter) {
        case "unchecked":
          return !source.checked_at;

        case "stale":
          return age !== null && age >= STALE_DAYS;

        case "missingUrl":
          return !source.url?.trim();

        case "invalidUrl":
          return Boolean(
            source.url?.trim() &&
              !isValidUrl(source.url)
          );

        default:
          return true;
      }
    })
    .sort((a, b) => {
      const aAge =
        getAgeInDays(a.checked_at, today);
      const bAge =
        getAgeInDays(b.checked_at, today);

      if (filter === "stale") {
        return (
          (bAge ?? -1) -
          (aAge ?? -1)
        );
      }

      if (filter === "unchecked") {
        return (
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );
      }

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    });

  const totalCount =
    filteredSources.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / PAGE_SIZE)
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const from =
    (safePage - 1) * PAGE_SIZE;
  const pageSources =
    filteredSources.slice(
      from,
      from + PAGE_SIZE
    );

  const startItem =
    totalCount === 0 ? 0 : from + 1;

  const endItem = Math.min(
    from + pageSources.length,
    totalCount
  );

  const uncheckedCount =
    allSources.filter(
      (source) => !source.checked_at
    ).length;

  const staleCount =
    allSources.filter(
      (source) => {
        const age = getAgeInDays(
          source.checked_at,
          today
        );
        return (
          age !== null &&
          age >= STALE_DAYS
        );
      }
    ).length;

  const missingUrlCount =
    allSources.filter(
      (source) => !source.url?.trim()
    ).length;

  const invalidUrlCount =
    allSources.filter(
      (source) =>
        Boolean(
          source.url?.trim() &&
            !isValidUrl(source.url)
        )
    ).length;

  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).filter(
    (page) =>
      totalPages <= 7 ||
      page === 1 ||
      page === totalPages ||
      Math.abs(page - safePage) <= 1
  );

  const paginationLinks: Array<
    number | "ellipsis"
  > = [];

  for (const page of visiblePages) {
    const previous =
      paginationLinks[
        paginationLinks.length - 1
      ];

    if (
      typeof previous === "number" &&
      page - previous > 1
    ) {
      paginationLinks.push("ellipsis");
    }

    paginationLinks.push(page);
  }

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
          <span>情報源管理</span>
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
                情報源管理
              </h1>

              <p
                className="muted"
                style={{ margin: 0 }}
              >
                大会情報の出典と確認状態を管理します。
              </p>
            </div>

            <AdminLogoutButton />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
            marginTop: 20,
          }}
        >
          <Link
            href="/admin/sources"
            className="card"
            style={{
              padding: 20,
              textDecoration: "none",
            }}
          >
            <div className="muted">
              情報源
            </div>
            <strong
              style={{
                display: "block",
                fontSize: 28,
                marginTop: 6,
              }}
            >
              {allSources.length}
            </strong>
          </Link>

          <Link
            href="/admin/sources?filter=unchecked"
            className="card"
            style={{
              padding: 20,
              textDecoration: "none",
            }}
          >
            <div className="muted">
              確認日未設定
            </div>
            <strong
              style={{
                display: "block",
                fontSize: 28,
                marginTop: 6,
              }}
            >
              {uncheckedCount}
            </strong>
          </Link>

          <Link
            href="/admin/sources?filter=stale"
            className="card"
            style={{
              padding: 20,
              textDecoration: "none",
            }}
          >
            <div className="muted">
              30日以上未確認
            </div>
            <strong
              style={{
                display: "block",
                fontSize: 28,
                marginTop: 6,
              }}
            >
              {staleCount}
            </strong>
          </Link>

          <Link
            href="/admin/sources?filter=missingUrl"
            className="card"
            style={{
              padding: 20,
              textDecoration: "none",
            }}
          >
            <div className="muted">
              URL未登録
            </div>
            <strong
              style={{
                display: "block",
                fontSize: 28,
                marginTop: 6,
              }}
            >
              {missingUrlCount}
            </strong>
          </Link>

          <Link
            href="/admin/sources?filter=invalidUrl"
            className="card"
            style={{
              padding: 20,
              textDecoration: "none",
            }}
          >
            <div className="muted">
              URL要確認
            </div>
            <strong
              style={{
                display: "block",
                fontSize: 28,
                marginTop: 6,
              }}
            >
              {invalidUrlCount}
            </strong>
          </Link>
        </div>

        <form
          method="GET"
          className="card"
          style={{
            padding: 20,
            marginTop: 16,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr) 200px auto",
              gap: 10,
              alignItems: "end",
            }}
          >
            <label>
              <span
                className="muted"
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 13,
                }}
              >
                キーワード
              </span>

              <input
                name="keyword"
                type="search"
                defaultValue={keyword}
                placeholder="大会名・URL・メモ"
                style={{
                  width: "100%",
                }}
              />
            </label>

            <label>
              <span
                className="muted"
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 13,
                }}
              >
                確認状態
              </span>

              <select
                name="filter"
                defaultValue={filter}
                style={{
                  width: "100%",
                }}
              >
                <option value="">
                  すべて
                </option>
                <option value="unchecked">
                  確認日未設定
                </option>
                <option value="stale">
                  30日以上未確認
                </option>
                <option value="missingUrl">
                  URL未登録
                </option>
                <option value="invalidUrl">
                  URL要確認
                </option>
              </select>
            </label>

            <button
              type="submit"
              className="primary"
            >
              絞り込む
            </button>
          </div>

          {(keyword || filter) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 12,
              }}
            >
              <span className="muted">
                条件：
              </span>

              {keyword ? (
                <span className="badge">
                  「{keyword}」
                </span>
              ) : null}

              {filter ? (
                <span className="badge">
                  {filterLabel(filter)}
                </span>
              ) : null}

              <Link
                href="/admin/sources"
                className="section-link"
              >
                クリア
              </Link>
            </div>
          )}
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 18,
            marginBottom: 10,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
              }}
            >
              情報源一覧
            </h2>

            <p
              className="muted"
              style={{
                margin: "4px 0 0",
                fontSize: 13,
              }}
            >
              {startItem}〜{endItem} / {totalCount}件
            </p>
          </div>

          <Link
            href="/admin/data-quality"
            className="outline-button"
          >
            データ品質
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gap: 12,
            marginTop: 12,
          }}
        >
          {pageSources.map((source) => {
            const tournament =
              getTournament(
                source.tournaments
              );

            const age =
              getAgeInDays(
                source.checked_at,
                today
              );

            const stale =
              age !== null &&
              age >= STALE_DAYS;

            const missingUrl =
              !source.url?.trim();

            const invalidUrl =
              Boolean(
                source.url?.trim() &&
                  !isValidUrl(
                    source.url
                  )
              );

            return (
              <article
                className="card"
                key={source.id}
                style={{
                  padding: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-start",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <div
                      className="badges"
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <span className="badge">
                        {sourceTypeLabel(
                          source.source_type
                        )}
                      </span>

                      {stale ? (
                        <span className="badge">
                          確認が古い
                        </span>
                      ) : source.checked_at ? (
                        <span className="badge green">
                          確認済み
                        </span>
                      ) : (
                        <span className="badge">
                          確認日未設定
                        </span>
                      )}

                      {missingUrl ? (
                        <span className="badge">
                          URL未登録
                        </span>
                      ) : null}

                      {invalidUrl ? (
                        <span className="badge">
                          URL要確認
                        </span>
                      ) : null}

                      {tournament.status ? (
                        <span className="badge">
                          {tournament.status}
                        </span>
                      ) : null}
                    </div>

                    <h2
                      style={{
                        marginTop: 10,
                        marginBottom: 6,
                      }}
                    >
                      {tournament.name}
                    </h2>

                    <p
                      className="muted"
                      style={{
                        margin: 0,
                      }}
                    >
                      開催日：
                      {formatDate(
                        tournament.startDate
                      )}
                    </p>
                  </div>

                  <span
                    className="muted"
                    style={{
                      fontSize: 11,
                      flexShrink: 0,
                    }}
                  >
                    {source.id}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 16,
                  }}
                >
                  <p
                    style={{
                      marginBottom: 6,
                    }}
                  >
                    <strong>
                      URL
                    </strong>
                  </p>

                  {source.url ? (
                    isValidUrl(
                      source.url
                    ) ? (
                      <a
                        href={source.url ?? "#"}
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
                          wordBreak:
                            "break-all",
                        }}
                      >
                        {source.url}
                      </p>
                    )
                  ) : (
                    <p
                      className="muted"
                      style={{
                        margin: 0,
                      }}
                    >
                      URL未登録
                    </p>
                  )}
                </div>

                {source.notes ? (
                  <div
                    style={{
                      marginTop: 14,
                    }}
                  >
                    <p
                      style={{
                        marginBottom: 5,
                      }}
                    >
                      <strong>
                        メモ
                      </strong>
                    </p>

                    <p
                      className="muted"
                      style={{
                        margin: 0,
                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {source.notes}
                    </p>
                  </div>
                ) : null}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 10,
                    marginTop: 16,
                  }}
                >
                  <div
                    className="card"
                    style={{
                      padding: 12,
                      background:
                        "rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      className="muted"
                      style={{
                        fontSize: 11,
                      }}
                    >
                      情報源の確認日
                    </div>

                    <strong>
                      {formatDate(
                        source.checked_at
                      )}
                    </strong>
                  </div>

                  <div
                    className="card"
                    style={{
                      padding: 12,
                      background:
                        "rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      className="muted"
                      style={{
                        fontSize: 11,
                      }}
                    >
                      登録日
                    </div>

                    <strong>
                      {formatDate(
                        source.created_at
                      )}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 16,
                    paddingTop: 14,
                    borderTop:
                      "1px solid #eee",
                  }}
                >
                  <Link
                    href={`/admin/tournaments/${source.tournament_id}/edit`}
                    className="primary"
                  >
                    大会を編集
                  </Link>

                  <Link
                    href={`/tournaments/${source.tournament_id}`}
                    className="outline-button"
                  >
                    大会詳細を見る →
                  </Link>

                  {isValidUrl(
                    source.url
                  ) ? (
                    <a
                      href={source.url ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="outline-button"
                    >
                      情報源を開く ↗
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}

          {pageSources.length === 0 && (
            <div
              className="card"
              style={{
                padding: 30,
              }}
            >
              <h3>
                情報源が見つかりません
              </h3>

              <p className="muted">
                キーワードや確認状態を変更してください。
              </p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <nav
            aria-label="情報源一覧のページ"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              flexWrap: "wrap",
              margin: "18px 0 30px",
            }}
          >
            {safePage > 1 ? (
              <Link
                href={buildPageHref(
                  params,
                  safePage - 1
                )}
                className="outline-button"
                style={{
                  minHeight: "auto",
                  padding: "7px 10px",
                }}
              >
                ← 前へ
              </Link>
            ) : null}

            {paginationLinks.map(
              (item, index) =>
                item === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="muted"
                    style={{
                      padding: "0 3px",
                    }}
                  >
                    …
                  </span>
                ) : (
                  <Link
                    key={item}
                    href={buildPageHref(
                      params,
                      item
                    )}
                    aria-current={
                      item === safePage
                        ? "page"
                        : undefined
                    }
                    className={
                      item === safePage
                        ? "primary small"
                        : "outline-button"
                    }
                    style={{
                      minHeight: "auto",
                      minWidth: 38,
                      padding: "7px 9px",
                      textAlign: "center",
                    }}
                  >
                    {item}
                  </Link>
                )
            )}

            {safePage < totalPages ? (
              <Link
                href={buildPageHref(
                  params,
                  safePage + 1
                )}
                className="outline-button"
                style={{
                  minHeight: "auto",
                  padding: "7px 10px",
                }}
              >
                次へ →
              </Link>
            ) : null}
          </nav>
        )}

        <div style={{ marginTop: 20 }}>
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
