import { useNavigate } from 'react-router-dom';
import { Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageFrame } from '@/components/ui/PageFrame';
import { PageHeader } from '@/components/ui/PageHeader';
import { CardGrid } from '@/components/ui/CardGrid';
import { PrimaryCTA } from '@/components/ui/PrimaryCTA';
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
      {requests.length === 0 && <Empty description="هنوز درخواستی ثبت نکرده‌اید" />}
      <PrimaryCTA icon={<PlusOutlined />} onClick={() => navigate('/supplier/requests/new')}>
        درخواست جدید
      </PrimaryCTA>
    </PageFrame>
  );
}
