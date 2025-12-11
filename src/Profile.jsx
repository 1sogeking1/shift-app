import { useState, useEffect } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

function Profile({ currentUser, onLogout }) {
  const [wage, setWage] = useState("---");

  // 自分の時給を表示する（編集は不可）
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser.id) {
        const userRef = doc(db, "users", currentUser.id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setWage(userSnap.data().hourlyWage || "未設定");
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const maskPassword = (pass) => {
    return "****" + pass.slice(-4);
  };

  return (
    <div style={{ padding: '20px 10px', maxWidth: '1000px', margin: '0 auto', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#333', fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>プロフィール</h2>

      <div style={{ 
        backgroundColor: '#fff', padding: '30px 20px', borderRadius: '12px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee', marginTop: '10px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            width: '80px', height: '80px', backgroundColor: currentUser.avatarColor || '#f0f5ff', 
            borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '30px', fontWeight:'bold', color: '#fff'
          }}>
            {currentUser.name.charAt(0)}
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
            <span style={labelStyle}>パスワード (生年月日)</span>
            <span style={valueStyle}>{currentUser.password ? maskPassword(currentUser.password) : '****'}</span>
          </div>

          <div style={itemStyle}>
            <span style={labelStyle}>現在の時給</span>
            <span style={{ fontWeight: 'bold', color: '#007bff', fontSize: '18px' }}>
              {wage !== "未設定" ? `¥ ${Number(wage).toLocaleString()}` : "未設定"}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '0 20px' }}>
        <button onClick={onLogout} style={{ width: '100%', padding: '15px', backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)', cursor: 'pointer' }}>
          ログアウト
        </button>
      </div>
    </div>
  );
}

const itemStyle = { borderBottom: '1px solid #f0f0f0', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const labelStyle = { color: '#888', fontSize: '14px' };
const valueStyle = { fontWeight: 'bold', color: '#333', fontSize: '16px' };

export default Profile;