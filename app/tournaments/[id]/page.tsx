import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function TournamentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !tournament) {
    notFound();
  }

  const rows: Array<[string, string]> = [
    ["主催者", tournament.organizer_name_raw ?? "未設定"],
    ["開催日", tournament.date_text ?? "未設定"],
    [
      "会場",
      `${tournament.city ?? ""}${
        tournament.venue_name_raw
          ? `・${tournament.venue_name_raw}`
          : ""
      }` || "未設定",
    ],
    ["種目", tournament.event_type ?? "未設定"],
    ["クラス", tournament.level ?? "未設定"],
    ["参加資格", tournament.eligibility ?? "未設定"],
    ["参加費", tournament.fee_text ?? "要項をご確認ください"],
    ["申込締切", tournament.deadline_text ?? "要項をご確認ください"],
    [
      "申込方法",
      tournament.application_method ?? "公式サイトをご確認ください",
    ],
    ["情報源", tournament.official_url ?? "未設定"],
    [
      "最終確認日",
      tournament.last_checked_at
        ? new Date(tournament.last_checked_at).toLocaleDateString("ja-JP")
        : "未設定",
    ],
  ];

  return (
    <div className="detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          {" → "}
          <Link href="/tournaments">大会を探す</Link>
          {" → "}
          <span>大会詳細</span>
        </div>

        <div className="detail-grid">
          <article className="card detail-main">
            <div className="badges">
              <span className="badge green">
                {tournament.status ?? "状況未設定"}
              </span>

              <span className="badge">
                {tournament.level ?? "クラス記載なし"}
              </span>
            </div>

            <h1>{tournament.name}</h1>

            <div className="info-table">
              {rows.map(([label, value]) => (
                <div key={label} style={{ display: "contents" }}>
                  <div>{label}</div>
                  <div>
                    <span>{value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="notice">
              <strong>参加資格を検索しやすく整理</strong>

              <p>
                {tournament.external_allowed === "可"
                  ? "非会員でも参加可能です。"
                  : "会員要件は公式情報をご確認ください."}

                {tournament.other_city_allowed === "可"
                  ? " 他市協会員も参加可能です。"
                  : ""}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 22,
              }}
            >
              {tournament.official_url ? (
                <a
                  className="primary"
                  href={tournament.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  公式情報を見る
                </a>
              ) : (
                <span className="muted">公式情報は未登録です</span>
              )}

              <Link
                className="outline-button"
                href={`/tournaments/${id}/suggest`}
              >
                この大会を修正
              </Link>
            </div>
          </article>

          <aside className="card detail-side">
            <h3>情報の信頼性</h3>

            <p>✓ 公式情報をもとに登録</p>
            <p>✓ 最終確認日を記録</p>
            <p>✓ 修正履歴を管理予定</p>

            <hr />

            <h3>関連する大会</h3>

            <p className="muted">
              今後ここに同じ主催者・同じエリアの大会を表示します。
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}