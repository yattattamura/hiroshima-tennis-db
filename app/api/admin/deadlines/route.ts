import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const action = body?.action;
  const candidateId = String(body?.candidateId ?? "");

  if (!candidateId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: candidate, error: candidateError } = await supabase
    .from("deadline_candidates")
    .select("id,tournament_id,candidate_date,candidate_text,status")
    .eq("id", candidateId)
    .maybeSingle();

  if (candidateError || !candidate) {
    return NextResponse.json(
      { error: candidateError?.message ?? "候補が見つかりません" },
      { status: 404 }
    );
  }

  if (action === "approve") {
    if (!candidate.candidate_date) {
      return NextResponse.json(
        { error: "日付候補がありません" },
        { status: 400 }
      );
    }

    const deadlineText =
      candidate.candidate_text ??
      String(candidate.candidate_date).replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$1年$2月$3日");

    const { error: updateError } = await supabase
      .from("tournaments")
      .update({
        deadline_date: candidate.candidate_date,
        deadline_text: deadlineText,
        data_quality_note: "公式サイトから自動検出した締切候補を管理者が確認",
        updated_at: new Date().toISOString(),
      })
      .eq("id", candidate.tournament_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  const { error: candidateUpdateError } = await supabase
    .from("deadline_candidates")
    .update({
      status: action === "approve" ? "approved" : "rejected",
      reviewed_at: new Date().toISOString(),
      reviewer_user_id: user.id,
    })
    .eq("id", candidate.id);

  if (candidateUpdateError) {
    return NextResponse.json(
      { error: candidateUpdateError.message },
      { status: 500 }
    );
  }

  revalidatePath("/admin/deadlines");
  revalidatePath("/tournaments");
  revalidatePath(`/tournaments/${candidate.tournament_id}`);

  return NextResponse.json({ ok: true });
}
