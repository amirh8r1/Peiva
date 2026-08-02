import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import 'dayjs/locale/fa';

dayjs.extend(jalaliday);
dayjs.locale('fa');
(dayjs as any).calendar('jalali');

export default dayjs;
