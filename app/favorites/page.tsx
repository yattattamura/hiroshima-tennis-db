import Link from "next/link";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { TournamentCard } from "@/components/TournamentCard";
import { Tournament } from "@/types/tournament";

const COOKIE_NAME = "htdb_favorites";

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

  return `${year}-${month}-${day}`;
}

function readFavoriteIds(cookieValue: string | undefined): string[] {
  if (!cookieValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(cookieValue));

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((id): id is string => typeof id === "string")
      .slice(0, 100);
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
    deadlineDate: row.deadline_date ?? "",
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

function getDeadlineInfo(deadlineDate: string | null, today: string) {
  if (!deadlineDate) {
    return {
      label: "締切情報なし",
      tone: "muted",
      rank: 2,
      days: null as number | null,
    };
  }

  const [year, month, day] = today.split("-").map(Number);
  const [deadlineYear, deadlineMonth, deadlineDay] = deadlineDate
    .split("-")
    .map(Number);

  const todayUtc = Date.UTC(year, month - 1, day);
  const deadlineUtc = Date.UTC(
    deadlineYear,
    deadlineMonth - 1,
    deadlineDay
  );
  const days = Math.round((deadlineUtc - todayUtc) / 86400000);

  if (days < 0) {
    return {
      label: "締切済み",
      tone: "muted",
      rank: 3,
      days,
    };
  }

  if (days === 0) {
    return {
      label: "今日締切",
      tone: "urgent",
      rank: 0,
      days,
    };
  }

  if (days === 1) {
    return {
      label: "明日締切",
      tone: "urgent",
      rank: 0,
      days,
    };
  }

  if (days <= 7) {
    return {
      label: `あと${days}日`,
      tone: "warning",
      rank: 0,
      days,
    };
  }

  return {
    label: `あと${days}日`,
    tone: "normal",
    rank: 1,
    days,
  };
}

function formatDeadlineText(deadlineDate: string | null): string {
  if (!deadlineDate) {
    return "";
  }

  const [, month, day] = deadlineDate.split("-");
  return `${Number(month)}/${Number(day)}締切`;
}

export default async function FavoritesPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const favoriteIds = readFavoriteIds(cookieStore.get(COOKIE_NAME)?.value);
  const today = getJapanToday();

  let favoriteRows: any[] = [];

  if (favoriteIds.length > 0) {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .in("id", favoriteIds);

    if (!error && data) {
      favoriteRows = [...data];
    }
  }

  favoriteRows.sort((a, b) => {
    const aDeadline = getDeadlineInfo(a.deadline_date ?? null, today);
    const bDeadline = getDeadlineInfo(b.deadline_date ?? null, today);

    if (aDeadline.rank !== bDeadline.rank) {
      return aDeadline.rank - bDeadline.rank;
    }

    if (
      aDeadline.days !== null &&
      bDeadline.days !== null &&
      aDeadline.days !== bDeadline.days
    ) {
      return aDeadline.days - bDeadline.days;
    }

    const aStart = a.start_date ?? "9999-12-31";
    const bStart = b.start_date ?? "9999-12-31";
    return aStart.localeCompare(bStart);
  });

  const tournaments = favoriteRows.map(convertTournament);
  const urgentCount = favoriteRows.filter((row) => {
    const info = getDeadlineInfo(row.deadline_date ?? null, today);
    return info.rank === 0;
  }).length;

  return (
    <main className="search-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          <span aria-hidden="true">›</span>
          <span>お気に入り</span>
        </div>

        <div
          className="section-heading"
          style={{ marginBottom: 16, alignItems: "center" }}
        >
          <div>
            <h1 style={{ margin: 0 }}>お気に入り</h1>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 6,
              }}
            >
              <span className="muted">{tournaments.length}件</span>
              {urgentCount > 0 ? (
                <span className="badge">
                  締切間近 {urgentCount}件
                </span>
              ) : null}
            </div>
          </div>

          <Link href="/tournaments" className="outline-button">
            大会を探す
          </Link>
        </div>

        {favoriteRows.length > 0 ? (
          <div style={{ display: "grid", gap: 12 }}>
            {favoriteRows.map((row) => {
              const tournament = convertTournament(row);

              return (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                />
              );
            })}
          </div>
        ) : (
          <div className="card" style={{ padding: 22, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>☆</div>
            <h2 style={{ margin: 0, fontSize: 18 }}>
              お気に入りはまだありません
            </h2>
            <p className="muted" style={{ margin: "8px 0 16px" }}>
              大会詳細で気になる大会を保存できます。
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
