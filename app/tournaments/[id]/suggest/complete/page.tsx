import Link from "next/link";

export default function SuggestCompletePage() {
  return (
    <div className="detail-page">
      <div className="container">
        <div className="card" style={{ padding: 30, maxWidth: 800 }}>
          <h1>修正提案を受け付けました</h1>

          <p>
            ご提案ありがとうございます。
            内容を確認したうえで、必要に応じて大会情報を更新します。
          </p>

          <div style={{ marginTop: 24 }}>
            <Link href="/tournaments" className="outline-button">
              大会一覧へ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}