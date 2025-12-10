import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

function ManagerView() {
  const [submissions, setSubmissions] = useState([]);
  const [calendarMap, setCalendarMap] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingShifts, setEditingShifts] = useState({});
  const [rejectedShifts, setRejectedShifts] = useState({});
  const [reservations, setReservations] = useState({}); 
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);

  const weekColors = ["#fff0f6", "#fff", "#fff", "#fff", "#fff", "#fff", "#f0f5ff"];
  const weekTextColors = ["#ff4d4f", "#333", "#333", "#333", "#333", "#333", "#1890ff"];
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const fetchData = async () => {
    // 1. シフト取得
    const shiftSnapshot = await getDocs(collection(db, "shifts"));
    const rawData = [];
    const dateMap = {}; 
    shiftSnapshot.forEach((doc) => {
      const sub = { id: doc.id, ...doc.data() };
      rawData.push(sub);
      sub.data.forEach((dayInfo, dayIndex) => {
        if (dayInfo.start && dayInfo.end) {
          const key = dayInfo.date; 
          if (!dateMap[key]) dateMap[key] = { dayInfo: dayInfo, applicants: [] };
          dateMap[key].applicants.push({
            submissionId: sub.id, name: sub.name, dayIndex: dayIndex,
            originalStart: dayInfo.start, originalEnd: dayInfo.end,
            fixStart: dayInfo.fixStart || dayInfo.start, fixEnd: dayInfo.fixEnd || dayInfo.end,
            status: sub.status // ★ここでステータスを取得
          });
        }
      });
    });

    // 2. 予約取得
    const resSnapshot = await getDocs(collection(db, "reservations"));
    const resMap = {};
    resSnapshot.forEach((doc) => {
      const data = doc.data(); 
      if (data.date) {
        const parts = data.date.split('-'); 
        if (parts.length === 3) {
          const m = Number(parts[1]); const d = Number(parts[2]);
          const key = `${m}/${d}`;
          if (!resMap[key]) resMap[key] = [];
          resMap[key].push({ id: doc.id, ...data });
        }
      }
    });
    Object.keys(resMap).forEach(date => {
      resMap[date].sort((a, b) => a.time.localeCompare(b.time));
    });

    setSubmissions(rawData); setCalendarMap(dateMap); setReservations(resMap);
  };

  useEffect(() => { fetchData(); }, []);

  const changeMonth = (offset) => {
    let newMonth = viewMonth + offset;
    let newYear = viewYear;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setViewMonth(newMonth); setViewYear(newYear);
  };

  const generateCalendarDays = () => {
    const days = [];
    const firstDate = new Date(viewYear, viewMonth - 1, 1);
    const lastDate = new Date(viewYear, viewMonth, 0);
    for (let i = 0; i < firstDate.getDay(); i++) days.push({ type: 'empty', key: `empty-${i}` });
    for (let d = 1; d <= lastDate.getDate(); d++) {
      const dateKey = `${viewMonth}/${d}`;
      const appData = calendarMap[dateKey];
      const resData = reservations[dateKey] || [];
      days.push({ type: 'day', date: d, fullDate: dateKey, applicants: appData ? appData.applicants : [], reservations: resData });
    }
    return days;
  };

  const handleTimeChange = (submissionId, type, value) => {
    setEditingShifts(prev => ({ ...prev, [`${submissionId}_${type}`]: value }));
  };
  const toggleReject = (submissionId) => {
    setRejectedShifts(prev => ({ ...prev, [submissionId]: !prev[submissionId] }));
  };
  const handleSaveDay = async () => {
    if (!selectedDate) return;
    const targetDateData = calendarMap[selectedDate];
    const updates = {};
    targetDateData.applicants.forEach(app => {
      const isRejected = rejectedShifts[app.submissionId];
      let newStart = editingShifts[`${app.submissionId}_start`] !== undefined ? editingShifts[`${app.submissionId}_start`] : app.fixStart;
      let newEnd = editingShifts[`${app.submissionId}_end`] !== undefined ? editingShifts[`${app.submissionId}_end`] : app.fixEnd;
      if (isRejected) { newStart = ""; newEnd = ""; }
      if (!updates[app.submissionId]) {
        const originalSub = submissions.find(s => s.id === app.submissionId);
        updates[app.submissionId] = [...originalSub.data];
      }
      updates[app.submissionId][app.dayIndex] = {
        ...updates[app.submissionId][app.dayIndex],
        fixStart: newStart, fixEnd: newEnd, start: newStart, end: newEnd
      };
    });
    try {
      const promises = Object.keys(updates).map(subId => {
        const shiftRef = doc(db, "shifts", subId);
        return updateDoc(shiftRef, { data: updates[subId], status: "confirmed" }); // ステータスをconfirmedに
      });
      await Promise.all(promises);
      alert("保存しました！");
      setEditingShifts({}); setRejectedShifts({}); setSelectedDate(null); fetchData();
    } catch (error) { alert("エラーが発生しました"); }
  };

  const calendarDays = generateCalendarDays();

  return (
    <div style={{ padding: '20px', width: '100%', boxSizing: 'border-box', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
        <button onClick={() => changeMonth(-1)} style={navButtonStyle}>＜</button>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#333', fontWeight: 'bold' }}>{viewYear}年 {viewMonth}月</h2>
        <button onClick={() => changeMonth(1)} style={navButtonStyle}>＞</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,0.03)' }}>
        {weekDays.map((day, index) => (
          <div key={index} style={{ padding: '12px 0', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: '#aaa', borderBottom: '1px solid #eee' }}>{day}</div>
        ))}

        {calendarDays.map((cell, index) => {
          if (cell.type === 'empty') return <div key={cell.key} style={{ background: '#fcfcfc', borderBottom: '1px solid #eee' }} />;
          
          const resCount = cell.reservations.length;
          
          // ★ここで「未承認（申請）」と「確定」の人数を数える
          const pendingCount = cell.applicants.filter(a => a.status !== 'confirmed').length;
          const confirmedCount = cell.applicants.filter(a => a.status === 'confirmed').length;

          const dayOfWeek = new Date(viewYear, viewMonth - 1, cell.date).getDay();
          
          return (
            <div 
              key={index} 
              onClick={() => setSelectedDate(cell.fullDate)}
              style={{ 
                minHeight: '80px', padding: '6px', borderBottom: '1px solid #eee', borderRight: '1px solid #eee',
                cursor: 'pointer',
                backgroundColor: weekColors[dayOfWeek], position: 'relative',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = weekColors[dayOfWeek]}
            >
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: weekTextColors[dayOfWeek], marginBottom:'6px' }}>{cell.date}</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                
                {/* 1. 未承認（申請）がある場合（赤色） */}
                {pendingCount > 0 && (
                  <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                    <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#ff4d4f' }}></span>
                    <span style={{ fontSize: '10px', color:'#ff4d4f', fontWeight:'bold' }}>申請 {pendingCount}</span>
                  </div>
                )}

                {/* 2. 確定済みがいる場合（緑色） */}
                {confirmedCount > 0 && (
                  <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                    <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#28a745' }}></span>
                    <span style={{ fontSize: '10px', color:'#28a745', fontWeight:'bold' }}>確定 {confirmedCount}</span>
                  </div>
                )}

                {/* 3. 予約数（青色） */}
                {resCount > 0 && (
                   <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                    <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#1890ff' }}></span>
                    <span style={{ fontSize: '10px', color:'#555' }}>予約 {resCount}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* モーダル (前回と同じ内容) */}
      {selectedDate && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(2px)' }}>
          <div style={{ backgroundColor: '#f8f9fa', borderRadius: '16px', width: '90%', maxWidth: '450px', maxHeight: '90%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight:'bold', color:'#333' }}>{selectedDate} の調整</h3>
              <button onClick={() => setSelectedDate(null)} style={closeButtonStyle}>✕</button>
            </div>

            <div style={{ overflowY: 'auto', padding: '20px' }}>
              
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '15px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border:'1px solid #e6f7ff' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#1890ff', fontWeight:'bold' }}>📖 予約リスト</h4>
                  <span style={{ fontSize:'12px', color:'#1890ff', background:'#e6f7ff', padding:'2px 8px', borderRadius:'10px' }}>{reservations[selectedDate]?.length || 0}件</span>
                </div>
                {(reservations[selectedDate] || []).length === 0 ? (
                  <div style={{ color: '#bbb', fontSize: '13px', textAlign:'center', padding:'10px' }}>予約はありません</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(reservations[selectedDate]).map(res => (
                      <div key={res.id} style={{ display: 'flex', fontSize: '14px', alignItems:'center', borderBottom: '1px solid #f5f5f5', paddingBottom: '6px' }}>
                        <span style={{ fontWeight: 'bold', width: '50px', color:'#333' }}>{res.time}</span>
                        <span style={{ flex: 1, color:'#333' }}>{res.name} 様</span>
                        <span style={{ fontSize:'13px', color:'#666' }}>{res.count}名</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <h4 style={{ margin: '0 0 10px 5px', fontSize: '14px', color: '#666' }}>📝 スタッフ配置</h4>
              {(calendarMap[selectedDate]?.applicants || []).length === 0 ? (
                <div style={{ backgroundColor:'#fff', padding:'30px', borderRadius:'12px', textAlign:'center', color:'#ccc', fontSize:'14px' }}>シフト希望なし</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(calendarMap[selectedDate].applicants).map((app) => {
                    const isRejected = rejectedShifts[app.submissionId];
                    return (
                      <div key={app.submissionId} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.03)', border: isRejected ? '1px dashed #ddd' : '1px solid #eee', opacity: isRejected ? 0.7 : 1, background: isRejected ? '#fafafa' : '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '16px', color:'#333', textDecoration: isRejected ? 'line-through' : 'none' }}>{app.name}</div>
                          <div style={{ fontSize: '12px', color: '#888', background: '#f5f5f5', padding: '2px 8px', borderRadius: '4px' }}>希望 {app.originalStart} - {app.originalEnd}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                            <input type="time" value={editingShifts[`${app.submissionId}_start`] !== undefined ? editingShifts[`${app.submissionId}_start`] : app.fixStart} onChange={(e) => handleTimeChange(app.submissionId, 'start', e.target.value)} disabled={isRejected} style={styledInput} />
                            <span style={{color:'#ccc'}}>~</span>
                            <input type="time" value={editingShifts[`${app.submissionId}_end`] !== undefined ? editingShifts[`${app.submissionId}_end`] : app.fixEnd} onChange={(e) => handleTimeChange(app.submissionId, 'end', e.target.value)} disabled={isRejected} style={styledInput} />
                          </div>
                          <button onClick={() => toggleReject(app.submissionId)} style={{ background: isRejected ? '#eee' : '#fff0f0', color: isRejected ? '#888' : '#ff4d4f', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', minWidth: '60px', transition: 'all 0.2s' }}>{isRejected ? "戻す" : "除外"}</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ padding: '15px', borderTop: '1px solid #eee', textAlign: 'center', backgroundColor: '#fff' }}>
              <button onClick={handleSaveDay} style={primaryButtonStyle}>決定して保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const navButtonStyle = { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888' };
const closeButtonStyle = { background: '#f0f0f0', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', color: '#555', display:'flex', alignItems:'center', justifyContent:'center' };
const styledInput = { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '16px', textAlign: 'center', background:'#fdfdfd' };
const primaryButtonStyle = { width: '100%', padding: '14px', backgroundColor: '#28a745', color: 'white', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '30px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)' };

export default ManagerView;