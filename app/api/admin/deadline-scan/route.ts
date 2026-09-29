import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { fetchAndDetectDeadline } from "@/lib/deadlineDetector";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, admin: false };

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return { supabase, user, admin: Boolean(admin) };
}

function authorizedByCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  const cronAuthorized = authorizedByCron(request);
  const session = await isAdmin();

  if (!cronAuthorized && !session.admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = cronAuthorized
    ? createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
    : session.supabase;

  if (cronAuthorized && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
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
  let failed = 0;

  const results = await Promise.allSettled(
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

        await supabase
          .from("tournaments")
          .update({ last_checked_at: new Date().toISOString() })
          .eq("id", tournament.id);

        if (result.date) detected += 1;
      } catch (scanError) {
        failed += 1;
        await supabase
          .from("tournaments")
          .update({ last_checked_at: new Date().toISOString() })
          .eq("id", tournament.id);

        throw scanError;
      }
    })
  );

  for (const result of results) {
    if (result.status === "rejected") failed += 0;
  }

  return NextResponse.json({
    scanned: tournaments?.length ?? 0,
    detected,
    failed,
    message:
      (tournaments?.length ?? 0) === 0
        ? "対象大会はありません"
        : "締切候補の検出が完了しました",
  });
}

export async function GET(request: Request) {
  return POST(request);
}
