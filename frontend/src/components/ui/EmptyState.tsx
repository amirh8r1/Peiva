import { Button, Empty, Typography } from 'antd';
import { pivaType } from '@/config/theme';

const { Text } = Typography;

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * حالت خالی به‌عنوان دعوت به اقدام — توضیح می‌دهد چرا خالی است و قدم بعدی چیست،
 * نه فقط «چیزی نیست». جایگزین Empty پیش‌فرض در صفحات لیست.
 */
export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <Text strong style={{ fontSize: pivaType.body.fontSize }}>{title}</Text>
          {description && (
            <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize }}>{description}</Text>
          )}
          {actionLabel && onAction && (
            <Button type="primary" onClick={onAction} style={{ marginTop: 8 }}>
              {actionLabel}
            </Button>
          )}
        </div>
      }
    />
  );
}
