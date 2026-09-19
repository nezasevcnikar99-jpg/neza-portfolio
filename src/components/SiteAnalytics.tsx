"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

const KEY = "ne-stej";

/**
 * Vercel Web Analytics without the visits that are not people looking at the
 * work: automated browsers (tests, link scanners that run pages headless) and
 * the owner's own browser. Opening any page with ?ne-stej=1 marks this browser
 * as not counted from then on; ?ne-stej=0 counts it again.
 */
function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    if (navigator.webdriver) return null;
    const url = new URL(event.url);
    const flag = url.searchParams.get(KEY);
    if (flag === "1") localStorage.setItem(KEY, "1");
    if (flag === "0") localStorage.removeItem(KEY);
    if (localStorage.getItem(KEY)) return null;
  } catch {
    // Storage can be blocked; the visit is then counted as usual.
  }
  return event;
}

export default function SiteAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
