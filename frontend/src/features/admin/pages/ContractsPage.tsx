import { useNavigate } from 'react-router-dom';
import { Typography } from 'antd';
import { useData } from '@/context/DataContext';
import { PageFrame } from '@/components/ui/PageFrame';
import { PageHeader } from '@/components/ui/PageHeader';
import { CardGrid } from '@/components/ui/CardGrid';
import { ContractCard } from '@/components/ui/ContractCard';
import { getStepsForContract } from '@/features/progress/utils/progress.utils';
import { pivaType } from '@/config/theme';
import { EmptyState } from '@/components/ui/EmptyState';

const { Text } = Typography;

/** قراردادهای زنجیره‌دار — پایش اجرا؛ قرارداد در انتظار تأیید مزرعه فقط نمایش داده می‌شود. */
export function AdminContractsPage() {
  const navigate = useNavigate();
  const { data } = useData();

  const awaiting = data.contracts.filter((c) => c.status === 'awaiting_farm');
  const active = data.contracts.filter((c) => c.status === 'finalized' || c.status === 'completed');

  return (
    <PageFrame header={<PageHeader title="قراردادها" subtitle="پایش قراردادهای ایجادشده از درخواست‌ها" />}>
      {awaiting.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 8 }}>در انتظار تأیید هماهنگی مزرعه</Text>
          <CardGrid minWidth={320} gap={12}>
            {awaiting.map((c) => (
              <ContractCard key={c.id} contract={c} steps={[]} />
            ))}
          </CardGrid>
        </div>
      )}

      <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 8 }}>قراردادهای جاری و تکمیل‌شده</Text>
      <CardGrid minWidth={320} gap={12}>
        {active.map((c) => (
          <ContractCard
            key={c.id}
            contract={c}
            steps={getStepsForContract(data.progressSteps, c.id)}
            onOpen={() => navigate(`/admin/contracts/${c.id}/progress`)}
            openLabel="پایش قرارداد"
          />
        ))}
      </CardGrid>
      {awaiting.length === 0 && active.length === 0 && (
        <EmptyState
          title="هنوز قراردادی ساخته نشده"
          description="قرارداد از روی درخواست مشارکت‌کننده و تطبیق مزرعه ساخته می‌شود."
          actionLabel="مشاهده درخواست‌ها"
          onAction={() => navigate('/admin/requests')}
        />
      )}
    </PageFrame>
  );
}
