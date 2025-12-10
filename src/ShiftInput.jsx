import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, doc, setDoc } from "firebase/firestore"; 
import { db } from "./firebase";

function ShiftInput({ currentUser }) {
  const [shiftRequests, setShiftRequests] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commonTimes = ["10:00", "11:00", "12:00", "17:00", "18:00", "19:00", "22:00", "23:00"];

  useEffect(() => {
    const dates = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    
    // 期間のIDとして使う文字列（例: "2025-12-late"）
    // ※今回は簡易的に表示タイトルと同じにしていますが、厳密に管理するならID分けると良いです
    setCurrentPeriod(`${year}年 ${month}月 後半`);

    const lastDay = new Date(year, month, 0).getDate();

    for (let d = 16; d <= lastDay; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dayIndex = dateObj.getDay();
      const dayStr = dateObj.toLocaleDateString('ja-JP', { weekday: 'short' });
      const isMonday = (dayIndex === 1);

      dates.push({
        date: `${month}/${d}`,
        day: dayStr,
        dayIndex: dayIndex,
        start: '',
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
      // 1. 既に提出済みかチェックする
      // 「自分のID」かつ「今の期間」のデータを探す
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
        // 再提出時はステータスをどうするか？
        // 一般的には「承認待ち」に戻す（変更があったため）
        status: 'pending' 
      };

      if (!querySnapshot.empty) {
        // 2a. データが見つかったら -> 上書き更新 (setDoc)
        const docId = querySnapshot.docs[0].id; // 既存のIDを使う
        const docRef = doc(db, "shifts", docId);
        await setDoc(docRef, shiftData, { merge: true }); // 上書き
        alert('シフト希望を更新（上書き）しました！');
      } else {
        // 2b. データがなければ -> 新規作成 (addDoc)
        await addDoc(collection(db, "shifts"), {
          ...shiftData,
          createdAt: new Date()
        });
        alert('提出が完了しました！');
      }
      
      // 入力欄をクリアしたい場合はここで行う
      // const resetShifts = shiftRequests.map(s => ({...s, start:'', end:''}));
      // setShiftRequests(resetShifts);

    } catch (error) {
      console.error("エラー:", error);
      alert("送信に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#333', fontSize: '20px' }}>シフト希望の提出</h2>
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        {currentPeriod} <br/>
        <strong>{currentUser.name}</strong> さんの希望を入力してください
      </p>

      <datalist id="suggested-times">
        {commonTimes.map(time => <option key={time} value={time} />)}
      </datalist>

      <div className="shift-list" style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {shiftRequests.map((shift, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '12px 15px', 
            borderBottom: '1px solid #eee',
            backgroundColor: shift.isClosed ? '#f9f9f9' : (shift.dayIndex === 0 ? '#fff7e6' : shift.dayIndex === 6 ? '#f0f5ff' : '#fff'),
            opacity: shift.isClosed ? 0.6 : 1
          }}>
            <div style={{ width: '80px', fontWeight: 'bold', color: '#333' }}>
              {shift.date} <span style={{ fontSize: '12px', color: shift.dayIndex === 0 ? 'red' : shift.dayIndex === 6 ? 'blue' : '#888' }}>({shift.day})</span>
            </div>
            
            <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
              {!shift.isClosed ? (
                <>
                  <input 
                    type="time" 
                    list="suggested-times"
                    value={shift.start}
                    onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                    style={inputStyle}
                  />
                  <span style={{ color: '#ccc' }}>~</span>
                  <input 
                    type="time" 
                    list="suggested-times"
                    value={shift.end}
                    onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                    style={inputStyle}
                  />
                </>
              ) : (
                <div style={{ width: '100%', textAlign: 'center', color: '#aaa', fontSize: '12px' }}>定休日</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', paddingBottom: '20px' }}>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{ 
            width: '100%', padding: '15px', backgroundColor: isSubmitting ? '#ccc' : '#007bff', 
            color: 'white', border: 'none', borderRadius: '30px', fontSize: '16px', fontWeight:'bold', 
            cursor: isSubmitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 10px rgba(0,123,255,0.3)'
          }}
        >
          {isSubmitting ? '送信中...' : 'シフトを提出(更新)する'}
        </button>
      </div>
    </div>
  );
}

const inputStyle = { padding: '8px', borderRadius: '6px', border: '1px solid #ddd', flex: 1, textAlign: 'center', fontSize: '14px' };

export default ShiftInput;