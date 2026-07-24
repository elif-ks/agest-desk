export default function Logo({
  collapsed,
  onClick,
}: {
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="app-layout-logo"
      aria-label="AGEST Desk ana sayfa"
      onClick={onClick}
    >
      <img src="/icons/AgestLogo.png" alt="AGEST Logo" />
      {!collapsed && <span>AGEST Desk</span>}
    </button>
  );
}
