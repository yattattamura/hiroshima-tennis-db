"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type SavedSearch = {
  id: string;
  name: string;
  filters: Record<string, string>;
};

function buildUrl(filters: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? "/tournaments?" + query : "/tournaments";
}

export function SavedSearchList({
  initialItems,
}: {
  initialItems: SavedSearch[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function remove(id: string) {
    if (removingId) return;
    setRemovingId(id);
    const { error } = await supabase
      .from("saved_searches")
      .delete()
      .eq("id", id);

    if (!error) {
      setItems((current) =>
        current.filter((item) => item.id !== id)
      );
      router.refresh();
    }
    setRemovingId(null);
  }

  if (items.length === 0) {
    return (
      <p className="muted">
        まだ保存した検索条件はありません。
      </p>
    );
  }

  return (
    <div className="account-list">
      {items.map((item) => (
        <div className="account-list-row" key={item.id}>
          <div>
            <strong>{item.name}</strong>
            <div className="muted account-list-detail">
              {Object.values(item.filters).join("・") || "条件なし"}
            </div>
          </div>

          <div className="account-list-actions">
            <Link className="outline-button" href={buildUrl(item.filters)}>
              検索
            </Link>
            <button
              className="link-button"
              type="button"
              onClick={() => void remove(item.id)}
              disabled={removingId === item.id}
              aria-busy={removingId === item.id}
            >
              {removingId === item.id ? "削除中…" : "削除"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
