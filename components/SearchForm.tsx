"use client";

import { useRouter } from "next/navigation";

export function SearchForm({ cities }: { cities: string[] }) {
  const router = useRouter();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const qs = new URLSearchParams();

    for (const [key, value] of form.entries()) {
      if (typeof value === "string" && value) {
        qs.set(key, value);
      }
    }

    router.push(`/tournaments?${qs.toString()}`);
  };

  return (
    <form className="search-panel" onSubmit={submit}>
      <div className="section-title">大会を探す</div>

      <p className="muted">
        条件を指定して、広島県内のテニス大会を検索できます。
      </p>

      <div className="field-grid">
        <label>
          <span>開催時期</span>
          <select name="period" defaultValue="all">
            <option value="all">すべて</option>
            <option value="month">今月</option>
            <option value="3months">3か月以内</option>
          </select>
        </label>

        <label>
          <span>市町村</span>
          <select name="city" defaultValue="">
            <option value="">すべて</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>種目</span>
          <select name="eventType" defaultValue="">
            <option value="">すべて</option>
            <option value="シングルス">シングルス</option>
            <option value="ダブルス">ダブルス</option>
            <option value="MIXダブルス">MIXダブルス</option>
            <option value="団体戦">団体戦</option>
            <option value="交流大会">交流大会</option>
            <option value="ベテラン">ベテラン</option>
          </select>
        </label>

        <label>
          <span>性別</span>
          <select name="gender" defaultValue="">
            <option value="">指定なし</option>
            <option value="男子">男子</option>
            <option value="女子">女子</option>
            <option value="男女">男女</option>
          </select>
        </label>

        <label>
          <span>レベル</span>
          <select name="level" defaultValue="">
            <option value="">すべて</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="AB">AB</option>
            <option value="CD">CD</option>
            <option value="オープン">オープン</option>
          </select>
        </label>

        <label>
          <span>参加資格</span>
          <select name="eligibility" defaultValue="">
            <option value="">すべて</option>
            <option value="external">非会員でも参加OK</option>
            <option value="otherCity">他市協会員OK</option>
            <option value="visitor">ビジターOK</option>
          </select>
        </label>
      </div>

      <button className="primary search-button" type="submit">
        🔎 この条件で検索
      </button>
    </form>
  );
}