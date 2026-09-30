"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      className="outline-button"
      onClick={logout}
      type="button"
      disabled={isSubmitting}
      aria-busy={isSubmitting}
    >
      {isSubmitting ? "ログアウト中…" : "ログアウト"}
    </button>
  );
}