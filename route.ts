import { NextResponse } from "next/server";
import { timingSafeEqual, createHmac } from "crypto";
export async function POST(req: Request) {
  const { password } = await req.json();
  const expected = process.env.ADMIN_PASSWORD || "";
  const a = Buffer.from(String(password || ""));
  const b = Buffer.from(expected);
  if (!expected || a.length !== b.length || !timingSafeEqual(a, b))
    return NextResponse.json({ error: "পাসওয়ার্ড সঠিক নয়।" }, { status: 401 });
  const token = createHmac("sha256", expected).update("saiful-tailors-admin").digest("hex");
  const response = NextResponse.json({ ok: true });
  response.cookies.set("st_admin", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}
