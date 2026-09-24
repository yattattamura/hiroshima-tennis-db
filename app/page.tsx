import Link from "next/link";

import { tournaments, getCities } from "@/lib/tournaments";
import { TournamentCard } from "@/components/TournamentCard";
import { SearchForm } from "@/components/SearchForm";

export default function Home() {
  const featured = tournaments.slice(0, 3);
  const cities = getCities();

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>
            広島のテニス大会をもっと手軽に！
          </h1>

          <p>
            広島県内のテニス大会情報を横断検索できるテニスポータルサイトです。
          </p>

          <SearchForm cities={cities} />
        </div>
      </section>

      <div className="container">
        <div className="stats">
          <div className="stat">
            <strong>100+</strong>
            今後の大会
          </div>

          <div className="stat">
            <strong>14</strong>
            対応エリア
          </div>

          <div className="stat">
            <strong>30+</strong>
            主催者・団体
          </div>

          <div className="stat">
            <strong>公式確認</strong>
            情報源を明記
          </div>
        </div>
      </div>

      <section className="section container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>注目の大会</h2>

          <Link href="/tournaments" className="muted">
            もっと見る →
          </Link>
        </div>

        <div className="grid3">
          {featured.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      </section>
    </>
  );
}