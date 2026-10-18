"use client";

import { useEffect, useState } from "react";

type Coupon = {
  id: string;
  status: string;
  discount: number;
  createdAt?: string | null;
  campaignId?: string | null;
  orderAmount?: number | null;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadCoupons() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/coupons", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setLoggedIn(false);
        }
        throw new Error(data.error || "কুপন লোড করা যায়নি");
      }

      setCoupons(data.coupons || []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "সমস্যা হয়েছে"
      );
    } finally {
      setLoading(false);
    }
  }

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "লগইন করা যায়নি");
      }

      setLoggedIn(true);
      setPassword("");
      await loadCoupons();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "লগইন ব্যর্থ হয়েছে"
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateCoupon(id: string, status: string) {
    setMessage("");

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "পরিবর্তন করা যায়নি");
      }

      setMessage(data.message || "সফল হয়েছে");
      await loadCoupons();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "সমস্যা হয়েছে"
      );
    }
  }

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/admin/coupons", {
          cache: "no-store",
        });

        if (response.ok) {
          setLoggedIn(true);
          const data = await response.json();
          setCoupons(data.coupons || []);
        }
      } catch {
        // লগইন না থাকলে লগইন ফর্ম দেখানো হবে
      }
    }

    void checkSession();
  }, []);

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-gray-100 p-5 flex items-center justify-center">
        <form
          onSubmit={login}
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow"
        >
          <h1 className="mb-2 text-2xl font-bold text-center">
            Saiful Tailors
          </h1>

          <p className="mb-6 text-center text-gray-600">
            Admin Login
          </p>

          <label className="mb-2 block font-medium">
            অ্যাডমিন পাসওয়ার্ড
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            className="mb-4 w-full rounded-lg border p-3"
            placeholder="পাসওয়ার্ড লিখুন"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black p-3 text-white disabled:opacity-50"
          >
            {loading ? "অপেক্ষা করুন..." : "লগইন করুন"}
          </button>

          {message && (
            <p role="alert" className="mt-4 text-center text-red-600">
              {message}
            </p>
          )}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Saiful Tailors Admin</h1>
            <p className="text-gray-600">কুপন ব্যবস্থাপনা</p>
          </div>

          <button
            onClick={() => {
              setLoggedIn(false);
              setCoupons([]);
            }}
            className="rounded-lg border bg-white px-4 py-2"
          >
            লগইন থেকে বের হন
          </button>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">মোট কুপন</p>
            <p className="text-2xl font-bold">{coupons.length}</p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">অনুমোদিত</p>
            <p className="text-2xl font-bold">
              {coupons.filter((c) => c.status === "approved").length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">বাতিল</p>
            <p className="text-2xl font-bold">
              {coupons.filter((c) => c.status === "cancelled").length}
            </p>
          </div>
        </section>

        {message && (
          <p role="status" className="mb-4 rounded-lg bg-white p-3">
            {message}
          </p>
        )}

        <section className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">কুপনের তালিকা</h2>

            <button
              onClick={loadCoupons}
              disabled={loading}
              className="rounded-lg border px-3 py-2 disabled:opacity-50"
            >
              {loading ? "লোড হচ্ছে..." : "রিফ্রেশ"}
            </button>
          </div>

          {coupons.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              {loading ? "লোড হচ্ছে..." : "এখনো কোনো কুপন পাওয়া যায়নি।"}
            </p>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <article
                  key={coupon.id}
                  className="rounded-lg border p-4"
                >
                  <p className="break-all text-xs text-gray-500">
                    কুপন ID: {coupon.id}
                  </p>

                  <p className="mt-2 font-semibold">
                    ডিসকাউন্ট: ৳{coupon.discount}
                  </p>

                  <p className="text-sm">
                    অর্ডার:{" "}
                    {coupon.orderAmount == null
                      ? "উল্লেখ নেই"
                      : `৳${coupon.orderAmount}`}
                  </p>

                  <p className="text-sm">
                    অবস্থা: {coupon.status}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        updateCoupon(coupon.id, "approved")
                      }
                      disabled={coupon.status === "approved"}
                      className="rounded-lg bg-green-700 px-3 py-2 text-white disabled:opacity-40"
                    >
                      অনুমোদন
                    </button>

                    <button
                      onClick={() =>
                        updateCoupon(coupon.id, "cancelled")
                      }
                      disabled={coupon.status === "cancelled"}
                      className="rounded-lg bg-red-700 px-3 py-2 text-white disabled:opacity-40"
                    >
                      বাতিল
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
