"use client";

import { useEffect } from "react";

export function AffiliateReferralCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referralCode = params.get("ref")?.trim().toLowerCase();
    if (!referralCode || !/^[a-z0-9-]{1,40}$/.test(referralCode)) return;

    document.cookie = `cafeatlas_referral_code=${encodeURIComponent(referralCode)}; Max-Age=2592000; Path=/; SameSite=Lax`;
    const sessionKey = `cafeatlas-affiliate-click:${referralCode}`;
    if (window.sessionStorage.getItem(sessionKey)) return;
    window.sessionStorage.setItem(sessionKey, "1");
    void fetch("/api/affiliate/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referral_code: referralCode, landing_path: `${window.location.pathname}${window.location.search}` }),
    });
  }, []);

  return null;
}
