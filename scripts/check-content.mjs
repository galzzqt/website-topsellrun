// Run: node --test scripts/check-content.mjs   (Node 24 strips the TS types itself)
import assert from "node:assert/strict";
import test from "node:test";
import { cleanConfig, instagramPermalink, orderTiers, SPONSOR_TIERS } from "../src/lib/content.ts";

test("orderTiers keeps saved order, drops junk/dupes, appends missing tiers", () => {
  const keys = orderTiers(["main", "bogus", "presented", "main"]).map(([k]) => k);
  assert.deepEqual(keys.slice(0, 2), ["main", "presented"]);
  assert.equal(keys.length, SPONSOR_TIERS.length);
  assert.deepEqual(orderTiers(null).map(([k]) => k), SPONSOR_TIERS.map(([k]) => k));
});

test("instagram links are canonicalized, anything else rejected", () => {
  assert.equal(instagramPermalink("https://www.instagram.com/reel/DAbc_12-x/?igsh=xyz"), "https://www.instagram.com/reel/DAbc_12-x/");
  assert.equal(instagramPermalink("https://instagram.com/topsell.id/p/C0de/"), "https://www.instagram.com/p/C0de/");
  assert.equal(instagramPermalink('https://www.instagram.com/p/x"><script>/'), "https://www.instagram.com/p/x/");
  assert.equal(instagramPermalink("https://evil.com/instagram.com/p/abc/"), "");
  assert.equal(instagramPermalink("javascript:alert(1)//instagram.com/p/abc"), "");
});

test("cleanConfig strips unsafe urls and unknown keys", () => {
  const c = cleanConfig({
    cta: { registerUrl: "javascript:alert(1)" },
    banners: [{ image: "//evil.com/x.png" }, { image: "/images/ok.webp", linkUrl: "https://a.id" }],
    instagramPosts: [{ url: "https://www.instagram.com/reel/AAA/" }, { url: "nope" }],
    contact: { whatsapp: "0812-3456" },
    bogus: 1,
  });
  assert.equal(c.cta.registerUrl, "");
  assert.deepEqual(c.banners.map((b) => b.image), ["", "/images/ok.webp"]);
  assert.deepEqual(c.instagramPosts, [{ url: "https://www.instagram.com/reel/AAA/" }]);
  assert.equal(c.contact.whatsapp, "628123456");
  assert.equal("bogus" in c, false);
  assert.equal(c.event.status, "upcoming");
});
