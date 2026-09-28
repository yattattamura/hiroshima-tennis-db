"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "signup";
  nextPath?: string;
};

export function AuthForm({ mode, nextPath = "/account" }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    if (!email.trim() || password.length < 8) {
      setError("メールアドレスと8文字以上のパスワードを入力してください。");
      setIsSubmitting(false);
      return;
    }

    if (isSignup) {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo:
            window.location.origin +
            "/auth/callback?next=" +
            encodeURIComponent(nextPath),
        },
      });

      if (signupError) {
        setError(signupError.message);
        setIsSubmitting(false);
        return;
      }

      if (data.session) {
        router.replace(nextPath);
        router.refresh();
        return;
      }

      setMessage(
        "確認メールを送信しました。メール内のリンクから登録を完了してください。"
      );
      setIsSubmitting(false);
      return;
    }

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError) {
      setError(
        loginError.message === "Invalid login credentials"
          ? "メールアドレスまたはパスワードが違います。"
          : loginError.message
      );
      setIsSubmitting(false);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <section className="card auth-card">
      <div className="auth-card-heading">
        <span className="badge green">
          {isSignup ? "無料アカウント" : "アカウント"}
        </span>

        <h1>
          {isSignup ? "アカウントを作成" : "ログイン"}
        </h1>

        <p className="muted">
          {isSignup
            ? "アカウントを作成すると、大会情報の修正依頼に参加できます。"
            : "ログインすると、大会情報の修正依頼を送信できます。"}
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

        <label>
          <span>パスワード</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={8}
            required
          />
          {isSignup ? (
            <small className="muted">8文字以上</small>
          ) : null}
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

        <button
          className="primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "処理中…"
            : isSignup
              ? "アカウントを作成"
              : "ログイン"}
        </button>
      </form>

      <div className="auth-card-footer">
        {isSignup ? (
          <p>
            すでにアカウントをお持ちですか？{" "}
            <Link href={"/auth/login?next=" + encodeURIComponent(nextPath)}>
              ログイン
            </Link>
          </p>
        ) : (
          <p>
            アカウントをお持ちでない方は{" "}
            <Link href={"/auth/signup?next=" + encodeURIComponent(nextPath)}>
              無料で作成
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
