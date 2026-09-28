import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const correctionFields = [
  "開催日・予備日",
  "会場",
  "参加資格",
  "申込締切",
  "参加費",
  "その他",
];

export default async function SuggestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: userData },
    { data: tournament, error },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("tournaments")
      .select(
        "id,name,date_text,venue_name_raw,city,eligibility,deadline_text,fee_text,official_url"
      )
      .eq("id", id)
      .single(),
  ]);

  if (error || !tournament) {
    notFound();
  }

  if (!userData.user) {
    redirect(
      "/auth/login?next=" +
        encodeURIComponent("/tournaments/" + id + "/suggest")
    );
  }

  return (
    <div className="form-page">
      <div className="container">
        <div className="form-layout">
          <section className="card form-card">
            <span className="badge green">ログイン中</span>
            <h1>大会情報の修正依頼</h1>
            <p className="muted">
              「{tournament.name}」について、正しい情報をお持ちの場合はこちらからお知らせください。
            </p>

            <form action="/api/correction-proposals" method="post">
              <input type="hidden" name="tournamentId" value={tournament.id} />

              <div className="form-row">
                <label htmlFor="fieldName">
                  <span>修正項目</span>
                  <select id="fieldName" name="fieldName" required defaultValue="">
                    <option value="" disabled>
                      選択してください
                    </option>
                    {correctionFields.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label htmlFor="proposedValue">
                  <span>正しい情報</span>
                  <textarea
                    id="proposedValue"
                    name="proposedValue"
                    rows={5}
                    required
                    placeholder="正しい情報を具体的にご記入ください。"
                  />
                </label>
              </div>

              <div className="form-row">
                <label htmlFor="reason">
                  <span>修正理由</span>
                  <textarea
                    id="reason"
                    name="reason"
                    rows={4}
                    placeholder="公式サイトの更新、要項の変更など、分かる範囲でご記入ください。"
                  />
                </label>
              </div>

              <div className="form-row">
                <label htmlFor="sourceUrl">
                  <span>参考URL（任意）</span>
                  <input
                    id="sourceUrl"
                    name="sourceUrl"
                    type="url"
                    placeholder="公式サイトや大会要項のURL"
                  />
                </label>
              </div>

              <button className="primary" type="submit">
                修正提案を送信
              </button>
            </form>
          </section>

          <aside className="card form-card">
            <h3>みんなで大会情報を育てよう</h3>
            <p className="muted">
              大会情報は管理者が公式情報と照合して確認します。承認後に公開データへ反映されます。
            </p>

            <h3>現在の掲載情報</h3>
            <ul>
              <li>開催日：{tournament.date_text ?? "未設定"}</li>
              <li>
                会場：
                {tournament.city || tournament.venue_name_raw
                  ? (tournament.city ?? "") +
                    (tournament.venue_name_raw
                      ? "・" + tournament.venue_name_raw
                      : "")
                  : "未設定"}
              </li>
              <li>参加資格：{tournament.eligibility ?? "未設定"}</li>
              <li>申込締切：{tournament.deadline_text ?? "未設定"}</li>
              <li>参加費：{tournament.fee_text ?? "未設定"}</li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
