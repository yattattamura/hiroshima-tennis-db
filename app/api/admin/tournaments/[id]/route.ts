import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const ALLOWED_FIELDS = [
  "name",
  "city",
  "venue_name_raw",
  "date_text",
  "start_date",
  "event_type",
  "gender",
  "level",
  "eligibility",
  "fee_text",
  "deadline_text",
  "deadline_date",
  "application_method",
  "official_url",
  "status",
  "notes",
  "last_checked_at",
  "data_quality_note",
] as const;

function textOrNull(
  value: FormDataEntryValue | null
): string | null {
  const valueText = value?.toString().trim() ?? "";
  return valueText || null;
}

function validDateOrNull(
  value: FormDataEntryValue | null
): string | null {
  const valueText = value?.toString().trim() ?? "";

  if (!valueText) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(valueText)) {
    return null;
  }

  const date = new Date(`${valueText}T00:00:00Z`);

  return Number.isNaN(date.getTime())
    ? null
    : valueText;
}

function validUrlOrNull(
  value: FormDataEntryValue | null
): string | null {
  const valueText = value?.toString().trim() ?? "";

  if (!valueText) {
    return null;
  }

  try {
    const url = new URL(valueText);

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return null;
    }

    return valueText;
  } catch {
    return null;
  }
}

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await params;

  if (!id) {
    return new NextResponse(
      "大会IDが指定されていません。",
      { status: 400 }
    );
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

  const { data: adminUser, error: adminError } =
    await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (adminError) {
    return new NextResponse(
      adminError.message,
      { status: 500 }
    );
  }

  if (!adminUser) {
    return new NextResponse(
      "権限がありません。",
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const payload: Record<string, string | null> = {};

  for (const field of ALLOWED_FIELDS) {
    payload[field] = textOrNull(
      formData.get(field)
    );
  }

  if (!payload.name) {
    return new NextResponse(
      "大会名は必須です。",
      { status: 400 }
    );
  }

  if (payload.start_date) {
    const startDate = validDateOrNull(
      formData.get("start_date")
    );

    if (!startDate) {
      return new NextResponse(
        "開催日の形式が不正です。",
        { status: 400 }
      );
    }

    payload.start_date = startDate;
  }

  if (payload.deadline_date) {
    const deadlineDate = validDateOrNull(
      formData.get("deadline_date")
    );

    if (!deadlineDate) {
      return new NextResponse(
        "申込締切日の形式が不正です。",
        { status: 400 }
      );
    }

    payload.deadline_date = deadlineDate;
  }

  if (payload.last_checked_at) {
    const checkedDate = validDateOrNull(
      formData.get("last_checked_at")
    );

    if (!checkedDate) {
      return new NextResponse(
        "最終確認日の形式が不正です。",
        { status: 400 }
      );
    }

    payload.last_checked_at =
      `${checkedDate}T00:00:00+09:00`;
  }

  if (payload.official_url) {
    const officialUrl = validUrlOrNull(
      formData.get("official_url")
    );

    if (!officialUrl) {
      return new NextResponse(
        "公式URLの形式が不正です。",
        { status: 400 }
      );
    }

    payload.official_url = officialUrl;
  }

  const { error } = await supabase.rpc(
    "update_tournament_as_admin",
    {
      p_tournament_id: id,
      p_data: payload,
    }
  );

  if (error) {
    return new NextResponse(
      `保存に失敗しました: ${error.message}`,
      { status: 500 }
    );
  }

  return NextResponse.redirect(
    new URL(
      `/admin/tournaments/${id}/edit?saved=1`,
      request.url
    )
  );
}
