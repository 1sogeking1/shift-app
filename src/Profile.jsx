import { useState } from 'react';

function Profile({ currentUser, onLogout }) {
  const maskPassword = (pass) => {
    return "****" + pass.slice(-4);
  };

  // ★統一されたコンテナスタイル
  return (
    <div style={{ padding: '20px 10px', maxWidth: '1000px', margin: '0 auto', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#333', fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>プロフィール</h2>

      <div style={{ 
        backgroundColor: '#fff', 
        padding: '30px 20px', 
        borderRadius: '12px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        border: '1px solid #eee',
        marginTop: '10px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            width: '80px', height: '80px', 
            backgroundColor: '#f0f5ff', 
            borderRadius: '50%', 
            margin: '0 auto', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px'
          }}>
            👤
          </div>
          <h3 style={{ marginTop: '15px', fontSize: '20px', color: '#333' }}>{currentUser.name}</h3>
          <div style={{ fontSize: '14px', color: '#888' }}>{currentUser.isAdmin ? '店長・管理者' : '店舗スタッフ'}</div>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={itemStyle}>
            <span style={labelStyle}>ログインID</span>
            <span style={valueStyle}>{currentUser.name}</span>
          </div>
          
          <div style={itemStyle}>
            <span style={labelStyle}>パスワード</span>
            <span style={valueStyle}>{currentUser.password ? maskPassword(currentUser.password) : '****'}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '0 20px' }}>
        <button 
          onClick={onLogout} 
          style={{ 
            width: '100%', 
            padding: '15px', 
            backgroundColor: '#ff4d4f', 
            color: 'white', 
            border: 'none', 
            borderRadius: '30px', 
            fontWeight: 'bold', 
            fontSize: '16px',
            boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)',
            cursor: 'pointer'
          }}
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}

const itemStyle = {
  borderBottom: '1px solid #f0f0f0',
  paddingBottom: '15px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const labelStyle = { color: '#888', fontSize: '14px' };
const valueStyle = { fontWeight: 'bold', color: '#333', fontSize: '16px' };

export default Profile;