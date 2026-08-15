import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "@/db";
import { clickLogs, platforms } from "@/db/schema";

/**
 * مسیر خروجی به پلتفرم‌ها — §۱۱.۱ سند ساختار:
 * ریدایرکت ۳۰۲ + noindex؛ مقصد فقط از دیتابیس خوانده می‌شود (ضد open redirect).
 * هر کلیک با صفحهٔ مبدأ (p) و شناسهٔ کمپین (cid) لاگ می‌شود؛
 * اگر لاگ شکست بخورد، ریدایرکت نباید بشکند.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const db = getDb();

  const [platform] = await db
    .select({ id: platforms.id, domain: platforms.domain })
    .from(platforms)
    .where(eq(platforms.slug, slug))
    .limit(1);

  if (!platform) {
    return new NextResponse("پلتفرم پیدا نشد", { status: 404 });
  }

  try {
    await db.insert(clickLogs).values({
      platformId: platform.id,
      slug,
      page: request.nextUrl.searchParams.get("p"),
      cid: request.nextUrl.searchParams.get("cid"),
    });
  } catch (e) {
    console.error("ثبت لاگ کلیک شکست خورد:", e);
  }

  const response = NextResponse.redirect("https://" + platform.domain, 302);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
