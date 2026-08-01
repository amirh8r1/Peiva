import { useNavigate } from 'react-router-dom';
import { Card, Tag, Typography, Button, Empty, List } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import { CONTRACT_TYPE_LABELS } from '@/types';
import type { Contract } from '@/types';

const { Text, Title } = Typography;

const statusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: 'پیش‌نویس' },
  sent: { color: 'processing', label: 'ارسال شده' },
  negotiating: { color: 'warning', label: 'در مذاکره' },
  finalized: { color: 'success', label: 'نهایی شده' },
};

export function SupplierContractsPage() {
  const navigate = useNavigate();
  const { data } = useData();
  const contracts = data.contracts;

  return (
    <>
      <PageHeader title="قراردادها" extra={
        <Button icon={<PlusCircleOutlined />} type="primary" size="small" onClick={() => navigate('/chains/new')}>قرارداد جدید</Button>
      } />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {contracts.length > 0 ? (
          <List dataSource={contracts} renderItem={(c: Contract) => {
            const sc = statusConfig[c.status];
            const bidCount = data.proposals.filter((p) => p.contractId === c.id).length;
            const acceptedCount = data.proposals.filter((p) => p.contractId === c.id && p.status === 'accepted' && c.status !== 'finalized').length;

            return (
              <Card hoverable size="small" style={{ marginBottom: 8, borderRadius: 10 }}
                onClick={() => {
                  if (c.status === 'sent' || c.status === 'negotiating') navigate(`/chains/${c.id}/farms`);
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text strong>{c.name}</Text>
                  <Tag color={sc.color}>{sc.label}</Tag>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <Tag>{CONTRACT_TYPE_LABELS[c.contractType]}</Tag>
                  <Text type="secondary" style={{ fontSize: 11 }}>تسهیم: ٪{formatNumber(c.profitSharingMin)}</Text>
                  {bidCount > 0 && <Text style={{ fontSize: 11 }}>📨 {formatNumber(bidCount)} پیشنهاد</Text>}
                  {acceptedCount > 0 && <Text style={{ fontSize: 11 }}>⏳ {formatNumber(acceptedCount)} در انتظار وثیقه</Text>}
                </div>
                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 4 }}>{c.createdAt}</Text>

                {(c.status === 'negotiating') && (
                  <Button size="small" type="primary" style={{ marginTop: 6 }} block>بررسی مزرعه‌داران</Button>
                )}
              </Card>
            );
          }} />
        ) : (
          <Empty description="هنوز قراردادی ایجاد نکرده‌اید">
            <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => navigate('/chains/new')}>اولین قرارداد</Button>
          </Empty>
        )}
      </div>
    </>
  );
}
