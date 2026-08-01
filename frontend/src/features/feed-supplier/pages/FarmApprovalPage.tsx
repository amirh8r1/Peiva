import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Tag, Button, Typography, List, message, Space } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { proposalService } from '@/features/contracts/services/contract.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import type { FarmProposal } from '@/types';

const { Text, Title } = Typography;

export function FarmApprovalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [decisions, setDecisions] = useState<Record<string, 'accepted' | 'rejected'>>({});

  const { data: proposals, isLoading } = useQuery({
    queryKey: ['proposals', id],
    queryFn: () => proposalService.getAllForContract(id!),
    enabled: !!id,
  });

  const handleDecide = (propId: string, decision: 'accepted' | 'rejected') => {
    setDecisions((p) => ({ ...p, [propId]: decision }));
    message.success(decision === 'accepted' ? 'مزرعه تأیید شد' : 'مزرعه رد شد');
  };

  const allDecided = proposals?.every((p) => decisions[p.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <PageHeader title="بررسی مزرعه‌داران" subtitle="پیشنهادهای دریافت شده را بررسی و تأیید کنید" />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {proposals && proposals.length > 0 ? (
          <>
            <List
              dataSource={proposals}
              renderItem={(p: FarmProposal) => {
                const decision = decisions[p.id];
                return (
                  <Card style={{ marginBottom: 10, borderRadius: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <Text strong>{p.farmName}</Text>
                        <Tag style={{ marginRight: 8 }}>{p.farmGrade}</Tag>
                      </div>
                      {decision && (
                        <Tag color={decision === 'accepted' ? 'success' : 'error'}>
                          {decision === 'accepted' ? 'تأیید شده' : 'رد شده'}
                        </Tag>
                      )}
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>درصد پیشنهادی:</Text>
                      <Text strong style={{ fontSize: 18, color: '#389e0d', marginRight: 8 }}>
                        ٪{formatNumber(p.proposedPercentage)}
                      </Text>
                    </div>
                    {!decision ? (
                      <Space>
                        <Button
                          size="small"
                          type="primary"
                          icon={<CheckOutlined />}
                          onClick={() => handleDecide(p.id, 'accepted')}
                        >
                          تأیید
                        </Button>
                        <Button
                          size="small"
                          danger
                          icon={<CloseOutlined />}
                          onClick={() => handleDecide(p.id, 'rejected')}
                        >
                          رد
                        </Button>
                      </Space>
                    ) : (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {p.submittedAt}
                      </Text>
                    )}
                  </Card>
                );
              }}
            />
            {allDecided && (
              <Button type="primary" block size="large" style={{ marginTop: 12 }} onClick={() => navigate('/contracts')}>
                اتمام بررسی و ثبت نهایی
              </Button>
            )}
          </>
        ) : (
          <Text type="secondary">هنوز پیشنهادی دریافت نشده است.</Text>
        )}
      </div>
    </div>
  );
}
