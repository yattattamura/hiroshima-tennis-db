"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const COOKIE_NAME = "htdb_favorites";
const MAX_FAVORITES = 100;
const supabase = createClient();

function readFavorites(): string[] {
  if (typeof document === "undefined") return [];

  const entry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(COOKIE_NAME + "="));

  if (!entry) return [];

  try {
    const parsed = JSON.parse(
      decodeURIComponent(entry.slice(COOKIE_NAME.length + 1))
    );
    return Array.isArray(parsed)
      ? parsed
          .filter((id): id is string => typeof id === "string")
          .slice(0, MAX_FAVORITES)
      : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]) {
  document.cookie =
    COOKIE_NAME +
    "=" +
    encodeURIComponent(JSON.stringify(ids.slice(0, MAX_FAVORITES))) +
    "; Path=/; Max-Age=31536000; SameSite=Lax";
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function sync() {
      const cookieFavorites = readFavorites();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setIsLoggedIn(false);
        setIsFavorite(cookieFavorites.includes(tournamentId));
        setIsReady(true);
        return;
      }

      setIsLoggedIn(true);

      const { data, error } = await supabase
        .from("user_favorites")
        .select("tournament_id")
        .eq("user_id", user.id);

      if (!mounted) return;

      if (error) {
        setIsFavorite(false);
        setIsReady(true);
        return;
      }

      const databaseFavorites = (data ?? [])
        .map((row) => row.tournament_id)
        .filter((id): id is string => typeof id === "string");

      const merged = Array.from(
        new Set([...databaseFavorites, ...cookieFavorites])
      ).slice(0, MAX_FAVORITES);

      const missing = merged.filter(
        (id) => !databaseFavorites.includes(id)
      );

      if (missing.length > 0) {
        await supabase.from("user_favorites").upsert(
          missing.map((id) => ({
            user_id: user.id,
            tournament_id: id,
          })),
          { onConflict: "user_id,tournament_id" }
        );
      }

      if (mounted) {
        setIsFavorite(merged.includes(tournamentId));
        setIsReady(true);
      }
    }

    void sync();

    const handleChange = () => {
      void sync();
    };

    window.addEventListener("favorites-changed", handleChange);
    return () => {
      mounted = false;
      window.removeEventListener("favorites-changed", handleChange);
    };
  }, [tournamentId]);

  async function toggleFavorite() {
    if (!isReady) return;

    if (!isLoggedIn) {
      const favorites = readFavorites();
      const next = favorites.includes(tournamentId)
        ? favorites.filter((id) => id !== tournamentId)
        : [tournamentId, ...favorites];
      writeFavorites(next);
      setIsFavorite(next.includes(tournamentId));
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoggedIn(false);
      return;
    }

    if (isFavorite) {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("tournament_id", tournamentId);

      if (!error) setIsFavorite(false);
      return;
    }

    const { error } = await supabase.from("user_favorites").insert({
      user_id: user.id,
      tournament_id: tournamentId,
    });

    if (!error) setIsFavorite(true);
  }

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
