import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { SearchForm } from "@/components/SearchForm";
import { TournamentCard } from "@/components/TournamentCard";
import { Tournament } from "@/types/tournament";

type SearchParams = {
  period?: string;
  city?: string;
  eventType?: string;
  gender?: string;
  level?: string;
  eligibility?: string;
  keyword?: string;
  deadline?: string;
  status?: string;
  page?: string;
};

const PAGE_SIZE = 20;

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

function addMonthsToDate(dateText: string, months: number): string {
  const [year, month, day] = dateText.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  date.setUTCMonth(date.getUTCMonth() + months);

  return date.toISOString().split("T")[0];
}

function convertTournament(row: any): Tournament {
  return {
    id: row.id,
    name: row.name,
    organizer: row.organizer_name_raw ?? "",
    date: row.date_text ?? "",
    city: row.city ?? "",
    venue: row.venue_name_raw ?? "",
    eventType: row.event_type ?? "",
    gender: row.gender ?? "",
    level: row.level ?? "",
    eligibility: row.eligibility ?? "",
    fee: row.fee_text ?? "",
    deadline: row.deadline_text ?? "",
    applicationMethod: row.application_method ?? "",
    officialUrl: row.official_url ?? "",
    status: row.status ?? "",
    notes: row.notes ?? "",
    eligibilityCategory: row.eligibility_category ?? "",
    membershipRequired: row.membership_required ?? "",
    externalAllowed: row.external_allowed ?? "",
    otherCityAllowed: row.other_city_allowed ?? "",
    ageCondition: row.age_condition ?? "",
    searchTokens: row.search_tokens ?? "",
  };
}

function getPeriodLabel(period: string): string {
  switch (period) {
    case "month":
      return "今月";
    case "3months":
      return "3か月以内";
    case "6months":
      return "6か月以内";
    default:
      return "すべて";
  }
}

function getDeadlineLabel(deadline: string): string {
  switch (deadline) {
    case "open":
      return "申込可能";
    case "7days":
      return "7日以内に締切";
    case "30days":
      return "30日以内に締切";
    case "noDeadline":
      return "締切情報なし";
    default:
      return "";
  }
}

function getPageNumber(value: string | undefined): number {
  const parsed = Number(value ?? "1");

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function buildPageHref(params: SearchParams, page: number): string {
  const search = new URLSearchParams();

  const entries: Array<[string, string | undefined]> = [
    ["keyword", params.keyword],
    ["period", params.period],
    ["city", params.city],
    ["eventType", params.eventType],
    ["gender", params.gender],
    ["level", params.level],
    ["eligibility", params.eligibility],
    ["deadline", params.deadline],
    ["status", params.status],
  ];

  for (const [key, value] of entries) {
    if (value) {
      search.set(key, value);
    }
  }

  if (page > 1) {
    search.set("page", String(page));
  }

  const query = search.toString();
  return query ? `/tournaments?${query}` : "/tournaments";
}

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const period = params.period ?? "all";
  const city = params.city ?? "";
  const eventType = params.eventType ?? "";
  const gender = params.gender ?? "";
  const level = params.level ?? "";
  const eligibility = params.eligibility ?? "";
  const keyword = params.keyword?.trim() ?? "";
  const deadlineParam = params.deadline;
  const deadline =
    deadlineParam === "all"
      ? ""
      : deadlineParam ?? "open";
  const status = params.status ?? "";
  const currentPage = getPageNumber(params.page);

  const supabase = await createClient();
  const today = getJapanToday();

  let query = supabase
    .from("tournaments")
    .select("*", { count: "exact" })
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
          `organizer_name_raw.ilike.%${safeKeyword}%`,
          `venue_name_raw.ilike.%${safeKeyword}%`,
          `city.ilike.%${safeKeyword}%`,
          `search_tokens.ilike.%${safeKeyword}%`,
          `notes.ilike.%${safeKeyword}%`,
        ].join(",")
      );
    }
  }

  if (city) {
    query = query.eq("city", city);
  }

  if (eventType) {
    query = query.eq("event_type", eventType);
  }

  if (gender) {
    query = query.eq("gender", gender);
  }

  if (level === "CD") {
    query = query.or("level.eq.CD,level.eq.C/D");
  } else if (level === "AB") {
    query = query.or("level.eq.AB,level.eq.A/B");
  } else if (level) {
    query = query.eq("level", level);
  }

  if (eligibility === "external") {
    query = query.eq("external_allowed", "可");
  }

  if (eligibility === "otherCity") {
    query = query.eq("other_city_allowed", "可");
  }

  if (eligibility === "visitor") {
    query = query.eq("eligibility_category", "ビジター参加可");
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (period === "month") {
    const nextMonth = addMonthsToDate(today, 1);
    query = query.gte("start_date", today).lt("start_date", nextMonth);
  }

  if (period === "3months") {
    const afterThreeMonths = addMonthsToDate(today, 3);
    query = query
      .gte("start_date", today)
      .lt("start_date", afterThreeMonths);
  }

  if (period === "6months") {
    const afterSixMonths = addMonthsToDate(today, 6);
    query = query
      .gte("start_date", today)
      .lt("start_date", afterSixMonths);
  }

  if (deadline === "open") {
    query = query.gte("deadline_date", today);
  }

  if (deadline === "7days") {
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + 7);
    const sevenDaysLater = date.toISOString().split("T")[0];

    query = query
      .gte("deadline_date", today)
      .lte("deadline_date", sevenDaysLater);
  }

  if (deadline === "30days") {
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + 30);
    const thirtyDaysLater = date.toISOString().split("T")[0];

    query = query
      .gte("deadline_date", today)
      .lte("deadline_date", thirtyDaysLater);
  }

  if (deadline === "noDeadline") {
    query = query.is("deadline_date", null);
  } else if (deadline === "") {
    query = query.gte("start_date", today);
  }

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const [tournamentResult, citiesResult] = await Promise.all([
    query,
    supabase
      .from("tournaments")
      .select("city")
      .not("city", "is", null),
  ]);

  const { data, error, count } = tournamentResult;

  if (error || citiesResult.error) {
    return (
      <div className="search-page">
        <div className="container">
          <div className="card" style={{ padding: 24, marginTop: 20 }}>
            <h1 style={{ marginTop: 0 }}>大会データを取得できませんでした</h1>
            <p className="muted">大会情報の取得に失敗しました。</p>
            <p className="muted">
              {error?.message ?? citiesResult.error?.message ?? "データの取得に失敗しました。"}
            </p>
            <Link href="/" className="outline-button">
              ホームへ戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tournaments: Tournament[] = (data ?? []).map(convertTournament);
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const startItem = totalCount === 0 ? 0 : from + 1;
  const endItem = Math.min(from + tournaments.length, totalCount);

  const cities = Array.from(
    new Set(
      (citiesResult.data ?? [])
        .map((row) => row.city)
        .filter(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0
        )
    )
  ).sort((a, b) => a.localeCompare(b, "ja"));

  const activeConditions: string[] = [];

  if (keyword) activeConditions.push(`「${keyword}」`);
  if (period !== "all") activeConditions.push(getPeriodLabel(period));
  if (city) activeConditions.push(city);
  if (eventType) activeConditions.push(eventType);
  if (gender) activeConditions.push(gender);
  if (level) activeConditions.push(level);
  if (eligibility === "external") activeConditions.push("非会員OK");
  if (eligibility === "otherCity") activeConditions.push("他市協会員OK");
  if (eligibility === "visitor") activeConditions.push("ビジターOK");
  if (deadline) activeConditions.push(getDeadlineLabel(deadline));
  if (status) activeConditions.push(status);

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

  const paginationLinks: Array<number | "ellipsis"> = [];
  for (const page of visiblePages) {
    const previous = paginationLinks[paginationLinks.length - 1];
    if (typeof previous === "number" && page - previous > 1) {
      paginationLinks.push("ellipsis");
    }
    paginationLinks.push(page);
  }

  return (
    <div className="search-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          {" → 大会を探す"}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>
            <h1 className="section-title" style={{ margin: 0 }}>
              大会を探す
            </h1>
            <p className="muted" style={{ margin: "4px 0 0" }}>
              {startItem}〜{endItem} / {totalCount}件
            </p>
          </div>
          <Link href="/" className="section-link">
            ホーム
          </Link>
        </div>

        <SearchForm
          cities={cities}
          initialValues={{
            keyword,
            period,
            city,
            eventType,
            level,
            gender,
            eligibility,
            deadline: params.deadline ?? "open",
            status,
          }}
        />

        {activeConditions.length > 0 && (
          <div className="search-active-conditions" aria-label="現在の絞り込み条件">
            <div className="search-active-conditions-title">
              <span aria-hidden="true">🔎</span>
              <strong>絞り込み中</strong>
            </div>
            <div className="search-active-condition-list">
              {activeConditions.map((condition) => (
                <span className="badge" key={condition}>
                  {condition}
                </span>
              ))}
            </div>
            <Link href="/tournaments" className="section-link">
              すべてクリア
            </Link>
          </div>
        )}

        <section className="results">
          <div className="search-results-heading">
            <h2 style={{ margin: 0, fontSize: 18 }}>検索結果</h2>
          </div>

          {tournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
            />
          ))}

          {tournaments.length === 0 && (
            <div className="card empty-card search-empty-state" style={{ marginTop: 2 }}>
              <div>
                <strong>大会が見つかりません</strong>
                <p className="muted" style={{ margin: "5px 0 0", fontSize: 13 }}>
                  申込状況や日程条件を少し広げてみてください。
                </p>
              </div>

              <div
                className="search-empty-actions"
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Link href="/tournaments?deadline=all" className="outline-button">
                  申込条件を外す
                </Link>
                <Link href="/tournaments" className="primary">
                  全条件をクリア
                </Link>
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <nav
              aria-label="大会一覧のページ"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                flexWrap: "wrap",
                margin: "18px 0 8px",
              }}
            >
              {currentPage > 1 && (
                <Link
                  href={buildPageHref(params, currentPage - 1)}
                  className="outline-button"
                  style={{ minHeight: "auto", padding: "7px 10px" }}
                >
                  ← 前へ
                </Link>
              )}

              {paginationLinks.map((item, index) =>
                item === "ellipsis" ? (
                  <span key={`ellipsis-${index}`} className="muted" style={{ padding: "0 3px" }}>
                    …
                  </span>
                ) : (
                  <Link
                    key={item}
                    href={buildPageHref(params, item)}
                    aria-current={item === currentPage ? "page" : undefined}
                    className={item === currentPage ? "primary small" : "outline-button"}
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
                  href={buildPageHref(params, currentPage + 1)}
                  className="outline-button"
                  style={{ minHeight: "auto", padding: "7px 10px" }}
                >
                  次へ →
                </Link>
              )}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
