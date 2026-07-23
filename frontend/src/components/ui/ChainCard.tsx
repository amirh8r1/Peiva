import { useNavigate } from 'react-router-dom';
import { Card, Steps, Typography, Space, Tag, Button, Row, Col } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { Chain } from '@/types';
import { CHAIN_TRACKING_STEPS, getTrackingStepIndex } from '@/types';
import { formatNumber } from '@/utils/format';

const { Text, Title } = Typography;

const statusColorMap = {
  draft: 'default',
  active: 'processing',
  completed: 'success',
  cancelled: 'error',
} as const;

const statusLabelMap = {
  draft: 'پیش‌نویس',
  active: 'فعال',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
} as const;

interface ChainCardProps {
  chain: Chain;
}

export function ChainCard({ chain }: ChainCardProps) {
  const navigate = useNavigate();
  const trackingIdx = getTrackingStepIndex(chain.currentStep);

  return (
    <Card
      hoverable
      style={{ borderRadius: 12 }}
      onClick={() => navigate(`/chains/${chain.id}`)}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        <div>
          <Space style={{ marginBottom: 4 }}>
            <Title level={5} style={{ margin: 0 }}>
              {chain.name}
            </Title>
            <Tag color={statusColorMap[chain.status]}>
              {statusLabelMap[chain.status]}
            </Tag>
          </Space>
          <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
            ایجاد شده در {chain.createdAt}
          </Text>
        </div>
      </div>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <div
            style={{
              background: '#f6ffed',
              borderRadius: 8,
              padding: '8px 12px',
              textAlign: 'center',
            }}
          >
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
              تعداد مزرعه
            </Text>
            <Text strong style={{ fontSize: 18, color: '#389e0d' }}>
              {formatNumber(chain.farms.length)}
              <Text style={{ fontSize: 12 }}> عدد</Text>
            </Text>
          </div>
        </Col>
        <Col span={8}>
          <div
            style={{
              background: '#e6f7ff',
              borderRadius: 8,
              padding: '8px 12px',
              textAlign: 'center',
            }}
          >
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
              مجموع جوجه‌ریزی
            </Text>
            <Text strong style={{ fontSize: 18, color: '#1677ff' }}>
              {formatNumber(chain.totalChicks)}
              <Text style={{ fontSize: 12 }}> قطعه</Text>
            </Text>
          </div>
        </Col>
        <Col span={8}>
          <div
            style={{
              background: '#fff7e6',
              borderRadius: 8,
              padding: '8px 12px',
              textAlign: 'center',
            }}
          >
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
              ضریب تبدیل
            </Text>
            <Text strong style={{ fontSize: 18, color: '#fa8c16' }}>
              {chain.predictedConversionRatio != null ? formatNumber(chain.predictedConversionRatio, 2) : '—'}
            </Text>
          </div>
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        <Steps
          current={trackingIdx}
          size="small"
          status={chain.status === 'completed' ? 'finish' : 'process'}
          items={CHAIN_TRACKING_STEPS.map((s) => ({
            title: <Text style={{ fontSize: 10 }}>{s.label}</Text>,
          }))}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/chains/${chain.id}`);
          }}
          block
        >
          جزئیات بیشتر
        </Button>
      </div>
    </Card>
  );
}
