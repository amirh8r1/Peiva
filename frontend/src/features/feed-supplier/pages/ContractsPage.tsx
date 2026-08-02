import { useNavigate } from 'react-router-dom';
import { Card, Tag, Typography, Button, Empty, List } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import { CONTRACT_TYPE_LABELS } from '@/types';
import type { Contract } from '@/types';

const { Text, Title } = Typography;

export function SupplierContractsPage() {
  const navigate = useNavigate();
  const { data } = useData();

  return (
    <>
      <PageHeader title="قراردادها" extra={
        <Button icon={<PlusCircleOutlined />} type="primary" size="small" onClick={() => navigate('/supplier/contracts/new')}>قرارداد جدید</Button>
      } />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {data.contracts.length > 0 ? (
          <List dataSource={data.contracts} renderItem={(c: Contract) => (
            <Card size="small" style={{ marginBottom: 8, borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text strong>{c.name}</Text>
                <Tag color={c.status === 'sent' ? 'processing' : c.status === 'finalized' ? 'success' : 'default'}>
                  {c.status === 'sent' ? 'ارسال شده' : c.status === 'finalized' ? 'نهایی' : 'پیش‌نویس'}
                </Tag>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Tag>{CONTRACT_TYPE_LABELS[c.contractType]}</Tag>
                <Text style={{ fontSize: 11 }}>{c.region}</Text>
                <Text style={{ fontSize: 11 }}>{formatNumber(c.duration)} دوره</Text>
                <Text style={{ fontSize: 11 }}>{formatNumber(c.selectedFarmIds.length)} مزرعه</Text>
              </div>
              <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 4 }}>{c.createdAt}</Text>
            </Card>
          )} />
        ) : (
          <Empty description="قراردادی ندارید">
            <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => navigate('/supplier/contracts/new')}>اولین قرارداد</Button>
          </Empty>
        )}
      </div>
    </>
  );
}
