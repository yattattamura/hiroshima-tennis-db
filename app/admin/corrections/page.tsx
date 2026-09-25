import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

type Status = "pending" | "approved" | "rejected";

const statusLabels: Record<Status, string> = {
  pending: "未処理",
  approved: "承認済み",
  rejected: "却下済み",
};

const fieldLabels: Record<string, string> = {
  name: "大会名",
  date_text: "開催日",
  venue_name_raw: "会場",
  event_type: "種目",
  gender: "性別",
  level: "クラス",
  eligibility: "参加資格",
  fee_text: "参加費",
  deadline_text: "申込締切",
  application_method: "申込方法",
  official_url: "公式URL",
  notes: "その他・補足",
};

export default async function CorrectionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
  }>;
}) {
  const params = await searchParams;

  const requestedStatus = params.status;

  const status: Status =
    requestedStatus === "approved" ||
    requestedStatus === "rejected"
      ? requestedStatus
      : "pending";

  const supabase = await createClient();

  // ----------------------------------------
  // 1. ログイン確認
  // ----------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // ----------------------------------------
  // 2. 管理者確認
  // ----------------------------------------

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    return (
      <div className="detail-page">
        <div className="container">
          <div className="card" style={{ padding: 30 }}>
            <h1>管理者確認エラー</h1>
            <p className="muted">{adminError.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    redirect("/admin/login");
  }

  // ----------------------------------------
  // 3. 各ステータス件数を取得
  // ----------------------------------------

  const [
    pendingCountResult,
    approvedCountResult,
    rejectedCountResult,
  ] = await Promise.all([
    supabase
      .from("correction_proposals")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    supabase
      .from("correction_proposals")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),

    supabase
      .from("correction_proposals")
      .select("id", { count: "exact", head: true })
      .eq("status", "rejected"),
  ]);

  // ----------------------------------------
  // 4. 現在表示する提案を取得
  // ----------------------------------------

  const { data: proposals, error } = await supabase
    .from("correction_proposals")
    .select(`
      *,
      tournaments (
        name
      )
    `)
    .eq("status", status)
    .order("created_at", {
      ascending: false,
    });

  // ----------------------------------------
  // 5. エラー
  // ----------------------------------------

  if (error) {
    return (
      <div className="detail-page">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">ホーム</Link>
            {" → "}
            <span>修正提案管理</span>
          </div>

          <div
            className="card"
            style={{
              padding: 30,
              marginTop: 20,
            }}
          >
            <h1>修正提案管理</h1>

            <p>
              修正提案の取得に失敗しました。
            </p>

            <p className="muted">
              {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = pendingCountResult.count ?? 0;
  const approvedCount = approvedCountResult.count ?? 0;
  const rejectedCount = rejectedCountResult.count ?? 0;

  return (
    <div className="detail-page">
      <div className="container">

        {/* パンくず */}
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          {" → "}
          <span>管理者画面</span>
        </div>

        {/* ヘッダー */}
        <div
          className="card"
          style={{
            padding: 30,
            marginTop: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 20,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ marginBottom: 8 }}>
                修正提案管理
              </h1>

              <p className="muted" style={{ margin: 0 }}>
                大会情報の修正提案を確認・承認・却下します。
              </p>
            </div>

            <AdminLogoutButton />
          </div>

          {/* 件数カード */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 12,
              marginTop: 28,
            }}
          >
            <Link
              href="/admin/corrections?status=pending"
              className="card"
              style={{
                padding: 18,
                textDecoration: "none",
              }}
            >
              <div className="muted">
                未処理
              </div>

              <strong
                style={{
                  display: "block",
                  fontSize: 28,
                  marginTop: 6,
                }}
              >
                {pendingCount}
              </strong>
            </Link>

            <Link
              href="/admin/corrections?status=approved"
              className="card"
              style={{
                padding: 18,
                textDecoration: "none",
              }}
            >
              <div className="muted">
                承認済み
              </div>

              <strong
                style={{
                  display: "block",
                  fontSize: 28,
                  marginTop: 6,
                }}
              >
                {approvedCount}
              </strong>
            </Link>

            <Link
              href="/admin/corrections?status=rejected"
              className="card"
              style={{
                padding: 18,
                textDecoration: "none",
              }}
            >
              <div className="muted">
                却下済み
              </div>

              <strong
                style={{
                  display: "block",
                  fontSize: 28,
                  marginTop: 6,
                }}
              >
                {rejectedCount}
              </strong>
            </Link>
          </div>

          {/* タブ */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 24,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/admin/corrections?status=pending"
              className={
                status === "pending"
                  ? "primary"
                  : "outline-button"
              }
            >
              未処理
            </Link>

            <Link
              href="/admin/corrections?status=approved"
              className={
                status === "approved"
                  ? "primary"
                  : "outline-button"
              }
            >
              承認済み
            </Link>

            <Link
              href="/admin/corrections?status=rejected"
              className={
                status === "rejected"
                  ? "primary"
                  : "outline-button"
              }
            >
              却下済み
            </Link>

            <Link
              href="/admin/corrections/history"
              className="outline-button"
            >
              変更履歴
            </Link>
          </div>
        </div>

        {/* 現在の状態 */}
        <div
          className="card"
          style={{
            padding: 20,
            marginTop: 20,
          }}
        >
          <strong>
            {statusLabels[status]}：
            {proposals?.length ?? 0}件
          </strong>
        </div>

        {/* 提案一覧 */}
        <div
          style={{
            display: "grid",
            gap: 16,
            marginTop: 20,
          }}
        >
          {proposals?.map((proposal) => {
            const tournament = Array.isArray(
              proposal.tournaments
            )
              ? proposal.tournaments[0]
              : proposal.tournaments;

            const fieldLabel =
              fieldLabels[proposal.field_name] ??
              proposal.field_name;

            return (
              <article
                key={proposal.id}
                className="card"
                style={{
                  padding: 26,
                }}
              >
                {/* バッジ */}
                <div className="badges">
                  <span className="badge">
                    {fieldLabel}
                  </span>

                  <span
                    className={
                      proposal.status === "pending"
                        ? "badge green"
                        : "badge"
                    }
                  >
                    {statusLabels[
                      proposal.status as Status
                    ] ?? proposal.status}
                  </span>
                </div>

                {/* 大会名 */}
                <h2
                  style={{
                    marginTop: 14,
                    marginBottom: 10,
                  }}
                >
                  {tournament?.name ?? "大会名不明"}
                </h2>

                {/* 大会詳細 */}
                {proposal.tournament_id && (
                  <div style={{ marginBottom: 20 }}>
                    <Link
                      href={`/tournaments/${proposal.tournament_id}`}
                      className="muted"
                    >
                      大会詳細を見る →
                    </Link>
                  </div>
                )}

                {/* 現在の情報 */}
                <div style={{ marginTop: 18 }}>
                  <p>
                    <strong>
                      現在の情報
                    </strong>
                  </p>

                  <div
                    style={{
                      padding: 16,
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      background: "#fafafa",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {proposal.current_value ||
                        "未入力"}
                    </p>
                  </div>
                </div>

                {/* 提案された情報 */}
                <div style={{ marginTop: 18 }}>
                  <p>
                    <strong>
                      提案された情報
                    </strong>
                  </p>

                  <div
                    style={{
                      padding: 16,
                      border: "1px solid #ddd",
                      borderRadius: 8,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {proposal.proposed_value}
                    </p>
                  </div>
                </div>

                {/* 理由 */}
                {proposal.reason && (
                  <div style={{ marginTop: 18 }}>
                    <p>
                      <strong>
                        修正理由
                      </strong>
                    </p>

                    <div
                      style={{
                        padding: 16,
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        background: "#fafafa",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {proposal.reason}
                      </p>
                    </div>
                  </div>
                )}

                {/* 情報源 */}
                {proposal.source_url && (
                  <div style={{ marginTop: 18 }}>
                    <p>
                      <strong>
                        情報源
                      </strong>
                    </p>

                    <a
                      href={proposal.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        wordBreak: "break-all",
                      }}
                    >
                      {proposal.source_url}
                    </a>
                  </div>
                )}

                {/* 投稿日 */}
                <p
                  className="muted"
                  style={{
                    marginTop: 20,
                    marginBottom: 0,
                  }}
                >
                  提案日時：
                  {new Date(
                    proposal.created_at
                  ).toLocaleString("ja-JP")}
                </p>

                {/* 操作 */}
                {proposal.status === "pending" && (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginTop: 24,
                      paddingTop: 20,
                      borderTop: "1px solid #eee",
                      flexWrap: "wrap",
                    }}
                  >
                    <form
                      action="/api/admin/corrections"
                      method="POST"
                    >
                      <input
                        type="hidden"
                        name="proposalId"
                        value={proposal.id}
                      />

                      <input
                        type="hidden"
                        name="action"
                        value="approve"
                      />

                      <button
                        className="primary"
                        type="submit"
                      >
                        ✅ 承認する
                      </button>
                    </form>

                    <form
                      action="/api/admin/corrections"
                      method="POST"
                    >
                      <input
                        type="hidden"
                        name="proposalId"
                        value={proposal.id}
                      />

                      <input
                        type="hidden"
                        name="action"
                        value="reject"
                      />

                      <button
                        className="outline-button"
                        type="submit"
                      >
                        ❌ 却下する
                      </button>
                    </form>
                  </div>
                )}

                {/* 処理済み */}
                {proposal.status === "approved" && (
                  <div
                    style={{
                      marginTop: 20,
                      padding: 14,
                      borderRadius: 8,
                      background: "#f5f5f5",
                    }}
                  >
                    この修正提案は承認済みです。
                  </div>
                )}

                {proposal.status === "rejected" && (
                  <div
                    style={{
                      marginTop: 20,
                      padding: 14,
                      borderRadius: 8,
                      background: "#f5f5f5",
                    }}
                  >
                    この修正提案は却下済みです。
                  </div>
                )}
              </article>
            );
          })}

          {/* 0件 */}
          {(!proposals ||
            proposals.length === 0) && (
            <div
              className="card"
              style={{
                padding: 30,
              }}
            >
              <h3>
                {statusLabels[status]}の修正提案はありません
              </h3>

              <p className="muted">
                {status === "pending"
                  ? "新しい修正提案が送信されると、ここに表示されます。"
                  : "現在、この状態の修正提案はありません。"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}