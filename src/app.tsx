import { LogoutOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import {
  apiRequest,
  cikisYap,
  getToken,
} from '@/services/helpDeskApi';

import defaultSettings from '../config/defaultSettings';

dayjs.extend(relativeTime);

const loginPath = '/user/login';

type Kullanici = {
  id: number;
  kullaniciAdi: string;
  ad: string;
  soyad: string;
  email: string;
  rol: string;
  departmanId: number | null;
  departman: string | null;
};

type InitialStateType = {
  settings?: Partial<LayoutSettings>;
  currentUser?: Kullanici;
  fetchUserInfo?: () => Promise<Kullanici | undefined>;
};

export async function getInitialState(): Promise<InitialStateType> {
  const fetchUserInfo = async (): Promise<
    Kullanici | undefined
  > => {
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
  };

  const { pathname } = history.location;

  if (pathname === loginPath) {
    return {
      fetchUserInfo,
      settings:
        defaultSettings as Partial<LayoutSettings>,
    };
  }

  const currentUser =
    await fetchUserInfo();

  if (!currentUser) {
    history.replace(loginPath);
  }

  return {
    currentUser,
    fetchUserInfo,
    settings:
      defaultSettings as Partial<LayoutSettings>,
  };
}

export const layout: RunTimeLayoutConfig = ({
  initialState,
}) => {
  const kullanici =
    initialState?.currentUser as
      | Kullanici
      | undefined;

  return {
    title: 'AGEST Desk',

    menuItemRender: (item, dom) => {
      if (!item.path) {
        return dom;
      }

      return (
        <Link to={item.path}>
          {dom}
        </Link>
      );
    },

    actionsRender: () => [],

    avatarProps: {
      title: kullanici
        ? `${kullanici.ad} ${kullanici.soyad}`
        : 'Kullanıcı',

      menu: {
        items: [
          {
            key: 'kullanici',
            label:
              kullanici?.kullaniciAdi ||
              'Kullanıcı',
            disabled: true,
          },
          {
            key: 'departman',
            label: kullanici?.departman
              ? `Departman: ${kullanici.departman}`
              : 'Departman bulunamadı',
            disabled: true,
          },
          {
            key: 'rol',
            label: `Rol: ${
              kullanici?.rol || '-'
            }`,
            disabled: true,
          },
          {
            type: 'divider',
          },
          {
            key: 'logout',
            label: 'Çıkış Yap',
            icon: <LogoutOutlined />,
          },
        ],

        onClick: ({
          key,
        }: {
          key: string;
        }) => {
          if (key === 'logout') {
            cikisYap();
          }
        },
      },
    },

    menuFooterRender: () => (
      <div
        style={{
          padding: 12,
        }}
      >
        <button
          type="button"
          onClick={cikisYap}
          style={{
            width: '100%',
            padding: '10px 12px',
            border:
              '1px solid #d9d9d9',
            borderRadius: 8,
            background: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 14,
          }}
        >
          <LogoutOutlined />
          Çıkış Yap
        </button>
      </div>
    ),

    footerRender: false,

    links: [],

    bgLayoutImgList: [],

    menuHeaderRender: undefined,

    onPageChange: () => {
      const token = getToken();

      const { pathname } =
        history.location;

      if (
        !token &&
        pathname !== loginPath
      ) {
        history.replace(loginPath);
      }
    },

    ...initialState?.settings,
  };
};