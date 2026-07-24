import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { ReactNode } from 'react';

export {
  getInitialState,
} from '@/auth/session';
import AppLayout from '@/layouts/AppLayout';

import '@/styles/theme.less';

dayjs.extend(relativeTime);

export function rootContainer(container: ReactNode) {
  return <AppLayout>{container}</AppLayout>;
}
