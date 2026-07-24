import { history } from '@umijs/max';

import {
  apiRequest,
  getToken,
} from '@/services/helpDeskApi';
import defaultSettings from '../../config/defaultSettings';

export const LOGIN_PATH = '/user/login';

export type Kullanici = {
  id: number;
  kullaniciAdi: string;
  ad: string;
  soyad: string;
  email: string;
  rol: string;
  departmanId: number | null;
  departman: string | null;
};

export type InitialStateType = {
  settings?: Partial<typeof defaultSettings>;
  currentUser?: Kullanici;
  fetchUserInfo?: () => Promise<
    Kullanici | undefined
  >;
};

export async function fetchUserInfo(): Promise<
  Kullanici | undefined
> {
  const token = getToken();

  if (!token) {
    return undefined;
  }

  try {
    return await apiRequest<Kullanici>(
      '/auth/me',
    );
  } catch (error) {
    console.error(
      'Kullanıcı bilgisi alınamadı:',
      error,
    );

    return undefined;
  }
}

export async function getInitialState(): Promise<InitialStateType> {
  const { pathname } = history.location;
  const settings = defaultSettings;

  if (pathname === LOGIN_PATH) {
    return {
      fetchUserInfo,
      settings,
    };
  }

  const currentUser =
    await fetchUserInfo();

  if (!currentUser) {
    history.replace(LOGIN_PATH);
  }

  return {
    currentUser,
    fetchUserInfo,
    settings,
  };
}
