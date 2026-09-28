"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function NotificationSettings({
  initialEnabled,
  initialDays,
}: {
  initialEnabled: boolean;
  initialDays: number;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [days, setDays] = useState(initialDays);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save(nextEnabled: boolean, nextDays: number) {
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

    const { error } = await supabase
      .from("notification_settings")
      .upsert(
        {
          user_id: user.id,
          deadline_enabled: nextEnabled,
          deadline_days: nextDays,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      setMessage("設定を保存できませんでした。");
    } else {
      setEnabled(nextEnabled);
      setDays(nextDays);
      setMessage("保存しました。");
    }

    setSaving(false);
  }

  return (
    <div className="notification-settings">
      <label className="notification-toggle">
        <input
          type="checkbox"
          checked={enabled}
          disabled={saving}
          onChange={(event) =>
            void save(event.target.checked, days)
          }
        />
        <span>
          お気に入り大会の締切通知を表示する
        </span>
      </label>

      <label className="notification-days">
        <span>何日前から表示</span>
        <select
          value={String(days)}
          disabled={!enabled || saving}
          onChange={(event) =>
            void save(enabled, Number(event.target.value))
          }
        >
          <option value="1">1日前</option>
          <option value="3">3日前</option>
          <option value="7">7日前</option>
          <option value="14">14日前</option>
          <option value="30">30日前</option>
        </select>
      </label>

      {message ? (
        <span className="save-search-message" role="status">
          {message}
        </span>
      ) : null}
    </div>
  );
}
