"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Offer = { id: string; title?: string; startAt?: string; endAt?: string; active?: boolean; maxUsers?: number; minOrderAmount?: number };
type Customer = { name: string; discount: number; status: string; couponCode: string; campaignId: string };

export default function Home() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [rows, setRows] = useState<Customer[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notice, setNotice] = useState("");
  const [coupon, setCoupon] = useState<Customer | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/public-offer", { cache: "no-store" });
      const data = await res.json();
      setOffer(data.offer || null);
      setRows(data.customers || []);
    } catch { setNotice("তথ্য লোড করা যায়নি। পরে আবার চেষ্টা করুন।"); }
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setNotice(""); setCoupon(null);
    if (!name.trim() || !/^01[3-9]\d{8}$/.test(phone.trim())) {
      setNotice("সঠিক নাম ও বাংলাদেশের ১১ সংখ্যার মোবাইল নম্বর লিখুন।"); return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), phone: phone.trim() }) });
      const data = await res.json();
      if (!res.ok) { setNotice(data.error || "অফার নেওয়া যায়নি।"); return; }
      setCoupon(data.coupon); setNotice(data.message || "অভিনন্দন! আপনার কুপন তৈরি হয়েছে।"); await load();
    } catch { setNotice("সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।"); }
    finally { setBusy(false); }
  }

  function downloadCoupon() {
    if (!coupon) return;
    const content = `SAIFUL TAILORS\\nসাইফুল টেইলার্স\\nঅভিনন্দন!\\nআপনার ডিসকাউন্ট: ৳${coupon.discount}\\nনাম: ${coupon.name}\\nকুপন: ${coupon.couponCode}\\nশর্ত: ৬০০ টাকা বা তার বেশি মূল্যের পোশাক তৈরি করালে প্রযোজ্য।\\nঅ্যাডমিন অনুমোদন ও মেয়াদ যাচাই সাপেক্ষে।`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${coupon.couponCode}.txt`; a.click(); URL.revokeObjectURL(a.href);
  }

  return <main className="shell">
    <header className="hero"><div className="brandmark">ST</div><p className="eyebrow">SAIFUL TAILORS</p><h1>সাইফুল টেইলার্স</h1>
      <p className="sub">আপনার পোশাক তৈরিতে বিশেষ মাসিক অফার</p>
      <div className="prize">৳৪০ – ৳২০০ <span>পর্যন্ত ডিসকাউন্ট</span></div>
      <p className="condition">৬০০ টাকা বা তার বেশি মূল্যের পোশাক তৈরিতে কুপন প্রযোজ্য</p>
    </header>
    {offer?.active ? <section className="panel"><div className="panelhead"><h2>{offer.title || "বিশেষ অফার"}</h2><span className="badge">অফার চালু</span></div>
      <p className="muted">অফারের সময়: {offer.startAt || "—"} থেকে {offer.endAt || "—"} · সর্বোচ্চ ৫০ জন</p>
      <form onSubmit={submit} className="form">
        <label>আপনার নাম<input value={name} onChange={e=>setName(e.target.value)} maxLength={80} placeholder="পুরো নাম লিখুন" required /></label>
        <label>মোবাইল নম্বর<input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="numeric" maxLength={11} placeholder="01XXXXXXXXX" required /></label>
        <label className="check"><input type="checkbox" required /> আমি অফারের শর্তাবলি ও তথ্য ব্যবহারে সম্মত।</label>
        <button disabled={busy} className="primary">{busy ? "অপেক্ষা করুন…" : "অফার গ্রহণ করুন"}</button>
      </form>
    </section> : <section className="notice"><div className="noticeicon">✦</div><h2>নতুন গ্রাহকদের জন্য অফার আসছে!</h2><p>বর্তমানে নতুন অফার চালু নেই। পরবর্তী অফার চালু হলে এই পেজে জানানো হবে। পুরোনো কুপন ও গ্রাহক তালিকা সংরক্ষিত রয়েছে।</p></section>}
    {notice && <p className="status" role="status">{notice}</p>}
    {coupon && <section className="coupon"><p className="eyebrow">SAIFUL TAILORS</p><h2>অভিনন্দন!</h2><p>আপনার ডিসকাউন্ট</p><div className="amount">৳{coupon.discount}</div><p>{coupon.name}</p><p>কুপন নম্বর: <b>{coupon.couponCode}</b></p><p className="muted">দোকানে এসে দেখান। কুপন অ্যাডমিন অনুমোদন ও মেয়াদ যাচাই সাপেক্ষে।</p><button className="primary" onClick={downloadCoupon}>কুপন তথ্য ডাউনলোড করুন</button></section>}
    <section className="panel"><div className="panelhead"><h2>এই মাসের অফার তালিকা</h2><span className="count">{rows.length}/50</span></div>
      {rows.length ? <div className="tablewrap"><table><thead><tr><th>নাম</th><th>ডিসকাউন্ট</th><th>অবস্থা</th></tr></thead><tbody>{rows.filter(r=>r.status!=="cancelled").map(r=><tr key={r.couponCode}><td>{r.name}</td><td>৳{r.discount}</td><td>{r.status==="approved"?"অনুমোদিত":r.status==="redeemed"?"ব্যবহৃত":"অপেক্ষমাণ"}</td></tr>)}</tbody></table></div> : <p className="muted">এখনো কোনো গ্রাহক এই অফার গ্রহণ করেননি।</p>}
    </section>
    <footer>© {new Date().getFullYear()} Saiful Tailors · গ্রাহকের মোবাইল নম্বর প্রকাশ করা হয় না</footer>
  </main>;
}
