import { StatTile } from '@/components/ui/StatTile';
import { useCountUp } from '@/hooks/useCountUp';
import { formatNumber } from '@/utils/format';

type StatTileProps = React.ComponentProps<typeof StatTile>;

interface CountStatTileProps extends Omit<StatTileProps, 'value'> {
  /** مقدار عددی — با شمارنده صعودی نمایش داده می‌شود */
  value: number;
  /** واحد بعد از عدد (مثلاً «کیلوگرم») */
  suffix?: string;
}

/** StatTile با شمارنده صعودی — اعداد زنده داشبوردها (reduced-motion رعایت شده). */
export function CountStatTile({ value, suffix, ...rest }: CountStatTileProps) {
  const animated = useCountUp(value);
  return <StatTile {...rest} value={`${formatNumber(animated)}${suffix ? ` ${suffix}` : ''}`} />;
}
