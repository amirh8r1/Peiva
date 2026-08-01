import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Slider, Button, Typography, Tag, Spin, Empty, message } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { contractService, proposalService } from '@/features/contracts/services/contract.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import { CONTRACT_TYPE_LABELS } from '@/types';

const { Text, Title } = Typography;

export function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [percent, setPercent] = useState(35);
  const [submitted, setSubmitted] = useState(false);

  const { data: proposals } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => proposalService.getByFarmId('farm-1'),
  });

  const proposal = proposals?.find((p) => p.id === id);
  const contractId = proposal?.contractId;

  const { data: contract } = useQuery({
    queryKey: ['contracts', contractId],
    queryFn: () => contractService.getById(contractId!),
    enabled: !!contractId,
  });

  if (!proposal) return <Empty description="پیشنهاد یافت نشد" />;
  if (!contract) return <Spin />;

  const handleSubmit = () => {
    setSubmitted(true);
    message.success(`درصد مشارکت ${formatNumber(percent)}٪ ثبت شد`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <PageHeader title={contract.chainName} subtitle="جزئیات قرارداد پیشنهادی" extra={
        <Button icon={<ArrowRightOutlined />} onClick={() => navigate('/proposals')}>بازگشت</Button>
      } />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Card style={{ marginBottom: 12 }}>
          <Title level={5}>شرایط قرارداد</Title>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <Tag>{CONTRACT_TYPE_LABELS[contract.contractType]}</Tag>
            <Text>حداقل تسهیم: ٪{formatNumber(contract.profitSharingMin)}</Text>
          </div>
          <Text>{contract.terms}</Text>
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <Title level={5}>درصد مشارکت پیشنهادی شما</Title>
          <Slider
            min={contract.profitSharingMin}
            max={60}
            value={percent}
            onChange={setPercent}
            disabled={submitted}
            marks={{
              [contract.profitSharingMin]: `${formatNumber(contract.profitSharingMin)}٪`,
              40: '۴۰٪',
              50: '۵۰٪',
              60: '۶۰٪',
            }}
          />
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <Text strong style={{ fontSize: 22, color: '#389e0d' }}>
              ٪{formatNumber(percent)}
            </Text>
          </div>
          <Button
            type="primary"
            block
            size="large"
            onClick={handleSubmit}
            disabled={submitted}
          >
            {submitted ? 'ثبت شد' : 'ثبت درصد مشارکت'}
          </Button>
        </Card>

        {submitted && proposal.status === 'accepted' && (
          <Card style={{ background: '#f6ffed' }}>
            <Text type="success">پیشنهاد شما تأیید شده است.</Text>
            <Button
              type="primary"
              block
              style={{ marginTop: 12 }}
              onClick={() => navigate(`/proposals/${proposal.id}/collateral`)}
            >
              تأمین وثیقه و نهایی کردن قرارداد
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
