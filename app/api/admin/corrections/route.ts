import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();

  const proposalId = formData.get("proposalId")?.toString();
  const action = formData.get("action")?.toString();

  if (!proposalId || !action) {
    return new NextResponse("不正なリクエストです", {
      status: 400,
    });
  }

  if (action !== "approve" && action !== "reject") {
    return new NextResponse("不正な操作です", {
      status: 400,
    });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminUser) {
    return new NextResponse("権限がありません", {
      status: 403,
    });
  }

  const functionName =
    action === "approve"
      ? "approve_correction_proposal"
      : "reject_correction_proposal";

  const { error } = await supabase.rpc(functionName, {
    p_proposal_id: proposalId,
  });

  if (error) {
    return new NextResponse(error.message, {
      status: 500,
    });
  }

  return NextResponse.redirect(
    new URL("/admin/corrections", request.url)
  );
}