import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";

function Login({ onLogin }) {
  const [users, setUsers] = useState([]);
  const [mode, setMode] = useState('select'); // 'select' | 'pin' | 'add'
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputPin, setInputPin] = useState("");
  
  // 新規登録用
  const [newName, setNewName] = useState("");
  const [newBirthday, setNewBirthday] = useState("");

  // マネージャー用
  const [managerPass, setManagerPass] = useState("");

  const fetchUsers = async () => {
    const q = query(collection(db, "users"));
    const querySnapshot = await getDocs(q);
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    setUsers(list);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleProfileClick = (user) => {
    setSelectedUser(user);
    setMode('pin');
    setInputPin("");
  };

  const handlePinCheck = (e) => {
    e.preventDefault();
    if (inputPin === selectedUser.password) {
      onLogin(selectedUser);
    } else {
      alert("暗証番号（誕生日）が違います");
      setInputPin("");
    }
  };

  const handleAddProfile = async (e) => {
    e.preventDefault();
    if (!newName || !newBirthday) return;
    const password = newBirthday.replace(/-/g, '').slice(4);
    
    try {
      const existing = users.find(u => u.name === newName);
      if (existing) { alert("その名前は既にあります"); return; }

      const newUser = {
        name: newName,
        password: password,
        birthday: newBirthday,
        isAdmin: false,
        avatarColor: getRandomColor(),
        createdAt: new Date()
      };

      await addDoc(collection(db, "users"), newUser);
      alert("プロフィールを作成しました！");
      fetchUsers();
      setMode('select');
      setNewName(""); setNewBirthday("");
    } catch (error) { alert("エラーが発生しました"); }
  };

  const handleManagerDirect = (e) => {
    e.preventDefault();
    if (managerPass === "admin") {
      onLogin({ name: "店長", isAdmin: true });
    } else {
      alert("パスワードエラー");
    }
  };

  // ビジネスライクな落ち着いた色味
  const getRandomColor = () => {
    const colors = ['#69c0ff', '#5cdbd3', '#ff9c6e', '#ff85c0', '#b37feb', '#ffd666'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div style={{ 
      height: '100vh', width: '100%',
      backgroundColor: '#f5f7fa', // ★背景を明るいグレーに
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Helvetica Neue", Arial, sans-serif'
    }}>

      {/* アプリロゴ風タイトル */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', color: '#333', margin: 0, fontWeight:'bold', letterSpacing:'1px' }}>
          <span style={{ color: '#007bff' }}>Shift</span> Manager
        </h1>
        <p style={{ color: '#888', fontSize: '12px', marginTop: '5px' }}>店舗用シフト管理システム</p>
      </div>

      {/* --- 1. プロフィール選択画面 --- */}
      {mode === 'select' && (
        <div style={{ width: '100%', maxWidth: '800px', padding: '20px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '18px', color: '#555', textAlign: 'center', marginBottom: '20px', fontWeight:'normal' }}>
            アカウントを選択してください
          </h2>

          {/* スクロール可能なコンテナ */}
          <div style={{
            overflowY: 'auto',
            flex: 1,
            padding: '10px',
            borderRadius: '12px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
              gap: '20px',
              justifyItems: 'center',
              padding: '10px'
            }}>
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleProfileClick(user)}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90px' }}
                  className="profile-item"
                >
                  <div style={{
                    width: '70px', height: '70px',
                    backgroundColor: user.avatarColor || '#ccc',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '28px', fontWeight: 'bold', color: '#fff',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s',
                    marginBottom: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {user.isAdmin ? "👑" : user.name.charAt(0)}
                  </div>
                  <div style={{
                    color: '#333',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign:'center',
                    overflow:'hidden',
                    textOverflow:'ellipsis',
                    whiteSpace:'nowrap',
                    width:'100%',
                    lineHeight: '1.2'
                  }}>
                    {user.name}
                  </div>
                </div>
              ))}

              {/* 追加ボタン */}
              <div onClick={() => setMode('add')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90px' }}>
                <div style={{
                  width: '70px', height: '70px',
                  backgroundColor: '#fff', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '30px', color: '#ccc',
                  border: '2px dashed #ccc', boxSizing: 'border-box',
                  marginBottom: '8px'
                }}>
                  +
                </div>
                <div style={{ color: '#888', fontSize: '11px', textAlign: 'center' }}>新規追加</div>
              </div>
            </div>
          </div>

          {/* 店長ログインへのリンク */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button onClick={() => setMode('manager')} style={{ background: 'none', border: 'none', color: '#999', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}>
              管理者ログインはこちら
            </button>
          </div>
        </div>
      )}

      {/* --- 2. PIN入力画面 --- */}
      {mode === 'pin' && selectedUser && (
        <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', backgroundColor: selectedUser.avatarColor, borderRadius: '50%', margin: '0 auto 15px', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'24px', fontWeight:'bold' }}>
            {selectedUser.name.charAt(0)}
          </div>
          <h3 style={{ fontSize: '18px', color: '#333', margin: '0 0 20px 0' }}>{selectedUser.name} さん</h3>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>暗証番号（誕生日4桁）を入力</p>
          
          <form onSubmit={handlePinCheck}>
            <input 
              type="password" maxLength="4" value={inputPin} onChange={(e) => setInputPin(e.target.value)}
              placeholder="●●●●" autoFocus
              style={{ 
                backgroundColor: '#f5f7fa', border: '1px solid #ddd', borderRadius: '8px',
                color: '#333', fontSize: '24px', letterSpacing: '8px', textAlign: 'center',
                padding: '10px', width: '180px', outline: 'none', marginBottom: '20px'
              }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button type="submit" style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>ログイン</button>
              <button onClick={() => setMode('select')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '13px' }}>戻る</button>
            </div>
          </form>
        </div>
      )}

      {/* --- 3. 新規登録画面 --- */}
      {mode === 'add' && (
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '90%', maxWidth: '350px' }}>
          <h3 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>スタッフ登録</h3>
          <form onSubmit={handleAddProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#666', fontWeight:'bold' }}>お名前</label>
              <input type="text" placeholder="例：山田 太郎" value={newName} onChange={(e) => setNewName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#666', fontWeight:'bold' }}>生年月日 (パスワード)</label>
              <input type="date" value={newBirthday} onChange={(e) => setNewBirthday(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={() => setMode('select')} style={{ flex: 1, backgroundColor: '#f5f7fa', color: '#666', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight:'bold' }}>キャンセル</button>
              <button type="submit" style={{ flex: 2, backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight:'bold' }}>登録する</button>
            </div>
          </form>
        </div>
      )}

      {/* --- 4. 店長ログイン --- */}
      {mode === 'manager' && (
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center' }}>
           <h3 style={{ marginBottom: '20px', color: '#333' }}>管理者ログイン</h3>
           <form onSubmit={handleManagerDirect}>
             <input type="password" placeholder="管理パスワード" value={managerPass} onChange={(e) => setManagerPass(e.target.value)} style={{...inputStyle, textAlign:'center', letterSpacing:'2px'}} />
             <div style={{ marginTop: '20px', display:'flex', gap:'10px', justifyContent:'center' }}>
                <button type="button" onClick={() => setMode('select')} style={{ background:'none', border:'1px solid #ddd', color:'#666', padding: '10px 20px', borderRadius:'8px', cursor:'pointer' }}>戻る</button>
                <button type="submit" style={{ backgroundColor: '#333', color: '#fff', border: 'none', padding: '10px 30px', borderRadius:'8px', fontWeight:'bold', cursor:'pointer' }}>ログイン</button>
             </div>
           </form>
        </div>
      )}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', marginTop:'5px' };

export default Login;