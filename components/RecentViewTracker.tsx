"use client";

import { useEffect } from "react";

const STORAGE_KEY = "hiroshima-tennis-db-recent-v1";
const MAX_ITEMS = 10;

type RecentTournament = {
  id: string;
  name: string;
  date: string;
  city: string;
  venue: string;
  eventType: string;
  level: string;
  viewedAt: string;
};

type RecentViewTrackerProps = {
  id: string;
  name: string;
  date: string;
  city: string;
  venue: string;
  eventType: string;
  level: string;
};

export function RecentViewTracker({
  id,
  name,
  date,
  city,
  venue,
  eventType,
  level,
}: RecentViewTrackerProps) {
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(
        STORAGE_KEY
      );

      const current: RecentTournament[] = raw
        ? JSON.parse(raw)
        : [];

      const nextItem: RecentTournament = {
        id,
        name,
        date,
        city,
        venue,
        eventType,
        level,
        viewedAt: new Date().toISOString(),
      };

      const filtered = current.filter(
        (item) => item.id !== id
      );

      const next = [
        nextItem,
        ...filtered,
      ].slice(0, MAX_ITEMS);

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next)
      );
    } catch {
      // localStorageが利用できない環境では何もしない
    }
  }, [
    id,
    name,
    date,
    city,
    venue,
    eventType,
    level,
  ]);

  return null;
}