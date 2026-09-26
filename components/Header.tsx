import Link from "next/link";

export function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          🎾 広島テニスDB
        </Link>

        <nav>
          <Link href="/tournaments">大会を探す</Link>
          <Link href="/favorites">お気に入り</Link>
          <Link href="/recent">最近見た</Link>
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