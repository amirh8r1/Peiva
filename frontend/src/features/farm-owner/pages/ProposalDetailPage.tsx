import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Tag, Empty, Space, Divider } from 'antd';
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
import { formatNumber, toPersianDigits } from '@/utils/format';
import { CONTRACT_TYPE_LABELS, TERM_TEMPLATES, PROFIT_METHODS, COLLATERAL_TYPE_LIST } from '@/types';

const { Text, Title } = Typography;

export function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data } = useData();

  const contract = data.contracts.find((c) => c.id === id);
  if (!contract) return <Empty description="قرارداد یافت نشد" />;

  const terms = TERM_TEMPLATES.filter((t) => contract.selectedTermIds.includes(t.id));
  const method = PROFIT_METHODS.find((m) => m.id === contract.profitMethodId);
  const collaterals = COLLATERAL_TYPE_LIST.filter((c) => contract.acceptedCollateralTypes.includes(c.id));
  const totalChicks = contract.periods.reduce((s, p) => s + p.chickCount, 0);

  const summaryItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#fafafa',
    borderRadius: 10,
    padding: '12px 14px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <PageHeader title={contract.name} subtitle="جزئیات قرارداد" extra={
        <Button icon={<ArrowRightOutlined />} onClick={() => navigate('/farm/proposals')}>بازگشت</Button>
      } />
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {/* ── Summary grid ── */}
        <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={summaryItemStyle}>
              <FileTextOutlined style={{ fontSize: 18, color: '#1677ff' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>نوع قرارداد</Text>
                <Text strong style={{ fontSize: 13 }}>{CONTRACT_TYPE_LABELS[contract.contractType]}</Text>
              </div>
            </div>
            <div style={summaryItemStyle}>
              <EnvironmentOutlined style={{ fontSize: 18, color: '#389e0d' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>استان</Text>
                <Text strong style={{ fontSize: 13 }}>{contract.region}</Text>
              </div>
            </div>
            <div style={summaryItemStyle}>
              <CalendarOutlined style={{ fontSize: 18, color: '#fa8c16' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>مدت قرارداد</Text>
                <Text strong style={{ fontSize: 13 }}>{formatNumber(contract.duration)} دوره</Text>
              </div>
            </div>
            <div style={summaryItemStyle}>
              <SkinOutlined style={{ fontSize: 18, color: '#722ed1' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>کل جوجه‌ریزی</Text>
                <Text strong style={{ fontSize: 13 }}>{formatNumber(totalChicks)} قطعه</Text>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Periods ── */}
        <Card
          size="small"
          title={<Space><CalendarOutlined /><span>دوره‌های پرورش</span></Space>}
          style={{ marginBottom: 12, borderRadius: 12 }}
        >
          {contract.periods.map((p, idx) => (
            <Card
              key={p.index}
              size="small"
              style={{
                marginBottom: idx < contract.periods.length - 1 ? 8 : 0,
                borderRadius: 10,
                background: '#fafafa',
                border: '1px solid #f0f0f0',
              }}
              styles={{ body: { padding: '10px 14px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Tag color="blue" style={{ margin: 0, fontSize: 12, fontWeight: 600, borderRadius: 8, padding: '2px 10px' }}>
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
        </Card>

        {/* ── Terms ── */}
        <Card
          size="small"
          title={<Space><FileTextOutlined /><span>شرایط و تعهدات</span></Space>}
          style={{ marginBottom: 12, borderRadius: 12 }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {terms.map((t) => (
              <Tag key={t.id} color="blue" style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8 }}>
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
          style={{ marginBottom: 12, borderRadius: 12 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <Text strong style={{ fontSize: 14 }}>{method?.label}</Text>
              <Text type="secondary" style={{ display: 'block', fontSize: 11, marginTop: 2 }}>{method?.description}</Text>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
              borderRadius: 12,
              padding: '10px 20px',
              textAlign: 'center',
              border: '2px solid #b7eb8f',
            }}>
              <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>حداقل سهم مزرعه‌دار</Text>
              <Text strong style={{ fontSize: 26, color: '#389e0d', lineHeight: 1.2 }}>
                ٪{formatNumber(contract.profitSharingMin)}
              </Text>
            </div>
          </div>
        </Card>

        {/* ── Collateral types ── */}
        <Card
          size="small"
          title={<Space><SafetyOutlined /><span>تضامین مورد قبول</span></Space>}
          style={{ marginBottom: 12, borderRadius: 12 }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {collaterals.map((c) => (
              <Tag key={c.id} color="green" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 8 }}>
                {c.icon} {c.label}
              </Tag>
            ))}
          </div>
          {collaterals.length === 0 && <Text type="secondary">تضامینی انتخاب نشده است</Text>}
        </Card>

        {/* ── Action ── */}
        <Button
          type="primary"
          block
          size="large"
          icon={<SafetyOutlined />}
          onClick={() => navigate(`/farm/collateral/${contract.id}`)}
          style={{ height: 48, borderRadius: 12, fontSize: 15, fontWeight: 600 }}
        >
          تأمین تضامین و نهایی کردن قرارداد
        </Button>
      </div>
    </div>
  );
}
