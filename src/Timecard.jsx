import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

function Timecard({ currentUser }) {
  const [status, setStatus] = useState("loading");
  const [docId, setDocId] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  const [todayShift, setTodayShift] = useState(null); 
  const [isEarly, setIsEarly] = useState(false); 

  // ★設定（位置情報を合わせてください）
  const SHOP_LAT = 34.266108; 
  const SHOP_LNG = 135.151767;
  const ALLOWED_RADIUS_METERS = 300; 
  const ALLOWED_EARLY_MINUTES = 15;

  const getTodayDateKey = () => {
    const d = new Date();
    return `${d.getMonth()+1}/${d.getDate()}`; 
  };

  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getCurrentTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const toMinutes = (timeStr) => {
    if(!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  useEffect(() => {
    const loadData = async () => {
      const todayStr = getTodayString();
      const todayKey = getTodayDateKey();

      // シフト確認
      const shiftQ = query(collection(db, "shifts"), where("userId", "==", currentUser.id));
      const shiftSnaps = await getDocs(shiftQ);
      let foundShift = null;

      shiftSnaps.forEach(doc => {
        const data = doc.data();
        // data.data の中に今日のデータがあるか（status: confirmed のものだけ見るべきだが簡易的に）
        if (data.status === 'confirmed') {
          const dayData = data.data.find(d => d.date === todayKey);
          if (dayData && dayData.start && dayData.end) {
            foundShift = dayData;
          }
        }
      });
      setTodayShift(foundShift);

      // 打刻確認
      const attQ = query(
        collection(db, "attendance"),
        where("userId", "==", currentUser.id),
        where("date", "==", todayStr)
      );
      const attSnap = await getDocs(attQ);
      
      if (attSnap.empty) {
        setStatus("before_work");
      } else {
        const data = attSnap.docs[0].data();
        setDocId(attSnap.docs[0].id);
        setStartTime(data.startTime);
        if (data.endTime) {
          setEndTime(data.endTime);
          setStatus("finished");
        } else {
          setStatus("working");
        }
      }
    };
    if (currentUser) loadData();
  }, [currentUser]);

  // 時間チェック
  useEffect(() => {
    const checkTime = () => {
      if (!todayShift) {
        setIsEarly(false); // シフトがないなら「早い」判定もしない
        return;
      }
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = toMinutes(todayShift.start);

      if (nowMinutes < startMinutes - ALLOWED_EARLY_MINUTES) {
        setIsEarly(true);
      } else {
        setIsEarly(false);
      }
    };
    checkTime();
    const timer = setInterval(checkTime, 60000); 
    return () => clearInterval(timer);
  }, [todayShift]);

  const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };
  const deg2rad = (deg) => deg * (Math.PI/180);

  const checkLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { alert("位置情報が使えません"); resolve(false); return; }
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoadingLocation(false);
          const dist = getDistanceFromLatLonInMeters(pos.coords.latitude, pos.coords.longitude, SHOP_LAT, SHOP_LNG);
          if (dist <= ALLOWED_RADIUS_METERS) resolve(true);
          else {
            alert(`お店から離れすぎています (約${Math.round(dist)}m)`);
            resolve(false);
          }
        },
        () => {
          setLoadingLocation(false);
          alert("位置情報をONにしてください");
          resolve(false);
        },
        { enableHighAccuracy: true }
      );
    });
  };

  // ★出勤処理
  const handleClockIn = async () => {
    let unscheduledReason = "";
    let earlyReason = "";

    // 1. シフトがない場合
    if (!todayShift) {
      const reason = prompt("本日はシフト予定がありません。\n出勤理由を入力してください。\n(例: 店長からの急な呼び出し)");
      if (!reason) {
        alert("理由がないと出勤できません。");
        return;
      }
      unscheduledReason = reason;
    }
    // 2. シフトがあるが、早すぎる場合
    else if (isEarly) {
      const reason = prompt(`シフト開始(${todayShift.start})より早いです。\n早出の理由を入力してください。\n(例: 開店準備のため)`);
      if (!reason) {
        alert("理由がないと出勤できません。");
        return;
      }
      earlyReason = reason;
    }
    
    // 3. 意思確認とGPSチェック
    if(!window.confirm("出勤しますか？")) return;
    if (!(await checkLocation())) return;

    const time = getCurrentTime();
    try {
      const docRef = await addDoc(collection(db, "attendance"), {
        userId: currentUser.id, userName: currentUser.name, date: getTodayString(),
        startTime: time, endTime: null, serverTimestampIn: serverTimestamp(), createdAt: new Date(),
        scheduledStart: todayShift ? todayShift.start : null, 
        scheduledEnd: todayShift ? todayShift.end : null,
        earlyWorkReason: earlyReason,       // 早出理由
        unscheduledReason: unscheduledReason // シフト外理由
      });
      setDocId(docRef.id);
      setStartTime(time);
      setStatus("working");
    } catch (e) { alert("エラー"); }
  };

  // 退勤処理
  const handleClockOut = async () => {
    if(!window.confirm("退勤しますか？")) return;
    if (!(await checkLocation())) return;

    const time = getCurrentTime();
    let overtimeReason = "";

    // シフトがあって、かつ遅延している場合
    if (todayShift && todayShift.end) {
      const nowMinutes = toMinutes(time);
      const endMinutes = toMinutes(todayShift.end);
      if (nowMinutes > endMinutes + 15) {
        const reason = prompt(`シフト終了(${todayShift.end})から遅れています。\n残業理由を入力してください。`);
        if (!reason) { alert("理由は必須です。"); return; }
        overtimeReason = reason;
      }
    }

    try {
      const attRef = doc(db, "attendance", docId);
      await updateDoc(attRef, {
        endTime: time,
        serverTimestampOut: serverTimestamp(),
        overtimeReason: overtimeReason
      });
      setEndTime(time);
      setStatus("finished");
    } catch (e) { alert("エラー"); }
  };

  if (status === "loading") return null;

  return (
    <div style={{ padding: '20px 10px', maxWidth: '1000px', margin: '0 auto', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#333', fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>⏱️ タイムカード</h2>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '30px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee', textAlign: 'center' }}>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '5px' }}>{getTodayString()}</div>
          {todayShift ? (
            <div style={{ color:'#007bff', fontWeight:'bold', fontSize:'18px' }}>
              シフト: {todayShift.start} 〜 {todayShift.end}
            </div>
          ) : (
            <div style={{ color:'#aaa', fontSize:'14px' }}>本日のシフト予定なし</div>
          )}
        </div>

        {loadingLocation && <div style={{color:'#007bff', marginBottom:'15px', fontWeight:'bold'}}>📍 現在地を確認中...</div>}

        {status === "before_work" && (
          <button 
            onClick={handleClockIn} 
            disabled={loadingLocation} 
            style={bigButtonStyle(loadingLocation ? '#ccc' : '#007bff')}
          >
            出勤する
          </button>
        )}

        {status === "working" && (
          <div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>
              {startTime} 〜
              <span style={{ fontSize: '14px', color: '#28a745', marginLeft: '10px', verticalAlign: 'middle' }}>勤務中</span>
            </div>
            <button onClick={handleClockOut} disabled={loadingLocation} style={bigButtonStyle(loadingLocation ? '#ccc' : '#ff4d4f')}>
              退勤する
            </button>
          </div>
        )}

        {status === "finished" && (
          <div style={{ backgroundColor:'#f9f9f9', padding:'20px', borderRadius:'8px' }}>
            <div style={{ fontSize: '16px', color: '#28a745', fontWeight: 'bold', marginBottom: '10px' }}>
              お疲れ様でした！
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#555' }}>
              {startTime} 〜 {endTime}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const bigButtonStyle = (color) => ({
  width: '100%', padding: '20px', backgroundColor: color, color: 'white', 
  fontSize: '20px', fontWeight: 'bold', border: 'none', borderRadius: '50px', 
  cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.2)', transition: 'transform 0.1s'
});

export default Timecard;