import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Empty, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageFrame } from '@/components/ui/PageFrame';
import { PageHeader } from '@/components/ui/PageHeader';
import { PrimaryCTA } from '@/components/ui/PrimaryCTA';
import { RequestSummaryCard } from '@/features/requests/components/RequestSummaryCard';
import { EstimationTable } from '@/features/requests/components/EstimationTable';
import { ShareSummary } from '@/features/requests/components/ShareSummary';
import { FarmCard } from '@/features/farms/components/FarmCard';
import { mockFarms } from '@/mocks';
import { computeShares } from '@/utils/estimation';
import { REQUEST_STATUS_LABELS } from '@/types/request';
import type { SupplierRequestStatus } from '@/types/request';
import { useIsDesktop } from '@/hooks/useResponsive';
import { centeredForm } from '@/utils/responsive';
import { pivaType } from '@/config/theme';
import { Stepper, type StepperItem } from '@/components/ui/Stepper';

const { Text } = Typography;

/** ترتیب وضعیت‌ها در نوار پیشرفت — rejected خارج از ترتیب (با استایل خطا). */
const STATUS_FLOW: SupplierRequestStatus[] = ['pending', 'matched', 'in_progress', 'completed'];

/** جزئیات درخواست تأمین‌کننده — شفافیت کامل: وضعیت، مزرعه تطبیق‌شده و سهم شما. */
export function SupplierRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { data } = useData();

  const request = data.requests.find((r) => r.id === id);
  const contract = data.contracts.find((c) => c.id === request?.contractId);
  const farm = request?.matchedFarmId ? mockFarms.find((f) => f.id === request.matchedFarmId) : undefined;

  if (!request) {
    return (
      <PageFrame header={<PageHeader title="جزئیات درخواست" />}>
        <Empty description="درخواست یافت نشد" style={{ marginTop: 48 }} />
      </PageFrame>
    );
  }

  const flowIndex = STATUS_FLOW.indexOf(request.status);
  const rejected = request.status === 'rejected';

  return (
    <PageFrame
      header={
        <PageHeader
          title="جزئیات درخواست"
          subtitle={REQUEST_STATUS_LABELS[request.status]}
          extra={<Button icon={<ArrowRightOutlined />} onClick={() => navigate('/supplier/requests')}>بازگشت</Button>}
        />
      }
    >
      <div style={centeredForm(isDesktop, 960)}>
        <Card style={{ marginBottom: 12 }}>
          <Stepper items={STATUS_FLOW.map((s, i) => {
            const index = rejected ? 0 : Math.max(flowIndex, 0);
            return {
              label: REQUEST_STATUS_LABELS[s],
              status: (rejected && i === 0 ? 'error' : i < index ? 'done' : i === index ? 'current' : 'idle') as StepperItem['status'],
            };
          })} />
        </Card>

        {rejected && (
          <Alert type="error" showIcon message="این درخواست توسط زنجیره‌دار رد شده است" style={{ marginBottom: 12 }} />
        )}

        <RequestSummaryCard request={request} />

        {farm && (
          <div style={{ marginTop: 12 }}>
            <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 8 }}>مزرعه تطبیق‌شده</Text>
            <FarmCard farm={farm} selected={false} onSelect={() => {}} />
          </div>
        )}

        {request.estimation && (
          <div style={{ marginTop: 12 }}>
            <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 8 }}>برآورد هزینه و سهم شما</Text>
            <EstimationTable rows={request.estimation.rows} productionKg={request.estimation.productionKg} />
            <div style={{ marginTop: 8 }}>
              <ShareSummary
                share={computeShares(request.estimation.rows, request.estimation.productionKg)}
                label="سهم شما از تولید"
              />
            </div>
          </div>
        )}

        {request.status === 'pending' && (
          <Alert type="info" showIcon style={{ marginTop: 12 }}
            message="درخواست در صندوق زنجیره‌دار است" description="پس از تطبیق مزرعه و برآورد هزینه، سهم شما اینجا نمایش داده می‌شود." />
        )}

        {contract && (
          <div style={{ marginTop: 12 }}>
            {contract.status === 'awaiting_farm' ? (
              <Alert type="info" showIcon message="قرارداد ایجاد شده — در انتظار تأیید هماهنگی مزرعه‌دار" />
            ) : (
              <PrimaryCTA onClick={() => navigate(`/supplier/contracts/${contract.id}/progress`)}>
                پیگیری قرارداد
              </PrimaryCTA>
            )}
          </div>
        )}
      </div>
    </PageFrame>
  );
}
