import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  // MVPでは保存せず、送信成功だけを返します。
  // 次段階でSupabaseのchange_proposalsテーブルへ保存します。
  return NextResponse.json({
    ok: true,
    tournamentId: form.get("tournamentId"),
    message: "修正提案を受け付けました（MVPモック）",
  });
}
