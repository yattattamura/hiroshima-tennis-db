import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TournamentCard } from "@/components/TournamentCard";
import { Tournament } from "@/types/tournament";

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

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: string;
    city?: string;
    eventType?: string;
    gender?: string;
    level?: string;
    eligibility?: string;
  }>;
}) {
  const params = await searchParams;

  const period = params.period ?? "all";
  const city = params.city ?? "";
  const eventType = params.eventType ?? "";
  const gender = params.gender ?? "";
  const level = params.level ?? "";
  const eligibility = params.eligibility ?? "";

  const supabase = await createClient();

  let query = supabase
    .from("tournaments")
    .select("*")
    .order("start_date", { ascending: true });

  // 市町村
  if (city) {
    query = query.eq("city", city);
  }

  // 種目
  if (eventType) {
    query = query.eq("event_type", eventType);
  }

  // 性別
  if (gender) {
    query = query.eq("gender", gender);
  }

  // レベル
  if (level) {
    query = query.eq("level", level);
  }

  // 参加資格
  if (eligibility === "external") {
    query = query.eq("external_allowed", "可");
  }

  if (eligibility === "otherCity") {
    query = query.eq("other_city_allowed", "可");
  }

  if (eligibility === "visitor") {
    query = query.eq("eligibility_category", "ビジター参加可");
  }

  // 開催時期
  const today = new Date();

  if (period === "month") {
    // 今月1日
    const firstDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    // 今月末日
    const lastDay = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );

    const firstDayText = firstDay.toISOString().split("T")[0];
    const lastDayText = lastDay.toISOString().split("T")[0];

    query = query
      .gte("start_date", firstDayText)
      .lte("start_date", lastDayText);
  }

  if (period === "3months") {
    // 今月1日
    const firstDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    // 3か月後の1日
    // 例：9月なら12月1日
    const afterThreeMonths = new Date(
      today.getFullYear(),
      today.getMonth() + 3,
      1
    );

    const firstDayText = firstDay.toISOString().split("T")[0];
    const afterThreeMonthsText = afterThreeMonths
      .toISOString()
      .split("T")[0];

    query = query
      .gte("start_date", firstDayText)
      .lt("start_date", afterThreeMonthsText);
  }

  const { data, error } = await query;

  if (error) {
    return (
      <div className="search-page">
        <div className="container">
          <div className="card" style={{ padding: 30 }}>
            <h2>大会データの取得に失敗しました</h2>
            <p>{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const tournaments: Tournament[] = (data ?? []).map(convertTournament);

  return (
    <div className="search-page">
      <div className="container">
        <div className="results-layout">
          <aside className="filters">
            <strong>大会一覧</strong>

            <p className="muted">
              {tournaments.length} 件の大会が見つかりました
            </p>

            <Link href="/" className="outline-button">
              トップへ戻る
            </Link>
          </aside>

          <section className="results">
            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
              />
            ))}

            {tournaments.length === 0 && (
              <div className="card" style={{ padding: 30 }}>
                <h3>条件に一致する大会がありません</h3>
                <p className="muted">
                  検索条件を変更して、もう一度お試しください。
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}