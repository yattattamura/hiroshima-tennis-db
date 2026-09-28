"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("メールアドレスを入力してください。");
      setIsSubmitting(false);
      return;
    }

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo:
          window.location.origin +
          "/auth/callback?next=" +
          encodeURIComponent("/auth/update-password"),
      });

    if (resetError) {
      setError(resetError.message);
      setIsSubmitting(false);
      return;
    }

    setMessage(
      "パスワード再設定メールを送信しました。メール内のリンクから新しいパスワードを設定してください。"
    );
    setIsSubmitting(false);
  }

  return (
    <section className="card auth-card">
      <div className="auth-card-heading">
        <span className="badge green">パスワード再設定</span>
        <h1>パスワードを忘れた方</h1>
        <p className="muted">
          登録しているメールアドレスを入力すると、パスワード再設定用のリンクを送信します。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          <span>メールアドレス</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
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

        <button className="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "送信中…" : "再設定メールを送信"}
        </button>
      </form>

      <div className="auth-card-footer">
        <p>
          <Link href="/auth/login">ログインに戻る</Link>
        </p>
      </div>
    </section>
  );
}
