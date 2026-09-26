import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

type Tournament = {
  id: string;
  name: string;
  city: string | null;
  venue_name_raw: string | null;
  date_text: string | null;
  start_date: string | null;
  event_type: string | null;
  gender: string | null;
  level: string | null;
  eligibility: string | null;
  fee_text: string | null;
  deadline_text: string | null;
  deadline_date: string | null;
  application_method: string | null;
  official_url: string | null;
  status: string | null;
  notes: string | null;
  last_checked_at: string | null;
  data_quality_note: string | null;
};

function inputDate(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

export default async function TournamentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminUser) {
    redirect("/admin/login");
  }

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select(`
      id,
      name,
      city,
      venue_name_raw,
      date_text,
      start_date,
      event_type,
      gender,
      level,
      eligibility,
      fee_text,
      deadline_text,
      deadline_date,
      application_method,
      official_url,
      status,
      notes,
      last_checked_at,
      data_quality_note
    `)
    .eq("id", id)
    .single();

  if (error || !tournament) {
    notFound();
  }

  const item = tournament as Tournament;

  return (
    <div className="detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          {" → "}
          <Link href="/admin">管理者画面</Link>
          {" → "}
          <Link href="/admin/data-quality">データ品質</Link>
          {" → "}
          <span>大会編集</span>
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
                大会情報を編集
              </h1>
              <p className="muted" style={{ margin: 0 }}>
                管理者権限で大会情報を直接更新します。
              </p>
            </div>

            <AdminLogoutButton />
          </div>
        </div>

        <form
          action={`/api/admin/tournaments/${item.id}`}
          method="POST"
          style={{
            marginTop: 20,
            display: "grid",
            gap: 16,
          }}
        >
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>基本情報</h2>

            <div style={{ display: "grid", gap: 16 }}>
              <label>
                <span className="muted">大会名</span>
                <input
                  name="name"
                  type="text"
                  defaultValue={item.name}
                  required
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>

              <label>
                <span className="muted">市町村</span>
                <input
                  name="city"
                  type="text"
                  defaultValue={item.city ?? ""}
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>

              <label>
                <span className="muted">会場</span>
                <input
                  name="venue_name_raw"
                  type="text"
                  defaultValue={item.venue_name_raw ?? ""}
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>

              <label>
                <span className="muted">開催日（検索用）</span>
                <input
                  name="start_date"
                  type="date"
                  defaultValue={inputDate(item.start_date)}
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>

              <label>
                <span className="muted">開催日（表示）</span>
                <input
                  name="date_text"
                  type="text"
                  defaultValue={item.date_text ?? ""}
                  placeholder="例：10/12（月祝）"
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>

              <label>
                <span className="muted">種目</span>
                <input
                  name="event_type"
                  type="text"
                  defaultValue={item.event_type ?? ""}
                  placeholder="例：男子シングルス"
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>

              <label>
                <span className="muted">性別</span>
                <input
                  name="gender"
                  type="text"
                  defaultValue={item.gender ?? ""}
                  placeholder="例：男子 / 女子 / 男女混合"
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>

              <label>
                <span className="muted">クラス</span>
                <input
                  name="level"
                  type="text"
                  defaultValue={item.level ?? ""}
                  placeholder="例：A・B・CD"
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>申込情報</h2>

            <div style={{ display: "grid", gap: 16 }}>
              <label>
                <span className="muted">参加資格</span>
                <textarea
                  name="eligibility"
                  defaultValue={item.eligibility ?? ""}
                  rows={4}
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>

              <label>
                <span className="muted">参加費</span>
                <input
                  name="fee_text"
                  type="text"
                  defaultValue={item.fee_text ?? ""}
                  placeholder="例：3,000円"
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>

              <label>
                <span className="muted">申込締切（表示）</span>
                <input
                  name="deadline_text"
                  type="text"
                  defaultValue={item.deadline_text ?? ""}
                  placeholder="例：9/28（月）"
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>

              <label>
                <span className="muted">申込締切（検索用）</span>
                <input
                  name="deadline_date"
                  type="date"
                  defaultValue={inputDate(item.deadline_date)}
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>

              <label>
                <span className="muted">申込方法</span>
                <textarea
                  name="application_method"
                  defaultValue={item.application_method ?? ""}
                  rows={4}
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>
              公式情報・管理情報
            </h2>

            <div style={{ display: "grid", gap: 16 }}>
              <label>
                <span className="muted">公式URL</span>
                <input
                  name="official_url"
                  type="url"
                  defaultValue={item.official_url ?? ""}
                  placeholder="https://..."
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>

              <label>
                <span className="muted">ステータス</span>
                <input
                  name="status"
                  type="text"
                  defaultValue={item.status ?? ""}
                  placeholder="例：募集中"
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>

              <label>
                <span className="muted">備考</span>
                <textarea
                  name="notes"
                  defaultValue={item.notes ?? ""}
                  rows={5}
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>

              <label>
                <span className="muted">最終確認日</span>
                <input
                  name="last_checked_at"
                  type="date"
                  defaultValue={inputDate(item.last_checked_at)}
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>

              <label>
                <span className="muted">データ品質メモ</span>
                <textarea
                  name="data_quality_note"
                  defaultValue={item.data_quality_note ?? ""}
                  rows={5}
                  placeholder="確認したことや注意事項"
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: 20,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <button type="submit" className="primary">
              保存する
            </button>

            <Link
              href={`/tournaments/${item.id}`}
              className="outline-button"
            >
              大会詳細を見る
            </Link>

            <Link
              href="/admin/data-quality"
              className="outline-button"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
