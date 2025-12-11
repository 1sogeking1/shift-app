import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, doc, setDoc } from "firebase/firestore"; 
import { db } from "./firebase";

function ShiftInput({ currentUser }) {
  const [shiftRequests, setShiftRequests] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ★30分刻みの時間リストを生成する関数
  const generateTimeOptions = () => {
    const times = [];
    // 09:00 〜 23:30 まで作成（必要に応じて範囲を変えてください）
    for (let h = 9; h < 24; h++) {
      const hour = h.toString().padStart(2, '0');
      times.push(`${hour}:00`);
      times.push(`${hour}:30`);
    }
    return times;
  };
  const timeOptions = generateTimeOptions();

  useEffect(() => {
    const dates = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    
    setCurrentPeriod(`${year}年 ${month}月 後半`);

    const lastDay = new Date(year, month, 0).getDate();

    // 16日〜月末まで
    for (let d = 16; d <= lastDay; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dayIndex = dateObj.getDay();
      const dayStr = dateObj.toLocaleDateString('ja-JP', { weekday: 'short' });
      const isMonday = (dayIndex === 1); // 月曜定休の場合

      dates.push({
        date: `${month}/${d}`,
        day: dayStr,
        dayIndex: dayIndex,
        start: '', // 初期値は空（休み）
        end: '',
        isClosed: isMonday,
      });
    }
    setShiftRequests(dates);
  }, []);

  const handleTimeChange = (index, type, value) => {
    const newShifts = [...shiftRequests];
    newShifts[index][type] = value;
    setShiftRequests(newShifts);
  };

  const handleSubmit = async () => {
    const submitData = shiftRequests.filter(s => s.start !== '' && s.end !== '');
    
    if (submitData.length === 0) {
      alert('シフト希望が入力されていません');
      return;
    }

    setIsSubmitting(true);

    try {
      const q = query(
        collection(db, "shifts"),
        where("userId", "==", currentUser.id),
        where("period", "==", currentPeriod)
      );
      const querySnapshot = await getDocs(q);

      const shiftData = {
        name: currentUser.name,
        userId: currentUser.id,
        period: currentPeriod,
        data: submitData,
        updatedAt: new Date(),
        status: 'pending' 
      };

      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        const docRef = doc(db, "shifts", docId);
        await setDoc(docRef, shiftData, { merge: true });
        alert('シフト希望を更新（上書き）しました！');
      } else {
        await addDoc(collection(db, "shifts"), {
          ...shiftData,
          createdAt: new Date()
        });
        alert('提出が完了しました！');
      }

    } catch (error) {
      console.error("エラー:", error);
      alert("送信に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px 10px', maxWidth: '1000px', margin: '0 auto', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      
      {/* ヘッダー */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#333', fontSize: '18px', fontWeight:'bold', margin: '0 0 5px 0' }}>シフト希望提出</h2>
        <div style={{ fontSize: '13px', color: '#666' }}>
          {currentPeriod} <br/>
          <span style={{ fontWeight:'bold', color:'#007bff' }}>{currentUser.name}</span> さんの希望
        </div>
      </div>

      {/* シフト入力リスト */}
      <div className="shift-list" style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
        {shiftRequests.map((shift, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '10px', 
            borderBottom: '1px solid #f5f5f5',
            backgroundColor: shift.isClosed ? '#f9f9f9' : (shift.dayIndex === 0 ? '#fff7e6' : shift.dayIndex === 6 ? '#f0f5ff' : '#fff'),
            opacity: shift.isClosed ? 0.6 : 1
          }}>
            {/* 日付 */}
            <div style={{ width: '60px', fontWeight: 'bold', fontSize: '14px', color: '#333', textAlign:'center' }}>
              {shift.date} <br/>
              <span style={{ fontSize: '12px', color: shift.dayIndex === 0 ? 'red' : shift.dayIndex === 6 ? 'blue' : '#888' }}>({shift.day})</span>
            </div>
            
            {/* 時間選択プルダウン */}
            <div style={{ flex: 1, display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'flex-end' }}>
              {!shift.isClosed ? (
                <>
                  <select 
                    value={shift.start} 
                    onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">休み</option>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  
                  <span style={{ color: '#ccc' }}>~</span>
                  
                  <select 
                    value={shift.end} 
                    onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">-</option>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </>
              ) : (
                <div style={{ width: '100%', textAlign: 'center', color: '#aaa', fontSize: '12px', padding:'8px 0' }}>定休日</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', paddingBottom: '20px', textAlign:'center' }}>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{ 
            width: '100%', padding: '14px', backgroundColor: isSubmitting ? '#ccc' : '#007bff', 
            color: 'white', border: 'none', borderRadius: '30px', fontSize: '16px', fontWeight:'bold', 
            cursor: isSubmitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
          }}
        >
          {isSubmitting ? '送信中...' : 'シフトを提出する'}
        </button>
      </div>
    </div>
  );
}

// プルダウンのスタイル
const selectStyle = { 
  padding: '8px 5px', 
  borderRadius: '6px', 
  border: '1px solid #ddd', 
  flex: 1, 
  maxWidth: '100px', // 幅を制限
  textAlign: 'center', 
  fontSize: '14px',
  background: '#fff',
  height: '40px'
};

export default ShiftInput;