import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Tag, Typography, Button, Empty, Spin, List } from 'antd';
import { PlusCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { contractService } from '@/features/contracts/services/contract.service';
import { collateralService } from '@/features/contracts/services/contract.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { CONTRACT_TYPE_LABELS } from '@/types';
import type { Contract } from '@/types';

const { Text, Title } = Typography;

const statusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: 'پیش‌نویس' },
  sent: { color: 'processing', label: 'ارسال شده' },
  negotiating: { color: 'warning', label: 'در مذاکره' },
  approved: { color: 'success', label: 'تأیید شده' },
  finalized: { color: 'success', label: 'نهایی شده' },
};

export function SupplierContractsPage() {
  const navigate = useNavigate();
  const { data: contracts, isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractService.getAll(),
  });

  return (
    <>
      <PageHeader
        title="قراردادها"
        subtitle="مدیریت قراردادهای ایجاد شده"
        extra={
          <Button icon={<PlusCircleOutlined />} type="primary" onClick={() => navigate('/chains/new')}>
            زنجیره جدید
          </Button>
        }
      />

      {isLoading ? (
        <Spin />
      ) : contracts && contracts.length > 0 ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <List
            dataSource={contracts}
            renderItem={(c: Contract) => {
              const sc = statusConfig[c.status];
              return (
                <Card hoverable style={{ marginBottom: 10, borderRadius: 10 }} onClick={() => navigate(`/contracts/${c.id}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Title level={5} style={{ margin: 0 }}>{c.chainName}</Title>
                    <Tag color={sc.color}>{sc.label}</Tag>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <Tag>{CONTRACT_TYPE_LABELS[c.contractType]}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>حداقل تسهیم: ٪{c.profitSharingMin}</Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 6 }}>{c.createdAt}</Text>

                  {c.status === 'sent' && (
                    <Button size="small" type="primary" style={{ marginTop: 8 }} onClick={(e) => { e.stopPropagation(); navigate(`/chains/${c.chainId}/farms`); }}>
                      بررسی مزرعه‌داران
                    </Button>
                  )}
                </Card>
              );
            }}
          />
        </div>
      ) : (
        <Empty description="هیچ قراردادی ندارید">
          <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => navigate('/chains/new')}>
            ایجاد اولین قرارداد
          </Button>
        </Empty>
      )}
    </>
  );
}
