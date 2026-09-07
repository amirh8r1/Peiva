import { Typography, theme } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { PrimaryCTA } from './PrimaryCTA';

const { Title, Text } = Typography;

interface SuccessScreenProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  actionLabel: string;
  onAction: () => void;
}

/**
 * صفحه موفقیت استاندارد — چک بزرگ سبز + عنوان + CTA وسط‌چین (نه full-bleed در دسکتاپ).
 */
export function SuccessScreen({ icon, title, subtitle, actionLabel, onAction }: SuccessScreenProps) {
  const { token } = theme.useToken();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: '48px 16px',
      gap: 12,
    }}>
      <span className="piva-check-pop" style={{ display: 'inline-flex' }}>
        {icon ?? <CheckCircleFilled style={{ fontSize: 64, color: token.colorPrimary }} />}
      </span>
      <Title level={4} style={{ margin: 0 }}>{title}</Title>
      {subtitle && <Text type="secondary">{subtitle}</Text>}
      <PrimaryCTA onClick={onAction}>{actionLabel}</PrimaryCTA>
    </div>
  );
}
