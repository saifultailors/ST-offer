"use client";

import { useEffect, useState } from "react";

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
    load();
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice("");
    setCoupon(null);

    if (
      !name.trim() ||
      !/^01[3-9]\d{8}$/.test(phone.trim())
    ) {
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
          name: name.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setNotice(data.error || "অফার নেওয়া যায়নি।");
        return;
      }

      setCoupon(data.coupon);
      setNotice(
        data.message || "অভিনন্দন! আপনার কুপন তৈরি হয়েছে।"
      );

      await load();
    } catch {
      setNotice("সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  }

  // মরুনি-সোনালি PNG কুপন তৈরি
      async function downloadCoupon() {
  if (!coupon) {
    alert("আগে একটি কুপন তৈরি করুন।");
    return;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1150;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas তৈরি করা যায়নি");
    }

    // ব্যাকগ্রাউন্ড
    ctx.fillStyle = "#f8f1e8";
    ctx.fillRect(0, 0, 900, 1150);

    // মরুনি ব্যাকগ্রাউন্ড
    ctx.fillStyle = "#5b1027";
    ctx.beginPath();
    ctx.roundRect(30, 30, 840, 1090, 35);
    ctx.fill();

    // সোনালি বর্ডার
    ctx.strokeStyle = "#e3c27c";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(53, 53, 794, 1044, 25);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // দোকানের নাম
    ctx.fillStyle = "#f0d79e";
    ctx.font = "bold 43px sans-serif";
    ctx.fillText("SAIFUL TAILORS", 450, 125);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText("সাইফুল টেইলার্স", 450, 195);

    // বিভাজক
    ctx.strokeStyle = "#e3c27c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(170, 245);
    ctx.lineTo(730, 245);
    ctx.stroke();

    // অভিনন্দন
    ctx.fillStyle = "#f0d79e";
    ctx.font = "bold 55px sans-serif";
    ctx.fillText("অভিনন্দন!", 450, 320);

    ctx.fillStyle = "#ffffff";
    ctx.font = "32px sans-serif";
    ctx.fillText("আপনার ডিসকাউন্ট", 450, 390);

    // ডিসকাউন্ট বাক্স
    ctx.fillStyle = "#fffaf0";
    ctx.beginPath();
    ctx.roundRect(155, 435, 590, 170, 25);
    ctx.fill();

    ctx.strokeStyle = "#e3c27c";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(165, 445, 570, 150, 20);
    ctx.stroke();

    ctx.fillStyle = "#70172f";
    ctx.font = "bold 88px sans-serif";
    ctx.fillText(`৳${coupon.discount}`, 450, 520);

    // গ্রাহকের নাম
    ctx.fillStyle = "#f0d79e";
    ctx.font = "30px sans-serif";
    ctx.fillText("গ্রাহকের নাম", 450, 670);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 39px sans-serif";
    ctx.fillText(coupon.name, 450, 730);

    // কুপন নম্বর
    ctx.fillStyle = "#f0d79e";
    ctx.font = "29px sans-serif";
    ctx.fillText("কুপন নম্বর", 450, 800);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(coupon.couponCode, 450, 855);

    // শর্তাবলি
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px sans-serif";
    ctx.fillText(
      "৬০০ টাকা বা তার বেশি অর্ডারে প্রযোজ্য",
      450,
      935
    );

    ctx.font = "21px sans-serif";
    ctx.fillText(
      "অ্যাডমিন অনুমোদন ও মেয়াদ যাচাই সাপেক্ষে",
      450,
      980
    );

    // ফুটার
    ctx.fillStyle = "#f0d79e";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("আপনার স্টাইল, আমাদের দক্ষতা", 450, 1040);

    // আসল PNG তৈরি
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result && result.type === "image/png") {
            resolve(result);
          } else {
            reject(new Error("PNG তৈরি করা যায়নি"));
          }
        },
        "image/png"
      );
    });

    // PNG ফাইল ডাউনলোড
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${coupon.couponCode}.png`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);

  } catch (error) {
    console.error("PNG download error:", error);
    alert("কুপন PNG হিসেবে ডাউনলোড করা যায়নি। আবার চেষ্টা করুন।");
  }
}

  return (
    <main className="shell">
      <header className="hero">
        <div className="brandmark">ST</div>

        <p className="eyebrow">SAIFUL TAILORS</p>

        <h1>সাইফুল টেইলার্স</h1>

        <p className="sub">
          আপনার পোশাক তৈরিতে বিশেষ মাসিক অফার
        </p>

        <div className="prize">
          ৳৪০ – ৳২০০
          <span>পর্যন্ত ডিসকাউন্ট</span>
        </div>

        <p className="condition">
          ৬০০ টাকা বা তার বেশি মূল্যের পোশাক তৈরিতে কুপন প্রযোজ্য
        </p>
      </header>

      {offer?.active ? (
        <section className="panel">
          <div className="panel
