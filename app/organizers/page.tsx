import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "掲載主催者",
  description:
    "広島テニスポータルに掲載しているテニス大会の主催者・団体を一覧で確認できます。",
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

type Organizer = {
  id: string;
  name: string;
  website_url: string | null;
  notes: string | null;
};

type TournamentRow = {
  organizer_id: string | null;
  start_date: string | null;
};

export default async function OrganizersPage() {
  const supabase = await createClient();
  const today = getJapanToday();

  const [organizersResult, tournamentsResult] =
    await Promise.all([
      supabase
        .from("organizers")
        .select("id, name, website_url, notes")
        .order("name", { ascending: true }),
      supabase
        .from("tournaments")
        .select("organizer_id, start_date"),
    ]);

  if (organizersResult.error || tournamentsResult.error) {
    const message =
      organizersResult.error?.message ??
      tournamentsResult.error?.message ??
      "データの取得に失敗しました。";

    return (
      <div className="detail-page">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">ホーム</Link>
            {" → "}
            <span>掲載主催者</span>
          </div>

          <div
            className="card"
            style={{ padding: 24, marginTop: 20 }}
          >
            <h1>掲載主催者を取得できませんでした</h1>
            <p className="muted">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  const tournamentsByOrganizer = new Map<
    string,
    { total: number; upcoming: number }
  >();

  for (const row of (tournamentsResult.data ?? []) as TournamentRow[]) {
    if (!row.organizer_id) {
      continue;
    }

    const current =
      tournamentsByOrganizer.get(row.organizer_id) ?? {
        total: 0,
        upcoming: 0,
      };

    current.total += 1;

    if (row.start_date && row.start_date >= today) {
      current.upcoming += 1;
    }

    tournamentsByOrganizer.set(
      row.organizer_id,
      current
    );
  }

  const organizers = (organizersResult.data ?? []) as Organizer[];

  return (
    <div className="detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          {" → "}
          <span>掲載主催者</span>
        </div>

        <section
          className="card"
          style={{ padding: 28, marginTop: 20 }}
        >
          <div className="badges">
            <span className="badge">掲載主催者</span>
          </div>

          <h1 style={{ marginTop: 10 }}>
            掲載主催者
          </h1>

          <p
            style={{
              lineHeight: 1.8,
              marginBottom: 0,
            }}
          >
            {SITE_NAME}では、広島県内で一般・社会人向け大会を開催する
            テニス協会、クラブ、スクールなどの情報を掲載していきます。
            現在登録されている主催者・団体は以下のとおりです。
          </p>
        </section>

        <section style={{ marginTop: 26 }}>
          <div className="section-heading">
            <div>
              <h2>現在掲載中の主催者</h2>
              <p className="muted">
                {organizers.length}団体
              </p>
            </div>

            <Link
              href="/tournaments"
              className="outline-button"
            >
              大会を探す
            </Link>
          </div>

          {organizers.length > 0 ? (
            <div
              style={{
                display: "grid",
                gap: 12,
                marginTop: 14,
              }}
            >
              {organizers.map((organizer) => {
                const count =
                  tournamentsByOrganizer.get(
                    organizer.id
                  ) ?? {
                    total: 0,
                    upcoming: 0,
                  };

                return (
                  <Link
                    key={organizer.id}
                    href={`/organizers/${organizer.id}`}
                    className="card"
                    style={{
                      display: "block",
                      padding: 20,
                      textDecoration: "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: 16,
                      }}
                    >
                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            fontSize: 18,
                            lineHeight: 1.5,
                          }}
                        >
                          {organizer.name}
                        </strong>

                        {organizer.notes ? (
                          <p
                            className="muted"
                            style={{
                              margin:
                                "7px 0 0",
                              lineHeight: 1.7,
                            }}
                          >
                            {organizer.notes}
                          </p>
                        ) : null}

                        <div
                          className="muted"
                          style={{
                            marginTop: 8,
                            lineHeight: 1.7,
                          }}
                        >
                          今後の大会 {count.upcoming}件
                          <br />
                          掲載大会 {count.total}件
                        </div>

                        {organizer.website_url ? (
                          <div
                            className="muted"
                            style={{
                              marginTop: 5,
                              fontSize: 12,
                            }}
                          >
                            公式サイトあり
                          </div>
                        ) : null}
                      </div>

                      <span
                        className="section-link"
                        style={{
                          flexShrink: 0,
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        詳細 →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ padding: 24 }}>
              <p className="muted">
                現在、主催者が登録されていません。
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
            掲載対象について
          </h2>

          <p
            className="muted"
            style={{
              marginBottom: 0,
              lineHeight: 1.8,
            }}
          >
            広島県内の一般・社会人向けテニス大会を開催する団体・クラブ・スクール等を対象とします。
            現在掲載されていない主催者についても、確認できた大会情報を順次追加していく想定です。
          </p>
        </section>
      </div>
    </div>
  );
}
