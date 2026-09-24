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

export default async function TournamentsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("start_date", { ascending: true });

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
              登録大会 {tournaments.length} 件
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
                大会データがありません。
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}