import Link from "next/link";
import { Tournament } from "@/types/tournament";

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  const shortDate = tournament.date
    .split("〜")[0]
    .replace("2026/", "")
    .replace("2027/", "");

  const hasDeadline =
    tournament.status === "募集中" &&
    tournament.deadline.trim().length > 0;

  return (
    <article className="card tournament-card">
      <div className="date-box" aria-label={`開催日 ${tournament.date}`}>
        <strong>{shortDate}</strong>
      </div>

      <div className="card-main">
        <div className="badges">
          {tournament.status && (
            <span className="badge green">{tournament.status}</span>
          )}
          {tournament.level && (
            <span className="badge">{tournament.level}</span>
          )}
          {tournament.eventType && (
            <span className="badge">{tournament.eventType}</span>
          )}
        </div>

        <h3>{tournament.name}</h3>

        <p className="muted">
          📍 {tournament.city}
          {tournament.venue ? `・${tournament.venue}` : ""}
        </p>

        <div className="mini-tags">
          {tournament.externalAllowed === "可" && (
            <span>非会員OK</span>
          )}
          {tournament.otherCityAllowed === "可" && (
            <span>他市協会員OK</span>
          )}
          {tournament.eligibilityCategory === "ビジター参加可" && (
            <span>ビジターOK</span>
          )}
          {hasDeadline && <span>締切 {tournament.deadline}</span>}
        </div>
      </div>

      <Link
        className="outline-button"
        href={`/tournaments/${tournament.id}`}
        style={{
          width: "auto",
          minHeight: "auto",
          padding: "7px 10px",
          gridColumn: "auto",
        }}
      >
        詳細 →
      </Link>
    </article>
  );
}
