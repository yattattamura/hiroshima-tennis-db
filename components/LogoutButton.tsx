"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      className="outline-button"
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      aria-busy={isSubmitting}
    >
      {isSubmitting ? (<> <span className="loading-spinner" aria-hidden="true" /> ログアウト中… </>) : "ログアウト"}
    </button>
  );
}
