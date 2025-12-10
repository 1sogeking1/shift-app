import { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import HomeCalendar from './HomeCalendar';
import ShiftInput from './ShiftInput';
import ManagerView from './ManagerView';
import ReservationList from './ReservationList';
import Profile from './Profile';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('shiftAppUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('shiftAppUser', JSON.stringify(user));
    if (user.isAdmin) {
      setPage('manager');
    } else {
      setPage('home');
    }
  };

  const handleLogout = () => {
    if (window.confirm("ログアウトしますか？")) {
      setCurrentUser(null);
      localStorage.removeItem('shiftAppUser');
      setPage('home');
      setIsMenuOpen(false);
    }
  };

  const handleMenuClick = (action) => {
    if (action === 'help') alert("ヘルプ：\n開発中の機能です。");
    if (action === 'terms') alert("利用規約：\nテスト運用中です。");
    setIsMenuOpen(false);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ 
      width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#eef2f5' 
    }}>
      {/* スマホ枠のコンテナ */}
      <div className="app-container" style={{ 
        width: '100%', maxWidth: '500px', height: '100%', maxHeight: '100vh', 
        display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', 
        backgroundColor: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.1)' 
      }}>
        
        {/* メインエリア */}
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fdfdfdff' }}>
          {page === 'home' && <HomeCalendar currentUser={currentUser} onMenuClick={() => setIsMenuOpen(true)} />}
          {page === 'input' && <ShiftInput currentUser={currentUser} />}
          {page === 'reservation' && <ReservationList currentUser={currentUser} />}
          {page === 'profile' && <Profile currentUser={currentUser} onLogout={handleLogout} />}
          {page === 'manager' && <ManagerView />}
        </div>

        {/* ボトムナビゲーション */}
        <div style={{ 
          height: '60px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', alignItems: 'center', 
          backgroundColor: '#fff', zIndex: 50, flexShrink: 0
        }}>
          <NavButton active={page === 'home'} onClick={() => setPage('home')} icon="🏠" label="ホーム" />
          
          {currentUser.isAdmin ? (
            <>
              <NavButton active={page === 'manager'} onClick={() => setPage('manager')} icon="📝" label="シフト承認" color="#d9534f" />
              <NavButton active={page === 'reservation'} onClick={() => setPage('reservation')} icon="📖" label="予約台帳" />
            </>
          ) : (
            <>
              <NavButton active={page === 'input'} onClick={() => setPage('input')} icon="📅" label="シフト申請" />
              <NavButton active={page === 'reservation'} onClick={() => setPage('reservation')} icon="📖" label="予約受付" />
            </>
          )}
          
          <NavButton active={page === 'profile'} onClick={() => setPage('profile')} icon="👤" label="プロフィール" />
        </div>

        {/* スライドメニュー */}
        {isMenuOpen && (
          <div onClick={() => setIsMenuOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99 }} />
        )}
        <div style={{ 
          position: 'absolute', top: 0, left: 0, bottom: 0, width: '250px', backgroundColor: 'white', zIndex: 100, 
          boxShadow: '2px 0 10px rgba(0,0,0,0.2)', transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)', 
          transition: 'transform 0.3s ease', display: 'flex', flexDirection: 'column' 
        }}>
          <div style={{ padding: '20px', backgroundColor: currentUser.isAdmin ? '#333' : '#ffa500', color: 'white' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>メニュー</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>{currentUser.name} さん</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <MenuItem onClick={() => { setPage('reservation'); setIsMenuOpen(false); }} label="📖 予約管理台帳" />
            <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #eee' }} />
            <MenuItem onClick={() => handleMenuClick('help')} label="❓ ヘルプ" />
            <MenuItem onClick={() => handleMenuClick('terms')} label="📜 利用規約" />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, color }) {
  const activeColor = color || '#ffa500';
  const textColor = active ? activeColor : '#aaa';
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: textColor, width: '25%', height: '100%', cursor: 'pointer', padding: '5px 0' }}>
      <span style={{ fontSize: '20px', marginBottom: '2px' }}>{icon}</span>
      <span style={{ fontSize: '10px', fontWeight: active ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}

function MenuItem({ onClick, label }) {
  return <div onClick={onClick} style={{ padding: '15px 20px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', color: '#333', fontSize: '15px' }}>{label}</div>;
}

export default App;