import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let email: unknown;
  try {
    const body = await request.json();
    email = body?.email;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const supabase = createAdminClient();

  const { error: dbError } = await supabase
    .from("waitlist")
    .insert({ email: normalizedEmail });

  if (dbError && dbError.code !== "23505") {
    // 23505 = unique_violation — already on the list, treat as success
    console.error("waitlist insert failed", dbError);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: `Familiar Guest <${process.env.RESEND_FROM_EMAIL ?? "info@famguest.com"}>`,
        to: normalizedEmail,
        subject: "You're on the Familiar Guest waitlist",
        text: "Thanks for your interest in Familiar Guest. We'll be in touch as we open up early access.",
      });
    } catch (emailError) {
      // Don't fail the signup if the confirmation email fails to send
      console.error("waitlist confirmation email failed", emailError);
    }
  }

  return NextResponse.json({ ok: true });
}
