"use client";

import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <main style={{ maxWidth: "980px" }}>
      <header style={{ maxWidth: "820px" }}>
        <div className="eyebrow">CONTACT</div>
        <h1 className="title-jp" style={{ margin: "14px 0 0" }}>接点</h1>
        <p className="lead" style={{ margin: "16px 0 0" }}>
          ここは機能だけ。装飾は最小、線は薄く、余白は多く。
        </p>
      </header>

      <div style={{ height: "clamp(24px, 4vw, 48px)" }} />
      <div className="dash" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
        style={{ marginTop: "clamp(18px, 3.2vw, 34px)", maxWidth: "720px" }}
      >
        <Field label="Name">
          <input name="name" required className="input" />
        </Field>

        <Field label="Email">
          <input name="email" type="email" required className="input" />
        </Field>

        <Field label="Message">
          <textarea name="message" rows={6} required className="input" />
        </Field>

        <div style={{ marginTop: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
          <button type="submit" className="btn">SEND</button>
          {sent ? <span className="small-note">送信しました（デモ）</span> : <span className="small-note">実運用はAPI/フォーム連携に差し替え</span>}
        </div>
      </form>

      <style>{`
        .input{
          width: 100%;
          padding: 12px 12px;
          border: 1px solid rgba(27,26,24,0.16);
          border-radius: 2px;
          background: rgba(255,255,255,0.34);
          font-size: 14px;
          line-height: 1.7;
          color: rgba(27,26,24,0.88);
          outline: none;
          transition: border-color 240ms var(--ease), background 240ms var(--ease), transform 240ms var(--ease);
        }
        .input:focus{
          border-color: rgba(27,26,24,0.32);
          background: rgba(255,255,255,0.48);
        }
        .btn{
          border: 1px solid rgba(27,26,24,0.18);
          border-radius: 999px;
          background: rgba(255,255,255,0.18);
          padding: 12px 18px;
          font-family: var(--font-latin), serif;
          letter-spacing: 0.10em;
          font-size: 12px;
          color: rgba(27,26,24,0.86);
          cursor: pointer;
          transition: transform 240ms var(--ease), opacity 240ms var(--ease);
        }
        .btn:hover{
          transform: translateY(-1px);
          opacity: 0.84;
        }
        .btn:focus-visible{
          outline: none;
          box-shadow: 0 0 0 1px rgba(27,26,24,0.35);
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginTop: "18px" }}>
      <div className="eyebrow" style={{ fontSize: "12px", opacity: 0.78 }}>{label}</div>
      <div style={{ marginTop: "10px" }}>{children}</div>
    </label>
  );
}
