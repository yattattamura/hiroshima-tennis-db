"use client";

import { useState } from "react";

export function DeadlineMaintenance() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function scan() {
    setBusy(true);
    setMessage("公式サイトを確認中…");

    try {
      const response = await fetch("/api/admin/deadline-scan", {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error ?? "自動検出に失敗しました");
      }

      setMessage(
        `確認 ${result.scanned}件 / 候補検出 ${result.detected}件 / エラー ${result.failed}件`
      );
      window.location.reload();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "自動検出に失敗しました"
      );
    } finally {
      setBusy(false);
    }
  }

  async function updateCandidate(candidateId: string, action: "approve" | "reject") {
    setBusy(true);
    setMessage(action === "approve" ? "締切を反映中…" : "候補を却下中…");

    try {
      const response = await fetch("/api/admin/deadlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, action }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error ?? "更新に失敗しました");
      }

      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "更新に失敗しました");
      setBusy(false);
    }
  }

  useState(() => {
    const handler = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest<HTMLButtonElement>("button[data-deadline-action]");
      if (!button) return;

      const candidateId = button.dataset.candidateId;
      const action = button.dataset.deadlineAction as "approve" | "reject";
      if (candidateId && (action === "approve" || action === "reject")) {
        void updateCandidate(candidateId, action);
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  });

  return (
    <div className="deadline-maintenance-toolbar">
      <button className="primary" onClick={scan} disabled={busy}>
        {busy ? "処理中…" : "🔎 自動検出を実行"}
      </button>
      {message ? <span className="muted">{message}</span> : null}
    </div>
  );
}
