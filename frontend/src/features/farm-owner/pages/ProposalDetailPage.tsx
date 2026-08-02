import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Tag, Empty } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <PageHeader title={contract.name} subtitle="جزئیات قرارداد" extra={
        <Button icon={<ArrowRightOutlined />} onClick={() => navigate('/farm/proposals')}>بازگشت</Button>
      } />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Card size="small" style={{ marginBottom: 10 }}>
          <Tag color="blue">{CONTRACT_TYPE_LABELS[contract.contractType]}</Tag>
          <Text style={{ marginRight: 8 }}>{contract.region}</Text>
          <Text style={{ marginRight: 8 }}>{formatNumber(contract.duration)} دوره</Text>
          <Text>جوجه‌ریزی: {formatNumber(totalChicks)} قطعه</Text>
        </Card>

        <Card size="small" style={{ marginBottom: 10 }} title="دوره‌ها">
          {contract.periods.map((p) => (
            <div key={p.index} style={{ marginBottom: 4 }}>
              <Text>دوره {p.index + 1}: </Text>
              <Text>{formatNumber(p.chickCount)} قطعه — وزن هدف {formatNumber(p.targetWeight)}g — تحویل {p.deliveryDate}</Text>
            </div>
          ))}
        </Card>

        <Card size="small" style={{ marginBottom: 10 }} title="شرایط">
          {terms.map((t) => <Tag key={t.id}>{t.label}</Tag>)}
        </Card>

        <Card size="small" style={{ marginBottom: 10 }} title="شیوه تسهیم">
          <Text strong>{method?.label}</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{method?.description}</Text>
          <div style={{ marginTop: 8 }}><Tag color="green">حداقل ٪{formatNumber(contract.profitSharingMin)}</Tag></div>
        </Card>

        <Card size="small" style={{ marginBottom: 10 }} title="تضامین مورد قبول">
          {collaterals.map((c) => <Tag key={c.id}>{c.icon} {c.label}</Tag>)}
        </Card>

        <Button type="primary" block size="large" onClick={() => navigate(`/farm/collateral/${contract.id}`)}>
          تأمین تضامین و نهایی کردن قرارداد
        </Button>
      </div>
    </div>
  );
}
