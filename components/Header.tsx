"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="header-top">
            <Link href="/" className="logo">
              🎾 広島テニスポータル
            </Link>

          </div>

          <nav className="header-nav">
            <Link
              href="/tournaments"
              className={isActive("/tournaments") ? "active" : undefined}
            >
              大会を探す
            </Link>
            <Link
              href="/favorites"
              className={isActive("/favorites") ? "active" : undefined}
            >
              お気に入り
            </Link>
            <Link
              href="/recent"
              className={isActive("/recent") ? "active" : undefined}
            >
              最近見た
            </Link>
          </nav>
        </div>
      </header>

      <nav
        className="mobile-bottom-nav"
        aria-label="スマホ用ナビゲーション"
      >
        <Link href="/" className={"mobile-bottom-nav-item" + (isActive("/") ? " active" : "")}>
          <span aria-hidden="true">🏠</span>
          <span>ホーム</span>
        </Link>
        <Link href="/tournaments" className={"mobile-bottom-nav-item" + (isActive("/tournaments") ? " active" : "")}>
          <span aria-hidden="true">🎾</span>
          <span>大会を探す</span>
        </Link>
        <Link href="/favorites" className={"mobile-bottom-nav-item" + (isActive("/favorites") ? " active" : "")}>
          <span aria-hidden="true">♡</span>
          <span>お気に入り</span>
        </Link>
        <Link href="/recent" className={"mobile-bottom-nav-item" + (isActive("/recent") ? " active" : "")}>
          <span aria-hidden="true">🕘</span>
          <span>最近見た</span>
        </Link>
      </nav>

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

            .header-nav a.active {
              color: var(--blue);
              font-weight: 800;
            }

            .mobile-bottom-nav {
              display: none;
            }

            .mobile-bottom-nav-item {
              color: var(--muted);
              text-decoration: none;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 2px;
              min-width: 0;
              font-size: 10px;
              line-height: 1.2;
              font-weight: 700;
            }

            .mobile-bottom-nav-item.active {
              color: var(--blue);
            }

            .mobile-bottom-nav-item span:first-child {
              font-size: 18px;
              line-height: 1;
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