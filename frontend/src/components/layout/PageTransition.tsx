import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * ورود محتوای صفحه با fade کوتاه هنگام تغییر route.
 * key بر pathname است (نه search) تا تغییر query (مثل ?tab=) انیمیت replay نکند.
 * wrapper با flex column تا صفحات fragment بدون تغییر کار کنند.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const { pathname } = useLocation();
  return (
    <div
      key={pathname}
      className="page-enter"
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
    >
      {children}
    </div>
  );
}
