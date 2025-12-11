import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

function Profile({ currentUser, onLogout }) {
  const [wage, setWage] = useState("");
  const [loading, setLoading] = useState(false);

  // 最新の時給データを取得する
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser.id) {
        const userRef = doc(db, "users", currentUser.id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setWage(data.hourlyWage || ""); // 保存されていた時給があればセット
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const maskPassword = (pass) => {
    return "****" + pass.slice(-4);
  };

  // 時給を保存する
  const handleSaveWage = async () => {
    if (!wage) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", currentUser.id);
      await updateDoc(userRef, {
        hourlyWage: Number(wage) // 数字として保存
      });
      alert("時給を保存しました！");
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

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
            backgroundColor: currentUser.avatarColor || '#f0f5ff', 
            borderRadius: '50%', 
            margin: '0 auto', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
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
            <span style={labelStyle}>パスワード</span>
            <span style={valueStyle}>{currentUser.password ? maskPassword(currentUser.password) : '****'}</span>
          </div>

          {/* ★時給設定エリア */}
          <div style={{ ...itemStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={labelStyle}>時給設定 (円)</span>
              <button 
                onClick={handleSaveWage} 
                disabled={loading}
                style={{ 
                  backgroundColor: '#007bff', color: '#fff', border: 'none', 
                  borderRadius: '4px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' 
                }}
              >
                保存
              </button>
            </div>
            <input 
              type="number" 
              value={wage} 
              onChange={(e) => setWage(e.target.value)} 
              placeholder="例: 1100"
              style={{ 
                width: '100%', padding: '10px', borderRadius: '6px', 
                border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' 
              }}
            />
            <div style={{ fontSize: '11px', color: '#aaa' }}>※ここで設定した時給で給与計算されます</div>
          </div>

        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '0 20px' }}>
        <button 
          onClick={onLogout} 
          style={{ 
            width: '100%', padding: '15px', backgroundColor: '#ff4d4f', color: 'white', 
            border: 'none', borderRadius: '30px', fontWeight: 'bold', fontSize: '16px',
            boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)', cursor: 'pointer'
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