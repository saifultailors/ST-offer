import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;

    if (!adminPassword || !sessionSecret) {
      return NextResponse.json(
        { error: "Admin environment variables are not configured" },
        { status: 500 }
      );
    }

    if (
      typeof password !== "string" ||
      password.length !== adminPassword.length ||
      !timingSafeEqual(
        Buffer.from(password),
        Buffer.from(adminPassword)
      )
    ) {
      return NextResponse.json(
        { error: "ভুল পাসওয়ার্ড" },
        { status: 401 }
      );
    }

    const expires = Date.now() + 8 * 60 * 60 * 1000;
    const payload = String(expires);
    const signature = createHmac("sha256", sessionSecret)
      .update(payload)
      .digest("hex");

    const response = NextResponse.json({ success: true });

    response.cookies.set("admin_session", `${payload}.${signature}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "লগইন করা যায়নি" },
      { status: 400 }
    );
  }
}
