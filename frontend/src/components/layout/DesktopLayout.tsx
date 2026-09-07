import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { DesktopHeader } from './DesktopHeader';
import { PageTransition } from './PageTransition';
import { CONTENT_DESKTOP_MAX, CONTENT_PAD_DESKTOP } from '@/config/layout';

const { Content } = Layout;

/**
 * شل دسکتاپ (عرض ≥ ۷۶۸px): هدر با وردمارک + تب‌های افقی، محتوای وسط با حداکثر عرض.
 * ساختار flex column ارتفاع‌محدود مثل شل موبایل حفظ می‌شود تا صفحات بدون تغییر اسکرول کنند
 * (اسکرول داخل PageFrame صفحات است — اینجا overflow نکنیم).
 */
export function DesktopLayout() {
  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <DesktopHeader />
      <Content style={{
        flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        width: '100%', maxWidth: CONTENT_DESKTOP_MAX, margin: '0 auto', padding: `0 24px ${CONTENT_PAD_DESKTOP}px`,
      }}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </Content>
    </Layout>
  );
}
