import Link from "next/link";

export function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo">🎾 広島テニスDB</Link>

        <Link
          href="/favorites"
          aria-label="お気に入り一覧"
          title="お気に入り"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text)",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          ☆
        </Link>

        <nav>
          <Link href="/tournaments">大会を探す</Link>
          <Link href="/favorites">お気に入り</Link>
          <Link href="/admin">管理者</Link>
        </nav>

        <div className="header-actions">
          <button className="link-button">ログイン</button>
          <button className="primary small">会員登録</button>
        </div>
      </div>
    </header>
  );
}
