import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const ALLOWED_FIELDS = new Set([
  "開催日・予備日",
  "会場",
  "参加資格",
  "申込締切",
  "参加費",
  "その他",
]);

export async function POST(request: Request) {
  const formData = await request.formData();

  const tournamentId = formData.get("tournamentId")?.toString().trim();
  const fieldName = formData.get("fieldName")?.toString().trim();
  const currentValue = formData.get("currentValue")?.toString() ?? "";
  const proposedValue = formData.get("proposedValue")?.toString().trim();
  const reason = formData.get("reason")?.toString().trim() ?? "";
  const sourceUrl = formData.get("sourceUrl")?.toString().trim() ?? "";

  if (!tournamentId || !fieldName || !proposedValue) {
    return new NextResponse("必須項目が入力されていません", {
      status: 400,
    });
  }

  if (!ALLOWED_FIELDS.has(fieldName)) {
    return new NextResponse("修正項目が正しくありません", {
      status: 400,
    });
  }

  if (
    sourceUrl &&
    !/^https?:\/\//i.test(sourceUrl)
  ) {
    return new NextResponse("参考URLの形式が正しくありません", {
      status: 400,
    });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL(
        "/auth/login?next=" +
          encodeURIComponent(
            "/tournaments/" + tournamentId + "/suggest"
          ),
        request.url
      )
    );
  }

  const { data: tournament, error: tournamentError } =
    await supabase
      .from("tournaments")
      .select("id")
      .eq("id", tournamentId)
      .single();

  if (tournamentError || !tournament) {
    return new NextResponse("対象の大会が見つかりません", {
      status: 404,
    });
  }

  const { error } = await supabase
    .from("correction_proposals")
    .insert({
      user_id: user.id,
      tournament_id: tournamentId,
      field_name: fieldName,
      current_value: currentValue,
      proposed_value: proposedValue,
      reason,
      source_url: sourceUrl || null,
    });

  if (error) {
    console.error(error);

    return new NextResponse(
      "修正提案の保存に失敗しました。",
      {
        status: 500,
      }
    );
  }

  return NextResponse.redirect(
    new URL(
      "/tournaments/" + tournamentId + "/suggest/complete",
      request.url
    )
  );
}
