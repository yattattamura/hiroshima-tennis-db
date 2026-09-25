import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { TournamentCard } from "@/components/TournamentCard";
import { SearchForm } from "@/components/SearchForm";

type Tournament = {
  id: string;
  name: string;
  organizer_name_raw: string | null;
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

function convertTournament(
  row: Tournament
) {
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
    applicationMethod:
      row.application_method ?? "",
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
      .select("*")
      .gte("start_date", today)
      .order("start_date", {
        ascending: true,
        nullsFirst: false,
      })
      .limit(3),

    supabase
      .from("tournaments")
      .select("city")
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
      "データの取得に失敗しました。";

    return (
      <div className="detail-page">
        <div className="container">
          <div
            className="card"
            style={{
              padding: 30,
              marginTop: 40,
            }}
          >
            <h1>広島テニスDB</h1>

            <p>
              大会データの取得に失敗しました。
            </p>

            <p className="muted">
              {errorMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const featured = (
    featuredResult.data ?? []
  ).map(convertTournament);

  const cities = Array.from(
    new Set(
      (citiesResult.data ?? [])
        .map((row) => row.city)
        .filter(
          (city): city is string =>
            typeof city === "string" &&
            city.trim().length > 0
        )
    )
  ).sort((a, b) =>
    a.localeCompare(b, "ja")
  );

  const tournamentCount =
    tournamentCountResult.count ?? 0;

  const organizerCount =
    organizerCountResult.count ?? 0;

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>
            広島のテニス大会を、
            <br />
            もっと手軽に、もっと近くに。
          </h1>

          <p>
            広島県内のテニス大会情報を横断検索できる、
            広島テニスDBです。
          </p>

          <SearchForm cities={cities} />
        </div>
      </section>

      <div className="container">
        <div className="stats">
          <div className="stat">
            <strong>
              {tournamentCount}
            </strong>
            今後の大会
          </div>

          <div className="stat">
            <strong>
              {cities.length}
            </strong>
            対応エリア
          </div>

          <div className="stat">
            <strong>
              {organizerCount}
            </strong>
            主催者・団体
          </div>

          <div className="stat">
            <strong>
              公式確認
            </strong>
            情報源を明記
          </div>
        </div>
      </div>

      <section className="section container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <h2>今後の大会</h2>

          <Link
            href="/tournaments"
            className="muted"
          >
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
          <div
            className="card"
            style={{
              padding: 30,
              marginTop: 20,
            }}
          >
            <h3>
              現在、今後の大会が登録されていません
            </h3>

            <p className="muted">
              大会情報は順次追加していきます。
            </p>

            <div
              style={{
                marginTop: 18,
              }}
            >
              <Link
                href="/tournaments"
                className="outline-button"
              >
                大会一覧を見る
              </Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}