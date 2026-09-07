import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageFrame } from '@/components/ui/PageFrame';
import { PageHeader } from '@/components/ui/PageHeader';
import { CardGrid } from '@/components/ui/CardGrid';
import { PrimaryCTA } from '@/components/ui/PrimaryCTA';
import { EmptyState } from '@/components/ui/EmptyState';
import { RequestSummaryCard } from '@/features/requests/components/RequestSummaryCard';

/** درخواست‌های تأمین‌کننده — وضعیت و سهم؛ نقطه ورود موبایل برای درخواست جدید. */
export function SupplierRequestsPage() {
  const navigate = useNavigate();
  const { data } = useData();
  const requests = data.requests;

  return (
    <PageFrame header={<PageHeader title="درخواست‌های من" subtitle="وضعیت درخواست‌ها و سهم شما از تولید" />}>
      <CardGrid minWidth={320} gap={12}>
        {requests.map((r) => (
          <RequestSummaryCard key={r.id} request={r} onClick={() => navigate(`/supplier/requests/${r.id}`)} />
        ))}
      </CardGrid>
      {requests.length === 0 && (
        <EmptyState
          title="هنوز درخواستی ثبت نکرده‌اید"
          description="نهاده‌های خود (دان/جوجه/نقد) را اعلام کنید تا زنجیره‌دار مزرعه را تطبیق و سهم شما را برآورد کند."
          actionLabel="ثبت درخواست جدید"
          onAction={() => navigate('/supplier/requests/new')}
        />
      )}
      <PrimaryCTA icon={<PlusOutlined />} onClick={() => navigate('/supplier/requests/new')}>
        درخواست جدید
      </PrimaryCTA>
    </PageFrame>
  );
}
