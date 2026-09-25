"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("メールアドレスまたはパスワードが正しくありません。");
      return;
    }

    router.push("/admin/corrections");
    router.refresh();
  };

  return (
    <div className="detail-page">
      <div className="container">
        <div
          className="card"
          style={{
            maxWidth: 500,
            margin: "40px auto",
            padding: 30,
          }}
        >
          <h1>管理者ログイン</h1>

          <form
            onSubmit={submit}
            style={{
              display: "grid",
              gap: 18,
              marginTop: 24,
            }}
          >
            <label>
              <span>メールアドレス</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </label>

            <label>
              <span>パスワード</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </label>

            {error && (
              <p style={{ color: "crimson" }}>
                {error}
              </p>
            )}

            <button className="primary" type="submit">
              ログイン
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}