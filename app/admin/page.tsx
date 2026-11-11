"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle, LockKeyhole, Sparkles } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [alert, setAlert] = useState<{ type: "error" | "success" | "info"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAlert(null);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") || "");
    const password = String(form.get("password") || "");

    try {
      const response = await fetch("/api/auth/login", {
        body: JSON.stringify({ username, password }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        setAlert({ type: "error", text: data.message || "Invalid username or password." });
        setIsSubmitting(false);
        return;
      }

      setAlert({ type: "success", text: "Login successful. Opening dashboard..." });
      router.push(data.redirectTo || "/admin/dashboard");
    } catch {
      setAlert({ type: "error", text: "Unable to connect to the server." });
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-login">
      <div className="admin-rings" aria-hidden="true">
        <span className="admin-ring ring-one" />
        <span className="admin-ring ring-two" />
        <span className="admin-ring ring-three" />
        <span className="admin-ring ring-four" />
        <span className="admin-ring ring-five" />
        <span className="admin-ring ring-six" />
        <span className="admin-ring ring-seven" />
      </div>

      <a className="admin-back-link" href="/">
        <ArrowLeft size={15} /> Back to the shop
      </a>

      <section className="admin-login-panel" aria-labelledby="admin-title">
        <a className="wordmark admin-wordmark" href="/" aria-label="Girly Gems home">
          girly <span>gems</span><i>✦</i>
        </a>
        <div className="admin-login-icon"><LockKeyhole size={19} /></div>
        <p className="eyebrow">The sparkle suite</p>
        <h1 id="admin-title">Welcome <em>back.</em></h1>
        <p className="admin-login-intro">Sign in to manage your little corner of Girly Gems.</p>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          {alert && <div className={`admin-login-alert ${alert.type}`} role={alert.type === "error" ? "alert" : "status"} aria-live={alert.type === "error" ? "assertive" : "polite"}><span>{alert.type === "success" ? "✓" : alert.type === "error" ? "!" : "i"}</span>{alert.text}</div>}
          <label htmlFor="admin-username">Username</label>
          <input
            autoComplete="username"
            id="admin-username"
            name="username"
            placeholder="Your admin username"
            required
          />

          <div className="admin-password-label">
            <label htmlFor="admin-password">Password</label>
            <a className="admin-forgot-link" href="#forgot-password" onClick={(event) => { event.preventDefault(); setAlert({ type: "info", text: "Password recovery is not configured yet." }); }}>
              Forgot password?
            </a>
          </div>
          <input
            autoComplete="current-password"
            id="admin-password"
            name="password"
            placeholder="Enter your password"
            required
            type="password"
          />

          <button aria-busy={isSubmitting} className="admin-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? <>Logging in... <LoaderCircle className="dashboard-spinner" size={16} /></> : <>Log in <ArrowRight size={16} /></>}
          </button>
        </form>

        <div className="admin-login-footnote"><Sparkles size={13} /> Made for the people behind the sparkle</div>
      </section>

      <p className="admin-login-caption">GIRLY GEMS <span>·</span> ADMIN ACCESS</p>
    </main>
  );
}