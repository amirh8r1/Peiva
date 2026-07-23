import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Empty, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { chainService } from '@/features/chains/services/chain.service';
import { ChainCard } from '@/components/ui/ChainCard';
import { PageHeader } from '@/components/ui/PageHeader';
import type { Chain } from '@/types';

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: chains, isLoading } = useQuery({
    queryKey: ['chains'],
    queryFn: () => chainService.getAll(),
  });

  return (
    <>
      <PageHeader
        title="داشبورد زنجیره‌ها"
        subtitle="نمای کلی زنجیره‌های تأمین مرغ گوشتی"
        extra={
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/chains/new')}
          >
            ایجاد زنجیره جدید
          </Button>
        }
      />

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : chains && chains.length > 0 ? (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            paddingLeft: 4,
            paddingBottom: 8,
          }}
        >
          {chains.map((chain: Chain) => (
            <ChainCard key={chain.id} chain={chain} />
          ))}
        </div>
      ) : (
        <Empty
          description="هنوز هیچ زنجیره‌ای ایجاد نشده"
          style={{ marginTop: 80 }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/chains/new')}
          >
            ایجاد اولین زنجیره
          </Button>
        </Empty>
      )}
    </>
  );
}
