import { notFound } from "next/navigation";
import { getTournament } from "@/lib/tournaments";

export default async function SuggestPage({ params }: { params: Promise<{id:string}> }) {
  const { id } = await params;
  const t = getTournament(id);
  if (!t) notFound();

  return (
    <div className="form-page">
      <div className="container">
        <div className="form-layout">
          <section className="card form-card">
            <h1>大会情報の修正依頼</h1>
            <p className="muted">「{t.name}」について、新しい情報をお持ちの場合はこちらからお知らせください。</p>
            <form action="/api/proposals" method="post">
              <input type="hidden" name="tournamentId" value={t.id} />
              <div className="form-row">
                <label><span>修正項目</span></label>
                <div className="checks">
                  {["開催日・予備日","会場","参加資格","申込締切","参加費","その他"].map(x =>
                    <label key={x}><input type="checkbox" name="fields" value={x} />{x}</label>
                  )}
                </div>
              </div>
              <div className="form-row">
                <label><span>詳細内容</span><textarea name="detail" rows={6} placeholder="正しい情報や変更理由をご記入ください。" /></label>
              </div>
              <div className="form-row">
                <label><span>参考URL（任意）</span><input name="sourceUrl" placeholder="公式サイトや大会要項のURL" /></label>
              </div>
              <div className="form-row">
                <label><span>連絡先（任意）</span><input name="contact" placeholder="メールアドレスなど" /></label>
              </div>
              <button className="primary" type="submit">提案を送信</button>
            </form>
          </section>
          <aside className="card form-card">
            <h3>修正に関する注意事項</h3>
            <ul>
              <li>公式情報との照合を行います。</li>
              <li>確認に時間がかかる場合があります。</li>
              <li>公開情報の変更は管理者承認後に反映します。</li>
            </ul>
            <h3>この仕組みについて</h3>
            <p className="muted">ユーザーからの改善提案を受け付け、承認後に正式データへ反映する設計です。</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
