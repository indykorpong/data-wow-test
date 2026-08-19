"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useRole } from "@/store/RoleContext";
import styles from "../auth.module.css";

interface Errors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const { role } = useRole();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  // Clear a field's message as soon as it is edited.
  function clearError(key: keyof Errors) {
    setErrors((previous) => (previous[key] ? { ...previous, [key]: undefined } : previous));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found: Errors = {};
    if (!fullName.trim()) found.fullName = "Full name is required.";
    if (!email.trim()) found.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) found.email = "Enter a valid email address.";
    if (!password) found.password = "Password is required.";
    else if (password.length < 8) found.password = "Use at least 8 characters.";
    if (confirmPassword !== password) found.confirmPassword = "Passwords do not match.";

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    router.push(role === "admin" ? "/admin" : "/user");
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h1 className={styles.heading}>Sign Up</h1>

      <div className={styles.fields}>
        <TextField
          label="Full name"
          autoComplete="name"
          placeholder="Enter your Full Name"
          iconBefore="user"
          value={fullName}
          onChange={(event) => {
            setFullName(event.target.value);
            clearError("fullName");
          }}
          error={errors.fullName}
        />

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
          autoComplete="new-password"
          placeholder="Create a Password"
          iconBefore="lock"
          revealToggle
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            clearError("password");
          }}
          error={errors.password}
        />

        <TextField
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your Password"
          iconBefore="lock"
          revealToggle
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            clearError("confirmPassword");
          }}
          error={errors.confirmPassword}
        />
      </div>

      <Button type="submit" fullWidth>
        Create an account
      </Button>

      <p className={styles.footnote}>
        Already have an account?{" "}
        <Link href="/login" className={styles.link}>
          Login
        </Link>
      </p>
    </form>
  );
}
