import { useNavigate } from 'react-router-dom';
import { Button, Empty, Typography, message } from 'antd';
import { useData } from '@/context/DataContext';
import { PageFrame } from '@/components/ui/PageFrame';
import { PageHeader } from '@/components/ui/PageHeader';
import { CardGrid } from '@/components/ui/CardGrid';
import { ContractCard } from '@/components/ui/ContractCard';
import { getStepsForContract } from '@/features/progress/utils/progress.utils';

const { Text } = Typography;

/**
 * قراردادهای مزرعه‌دار — دو بخش:
 * ۱) در انتظار تأیید هماهنگی (انتخاب زنجیره‌دار) → دکمه تأیید، قرارداد نهایی می‌شود؛
 * ۲) جاری و تکمیل‌شده → فلو اجرا. (کانونشن دمو: همه قراردادها متعلق به همین مزرعه‌اند.)
 */
export function FarmContractsPage() {
  const navigate = useNavigate();
  const { data, dispatch } = useData();

  const awaiting = data.contracts.filter((c) => c.status === 'awaiting_farm');
  const active = data.contracts.filter((c) => c.status === 'finalized' || c.status === 'completed');

  const confirmCoordination = (id: string) => {
    dispatch({ type: 'UPDATE_CONTRACT_STATUS', payload: { id, status: 'finalized' } });
    message.success('هماهنگی تأیید شد — کار وارد فاز اجرا شد.');
  };

  return (
    <PageFrame header={<PageHeader title="قراردادهای من" />}>
      {awaiting.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>در انتظار تأیید هماهنگی</Text>
          <CardGrid minWidth={320} gap={12}>
            {awaiting.map((c) => (
              <ContractCard
                key={c.id}
                contract={c}
                steps={[]}
                extra={
                  <Button type="primary" block onClick={() => confirmCoordination(c.id)}>
                    تأیید هماهنگی و شروع کار
                  </Button>
                }
              />
            ))}
          </CardGrid>
        </div>
      )}

      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>قراردادهای جاری و تکمیل‌شده</Text>
      <CardGrid minWidth={320} gap={12}>
        {active.map((c) => (
          <ContractCard
            key={c.id}
            contract={c}
            steps={getStepsForContract(data.progressSteps, c.id)}
            onOpen={() => navigate(`/farm/contracts/${c.id}/progress`)}
          />
        ))}
      </CardGrid>
      {awaiting.length === 0 && active.length === 0 && <Empty description="قراردادی ندارید" />}
    </PageFrame>
  );
}
