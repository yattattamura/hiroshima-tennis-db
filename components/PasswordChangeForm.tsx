"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (newPassword.length < 8) {
      setError("新しいパスワードは8文字以上にしてください。");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("新しいパスワードが一致しません。");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("ログイン状態を確認できませんでした。");
      setSaving(false);
      return;
    }

    const { error: updateError } =
      await supabase.auth.updateUser({
        password: newPassword,
        current_password: currentPassword,
      });

    if (updateError) {
      setError(
        updateError.message === "Invalid authentication credentials"
          ? "現在のパスワードが正しくありません。"
          : updateError.message
      );
      setSaving(false);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("パスワードを変更しました。");
    setSaving(false);
  }

  return (
    <form className="password-change-form" onSubmit={submit}>
      <label>
        <span>現在のパスワード</span>
        <input
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </label>

      <label>
        <span>新しいパスワード</span>
        <input
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
        <small className="muted">8文字以上</small>
      </label>

      <label>
        <span>新しいパスワード（確認）</span>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      {error ? (
        <p className="auth-message auth-error" role="alert">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="auth-message auth-success" role="status">
          {message}
        </p>
      ) : null}

      <button className="primary" type="submit" disabled={saving} aria-busy={saving}>
        {saving ? (<> <span className="loading-spinner" aria-hidden="true" /> 変更中… </>) : "パスワードを変更"}
      </button>
    </form>
  );
}
