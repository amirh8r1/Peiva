# پروژه جهاد — پلتفرم اکوسیستمی زنجیره تأمین مرغ گوشتی

## معماری اکوسیستم

این پروژه یک **اکوسیستم** چند-پلتفرمی است (مشابه اسنپ‌فود):

| پلتفرم | کاربر هدف | شرح |
|--------|-----------|-----|
| مزرعه‌دار | مرغداران | ثبت مزرعه، مدیریت ظرفیت، اعلام وضعیت |
| تأمین‌کننده جوجه | جوجه‌فروشان | ثبت موجودی جوجه یکروزه، قیمت‌گذاری |
| تأمین‌کننده دان | دان‌فروشان | ثبت موجودی خوراک، قیمت‌گذاری |
| کشتارگاه | صاحبان کشتارگاه | اعلام ظرفیت روزانه، قیمت‌گذاری |
| انبار سردخانه | انبارداران | ثبت ظرفیت انبار، ساعت کاری |
| **پیوا (ما)** | **زنجیره‌کن / مزرعه‌دار** | **ایجاد زنجیره، مناقصه، مدیریت قرارداد** |

## پلتفرم پیوا v2 — تغییرات جدید

### دو نقش کاربری
- **مزرعه‌دار**: مشاهده پیشنهادهای قرارداد، ثبت درصد مشارکت، تأمین وثیقه
- **تأمین‌کننده نهاده**: ایجاد زنجیره، تعریف شرایط قرارداد، تأیید/رد مزرعه‌داران

### Responsive Design (پاسخگویی)
- **Breakpoint: ۷۶۸px** — طراحی بسته به اندازه صفحه «سینک» می‌شود
- **موبایل (<۷۶۸px):** Top App Bar + BottomNav با FAB، شل max-width 480 — طراحی فعلی موبایل دست‌نخورده
- **دسکتاپ (≥۷۶۸px):** سایدبار راست (Menu تیره) + هدر + محتوای وسط max-width 1100
- استک کارت‌ها در دسکتاپ گرید `auto-fill minmax`؛ لیست قراردادها با `List grid`؛ فرم‌ها در ستون ۶۴۰px وسط‌چین؛ CTA ها max-width ۵۲۰ وسط‌چین

## قوانین توسعه

### ۱. DRY — هرگز کد تکراری ننویس
- اگر ۲+ بار کد مشابه مینویسی، فوراً abstraction جنریک بساز

### ۲. AI-Friendly Data
- داده‌ها structured، labeled، با شناسه‌های یکتا و timestamp
- اسامی فیلدها meaningful و قابل فهم برای LLMها

### ۳. امنیت (AFTA Compliance)
- validation روی تمام inputها
- sanitize داده‌های mock
- آماده‌سازی ساختار برای audit log

### ۴. Responsive — گوشی و مانیتور
- زیر ۷۶۸px: طراحی موبایل برای عرض ۳۶۰-۴۸۰px (max-width container، نوار پایین)
- از ۷۶۸px به بالا: پترن دسکتاپ (سایدبار راست + گرید کارت‌ها + محتوای وسط)
- منطق ریسپانسیو فقط از ابزارهای مشترک `useIsDesktop()` / `responsiveGrid()` / `centeredCTA()` — هرگز `window.innerWidth` ad-hoc

### ۵. Reusability
- `SelectionCard` جنریک برای تمام entity types
- `EntitySelectionStep` برای تمام گام‌های ویزارد
- از Ant Design تا جای ممکن استفاده کن

### ۶. آمادگی برای API واقعی
- تمام سرویس‌ها از `apiClient.ts` استفاده می‌کنند
- تعویض mock با API واقعی = تغییر فقط `apiClient.ts`

## تکنولوژی‌ها

| لایه | انتخاب |
|------|--------|
| Frontend | React 18 + Vite + TypeScript |
| UI | Ant Design 5 (RTL) |
| Routing | React Router v6 |
| Server State | TanStack Query v5 |
| Font | Vazirmatn (Google Fonts) |
| Container | Docker + Nginx |
| Backend (آینده) | NestJS + PostgreSQL |

## اجرا

```bash
# Development با hot reload
docker compose -f deploy/docker-compose.dev.yml up -d

# Production
docker compose -f deploy/docker-compose.yml up --build -d
# → http://localhost:3000
```

---

*آخرین به‌روزرسانی: ۱۴۰۵/۰۵/۲۲*
