import Link from "next/link";
import { notFound } from "next/navigation";
import { getTournament } from "@/lib/tournaments";

export default async function TournamentDetail({ params }: { params: Promise<{id:string}> }) {
  const { id } = await params;
  const t = getTournament(id);
  if (!t) notFound();

  const rows = [
    ["主催者", t.organizer],
    ["開催日", t.date],
    ["会場", `${t.city}${t.venue ? `・${t.venue}` : ""}`],
    ["種目", t.eventType],
    ["クラス", t.level],
    ["参加資格", t.eligibility],
    ["参加費", t.fee || "要項をご確認ください"],
    ["申込締切", t.deadline || "要項をご確認ください"],
    ["申込方法", t.applicationMethod || "公式サイトをご確認ください"],
    ["情報源", t.officialUrl],
    ["最終確認日", "2026/09/22"],
  ];

  return (
    <div className="detail-page">
      <div className="container">
        <div className="breadcrumb">ホーム → 大会を探す → 大会詳細</div>
        <div className="detail-grid">
          <article className="card detail-main">
            <div className="badges"><span className="badge green">{t.status}</span><span className="badge">{t.level || "クラス記載なし"}</span></div>
            <h1>{t.name}</h1>
            <div className="info-table">
              {rows.map(([k,v]) => <div key={k}>{k}</div>)}
              {rows.map(([k,v]) => <div key={`${k}-v`}><span>{v}</span></div>)}
            </div>
            <div className="notice">
              <strong>参加資格を検索しやすく整理</strong>
              <p>{t.externalAllowed === "可" ? "非会員でも参加可能です。" : "会員要件は公式情報をご確認ください。"} {t.otherCityAllowed === "可" ? "他市協会員も参加可能です。" : ""}</p>
            </div>
            <div style={{display:"flex",gap:10,marginTop:22}}>
              <a className="primary" href={t.officialUrl} target="_blank">公式情報を見る</a>
              <Link className="outline-button" href={`/tournaments/${t.id}/suggest`}>この大会を修正</Link>
            </div>
          </article>
          <aside className="card detail-side">
            <h3>情報の信頼性</h3>
            <p>✓ 公式情報をもとに登録</p>
            <p>✓ 最終確認日を記録</p>
            <p>✓ 修正履歴を管理予定</p>
            <hr />
            <h3>関連する大会</h3>
            <p className="muted">今後ここに同じ主催者・同じエリアの大会を表示します。</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
