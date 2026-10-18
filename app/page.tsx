"use client";

import { useEffect, useRef, useState } from "react";

type Offer = {
  id: string;
  title?: string;
  startAt?: string;
  endAt?: string;
  active?: boolean;
  maxUsers?: number;
  minOrderAmount?: number;
};

type Customer = {
  name: string;
  discount: number;
  status: string;
  couponCode: string;
  campaignId: string;
};

const C = {
  maroon: "#5b1027",
  maroonDark: "#3f0a1b",
  gold: "#e3c27c",
  cream: "#f8f1e8",
  ink: "#2a1a1f",
  error: "#a31d1d",
};

const FONT = "'Hind Siliguri','Noto Sans Bengali',sans-serif";

const bn = (n: number | string) => Number(n).toLocaleString("bn-BD");

const bnDate = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function Home() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [rows, setRows] = useState<Customer[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notice, setNotice] = useState("");
  const [coupon, setCoupon] = useState<Customer | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const previewRef = useRef("");

  async function load() {
    try {
      const res = await fetch("/api/public-offer", {
        cache: "no-store",
      });

      const data = await res.json();

      setOffer(data.offer || null);
      setRows(data.customers || []);
    } catch {
      setNotice("তথ্য লোড করা যায়নি। পরে আবার চেষ্টা করুন।");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  // পেজ বন্ধ হলে প্রিভিউ ছবির মেমোরি মুক্ত করা
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice("");
    setCoupon(null);
    clearPreview();

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (cleanName.length < 2 || !/^01[3-9]\d{8}$/.test(cleanPhone)) {
      setNotice("সঠিক নাম ও বাংলাদেশের ১১ সংখ্যার মোবাইল নম্বর লিখুন।");
      return;
    }

    setBusy(true);

    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setNotice(data.error || "অফার নেওয়া যায়নি।");
        return;
      }

      if (!data.coupon) {
        setNotice("কুপনের তথ্য পাওয়া যায়নি। আবার চেষ্টা করুন।");
        return;
      }

      setCoupon(data.coupon);
      setNotice(data.message || "অভিনন্দন! আপনার কুপন তৈরি হয়েছে।");

      await load();
    } catch {
      setNotice("সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  }

  function clearPreview() {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = "";
    }
    setPreviewUrl("");
  }

  // ---------- কুপনের PNG ছবি আঁকা ----------
  async function buildCouponBlob(c: Customer): Promise<Blob> {
    // বাংলা ফন্ট লোড হওয়া পর্যন্ত অপেক্ষা (না পেলে সিস্টেম ফন্টে আঁকবে)
    try {
      await Promise.all([
        document.fonts.load(`700 52px 'Hind Siliguri'`),
        document.fonts.load(`400 34px 'Hind Siliguri'`),
      ]);
      await document.fonts.ready;
    } catch {
      /* ফন্ট না পেলে সমস্যা নেই */
    }

    const W = 900;
    const H = 1150;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas তৈরি করা যায়নি");

    // পুরনো ব্রাউজারে roundRect না থাকলে সাধারণ আয়তক্ষেত্র
    const box = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(x, y, w, h, r);
      } else {
        ctx.rect(x, y, w, h);
      }
    };

    // লম্বা লেখা বক্সে ঢোকাতে ফন্ট ছোট করা
    const fit = (
      text: string,
      weight: string,
      size: number,
      maxWidth: number,
      family = FONT
    ) => {
      let s = size;
      ctx.font = `${weight} ${s}px ${family}`;
      while (ctx.measureText(text).width > maxWidth && s > 20) {
        s -= 2;
        ctx.font = `${weight} ${s}px ${family}`;
      }
    };

    // ব্যাকগ্রাউন্ড
    ctx.fillStyle = C.cream;
    ctx.fillRect(0, 0, W, H);

    // মেরুন প্যানেল
    ctx.fillStyle = C.maroon;
    box(30, 30, 840, 1090, 35);
    ctx.fill();

    // সোনালি বর্ডার
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 4;
    box(53, 53, 794, 1044, 20);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    // দোকানের নাম
    ctx.fillStyle = C.gold;
    fit("সাইফুল টেইলার্স", "700", 58, 700);
    ctx.fillText("সাইফুল টেইলার্স", W / 2, 190);

    ctx.fillStyle = "#ffffff";
    ctx.font = `400 32px ${FONT}`;
    ctx.fillText("বিশেষ ডিসকাউন্ট কুপন", W / 2, 250);

    // সোনালি দাগ
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, 290);
    ctx.lineTo(600, 290);
    ctx.stroke();

    // ডিসকাউন্ট
    ctx.fillStyle = C.gold;
    ctx.font = `700 170px ${FONT}`;
    ctx.fillText(`${bn(c.discount)}%`, W / 2, 490);

    ctx.fillStyle = "#ffffff";
    ctx.font = `400 42px ${FONT}`;
    ctx.fillText("ছাড়", W / 2, 555);

    // গ্রাহকের নাম
    ctx.fillStyle = "#ffffff";
    fit(c.name, "700", 46, 700);
    ctx.fillText(c.name, W / 2, 665);

    // কুপন কোড বক্স
    ctx.fillStyle = C.cream;
    box(170, 730, 560, 140, 22);
    ctx.fill();

    ctx.fillStyle = C.maroon;
    fit(c.couponCode, "700", 64, 500, "monospace");
    ctx.fillText(c.couponCode, W / 2, 822);

    // শর্ত ও মেয়াদ
    ctx.fillStyle = C.gold;
    ctx.font = `400 28px ${FONT}`;
    let y = 940;
    if (offer?.minOrderAmount) {
      ctx.fillText(`ন্যূনতম অর্ডার ৳${bn(offer.minOrderAmount)}`, W / 2, y);
      y += 48;
    }
    const end = bnDate(offer?.endAt);
    if (end) {
      ctx.fillText(`মেয়াদ: ${end} পর্যন্ত`, W / 2, y);
      y += 48;
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = `400 26px ${FONT}`;
    ctx.fillText("দোকানে এই কোডটি দেখান", W / 2, Math.max(y + 10, 1040));

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("PNG তৈরি করা যায়নি"));
      }, "image/png");
    });
  }

  // ---------- ছবি ডাউনলোড ----------
  async function downloadCoupon() {
    if (!coupon) {
      alert("আগে একটি কুপন তৈরি করুন।");
      return;
    }

    setSaving(true);

    try {
      const blob = await buildCouponBlob(coupon);
      const fileName = `coupon-${coupon.couponCode}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      // মোবাইল: শেয়ার মেনু থেকে "Save Image" দিলে গ্যালারিতে সেভ হবে
      if (isMobile && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "আমার কুপন" });
          return;
        } catch (err) {
          if ((err as Error).name === "AbortError") return; // ব্যবহারকারী বাতিল করেছে
          // অন্য সমস্যা হলে নিচের সাধারণ ডাউনলোডে যাবে
        }
      }

      // সাধারণ ডাউনলোড (ডেস্কটপ ও অন্যান্য ব্রাউজার)
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("Coupon download error:", error);
      alert("কুপন ডাউনলোড করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  }

  // ফেসবুক/মেসেঞ্জারের ব্রাউজারে ডাউনলোড বন্ধ থাকলে ছবি দেখিয়ে চেপে ধরে সেভ করার সুযোগ
  async function showPreview() {
    if (!coupon) return;
    try {
      const blob = await buildCouponBlob(coupon);
      clearPreview();
      const url = URL.createObjectURL(blob);
      previewRef.current = url;
      setPreviewUrl(url);
    } catch {
      alert("ছবি তৈরি করা যায়নি। আবার চেষ্টা করুন।");
    }
  }

  const closed = offer ? offer.active === false : false;

  return (
    <main style={s.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .sf-input:focus, .sf-btn:focus-visible, .sf-link:focus-visible {
          outline: 3px solid ${C.gold};
          outline-offset: 2px;
        }
        .sf-btn:disabled { opacity: .6; cursor: not-allowed; }
      `}</style>

      <header style={s.header}>
        <h1 style={s.brand}>সাইফুল টেইলার্স</h1>
        <p style={s.tagline}>জুব্বা, থোব ও আরবীয় পোশাকের কারিগর</p>
      </header>

      <div style={s.wrap}>
        {/* অফার তথ্য */}
        <section style={s.card}>
          <h2 style={s.h2}>{offer?.title || "বিশেষ অফার"}</h2>
          {offer ? (
            <ul style={s.facts}>
              {offer.endAt && bnDate(offer.endAt) && (
                <li>অফার চলবে {bnDate(offer.endAt)} পর্যন্ত</li>
              )}
              {offer.maxUsers ? (
                <li>প্রথম {bn(offer.maxUsers)} জন গ্রাহক পাবেন</li>
              ) : null}
              {offer.minOrderAmount ? (
                <li>ন্যূনতম অর্ডার ৳{bn(offer.minOrderAmount)}</li>
              ) : null}
              {closed && <li style={{ color: C.error }}>এই অফার এখন বন্ধ আছে।</li>}
            </ul>
          ) : (
            <p style={s.muted}>অফারের তথ্য লোড হচ্ছে...</p>
          )}
        </section>

        {/* ফর্ম */}
        <section style={s.card}>
          <h2 style={s.h2}>কুপন নিন</h2>
          <form onSubmit={submit} style={s.form}>
            <label style={s.label} htmlFor="sf-name">
              আপনার নাম
            </label>
            <input
              id="sf-name"
              className="sf-input"
              style={s.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: আব্দুল্লাহ"
              autoComplete="name"
              disabled={busy || closed}
            />

            <label style={s.label} htmlFor="sf-phone">
              মোবাইল নম্বর
            </label>
            <input
              id="sf-phone"
              className="sf-input"
              style={s.input}
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))
              }
              placeholder="01XXXXXXXXX"
              inputMode="numeric"
              autoComplete="tel"
              disabled={busy || closed}
            />

            <button
              type="submit"
              className="sf-btn"
              style={s.primaryBtn}
              disabled={busy || closed}
            >
              {busy ? "কুপন তৈরি হচ্ছে..." : "কুপন নিন"}
            </button>
          </form>

          {notice && (
            <p
              role="status"
              style={{
                ...s.notice,
                color: coupon ? "#1d6b3a" : C.error,
                background: coupon ? "#e6f4ea" : "#fbeaea",
              }}
            >
              {notice}
            </p>
          )}
        </section>

        {/* কুপন কার্ড */}
        {coupon && (
          <section style={s.coupon} aria-label="আপনার কুপন">
            <p style={s.couponShop}>সাইফুল টেইলার্স</p>
            <p style={s.couponBig}>{bn(coupon.discount)}%</p>
            <p style={s.couponSub}>ছাড়</p>
            <p style={s.couponName}>{coupon.name}</p>
            <div style={s.codeBox}>{coupon.couponCode}</div>
            <p style={s.couponHint}>দোকানে এই কোডটি দেখান</p>

            <button
              type="button"
              className="sf-btn"
              style={s.downloadBtn}
              onClick={downloadCoupon}
              disabled={saving}
            >
              {saving ? "ছবি তৈরি হচ্ছে..." : "ছবি ডাউনলোড করুন"}
            </button>

            <button
              type="button"
              className="sf-link"
              style={s.linkBtn}
              onClick={showPreview}
            >
              ডাউনলোড না হলে এখানে চাপুন
            </button>

            {previewUrl && (
              <div style={{ marginTop: 16 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="কুপনের ছবি"
                  style={{ width: "100%", borderRadius: 12 }}
                />
                <p style={s.couponHint}>
                  ছবিটি চেপে ধরে &quot;Save image&quot; বা &quot;ছবি সংরক্ষণ&quot; দিন।
                </p>
              </div>
            )}
          </section>
        )}

        {/* গ্রাহকদের তালিকা */}
        {rows.length > 0 && (
          <section style={s.card}>
            <h2 style={s.h2}>যাঁরা কুপন নিয়েছেন</h2>
            <ul style={s.list}>
              {rows.map((r, i) => (
                <li key={`${r.couponCode}-${i}`} style={s.listItem}>
                  <span>{r.name}</span>
                  <span style={s.muted}>
                    {bn(r.discount)}% · {r.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: C.cream,
    color: C.ink,
    fontFamily: FONT,
    paddingBottom: 48,
  },
  header: {
    background: C.maroon,
    color: C.gold,
    textAlign: "center",
    padding: "36px 20px 40px",
    borderBottom: `4px solid ${C.gold}`,
  },
  brand: { margin: 0, fontSize: 34, fontWeight: 700 },
  tagline: { margin: "8px 0 0", color: "#f1dfc0", fontSize: 17 },
  wrap: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "20px 16px 0",
    display: "grid",
    gap: 16,
  },
  card: {
    background: "#fff",
    border: "1px solid #e8dcc8",
    borderRadius: 16,
    padding: 20,
  },
  h2: { margin: "0 0 12px", fontSize: 22, color: C.maroon },
  facts: { margin: 0, paddingLeft: 20, lineHeight: 1.9, fontSize: 17 },
  muted: { margin: 0, color: "#7a6a6e", fontSize: 15 },
  form: { display: "grid", gap: 8 },
  label: { fontSize: 16, fontWeight: 500, marginTop: 6 },
  input: {
    fontSize: 18, // ১৬px-এর কম হলে আইফোনে জুম হয়ে যায়
    padding: "12px 14px",
    border: "1.5px solid #cdbba0",
    borderRadius: 10,
    background: "#fffdf9",
    fontFamily: FONT,
  },
  primaryBtn: {
    marginTop: 12,
    padding: "14px 16px",
    fontSize: 18,
    fontWeight: 700,
    fontFamily: FONT,
    color: C.gold,
    background: C.maroon,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
  },
  notice: {
    margin: "14px 0 0",
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 1.6,
  },
  coupon: {
    background: C.maroon,
    color: "#fff",
    border: `3px solid ${C.gold}`,
    outline: `2px solid ${C.maroon}`,
    outlineOffset: -9,
    borderRadius: 22,
    padding: "28px 20px 24px",
    textAlign: "center",
  },
  couponShop: { margin: 0, color: C.gold, fontSize: 24, fontWeight: 700 },
  couponBig: {
    margin: "8px 0 0",
    color: C.gold,
    fontSize: 84,
    fontWeight: 700,
    lineHeight: 1.1,
  },
  couponSub: { margin: 0, fontSize: 22 },
  couponName: { margin: "14px 0", fontSize: 22, fontWeight: 700 },
  codeBox: {
    background: C.cream,
    color: C.maroon,
    fontFamily: "monospace",
    fontSize: 30,
    fontWeight: 700,
    padding: "16px 10px",
    borderRadius: 12,
    wordBreak: "break-all",
  },
  couponHint: { margin: "12px 0 0", color: "#f1dfc0", fontSize: 15 },
  downloadBtn: {
    marginTop: 18,
    width: "100%",
    padding: "14px 16px",
    fontSize: 18,
    fontWeight: 700,
    fontFamily: FONT,
    color: C.maroon,
    background: C.gold,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
  },
  linkBtn: {
    marginTop: 12,
    background: "none",
    border: "none",
    color: C.gold,
    fontSize: 15,
    fontFamily: FONT,
    textDecoration: "underline",
    cursor: "pointer",
  },
  list: { margin: 0, padding: 0, listStyle: "none" },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid #f0e6d6",
    fontSize: 16,
  },
};
