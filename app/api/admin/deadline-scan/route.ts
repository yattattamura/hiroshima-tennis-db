import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { fetchAndDetectDeadline } from "@/lib/deadlineDetector";

export const dynamic = "force-dynamic";

async function getAdminSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, admin: false };

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return { user, admin: Boolean(admin) };
}

function authorizedByCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: Request) {
  const cronAuthorized = authorizedByCron(request);

  // Cron requests are already authenticated by CRON_SECRET.
  // Manual scans still require an authenticated admin.
  if (!cronAuthorized) {
    const session = await getAdminSession();
    if (!session.admin) {
      return NextResponse.json(
        { error: session.user ? "Forbidden" : "Unauthorized" },
        { status: session.user ? 403 : 401 }
      );
    }
  }

  // Use the service-role client for the scan itself. This avoids RLS blocking
  // the maintenance job while keeping the service key server-side only.
  const supabase = getServiceRoleClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured" },
      { status: 500 }
    );
  }

  const { data: tournaments, error } = await supabase
    .from("tournaments")
    .select("id,name,start_date,official_url,deadline_date")
    .is("deadline_date", null)
    .not("official_url", "is", null)
    .order("last_checked_at", { ascending: true, nullsFirst: true })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let detected = 0;
  const errors: Array<{ tournamentId: string; name: string; error: string }> = [];

  const results = await Promise.all(
    (tournaments ?? []).map(async (tournament) => {
      const fallbackYear = tournament.start_date
        ? Number(String(tournament.start_date).slice(0, 4))
        : new Date().getFullYear();

      try {
        const result = await fetchAndDetectDeadline(
          tournament.official_url as string,
          fallbackYear,
          tournament.start_date
        );

        const { error: candidateError } = await supabase
          .from("deadline_candidates")
          .upsert(
            {
              tournament_id: tournament.id,
              candidate_date: result.date,
              candidate_text: result.text,
              source_url: tournament.official_url,
              source_excerpt: result.excerpt,
              confidence: result.confidence,
              status: result.date ? "pending" : "rejected",
              scanned_at: new Date().toISOString(),
              reviewed_at: null,
              reviewer_user_id: null,
            },
            { onConflict: "tournament_id" }
          );

        if (candidateError) throw candidateError;

        if (result.date) detected += 1;

        return { ok: true };
      } catch (scanError) {
        const message =
          scanError instanceof Error ? scanError.message : String(scanError);

        errors.push({
          tournamentId: tournament.id,
          name: tournament.name,
          error: message,
        });

        return { ok: false };
      } finally {
        await supabase
          .from("tournaments")
          .update({ last_checked_at: new Date().toISOString() })
          .eq("id", tournament.id);
      }
    })
  );

  return NextResponse.json({
    scanned: tournaments?.length ?? 0,
    detected,
    failed: results.filter((result) => !result.ok).length,
    errors,
    message:
      (tournaments?.length ?? 0) === 0
        ? "対象大会はありません"
        : "締切候補の検出が完了しました",
  });
}

export async function GET(request: Request) {
  return POST(request);
}
