import { NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = adminDb();

    const snapshot = await db
      .collection("offers")
      .where("active", "==", true)
      .limit(10)
      .get();

    const now = Date.now();

    const activeOffers = snapshot.docs
      .map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          title: data.title ?? "বিশেষ মাসিক অফার",
          startAt: data.startAt ?? "",
          endAt: data.endAt ?? "",
          active: data.active === true,
          maxUsers: data.maxUsers ?? 50,
          minOrderAmount: data.minOrderAmount ?? 600,
        };
      })
      .filter((offer) => {
        const start = offer.startAt
          ? new Date(offer.startAt).getTime()
          : 0;

        const end = offer.endAt
          ? new Date(offer.endAt).getTime()
          : Number.MAX_SAFE_INTEGER;

        return start <= now && end >= now;
      });

    const offer = activeOffers[0] ?? null;

    let customers: {
      name: string;
      discount: number;
      status: string;
      couponCode: string;
      campaignId: string;
    }[] = [];

    if (offer) {
      const customerSnapshot = await db
        .collection("customers")
        .where("campaignId", "==", offer.id)
        .limit(50)
        .get();

      customers = customerSnapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          name: data.name ?? "গ্রাহক",
          discount: data.discount ?? 0,
          status: data.status ?? "pending",
          couponCode: data.couponCode ?? doc.id,
          campaignId: data.campaignId ?? offer.id,
        };
      });
    }

    return NextResponse.json({
      offer,
      customers,
    });
  } catch (error) {
    console.error("Public offer API error:", error);

    return NextResponse.json(
      { error: "অফারের তথ্য লোড করা যায়নি।", offer: null, customers: [] },
      { status: 500 }
    );
  }
}
