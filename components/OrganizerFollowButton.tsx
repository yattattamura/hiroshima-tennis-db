"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function OrganizerFollowButton({
  organizerId,
}: {
  organizerId: string;
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setReady(true);
        return;
      }

      setIsLoggedIn(true);

      const { data } = await supabase
        .from("organizer_follows")
        .select("organizer_id")
        .eq("user_id", user.id)
        .eq("organizer_id", organizerId)
        .maybeSingle();

      if (mounted) {
        setIsFollowing(Boolean(data));
        setReady(true);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [organizerId]);

  async function toggle() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (isFollowing) {
      const { error } = await supabase
        .from("organizer_follows")
        .delete()
        .eq("user_id", user.id)
        .eq("organizer_id", organizerId);

      if (!error) setIsFollowing(false);
      return;
    }

    const { error } = await supabase.from("organizer_follows").insert({
      user_id: user.id,
      organizer_id: organizerId,
    });

    if (!error) setIsFollowing(true);
  }

  if (!ready) {
    return (
      <button className="outline-button" disabled type="button">
        読み込み中…
      </button>
    );
  }

  if (!isLoggedIn) {
    return (
      <Link
        className="outline-button"
        href={
          "/auth/login?next=" +
          encodeURIComponent("/organizers/" + organizerId)
        }
      >
        ☆ フォローする
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={isFollowing ? "primary" : "outline-button"}
      onClick={toggle}
      aria-pressed={isFollowing}
    >
      {isFollowing ? "✓ フォロー中" : "☆ フォローする"}
    </button>
  );
}
