"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";

const QUICK_FILTERS = [
  { key: "period", icon: "📅", label: "日程" },
  { key: "city", icon: "📍", label: "エリア" },
  { key: "eventType", icon: "🎾", label: "種目" },
  { key: "level", icon: "⭐", label: "レベル" },
] as const;

export function SearchForm({
  cities,
}: {
  cities: string[];
}) {
  const router = useRouter();

  const submit = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const qs = new URLSearchParams();

    for (const [key, value] of form.entries()) {
      if (
        typeof value === "string" &&
        value.trim() !== "" &&
        value !== "all"
      ) {
        qs.set(key, value);
      }
    }

    const queryString = qs.toString();

    router.push(
      queryString
        ? `/tournaments?${queryString}`
        : "/tournaments"
    );
  };

  return (
    <form
      className="search-panel home-search-panel"
      onSubmit={submit}
    >
      <div className="search-panel-title">
        大会を探す
      </div>

      <div className="search-primary-grid">
        <label className="search-keyword-field">
          <span>キーワード</span>
          <input
            type="search"
            name="keyword"
            placeholder="大会名・会場・主催者"
            autoComplete="off"
          />
        </label>

        <label className="quick-filter">
          <span className="quick-filter-top">
            <span className="quick-filter-icon" aria-hidden="true">
              📅
            </span>
            <span className="quick-filter-label">日程</span>
          </span>
          <select name="period" defaultValue="all" aria-label="日程">
            <option value="all">すべて</option>
            <option value="month">今月</option>
            <option value="3months">3か月以内</option>
            <option value="6months">6か月以内</option>
          </select>
        </label>

        <label className="quick-filter">
          <span className="quick-filter-top">
            <span className="quick-filter-icon" aria-hidden="true">
              📍
            </span>
            <span className="quick-filter-label">エリア</span>
          </span>
          <select name="city" defaultValue="" aria-label="エリア">
            <option value="">すべて</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label className="quick-filter">
          <span className="quick-filter-top">
            <span className="quick-filter-icon" aria-hidden="true">
              🎾
            </span>
            <span className="quick-filter-label">種目</span>
          </span>
          <select
            name="eventType"
            defaultValue=""
            aria-label="種目"
          >
            <option value="">すべて</option>
            <option value="シングルス">シングルス</option>
            <option value="ダブルス">ダブルス</option>
            <option value="MIXダブルス">MIXダブルス</option>
            <option value="団体戦">団体戦</option>
            <option value="交流大会">交流大会</option>
            <option value="ベテラン">ベテラン</option>
          </select>
        </label>

        <label className="quick-filter">
          <span className="quick-filter-top">
            <span className="quick-filter-icon" aria-hidden="true">
              ⭐
            </span>
            <span className="quick-filter-label">レベル</span>
          </span>
          <select name="level" defaultValue="" aria-label="レベル">
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
      </div>

      <details className="advanced-filters">
        <summary>詳細条件</summary>

        <div className="advanced-filter-grid">
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
            <span>参加資格</span>
            <select
              name="eligibility"
              defaultValue=""
            >
              <option value="">すべて</option>
              <option value="external">非会員でも参加OK</option>
              <option value="otherCity">他市協会員OK</option>
              <option value="visitor">ビジターOK</option>
            </select>
          </label>

          <label>
            <span>締切</span>
            <select name="deadline" defaultValue="">
              <option value="">指定なし</option>
              <option value="open">まだ申込可能</option>
              <option value="7days">7日以内に締切</option>
              <option value="30days">30日以内に締切</option>
              <option value="noDeadline">締切情報なし</option>
            </select>
          </label>

          <label>
            <span>ステータス</span>
            <select name="status" defaultValue="">
              <option value="">すべて</option>
              <option value="募集中">募集中</option>
              <option value="開催予定">開催予定</option>
              <option value="終了">終了</option>
            </select>
          </label>
        </div>
      </details>

      <button
        className="primary search-button"
        type="submit"
      >
        🔎 検索する
      </button>
    </form>
  );
}
