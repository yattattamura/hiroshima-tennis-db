import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type OrganizerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrganizerPage({
  params,
}: OrganizerPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: organizer, error: organizerError } = await supabase
    .from("organizers")
    .select("*")
    .eq("id", id)
    .single();

  if (organizerError || !organizer) {
    notFound();
  }

  const { data: tournaments, error: tournamentsError } = await supabase
    .from("tournaments")
    .select("*")
    .eq("organizer_id", id)
    .order("start_date", {
      ascending: true,
      nullsFirst: false,
    })
    .order("id", {
      ascending: true,
    });

  if (tournamentsError) {
    return (
      <div className="detail-page">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">ホーム</Link>
            {" → "}
            <span>主催者</span>
          </div>

          <div
            className="card"
            style={{
              padding: 30,
              marginTop: 20,
            }}
          >
            <h1>大会情報の取得に失敗しました</h1>

            <p className="muted">
              主催者の大会情報を取得できませんでした。
            </p>

            <p className="muted">
              {tournamentsError.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTournaments = (tournaments ?? []).filter((tournament) => {
    if (!tournament.start_date) {
      return false;
    }

    const startDate = new Date(`${tournament.start_date}T00:00:00`);
    return startDate >= today;
  });

  const pastTournaments = (tournaments ?? []).filter((tournament) => {
    if (!tournament.start_date) {
      return true;
    }

    const startDate = new Date(`${tournament.start_date}T00:00:00`);
    return startDate < today;
  });

  return (
    <div className="detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          {" → "}
          <Link href="/tournaments">大会を探す</Link>
          {" → "}
          <span>主催者</span>
        </div>

        <section
          className="card"
          style={{
            padding: 28,
            marginTop: 20,
          }}
        >
          <div className="badges">
            <span className="badge">
              主催者
            </span>
          </div>

          <h1
            style={{
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            {organizer.name}
          </h1>

          <p
            className="muted"
            style={{
              margin: 0,
            }}
          >
            登録大会 {tournaments?.length ?? 0}件
          </p>

          {organizer.website_url ? (
            <div style={{ marginTop: 18 }}>
              <a
                href={organizer.website_url}
                target="_blank"
                rel="noreferrer"
                className="outline-button"
              >
                公式サイトを見る ↗
              </a>
            </div>
          ) : null}

          {organizer.notes ? (
            <p
              style={{
                marginTop: 18,
                marginBottom: 0,
                lineHeight: 1.8,
              }}
            >
              {organizer.notes}
            </p>
          ) : null}
        </section>

        <section
          style={{
            marginTop: 26,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                }}
              >
                今後の大会
              </h2>

              <p
                className="muted"
                style={{
                  marginTop: 6,
                }}
              >
                {upcomingTournaments.length}件
              </p>
            </div>
          </div>

          {upcomingTournaments.length > 0 ? (
            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              {upcomingTournaments.map((tournament) => (
                <Link
                  key={tournament.id}
                  href={`/tournaments/${tournament.id}`}
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
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 14,
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
                          fontSize: 17,
                          lineHeight: 1.5,
                        }}
                      >
                        {tournament.name}
                      </strong>

                      <div
                        className="muted"
                        style={{
                          marginTop: 8,
                          lineHeight: 1.7,
                        }}
                      >
                        {tournament.date_text ?? "開催日未設定"}
                        {tournament.venue_name_raw
                          ? ` ・ ${tournament.venue_name_raw}`
                          : ""}
                      </div>

                      <div
                        className="muted"
                        style={{
                          marginTop: 4,
                          lineHeight: 1.7,
                        }}
                      >
                        {tournament.event_type ?? "種目未設定"}
                        {tournament.level
                          ? ` ・ ${tournament.level}`
                          : ""}
                      </div>
                    </div>

                    <span
                      className="badge green"
                      style={{
                        flexShrink: 0,
                      }}
                    >
                      {tournament.status ?? "状況未設定"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="card"
              style={{
                padding: 24,
              }}
            >
              <p
                className="muted"
                style={{
                  margin: 0,
                }}
              >
                現在、今後開催される大会は登録されていません。
              </p>
            </div>
          )}
        </section>

        <section
          style={{
            marginTop: 30,
            marginBottom: 40,
          }}
        >
          <h2
            style={{
              marginBottom: 14,
            }}
          >
            過去の大会
          </h2>

          <p
            className="muted"
            style={{
              marginTop: -4,
              marginBottom: 14,
            }}
          >
            {pastTournaments.length}件
          </p>

          {pastTournaments.length > 0 ? (
            <div
              style={{
                display: "grid",
                gap: 10,
              }}
            >
              {pastTournaments.map((tournament) => (
                <Link
                  key={tournament.id}
                  href={`/tournaments/${tournament.id}`}
                  className="card"
                  style={{
                    display: "block",
                    padding: 16,
                    textDecoration: "none",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      lineHeight: 1.5,
                    }}
                  >
                    {tournament.name}
                  </strong>

                  <div
                    className="muted"
                    style={{
                      marginTop: 6,
                    }}
                  >
                    {tournament.date_text ?? "開催日未設定"}
                    {tournament.venue_name_raw
                      ? ` ・ ${tournament.venue_name_raw}`
                      : ""}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted">
              過去の大会はありません。
            </p>
          )}
        </section>
      </div>
    </div>
  );
}