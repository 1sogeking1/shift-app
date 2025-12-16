import { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import HomeCalendar from './HomeCalendar';
import ShiftInput from './ShiftInput';
import ManagerView from './ManagerView';
import ReservationList from './ReservationList';
import Profile from './Profile';
import UserList from './UserList';
import SalaryList from './SalaryList'; // ★追加
import Timecard from './Timecard';
import Terms from './Terms';
import Help from './Help';
import Privacy from './Privacy';
import AppDownload from './AppDownload';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState('home');
  const [pageHistory, setPageHistory] = useState(['home']);
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

  const navigateTo = (newPage) => {
    setPageHistory(prev => [...prev, newPage]);
    setPage(newPage);
  };

  const navigateBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop(); // 現在のページを削除
      const previousPage = newHistory[newHistory.length - 1];
      setPageHistory(newHistory);
      setPage(previousPage);
    }
  };

  const handleMenuClick = (action) => {
    if (action === 'help') navigateTo('help');
    if (action === 'terms') navigateTo('terms');
    if (action === 'privacy') navigateTo('privacy');
    setIsMenuOpen(false);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
        <div className="app-content">
          {page === 'home' && <HomeCalendar currentUser={currentUser} onMenuClick={() => setIsMenuOpen(true)} />}
          {page === 'input' && <ShiftInput currentUser={currentUser} onMenuClick={() => setIsMenuOpen(true)} />}
          {page === 'reservation' && <ReservationList currentUser={currentUser} onMenuClick={() => setIsMenuOpen(true)} />}
          {page === 'timecard' && <Timecard currentUser={currentUser} onMenuClick={() => setIsMenuOpen(true)} />}
          {page === 'profile' && <Profile currentUser={currentUser} onLogout={handleLogout} onPageChange={navigateTo} onMenuClick={() => setIsMenuOpen(true)} />}

          {page === 'manager' && <ManagerView />}
          {page === 'userlist' && <UserList />}
          {page === 'salary' && <SalaryList />} {/* ★給与画面 */}

          {page === 'terms' && <Terms onBack={navigateBack} />}
          {page === 'help' && <Help onBack={navigateBack} />}
          {page === 'privacy' && <Privacy onBack={navigateBack} />}
          {page === 'appdownload' && <AppDownload onBack={navigateBack} />}
        </div>

        <div className="bottom-nav">
          <NavButton active={page === 'home'} onClick={() => setPage('home')} icon="🏠" label="ホーム" />

          {currentUser.isAdmin ? (
            <>
              <NavButton active={page === 'manager'} onClick={() => setPage('manager')} icon="📝" label="承認" color="var(--danger-color)" />
              <NavButton active={page === 'reservation'} onClick={() => setPage('reservation')} icon="📖" label="予約" />
            </>
          ) : (
            <>
              <NavButton active={page === 'input'} onClick={() => setPage('input')} icon="📅" label="申請" />
              <NavButton active={page === 'reservation'} onClick={() => setPage('reservation')} icon="📖" label="予約" />
            </>
          )}

          <NavButton active={page === 'timecard'} onClick={() => setPage('timecard')} icon="⏱️" label="打刻" />
          <NavButton active={page === 'profile'} onClick={() => setPage('profile')} icon="👤" label="設定" />
        </div>

        {isMenuOpen && <div className="side-menu-overlay" onClick={() => setIsMenuOpen(false)} />}
        <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="side-menu-header">
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>メニュー</div>
            <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.9 }}>{currentUser.name} さん</div>
          </div>
          <div className="side-menu-content">
            {/* 店長メニュー */}
            {currentUser.isAdmin && (
              <>
                <MenuItem onClick={() => { navigateTo('userlist'); setIsMenuOpen(false); }} label="👥 スタッフ管理 (時給)" />
                <MenuItem onClick={() => { navigateTo('salary'); setIsMenuOpen(false); }} label="💰 給与計算・実績" />
                <MenuItem onClick={() => { navigateTo('appdownload'); setIsMenuOpen(false); }} label="📱 アプリをダウンロード" />
              </>
            )}

            <hr className="menu-divider" />
            <MenuItem onClick={() => handleMenuClick('help')} label="❓ ヘルプ" />
            <MenuItem onClick={() => handleMenuClick('terms')} label="📜 利用規約" />
            <MenuItem onClick={() => handleMenuClick('privacy')} label="🔒 プライバシーポリシー" />
          </div>
        </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, color }) {
  const activeColor = color || 'var(--primary-color)';
  const textColor = active ? activeColor : 'var(--text-tertiary)';
  return (
    <button onClick={onClick} className={`nav-button ${active ? 'active' : ''}`} style={{ color: textColor }}>
      <span className="nav-button-icon">{icon}</span>
      <span className="nav-button-label">{label}</span>
    </button>
  );
}

function MenuItem({ onClick, label }) {
  return <div onClick={onClick} className="menu-item">{label}</div>;
}

export default App;