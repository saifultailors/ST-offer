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

  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1100;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // সাদা ব্যাকগ্রাউন্ড
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 900, 1100);

  // কুপনের বাইরের ডিজাইন
  const gradient = ctx.createLinearGradient(0, 0, 900, 1100);
  gradient.addColorStop(0, "#102b25");
  gradient.addColorStop(1, "#1c493b");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(35, 35, 830, 1030, 35);
  ctx.fill();

  // ভেতরের বর্ডার
  ctx.strokeStyle = "#d9bd79";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(58, 58, 784, 984, 25);
  ctx.stroke();

  ctx.textAlign = "center";

  // দোকানের নাম
  ctx.fillStyle = "#e8cf91";
  ctx.font = "bold 42px sans-serif";
  ctx.fillText("SAIFUL TAILORS", 450, 145);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 43px sans-serif";
  ctx.fillText("সাইফুল টেইলার্স", 450, 220);

  // ডিভাইডার
  ctx.strokeStyle = "#d9bd79";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(170, 265);
  ctx.lineTo(730, 265);
  ctx.stroke();

  // অভিনন্দন
  ctx.fillStyle = "#e8cf91";
  ctx.font = "bold 52px sans-serif";
  ctx.fillText("অভিনন্দন!", 450, 355);

  ctx.fillStyle = "#ffffff";
  ctx.font = "30px sans-serif";
  ctx.fillText("আপনার ডিসকাউন্ট", 450, 425);

  // ডিসকাউন্টের বক্স
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(175, 465, 550, 180, 24);
  ctx.fill();

  ctx.fillStyle = "#164536";
  ctx.font = "bold 82px sans-serif";
  ctx.fillText(`৳${coupon.discount}`, 450, 580);

  // গ্রাহকের নাম
  ctx.fillStyle = "#ffffff";
  ctx.font = "30px sans-serif";
  ctx.fillText("গ্রাহকের নাম", 450, 715);

  ctx.fillStyle = "#e8cf91";
  ctx.font = "bold 36px sans-serif";
  ctx.fillText(coupon.name, 450, 770);

  // কুপন নম্বর
  ctx.fillStyle = "#ffffff";
  ctx.font = "28px sans-serif";
  ctx.fillText("কুপন নম্বর", 450, 835);

  ctx.fillStyle = "#e8cf91";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText(coupon.couponCode, 450, 885);

  // শর্তাবলি
  ctx.fillStyle = "#ffffff";
  ctx.font = "22px sans-serif";
  ctx.fillText("৬০০ টাকা বা তার বেশি অর্ডারে প্রযোজ্য", 450, 950);

  ctx.font = "19px sans-serif";
  ctx.fillText("অনুমোদন ও মেয়াদ যাচাই সাপেক্ষে", 450, 990);

  // PNG ছবি ডাউনলোড
  canvas.toBlob((blob) => {
    if (!blob) {
      alert("ছবি তৈরি করা যায়নি। আবার চেষ্টা করুন।");
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${coupon.couponCode}.png`;
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}
