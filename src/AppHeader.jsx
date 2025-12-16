function AppHeader({ onMenuClick, pageName }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      display: 'flex',
      alignItems: 'center',
      padding: '16px 20px 12px 20px',
      paddingTop: 'max(16px, env(safe-area-inset-top, 0px))',
      gap: '16px',
      background: 'linear-gradient(135deg, #ffffff 0%, #fff9f0 50%, #ffffff 100%)',
      borderBottom: '3px solid #ffa500',
      boxShadow: '0 2px 12px rgba(255, 165, 0, 0.15)',
      zIndex: 999,
      minHeight: '60px',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    }}>
      {/* メニューボタン */}
      <button onClick={onMenuClick} style={{
        background: 'none',
        border: 'none',
        color: '#555',
        fontSize: '32px',
        cursor: 'pointer',
        padding: '8px',
        minWidth: '48px',
        minHeight: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>≡</button>

      {/* ロゴとページ名 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <img src="/logo.svg" alt="J" style={{ height: '36px' }} />
        <div style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: '#ffa500' }}>|</span>
          <span>{pageName}</span>
        </div>
      </div>
    </div>
  );
}

export default AppHeader;
