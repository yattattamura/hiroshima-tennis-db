import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

type SearchParams = {
  keyword?: string;
  status?: string;
  page?: string;
};

type Tournament = {
  id: string;
  name: string;
  city: string | null;
  venue_name_raw: string | null;
  date_text: string | null;
  start_date: string | null;
  event_type: string | null;
  gender: string | null;
  level: string | null;
  status: string | null;
  deadline_text: string | null;
  deadline_date: string | null;
  official_url: string | null;
  last_checked_at: string | null;
};

const PAGE_SIZE = 20;

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
  const status = params.status ?? "";

  if (keyword) {
    search.set("keyword", keyword);
  }

  if (status) {
    search.set("status", status);
  }

  if (page > 1) {
    search.set("page", String(page));
  }

  const query = search.toString();

  return query
    ? `/admin/tournaments?${query}`
    : "/admin/tournaments";
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

export default async function AdminTournamentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const keyword = params.keyword?.trim() ?? "";
  const status = params.status ?? "";
  const currentPage = getPageNumber(params.page);

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

  let query = supabase
    .from("tournaments")
    .select(
      `
        id,
        name,
        city,
        venue_name_raw,
        date_text,
        start_date,
        event_type,
        gender,
        level,
        status,
        deadline_text,
        deadline_date,
        official_url,
        last_checked_at
      `,
      { count: "exact" }
    )
    .order("start_date", {
      ascending: true,
      nullsFirst: false,
    })
    .order("id", {
      ascending: true,
    });

  if (keyword) {
    const safeKeyword = keyword
      .replace(/[%_]/g, "")
      .replace(/[\\(),]/g, " ")
      .trim();

    if (safeKeyword) {
      query = query.or(
        [
          `name.ilike.%${safeKeyword}%`,
          `city.ilike.%${safeKeyword}%`,
          `venue_name_raw.ilike.%${safeKeyword}%`,
          `organizer_name_raw.ilike.%${safeKeyword}%`,
        ].join(",")
      );
    }
  }

  if (status) {
    query = query.eq("status", status);
  }

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await query.range(
    from,
    to
  );

  if (error) {
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
            <span>大会データ管理</span>
          </div>

          <div
            className="card"
            style={{
              padding: 30,
              marginTop: 20,
            }}
          >
            <h1>大会データ管理</h1>
            <p className="muted">
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

  const totalCount = count ?? 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / PAGE_SIZE)
  );

  const startItem =
    totalCount === 0 ? 0 : from + 1;
  const endItem = Math.min(
    from + tournaments.length,
    totalCount
  );

  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).filter(
    (page) =>
      totalPages <= 7 ||
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1
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
          <span>大会データ管理</span>
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
                大会データ管理
              </h1>

              <p
                className="muted"
                style={{ margin: 0 }}
              >
                登録されている大会を検索・編集します。
              </p>
            </div>

            <AdminLogoutButton />
          </div>
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
                "minmax(0, 1fr) 180px auto",
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
                placeholder="大会名・市町村・会場・主催者"
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
                ステータス
              </span>

              <select
                name="status"
                defaultValue={status}
                style={{
                  width: "100%",
                }}
              >
                <option value="">
                  すべて
                </option>
                <option value="募集中">
                  募集中
                </option>
                <option value="受付終了">
                  受付終了
                </option>
                <option value="終了">
                  終了
                </option>
                <option value="中止">
                  中止
                </option>
              </select>
            </label>

            <button
              type="submit"
              className="primary"
            >
              検索
            </button>
          </div>

          {(keyword || status) && (
            <div
              style={{
                marginTop: 12,
              }}
            >
              <Link
                href="/admin/tournaments"
                className="section-link"
              >
                条件をクリア
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
              大会一覧
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
          {tournaments.map((tournament) => (
            <article
              className="card"
              key={tournament.id}
              style={{
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <div className="badges">
                    {tournament.status ? (
                      <span className="badge green">
                        {tournament.status}
                      </span>
                    ) : (
                      <span className="badge">
                        ステータス未設定
                      </span>
                    )}

                    {tournament.level ? (
                      <span className="badge">
                        {tournament.level}
                      </span>
                    ) : null}
                  </div>

                  <h3
                    style={{
                      marginTop: 10,
                      marginBottom: 6,
                    }}
                  >
                    {tournament.name}
                  </h3>

                  <p
                    className="muted"
                    style={{
                      margin: 0,
                    }}
                  >
                    {formatDate(
                      tournament.start_date
                    )}
                    {tournament.city
                      ? ` ・ ${tournament.city}`
                      : ""}
                    {tournament.venue_name_raw
                      ? ` ・ ${tournament.venue_name_raw}`
                      : ""}
                  </p>

                  <p
                    className="muted"
                    style={{
                      margin: "5px 0 0",
                    }}
                  >
                    {tournament.event_type ??
                      "種目未設定"}
                    {tournament.gender
                      ? ` ・ ${tournament.gender}`
                      : ""}
                  </p>
                </div>

                <span
                  className="muted"
                  style={{
                    fontSize: 11,
                    flexShrink: 0,
                  }}
                >
                  {tournament.id}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: "1px solid #eee",
                }}
              >
                <Link
                  href={`/admin/tournaments/${tournament.id}/edit`}
                  className="primary"
                >
                  編集
                </Link>

                <Link
                  href={`/tournaments/${tournament.id}`}
                  className="outline-button"
                >
                  詳細を見る
                </Link>

                {tournament.official_url ? (
                  <a
                    href={tournament.official_url}
                    target="_blank"
                    rel="noreferrer"
                    className="outline-button"
                  >
                    公式 ↗
                  </a>
                ) : null}
              </div>
            </article>
          ))}

          {tournaments.length === 0 && (
            <div
              className="card"
              style={{
                padding: 30,
              }}
            >
              <h3>
                大会が見つかりません
              </h3>

              <p className="muted">
                キーワードやステータスを変更して検索してください。
              </p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <nav
            aria-label="大会一覧のページ"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              flexWrap: "wrap",
              margin: "18px 0 30px",
            }}
          >
            {currentPage > 1 && (
              <Link
                href={buildPageHref(
                  params,
                  currentPage - 1
                )}
                className="outline-button"
                style={{
                  minHeight: "auto",
                  padding: "7px 10px",
                }}
              >
                ← 前へ
              </Link>
            )}

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
                      item === currentPage
                        ? "page"
                        : undefined
                    }
                    className={
                      item === currentPage
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

            {currentPage < totalPages && (
              <Link
                href={buildPageHref(
                  params,
                  currentPage + 1
                )}
                className="outline-button"
                style={{
                  minHeight: "auto",
                  padding: "7px 10px",
                }}
              >
                次へ →
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
