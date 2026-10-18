import { NextResponse } from "next/server";
import { createHash, randomInt, randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/admin";

const discounts = [40, 60, 80, 100, 120, 140, 160, 180, 200];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").replace(/\D/g, "");

    if (name.length < 2 || !/^01[3-9]\d{8}$/.test(phone)) {
      return NextResponse.json(
        { error: "সঠিক নাম ও মোবাইল নম্বর দিন।" },
        { status: 400 }
      );
    }

    const db = adminDb();
    const now = new Date();

    const offers = await db
      .collection("offers")
      .where("active", "==", true)
      .get();

    const activeOffer = offers.docs.find((doc) => {
      const offer = doc.data();

      return (
        (!offer.startAt || new Date(offer.startAt) <= now) &&
        (!offer.endAt || new Date(offer.endAt) >= now)
      );
    });

    if (!activeOffer) {
      return NextResponse.json(
        { error: "বর্তমানে কোনো অফার চালু নেই।" },
        { status: 400 }
      );
    }

    const phoneHash = createHash("sha256")
      .update(phone)
      .digest("hex");

    const customerId = `${activeOffer.id}_${phoneHash}`;
    const customerRef = db.collection("customers").doc(customerId);

    const couponCode =
      "ST-" + randomUUID().slice(0, 8).toUpperCase();

    const discount = discounts[randomInt(discounts.length)];
    const offerData = activeOffer.data();

    const result = await db.runTransaction(async (tx) => {
      const existing = await tx.get(customerRef);

      if (existing.exists) {
        return {
          error: "আপনি ইতিমধ্যে এই মাসের অফার গ্রহণ করেছেন।"
        };
      }

      const customers = await tx.get(
        db.collection("customers").where(
          "campaignId",
          "==",
          activeOffer.id
        )
      );

      const count = customers.docs.filter(
        (doc) => doc.data().status !== "cancelled"
      ).length;

      if (count >= Number(offerData.maxUsers || 50)) {
        return {
          error: "এই অফারের ৫০টি কুপন ইতিমধ্যে পূর্ণ হয়েছে।"
        };
      }

      tx.create(customerRef, {
        name,
        phoneHash,
        discount,
        status: "pending",
        couponCode,
        campaignId: activeOffer.id,
        createdAt: FieldValue.serverTimestamp()
      });

      return {
        coupon: {
          name,
          discount,
          couponCode,
          status: "pending",
          campaignId: activeOffer.id
        }
      };
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 409 }
      );
    }

    return NextResponse.json({
      ...result,
      message: "আপনার অফার তৈরি হয়েছে!"
    });

  } catch (error) {
    console.error("Offer error:", error);

    return NextResponse.json(
      { error: "সার্ভারে সমস্যা হয়েছে। সেটিংস পরীক্ষা করুন।" },
      { status: 500 }
    );
  }
}
