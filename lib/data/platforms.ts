import { and, eq, ilike, ne, or } from "drizzle-orm";
import { getDb } from "@/db";
import {
  dataChangeLog,
  licenses,
  methods,
  platformFees,
  platforms,
  reviews,
} from "@/db/schema";
import { computeScore } from "@/lib/scoring";

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

/** ردیف کامل هر پلتفرم برای دایرکتوری و صفحهٔ اصلی: داده + امتیاز محاسبه‌شده */
export async function listDirectoryEntries() {
  const db = getDb();
  const [platformRows, feeRows, licenseRows, reviewRows, methodRows] =
    await Promise.all([
      db.select().from(platforms),
      db.select().from(platformFees),
      db.select().from(licenses),
      db.select().from(reviews).where(eq(reviews.status, "approved")),
      db.select().from(methods),
    ]);

  const methodNames = new Map(methodRows.map((m) => [m.slug, m.nameFa]));

  return platformRows.map((p) => {
    const pFees = feeRows.filter((f) => f.platformId === p.id);
    const pLicenses = licenseRows.filter((l) => l.platformId === p.id);
    const pReviews = reviewRows.filter((r) => r.platformId === p.id);
    const reviewAvg =
      pReviews.length > 0
        ? pReviews.reduce((s, r) => s + r.rating, 0) / pReviews.length
        : null;
    const score = computeScore({
      fees: pFees,
      licenses: pLicenses,
      review: { approvedCount: pReviews.length, approvedAvg: reviewAvg },
      platformStatus: p.status,
    });
    const latestDataAt =
      pFees
        .map((f) => f.observedAt)
        .filter((d): d is Date => d !== null)
        .sort((a, b) => b.getTime() - a.getTime())[0]
        ?.toISOString() ?? null;
    const primaryFee =
      pFees.find((f) => f.method === "molten-gold") ?? pFees[0] ?? null;
    return {
      platform: p,
      fees: pFees,
      licenses: pLicenses,
      reviewCount: pReviews.length,
      reviewAvg,
      score,
      latestDataAt,
      primaryFee,
      methodNames,
    };
  });
}

/** آمار زندهٔ صفحهٔ اصلی — همیشه از دیتابیس، هرگز عدد ثابت در کد */
export async function getSiteStats() {
  const db = getDb();
  const [platformRows, feeRows, reviewRows] = await Promise.all([
    db.select({ id: platforms.id }).from(platforms),
    db.select({ observedAt: platformFees.observedAt }).from(platformFees),
    db
      .select({ id: reviews.id })
      .from(reviews)
      .where(eq(reviews.status, "approved")),
  ]);
  const latestDataAt =
    feeRows
      .map((f) => f.observedAt)
      .filter((d): d is Date => d !== null)
      .sort((a, b) => b.getTime() - a.getTime())[0]
      ?.toISOString() ?? null;
  return {
    platformCount: platformRows.length,
    reviewCount: reviewRows.length,
    latestDataAt,
  };
}

/** فهرست روش‌های خرید — برای فیلترها و کارت‌ها */
export async function listMethods() {
  const db = getDb();
  return db.select().from(methods);
}

/** پلتفرم‌های فعال ارائه‌دهندهٔ یک روش + ردیف کارمزد همان روش — صفحهٔ /methods/[slug] */
export async function listPlatformsForMethod(methodSlug: string) {
  const db = getDb();
  const feeRows = await db
    .select()
    .from(platformFees)
    .where(eq(platformFees.method, methodSlug));
  const platformRows = await db
    .select()
    .from(platforms)
    .where(eq(platforms.status, "active"));
  const byId = new Map(platformRows.map((p) => [p.id, p]));
  return feeRows.flatMap((f) => {
    const platform = byId.get(f.platformId);
    return platform ? [{ fee: f, platform }] : [];
  });
}

/** جستجوی سراسری سمت سرور — صفحهٔ /search/ (noindex) */
export async function searchAll(query: string) {
  const db = getDb();
  const q = `%${query.trim()}%`;
  const [platformRows, methodRows] = await Promise.all([
    db
      .select()
      .from(platforms)
      .where(
        or(
          ilike(platforms.nameFa, q),
          ilike(platforms.slug, q),
          ilike(platforms.domain, q),
        ),
      )
      .limit(10),
    db
      .select()
      .from(methods)
      .where(or(ilike(methods.nameFa, q), ilike(methods.slug, q)))
      .limit(10),
  ]);
  return { platforms: platformRows, methods: methodRows };
}
