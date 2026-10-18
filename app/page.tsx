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
    void load();
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice("");
    setCoupon(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (
      cleanName.length < 2 ||
      !/^01[3-9]\d{8}$/.test(cleanPhone)
    ) {
      setNotice(
        "সঠিক নাম ও বাংলাদেশের ১১ সংখ্যার মোবাইল নম্বর লিখুন।"
      );
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

  // কুপনকে PNG ছবি হিসেবে তৈরি ও ডাউনলোড
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
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // মরুনি প্যানেল
      ctx.fillStyle = "#5b1027";
      ctx.beginPath();
      ctx.roundRect(30, 30, 840, 1090, 35);
      ctx.fill();

      // সোনালি বর্ডার
      ctx.strokeStyle = "#e3c27c";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(53, 53, 79, 1044, 20)
