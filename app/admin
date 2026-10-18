"use client";

import { useEffect, useState } from "react";

type Offer = {
  id: string;
  name: string;
  phone: string;
  discount: number;
  couponCode: string;
  status: string;
  campaignId: string;
  createdAt?: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setMessage("পাসওয়ার্ড সঠিক নয় অথবা লগইন ব্যবস্থা এখনো সেটআপ হয়নি।");
        return;
      }

      setLoggedIn(true);
      sessionStorage.setItem("st_admin_logged_in", "yes");
      await loadOffers();
    } catch {
      setMessage("সার্ভারের সঙ্গে সংযোগ হচ্ছে না।");
    } finally {
      setLoading(false);
    }
  }

  async function loadOffers() {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/coupons", {
        cache: "no-store",
        headers: {
          "x-admin-session":
            sessionStorage.getItem("st_admin_logged_in") || "",
        },
      });

      if (!res.ok) {
        setMessage("কুপনের API এখনো তৈরি বা সংযুক্ত করা হয়নি।");
        return;
      }

      const data = await res.json();
      setOffers(data.coupons || []);
    } catch {
      setMessage("কুপনের তালিকা লোড করা যায়নি।");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    couponCode: string,
    status: "approved" | "cancelled"
  ) {
    const confirmed = window.confirm(
      status === "approved"
        ? "এই কুপন অনুমোদন করবেন?"
        : "এই কুপন বাতিল করবেন?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode,
          status,
          adminSession:
            sessionStorage.getItem("st_admin_logged_in") || "",
        }),
      });

      if (!res.ok) {
        setMessage("কুপনের অবস্থা পরিবর্তনের API এখনো প্রস্তুত নয়।");
        return;
      }

      setMessage("কুপনের অবস্থা পরিবর্তন হয়েছে।");
      await loadOffers();
    } catch {
      setMessage("সার্ভারে সংযোগ করা যায়নি।");
    }
  }

  useEffect(() => {
    if (sessionStorage.getItem("st_admin_logged_in") === "yes") {
      setLoggedIn(true);
      void loadOffers();
    }
  }, []);

  function logout() {
    sessionStorage.removeItem("st_admin_logged_in");
    setLoggedIn(false);
    setPassword("");
    setOffers([]);
  }

  return (
    <main className="admin-page">
      <div className="admin-card">
        <h1>Saiful Tailors</h1>
        <h2>অ্যাডমিন প্যানেল</h2>

        {!loggedIn ? (
          <div className="login-form">
            <label htmlFor="admin-password">অ্যাডমিন পাসওয়ার্ড</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="পাসওয়ার্ড লিখুন"
            />

            <button onClick={login} disabled={loading || !password}>
              {loading ? "অপেক্ষা করুন..." : "লগইন"}
            </button>
          </div>
        ) : (
          <>
            <div className="toolbar">
              <h3>কুপন ব্যবস্থাপনা</h3>
              <button onClick={loadOffers} disabled={loading}>
                রিফ্রেশ
              </button>
              <button onClick={logout} className="secondary">
                লগআউট
              </button>
            </div>

            {loading && <p>লোড হচ্ছে...</p>}

            {offers.length === 0 && !loading && (
              <p>এখনো কোনো কুপন পাওয়া যায়নি।</p>
            )}

            {offers.map((coupon) => (
              <section className="coupon" key={coupon.couponCode}>
                <h3>{coupon.name}</h3>
                <p>কুপন: {coupon.couponCode}</p>
                <p>ডিসকাউন্ট: ৳{coupon.discount}</p>
                <p>
                  অবস্থা:{" "}
                  {coupon.status === "approved"
                    ? "অনুমোদিত"
                    : coupon.status === "cancelled"
                      ? "বাতিল"
                      : "অপেক্ষমাণ"}
                </p>

                {coupon.status === "pending" && (
                  <div className="actions">
                    <button
                      onClick={() =>
                        updateStatus(coupon.couponCode, "approved")
                      }
                    >
                      অনুমোদন
                    </button>
                    <button
                      className="secondary"
                      onClick={() =>
                        updateStatus(coupon.couponCode, "cancelled")
                      }
                    >
                      বাতিল
                    </button>
                  </div>
                )}
              </section>
            ))}
          </>
        )}

        {message && <p className="message">{message}</p>}
      </div>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          padding: 24px 14px;
          background: #f3f5f7;
          color: #17211c;
          font-family: Arial, sans-serif;
        }
        .admin-card {
          max-width: 700px;
          margin: auto;
          padding: 24px;
          border-radius: 16px;
          background: white;
          box-shadow: 0 4px 20px #00000012;
        }
        h1 {
          margin-bottom: 6px;
        }
        input {
          display: block;
          box-sizing: border-box;
          width: 100%;
          margin: 10px 0 14px;
          padding: 13px;
          border: 1px solid #cbd5ce;
          border-radius: 8px;
          font-size: 16px;
        }
        button {
          padding: 11px 15px;
          margin: 4px;
          border: 0;
          border-radius: 8px;
          background: #176b45;
          color: white;
          font-size: 15px;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
        }
        .secondary {
          background: #59645e;
        }
        .toolbar,
        .actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }
        .coupon {
          margin-top: 14px;
          padding: 15px;
          border: 1px solid #dce4de;
          border-radius: 10px;
        }
        .message {
          margin-top: 16px;
          overflow-wrap: anywhere;
        }
      `}</style>
    </main>
  );
}
