import { useNavigate } from 'react-router-dom';
import { Empty } from 'antd';
import { useData } from '@/context/DataContext';
import { PageFrame } from '@/components/ui/PageFrame';
import { PageHeader } from '@/components/ui/PageHeader';
import { CardGrid } from '@/components/ui/CardGrid';
import { ContractCard } from '@/components/ui/ContractCard';
import { getStepsForContract } from '@/features/progress/utils/progress.utils';

/** قراردادهای تأمین‌کننده — پس از نهایی شدن، ورود به فلو اجرا. */
export function SupplierContractsPage() {
  const navigate = useNavigate();
  const { data } = useData();
  const contracts = data.contracts;

  return (
    <PageFrame header={<PageHeader title="قراردادهای من" />}>
      <CardGrid minWidth={320} gap={12}>
        {contracts.map((c) => (
          <ContractCard
            key={c.id}
            contract={c}
            steps={getStepsForContract(data.progressSteps, c.id)}
            onOpen={c.status === 'finalized' || c.status === 'completed'
              ? () => navigate(`/supplier/contracts/${c.id}/progress`)
              : undefined}
          />
        ))}
      </CardGrid>
      {contracts.length === 0 && <Empty description="قراردادی ندارید" />}
    </PageFrame>
  );
}
