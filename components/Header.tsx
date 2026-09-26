import Link from "next/link";

export function Header() {
  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="header-top">
            <Link href="/" className="logo">
              🎾 広島テニスDB
            </Link>

            <div className="header-actions">
              <button className="link-button">ログイン</button>
              <button className="primary small">会員登録</button>
            </div>
          </div>

          <nav className="header-nav">
            <Link href="/tournaments">大会を探す</Link>
            <Link href="/favorites">お気に入り</Link>
            <Link href="/recent">最近見た</Link>
            <Link href="/admin">管理者</Link>
          </nav>
        </div>
      </header>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .header-top {
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
              min-width: 0;
            }

            .header-nav {
              display: flex;
              align-items: center;
              gap: 20px;
            }

            .header-nav a {
              white-space: nowrap;
            }

            @media (max-width: 700px) {
              .header-inner {
                display: block;
                padding-left: 10px;
                padding-right: 10px;
              }

              .header-top {
                min-height: 42px;
              }

              .header-actions {
                display: none;
              }

              .header-nav {
                width: 100%;
                display: flex;
                gap: 18px;
                overflow-x: auto;
                overflow-y: hidden;
                white-space: nowrap;
                padding: 7px 2px 8px;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: none;
              }

              .header-nav::-webkit-scrollbar {
                display: none;
              }

              .header-nav a {
                flex: 0 0 auto;
                font-size: 12px;
              }

              .logo {
                white-space: nowrap;
                font-size: 14px;
              }
            }
          `,
        }}
      />
    </>
  );
}