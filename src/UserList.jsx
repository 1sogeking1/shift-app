import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

function UserList() {
  const [users, setUsers] = useState([]);

  // ユーザー一覧を取得
  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    // 名前順に並び替え
    list.sort((a, b) => a.name.localeCompare(b.name));
    setUsers(list);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 時給の変更処理
  const handleWageChange = (id, newWage) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, hourlyWage: newWage } : user
    ));
  };

  // 保存処理
  const handleSave = async (id, currentWage) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        hourlyWage: Number(currentWage)
      });
      alert("更新しました！");
    } catch (error) {
      alert("エラーが発生しました");
    }
  };

  // ★削除処理
  const handleDelete = async (id, userName, isAdmin) => {
    if (isAdmin) {
      alert("管理者アカウントは削除できません");
      return;
    }

    if (!window.confirm(`${userName} さんのアカウントを完全に削除しますか？\n\nこの操作は取り消せません。\n関連するシフトや勤怠データも削除されます。`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "users", id));
      alert("削除しました");
      fetchUsers(); // リストを再読み込み
    } catch (error) {
      console.error("削除エラー:", error);
      alert("削除に失敗しました");
    }
  };

  return (
    <div style={{ padding: '20px 10px', maxWidth: '1000px', margin: '0 auto', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#333', fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>👥 スタッフ管理・時給設定</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {users.map((user) => (
          <div key={user.id} style={{ 
            backgroundColor: '#fff', padding: '15px', borderRadius: '12px', 
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #eee',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            {/* 左側：アイコンと名前 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ 
                width: '50px', height: '50px', borderRadius: '50%', 
                backgroundColor: user.avatarColor || '#ccc', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px'
              }}>
                {user.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#333' }}>{user.name}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{user.isAdmin ? '管理者' : 'スタッフ'}</div>
              </div>
            </div>

            {/* 右側：時給入力、保存ボタン、削除ボタン */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', color: '#888', display: 'block' }}>時給</span>
                <input
                  type="number"
                  value={user.hourlyWage || ''}
                  onChange={(e) => handleWageChange(user.id, e.target.value)}
                  placeholder="未設定"
                  style={{
                    width: '70px', padding: '5px', borderRadius: '4px', border: '1px solid #ddd',
                    textAlign: 'right', fontSize: '16px'
                  }}
                />
              </div>
              <button
                onClick={() => handleSave(user.id, user.hourlyWage)}
                style={{
                  backgroundColor: '#007bff', color: '#fff', border: 'none',
                  borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
                }}
              >
                保存
              </button>
              <button
                onClick={() => handleDelete(user.id, user.name, user.isAdmin)}
                style={{
                  backgroundColor: user.isAdmin ? '#eee' : '#fff0f0',
                  color: user.isAdmin ? '#999' : '#ff4d4f',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  cursor: user.isAdmin ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  opacity: user.isAdmin ? 0.5 : 1
                }}
                disabled={user.isAdmin}
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;