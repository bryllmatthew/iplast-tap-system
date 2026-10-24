"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { activateCreatorAccountAction } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";

export function CreatorSetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) return setMessage("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setMessage("Passwords do not match.");

    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setSaving(false);
      setMessage(error.message);
      return;
    }

    const result = await activateCreatorAccountAction();
    if (!result.ok) {
      setSaving(false);
      setMessage(result.message);
      return;
    }
    router.push("/creator");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-5 grid gap-4">
      <label className="tap-label">
        Create Password
        <input className="tap-input" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <label className="tap-label">
        Confirm Password
        <input className="tap-input" type="password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
      </label>
      {message ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{message}</p> : null}
      <button className="tap-button tap-button-primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Set Password and Open Portal"}</button>
    </form>
  );
}
