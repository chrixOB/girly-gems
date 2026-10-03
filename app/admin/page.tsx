"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole, Sparkles } from "lucide-react";

export default function AdminLogin() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Admin sign-in is not connected yet.");
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
            <a className="admin-forgot-link" href="#forgot-password" onClick={(event) => { event.preventDefault(); setMessage("Password recovery is not configured yet."); }}>
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

          <button className="admin-submit" type="submit">
            Log in <ArrowRight size={16} />
          </button>
          <p className="admin-login-message" aria-live="polite">{message}</p>
        </form>

        <div className="admin-login-footnote"><Sparkles size={13} /> Made for the people behind the sparkle</div>
      </section>

      <p className="admin-login-caption">GIRLY GEMS <span>·</span> ADMIN ACCESS</p>
    </main>
  );
}