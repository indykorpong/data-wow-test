"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/store/AuthContext";
import styles from "../auth.module.css";

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  type Errors = { email?: string; password?: string; form?: string };
  const [errors, setErrors] = useState<Errors>({});

  // Clear a field's message as soon as it is edited.
  function clearError(key: keyof Errors) {
    setErrors((previous) => (previous[key] ? { ...previous, [key]: undefined } : previous));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found: Errors = {};
    if (!email.trim()) found.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) found.email = "Enter a valid email address.";
    if (!password) found.password = "Password is required.";

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      // The redirect to /admin or /user happens in (app)/layout.tsx once the
      // authenticated user (and their real role) lands in AuthContext.
      await login(email, password);
    } catch (error) {
      setErrors({
        form: error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
      });
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h1 className={styles.heading}>Login</h1>

      <div className={styles.fields}>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="Enter your Email Address"
          iconBefore="user"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            clearError("email");
          }}
          error={errors.email}
        />

        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your Password"
          iconBefore="lock"
          revealToggle
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            clearError("password");
          }}
          error={errors.password}
        />
      </div>

      {errors.form ? <p className={styles.formError} role="alert">{errors.form}</p> : null}

      <Button type="submit" fullWidth disabled={submitting}>
        {submitting ? "Signing in…" : "Login"}
      </Button>

      <p className={styles.footnote}>
        Don&rsquo;t have an account?{" "}
        <Link href="/signup" className={styles.link}>
          Create an account
        </Link>
      </p>
    </form>
  );
}
