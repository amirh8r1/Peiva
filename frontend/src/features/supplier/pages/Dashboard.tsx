import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageFrame } from '@/components/ui/PageFrame';
import { PageHeader } from '@/components/ui/PageHeader';
import { CardGrid } from '@/components/ui/CardGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { ContractCard } from '@/components/ui/ContractCard';
import { RequestSummaryCard } from '@/features/requests/components/RequestSummaryCard';
import { getStepsForContract } from '@/features/progress/utils/progress.utils';
import { useIsDesktop } from '@/hooks/useResponsive';
import { ContractWizard } from '../components/ContractWizard';

type DashTab = 'active' | 'review';

/**
 * داشبورد مشارکت‌کننده — قراردادهای جاری و در حال بررسی در دو تب؛
 * نوتیفیکیشن‌ها در زنگوله (نه روی صفحه)؛ «افزودن قرارداد جدید» ویزارد را باز می‌کند.
 */
export function SupplierDashboard() {
  const navigate = useNavigate();
  const { data } = useData();
  const isDesktop = useIsDesktop();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<DashTab>('active');
  const [wizardOpen, setWizardOpen] = useState(false);
  const autoOpened = useRef(false);

  // ورودی FAB/سایدبار: /supplier?new=1 — یک‌بار باز شود و پارامتر پاک شود (Back دوباره باز نکند)
  useEffect(() => {
    if (searchParams.get('new') === '1' && !autoOpened.current) {
      autoOpened.current = true;
      setWizardOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const activeContracts = data.contracts.filter((c) => c.status === 'finalized');
  const reviewRequests = data.requests.filter((r) => !r.contractId && r.status !== 'rejected');

  return (
    <PageFrame
      header={
        <PageHeader
          title="داشبورد مشارکت‌کننده"
          subtitle="قراردادهای جاری و در حال بررسی شما"
          extra={
            /* دکمه فقط دسکتاپ — در موبایل FAB پایین همین کار را می‌کند؛ زنگوله در هدر اصلی است */
            isDesktop ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setWizardOpen(true)}>
                افزودن قرارداد جدید
              </Button>
            ) : undefined
          }
        />
      }
    >
      <Tabs
        activeKey={tab}
        onChange={(k) => setTab(k as DashTab)}
        items={[
          {
            key: 'active',
            label: 'قراردادهای جاری',
            children: activeContracts.length === 0 ? (
              <EmptyState
                title="هنوز قرارداد جاری ندارید"
                description="پس از تأیید زنجیره‌دار و هماهنگی مزرعه، قرارداد جاری شما اینجا نمایش داده می‌شود."
              />
            ) : (
              <CardGrid minWidth={320} gap={12}>
                {activeContracts.map((c) => (
                  <ContractCard
                    key={c.id}
                    contract={c}
                    steps={getStepsForContract(data.progressSteps, c.id)}
                    onOpen={() => navigate(`/supplier/contracts/${c.id}/progress`)}
                    openLabel="پیگیری قرارداد"
                  />
                ))}
              </CardGrid>
            ),
          },
          {
            key: 'review',
            label: 'در حال بررسی',
            children: reviewRequests.length === 0 ? (
              <EmptyState
                title="قرارداد در حال بررسی ندارید"
                description="قراردادهایی که برای زنجیره‌دار ارسال می‌کنید اینجا دیده می‌شوند تا تأیید شوند."
              />
            ) : (
              <CardGrid minWidth={320} gap={12}>
                {reviewRequests.map((r) => (
                  <RequestSummaryCard key={r.id} request={r} onClick={() => navigate(`/supplier/requests/${r.id}`)} />
                ))}
              </CardGrid>
            ),
          },
        ]}
      />
      {wizardOpen && (
        <ContractWizard
          onClose={() => setWizardOpen(false)}
          onCreated={() => {
            setWizardOpen(false);
            setTab('review');
          }}
        />
      )}
    </PageFrame>
  );
}
