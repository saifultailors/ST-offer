import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

function createSignature(expires: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(expires)
    .digest("hex");
}

export function verifyAdminSession(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) return false;

  const session = request.cookies.get("admin_session")?.value;

  if (!session) return false;

  const parts = session.split(".");

  if (parts.length !== 2) return false;

  const [expires, receivedSignature] = parts;

  if (!/^\d+$/.test(expires)) return false;

  if (Number(expires) <= Date.now()) return false;

  if (!/^[a-f0-9]{64}$/i.test(receivedSignature)) {
    return false;
  }

  const expectedSignature = createSignature(expires, secret);

  const received = Buffer.from(receivedSignature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  if (received.length !== expected.length) return false;

  return timingSafeEqual(received, expected);
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "অনুমতি নেই। প্রথমে অ্যাডমিন লগইন করুন।" },
    { status: 401 }
  );
}
