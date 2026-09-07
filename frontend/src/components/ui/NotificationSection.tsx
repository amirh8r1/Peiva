import { Badge, Button, Card, Space, Typography, theme } from 'antd';
import { CardGrid } from '@/components/ui/CardGrid';
import { formatNumber } from '@/utils/format';
import { pivaType } from '@/config/theme';

const { Text } = Typography;

/** آیتم نوتیف یکپارچه داشبوردها — همه انواع نوتیف به این شکل نرمال می‌شوند. */
export interface NotifyItem {
  id: string;
  title: string;
  body: React.ReactNode;
  onClick?: () => void;
  buttonLabel?: string;
}

export type NotifyKind = 'action' | 'info';

/**
 * کارت نوتیف — سطح خنثی با آکسنت رنگی:
 * action فقط با نوار شروع و نقطه وضعیت کهربایی علامت می‌خورد، نه پس‌زمینه کامل زرد.
 */
export function NotifyCard({ title, body, onClick, buttonLabel, kind }: NotifyItem & { kind: NotifyKind }) {
  const { token } = theme.useToken();
  const isAction = kind === 'action';
  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className={onClick ? 'piva-lift' : undefined}
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderInlineStart: isAction ? `3px solid ${token.colorWarning}` : undefined,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Space size={8}>
          <Badge status={isAction ? 'warning' : 'default'} />
          <Text strong style={{ fontSize: pivaType.body.fontSize }}>{title}</Text>
        </Space>
        <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block' }}>{body}</Text>
        {onClick && (
          <Button type={isAction ? 'primary' : 'default'} size="small" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
            {buttonLabel ?? (isAction ? 'پیگیری' : 'مشاهده')}
          </Button>
        )}
      </Space>
    </Card>
  );
}

/** سکشن نوتیف با عنوان + شمارنده و گرید ریسپانسیو — سازماندهی واحد داشبوردها. */
export function NotificationSection({ title, kind, items }: { title: string; kind: NotifyKind; items: NotifyItem[] }) {
  const { token } = theme.useToken();
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <Space size={6} style={{ marginBottom: 8 }}>
        <Text strong style={{ ...pivaType.sectionTitle }}>{title}</Text>
        <Badge count={formatNumber(items.length)} size="small" style={{ backgroundColor: kind === 'action' ? token.colorWarning : token.colorTextTertiary }} />
      </Space>
      <CardGrid minWidth={320} gap={12}>
        {items.map((item) => <NotifyCard key={item.id} kind={kind} {...item} />)}
      </CardGrid>
    </div>
  );
}

/** شکل مشترک آیتم‌های فلو پراگرس/وزن — تبدیل به NotifyItem با ناوبری به صفحه پیگیری. */
export function toNotifyItems(
  actions: { id: string; contractId: string; contractName: string; title?: string; stepLabel?: string; verb: string; kind: NotifyKind }[],
  navigateTo: (contractId: string) => void,
): NotifyItem[] {
  return actions.map((a) => ({
    id: a.id,
    title: a.title ?? a.stepLabel ?? '',
    body: `${a.contractName} — ${a.verb}`,
    onClick: () => navigateTo(a.contractId),
  }));
}
