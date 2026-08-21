import { Card, theme } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';

interface SelectableCardProps {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  /** رنگ حالت انتخاب: primary (سبز) | info (آبی) */
  tone?: 'primary' | 'info';
  /** padding بدنه کارت (برای محتوای فشرده مثل کاشی بانک) */
  bodyPadding?: React.CSSProperties['padding'];
}

/**
 * کارت انتخاب‌پذیر با بوردر ۲px توکنی و نشانگر چک — جایگزین کارت‌های رادیویی دستی.
 */
export function SelectableCard({ selected, onSelect, children, tone = 'primary', bodyPadding }: SelectableCardProps) {
  const { token } = theme.useToken();
  const borderColor = tone === 'primary' ? token.colorPrimary : token.colorInfo;
  const bg = tone === 'primary' ? token.colorPrimaryBg : token.colorInfoBg;

  return (
    <Card
      hoverable
      onClick={onSelect}
      styles={{ body: { padding: bodyPadding } }}
      style={{
        cursor: 'pointer',
        minHeight: 44,
        border: selected ? `2px solid ${borderColor}` : `1px solid ${token.colorBorderSecondary}`,
        background: selected ? bg : token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        transition: 'all 0.2s ease',
      }}
    >
      {/* نشانگر انتخاب — انتهای ردیف محتوا تا هرگز کلیپ نشود */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        {selected && (
          <CheckCircleFilled
            style={{ fontSize: 18, color: borderColor, flexShrink: 0, marginTop: 2 }}
          />
        )}
      </div>
    </Card>
  );
}
