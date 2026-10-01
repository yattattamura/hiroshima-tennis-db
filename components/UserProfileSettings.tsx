"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserProfileSettingsProps = {
  initialPrefecture: string;
  initialCity: string;
  prefectures: Array<{ name: string; slug: string }>;
  citiesByPrefecture: Record<string, string[]>;
};

export function UserProfileSettings({
  initialPrefecture,
  initialCity,
  prefectures,
  citiesByPrefecture,
}: UserProfileSettingsProps) {
  const supabase = createClient();
  const [prefecture, setPrefecture] = useState(initialPrefecture);
  const [city, setCity] = useState(initialCity);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const cities = prefecture
    ? citiesByPrefecture[prefecture] ?? []
    : [];

  async function saveProfile() {
    if (saving) return;

    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("ログイン状態を確認できませんでした。");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("user_profiles").upsert(
      {
        user_id: user.id,
        prefecture: prefecture || null,
        city: city || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      setMessage("居住地を保存できませんでした。");
    } else {
      setMessage("居住地を保存しました。大会検索の初期値に反映されます。");
    }

    setSaving(false);
  }

  return (
    <div className="user-profile-settings">
      <div className="user-profile-grid">
        <label>
          <span>都道府県</span>
          <select
            value={prefecture}
            disabled={saving}
            onChange={(event) => {
              const nextPrefecture = event.target.value;
              setPrefecture(nextPrefecture);
              setCity("");
            }}
          >
            <option value="">登録しない</option>
            {prefectures.map((item) => (
              <option key={item.slug} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>市区町村</span>
          <select
            value={city}
            disabled={!prefecture || saving}
            onChange={(event) => setCity(event.target.value)}
          >
            <option value="">指定しない</option>
            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="user-profile-note">
        都道府県・市区町村だけを登録します。番地などの住所は登録しません。
      </p>

      <button
        type="button"
        className="primary"
        onClick={() => void saveProfile()}
        disabled={saving}
        aria-busy={saving}
      >
        {saving ? (
          <>
            <span className="loading-spinner" aria-hidden="true" />
            保存中…
          </>
        ) : (
          "居住地を保存"
        )}
      </button>

      {message ? (
        <span className="save-search-message" role="status">
          {message}
        </span>
      ) : null}
    </div>
  );
}
