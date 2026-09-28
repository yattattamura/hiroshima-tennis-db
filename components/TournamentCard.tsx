import Link from "next/link";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Tournament } from "@/types/tournament";

function getShortDate(dateText: string, startDate?: string) {
  const startDateMatch = startDate?.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})/
  );
  const textFullMatch = dateText.match(
    /(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/
  );
  const japaneseMatch = dateText.match(
    /(\d{4})年(\d{1,2})月(\d{1,2})日/
  );

  const fullMatch = startDateMatch ?? textFullMatch ?? japaneseMatch;

  let year: number;
  let month: number;
  let day: number;

  if (fullMatch) {
    year = Number(fullMatch[1]);
    month = Number(fullMatch[2]);
    day = Number(fullMatch[3]);
  } else {
    const monthDayMatch = dateText.match(
      /(\d{1,2})[\/-月](\d{1,2})/
    );

    if (!monthDayMatch) {
      return { monthDay: dateText, weekday: "" };
    }

    month = Number(monthDayMatch[1]);
    day = Number(monthDayMatch[2]);

    const inferredYear = startDate?.match(/^(\d{4})/)?.[1];
    year = Number(
      inferredYear ??
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Tokyo",
          year: "numeric",
        }).format(new Date())
    );
  }

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  return {
    monthDay: month + "/" + day,
    weekday: weekdays[date.getUTCDay()],
  };
}

function getJapanToday(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return year + "-" + month + "-" + day;
}

function getDeadlineLabel(deadlineDate?: string): {
  label: string;
  tone: "normal" | "urgent" | "warning" | "muted";
} {
  if (!deadlineDate) {
    return { label: "", tone: "muted" };
  }

  const todayParts = getJapanToday().split("-").map(Number);
  const deadlineParts = deadlineDate.split("-").map(Number);

  if (
    todayParts.length !== 3 ||
    deadlineParts.length !== 3 ||
    todayParts.some(Number.isNaN) ||
    deadlineParts.some(Number.isNaN)
  ) {
    return { label: "", tone: "muted" };
  }

  const todayUtc = Date.UTC(
    todayParts[0],
    todayParts[1] - 1,
    todayParts[2]
  );
  const deadlineUtc = Date.UTC(
    deadlineParts[0],
    deadlineParts[1] - 1,
    deadlineParts[2]
  );
  const days = Math.round(
    (deadlineUtc - todayUtc) / 86400000
  );

  if (days < 0) {
    return { label: "締切済み", tone: "muted" };
  }
  if (days === 0) {
    return { label: "今日締切", tone: "urgent" };
  }
  if (days === 1) {
    return { label: "明日締切", tone: "urgent" };
  }
  if (days <= 7) {
    return { label: "あと" + days + "日", tone: "warning" };
  }
  return { label: "あと" + days + "日", tone: "normal" };
}

export function TournamentCard({
  tournament,
}: {
  tournament: Tournament;
}) {
  const shortDate = getShortDate(tournament.date, tournament.startDate);
  const weekday = tournament.weekday || shortDate.weekday;
  const deadlineInfo = getDeadlineLabel(tournament.deadlineDate);

  const fallbackDeadline =
    !deadlineInfo.label &&
    tournament.status === "募集中" &&
    tournament.deadline.trim().length > 0
      ? "締切 " + tournament.deadline
      : "";

  const eligibilityTags = [
    tournament.externalAllowed === "可" ? "非会員OK" : "",
    tournament.otherCityAllowed === "可" ? "他市OK" : "",
    tournament.eligibilityCategory === "ビジター参加可"
      ? "ビジターOK"
      : "",
  ].filter(Boolean);

  return (
    <article className="card tournament-card tournament-card-v6">
      <Link
        className="tournament-card-content-link"
        href={"/tournaments/" + tournament.id}
        aria-label={tournament.name + "の詳細を見る"}
      >
        <div
          className="date-box date-box-v6"
          aria-label={"開催日 " + tournament.date}
        >
          <strong>{shortDate.monthDay}</strong>
          {weekday && (
            <span className="date-weekday" aria-label={"曜日 " + weekday}>
              {weekday.replace(/[()（）祝休日]/g, "")}
            </span>
          )}
        </div>

        <div className="card-main tournament-card-main-v6">
          <div className="badges tournament-badges-v6">
            {tournament.status && (
              <span className="badge green">{tournament.status}</span>
            )}
            {tournament.level && <span className="badge">{tournament.level}</span>}
            {tournament.eventType && (
              <span className="badge">{tournament.eventType}</span>
            )}
          </div>

          <h3>{tournament.name}</h3>

          <p className="muted tournament-location-v6">
            📍 {tournament.city || "エリア未設定"}
            {tournament.venue ? "・" + tournament.venue : ""}
          </p>

          <p className="muted tournament-organizer">
            主催：{tournament.organizer || "未設定"}
          </p>

          <div className="mini-tags tournament-mini-tags-v6">
            {eligibilityTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}

            {deadlineInfo.label ? (
              <span className={"deadline-pill deadline-" + deadlineInfo.tone}>
                {deadlineInfo.label}
              </span>
            ) : fallbackDeadline ? (
              <span>{fallbackDeadline}</span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="tournament-card-actions">
        <FavoriteButton tournamentId={tournament.id} compact />
        <Link
          className="outline-button tournament-detail-link-v6"
          href={"/tournaments/" + tournament.id}
        >
          詳細 →
        </Link>
      </div>
    </article>
  );
}
