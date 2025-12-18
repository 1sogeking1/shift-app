import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import AppHeader from './AppHeader';

function Notifications({ currentUser, onMenuClick }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.id),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(list);
    } catch (error) {
      console.error("通知の取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  const handleMarkAsRead = async (notifId) => {
    try {
      const notifRef = doc(db, "notifications", notifId);
      await updateDoc(notifRef, { read: true });
      setNotifications(notifications.map(n =>
        n.id === notifId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error("既読エラー:", error);
    }
  };

  const handleDelete = async (notifId) => {
    if (!window.confirm("この通知を削除しますか？")) return;
    try {
      await deleteDoc(doc(db, "notifications", notifId));
      setNotifications(notifications.filter(n => n.id !== notifId));
    } catch (error) {
      console.error("削除エラー:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.read);
      const promises = unreadNotifs.map(n =>
        updateDoc(doc(db, "notifications", n.id), { read: true })
      );
      await Promise.all(promises);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("一括既読エラー:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'shift_confirmed': return '✅';
      case 'shift_updated': return '📝';
      case 'shift_rejected': return '❌';
      default: return '🔔';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      <AppHeader onMenuClick={onMenuClick} pageName="通知" />

      <div style={{ padding: '20px 16px', paddingTop: '90px', maxWidth: '1000px', margin: '0 auto' }}>

        {/* 未読数とアクション */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '12px 16px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            未読: <span style={{ fontWeight: 'bold', color: '#ff4d4f', fontSize: '18px' }}>{unreadCount}</span>件
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} style={{ background: '#e6f7ff', border: '1px solid #91d5ff', color: '#1890ff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              すべて既読にする
            </button>
          )}
        </div>

        {/* 通知リスト */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>読み込み中...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔔</div>
            <div style={{ fontSize: '16px', color: '#999' }}>通知はありません</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  backgroundColor: notif.read ? '#fff' : '#fffbe6',
                  border: notif.read ? '1px solid #eee' : '1px solid #ffd591',
                  borderRadius: '12px',
                  padding: '15px',
                  boxShadow: notif.read ? '0 2px 5px rgba(0,0,0,0.03)' : '0 2px 8px rgba(255, 165, 0, 0.15)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {/* アイコン */}
                  <div style={{ fontSize: '28px', flexShrink: 0 }}>
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* 内容 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#333', marginBottom: '5px' }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: '14px', color: '#555', lineHeight: '1.5', marginBottom: '8px' }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {formatDate(notif.createdAt)}
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        style={{
                          background: '#fff',
                          border: '1px solid #d9d9d9',
                          color: '#666',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        既読
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      style={{
                        background: '#fff0f0',
                        border: 'none',
                        color: '#ff4d4f',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      削除
                    </button>
                  </div>
                </div>

                {/* 未読インジケーター */}
                {!notif.read && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ff4d4f'
                  }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
