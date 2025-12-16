import { useState } from 'react';

function Help({ onBack }) {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: '"Helvetica Neue", Arial, sans-serif', backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', position: 'relative' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#333', padding: '0', display: 'flex', alignItems: 'center' }}>
          ←
        </button>
        <h2 style={{ flex: 1, textAlign: 'center', color: '#333', fontSize: '20px', margin: '0', fontWeight: 'bold' }}>ヘルプ・使い方ガイド</h2>
        <div style={{ width: '24px' }}></div>
      </div>

      <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#fff7e6', borderRadius: '8px', border: '1px solid #ffd591' }}>
        <p style={{ fontSize: '14px', color: '#d46b08', margin: 0 }}>
          困ったことがあれば、以下のガイドをご確認ください。解決しない場合は店舗管理者にお問い合わせください。
        </p>
      </div>

      <FAQ
        question="ログイン方法は？"
        isOpen={openSection === 'login'}
        onClick={() => toggleSection('login')}
      >
        <p>1. アプリを開くとログイン画面が表示されます</p>
        <p>2. ログインIDとパスワード（生年月日）を入力してください</p>
        <p>3. 初回ログイン時のパスワードは、店舗管理者から通知されます</p>
        <p style={{ marginTop: '10px', color: '#d9534f' }}>
          ※ パスワードを忘れた場合は、店舗管理者に問い合わせてください
        </p>
      </FAQ>

      <FAQ
        question="シフト希望を提出する方法は？"
        isOpen={openSection === 'shift-input'}
        onClick={() => toggleSection('shift-input')}
      >
        <p>1. 画面下部の「申請」ボタンをタップ</p>
        <p>2. 対象月を選択し、希望する日付と時間を入力</p>
        <p>3. 30分刻みでシフト時間を選択できます</p>
        <p>4. 入力完了後、「提出」ボタンを押してください</p>
        <p style={{ marginTop: '10px', color: '#ffa500', fontWeight: 'bold' }}>
          ※ 提出後も、店長が承認するまでは修正可能です
        </p>
      </FAQ>

      <FAQ
        question="勤怠打刻の方法は？"
        isOpen={openSection === 'timecard'}
        onClick={() => toggleSection('timecard')}
      >
        <p><strong>【出勤打刻】</strong></p>
        <p>1. 画面下部の「打刻」ボタンをタップ</p>
        <p>2. 店舗の半径300m以内にいることを確認してください</p>
        <p>3. シフト開始15分前になったら「出勤」ボタンが表示されます</p>
        <p>4. ボタンをタップして出勤打刻完了</p>

        <p style={{ marginTop: '15px' }}><strong>【退勤打刻】</strong></p>
        <p>1. 勤務終了時に「退勤」ボタンをタップ</p>
        <p>2. 自動的に勤務時間が記録されます</p>

        <p style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px', fontSize: '13px' }}>
          <strong>特別なケース：</strong><br />
          • シフトより15分以上早く出勤する場合 → 理由入力が必要<br />
          • シフトがない日に出勤する場合 → 理由入力が必要<br />
          • 残業が発生する場合 → 理由入力が必要
        </p>

        <p style={{ marginTop: '10px', color: '#d9534f', fontWeight: 'bold' }}>
          ⚠️ 位置情報がOFFの場合、打刻できません。スマートフォンの設定で位置情報を許可してください。
        </p>
      </FAQ>

      <FAQ
        question="確定したシフトを確認する方法は？"
        isOpen={openSection === 'calendar'}
        onClick={() => toggleSection('calendar')}
      >
        <p>1. 画面下部の「ホーム」ボタンをタップ</p>
        <p>2. カレンダー形式で確定シフトが表示されます</p>
        <p>3. 各日付に勤務時間が表示されます</p>
        <p>4. 今月の見込み給与も確認できます</p>
      </FAQ>

      <FAQ
        question="予約を登録・確認する方法は？"
        isOpen={openSection === 'reservation'}
        onClick={() => toggleSection('reservation')}
      >
        <p>1. 画面下部の「予約」ボタンをタップ</p>
        <p>2. 予約日時、お客様名、人数を入力</p>
        <p>3. 「登録」ボタンで予約完了</p>
        <p>4. 登録済み予約は一覧で確認できます</p>
      </FAQ>

      <FAQ
        question="自分の時給を確認する方法は？"
        isOpen={openSection === 'wage'}
        onClick={() => toggleSection('wage')}
      >
        <p>1. 画面下部の「設定」ボタンをタップ</p>
        <p>2. プロフィール画面で現在の時給が確認できます</p>
        <p style={{ marginTop: '10px', color: '#888' }}>
          ※ 時給の変更は店舗管理者のみ可能です
        </p>
      </FAQ>

      <FAQ
        question="【店長向け】シフトを承認・修正する方法は？"
        isOpen={openSection === 'manager'}
        onClick={() => toggleSection('manager')}
      >
        <p>1. 画面下部の「承認」ボタンをタップ</p>
        <p>2. スタッフから提出されたシフト希望が一覧表示されます</p>
        <p>3. 各スタッフのシフトを確認・修正してください</p>
        <p>4. 「確定」ボタンを押すとシフトが承認されます</p>
        <p style={{ marginTop: '10px' }}>
          <strong>予実対比機能：</strong><br />
          過去の日付を選択すると、シフト時間と実際の打刻時間を比較し、遅刻や残業をアラート表示します。
        </p>
      </FAQ>

      <FAQ
        question="【店長向け】スタッフの時給を設定する方法は？"
        isOpen={openSection === 'userlist'}
        onClick={() => toggleSection('userlist')}
      >
        <p>1. 左上のメニューボタンをタップ</p>
        <p>2. 「スタッフ管理（時給）」を選択</p>
        <p>3. 各スタッフの時給を入力・変更できます</p>
        <p>4. 変更は即座に反映されます</p>
      </FAQ>

      <FAQ
        question="【店長向け】給与計算・実績を確認する方法は？"
        isOpen={openSection === 'salary'}
        onClick={() => toggleSection('salary')}
      >
        <p>1. 左上のメニューボタンをタップ</p>
        <p>2. 「給与計算・実績」を選択</p>
        <p>3. 対象月を選択すると、全スタッフの給与が自動計算されます</p>
        <p>4. 各スタッフの詳細をタップすると、打刻履歴が確認できます</p>
        <p style={{ marginTop: '10px', color: '#ffa500' }}>
          ※ 給与計算は打刻データに基づいて自動計算されます
        </p>
      </FAQ>

      <FAQ
        question="位置情報が取得できない場合は？"
        isOpen={openSection === 'gps'}
        onClick={() => toggleSection('gps')}
      >
        <p>以下をご確認ください：</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>スマートフォンの位置情報サービスがONになっているか</li>
          <li>ブラウザの位置情報許可設定がONになっているか</li>
          <li>店舗から半径300m以内にいるか</li>
          <li>建物内の場合、GPS信号が弱い可能性があります（窓際で試してください）</li>
        </ul>
        <p style={{ marginTop: '10px', color: '#d9534f' }}>
          ※ それでも解決しない場合は、店舗管理者に相談してください
        </p>
      </FAQ>

      <FAQ
        question="アプリの動作が遅い・エラーが出る場合は？"
        isOpen={openSection === 'error'}
        onClick={() => toggleSection('error')}
      >
        <p>以下の対処をお試しください：</p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>ブラウザを再読み込み（更新）してください</li>
          <li>一度ログアウトして、再度ログインしてみてください</li>
          <li>ブラウザのキャッシュをクリアしてください</li>
          <li>インターネット接続を確認してください</li>
        </ul>
        <p style={{ marginTop: '10px', color: '#888' }}>
          ※ 上記で解決しない場合は、店舗管理者に報告してください
        </p>
      </FAQ>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
          その他ご不明な点がございましたら、
        </p>
        <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
          店舗管理者までお問い合わせください
        </p>
      </div>
    </div>
  );
}

function FAQ({ question, children, isOpen, onClick }) {
  return (
    <div style={{ marginBottom: '12px', border: '1px solid #e8e8e8', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
      <button
        onClick={onClick}
        style={{
          width: '100%',
          padding: '15px 20px',
          backgroundColor: isOpen ? '#ffa500' : '#fff',
          color: isOpen ? '#fff' : '#333',
          border: 'none',
          textAlign: 'left',
          fontSize: '15px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.3s ease'
        }}
      >
        <span>{question}</span>
        <span style={{ fontSize: '18px', transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div style={{ padding: '20px', backgroundColor: '#fafafa', fontSize: '14px', lineHeight: '1.8', color: '#555', borderTop: '1px solid #e8e8e8' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default Help;
