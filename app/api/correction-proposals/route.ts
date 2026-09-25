import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();

  const tournamentId = formData.get("tournamentId")?.toString();
  const fieldName = formData.get("fieldName")?.toString();
  const currentValue = formData.get("currentValue")?.toString() ?? "";
  const proposedValue = formData.get("proposedValue")?.toString();
  const reason = formData.get("reason")?.toString() ?? "";
  const sourceUrl = formData.get("sourceUrl")?.toString() ?? "";

  if (!tournamentId || !fieldName || !proposedValue) {
    return new NextResponse("必須項目が入力されていません", {
      status: 400,
    });
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("correction_proposals")
    .insert({
      tournament_id: tournamentId,
      field_name: fieldName,
      current_value: currentValue,
      proposed_value: proposedValue,
      reason,
      source_url: sourceUrl,
    });

  if (error) {
    console.error(error);

    return new NextResponse(
      `修正提案の保存に失敗しました: ${error.message}`,
      {
        status: 500,
      }
    );
  }

  return NextResponse.redirect(
    new URL(`/tournaments/${tournamentId}/suggest/complete`, request.url)
  );
}