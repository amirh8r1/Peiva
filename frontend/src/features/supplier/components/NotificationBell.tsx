import { useState } from 'react';
import { Badge, Button, Empty, Popover, Typography, theme } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { getParticipantNotifications, CENTER_GROUPS } from '../utils/notifications';
import { pivaType } from '@/config/theme';

const { Text } = Typography;

/**
 * زنگوله نوتیفیکیشن‌های پنل مشارکت‌کننده — گروه‌بندی بر اساس موضوعیت.
 * seen درون‌حافظه‌ای است (prototype): با باز شدن، همه خوانده می‌شوند و بج صفر می‌شود.
 */
export function NotificationBell() {
  const navigate = useNavigate();
  const { data } = useData();
  const { token } = theme.useToken();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  const items = getParticipantNotifications(data);
  const unseen = items.filter((i) => i.kind === 'action' && !seen.has(i.id)).length;

  const handleClick = (id: string, to: string) => {
    setSeen((prev) => new Set(prev).add(id));
    setOpen(false);
    navigate(to);
  };

  const content = (
    <div style={{
      width: 'min(320px, calc(100vw - 32px))',
      maxHeight: 'min(70vh, 520px)',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      {items.length === 0 && (
        <Empty description="نوتیفی ندارید" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '24px 0' }} />
      )}
      {CENTER_GROUPS.map((g) => {
        const groupItems = items.filter((i) => i.group === g.key);
        if (groupItems.length === 0) return null;
        return (
          <div key={g.key} style={{ padding: '10px 16px', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
            <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 4 }}>{g.label}</Text>
            {groupItems.map((i) => (
              <div
                key={i.id}
                onClick={() => handleClick(i.id, i.to)}
                style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  padding: '8px 4px', cursor: 'pointer', borderRadius: token.borderRadius,
                }}
              >
                <Badge status={i.kind === 'action' ? 'warning' : 'default'} style={{ marginTop: 5, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <Text strong style={{ fontSize: pivaType.secondary.fontSize, display: 'block' }}>{i.title}</Text>
                  <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize }}>{i.body}</Text>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSeen(new Set(items.map((i) => i.id)));
      }}
      content={content}
      placement="bottomLeft"
      overlayInnerStyle={{ padding: '12px 0' }}
    >
      {/* wrapper inline-flex + lineHeight ۱: line-height هدر (۴۸/۶۴px) روی Badge ننشیند تا بالا نپرد */}
      <span style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>
        <Badge count={unseen} overflowCount={9} size="small">
          <Button type="text" icon={<BellOutlined style={{ fontSize: 17 }} />} aria-label="نوتیفیکیشن‌ها" />
        </Badge>
      </span>
    </Popover>
  );
}
