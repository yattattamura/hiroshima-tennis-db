import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { SITE_NAME } from "@/lib/site";
import { PREFECTURES } from "@/lib/prefectures";

export const metadata: Metadata = {
  title: "掲載エリア",
  description:
    "ノウニスに掲載している中国・近畿地方のテニス大会開催エリアを都道府県別に確認できます。",
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
  prefecture: string | null;
  city: string | null;
  start_date: string | null;
};

type CitySummary = {
  city: string;
  total: number;
  upcoming: number;
};

type PrefectureSummary = {
  prefecture: string;
  total: number;
  upcoming: number;
  cities: CitySummary[];
};

const REGIONS = [
  {
    name: "中国地方",
    prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
  },
  {
    name: "近畿地方",
    prefectures: ["滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  },
];

export default async function AreasPage() {
  const supabase = await createClient();
  const today = getJapanToday();

  const { data, error } = await supabase
    .from("tournaments")
    .select("prefecture, city, start_date");

  if (error) {
    return (
      <div className="detail-page compact-info-page">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">ホーム</Link>
            {" → "}
            <span>掲載エリア</span>
          </div>
          <div className="card" style={{ padding: 24, marginTop: 20 }}>
            <h1>掲載エリアを取得できませんでした</h1>
            <p className="muted">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const prefectureMap = new Map<string, Map<string, CitySummary>>();

  for (const row of (data ?? []) as TournamentRow[]) {
    const prefecture = row.prefecture?.trim();
    const city = row.city?.trim();
    if (!prefecture) continue;

    if (!prefectureMap.has(prefecture)) prefectureMap.set(prefecture, new Map());
    if (!city) continue;

    const cityMap = prefectureMap.get(prefecture)!;
    const current = cityMap.get(city) ?? { city, total: 0, upcoming: 0 };
    current.total += 1;
    if (row.start_date && row.start_date >= today) current.upcoming += 1;
    cityMap.set(city, current);
  }

  const summaries = new Map<string, PrefectureSummary>();
  for (const [prefecture, cityMap] of prefectureMap) {
    const cities = Array.from(cityMap.values()).sort((a, b) =>
      a.city.localeCompare(b.city, "ja")
    );
    const rows = (data ?? []).filter((row) => row.prefecture?.trim() === prefecture);
    summaries.set(prefecture, {
      prefecture,
      total: rows.length,
      upcoming: rows.filter((row) => row.start_date && row.start_date >= today).length,
      cities,
    });
  }

  const listedPrefectures = Array.from(summaries.keys());
  const totalAreas = Array.from(summaries.values()).reduce(
    (sum, item) => sum + item.cities.length,
    0
  );

  return (
    <div className="detail-page compact-info-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          {" → "}
          <span>掲載エリア</span>
        </div>

        <section className="card info-intro-card" style={{ padding: 28, marginTop: 20 }}>
          <div className="badges"><span className="badge">掲載エリア</span></div>
          <h1 style={{ marginTop: 10 }}>掲載エリア</h1>
          <p style={{ lineHeight: 1.8, marginBottom: 0 }}>
            {SITE_NAME}は、中国地方・近畿地方の一般・社会人向けテニス大会を順次掲載しています。
            都道府県から大会を探せます。
          </p>
        </section>

        <section className="info-list-section" style={{ marginTop: 26 }}>
          <div className="section-heading">
            <div>
              <h2>都道府県から探す</h2>
              <p className="muted">{listedPrefectures.length}府県・{totalAreas}エリア</p>
            </div>
            <Link href="/tournaments?area=1&deadline=all" className="outline-button">
              すべての大会を探す
            </Link>
          </div>

          {REGIONS.map((region) => {
            const regionItems = region.prefectures
              .map((prefecture) => summaries.get(prefecture))
              .filter((item): item is PrefectureSummary => Boolean(item));
            if (regionItems.length === 0) return null;

            return (
              <section key={region.name} style={{ marginTop: 22 }}>
                <h3 style={{ marginBottom: 12 }}>{region.name}</h3>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 12,
                }}>
                  {regionItems.map((item) => {
                    const href = `/tournaments?prefecture=${encodeURIComponent(item.prefecture)}&area=1&deadline=all`;
                    return (
                      <div key={item.prefecture} className="card info-list-card" style={{ padding: 18 }}>
                        <Link href={href} style={{ textDecoration: "none", display: "block" }}>
                          <strong style={{ display: "block", fontSize: 19 }}>{item.prefecture}</strong>
                          <div className="muted" style={{ marginTop: 6, lineHeight: 1.7 }}>
                            今後の大会 {item.upcoming}件<br />
                            掲載大会 {item.total}件
                          </div>
                          <span className="section-link" style={{ display: "inline-block", marginTop: 8 }}>
                            この県の大会を見る →
                          </span>
                        </Link>
                        {item.cities.length > 0 && (
                          <details style={{ marginTop: 12 }}>
                            <summary style={{ cursor: "pointer", color: "var(--muted, #64748b)" }}>
                              市区町村を見る（{item.cities.length}）
                            </summary>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                              {item.cities.map((city) => (
                                <Link
                                  key={city.city}
                                  href={`/tournaments?prefecture=${encodeURIComponent(item.prefecture)}&city=${encodeURIComponent(city.city)}&area=1&deadline=all`}
                                  className="outline-button"
                                  style={{ minHeight: "auto", padding: "5px 9px", fontSize: 13 }}
                                >
                                  {city.city}（{city.total}）
                                </Link>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </section>

        <section className="card info-scope-card" style={{ padding: 24, marginTop: 28, marginBottom: 40 }}>
          <h2 style={{ marginTop: 0 }}>掲載範囲について</h2>
          <p className="muted" style={{ marginBottom: 0, lineHeight: 1.8 }}>
            掲載大会がある都道府県・市区町村をデータから自動集計しています。
            掲載地域は順次拡大していきます。大会一覧へ移動した際は、居住地や申込締切などの
            個別条件を自動適用せず、選択したエリア以外は絞り込みなしで表示します。
          </p>
        </section>
      </div>
    </div>
  );
}
