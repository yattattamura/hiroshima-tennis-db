import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

const actionLabels: Record<string, string> = {
  approved: "承認",
  rejected: "却下",
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

export default async function CorrectionHistoryPage() {
  const supabase = await createClient();

  // ログイン確認
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // 管理者確認
  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !adminUser) {
    redirect("/admin/login");
  }

  // 履歴取得
  const { data: histories, error } = await supabase
    .from("correction_proposal_histories")
    .select(`
      *,
      tournaments (
        name
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return (
      <div className="detail-page">
        <div className="container">
          <div className="card" style={{ padding: 30 }}>
            <h1>変更履歴</h1>
            <p>
              変更履歴の取得に失敗しました。
            </p>
            <p className="muted">
              {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="container">

        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          {" → "}
          <Link href="/admin/corrections">
            修正提案管理
          </Link>
          {" → "}
          <span>変更履歴</span>
        </div>

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
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ marginBottom: 8 }}>
                変更履歴
              </h1>

              <p className="muted" style={{ margin: 0 }}>
                修正提案の承認・却下履歴を確認できます。
              </p>
            </div>

            <AdminLogoutButton />
          </div>

          <div style={{ marginTop: 20 }}>
            <Link
              href="/admin/corrections"
              className="outline-button"
            >
              ← 修正提案管理へ戻る
            </Link>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 16,
            marginTop: 20,
          }}
        >
          {histories?.map((history) => {
            const tournament = Array.isArray(
              history.tournaments
            )
              ? history.tournaments[0]
              : history.tournaments;

            const actionLabel =
              actionLabels[history.action] ??
              history.action;

            const fieldLabel =
              fieldLabels[history.field_name] ??
              history.field_name;

            return (
              <article
                key={history.id}
                className="card"
                style={{ padding: 24 }}
              >
                <div className="badges">
                  <span className="badge">
                    {fieldLabel}
                  </span>

                  <span className="badge green">
                    {actionLabel}
                  </span>
                </div>

                <h2 style={{ marginTop: 14 }}>
                  {tournament?.name ?? "大会名不明"}
                </h2>

                <div style={{ marginTop: 18 }}>
                  <p>
                    <strong>
                      変更前
                    </strong>
                  </p>

                  <div
                    style={{
                      padding: 14,
                      background: "#fafafa",
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
                      {history.current_value ||
                        "未入力"}
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <p>
                    <strong>
                      提案内容
                    </strong>
                  </p>

                  <div
                    style={{
                      padding: 14,
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
                      {history.proposed_value}
                    </p>
                  </div>
                </div>

                <p
                  className="muted"
                  style={{ marginTop: 18 }}
                >
                  処理日時：
                  {new Date(
                    history.created_at
                  ).toLocaleString("ja-JP")}
                </p>
              </article>
            );
          })}

          {(!histories ||
            histories.length === 0) && (
            <div
              className="card"
              style={{ padding: 30 }}
            >
              <h3>
                変更履歴はまだありません
              </h3>

              <p className="muted">
                修正提案を承認または却下すると、
                ここに履歴が記録されます。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}