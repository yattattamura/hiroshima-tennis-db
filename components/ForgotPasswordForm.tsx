"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/site";

function getJapaneseAuthError(error: { message?: string; status?: number; code?: string }): string {
  const message = (error.message ?? "").toLowerCase();
  const code = (error.code ?? "").toLowerCase();

  if (message.includes("email rate limit exceeded") || code === "over_email_send_rate_limit") {
    return "メール送信の上限に達しました。しばらく時間をおいてから、もう一度お試しください。";
  }
  if (message.includes("security purposes") && message.includes("seconds")) {
    return "安全のため、再設定メールの送信間隔に制限があります。しばらく待ってから、もう一度お試しください。";
  }
  if (error.status === 429 || code === "over_request_rate_limit") {
    return "操作が短時間に集中しています。しばらく時間をおいてから、もう一度お試しください。";
  }
  if (message.includes("invalid email") || message.includes("email address") && message.includes("invalid")) {
    return "メールアドレスの形式を確認してください。";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "通信に失敗しました。通信環境を確認して、もう一度お試しください。";
  }
  return "再設定メールを送信できませんでした。時間をおいてから、もう一度お試しください。";
}

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

    try {
      const supabase = createClient();
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo:
            SITE_URL +
            "/auth/callback?next=" +
            encodeURIComponent("/auth/update-password"),
        });

      if (resetError) {
        setError(getJapaneseAuthError(resetError));
        setIsSubmitting(false);
        return;
      }
    } catch (requestError) {
      setError(
        getJapaneseAuthError(
          requestError instanceof Error
            ? { message: requestError.message }
            : {}
        )
      );
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

        <button className="primary" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? (<> <span className="loading-spinner" aria-hidden="true" /> 送信中… </>) : "再設定メールを送信"}
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
