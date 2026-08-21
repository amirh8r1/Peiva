import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Tag, Empty, Space, theme } from 'antd';
import {
  ArrowRightOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  FileTextOutlined,
  PercentageOutlined,
  SafetyOutlined,
  SkinOutlined,
} from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageFrame } from '@/components/ui/PageFrame';
import { CardGrid } from '@/components/ui/CardGrid';
import { StatTile } from '@/components/ui/StatTile';
import { ProfitShareBadge } from '@/components/ui/ProfitShareBadge';
import { PrimaryCTA } from '@/components/ui/PrimaryCTA';
import { formatNumber, toPersianDigits } from '@/utils/format';
import { CONTRACT_TYPE_LABELS, TERM_TEMPLATES, PROFIT_METHODS, COLLATERAL_TYPE_LIST } from '@/types';
import { useIsDesktop } from '@/hooks/useResponsive';

const { Text } = Typography;

export function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { token } = theme.useToken();
  const { data } = useData();

  const contract = data.contracts.find((c) => c.id === id);
  if (!contract) return <Empty description="قرارداد یافت نشد" />;

  const terms = TERM_TEMPLATES.filter((t) => contract.selectedTermIds.includes(t.id));
  const method = PROFIT_METHODS.find((m) => m.id === contract.profitMethodId);
  const collaterals = COLLATERAL_TYPE_LIST.filter((c) => contract.acceptedCollateralTypes.includes(c.id));
  const totalChicks = contract.periods.reduce((s, p) => s + p.chickCount, 0);

  return (
    <PageFrame header={
      <PageHeader title={contract.name} subtitle="جزئیات قرارداد" extra={
        <Button icon={<ArrowRightOutlined />} onClick={() => navigate('/farm/proposals')}>بازگشت</Button>
      } />
    }>
      {/* ── Summary grid ── */}
      <Card size="small" style={{ marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : '1fr 1fr', gap: 8 }}>
          <StatTile icon={<FileTextOutlined />} label="نوع قرارداد" value={CONTRACT_TYPE_LABELS[contract.contractType]} tone="info" />
          <StatTile icon={<EnvironmentOutlined />} label="استان" value={contract.region} tone="success" />
          <StatTile icon={<CalendarOutlined />} label="مدت قرارداد" value={`${formatNumber(contract.duration)} دوره`} tone="warning" />
          <StatTile icon={<SkinOutlined />} label="کل جوجه‌ریزی" value={`${formatNumber(totalChicks)} قطعه`} tone="purple" />
        </div>
      </Card>

      {/* ── Periods ── */}
      <Card
        size="small"
        title={<Space><CalendarOutlined /><span>دوره‌های پرورش</span></Space>}
        style={{ marginBottom: 12 }}
      >
        <CardGrid minWidth={480} gap={12} mobileSpacing={8}>
          {contract.periods.map((p) => (
            <Card
              key={p.index}
              size="small"
              style={{
                background: token.colorFillSecondary,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
              styles={{ body: { padding: '12px 16px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Tag color="blue" style={{ margin: 0, fontSize: 12, fontWeight: 600, borderRadius: token.borderRadius, padding: '2px 10px' }}>
                  دوره {p.index + 1}
                </Tag>
                <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                  <Text style={{ fontSize: 13 }}>
                    <Text type="secondary">تعداد: </Text>
                    <Text strong>{formatNumber(p.chickCount)}</Text> قطعه
                  </Text>
                  <Text style={{ fontSize: 13 }}>
                    <Text type="secondary">وزن هدف: </Text>
                    <Text strong>{formatNumber(p.targetWeight)}</Text> گرم
                  </Text>
                  <Text style={{ fontSize: 13 }}>
                    <Text type="secondary">تحویل: </Text>
                    <Text strong>{toPersianDigits(p.deliveryDate)}</Text>
                  </Text>
                </div>
              </div>
            </Card>
          ))}
        </CardGrid>
      </Card>

      {/* ── Terms ── */}
      <Card
        size="small"
        title={<Space><FileTextOutlined /><span>شرایط و تعهدات</span></Space>}
        style={{ marginBottom: 12 }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {terms.map((t) => (
            <Tag key={t.id} color="blue" style={{ fontSize: 12, padding: '4px 10px', borderRadius: token.borderRadius }}>
              {t.label}
            </Tag>
          ))}
        </div>
        {terms.length === 0 && <Text type="secondary">شرایطی انتخاب نشده است</Text>}
      </Card>

      {/* ── Profit sharing ── */}
      <Card
        size="small"
        title={<Space><PercentageOutlined /><span>شیوه و درصد تسهیم</span></Space>}
        style={{ marginBottom: 12 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <Text strong style={{ fontSize: 14 }}>{method?.label}</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 11, marginTop: 2 }}>{method?.description}</Text>
          </div>
          <ProfitShareBadge percent={contract.profitSharingMin} size="sm" />
        </div>
      </Card>

      {/* ── Collateral types ── */}
      <Card
        size="small"
        title={<Space><SafetyOutlined /><span>تضامین مورد قبول</span></Space>}
        style={{ marginBottom: 12 }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {collaterals.map((c) => (
            <Tag key={c.id} color="green" style={{ fontSize: 13, padding: '4px 10px', borderRadius: token.borderRadius }}>
              {c.icon} {c.label}
            </Tag>
          ))}
        </div>
        {collaterals.length === 0 && <Text type="secondary">تضامینی انتخاب نشده است</Text>}
      </Card>

      {/* ── Action ── */}
      <PrimaryCTA icon={<SafetyOutlined />} onClick={() => navigate(`/farm/collateral/${contract.id}`)}>
        تأمین تضامین و نهایی کردن قرارداد
      </PrimaryCTA>
    </PageFrame>
  );
}
