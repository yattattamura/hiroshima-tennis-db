import Link from "next/link";
import { Tournament } from "@/types/tournament";

function getShortDate(dateText: string) {
  const match = dateText.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);

  if (!match) {
    return { monthDay: dateText, weekday: "" };
  }

  const [, year, month, day] = match;
  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day))
  );
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  return {
    monthDay: `${Number(month)}/${Number(day)}`,
    weekday: weekdays[date.getUTCDay()],
  };
}

export function TournamentCard({
  tournament,
}: {
  tournament: Tournament;
}) {
  const shortDate = getShortDate(tournament.date);

  const hasDeadline =
    tournament.status === "募集中" &&
    tournament.deadline.trim().length > 0;

  const eligibilityTags = [
    tournament.externalAllowed === "可" ? "非会員OK" : "",
    tournament.otherCityAllowed === "可" ? "他市OK" : "",
    tournament.eligibilityCategory === "ビジター参加可"
      ? "ビジターOK"
      : "",
  ].filter(Boolean);

  return (
    <article className="card tournament-card tournament-card-v6">
      <div className="date-box date-box-v6" aria-label={`開催日 ${tournament.date}`}>
        <strong>{shortDate.monthDay}</strong>
        {shortDate.weekday && <span>{shortDate.weekday}</span>}
      </div>

      <div className="card-main tournament-card-main-v6">
        <div className="badges tournament-badges-v6">
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

        <p className="muted tournament-location-v6">
          📍 {tournament.city || "エリア未設定"}
          {tournament.venue ? `・${tournament.venue}` : ""}
        </p>

        <p
          className="muted"
          style={{
            margin: "5px 0 0",
          }}
        >
          主催：{tournament.organizer || "未設定"}
        </p>

        <div className="mini-tags tournament-mini-tags-v6">
          {eligibilityTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
          {hasDeadline && <span>締切 {tournament.deadline}</span>}
        </div>
      </div>

      <Link
        className="outline-button tournament-detail-link-v6"
        href={`/tournaments/${tournament.id}`}
        aria-label={`${tournament.name}の詳細を見る`}
      >
        詳細 →
      </Link>
    </article>
  );
}
