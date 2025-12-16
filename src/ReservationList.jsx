import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "./firebase";
import AppHeader from './AppHeader';

function ReservationList({ currentUser, onMenuClick }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reservations, setReservations] = useState([]);
  
  const [time, setTime] = useState("18:00");
  const [name, setName] = useState("");
  const [count, setCount] = useState("");
  const [phone, setPhone] = useState(""); 
  const [memo, setMemo] = useState("");   

  const generateTimeOptions = () => {
    const times = [];
    for (let h = 10; h < 24; h++) {
      const hour = h.toString().padStart(2, '0');
      times.push(`${hour}:00`);
      times.push(`${hour}:30`);
    }
    return times;
  };
  const timeOptions = generateTimeOptions();

  const fetchReservations = async (targetDate) => {
    const q = query(collection(db, "reservations"), where("date", "==", targetDate));
    const querySnapshot = await getDocs(q);
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    list.sort((a, b) => a.time.localeCompare(b.time));
    setReservations(list);
  };

  useEffect(() => {
    fetchReservations(date);
  }, [date]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!time || !name || !count) return;

    try {
      await addDoc(collection(db, "reservations"), {
        date: date, time: time, name: name, count: Number(count),
        phone: phone, memo: memo, acceptedBy: currentUser.name, createdAt: new Date()
      });
      setTime("18:00"); setName(""); setCount(""); setPhone(""); setMemo("");
      fetchReservations(date);
      alert("予約を追加しました！");
    } catch (error) { alert("エラーが発生しました"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("この予約を削除しますか？")) {
      await deleteDoc(doc(db, "reservations", id));
      fetchReservations(date);
    }
  };

  // ★統一されたコンテナスタイル
  return (
    <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      <AppHeader onMenuClick={onMenuClick} pageName="予約" />

      <div style={{ padding: '20px 10px', paddingTop: '90px', maxWidth: '1000px', margin: '0 auto' }}>

      {/* 日付選択 */}
      <div style={{ textAlign: 'center', marginBottom: '20px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '12px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold', color: '#555' }}>日付:</label>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          style={{ padding: '8px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ddd' }}
        />
      </div>

      {/* 新規予約フォーム */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #eee' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px', color: '#333' }}>
          ✍️ 新しい予約 (受付担当: {currentUser.name})
        </h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>時間</div>
              <select value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle}>
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>人数</div>
              <input type="number" value={count} onChange={(e) => setCount(e.target.value)} placeholder="名" required style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>お名前</div>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="様" required style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>電話番号</div>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="090-..." style={inputStyle} />
            </div>
          </div>

          <div>
            <div style={labelStyle}>メモ</div>
            <textarea 
              value={memo} 
              onChange={(e) => setMemo(e.target.value)} 
              placeholder="アレルギー・席希望など"
              style={{ ...inputStyle, height: '60px', resize: 'none' }} 
            />
          </div>

          <button type="submit" style={addButtonStyle}>予約を追加する</button>
        </form>
      </div>

      {/* リスト表示 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
        <div style={{ padding: '15px', backgroundColor: '#f0f5ff', color: '#1890ff', fontWeight: 'bold', fontSize: '14px' }}>
          {date} の予約リスト ({reservations.length}件)
        </div>
        
        {reservations.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>予約はありません</div>
        ) : (
          <div>
            {reservations.map((res) => (
              <div key={res.id} style={{ padding: '15px', borderBottom: '1px solid #f5f5f5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', minWidth: '50px' }}>{res.time}</div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#333' }}>
                        {res.name} 様 <span style={{ fontSize: '13px', color: '#666' }}>({res.count}名)</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>📞 {res.phone || 'なし'}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(res.id)} style={{ background: '#fff0f0', border: 'none', color: '#ff4d4f', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>削除</button>
                </div>
                <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '6px', fontSize: '12px', color: '#555' }}>
                  {res.memo && <div style={{ marginBottom: '4px' }}><span style={{ fontWeight: 'bold', color: '#333' }}>メモ:</span> {res.memo}</div>}
                  <div style={{ textAlign: 'right', fontSize: '10px', color: '#aaa' }}>受付: {res.acceptedBy || '不明'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

const labelStyle = { fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '16px' };
const addButtonStyle = { width: '100%', padding: '14px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', boxShadow: '0 4px 10px rgba(40,167,69,0.2)' };

export default ReservationList;