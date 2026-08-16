"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import styles from "./LoginForm.module.css";
import { loginUser, getLoginAuthErrorMessage } from "@/lib/firebase/login";
import SuccessMessage from "@/components/SuccessMessage";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
      setShowSuccessMessage(true);
    } catch (err) {
      setError(getLoginAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleCloseSuccess() {
    setShowSuccessMessage(false);
    setEmail("");
    setPassword("");
    setShowPassword(false);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          Email
        </label>
        <input
          className={styles.input}
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">
          Password
        </label>
        <div className={styles.inputWrapper}>
          <input
            className={styles.input}
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            className={styles.eyeToggle}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button type="submit" className="btn" disabled={loading}>
        {loading ? "Logging in..." : "Log In"}
      </button>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <p className={styles.switchText}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" className={styles.link}>
          Sign up
        </Link>
      </p>

      {showSuccessMessage && (
        <SuccessMessage
          message="You've successfully logged in!"
          onClose={handleCloseSuccess}
        />
      )}
    </form>
  );
}
