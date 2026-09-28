"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type SavedSearchFilters = {
  keyword?: string;
  period?: string;
  city?: string;
  eventType?: string;
  gender?: string;
  level?: string;
  eligibility?: string;
  deadline?: string;
  status?: string;
};

function cleanFilters(filters: SavedSearchFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) =>
        typeof value === "string" &&
        value.trim() !== "" &&
        value !== "all"
    )
  );
}

function buildSearchUrl(filters: SavedSearchFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(cleanFilters(filters))) {
    if (typeof value === "string") {
      params.set(key, value);
    }
  }
  const query = params.toString();
  return query ? "/tournaments?" + query : "/tournaments";
}

export function SaveSearchButton({
  filters,
}: {
  filters: SavedSearchFilters;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveSearch() {
    setMessage("");
    setIsSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(
        "/auth/login?next=" +
          encodeURIComponent(buildSearchUrl(filters))
      );
      return;
    }

    const suggestedName =
      [filters.city, filters.level, filters.eventType, filters.keyword]
        .filter(Boolean)
        .join("・") || "大会検索条件";

    const name = window
      .prompt(
        "保存する検索条件の名前を入力してください。",
        suggestedName
      )
      ?.trim();

    if (!name) {
      setIsSaving(false);
      return;
    }

    const { error } = await supabase.from("saved_searches").insert({
      user_id: user.id,
      name: name.slice(0, 80),
      filters: cleanFilters(filters),
    });

    if (error) {
      setMessage("保存できませんでした。");
      setIsSaving(false);
      return;
    }

    setMessage("検索条件を保存しました。");
    setIsSaving(false);
    router.refresh();
  }

  return (
    <div className="save-search-control">
      <button
        type="button"
        className="outline-button"
        onClick={saveSearch}
        disabled={isSaving}
      >
        {isSaving ? "保存中…" : "☆ 検索条件を保存"}
      </button>

      {message ? (
        <span className="save-search-message" role="status">
          {message}
        </span>
      ) : null}
    </div>
  );
}
