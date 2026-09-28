import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth/login?next=/account");
  }

  return (
    <div className="detail-page auth-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          <span aria-hidden="true">›</span>
          <span>アカウント</span>
        </div>

        <section className="card account-card">
          <span className="badge green">ログイン中</span>
          <h1>アカウント</h1>
          <p className="muted">
            {data.user.email}
          </p>

          <div className="account-actions">
            <Link
              className="primary"
              href="/tournaments"
            >
              大会を探す
            </Link>
            <LogoutButton />
          </div>

          <div className="account-note">
            <strong>みんなで大会情報を育てよう</strong>
            <p className="muted">
              大会情報に誤りを見つけたら、各大会の「修正を依頼」から報告できます。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
