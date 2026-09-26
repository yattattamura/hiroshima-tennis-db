import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "掲載エリア",
  description:
    "広島テニスポータルに掲載している広島県内の大会開催エリアを一覧で確認できます。",
};

function getJapanToday(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

type TournamentRow = {
  city: string | null;
  start_date: string | null;
};

type AreaSummary = {
  city: string;
  total: number;
  upcoming: number;
};

export default async function AreasPage() {
  const supabase = await createClient();
  const today = getJapanToday();

  const { data, error } = await supabase
    .from("tournaments")
    .select("city, start_date")
    .not("city", "is", null);

  if (error) {
    return (
      <div className="detail-page">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">ホーム</Link>
            {" → "}
            <span>掲載エリア</span>
          </div>

          <div
            className="card"
            style={{ padding: 24, marginTop: 20 }}
          >
            <h1>掲載エリアを取得できませんでした</h1>
            <p className="muted">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const map = new Map<string, AreaSummary>();

  for (const row of (data ?? []) as TournamentRow[]) {
    const city = row.city?.trim();

    if (!city) {
      continue;
    }

    const current = map.get(city) ?? {
      city,
      total: 0,
      upcoming: 0,
    };

    current.total += 1;

    if (row.start_date && row.start_date >= today) {
      current.upcoming += 1;
    }

    map.set(city, current);
  }

  const areas = Array.from(map.values()).sort((a, b) =>
    a.city.localeCompare(b.city, "ja")
  );

  return (
    <div className="detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          {" → "}
          <span>掲載エリア</span>
        </div>

        <section
          className="card"
          style={{ padding: 28, marginTop: 20 }}
        >
          <div className="badges">
            <span className="badge">掲載エリア</span>
          </div>

          <h1 style={{ marginTop: 10 }}>
            掲載エリア
          </h1>

          <p
            style={{
              lineHeight: 1.8,
              marginBottom: 0,
            }}
          >
            {SITE_NAME}は、広島県内の一般・社会人向けテニス大会を対象にしています。
            現在、大会情報を掲載しているエリアは以下のとおりです。
          </p>
        </section>

        <section style={{ marginTop: 26 }}>
          <div className="section-heading">
            <div>
              <h2>現在掲載中のエリア</h2>
              <p className="muted">
                {areas.length}エリア
              </p>
            </div>

            <Link
              href="/tournaments"
              className="outline-button"
            >
              大会を探す
            </Link>
          </div>

          {areas.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                marginTop: 14,
              }}
            >
              {areas.map((area) => (
                <Link
                  key={area.city}
                  href={`/tournaments?city=${encodeURIComponent(area.city)}`}
                  className="card"
                  style={{
                    display: "block",
                    padding: 20,
                    textDecoration: "none",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      fontSize: 18,
                    }}
                  >
                    📍 {area.city}
                  </strong>

                  <div
                    className="muted"
                    style={{
                      marginTop: 8,
                      lineHeight: 1.7,
                    }}
                  >
                    今後の大会 {area.upcoming}件
                    <br />
                    掲載大会 {area.total}件
                  </div>

                  <span
                    className="section-link"
                    style={{
                      display: "inline-block",
                      marginTop: 10,
                    }}
                  >
                    このエリアの大会を見る →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: 24 }}>
              <p className="muted">
                現在、エリアが登録された大会はありません。
              </p>
            </div>
          )}
        </section>

        <section
          className="card"
          style={{
            padding: 24,
            marginTop: 28,
            marginBottom: 40,
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            掲載範囲について
          </h2>

          <p
            className="muted"
            style={{
              marginBottom: 0,
              lineHeight: 1.8,
            }}
          >
            広島県全域を対象としています。現在掲載されていない地域についても、
            今後大会情報が登録されれば一覧に追加されます。
          </p>
        </section>
      </div>
    </div>
  );
}
