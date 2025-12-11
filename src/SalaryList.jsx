import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

function SalaryList() {
  const [users, setUsers] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [viewMonth, setViewMonth] = useState(new Date().toISOString().slice(0, 7)); // "2025-12"
  const [selectedUser, setSelectedUser] = useState(null); // 詳細を表示するユーザー
  const [menuOpenId, setMenuOpenId] = useState(null); // メニューを開いているユーザーID

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      // 1. ユーザー（時給）取得
      const userSnap = await getDocs(collection(db, "users"));
      const userList = [];
      userSnap.forEach(doc => userList.push({ id: doc.id, ...doc.data() }));
      setUsers(userList);

      // 2. 打刻データ取得
      // 本当は期間指定すべきだが、簡易的に全件取得してJSでフィルタリング
      const attSnap = await getDocs(collection(db, "attendance"));
      const attMap = {};
      
      attSnap.forEach(doc => {
        const data = doc.data();
        if (data.date && data.date.startsWith(viewMonth) && data.endTime) {
          if (!attMap[data.userId]) attMap[data.userId] = [];
          attMap[data.userId].push(data);
        }
      });
      setAttendanceData(attMap);
    };
    fetchData();
  }, [viewMonth]);

  // 時間計算（分単位）
  const calcMinutes = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff < 0) diff += 24 * 60; // 日付またぎ
    return diff;
  };

  // 給与計算
  const calculateSalary = (user) => {
    const records = attendanceData[user.id] || [];
    let totalMinutes = 0;
    records.forEach(rec => {
      totalMinutes += calcMinutes(rec.startTime, rec.endTime);
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const wage = user.hourlyWage || 0;
    const salary = Math.floor((totalMinutes / 60) * wage);

    return { hours, mins, salary, count: records.length };
  };

  return (
    <div style={{ padding: '20px 10px', maxWidth: '1000px', margin: '0 auto', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      
      {/* ヘッダー */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#333', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>💰 給与計算・実績</h2>
        <input 
          type="month" 
          value={viewMonth} 
          onChange={(e) => setViewMonth(e.target.value)}
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '16px' }}
        />
      </div>

      {/* スタッフリスト */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {users.map((user) => {
          const { hours, mins, salary, count } = calculateSalary(user);
          
          return (
            <div key={user.id} style={{ 
              backgroundColor: '#fff', padding: '15px', borderRadius: '12px', 
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #eee',
              position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              {/* 左側：名前と稼働 */}
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
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {count}回出勤 / {hours}時間{mins}分
                  </div>
                </div>
              </div>

              {/* 右側：金額とメニュー */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>¥{salary.toLocaleString()}</div>
                  <div style={{ fontSize: '10px', color: '#aaa' }}>時給 ¥{user.hourlyWage || 0}</div>
                </div>

                {/* ︙ボタン */}
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setMenuOpenId(menuOpenId === user.id ? null : user.id)}
                    style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#aaa', padding:'0 5px' }}
                  >
                    ︙
                  </button>
                  
                  {/* ポップアップメニュー */}
                  {menuOpenId === user.id && (
                    <div style={{ 
                      position: 'absolute', right: 0, top: '30px', 
                      backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', 
                      borderRadius: '6px', zIndex: 10, width: '100px', overflow: 'hidden'
                    }}>
                      <button 
                        onClick={() => { setSelectedUser(user); setMenuOpenId(null); }}
                        style={{ width: '100%', padding: '10px', textAlign: 'left', border: 'none', background: '#fff', cursor: 'pointer', fontSize:'14px' }}
                      >
                        📄 詳細
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 詳細モーダル */}
      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{selectedUser.name} さんの勤怠</h3>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ overflowY: 'auto', padding: '15px' }}>
              {(attendanceData[selectedUser.id] || []).length === 0 ? (
                <p style={{ textAlign: 'center', color: '#aaa' }}>データがありません</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee', color: '#888' }}>
                      <th style={{ textAlign: 'left', padding: '8px' }}>日付</th>
                      <th style={{ textAlign: 'center', padding: '8px' }}>時間</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>勤務</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(attendanceData[selectedUser.id] || []).sort((a,b)=>a.date.localeCompare(b.date)).map((rec, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '8px' }}>{rec.date.slice(5)}</td>
                        <td style={{ textAlign: 'center', padding: '8px' }}>{rec.startTime} - {rec.endTime}</td>
                        <td style={{ textAlign: 'right', padding: '8px' }}>
                          {Math.floor(calcMinutes(rec.startTime, rec.endTime)/60)}h
                          {calcMinutes(rec.startTime, rec.endTime)%60}m
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalaryList;