import { theme as antdThemeUtil } from 'antd';
import type { ThemeConfig } from 'antd';

/**
 * تم روشن پیوا — پالت سبز جنگلی روی نئوترال‌های گرم (رنگ‌های زمین، نه خاکستری سرد antd).
 * منبع واحد توکن‌های طراحی — کامپوننت‌ها از theme.useToken() استفاده می‌کنند، نه hex مستقیم.
 * استراتژی نئوترال گرم: colorTextBase گرم می‌شود تا تینت‌های متن از آن مشتق شوند؛
 * کلیدهای سطح/بوردر/فیل صریح پین می‌شوند چون رَمپ خاکستری antd hue-neutral است.
 */
export const antdTheme: ThemeConfig = {
  token: {
    fontFamily: 'Vazirmatn, Tahoma, sans-serif',
    borderRadius: 8,
    colorPrimary: '#15803d',
    colorSuccess: '#16a34a',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    colorInfo: '#2563eb',
    // تینت‌های semantic ثابت — پین‌شده تا با تغییر primary جابه‌جا نشوند
    colorSuccessBg: '#f0fdf4',
    colorSuccessBgHover: '#dcfce7',
    colorSuccessBorder: '#bbf7d0',
    colorWarningBg: '#fffbeb',
    colorInfoBg: '#eff6ff',
    // نئوترال گرم (سنگ/زمین)
    colorTextBase: '#1c1917',
    colorText: '#1c1917',
    colorTextSecondary: '#57534e',
    colorTextTertiary: '#6f6a63',
    colorBgLayout: '#f7f5f1',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBorder: '#e7e5e4',
    colorBorderSecondary: '#e9e7e2',
    colorFill: 'rgba(28, 25, 23, 0.08)',
    colorFillSecondary: 'rgba(28, 25, 23, 0.05)',
    colorFillTertiary: 'rgba(28, 25, 23, 0.03)',
    colorFillQuaternary: 'rgba(28, 25, 23, 0.02)',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      bodyBg: '#f7f5f1',
    },
    Table: {
      headerBg: '#fafaf9',
    },
    Typography: {
      fontWeightStrong: 700, // هویت: تیترهای قوی‌تر در کل سامانه
    },
    Tabs: {
      itemSelectedColor: '#15803d',
      inkBarColor: '#15803d',
    },
    Card: {
      borderRadiusLG: 12, // کارت‌ها → ۱۲؛ radius های inline حذف می‌شوند
      boxShadow: '0 1px 2px rgba(28, 25, 23, 0.05)',
      boxShadowSecondary: '0 4px 16px rgba(28, 25, 23, 0.10)', // لیفت کارت‌های hoverable
    },
  },
};

/**
 * تم تیره پیوا — بدنه مایل‌به‌زیتونی عمیق، پالت معادل تم روشن روی سطوح dark.
 * سبز primary یک پله روشن‌تر (green-400) تا روی زمینه تیره خوانا بماند؛
 * tint های semantic به نسخه dark پالت نگاشت شده‌اند.
 */
export const antdThemeDark: ThemeConfig = {
  algorithm: antdThemeUtil.darkAlgorithm,
  token: {
    fontFamily: 'Vazirmatn, Tahoma, sans-serif',
    borderRadius: 8,
    colorPrimary: '#4ade80',
    colorSuccess: '#4ade80',
    colorWarning: '#f59e0b',
    colorError: '#f87171',
    colorInfo: '#60a5fa',
    colorSuccessBg: '#122116',
    colorSuccessBgHover: '#1e3a25',
    colorSuccessBorder: '#1e3a25',
    colorWarningBg: '#2d2413',
    colorInfoBg: '#15202e',
    // نئوترال گرم تیره
    colorTextBase: '#f5f5f4',
    colorText: '#f5f5f4',
    colorTextSecondary: '#a8a29e',
    colorTextTertiary: '#7a736e',
    colorBgLayout: '#101210',
    colorBgContainer: '#161816',
    colorBgElevated: '#1d201d',
    colorBorder: '#2a2e2a',
    colorBorderSecondary: '#242824',
    colorFill: 'rgba(250, 250, 249, 0.16)',
    colorFillSecondary: 'rgba(250, 250, 249, 0.10)',
    colorFillTertiary: 'rgba(250, 250, 249, 0.06)',
    colorFillQuaternary: 'rgba(250, 250, 249, 0.04)',
  },
  components: {
    Layout: {
      headerBg: '#161816', // هم‌سطح کارت‌ها — مرز با بدنه از بوردر/سایه می‌آید
      bodyBg: '#101210', // عمیق‌تر از کارت‌ها تا مرزها دیده شوند
    },
    Table: {
      headerBg: '#1d201d',
    },
    Typography: {
      fontWeightStrong: 700,
    },
    Tabs: {
      itemSelectedColor: '#4ade80',
      inkBarColor: '#4ade80',
    },
    Card: {
      borderRadiusLG: 12,
      boxShadow: '0 1px 2px rgba(0,0,0,0.32)',
      // در تیره سایه سیاه دیده نمی‌شود — حلقه نور کمرنگ + سایه عمیق‌تر = حس ارتفاع
      boxShadowSecondary: '0 0 0 1px rgba(250, 250, 249, 0.10), 0 8px 24px rgba(0, 0, 0, 0.60)',
    },
  },
};

/**
 * مقیاس تایپوگرافی پیوا — منبع واحد سایز/وزن فونت کامپوننت‌ها (مثل layout.ts برای ابعاد).
 * قاعده «بدون hardcode»: کامپوننت‌ها مقدار پراکنده نمی‌نویسند، از این آبجکت می‌خوانند.
 */
export const pivaType = {
  pageTitle: { fontSize: 20, fontWeight: 800 }, // تیتر صفحه
  sectionTitle: { fontSize: 15, fontWeight: 700 }, // تیتر سکشن
  statValue: { fontSize: 28, fontWeight: 800 }, // مقدار آمار — اعداد درشت فارسی امضای بصری
  statLabel: { fontSize: 12, fontWeight: 500 }, // لیبل آمار
  tab: { fontSize: 14, fontWeight: 600 }, // تب ناوبری هدر
  body: { fontSize: 14, fontWeight: 400 },
  secondary: { fontSize: 12, fontWeight: 400 },
  caption: { fontSize: 11, fontWeight: 400 },
} as const;

/**
 * رنگ‌های برند بدون معادل semantic در antd.
 * رنگ‌ها به متغیر CSS ارجاع می‌دهند (تعریف در index.css :root) تا با تم روشن/تیره سوییچ شوند؛
 * سایه‌ها در هر دو تم یکسانند و اینجا literal می‌مانند.
 */
export const pivaTokens = {
  brandDeep: 'var(--piva-brand-deep)', // سبز جنگلی — وردمارک و تأکیدهای برند
  orange: 'var(--piva-orange)', // آمار ضریب تبدیل (گندم/برداشت)
  purple: 'var(--piva-purple)', // آمار جوجه‌ریزی
  onPrimary: 'var(--piva-on-primary)', // رنگ عناصر روی سطح primary (در تیره primary روشن است)
  // سایه‌ها به var ارجاع می‌دهند چون در تم تیره باید قوی‌تر باشند تا دیده شوند
  shadowMobileShell: 'var(--piva-shadow-mobile-shell)',
  shadowHeader: 'var(--piva-shadow-header)',
  shadowBottomNav: 'var(--piva-shadow-bottom-nav)',
  shadowNotchInset: 'var(--piva-shadow-notch-inset)',
  shadowFabIdle: '0 3px 10px rgba(21,128,61,0.35)',
  shadowFabActive: '0 4px 18px rgba(21,128,61,0.55)',
} as const;
