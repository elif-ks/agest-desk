import type { SVGProps } from 'react';

function IconBase({
  children,
  spin,
  ...props
}: SVGProps<SVGSVGElement> & {
  children: React.ReactNode;
  spin?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={spin ? 'ui-icon--spin' : undefined}
      {...props}
    >
      {children}
    </svg>
  );
}

export const InboxIcon = () => (
  <IconBase><path d="M4 4h16v14H4zM4 13h4l2 3h4l2-3h4" /></IconBase>
);
export const SendIcon = () => (
  <IconBase><path d="m3 11 18-8-8 18-2-8-8-2Z" /><path d="m11 13 4-4" /></IconBase>
);
export const ClockIcon = () => (
  <IconBase><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></IconBase>
);
export const SyncIcon = ({ spin }: { spin?: boolean }) => (
  <IconBase spin={spin}><path d="M20 7h-5V2" /><path d="M4 17h5v5" /><path d="M5.5 9a7 7 0 0 1 11.8-3L20 7M4 17l2.7 1a7 7 0 0 0 11.8-3" /></IconBase>
);
export const CheckCircleIcon = () => (
  <IconBase><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></IconBase>
);
export const FileTextIcon = () => (
  <IconBase><path d="M6 2h8l4 4v16H6z" /><path d="M14 2v5h5M9 12h6M9 16h6" /></IconBase>
);
export const ApartmentIcon = () => (
  <IconBase><path d="M4 21V5h10v16M14 10h6v11M8 9h2M8 13h2M8 17h2M17 14h1M17 17h1M2 21h20" /></IconBase>
);
export const ExclamationCircleIcon = () => (
  <IconBase><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 17h.01" /></IconBase>
);
export const ReloadIcon = () => (
  <IconBase><path d="M20 6v5h-5" /><path d="M18.5 9a7 7 0 1 0 .2 6" /></IconBase>
);
export const TeamIcon = () => (
  <IconBase><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2" /><path d="M3 20c0-4 2.5-6 6-6s6 2 6 6M15 15c3 0 5 1.5 5 5" /></IconBase>
);
export const ThunderboltIcon = () => (
  <IconBase><path d="m13 2-8 12h7l-1 8 8-12h-7z" /></IconBase>
);
export const UserIcon = () => (
  <IconBase><circle cx="12" cy="8" r="4" /><path d="M4 21c0-5 3-7 8-7s8 2 8 7" /></IconBase>
);
export const EditIcon = () => (
  <IconBase><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" /></IconBase>
);
export const KeyIcon = () => (
  <IconBase><circle cx="8" cy="12" r="4" /><path d="M12 12h9M18 12v3M15 12v2" /></IconBase>
);
export const PlusIcon = () => (
  <IconBase><path d="M12 5v14M5 12h14" /></IconBase>
);
export const DownloadIcon = () => (
  <IconBase><path d="M12 3v12M7 10l5 5 5-5M4 20h16" /></IconBase>
);
export const FileIcon = () => (
  <IconBase><path d="M6 2h8l4 4v16H6zM14 2v5h5" /></IconBase>
);
export const UploadIcon = () => (
  <IconBase><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></IconBase>
);
export const InfoCircleIcon = () => (
  <IconBase><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></IconBase>
);
export const SafetyCertificateIcon = () => (
  <IconBase>
    <path d="M12 2 20 5v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5z" />
    <path d="m8.5 12 2.2 2.2 4.8-5" />
  </IconBase>
);
export const NotFoundIcon = () => (
  <svg
    viewBox="0 0 320 180"
    width="1em"
    height="1em"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M53 143h214"
      stroke="#d9d9d9"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M90 134 113 48h94l24 86"
      fill="#f0f5ff"
      stroke="#91caff"
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <path
      d="M126 48 143 28h35l17 20"
      fill="#e6f4ff"
      stroke="#91caff"
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <circle cx="160" cy="91" r="26" fill="#fff" stroke="#1677ff" strokeWidth="5" />
    <path d="m179 110 20 20" stroke="#1677ff" strokeWidth="8" strokeLinecap="round" />
    <path d="M148 89h24M160 77v24" stroke="#91caff" strokeWidth="4" strokeLinecap="round" />
    <circle cx="68" cy="62" r="7" fill="#e6f4ff" />
    <circle cx="245" cy="47" r="10" fill="#f0f5ff" />
  </svg>
);
export const HomeIcon = () => (
  <IconBase><path d="m3 11 9-8 9 8v10h-7v-6h-4v6H3z" /></IconBase>
);
export const DashboardIcon = () => (
  <IconBase><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></IconBase>
);
export const LogoutIcon = () => (
  <IconBase><path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10" /></IconBase>
);
export const MenuIcon = () => (
  <IconBase><path d="M4 7h16M4 12h16M4 17h16" /></IconBase>
);
