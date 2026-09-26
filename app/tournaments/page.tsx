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
};

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
  const deadline = params.deadline ?? "";
  const status = params.status ?? "";

  const supabase = await createClient();
  const today = getJapanToday();

  let query = supabase
    .from("tournaments")
    .select("*")
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

  if (level) {
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
  }

  const [tournamentResult, citiesResult] = await Promise.all([
    query,
    supabase
      .from("tournaments")
      .select("city")
      .not("city", "is", null),
  ]);

  const { data, error } = tournamentResult;

  if (error || citiesResult.error) {
    return (
      <div className="search-page">
        <div className="container">
          <div
            className="card"
            style={{ padding: 24, marginTop: 20 }}
          >
            <h1 style={{ marginTop: 0 }}>大会データを取得できませんでした</h1>
            <p className="muted">Supabaseから大会情報を取得できませんでした。</p>
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

  const cities = Array.from(
    new Set(
      (citiesResult.data ?? [])
        .map((row) => row.city)
        .filter(
          (city): city is string =>
            typeof city === "string" && city.trim().length > 0
        )
    )
  ).sort((a, b) => a.localeCompare(b, "ja"));

  const activeConditions: string[] = [];

  if (keyword) activeConditions.push(`キーワード: ${keyword}`);
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
            <h1
              className="section-title"
              style={{ margin: 0 }}
            >
              大会を探す
            </h1>
            <p className="muted" style={{ margin: "4px 0 0" }}>
              {tournaments.length}件
            </p>
          </div>
          <Link href="/" className="section-link">
            ホームへ
          </Link>
        </div>

        <SearchForm cities={cities} />

        {activeConditions.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 6,
              margin: "12px 0 14px",
            }}
          >
            <span className="muted" style={{ fontSize: 12 }}>
              条件
            </span>
            {activeConditions.map((condition) => (
              <span className="badge" key={condition}>
                {condition}
              </span>
            ))}
            <Link href="/tournaments" className="section-link">
              クリア
            </Link>
          </div>
        )}

        <section className="results">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 2,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18 }}>
              検索結果
            </h2>
            <span className="muted" style={{ fontSize: 13 }}>
              {tournaments.length}件
            </span>
          </div>

          {tournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
            />
          ))}

          {tournaments.length === 0 && (
            <div
              className="card empty-card"
              style={{ marginTop: 2 }}
            >
              <div>
                <strong>大会が見つかりません</strong>
                <p className="muted" style={{ margin: "5px 0 0", fontSize: 13 }}>
                  条件を少し変えて検索してください。
                </p>
              </div>
              <Link href="/tournaments" className="outline-button">
                条件をクリア
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
