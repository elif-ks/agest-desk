import { history } from '@umijs/max';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { type Kullanici, LOGIN_PATH } from '@/auth/session';
import { getKullanici, getToken } from '@/services/helpDeskApi';

import Content from './Content';
import Header from './Header';
import Sidebar from './Sidebar';
import { adminMenuItems, userMenuItems } from './menu';
import './layout.css';

export default function AppLayout({ children }: { children: ReactNode }) {
  const kullanici = getKullanici() as Kullanici | null;
  const admin = kullanici?.rol === 'admin';
  const [pathname, setPathname] = useState(history.location.pathname);
  const login = pathname === LOGIN_PATH;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const unlisten = history.listen(({ location }) => {
      setPathname(location.pathname);
    });

    return unlisten;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.panel = login
      ? 'login'
      : admin
        ? 'admin'
        : 'user';

    if (!getToken() && !login) {
      history.replace(LOGIN_PATH);
    }
    setMobileOpen(false);
  }, [admin, login, pathname]);

  if (login) return children;

  const homePath = admin ? '/admin/dashboard' : '/dashboard';

  return (
    <div
      className={`app-layout ${admin ? 'app-layout--admin' : 'app-layout--user'} ${
        collapsed ? 'app-layout--collapsed' : ''
      }`}
    >
      <Sidebar
        admin={admin}
        items={admin ? adminMenuItems : userMenuItems}
        pathname={pathname}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
        onLogoClick={() => history.push(homePath)}
      />
      <div className="app-layout__main">
        <Header
          kullanici={kullanici ?? undefined}
          collapsed={collapsed}
          onToggle={() => {
            if (window.matchMedia('(max-width: 768px)').matches) {
              setMobileOpen((current) => !current);
            } else {
              setCollapsed((current) => !current);
            }
          }}
        />
        <Content>{children}</Content>
      </div>
    </div>
  );
}
