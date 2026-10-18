import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";
import {
  verifyAdminSession,
  unauthorizedResponse,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return unauthorizedResponse();
  }

  try {
    const db = adminDb();

    const snapshot = await db
      .collection("customers")
      .limit(200)
      .get();

    const coupons = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        status: data.status ?? "pending",
        discount: data.discount ?? 0,
        createdAt: data.createdAt ?? null,
        campaignId: data.campaignId ?? null,
        orderAmount: data.orderAmount ?? null,
      };
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Admin coupons GET error:", error);

    return NextResponse.json(
      { error: "কুপনের তথ্য আনা যায়নি। Firebase সেটিংস পরীক্ষা করুন।" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();

    const id = body.id;
    const status = body.status;

    if (
      typeof id !== "string" ||
      !["approved", "cancelled"].includes(status)
    ) {
      return NextResponse.json(
        { error: "কুপনের তথ্য সঠিক নয়।" },
        { status: 400 }
      );
    }

    const db = adminDb();
    const couponRef = db.collection("customers").doc(id);

    await db.runTransaction(async (transaction) => {
      const coupon = await transaction.get(couponRef);

      if (!coupon.exists) {
        throw new Error("COUPON_NOT_FOUND");
      }

      transaction.update(couponRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
    });

    return NextResponse.json({
      success: true,
      message:
        status === "approved"
          ? "কুপন অনুমোদন করা হয়েছে।"
          : "কুপন বাতিল করা হয়েছে।",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "COUPON_NOT_FOUND"
    ) {
      return NextResponse.json(
        { error: "কুপনটি পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    console.error("Admin coupons PATCH error:", error);

    return NextResponse.json(
      { error: "কুপনের অবস্থা পরিবর্তন করা যায়নি।" },
      { status: 500 }
    );
  }
}
