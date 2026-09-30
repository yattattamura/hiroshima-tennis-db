"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function UpdatePasswordForm() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!data.user) {
        router.replace("/auth/login");
        return;
      }

      setIsCheckingSession(false);
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    if (newPassword.length < 8) {
      setError("新しいパスワードは8文字以上で入力してください。");
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("新しいパスワードが一致しません。");
      setIsSubmitting(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    setMessage("パスワードを変更しました。アカウントページへ移動します。");
    setIsSubmitting(false);

    window.setTimeout(() => {
      router.replace("/account");
      router.refresh();
    }, 1200);
  }

  if (isCheckingSession) {
    return (
      <section className="card auth-card">
        <p className="muted">認証情報を確認しています…</p>
      </section>
    );
  }

  return (
    <section className="card auth-card">
      <div className="auth-card-heading">
        <span className="badge green">パスワード再設定</span>
        <h1>新しいパスワードを設定</h1>
        <p className="muted">8文字以上の新しいパスワードを設定してください。</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
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

        <button className="primary" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? (<> <span className="loading-spinner" aria-hidden="true" /> 変更中… </>) : "パスワードを変更"}
        </button>
      </form>

      <div className="auth-card-footer">
        <p>
          <Link href="/account">アカウントページに戻る</Link>
        </p>
      </div>
    </section>
  );
}
