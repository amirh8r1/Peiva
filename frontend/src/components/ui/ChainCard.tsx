import { useNavigate } from 'react-router-dom';
import { Card, Steps, Typography, Space, Tag, Button, Row, Col } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { Chain } from '@/types';
import { CHAIN_TRACKING_STEPS, getTrackingStepIndex } from '@/types';
import { formatNumber } from '@/utils/format';
import { StatTile } from '@/components/ui/StatTile';

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
          <StatTile
            direction="column"
            label="تعداد مزرعه"
            value={<>{formatNumber(chain.farms.length)} <Text style={{ fontSize: 12 }}> عدد</Text></>}
            tone="success"
          />
        </Col>
        <Col span={8}>
          <StatTile
            direction="column"
            label="مجموع جوجه‌ریزی"
            value={<>{formatNumber(chain.totalChicks)} <Text style={{ fontSize: 12 }}> قطعه</Text></>}
            tone="info"
          />
        </Col>
        <Col span={8}>
          <StatTile
            direction="column"
            label="ضریب تبدیل"
            value={chain.predictedConversionRatio != null ? formatNumber(chain.predictedConversionRatio, 2) : '—'}
            tone="warning"
          />
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
