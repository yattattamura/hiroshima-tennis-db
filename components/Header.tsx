"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function Header() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setUserEmail(data.user?.email ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
            <Link href="/" className="logo" aria-label="ノウニス ホーム">
              <img
                src="/brand/know-nis-mark.svg"
                alt=""
                aria-hidden="true"
                className="logo-mark"
              />
              <span>ノウニス</span>
            </Link>

            <div className="header-account">
              {userEmail ? (
                <Link href="/account" className="header-account-link">
                  マイページ
                </Link>
              ) : (
                <Link href="/auth/login" className="header-account-link">
                  ログイン
                </Link>
              )}
            </div>
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
        <Link
          href={userEmail ? "/account" : "/auth/login"}
          className={"mobile-bottom-nav-item" + ((pathname.startsWith("/account") || pathname.startsWith("/auth")) ? " active" : "")}
        >
          <span aria-hidden="true">👤</span>
          <span>{userEmail ? "マイページ" : "ログイン"}</span>
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

            .header-account {
              flex-shrink: 0;
            }

            .header-account-link {
              color: var(--blue);
              font-size: 12px;
              font-weight: 700;
              white-space: nowrap;
            }

            @media (max-width: 700px) {
              .header-account-link {
                display: inline-flex;
                align-items: center;
                min-height: 34px;
                padding: 0 10px;
                border: 1px solid var(--border);
                border-radius: 999px;
                background: #fff;
              }
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
                min-height: 48px;
                padding-left: 10px;
                padding-right: 10px;
              }

              .header-top {
                min-height: 44px;
              }

              .header-actions {
                display: none;
              }

              /* マイページはヘッダーにも残して、下部ナビ以外からも到達できるようにする */
              .header-account {
                display: block;
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
                font-size: 13px;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .logo-mark {
                width: 26px;
                height: 22px;
                flex: 0 0 auto;
              }

              .header-account-link {
                font-size: 11px;
              }
            }

            .logo {
              display: inline-flex;
              align-items: center;
              gap: 7px;
              color: var(--blue);
              font-weight: 800;
              text-decoration: none;
              letter-spacing: 0.01em;
            }

            .logo-mark {
              width: 31px;
              height: 24px;
              object-fit: contain;
              flex: 0 0 auto;
            }
          `,
        }}
      />
    </>
  );
}
