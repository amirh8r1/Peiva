import { Typography, Space } from 'antd';
import type { ReactNode } from 'react';

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
        marginTop: 16,
        marginBottom: 16,
        flexShrink: 0,
      }}
    >
      <div>
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        {subtitle && (
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            {subtitle}
          </Typography.Text>
        )}
      </div>
      {extra && <Space>{extra}</Space>}
    </div>
  );
}
