import { theme as antdThemeUtil } from 'antd';
import type { ThemeConfig } from 'antd';

/**
 * تم روشن پیوا — پالت سبز کشاورزی.
 * منبع واحد توکن‌های طراحی — کامپوننت‌ها از theme.useToken() استفاده می‌کنند، نه hex مستقیم.
 */
export const antdTheme: ThemeConfig = {
  token: {
    fontFamily: 'Vazirmatn, Tahoma, sans-serif',
    borderRadius: 8,
    colorPrimary: '#389e0d',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
    // پس‌زمینه‌های semantic ثابت — پین‌شده تا با تغییر primary جابه‌جا نشوند
    colorSuccessBg: '#f6ffed',
    colorSuccessBgHover: '#d9f7be',
    colorSuccessBorder: '#b7eb8f',
    colorWarningBg: '#fff7e6',
    colorInfoBg: '#e6f4ff',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#001529',
      bodyBg: '#f5f5f5',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#389e0d',
      darkItemHoverBg: '#0d3b05',
    },
    Table: {
      headerBg: '#fafafa',
    },
    Typography: {
      fontWeightStrong: 700, // هویت: تیترهای قوی‌تر در کل سامانه
    },
    Card: {
      borderRadiusLG: 12, // کارت‌ها → ۱۲؛ radius های inline حذف می‌شوند
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      boxShadowSecondary: '0 4px 16px rgba(0,0,0,0.08)', // لیفت کارت‌های hoverable
    },
  },
};

/**
 * تم تیره پیوا — پالت معادل تم روشن روی سطوح dark.
 * سبز primary یک پله روشن‌تر (green-6) تا روی زمینه تیره خوانا بماند؛
 * tint های semantic به نسخه dark پالت antd نگاشت شده‌اند (green/blue/orange-1 dark).
 */
export const antdThemeDark: ThemeConfig = {
  algorithm: antdThemeUtil.darkAlgorithm,
  token: {
    fontFamily: 'Vazirmatn, Tahoma, sans-serif',
    borderRadius: 8,
    colorPrimary: '#52c41a',
    colorSuccess: '#73d13d',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#4096ff',
    colorSuccessBg: '#162312',
    colorSuccessBgHover: '#274916',
    colorSuccessBorder: '#274916',
    colorWarningBg: '#2b2111',
    colorInfoBg: '#111a2c',
    // سیستم ارتفاع: بدنه عمیق‌ترین، کارت‌ها یک پله بالاتر، مودال‌ها بالاترین
    colorBgContainer: '#1a1a1a',
    colorBgElevated: '#242424',
  },
  components: {
    Layout: {
      headerBg: '#1a1a1a', // هم‌سطح کارت‌ها — مرز با بدنه از بوردر/سایه می‌آید
      siderBg: '#001529', // همان ناوی برند — در هر دو تم
      bodyBg: '#0f0f0f', // عمیق‌تر از کارت‌ها تا مرزها دیده شوند
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#389e0d',
      darkItemHoverBg: '#0d3b05',
    },
    Table: {
      headerBg: '#1f1f1f',
    },
    Typography: {
      fontWeightStrong: 700,
    },
    Card: {
      borderRadiusLG: 12,
      boxShadow: '0 1px 2px rgba(0,0,0,0.32)',
      boxShadowSecondary: '0 4px 16px rgba(0,0,0,0.48)',
    },
  },
};

/**
 * رنگ‌های برند بدون معادل semantic در antd.
 * رنگ‌ها به متغیر CSS ارجاع می‌دهند (تعریف در index.css :root) تا با تم روشن/تیره سوییچ شوند؛
 * سایه‌ها در هر دو تم یکسانند و اینجا literal می‌مانند.
 */
export const pivaTokens = {
  brandDeep: 'var(--piva-brand-deep)', // سبز جنگلی — وردمارک و تأکیدهای برند
  orange: 'var(--piva-orange)', // آمار ضریب تبدیل
  purple: 'var(--piva-purple)', // آمار جوجه‌ریزی
  // سایه‌ها به var ارجاع می‌دهند چون در تم تیره باید قوی‌تر باشند تا دیده شوند
  shadowMobileShell: 'var(--piva-shadow-mobile-shell)',
  shadowHeader: 'var(--piva-shadow-header)',
  shadowBottomNav: 'var(--piva-shadow-bottom-nav)',
  shadowNotchInset: 'var(--piva-shadow-notch-inset)',
  shadowFabIdle: '0 3px 10px rgba(56,158,13,0.35)',
  shadowFabActive: '0 4px 18px rgba(56,158,13,0.55)',
} as const;
