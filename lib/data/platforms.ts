import { and, eq, ne } from "drizzle-orm";
import { getDb } from "@/db";
import {
  dataChangeLog,
  licenses,
  methods,
  platformFees,
  platforms,
  reviews,
} from "@/db/schema";

/** همهٔ داده‌های لازم برای قالب پروفایل پلتفرم (§۴.۲ سند ساختار) یک‌جا */
export async function getPlatformProfile(slug: string) {
  const db = getDb();

  const [platform] = await db
    .select()
    .from(platforms)
    .where(eq(platforms.slug, slug))
    .limit(1);
  if (!platform) return null;

  const [
    feeRows,
    licenseRows,
    approvedReviewRows,
    methodRows,
    changeRows,
    otherPlatforms,
  ] = await Promise.all([
    db
      .select()
      .from(platformFees)
      .where(eq(platformFees.platformId, platform.id)),
    db.select().from(licenses).where(eq(licenses.platformId, platform.id)),
    db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.platformId, platform.id),
          eq(reviews.status, "approved"),
        ),
      ),
    db.select().from(methods),
    db
      .select()
      .from(dataChangeLog)
      .where(
        and(
          eq(dataChangeLog.entityType, "platform"),
          eq(dataChangeLog.entityId, platform.id),
        ),
      ),
    db
      .select({
        slug: platforms.slug,
        nameFa: platforms.nameFa,
        methods: platforms.methods,
        status: platforms.status,
      })
      .from(platforms)
      .where(ne(platforms.slug, slug)),
  ]);

  const methodNames = new Map(methodRows.map((m) => [m.slug, m.nameFa]));

  /** رقبای نزدیک برای «مقایسهٔ سریع»: همان روش + وضعیت فعال */
  const siblings = otherPlatforms
    .filter(
      (o) =>
        o.status === "active" &&
        o.methods.some((m) => platform.methods.includes(m)),
    )
    .slice(0, 3);

  const approvedReviewAvg =
    approvedReviewRows.length > 0
      ? approvedReviewRows.reduce((sum, r) => sum + r.rating, 0) /
        approvedReviewRows.length
      : null;

  const latestDataAt =
    feeRows
      .map((f) => f.observedAt)
      .filter((d): d is Date => d !== null)
      .sort((a, b) => b.getTime() - a.getTime())[0]
      ?.toISOString() ?? null;

  return {
    platform,
    feeRows,
    licenseRows,
    methodNames,
    approvedReviewCount: approvedReviewRows.length,
    approvedReviewAvg,
    changeRows,
    siblings,
    latestDataAt,
  };
}

/** فهرست پلتفرم‌های فعال + ردیف کارمزدشان برای یک روش — ورودی ابزار هزینهٔ واقعی */
export async function listPlatformFeesForMethod(methodSlug: string) {
  const db = getDb();
  const platformRows = await db
    .select({
      id: platforms.id,
      slug: platforms.slug,
      nameFa: platforms.nameFa,
    })
    .from(platforms)
    .where(eq(platforms.status, "active"));

  const feeRows = await db
    .select()
    .from(platformFees)
    .where(eq(platformFees.method, methodSlug));

  const feeByPlatform = new Map(feeRows.map((f) => [f.platformId, f]));

  return platformRows.map((p) => ({
    slug: p.slug,
    nameFa: p.nameFa,
    fee: feeByPlatform.get(p.id) ?? null,
  }));
}
