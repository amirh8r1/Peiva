import { useParams, useNavigate } from 'react-router-dom';
import { Tag, Empty } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageFrame } from '@/components/ui/PageFrame';
import { CardGrid } from '@/components/ui/CardGrid';
import { PrimaryCTA } from '@/components/ui/PrimaryCTA';
import { FarmCard } from '@/features/farms/components/FarmCard';
import { formatNumber } from '@/utils/format';
import { mockFarms } from '@/mocks';

export function FarmApprovalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, dispatch } = useData();

  const contract = data.contracts.find((c) => c.id === id);
  if (!contract) return <Empty description="قرارداد یافت نشد" />;

  const selectedFarms = mockFarms.filter((f) => contract.selectedFarmIds.includes(f.id));

  const handleSendCollateralRequest = () => {
    // Create proposals for each selected farm
    selectedFarms.forEach((farm) => {
      dispatch({
        type: 'ADD_PROPOSAL',
        payload: {
          id: `prop-${Date.now()}-${farm.id}`,
          contractId: contract.id,
          contractName: contract.name,
          farmId: farm.id,
          farmName: farm.name,
          farmGrade: farm.grade,
          status: 'accepted',
          submittedAt: new Date().toLocaleDateString('fa-IR'),
        },
      });
    });
    navigate('/supplier');
  };

  const alreadyNotified = data.proposals.some((p) => p.contractId === contract.id && p.status === 'accepted');

  return (
    <PageFrame header={<PageHeader title="مزارع انتخاب شده" subtitle={`${formatNumber(selectedFarms.length)} مزرعه برای ${contract.name}`} />}>
      <CardGrid minWidth={360} gap={16}>
        {selectedFarms.map((farm) => (
          <FarmCard key={farm.id} farm={farm} selected onSelect={() => {}} />
        ))}
      </CardGrid>
      {!alreadyNotified && (
        <PrimaryCTA icon={<CheckOutlined />} onClick={handleSendCollateralRequest}>
          ارسال درخواست تأمین وثیقه به مزرعه‌داران
        </PrimaryCTA>
      )}
      {alreadyNotified && <Tag color="processing">درخواست وثیقه ارسال شده — منتظر تأمین</Tag>}
    </PageFrame>
  );
}
