import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

function AppHeader({ onMenuClick, pageName, currentUser, onNotificationClick }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser?.id) return;

    // リアルタイムで未読通知数を監視
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.id),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [currentUser]);

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

      {/* 通知アイコン */}
      {currentUser && onNotificationClick && (
        <button onClick={onNotificationClick} style={{
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          padding: '8px',
          minWidth: '48px',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              backgroundColor: '#ff4d4f',
              color: '#fff',
              borderRadius: '10px',
              padding: '2px 6px',
              fontSize: '11px',
              fontWeight: 'bold',
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}

export default AppHeader;
