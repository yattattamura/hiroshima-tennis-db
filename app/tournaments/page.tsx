import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { TournamentCard } from "@/components/TournamentCard";
import { Tournament } from "@/types/tournament";

export const dynamic = "force-dynamic";

type SearchParams = {
  period?: string;
  city?: string;
  eventType?: string;
  gender?: string;
  level?: string;
  eligibility?: string;
  keyword?: string;
  deadline?: string;
  status?: string;
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

function addDays(
  dateText: string,
  days: number
): string {
  const [year, month, day] = dateText
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  date.setUTCDate(
    date.getUTCDate() + days
  );

  return date
    .toISOString()
    .split("T")[0];
}

function addMonths(
  dateText: string,
  months: number
): string {
  const [year, month, day] = dateText
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  date.setUTCMonth(
    date.getUTCMonth() + months
  );

  return date
    .toISOString()
    .split("T")[0];
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

function getPeriodLabel(
  period: string
): string {
  switch (period) {
    case "month":
      return "今月";

    case "3months":
      return "3か月以内";

    case "6months":
      return "6か月以内";

    default:
      return "すべて";
  }
}

function getDeadlineLabel(
  deadline: string
): string {
  switch (deadline) {
    case "open":
      return "まだ申込可能";

    case "7days":
      return "7日以内に締切";

    case "30days":
      return "30日以内に締切";

    case "noDeadline":
      return "締切情報なし";

    default:
      return "";
  }
}

function getStatusLabel(
  status: string
): string {
  return status || "指定なし";
}

function sanitizeKeyword(
  value: string
): string {
  return value
    .replace(/[%_]/g, "")
    .replace(/[\\(),]/g, " ")
    .trim();
}

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const period = params.period ?? "all";
  const city = params.city?.trim() ?? "";
  const eventType =
    params.eventType?.trim() ?? "";
  const gender =
    params.gender?.trim() ?? "";
  const level =
    params.level?.trim() ?? "";
  const eligibility =
    params.eligibility?.trim() ?? "";
  const keyword = sanitizeKeyword(
    params.keyword ?? ""
  );
  const deadline =
    params.deadline?.trim() ?? "";
  const status =
    params.status?.trim() ?? "";

  const supabase = await createClient();

  const today = getJapanToday();

  let query = supabase
    .from("tournaments")
    .select("*")
    .order("start_date", {
      ascending: true,
      nullsFirst: false,
    })
    .order("id", {
      ascending: true,
    });

  // ----------------------------------------
  // キーワード
  // ----------------------------------------

  if (keyword) {
    query = query.or(
      [
        `name.ilike.%${keyword}%`,
        `organizer_name_raw.ilike.%${keyword}%`,
        `venue_name_raw.ilike.%${keyword}%`,
        `city.ilike.%${keyword}%`,
        `search_tokens.ilike.%${keyword}%`,
        `notes.ilike.%${keyword}%`,
      ].join(",")
    );
  }

  // ----------------------------------------
  // 市町村
  // ----------------------------------------

  if (city) {
    query = query.eq("city", city);
  }

  // ----------------------------------------
  // 種目
  // ----------------------------------------

  if (eventType) {
    query = query.ilike(
      "event_type",
      `%${eventType}%`
    );
  }

  // ----------------------------------------
  // 性別
  // ----------------------------------------

  if (gender) {
    query = query.ilike(
      "gender",
      `%${gender}%`
    );
  }

  // ----------------------------------------
  // レベル
  // ----------------------------------------

  if (level) {
    if (level === "CD") {
      query = query.or(
        "level.eq.CD,level.eq.C/D"
      );
    } else if (level === "AB") {
      query = query.or(
        "level.eq.AB,level.eq.A/B"
      );
    } else {
      query = query.eq(
        "level",
        level
      );
    }
  }

  // ----------------------------------------
  // 参加資格
  // ----------------------------------------

  if (eligibility === "external") {
    query = query.eq(
      "external_allowed",
      "可"
    );
  }

  if (eligibility === "otherCity") {
    query = query.eq(
      "other_city_allowed",
      "可"
    );
  }

  if (eligibility === "visitor") {
    query = query.eq(
      "eligibility_category",
      "ビジター参加可"
    );
  }

  // ----------------------------------------
  // 大会ステータス
  // ----------------------------------------

  if (status) {
    query = query.eq(
      "status",
      status
    );
  }

  // ----------------------------------------
  // 開催時期
  // ----------------------------------------

  if (period === "month") {
    const nextMonth = addMonths(
      today,
      1
    );

    query = query
      .gte("start_date", today)
      .lt(
        "start_date",
        nextMonth
      );
  }

  if (period === "3months") {
    const afterThreeMonths =
      addMonths(today, 3);

    query = query
      .gte("start_date", today)
      .lt(
        "start_date",
        afterThreeMonths
      );
  }

  if (period === "6months") {
    const afterSixMonths =
      addMonths(today, 6);

    query = query
      .gte("start_date", today)
      .lt(
        "start_date",
        afterSixMonths
      );
  }

  // ----------------------------------------
  // 申込締切
  // ----------------------------------------

  if (deadline === "open") {
    query = query.gte(
      "deadline_date",
      today
    );
  }

  if (deadline === "7days") {
    const sevenDaysLater =
      addDays(today, 7);

    query = query
      .gte(
        "deadline_date",
        today
      )
      .lte(
        "deadline_date",
        sevenDaysLater
      );
  }

  if (deadline === "30days") {
    const thirtyDaysLater =
      addDays(today, 30);

    query = query
      .gte(
        "deadline_date",
        today
      )
      .lte(
        "deadline_date",
        thirtyDaysLater
      );
  }

  if (deadline === "noDeadline") {
    query = query.is(
      "deadline_date",
      null
    );
  }

  // ----------------------------------------
  // Supabase実行
  // ----------------------------------------

  const {
    data,
    error,
  } = await query;

  // ----------------------------------------
  // エラー
  // ----------------------------------------

  if (error) {
    return (
      <div className="search-page">
        <div className="container">
          <div
            className="card"
            style={{
              padding: 30,
              marginTop: 20,
            }}
          >
            <h1>
              大会データの取得に失敗しました
            </h1>

            <p className="muted">
              Supabaseから大会情報を取得できませんでした。
            </p>

            <p className="muted">
              {error.message}
            </p>

            <div
              style={{
                marginTop: 20,
              }}
            >
              <Link
                href="/"
                className="outline-button"
              >
                トップへ戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tournaments: Tournament[] =
    (data ?? []).map(
      convertTournament
    );

  // ----------------------------------------
  // 検索条件表示
  // ----------------------------------------

  const activeConditions: string[] = [];

  if (keyword) {
    activeConditions.push(
      `キーワード: ${keyword}`
    );
  }

  if (period !== "all") {
    activeConditions.push(
      `開催時期: ${getPeriodLabel(
        period
      )}`
    );
  }

  if (city) {
    activeConditions.push(
      `市町村: ${city}`
    );
  }

  if (eventType) {
    activeConditions.push(
      `種目: ${eventType}`
    );
  }

  if (gender) {
    activeConditions.push(
      `性別: ${gender}`
    );
  }

  if (level) {
    activeConditions.push(
      `レベル: ${level}`
    );
  }

  if (eligibility === "external") {
    activeConditions.push(
      "参加資格: 非会員でも参加OK"
    );
  }

  if (eligibility === "otherCity") {
    activeConditions.push(
      "参加資格: 他市協会員OK"
    );
  }

  if (eligibility === "visitor") {
    activeConditions.push(
      "参加資格: ビジターOK"
    );
  }

  if (deadline) {
    activeConditions.push(
      `申込締切: ${getDeadlineLabel(
        deadline
      )}`
    );
  }

  if (status) {
    activeConditions.push(
      `ステータス: ${getStatusLabel(
        status
      )}`
    );
  }

  const hasFilters =
    activeConditions.length > 0;

  // ----------------------------------------
  // 表示
  // ----------------------------------------

  return (
    <div className="search-page">
      <div className="container">

        {/* パンくず */}
        <div className="breadcrumb">
          <Link href="/">
            ホーム
          </Link>

          {" → "}

          <span>
            大会を探す
          </span>
        </div>

        <div
          className="results-layout"
          style={{
            marginTop: 20,
          }}
        >

          {/* -------------------------------- */}
          {/* 左側 */}
          {/* -------------------------------- */}

          <aside className="filters">

            <div
              className="card"
              style={{
                padding: 24,
              }}
            >
              <strong>
                大会を探す
              </strong>

              <p
                className="muted"
                style={{
                  marginTop: 10,
                }}
              >
                {tournaments.length}
                件の大会が見つかりました
              </p>

              <Link
                href="/"
                className="outline-button"
              >
                トップへ戻る
              </Link>
            </div>

            <div
              className="card"
              style={{
                padding: 24,
                marginTop: 16,
              }}
            >
              <strong>
                検索条件
              </strong>

              {hasFilters ? (
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    marginTop: 14,
                  }}
                >
                  {activeConditions.map(
                    (condition) => (
                      <div
                        key={condition}
                        className="muted"
                      >
                        {condition}
                      </div>
                    )
                  )}

                  <div
                    style={{
                      marginTop: 8,
                    }}
                  >
                    <Link
                      href="/tournaments"
                      className="outline-button"
                    >
                      条件をクリア
                    </Link>
                  </div>
                </div>
              ) : (
                <p
                  className="muted"
                  style={{
                    marginTop: 14,
                  }}
                >
                  条件を指定せず、登録されている大会を表示しています。
                </p>
              )}
            </div>
          </aside>

          {/* -------------------------------- */}
          {/* 右側 */}
          {/* -------------------------------- */}

          <section className="results">

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                  }}
                >
                  大会検索結果
                </h1>

                <p
                  className="muted"
                  style={{
                    marginTop: 6,
                  }}
                >
                  {tournaments.length}件
                </p>
              </div>

              <Link
                href="/"
                className="outline-button"
              >
                検索条件を変更
              </Link>
            </div>

            {/* 大会一覧 */}

            {tournaments.map(
              (tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                />
              )
            )}

            {/* 0件 */}

            {tournaments.length === 0 && (
              <div
                className="card"
                style={{
                  padding: 30,
                }}
              >
                <h3>
                  条件に一致する大会がありません
                </h3>

                <p className="muted">
                  検索条件を変更して、もう一度お試しください。
                </p>

                <div
                  style={{
                    marginTop: 18,
                  }}
                >
                  <Link
                    href="/"
                    className="outline-button"
                  >
                    検索条件を変更
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}