import {
  bigint,
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * سطوح اطمینان داده (§۶ سند ساخت):
 * declared = اعلامی خود پلتفرم | observed = مشاهدهٔ ما | reported = گزارش کاربران | unknown = نامشخص
 */
export const confidenceEnum = pgEnum("confidence", [
  "declared",
  "observed",
  "reported",
  "unknown",
]);

export const platformStatusEnum = pgEnum("platform_status", [
  "active",
  "suspended",
  "closed",
]);

export const licenseStatusEnum = pgEnum("license_status", [
  "verified",
  "pending",
  "unverified",
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "pending",
  "approved",
  "rejected",
]);

export const fundTypeEnum = pgEnum("fund_type", ["etf", "market_making"]);

export type FieldMeta = {
  confidence: "declared" | "observed" | "reported" | "unknown";
  source?: string;
  observedAt?: string;
};

export const platforms = pgTable("platforms", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameFa: text("name_fa").notNull(),
  domain: text("domain").notNull(),
  methods: jsonb("methods").$type<string[]>().notNull().default([]),
  status: platformStatusEnum("status").notNull().default("active"),
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const platformFees = pgTable("platform_fees", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id")
    .notNull()
    .references(() => platforms.id, { onDelete: "cascade" }),
  method: text("method").notNull(),
  buyFeePct: numeric("buy_fee_pct", { precision: 6, scale: 3 }),
  sellFeePct: numeric("sell_fee_pct", { precision: 6, scale: 3 }),
  minBuyToman: bigint("min_buy_toman", { mode: "number" }),
  withdrawalFeeToman: bigint("withdrawal_fee_toman", { mode: "number" }),
  physicalDelivery: boolean("physical_delivery"),
  /** قانون طلایی: هر عدد، منبع و تاریخ دارد — متا فیلد‌به‌فیلد اینجاست */
  fieldMeta: jsonb("field_meta")
    .$type<Record<string, FieldMeta>>()
    .notNull()
    .default({}),
  observedAt: timestamp("observed_at", { withTimezone: true }),
});

export const licenses = pgTable("licenses", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id")
    .notNull()
    .references(() => platforms.id, { onDelete: "cascade" }),
  /** union_guild | enamad | samandehi | online_gold_license | other */
  type: text("type").notNull(),
  issuer: text("issuer"),
  status: licenseStatusEnum("status").notNull().default("pending"),
  sourceUrl: text("source_url"),
  checkedAt: timestamp("checked_at", { withTimezone: true }),
});

export const methods = pgTable("methods", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameFa: text("name_fa").notNull(),
  summary: text("summary"),
});

export const funds = pgTable("funds", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  nameFa: text("name_fa").notNull(),
  type: fundTypeEnum("type").notNull().default("etf"),
  managementFeePct: numeric("management_fee_pct", { precision: 5, scale: 3 }),
  minInvestmentToman: bigint("min_investment_toman", { mode: "number" }),
  underlying: text("underlying"),
  manager: text("manager"),
  marketMaker: text("market_maker"),
  sourceUrl: text("source_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id")
    .notNull()
    .references(() => platforms.id, { onDelete: "cascade" }),
  /** ۱ تا ۵ — اعتبارسنجی در لایهٔ Zod انجام می‌شود */
  rating: integer("rating").notNull(),
  body: text("body").notNull(),
  authorName: text("author_name"),
  verifiedExperience: boolean("verified_experience").notNull().default(false),
  status: reviewStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** تاریخچهٔ تغییر داده‌ها — منبع سکشن «تاریخچهٔ داده» در پروفایل */
export const dataChangeLog = pgTable("data_change_log", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  field: text("field").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  note: text("note"),
  changedAt: timestamp("changed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
