import type { ComponentType } from 'react';

import {
  ApartmentIcon,
  CheckCircleIcon,
  ClockIcon,
  DashboardIcon,
  FileTextIcon,
  HomeIcon,
  InboxIcon,
  PlusIcon,
  SendIcon,
  SyncIcon,
  TeamIcon,
} from '@/components/ui/icons';

export type AppMenuItem = {
  key: string;
  label: string;
  path?: string;
  icon?: ComponentType;
  children?: AppMenuItem[];
};

export const userMenuItems: AppMenuItem[] = [
  {
    key: '/dashboard',
    label: 'Ana Panel',
    path: '/dashboard',
    icon: HomeIcon,
  },
  {
    key: '/talepler',
    label: 'Talepler',
    icon: FileTextIcon,
    children: [
      {
        key: '/talepler/yeni',
        label: 'Yeni Talep',
        path: '/talepler/yeni',
        icon: PlusIcon,
      },
      {
        key: '/talepler/gelen',
        label: 'Bana Gelen',
        path: '/talepler/gelen',
        icon: InboxIcon,
      },
      {
        key: '/talepler/gonderilen',
        label: 'Gönderdiğim',
        path: '/talepler/gonderilen',
        icon: SendIcon,
      },
      {
        key: '/talepler/bekleyen',
        label: 'Bekleyen',
        path: '/talepler/bekleyen',
        icon: ClockIcon,
      },
      {
        key: '/talepler/islemde',
        label: 'İşlemde',
        path: '/talepler/islemde',
        icon: SyncIcon,
      },
      {
        key: '/talepler/tamamlanan',
        label: 'Tamamlanan',
        path: '/talepler/tamamlanan',
        icon: CheckCircleIcon,
      },
    ],
  },
];

export const adminMenuItems: AppMenuItem[] = [
  {
    key: '/admin',
    label: 'Yönetim',
    children: [
      {
        key: '/admin/dashboard',
        label: 'Yönetim Paneli',
        path: '/admin/dashboard',
        icon: DashboardIcon,
      },
      {
        key: '/admin/kullanicilar',
        label: 'Kullanıcı Yönetimi',
        path: '/admin/kullanicilar',
        icon: TeamIcon,
      },
      {
        key: '/admin/departmanlar',
        label: 'Departman Yönetimi',
        path: '/admin/departmanlar',
        icon: ApartmentIcon,
      },
    ],
  },
];
