import { config } from "dotenv";

config({ path: [".env.local", ".env"] });

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { z } from "zod";
import {
  dataChangeLog,
  funds,
  licenses,
  methods,
  platformFees,
  platforms,
  reviews,
} from "./schema";
import { seedPlatformSchema } from "../lib/schemas/platform";

/** هفت روش خرید طلا — §۶.۳ سند ساختار صفحات */
const METHODS = [
  {
    slug: "molten-gold",
    nameFa: "طلای آب‌شده",
    summary: "خرید طلای آب‌شده بدون اجرت ساخت، معمولاً با حداقل مبلغ کم.",
  },
  {
    slug: "gold-bar",
    nameFa: "شمش طلا",
    summary: "شمش با وزن‌های استاندارد و بسته‌بندی رسمی.",
  },
  {
    slug: "coin",
    nameFa: "سکهٔ طلا",
    summary: "سکهٔ بانک مرکزی؛ همیشه حباب قیمتی را چک کن.",
  },
  {
    slug: "jewelry",
    nameFa: "طلای زینتی",
    summary: "زیورآلات با اجرت ساخت، سود فروشنده و مالیات ارزش افزوده.",
  },
  {
    slug: "gold-fund",
    nameFa: "صندوق طلا",
    summary: "خرید غیرمستقیم طلا از طریق صندوق‌های بورسی.",
  },
  {
    slug: "commodity-certificate",
    nameFa: "گواهی سپرده کالایی",
    summary: "مالکیت طلای سپرده‌شده در انبار رسمی بورس کالا.",
  },
  {
    slug: "digital-gold",
    nameFa: "طلای دیجیتال",
    summary: "مالکیت دیجیتال طلا؛ وضعیت رگولاتوری را همیشه بررسی کن.",
  },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "❌ DATABASE_URL پیدا نشد. فایل .env.local را کنار package.json بساز و رشتهٔ اتصال Neon را داخلش بنویس.",
    );
    process.exit(1);
  }

  const db = drizzle(neon(url));

  const raw = JSON.parse(
    readFileSync(join(process.cwd(), "data/seed/platforms.json"), "utf8"),
  );
  const parsed = z.array(seedPlatformSchema).parse(raw);

  console.log("🧹 پاک‌سازی جداول به ترتیب امن…");
  await db.delete(reviews);
  await db.delete(dataChangeLog);
  await db.delete(platformFees);
  await db.delete(licenses);
  await db.delete(platforms);
  await db.delete(funds);
  await db.delete(methods);

  console.log(`🌱 واردکردن ${METHODS.length} روش خرید…`);
  for (const m of METHODS) {
    await db.insert(methods).values(m);
  }

  console.log(`🌱 واردکردن ${parsed.length} پلتفرم…`);
  for (const p of parsed) {
    const [row] = await db
      .insert(platforms)
      .values({
        slug: p.slug,
        nameFa: p.nameFa,
        domain: p.domain,
        methods: p.methods,
        status: p.status,
        isDemo: p.isDemo,
      })
      .returning({ id: platforms.id });

    for (const f of p.fees) {
      await db.insert(platformFees).values({
        platformId: row.id,
        method: f.method,
        buyFeePct: f.buyFeePct == null ? null : f.buyFeePct.toString(),
        sellFeePct: f.sellFeePct == null ? null : f.sellFeePct.toString(),
        minBuyToman: f.minBuyToman,
        withdrawalFeeToman: f.withdrawalFeeToman,
        physicalDelivery: f.physicalDelivery,
        fieldMeta: f.fieldMeta,
        observedAt: f.observedAt ? new Date(f.observedAt) : null,
      });
    }

    for (const l of p.licenses) {
      await db.insert(licenses).values({
        platformId: row.id,
        type: l.type,
        issuer: l.issuer ?? null,
        status: l.status,
        sourceUrl: l.sourceUrl ?? null,
        checkedAt: l.checkedAt ? new Date(l.checkedAt) : null,
      });
    }
  }

  console.log("✅ seed کامل شد:");
  for (const p of parsed) {
    console.log(`   • ${p.nameFa} (${p.slug})`);
  }
  console.log("برای دیدن نتیجه: npm run dev و بعد باز کردن مسیر /dev/db-check");
}

main().catch((e) => {
  console.error("❌ خطا در اجرای seed:", e);
  process.exit(1);
});
