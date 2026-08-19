"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useRole } from "@/store/RoleContext";
import styles from "../auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { role } = useRole();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  type Errors = { email?: string; password?: string };
  const [errors, setErrors] = useState<Errors>({});

  // Clear a field's message as soon as it is edited.
  function clearError(key: keyof Errors) {
    setErrors((previous) => (previous[key] ? { ...previous, [key]: undefined } : previous));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // There is no auth this task — these checks exist so the form behaves like a
    // form, not because any credential is verified.
    const found: Errors = {};
    if (!email.trim()) found.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) found.email = "Enter a valid email address.";
    if (!password) found.password = "Password is required.";

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    router.push(role === "admin" ? "/admin" : "/user");
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

      <Button type="submit" fullWidth>
        {role === "admin" ? "Login as Administrator" : "Login as User"}
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
