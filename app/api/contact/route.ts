import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const CATEGORIES = new Set([
  "大会情報の掲載依頼",
  "掲載情報の訂正・削除",
  "サイトの不具合",
  "その他",
]);

export async function POST(request: Request) {
  const formData = await request.formData();

  const category =
    formData.get("category")?.toString().trim() ?? "";
  const name =
    formData.get("name")?.toString().trim() ?? "";
  const email =
    formData.get("email")?.toString().trim() ?? "";
  const message =
    formData.get("message")?.toString().trim() ?? "";
  const honeypot =
    formData.get("website")?.toString().trim() ?? "";

  if (honeypot) {
    return NextResponse.redirect(
      new URL("/contact/complete", request.url)
    );
  }

  if (!CATEGORIES.has(category)) {
    return new NextResponse(
      "お問い合わせ種別が不正です。",
      { status: 400 }
    );
  }

  if (!message) {
    return new NextResponse(
      "お問い合わせ内容を入力してください。",
      { status: 400 }
    );
  }

  if (message.length > 5000) {
    return new NextResponse(
      "お問い合わせ内容が長すぎます。",
      { status: 400 }
    );
  }

  if (name.length > 100) {
    return new NextResponse(
      "お名前が長すぎます。",
      { status: 400 }
    );
  }

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return new NextResponse(
      "メールアドレスの形式が不正です。",
      { status: 400 }
    );
  }

  if (email.length > 254) {
    return new NextResponse(
      "メールアドレスが長すぎます。",
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("contact_messages")
    .insert({
      category,
      name: name || null,
      email: email || null,
      message,
    });

  if (error) {
    return new NextResponse(
      `お問い合わせの保存に失敗しました: ${error.message}`,
      { status: 500 }
    );
  }

  return NextResponse.redirect(
    new URL(
      "/contact/complete",
      request.url
    )
  );
}
