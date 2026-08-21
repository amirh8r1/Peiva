import { SelectionCard, type SelectionCardField, type EntityDetail } from '@/components/ui/SelectionCard';
import { formatNumber } from '@/utils/format';
import type { Farm } from '@/types';

/** فیلدهای خلاصه مزرعه — منبع واحد (به‌جای سه فیلدبیلدر تکراری). */
export function farmFields(f: Farm): SelectionCardField[] {
  return [
    { label: 'ظرفیت', value: formatNumber(f.capacity) },
    { label: 'ضریب تبدیل', value: formatNumber(f.avgConversionRatio, 1) },
    { label: 'سابقه', value: `${formatNumber(f.experienceYears)} سال` },
    { label: 'مالک', value: f.ownerName },
  ];
}

/** جزئیات کامل مزرعه برای مودال — superset همه کاربردها. */
export function farmDetails(f: Farm): EntityDetail[] {
  return [
    { label: 'نام', value: f.name },
    { label: 'مالک', value: f.ownerName },
    { label: 'موقعیت', value: `${f.address.city}، ${f.address.province}` },
    { label: 'گرید', value: f.grade },
    { label: 'ظرفیت', value: formatNumber(f.capacity) },
    { label: 'ضریب تبدیل', value: formatNumber(f.avgConversionRatio, 1) },
    { label: 'سابقه', value: `${formatNumber(f.experienceYears)} سال` },
    { label: 'تلفن', value: f.contact.phone },
  ];
}

interface FarmCardProps {
  farm: Farm;
  selected: boolean;
  onSelect: (farm: Farm) => void;
}

/** کارت مزرعه استاندارد بر پایه SelectionCard. */
export function FarmCard({ farm, selected, onSelect }: FarmCardProps) {
  return (
    <SelectionCard<Farm>
      item={farm}
      selected={selected}
      onSelect={onSelect}
      title={farm.name}
      subtitle={`${farm.address.city}، ${farm.address.province}`}
      rating={farm.rating}
      grade={farm.grade}
      fields={farmFields(farm)}
      details={farmDetails(farm)}
    />
  );
}
