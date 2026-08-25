import { Badge, Button, Card, Space, Typography, theme } from 'antd';
import { CardGrid } from '@/components/ui/CardGrid';
import { formatNumber } from '@/utils/format';

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

/** کارت نوتیف — action: زرد هشدار (نیازمند اقدام)؛ info: خنثی (اطلاع‌رسانی). */
export function NotifyCard({ title, body, onClick, buttonLabel, kind }: NotifyItem & { kind: NotifyKind }) {
  const { token } = theme.useToken();
  const isAction = kind === 'action';
  return (
    <Card
      style={{
        background: isAction ? token.colorWarningBg : token.colorFillSecondary,
        border: `1px solid ${isAction ? token.colorWarning : token.colorBorder}`,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <Space><Badge status={isAction ? 'warning' : 'default'} /><Text strong>{title}</Text></Space>
      <div style={{ marginTop: 4, fontSize: 12, color: token.colorText }}>{body}</div>
      {onClick && (
        <Button type={isAction ? 'primary' : 'default'} size="small" block style={{ marginTop: 8 }}>
          {buttonLabel ?? (isAction ? 'پیگیری' : 'مشاهده')}
        </Button>
      )}
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
        <Text strong style={{ fontSize: 13 }}>{title}</Text>
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
