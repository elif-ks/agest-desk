import { useEffect, useRef, useState } from 'react';

import type { Kullanici } from '@/auth/session';
import { LogoutIcon, MenuIcon, UserIcon } from '@/components/ui/icons';
import { cikisYap } from '@/services/helpDeskApi';

export default function Header({
  kullanici,
  collapsed,
  onToggle,
}: {
  kullanici?: Kullanici;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className="app-header">
      <button
        type="button"
        className="app-header__toggle"
        aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
        aria-expanded={!collapsed}
        onClick={onToggle}
      >
        <MenuIcon />
      </button>

      <div className="app-profile" ref={profileRef}>
        <button
          type="button"
          className="app-profile__trigger"
          aria-expanded={profileOpen}
          onClick={() => setProfileOpen((current) => !current)}
        >
          <span className="app-profile__avatar"><UserIcon /></span>
          <span>
            {kullanici
              ? `${kullanici.ad} ${kullanici.soyad}`
              : 'Kullanıcı'}
          </span>
        </button>
        {profileOpen && (
          <div className="app-profile__menu">
            <div>{kullanici?.kullaniciAdi || 'Kullanıcı'}</div>
            <div>
              {kullanici?.departman
                ? `Departman: ${kullanici.departman}`
                : kullanici?.rol === 'admin'
                  ? 'Sistem Yöneticisi'
                  : 'Departman bulunamadı'}
            </div>
            <div>Rol: {kullanici?.rol || '-'}</div>
            <hr />
            <button type="button" onClick={cikisYap}>
              <LogoutIcon /> Çıkış Yap
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
