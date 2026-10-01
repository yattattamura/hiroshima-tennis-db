import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";
import { NotificationSettings } from "@/components/NotificationSettings";
import { PasswordChangeForm } from "@/components/PasswordChangeForm";
import { SavedSearchList } from "@/components/SavedSearchList";

function getJapanToday(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  return (
    (parts.find((part) => part.type === "year")?.value ?? "") +
    "-" +
    (parts.find((part) => part.type === "month")?.value ?? "") +
    "-" +
    (parts.find((part) => part.type === "day")?.value ?? "")
  );
}

function daysUntil(deadline: string, today: string): number | null {
  const a = today.split("-").map(Number);
  const b = deadline.split("-").map(Number);

  if (
    a.length !== 3 ||
    b.length !== 3 ||
    a.some(Number.isNaN) ||
    b.some(Number.isNaN)
  ) {
    return null;
  }

  return Math.round(
    (Date.UTC(b[0], b[1] - 1, b[2]) -
      Date.UTC(a[0], a[1] - 1, a[2])) /
      86400000
  );
}

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const today = getJapanToday();

  const [
    { data: favorites },
    { data: savedSearches },
    { data: follows },
    { data: settings },
    { data: proposals },
  ] = await Promise.all([
    supabase
      .from("user_favorites")
      .select("tournament_id")
      .eq("user_id", user.id),

    supabase
      .from("saved_searches")
      .select("id,name,filters,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("organizer_follows")
      .select("organizer_id")
      .eq("user_id", user.id),

    supabase
      .from("notification_settings")
      .select("deadline_enabled,deadline_days")
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("correction_proposals")
      .select(
        "id,tournament_id,field_name,proposed_value,status,created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const favoriteIds = (favorites ?? [])
    .map((row) => row.tournament_id)
    .filter((id): id is string => typeof id === "string");

  const { data: favoriteTournaments } =
    favoriteIds.length > 0
      ? await supabase
          .from("tournaments")
          .select(
            "id,name,date_text,deadline_date,city,venue_name_raw"
          )
          .in("id", favoriteIds)
      : { data: [] };

  const deadlineEnabled = settings?.deadline_enabled ?? true;
  const deadlineDays = settings?.deadline_days ?? 7;

  const deadlineAlerts = (favoriteTournaments ?? [])
    .map((tournament) => ({
      ...tournament,
      days: daysUntil(tournament.deadline_date ?? "", today),
    }))
    .filter(
      (tournament) =>
        deadlineEnabled &&
        tournament.days !== null &&
        tournament.days >= 0 &&
        tournament.days <= deadlineDays
    )
    .sort((a, b) => (a.days ?? 999) - (b.days ?? 999));

  const organizerIds = (follows ?? [])
    .map((row) => row.organizer_id)
    .filter((id): id is string => typeof id === "string");

  const { data: followedOrganizers } =
    organizerIds.length > 0
      ? await supabase
          .from("organizers")
          .select("id,name")
          .in("id", organizerIds)
      : { data: [] };

  const proposalIds = Array.from(
    new Set(
      (proposals ?? [])
        .map((row) => row.tournament_id)
        .filter((id): id is string => typeof id === "string")
    )
  );

  const { data: proposalTournaments } =
    proposalIds.length > 0
      ? await supabase
          .from("tournaments")
          .select("id,name")
          .in("id", proposalIds)
      : { data: [] };

  const proposalNames = new Map(
    (proposalTournaments ?? []).map((row) => [row.id, row.name])
  );

  const normalizedSavedSearches = (savedSearches ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    filters:
      row.filters &&
      typeof row.filters === "object" &&
      !Array.isArray(row.filters)
        ? Object.fromEntries(
            Object.entries(row.filters as Record<string, unknown>).filter(
              ([, value]) => typeof value === "string"
            ) as Array<[string, string]>
          )
        : {},
  }));

  return (
    <div className="detail-page account-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          <span aria-hidden="true">›</span>
          <span>マイページ</span>
        </div>

        <section className="card account-hero-card">
          <div>
            <span className="badge green">ログイン中</span>
            <h1>マイページ</h1>
            <p className="muted">{user.email}</p>
          </div>
          <div className="account-hero-actions">
            {adminUser ? (
              <Link className="outline-button" href="/admin/deadlines">
                締切メンテナンス
              </Link>
            ) : null}
            <LogoutButton />
          </div>
        </section>

        <section className="account-dashboard-grid">
          <article className="card account-dashboard-card">
            <div className="account-section-heading">
              <div>
                <h2>お気に入り</h2>
                <p className="muted">{favoriteIds.length}件</p>
              </div>
              <Link href="/favorites" className="section-link">
                一覧を見る →
              </Link>
            </div>
            {favoriteTournaments?.length ? (
              <div className="account-list">
                {favoriteTournaments.slice(0, 5).map((tournament) => (
                  <Link
                    key={tournament.id}
                    href={"/tournaments/" + tournament.id}
                    className="account-list-row account-list-link"
                  >
                    <div>
                      <strong>{tournament.name}</strong>
                      <div className="muted account-list-detail">
                        {tournament.date_text ?? "日程未設定"}
                        {" ・ "}
                        {tournament.city ?? "エリア未設定"}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="muted">
                気になる大会をお気に入りに追加すると、ここで管理できます。
              </p>
            )}
          </article>

          <article className="card account-dashboard-card">
            <div className="account-section-heading">
              <div>
                <h2>締切通知</h2>
                <p className="muted">
                  お気に入り大会の締切をお知らせします。
                </p>
              </div>
            </div>
            {deadlineAlerts.length ? (
              <div className="account-list">
                {deadlineAlerts.slice(0, 5).map((tournament) => (
                  <Link
                    key={tournament.id}
                    href={"/tournaments/" + tournament.id}
                    className="account-list-row account-list-link"
                  >
                    <div>
                      <strong>{tournament.name}</strong>
                      <div className="muted account-list-detail">
                        {tournament.deadline_date}
                      </div>
                    </div>
                    <span className="badge deadline-badge">
                      {tournament.days === 0
                        ? "今日締切"
                        : "あと" + tournament.days + "日"}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="muted">
                現在、設定期間内に締切を迎えるお気に入り大会はありません。
              </p>
            )}
          </article>

          <article className="card account-dashboard-card">
            <div className="account-section-heading">
              <div>
                <h2>保存した検索条件</h2>
                <p className="muted">{normalizedSavedSearches.length}件</p>
              </div>
              <Link href="/tournaments" className="section-link">
                大会検索 →
              </Link>
            </div>
            <SavedSearchList initialItems={normalizedSavedSearches} />
          </article>

          <article className="card account-dashboard-card">
            <div className="account-section-heading">
              <div>
                <h2>フォロー中の主催者</h2>
                <p className="muted">{followedOrganizers?.length ?? 0}件</p>
              </div>
            </div>
            {followedOrganizers?.length ? (
              <div className="account-list">
                {followedOrganizers.map((organizer) => (
                  <Link
                    key={organizer.id}
                    href={"/organizers/" + organizer.id}
                    className="account-list-row account-list-link"
                  >
                    <strong>{organizer.name}</strong>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="muted">
                主催者ページから気になる主催者をフォローできます。
              </p>
            )}
          </article>

          <article className="card account-dashboard-card">
            <div className="account-section-heading">
              <div>
                <h2>修正依頼の履歴</h2>
                <p className="muted">
                  送信した修正提案を確認できます。
                </p>
              </div>
            </div>
            {proposals?.length ? (
              <div className="account-list">
                {proposals.map((proposal) => (
                  <div className="account-list-row" key={proposal.id}>
                    <div>
                      <strong>
                        {proposalNames.get(proposal.tournament_id) ?? "大会"}
                      </strong>
                      <div className="muted account-list-detail">
                        {proposal.field_name}
                        {" ・ "}
                        {new Date(
                          proposal.created_at
                        ).toLocaleDateString("ja-JP")}
                      </div>
                    </div>
                    <span className="badge">
                      {proposal.status === "approved"
                        ? "承認"
                        : proposal.status === "rejected"
                          ? "却下"
                          : "確認中"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">まだ修正依頼はありません。</p>
            )}
          </article>

          <article className="card account-dashboard-card">
            <div className="account-section-heading">
              <h2>通知設定</h2>
            </div>
            <NotificationSettings
              initialEnabled={deadlineEnabled}
              initialDays={deadlineDays}
            />
          </article>

          <article className="card account-dashboard-card">
            <div className="account-section-heading">
              <div>
                <h2>パスワード変更</h2>
                <p className="muted">
                  現在のパスワードを確認して変更します。
                </p>
              </div>
            </div>
            <PasswordChangeForm />
          </article>
        </section>

      </div>
    </div>
  );
}
