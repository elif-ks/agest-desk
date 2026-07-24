import { LogoutIcon } from '@/components/ui/icons';
import { cikisYap } from '@/services/helpDeskApi';

import Logo from './Logo';
import MenuItem from './MenuItem';
import type { AppMenuItem } from './menu';

export default function Sidebar({
  admin,
  items,
  pathname,
  collapsed,
  mobileOpen,
  onNavigate,
  onLogoClick,
}: {
  admin: boolean;
  items: AppMenuItem[];
  pathname: string;
  collapsed: boolean;
  mobileOpen: boolean;
  onNavigate: () => void;
  onLogoClick: () => void;
}) {
  return (
    <>
      <button
        type="button"
        className={`app-sidebar-mask ${mobileOpen ? 'app-sidebar-mask--open' : ''}`}
        aria-label="Menüyü kapat"
        onClick={onNavigate}
      />
      <aside
        className={`app-sidebar ${admin ? 'app-sidebar--admin' : ''} ${
          collapsed ? 'app-sidebar--collapsed' : ''
        } ${mobileOpen ? 'app-sidebar--mobile-open' : ''}`}
      >
        <Logo collapsed={collapsed} onClick={onLogoClick} />
        <nav className="app-menu" aria-label="Ana menü">
          {items.map((item) => (
            <MenuItem
              key={item.key}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
        <div className="app-sidebar__footer">
          <button type="button" className="agest-menu-logout" onClick={cikisYap}>
            <LogoutIcon />
            {!collapsed && <span>Çıkış Yap</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
