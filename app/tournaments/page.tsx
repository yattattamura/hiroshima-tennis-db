import { Suspense } from "react";
import { tournaments, getCities } from "@/lib/tournaments";
import { SearchForm } from "@/components/SearchForm";
import { TournamentCard } from "@/components/TournamentCard";

function Results({ searchParams }: { searchParams: Record<string,string|undefined> }) {
  const filtered = tournaments.filter((t) => {
    const city = searchParams.city;
    const eventType = searchParams.eventType;
    const gender = searchParams.gender;
    const level = searchParams.level;
    const eligibility = searchParams.eligibility;
    if (city && t.city !== city) return false;
    if (eventType && t.eventType !== eventType) return false;
    if (gender && !t.gender.includes(gender)) return false;
    if (level && !t.level.includes(level)) return false;
    if (eligibility === "external" && t.externalAllowed !== "可") return false;
    if (eligibility === "otherCity" && t.otherCityAllowed !== "可") return false;
    if (eligibility === "visitor" && t.eligibilityCategory !== "ビジター参加可") return false;
    return true;
  });

  return (
    <div className="results-layout">
      <aside className="filters">
        <strong>現在の検索条件</strong>
        <p className="muted">該当大会 {filtered.length} 件</p>
        <Link href="/tournaments" className="outline-button">条件をリセット</Link>
      </aside>
      <section className="results">
        {filtered.map((t) => <TournamentCard key={t.id} tournament={t} />)}
        {filtered.length === 0 && <div className="card" style={{padding:30}}>条件に一致する大会がありません。</div>}
      </section>
    </div>
  );
}

export default async function TournamentsPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  return (
    <div className="search-page">
      <div className="container">
        <Suspense>
          <SearchForm cities={getCities()} />
        </Suspense>
        <Results searchParams={params} />
      </div>
    </div>
  );
}
