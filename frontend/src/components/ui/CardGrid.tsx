import { Children, type ReactNode } from 'react';
import { useIsDesktop } from '@/hooks/useResponsive';
import { responsiveGrid } from '@/utils/responsive';

interface CardGridProps {
  children: ReactNode;
  /** حداقل عرض هر کارت در گرید دسکتاپ */
  minWidth?: number;
  /** فاصله گرید دسکتاپ */
  gap?: number;
  /** فاصله پایینی هر کارت در پشته موبایل */
  mobileSpacing?: number;
}

/**
 * استک کارت‌ها: گرید در دسکتاپ، پشته با فاصله در موبایل.
 * جایگزین الگوی responsiveGrid + wrapper موبایل.
 */
export function CardGrid({ children, minWidth = 360, gap = 16, mobileSpacing = 10 }: CardGridProps) {
  const isDesktop = useIsDesktop();

  return (
    <div style={isDesktop ? responsiveGrid(minWidth, gap) : undefined}>
      {Children.map(children, (child) => (
        <div style={{ marginBottom: isDesktop ? 0 : mobileSpacing }}>{child}</div>
      ))}
    </div>
  );
}
