# شروع سریع روی ویندوز

دستورها را در **PowerShell یا ترمینال Cursor** اجرا کن، نه در پنجرهٔ چت Cursor.

## ۱) رفتن به پوشهٔ پروژه

```powershell
cd "C:\Users\MahDi\Documents\GitHub\talasanj"
```

ابتدای خط باید به `...\talasanj>` ختم شود. روش ساده‌تر: داخل File Explorer وارد پوشهٔ پروژه شو، روی نوار آدرس بنویس `powershell` و Enter بزن.

## ۲) نصب وابستگی‌ها

```powershell
npm install
```

## ۳) بررسی کامل با یک دستور

```powershell
npm run check
```

این فرمان ۴۷ تست، TypeScript و build را اجرا می‌کند. برای build باید `.env.local` و `DATABASE_URL` معتبر کنار `package.json` باشد.

## ۴) اجرای سایت

```powershell
npm run dev
```

آدرسی را باز کن که Next.js می‌نویسد؛ معمولاً `http://localhost:3000` است. برای توقف `Ctrl + C` را بزن.

## خطای ENOENT / package.json

این خطا یعنی بیرون پوشهٔ پروژه هستی. دوباره مرحلهٔ ۱ را انجام بده؛ مسیر را به‌تنهایی تایپ نکن و حتماً قبلش `cd` بگذار.
