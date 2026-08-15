import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "@/db";
import { platforms } from "@/db/schema";

/**
 * مسیر خروجی به پلتفرم‌ها — §۱۱.۱ سند ساختار:
 * ریدایرکت ۳۰۲ + noindex؛ مقصد فقط از دیتابیس خوانده می‌شود (ضد open redirect).
 * لاگ کلیک و cid در S6 به این مسیر اضافه می‌شود.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const db = getDb();

  const [platform] = await db
    .select({ domain: platforms.domain })
    .from(platforms)
    .where(eq(platforms.slug, slug))
    .limit(1);

  if (!platform) {
    return new NextResponse("پلتفرم پیدا نشد", { status: 404 });
  }

  const response = NextResponse.redirect("https://" + platform.domain, 302);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
