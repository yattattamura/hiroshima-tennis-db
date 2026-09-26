"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "hiroshima-tennis-db-recent-v1";

type RecentTournament = {
  id: string;
  name: string;
  date: string;
  city: string;
  venue: string;
  eventType: string;
  level: string;
  viewedAt: string;
};

export default function RecentPage() {
  const [items, setItems] = useState<
    RecentTournament[]
  >([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(
        STORAGE_KEY
      );

      if (!raw) {
        return;
      }

      const parsed = JSON.parse(
        raw
      ) as RecentTournament[];

      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      setItems([]);
    }
  }, []);

  function removeItem(id: string) {
    const next = items.filter(
      (item) => item.id !== id
    );

    setItems(next);

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next)
    );
  }

  function clearAll() {
    setItems([]);
    window.localStorage.removeItem(
      STORAGE_KEY
    );
  }

  return (
    <main className="detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">
            ホーム
          </Link>

          <span aria-hidden="true">
            ›
          </span>

          <span>
            最近見た大会
          </span>
        </div>

        <section
          className="card"
          style={{
            padding: 28,
            marginTop: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                }}
              >
                最近見た大会
              </h1>

              <p
                className="muted"
                style={{
                  marginTop: 6,
                }}
              >
                最近チェックした大会を
                最大10件表示します。
              </p>
            </div>

            {items.length > 0 ? (
              <button
                type="button"
                className="outline-button"
                onClick={clearAll}
              >
                すべて削除
              </button>
            ) : null}
          </div>
        </section>

        {items.length === 0 ? (
          <section
            className="card"
            style={{
              padding: 30,
              marginTop: 16,
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              まだ大会を見ていません
            </h2>

            <p className="muted">
              大会詳細ページを見ると、
              ここに自動で追加されます。
            </p>

            <div
              style={{
                marginTop: 18,
              }}
            >
              <Link
                href="/tournaments"
                className="primary"
              >
                大会を探す
              </Link>
            </div>
          </section>
        ) : (
          <section
            style={{
              marginTop: 16,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                display: "grid",
                gap: 10,
              }}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    padding: 18,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "flex-start",
                      gap: 12,
                    }}
                  >
                    <Link
                      href={`/tournaments/${item.id}`}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        textDecoration:
                          "none",
                      }}
                    >
                      <strong
                        style={{
                          display:
                            "block",
                          fontSize: 17,
                          lineHeight: 1.5,
                        }}
                      >
                        {item.name}
                      </strong>

                      <div
                        className="muted"
                        style={{
                          marginTop: 7,
                          lineHeight: 1.7,
                        }}
                      >
                        {item.date ||
                          "開催日未設定"}

                        {item.city ||
                        item.venue
                          ? ` ・ ${[
                              item.city,
                              item.venue,
                            ]
                              .filter(
                                Boolean
                              )
                              .join("・")}`
                          : ""}
                      </div>

                      <div
                        className="muted"
                        style={{
                          marginTop: 3,
                        }}
                      >
                        {item.eventType ||
                          "種目未設定"}

                        {item.level
                          ? ` ・ ${item.level}`
                          : ""}
                      </div>
                    </Link>

                    <button
                      type="button"
                      className="link-button"
                      onClick={() =>
                        removeItem(
                          item.id
                        )
                      }
                      aria-label={`${item.name}を最近見た大会から削除`}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}