import { useState } from 'react';
import {
  Card,
  Rate,
  Tag,
  Button,
  Typography,
  Modal,
  Descriptions,
  theme,
} from 'antd';
import { CheckCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import type { QualityGrade } from '@/types';
import { gradeColorMap } from '@/types';
import { useIsDesktop } from '@/hooks/useResponsive';

const { Text } = Typography;

export interface SelectionCardField {
  label: string;
  value: string | number;
  type?: 'text' | 'grade' | 'tag';
}

export interface EntityDetail {
  label: string;
  value: string | number;
}

interface SelectionCardProps<T> {
  item: T;
  selected: boolean;
  onSelect: (item: T) => void;
  title: string;
  subtitle?: string;
  fields: SelectionCardField[];
  details?: EntityDetail[];
  rating?: number;
  grade?: QualityGrade;
  multiSelect?: boolean;
}

export function SelectionCard<T extends { id: string; active?: boolean; description?: string }>({
  item,
  selected,
  onSelect,
  title,
  subtitle,
  fields,
  details,
  rating,
  grade,
}: SelectionCardProps<T>) {
  const { token } = theme.useToken();
  const isDesktop = useIsDesktop();
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      <Card
        hoverable
        onClick={() => item.active !== false && onSelect(item)}
        style={{
          cursor: item.active === false ? 'not-allowed' : 'pointer',
          opacity: item.active === false ? 0.5 : 1,
          border: selected
            ? `2px solid ${token.colorPrimary}`
            : `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
          transition: 'all 0.2s ease',
          position: 'relative',
          background: selected ? token.colorPrimaryBg : token.colorBgContainer,
        }}
        styles={{ body: { padding: 16 } }}
      >
        {/* Selected indicator — tiny, absolute, on the border corner. Does NOT affect layout. */}
        {selected && (
          <CheckCircleFilled
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              fontSize: 20,
              color: token.colorPrimary,
              zIndex: 3,
              background: '#fff',
              borderRadius: '50%',
            }}
          />
        )}

        {/* Header row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
            gap: 8,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                marginBottom: 2,
              }}
            >
              <Text
                strong
                ellipsis
                title={title}
                style={{ fontSize: 15 }}
              >
                {title}
              </Text>
              {grade && (
                <Tag
                  color={gradeColorMap[grade]}
                  style={{ margin: 0, flexShrink: 0 }}
                >
                  گرید {grade}
                </Tag>
              )}
            </div>
            {subtitle && (
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                {subtitle}
              </Text>
            )}
          </div>
          {rating !== undefined && (
            <Rate
              disabled
              value={rating}
              allowHalf
              style={{ fontSize: 13, flexShrink: 0 }}
            />
          )}
        </div>

        {/* Fields grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px 12px',
            marginBottom: 12,
          }}
        >
          {fields.map((field) => (
            <div key={field.label}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                {field.label}
              </Text>
              {field.type === 'grade' ? (
                <Tag color={gradeColorMap[field.value as QualityGrade]}>
                  {field.value}
                </Tag>
              ) : field.type === 'tag' ? (
                <Tag>{field.value}</Tag>
              ) : (
                <Text style={{ fontSize: 13 }}>{field.value}</Text>
              )}
            </div>
          ))}
        </div>

        {/* Details button */}
        <Button
          type="default"
          size="small"
          icon={<InfoCircleOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            setDetailsOpen(true);
          }}
          block
        >
          جزئیات بیشتر
        </Button>
      </Card>

      {/* Details Modal */}
      <Modal
        title={title}
        open={detailsOpen}
        onCancel={() => setDetailsOpen(false)}
        footer={
          <Button type="primary" onClick={() => setDetailsOpen(false)}>
            بستن
          </Button>
        }
        width={isDesktop ? 640 : 520}
      >
        {details && details.length > 0 && (
          <Descriptions column={isDesktop ? 2 : 1} bordered size="small" style={{ marginBottom: 16 }}>
            {details.map((d) => (
              <Descriptions.Item key={d.label} label={d.label}>
                {d.value}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
        {item.description && (
          <Text type="secondary">{item.description}</Text>
        )}
      </Modal>
    </>
  );
}
