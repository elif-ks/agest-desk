import { history } from '@umijs/max';

import type { AppMenuItem } from './menu';

export default function MenuItem({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: AppMenuItem;
  pathname: string;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  const active = item.path
    ? pathname === item.path
    : item.children?.some((child) => pathname === child.path);

  if (!item.path) {
    return (
      <div className="app-menu-group">
        {!collapsed && <div className="app-menu-group__title">{item.label}</div>}
        <div className="app-menu-group__items">
          {item.children?.map((child) => (
            <MenuItem
              key={child.key}
              item={child}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <a
      href={item.path}
      className={`app-menu-item ${active ? 'app-menu-item--active' : ''}`}
      title={collapsed ? item.label : undefined}
      onClick={(event) => {
        event.preventDefault();
        history.push(item.path!);
        onNavigate();
      }}
    >
      {Icon && <Icon />}
      {!collapsed && <span>{item.label}</span>}
    </a>
  );
}
