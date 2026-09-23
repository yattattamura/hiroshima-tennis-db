"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SearchForm({ cities }: { cities: string[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const qs = new URLSearchParams();
    for (const [key, value] of form.entries()) {
      if (typeof value === "string" && value) qs.set(key, value);
    }
    router.push(`/tournaments?${qs.toString()}`);
  };

  return (
    <form className="search-panel" onSubmit={submit}>
      <div className="section-title">大会を探す</div>
      <p className="muted">条件を指定して、広島県内のテニス大会を検索できます。</p>

      <div className="field-grid">
        <label>
          <span>開催時期</span>
          <select name="period" defaultValue={params.get("period") ?? "all"}>
            <option value="all">すべて</option>
            <option value="month">今月</option>
            <option value="3months">3か月以内</option>
          </select>
        </label>
        <label>
          <span>市町村</span>
          <select name="city" defaultValue={params.get("city") ?? ""}>
            <option value="">すべて</option>
            {cities.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>
          <span>種目</span>
          <select name="eventType" defaultValue={params.get("eventType") ?? ""}>
            <option value="">すべて</option>
            <option>シングルス</option>
            <option>ダブルス</option>
            <option>MIXダブルス</option>
            <option>団体戦</option>
            <option>交流大会</option>
            <option>ベテラン</option>
          </select>
        </label>
        <label>
          <span>性別</span>
          <select name="gender" defaultValue={params.get("gender") ?? ""}>
            <option value="">指定なし</option>
            <option>男子</option>
            <option>女子</option>
            <option>男女</option>
          </select>
        </label>
        <label>
          <span>レベル</span>
          <select name="level" defaultValue={params.get("level") ?? ""}>
            <option value="">すべて</option>
            <option>A</option><option>B</option><option>C</option><option>D</option>
            <option>AB</option><option>CD</option><option>オープン</option>
          </select>
        </label>
        <label>
          <span>参加資格</span>
          <select name="eligibility" defaultValue={params.get("eligibility") ?? ""}>
            <option value="">すべて</option>
            <option value="external">非会員でも参加OK</option>
            <option value="otherCity">他市協会員OK</option>
            <option value="visitor">ビジターOK</option>
          </select>
        </label>
      </div>

      <button className="primary search-button" type="submit">🔎 この条件で検索</button>
    </form>
  );
}
