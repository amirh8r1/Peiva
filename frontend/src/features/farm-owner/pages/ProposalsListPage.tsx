import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Tag, Typography, Button, Empty, Spin, List } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { proposalService } from '@/features/contracts/services/contract.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import type { FarmProposal } from '@/types';

const { Text, Title } = Typography;

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'processing', label: 'در انتظار' },
  accepted: { color: 'success', label: 'تأیید شده' },
  rejected: { color: 'error', label: 'رد شده' },
};

export function ProposalsListPage() {
  const navigate = useNavigate();
  const { data: proposals, isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => proposalService.getByFarmId('farm-1'),
  });

  return (
    <>
      <PageHeader title="قراردادهای پیشنهادی" subtitle="پیشنهادهای دریافت شده از تأمین‌کنندگان" />

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : proposals && proposals.length > 0 ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <List
            dataSource={proposals}
            renderItem={(p: FarmProposal) => {
              const sc = statusConfig[p.status];
              return (
                <Card
                  hoverable
                  style={{ marginBottom: 12, borderRadius: 10 }}
                  onClick={() => navigate(`/proposals/${p.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Title level={5} style={{ margin: 0 }}>{p.contractName}</Title>
                    <Tag color={sc.color}>{sc.label}</Tag>
                  </div>
                  <div style={{ display: 'flex', gap: 24, marginBottom: 8 }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>درصد پیشنهادی شما</Text>
                      <div><Text strong>٪{formatNumber(p.proposedPercentage)}</Text></div>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>گرید مزرعه</Text>
                      <div><Tag>{p.farmGrade}</Tag></div>
                    </div>
                  </div>
                  <Text type="secondary" style={{ fontSize: 11 }}>ارسال شده در {p.submittedAt}</Text>
                  {p.status === 'accepted' && (
                    <Button type="primary" size="small" style={{ marginTop: 8 }} block>
                      تأمین وثیقه و نهایی کردن
                    </Button>
                  )}
                </Card>
              );
            }}
          />
        </div>
      ) : (
        <Empty description="هیچ قرارداد پیشنهادی ندارید" />
      )}
    </>
  );
}
