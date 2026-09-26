import Link from "next/link";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { TournamentCard } from "@/components/TournamentCard";
import { Tournament } from "@/types/tournament";

const COOKIE_NAME = "htdb_favorites";

function readFavoriteIds(cookieValue: string | undefined): string[] {
  if (!cookieValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(cookieValue));

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((id): id is string => typeof id === "string").slice(0, 100);
  } catch {
    return [];
  }
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

export default async function FavoritesPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const favoriteIds = readFavoriteIds(cookieStore.get(COOKIE_NAME)?.value);

  let tournaments: Tournament[] = [];

  if (favoriteIds.length > 0) {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .in("id", favoriteIds);

    if (!error && data) {
      const mapped = data.map(convertTournament);
      const order = new Map(favoriteIds.map((id, index) => [id, index]));

      tournaments = mapped.sort(
        (a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999)
      );
    }
  }

  return (
    <main className="search-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          <span aria-hidden="true">›</span>
          <span>お気に入り</span>
        </div>

        <div className="section-heading" style={{ marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: 0 }}>お気に入り</h1>
            <p className="muted" style={{ margin: "5px 0 0" }}>
              {tournaments.length}件
            </p>
          </div>
          <Link href="/tournaments" className="outline-button">
            大会を探す
          </Link>
        </div>

        {tournaments.length > 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: 22, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>☆</div>
            <h2 style={{ margin: 0, fontSize: 18 }}>お気に入りはまだありません</h2>
            <p className="muted" style={{ margin: "8px 0 16px" }}>
              大会詳細の「お気に入り」から保存できます。
            </p>
            <Link href="/tournaments" className="primary">
              大会を探す
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
