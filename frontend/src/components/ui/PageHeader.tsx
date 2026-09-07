import { Typography, Space } from 'antd';
import type { ReactNode } from 'react';
import { pivaType } from '@/config/theme';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}

export function PageHeader({ title, subtitle, extra }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 12,
        marginBottom: 12,
        flexShrink: 0,
      }}
    >
      <div>
        <Title level={4} style={{ margin: 0, ...pivaType.pageTitle }}>
          {title}
        </Title>
        {subtitle && (
          <Typography.Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize }}>
            {subtitle}
          </Typography.Text>
        )}
      </div>
      {extra && <Space>{extra}</Space>}
    </div>
  );
}
