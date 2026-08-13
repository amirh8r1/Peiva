import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tag, Button, Typography, Empty } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { SelectionCard } from '@/components/ui/SelectionCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import { useIsDesktop } from '@/hooks/useResponsive';
import { responsiveGrid, centeredCTA } from '@/utils/responsive';
import { mockFarms } from '@/mocks';
import type { Farm } from '@/types';

const { Text, Title } = Typography;

export function FarmApprovalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
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
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <PageHeader title="مزارع انتخاب شده" subtitle={`${formatNumber(selectedFarms.length)} مزرعه برای ${contract.name}`} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={isDesktop ? responsiveGrid(360, 16) : undefined}>
          {selectedFarms.map((farm) => (
            <div key={farm.id} style={{ marginBottom: isDesktop ? 0 : 10 }}>
              <SelectionCard<Farm> item={farm} selected onSelect={() => {}} title={farm.name}
                subtitle={`${farm.address.city}، ${farm.address.province}`} rating={farm.rating} grade={farm.grade}
                fields={[
                  { label: 'ظرفیت', value: formatNumber(farm.capacity) },
                  { label: 'ضریب تبدیل', value: formatNumber(farm.avgConversionRatio, 1) },
                  { label: 'سابقه', value: `${formatNumber(farm.experienceYears)} سال` },
                  { label: 'مالک', value: farm.ownerName },
                ]}
                details={[
                  { label: 'نام', value: farm.name }, { label: 'مالک', value: farm.ownerName },
                  { label: 'موقعیت', value: `${farm.address.city}، ${farm.address.province}` },
                  { label: 'گرید', value: farm.grade }, { label: 'ظرفیت', value: formatNumber(farm.capacity) },
                  { label: 'ضریب تبدیل', value: formatNumber(farm.avgConversionRatio, 1) },
                  { label: 'سابقه', value: `${formatNumber(farm.experienceYears)} سال` },
                ]}
              />
            </div>
          ))}
        </div>
        {!alreadyNotified && (
          <Button type="primary" icon={<CheckOutlined />} block size="large" onClick={handleSendCollateralRequest} style={centeredCTA(isDesktop)}>
            ارسال درخواست تأمین وثیقه به مزرعه‌داران
          </Button>
        )}
        {alreadyNotified && <Tag color="processing">درخواست وثیقه ارسال شده — منتظر تأمین</Tag>}
      </div>
    </div>
  );
}
