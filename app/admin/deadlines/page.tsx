import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { DeadlineMaintenance } from "@/components/DeadlineMaintenance";

export const dynamic = "force-dynamic";

export default async function DeadlineMaintenancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/deadlines");
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/account");
  }

  const [{ data: candidates }, { count: missingCount }] = await Promise.all([
    supabase
      .from("deadline_candidates")
      .select(
        "id,tournament_id,candidate_date,candidate_text,source_url,source_excerpt,confidence,status,scanned_at"
      )
      .eq("status", "pending")
      .order("confidence", { ascending: false })
      .order("scanned_at", { ascending: false })
      .limit(50),
    supabase
      .from("tournaments")
      .select("id", { count: "exact", head: true })
      .is("deadline_date", null)
      .not("official_url", "is", null),
  ]);

  const tournamentIds = (candidates ?? []).map((item) => item.tournament_id);
  const { data: tournaments } =
    tournamentIds.length > 0
      ? await supabase
          .from("tournaments")
          .select("id,name,start_date,city,venue_name_raw,official_url")
          .in("id", tournamentIds)
      : { data: [] };

  const tournamentMap = new Map(
    (tournaments ?? []).map((item) => [item.id, item])
  );

  return (
    <main className="admin deadline-admin-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/account">マイページ</Link>
          <span aria-hidden="true">›</span>
          <span>締切メンテナンス</span>
        </div>

        <div className="deadline-admin-header">
          <div>
            <span className="badge green">管理者専用</span>
            <h1>締切メンテナンス</h1>
            <p className="muted">
              公式サイトから検出した締切候補を確認して、公開データへ反映します。
            </p>
          </div>
          <DeadlineMaintenance />
        </div>

        <section className="deadline-admin-summary">
          <div className="card deadline-stat">
            <strong>{missingCount ?? 0}</strong>
            <span>公式サイト確認が必要</span>
          </div>
          <div className="card deadline-stat">
            <strong>{candidates?.length ?? 0}</strong>
            <span>確認待ち候補</span>
          </div>
        </section>

        <section className="deadline-candidate-list">
          {candidates?.length ? (
            candidates.map((candidate) => {
              const tournament = tournamentMap.get(candidate.tournament_id);
              return (
                <article className="card deadline-candidate" key={candidate.id}>
                  <div className="deadline-candidate-main">
                    <div>
                      <div className="badges">
                        <span className="badge green">
                          自動検出 {candidate.confidence}%
                        </span>
                        {candidate.candidate_date ? (
                          <span className="badge">
                            候補 {candidate.candidate_date}
                          </span>
                        ) : (
                          <span className="badge">日付を検出できず</span>
                        )}
                      </div>
                      <h2>{tournament?.name ?? candidate.tournament_id}</h2>
                      <p className="muted">
                        {tournament?.start_date ?? "開催日未設定"}
                        {" ・ "}
                        {tournament?.city ?? "エリア未設定"}
                        {tournament?.venue_name_raw
                          ? "・" + tournament.venue_name_raw
                          : ""}
                      </p>
                    </div>
                    <div className="deadline-candidate-actions">
                      {candidate.candidate_date ? (
                        <button
                          className="primary small"
                          data-deadline-action="approve"
                          data-candidate-id={candidate.id}
                        >
                          この締切を採用
                        </button>
                      ) : null}
                      <button
                        className="outline-button"
                        data-deadline-action="reject"
                        data-candidate-id={candidate.id}
                      >
                        却下
                      </button>
                    </div>
                  </div>

                  <div className="deadline-candidate-detail">
                    <div>
                      <strong>検出内容</strong>
                      <p>{candidate.source_excerpt ?? "検出テキストなし"}</p>
                    </div>
                    <div>
                      <strong>公式サイト</strong>
                      <p>
                        {tournament?.official_url ? (
                          <a
                            href={tournament.official_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-link"
                          >
                            公式サイトを開く ↗
                          </a>
                        ) : (
                          "URLなし"
                        )}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="card deadline-empty">
              <strong>確認待ちの候補はありません。</strong>
              <p className="muted">
                「自動検出を実行」を押すと、締切未設定の大会から順番に確認します。
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
