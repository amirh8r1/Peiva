import type { CSSProperties } from 'react';
import { FORM_COLUMN_MAX } from '@/config/layout';

/**
 * استایل گرید دسکتاپ برای استک‌های کارت.
 * صفحات فقط در حالت دسکتاپ این استایل را اعمال می‌کنند؛ در موبایل wrapper بدون style می‌ماند.
 */
export function responsiveGrid(minWidth = 320, gap = 12): CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
    gap,
  };
}

/**
 * وسط‌چین کردن ستون فرم/محتوا در دسکتاپ (موبایل = {} یعنی صفر تغییر ظاهری).
 */
export function centeredForm(isDesktop: boolean, maxWidth = FORM_COLUMN_MAX): CSSProperties {
  return isDesktop ? { width: '100%', maxWidth, margin: '0 auto' } : {};
}

/**
 * وسط‌چین کردن CTA های block در دسکتاپ (موبایل = {} یعنی صفر تغییر ظاهری).
 * display:'block' لازم است چون دکمه antd به‌صورت inline-flex رندر می‌شود
 * و margin auto روی آن بی‌اثر است.
 */
export function centeredCTA(isDesktop: boolean, maxWidth = 520, marginTop = 16): CSSProperties {
  return isDesktop
    ? { display: 'block', width: '100%', maxWidth, margin: `${marginTop}px auto 0` }
    : {};
}
