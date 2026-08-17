"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useUser } from "@/hooks";
import { COLLECTIONS, FirestoreUser } from "@/types/firestore";
import type { CreateHeistInput } from "@/types/firestore";
import styles from "./CreateHeistForm.module.css";

export default function CreateHeistForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
        const fetchedUsers = snapshot.docs
          .map((doc) => doc.data() as FirestoreUser)
          .filter((u) => u.id !== user?.uid);
        setUsers(fetchedUsers);
      } catch {
        setError("Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    }

    fetchUsers();
  }, [user?.uid]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const selectedUser = users.find((u) => u.id === assignedTo);
      const deadline = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const heistData: CreateHeistInput = {
        title,
        description,
        createdBy: user!.uid,
        createdByCodename: user!.displayName ?? "Unknown",
        assignedTo,
        assignedToCodename: selectedUser?.codename ?? "Unknown",
        deadline,
        finalStatus: null,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, COLLECTIONS.HEISTS), heistData);
      router.push("/heists");
    } catch {
      setError("Something went wrong. Please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="title">
          Title
        </label>
        <input
          className={styles.input}
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Operation Nightfall"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="description">
          Description
        </label>
        <textarea
          className={styles.textarea}
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the mission objectives..."
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="assignedTo">
          Assign To
        </label>
        <select
          className={styles.select}
          id="assignedTo"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          required
        >
          {loadingUsers ? (
            <option value="" disabled>
              Loading agents...
            </option>
          ) : (
            <>
              <option value="" disabled>
                Select an agent...
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.codename}
                </option>
              ))}
            </>
          )}
        </select>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn" disabled={loading}>
        {loading ? "Creating..." : "Create Heist"}
      </button>
    </form>
  );
}
