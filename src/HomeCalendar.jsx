import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
// Timecardのimportを削除

function HomeCalendar({ currentUser, onMenuClick }) {
  const [confirmedShifts, setConfirmedShifts] = useState({});
  const [reservations, setReservations] = useState({});
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(null);

  const [hourlyWage, setHourlyWage] = useState(0);
  const [monthlySalary, setMonthlySalary] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  const weekColors = ["#fff0f6", "#fff", "#fff", "#fff", "#fff", "#fff", "#f0f5ff"];
  const weekTextColors = ["#ff4d4f", "#333", "#333", "#333", "#333", "#333", "#1890ff"];
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  useEffect(() => {
    const fetchShifts = async () => {
      const querySnapshot = await getDocs(collection(db, "shifts"));
      const map = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'confirmed' && data.data) {
          data.data.forEach(day => {
            if (day.start && day.end) {
              const dateKey = day.date;
              if (!map[dateKey]) map[dateKey] = [];
              map[dateKey].push({
                name: data.name,
                start: day.start,
                end: day.end
              });
            }
          });
        }
      });
      setConfirmedShifts(map);
    };
    fetchShifts();
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      const querySnapshot = await getDocs(collection(db, "reservations"));
      const map = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.date) {
          const dateKey = data.date;
          if (!map[dateKey]) map[dateKey] = [];
          map[dateKey].push({
            id: doc.id,
            time: data.time || '',
            name: data.name || '',
            count: data.count || 0
          });
        }
      });
      setReservations(map);
    };
    fetchReservations();
  }, []);

  useEffect(() => {
    const fetchWage = async () => {
      if (currentUser?.id) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.id));
          if (userDoc.exists()) {
            setHourlyWage(userDoc.data().hourlyWage || 0);
          }
        } catch (e) { console.error(e); }
      }
    };
    fetchWage();
  }, [currentUser]);

  const changeMonth = (offset) => {
    let newMonth = viewMonth + offset;
    let newYear = viewYear;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setViewMonth(newMonth); setViewYear(newYear); setSelectedDate(null);
  };

  const generateDays = () => {
    const days = [];
    const firstDate = new Date(viewYear, viewMonth - 1, 1);
    const lastDate = new Date(viewYear, viewMonth, 0);
    for (let i = 0; i < firstDate.getDay(); i++) days.push({ type: 'empty', key: `empty-${i}` });
    for (let d = 1; d <= lastDate.getDate(); d++) {
      const dateKey = `${viewMonth}/${d}`;
      days.push({ type: 'day', date: d, key: dateKey, shifts: confirmedShifts[dateKey] || [] });
    }
    return days;
  };
  const calendarDays = generateDays();

  useEffect(() => {
    if (hourlyWage === 0) return;
    let hoursSum = 0;
    calendarDays.forEach(day => {
      if (day.type === 'day') {
        const myShift = day.shifts.find(s => s.name === currentUser.name);
        if (myShift) {
          const parseTime = (t) => {
            const [h, m] = t.split(':').map(Number);
            return h + (m / 60);
          };
          let start = parseTime(myShift.start);
          let end = parseTime(myShift.end);
          if (end < start) end += 24;
          hoursSum += (end - start);
        }
      }
    });
    setTotalHours(hoursSum);
    setMonthlySalary(Math.floor(hoursSum * hourlyWage));
  }, [confirmedShifts, hourlyWage, viewMonth, viewYear]);

  return (
    <div style={{ padding: '20px', width: '100%', boxSizing: 'border-box', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', gap: '20px', position: 'relative' }}>
        <button onClick={onMenuClick} style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', fontSize: '24px', cursor: 'pointer', padding: 0 }}>≡</button>
        <button onClick={() => changeMonth(-1)} style={navButtonStyle}>＜</button>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#333', fontWeight: 'bold' }}>{viewYear}年 {viewMonth}月</h2>
        <button onClick={() => changeMonth(1)} style={navButtonStyle}>＞</button>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '15px 20px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #ffffff 0%, #f9faff 100%)' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#888', fontWeight: 'bold', marginBottom:'4px' }}>今月の見込み給与</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>¥ {monthlySalary.toLocaleString()}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#888' }}>稼働時間</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#007bff' }}>{totalHours} h</div>
          <div style={{ fontSize: '10px', color: '#aaa' }}>時給: ¥{hourlyWage}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,0.03)' }}>
        {weekDays.map((day, i) => <div key={i} style={{ padding: '12px 0', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: '#aaa', borderBottom: '1px solid #eee' }}>{day}</div>)}
        {calendarDays.map((cell) => {
          if (cell.type === 'empty') return <div key={cell.key} style={{ background: '#fcfcfc', borderBottom: '1px solid #eee' }} />;
          const isSelected = selectedDate === cell.key;
          const dayOfWeek = new Date(viewYear, viewMonth - 1, cell.date).getDay();
          const myShift = cell.shifts.find(s => s.name === currentUser.name);
          const otherShiftCount = cell.shifts.length;
          return (
            <div key={cell.key} onClick={() => setSelectedDate(cell.key)} style={{ minHeight: '80px', padding: '6px', borderBottom: '1px solid #eee', borderRight: '1px solid #eee', cursor: 'pointer', backgroundColor: isSelected ? '#e6f7ff' : weekColors[dayOfWeek], position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: weekTextColors[dayOfWeek], marginBottom:'6px' }}>{cell.date}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                {myShift && <div style={{ display:'flex', alignItems:'center', justifyContent:'center', background:'#fff7e6', padding:'2px', borderRadius:'4px', border:'1px solid #ffd591' }}><span style={{ fontSize: '10px', color:'#d46b08', fontWeight:'bold' }}>★ 出勤</span></div>}
                {!myShift && otherShiftCount > 0 && <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}><span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#1890ff' }}></span><span style={{ fontSize: '10px', color:'#888' }}>{otherShiftCount}名</span></div>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '20px' }}>
        {selectedDate ? (
          <div style={{ display: 'grid', gap: '15px' }}>
            {/* 出勤メンバー */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '15px', border: '1px solid #eee', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333', fontWeight:'bold', borderLeft: '4px solid #1890ff', paddingLeft: '10px' }}>{selectedDate} の出勤メンバー</h3>
              {confirmedShifts[selectedDate]?.length > 0 ? (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {confirmedShifts[selectedDate].map((shift, i) => {
                    const isMe = shift.name === currentUser.name;
                    return (
                      <div key={i} style={{ backgroundColor: isMe ? '#fff7e6' : '#f9f9f9', border: isMe ? '1px solid #ffd591' : '1px solid #eee', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', color: '#333' }}>{shift.name} {isMe && "(自分)"}</span>
                        <span style={{ color: isMe ? '#d46b08' : '#1890ff', fontWeight: 'bold', fontSize: '14px', background: isMe ? '#fff' : '#e6f7ff', padding:'2px 8px', borderRadius:'4px' }}>{shift.start} 〜 {shift.end}</span>
                      </div>
                    );
                  })}
                </div>
              ) : <p style={{ color: '#999', textAlign: 'center', fontSize: '14px' }}>シフトはありません</p>}
            </div>

            {/* 予約情報 */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '15px', border: '1px solid #eee', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333', fontWeight:'bold', borderLeft: '4px solid #52c41a', paddingLeft: '10px' }}>{selectedDate} の予約</h3>
              {reservations[selectedDate]?.length > 0 ? (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {reservations[selectedDate].map((reservation, i) => (
                    <div key={i} style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 'bold', color: '#333', display: 'block' }}>{reservation.name} 様</span>
                        <span style={{ fontSize: '12px', color: '#888' }}>{reservation.count}名</span>
                      </div>
                      <span style={{ color: '#52c41a', fontWeight: 'bold', fontSize: '14px', background: '#fff', padding:'4px 10px', borderRadius:'4px' }}>{reservation.time}</span>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: '#999', textAlign: 'center', fontSize: '14px' }}>予約はありません</p>}
            </div>
          </div>
        ) : <p style={{ color: '#ccc', textAlign: 'center', marginTop: '40px', fontSize: '14px' }}>日付をタップして詳細を確認</p>}
      </div>
    </div>
  );
}

const navButtonStyle = { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888' };

export default HomeCalendar;