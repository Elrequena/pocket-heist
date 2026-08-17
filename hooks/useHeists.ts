"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useUser } from "./useUser";
import { COLLECTIONS, heistConverter } from "@/types/firestore";
import type { Heist } from "@/types/firestore";

export type HeistFilter = "active" | "assigned" | "expired";

export function useHeists(filter: HeistFilter) {
  const [heists, setHeists] = useState<Heist[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const needsUser = filter === "active" || filter === "assigned";

    if (needsUser && !user) {
      setHeists([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const now = Timestamp.now();
    const heistsRef = collection(db, COLLECTIONS.HEISTS).withConverter(
      heistConverter,
    );

    let q;
    switch (filter) {
      case "active":
        q = query(
          heistsRef,
          where("assignedTo", "==", user!.uid),
          where("deadline", ">", now),
        );
        break;
      case "assigned":
        q = query(
          heistsRef,
          where("createdBy", "==", user!.uid),
          where("deadline", ">", now),
        );
        break;
      case "expired":
        q = query(
          heistsRef,
          where("finalStatus", "!=", null),
          where("deadline", "<", now),
        );
        break;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setHeists(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [filter, user]);

  return { heists, loading };
}
