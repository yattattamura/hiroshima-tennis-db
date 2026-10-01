import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { TournamentCard } from "@/components/TournamentCard";
import { SearchForm } from "@/components/SearchForm";
import { Tournament, TournamentDate } from "@/types/tournament";
import { DEFAULT_PREFECTURE, PREFECTURES } from "@/lib/prefectures";

type SearchTournamentRow = {
  id: string;
  name: string;
  organizer_name_raw: string | null;
  prefecture: string | null;
  city: string | null;
  venue_name_raw: string | null;
  date_text: string | null;
  start_date: string | null;
  event_type: string | null;
  gender: string | null;
  level: string | null;
  eligibility: string | null;
  fee_text: string | null;
  deadline_text: string | null;
  deadline_date?: string | null;
  application_method: string | null;
  official_url: string | null;
  status: string | null;
  notes: string | null;
  eligibility_category: string | null;
  membership_required: string | null;
  external_allowed: string | null;
  other_city_allowed: string | null;
  age_condition: string | null;
  search_tokens: string | null;
  tournament_dates?: Array<{
    id: string;
    start_date: string;
    end_date: string | null;
    date_type: string;
    label: string | null;
    sort_order: number;
  }>;
};

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

function convertTournament(row: SearchTournamentRow): Tournament {
  const tournamentDates: TournamentDate[] = (row.tournament_dates ?? []).map((date) => ({
    id: date.id,
    startDate: date.start_date,
    endDate: date.end_date,
    dateType: date.date_type === "予備日" ? "予備日" : "開催日",
    label: date.label,
    sortOrder: date.sort_order ?? 0,
  }));

  return {
    id: row.id,
    name: row.name,
    organizer: row.organizer_name_raw ?? "",
    date: row.date_text ?? "",
    startDate: row.start_date ?? undefined,
    tournamentDates,
    prefecture: row.prefecture ?? "",
    city: row.city ?? "",
    venue: row.venue_name_raw ?? "",
    eventType: row.event_type ?? "",
    gender: row.gender ?? "",
    level: row.level ?? "",
    eligibility: row.eligibility ?? "",
    fee: row.fee_text ?? "",
    deadline: row.deadline_text ?? "",
    applicationMethod:
      row.application_method ?? "",
    deadlineDate:
      row.deadline_date ?? "",
    officialUrl: row.official_url ?? "",
    status: row.status ?? "",
    notes: row.notes ?? "",
    eligibilityCategory:
      row.eligibility_category ?? "",
    membershipRequired:
      row.membership_required ?? "",
    externalAllowed:
      row.external_allowed ?? "",
    otherCityAllowed:
      row.other_city_allowed ?? "",
    ageCondition:
      row.age_condition ?? "",
    searchTokens:
      row.search_tokens ?? "",
  };
}

export default async function Home() {
  const supabase = await createClient();
  const today = getJapanToday();

  const [
    featuredResult,
    citiesResult,
    tournamentCountResult,
    organizerCountResult,
  ] = await Promise.all([
    supabase
      .from("tournaments")
      .select("*, tournament_dates(id, start_date, end_date, date_type, label, sort_order)")
      .eq("prefecture", DEFAULT_PREFECTURE)
      .gte("start_date", today)
      .order("start_date", {
        ascending: true,
        nullsFirst: false,
      })
      .limit(3),
    supabase
      .from("tournaments")
      .select("prefecture, city")
      .not("city", "is", null),
    supabase
      .from("tournaments")
      .select("id", {
        count: "exact",
        head: true,
      })
      .gte("start_date", today),
    supabase
      .from("organizers")
      .select("id", {
        count: "exact",
        head: true,
      }),
  ]);

  if (
    featuredResult.error ||
    citiesResult.error ||
    tournamentCountResult.error ||
    organizerCountResult.error
  ) {
    const errorMessage =
      featuredResult.error?.message ??
      citiesResult.error?.message ??
      tournamentCountResult.error?.message ??
      organizerCountResult.error?.message ??
      "データの取得に失敗しました.";

    return (
      <div className="detail-page">
        <div className="container">
          <div
            className="card"
            style={{
              padding: 24,
              marginTop: 32,
            }}
          >
            <h1>広島テニスポータル</h1>
            <p>大会データを取得できませんでした。</p>
            <p className="muted">{errorMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  const featured = (
    featuredResult.data ?? []
  ).map((row) =>
    convertTournament(row as SearchTournamentRow)
  );

  const citiesByPrefecture = (citiesResult.data ?? []).reduce<Record<string, string[]>>((map, row) => {
    const prefecture = row.prefecture?.trim();
    const city = row.city?.trim();
    if (!prefecture || !city) return map;
    const current = map[prefecture] ?? [];
    if (!current.includes(city)) current.push(city);
    map[prefecture] = current;
    return map;
  }, {});

  Object.values(citiesByPrefecture).forEach((values) =>
    values.sort((a, b) => a.localeCompare(b, "ja"))
  );

  const cities = citiesByPrefecture[DEFAULT_PREFECTURE] ?? [];

  const tournamentCount =
    tournamentCountResult.count ?? 0;

  const organizerCount =
    organizerCountResult.count ?? 0;

  return (
    <>
      <section className="hero home-hero">
        <div className="container">
          <div className="hero-copy">
            <h1>広島県の社会人・一般テニス大会を探す</h1>
          </div>

          <SearchForm
            cities={cities}
            citiesByPrefecture={citiesByPrefecture}
            prefectures={PREFECTURES}
            submitPath="/"
            prefectureInPath
            initialValues={{ prefecture: DEFAULT_PREFECTURE }}
            title="検索条件を指定"
          />

          <div className="home-community-note">
            <div>
              <strong>みんなで大会情報を育てよう</strong>
              <p>
                情報の誤りを見つけたら、無料アカウントを作って修正依頼を送れます。
              </p>
            </div>
            <Link href="/auth/signup" className="outline-button">
              無料で参加する
            </Link>
          </div>
        </div>
      </section>

      <section className="section container home-featured">
        <div className="section-heading">
          <h2>直近の大会</h2>
          <Link href="/tournaments" className="section-link">
            すべて見る →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid3">
            {featured.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
              />
            ))}
          </div>
        ) : (
          <div className="card empty-card">
            <strong>大会情報がありません</strong>
            <Link
              href="/tournaments"
              className="outline-button"
            >
              大会一覧を見る
            </Link>
          </div>
        )}
      </section>

      <section className="container home-stats" aria-label="サイト情報">
        <div className="stats">
          <Link
            href="/tournaments?deadline=all"
            className="stat stat-link"
            aria-label="開催予定の大会を見る"
          >
            <strong>{tournamentCount}</strong>
            <span>開催予定</span>
          </Link>

          <Link
            href="/areas"
            className="stat stat-link"
            aria-label="掲載エリアを見る"
          >
            <strong>{cities.length}</strong>
            <span>エリア</span>
          </Link>

          <Link
            href="/organizers"
            className="stat stat-link"
            aria-label="掲載主催者を見る"
          >
            <strong>{organizerCount}</strong>
            <span>主催者</span>
          </Link>
        </div>
      </section>
    </>
  );
}
