const proposals = [
  { id: "p001", name: "第56回ひよこテニス大会", field: "申込締切", before: "9/27", after: "10/1", source: "公式要項URLあり" },
  { id: "p002", name: "秋季シングルス大会", field: "会場", before: "未確定", after: "呉市総合スポーツセンター", source: "主催者ページあり" },
];

export default function AdminPage() {
  return (
    <div className="admin">
      <div className="container">
        <h1>管理者ダッシュボード</h1>
        <p className="muted">ユーザーからの情報修正提案を確認・承認します。</p>
        {proposals.map((p) => (
          <article className="card proposal" key={p.id}>
            <div className="badges"><span className="badge">承認待ち</span><span className="badge">{p.field}</span></div>
            <h2>{p.name}</h2>
            <div className="proposal-grid">
              <div><span className="muted">変更前</span><br /><strong>{p.before}</strong></div>
              <div><span className="muted">変更後</span><br /><strong>{p.after}</strong></div>
            </div>
            <p className="muted">出典: {p.source}</p>
            <div className="admin-actions">
              <button className="primary">承認</button>
              <button className="outline-button">差し戻し</button>
              <button className="outline-button">却下</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
