"use client";

import { useEffect, useState } from "react";

const COOKIE_NAME = "htdb_favorites";
const MAX_FAVORITES = 100;

function readFavorites(): string[] {
  if (typeof document === "undefined") {
    return [];
  }

  const entry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));

  if (!entry) {
    return [];
  }

  try {
    const value = decodeURIComponent(entry.slice(COOKIE_NAME.length + 1));
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((id): id is string => typeof id === "string").slice(0, MAX_FAVORITES);
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]) {
  const value = encodeURIComponent(JSON.stringify(ids.slice(0, MAX_FAVORITES)));

  document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;

  window.dispatchEvent(new Event("favorites-changed"));
}

export function FavoriteButton({
  tournamentId,
  compact = false,
}: {
  tournamentId: string;
  compact?: boolean;
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIsFavorite(readFavorites().includes(tournamentId));
      setIsReady(true);
    };

    sync();
    window.addEventListener("favorites-changed", sync);

    return () => {
      window.removeEventListener("favorites-changed", sync);
    };
  }, [tournamentId]);

  const toggleFavorite = () => {
    const favorites = readFavorites();

    const next = favorites.includes(tournamentId)
      ? favorites.filter((id) => id !== tournamentId)
      : [tournamentId, ...favorites];

    writeFavorites(next);
    setIsFavorite(next.includes(tournamentId));
  };

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={!isReady}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: compact ? 0 : 6,
        minHeight: compact ? 36 : 38,
        minWidth: compact ? 36 : undefined,
        padding: compact ? "7px" : "8px 12px",
        border: "1px solid var(--border)",
        borderRadius: 8,
        background: isFavorite ? "#fff8df" : "#fff",
        color: isFavorite ? "#9a6b00" : "var(--text)",
        cursor: isReady ? "pointer" : "default",
        fontWeight: 700,
        fontSize: 13,
      }}
    >
      <span aria-hidden="true">{isFavorite ? "★" : "☆"}</span>
      {!compact && (isFavorite ? "お気に入り済み" : "お気に入り")}
    </button>
  );
}
