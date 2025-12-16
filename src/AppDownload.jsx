import { useState, useEffect } from 'react';

function AppDownload({ onBack }) {
  const [appUrl, setAppUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 現在のURLを取得（デプロイ後は実際のURLになります）
    const url = window.location.origin;
    setAppUrl(url);

    // QRコードを生成（Google Charts APIを使用）
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    setQrCodeUrl(qrUrl);

    // PWAインストール可能かチェック
    const handleInstallAvailable = () => {
      setCanInstall(true);
    };
    window.addEventListener('pwa-install-available', handleInstallAvailable);

    // すでにインストール済みかチェック
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            window.navigator.standalone ||
                            document.referrer.includes('android-app://');
    setIsStandalone(checkStandalone);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
    };
  }, []);

  const handleInstall = async () => {
    if (window.installPWA) {
      const accepted = await window.installPWA();
      if (accepted) {
        alert('アプリのインストールが完了しました！');
        setCanInstall(false);
        setIsStandalone(true);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appUrl).then(() => {
      alert('URLをコピーしました！');
    }).catch(() => {
      alert('コピーに失敗しました');
    });
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'shift-app-qr.png';
    link.click();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: '"Helvetica Neue", Arial, sans-serif', backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', position: 'relative' }}>
        {onBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#333', padding: '0', display: 'flex', alignItems: 'center' }}>
            ←
          </button>
        )}
        <h2 style={{ flex: 1, textAlign: 'center', color: '#333', fontSize: '20px', margin: '0', fontWeight: 'bold' }}>アプリをダウンロード</h2>
        <div style={{ width: '24px' }}></div>
      </div>

      {/* インストール済み表示 */}
      {isStandalone && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f6ffed', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
          <p style={{ fontSize: '14px', color: '#52c41a', margin: 0, fontWeight: 'bold' }}>
            ✅ アプリはすでにインストール済みです
          </p>
        </div>
      )}

      {/* PWAインストールボタン */}
      {!isStandalone && canInstall && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={handleInstall}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 165, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <span style={{ fontSize: '24px' }}>📱</span>
            アプリをインストール
          </button>
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            ワンタップでホーム画面にインストールできます
          </p>
        </div>
      )}

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e6f7ff', borderRadius: '8px', border: '1px solid #91d5ff' }}>
        <p style={{ fontSize: '14px', color: '#0050b3', margin: 0 }}>
          スタッフにこのアプリを共有して、シフト管理や勤怠打刻を始めましょう。
        </p>
      </div>

      {/* QRコード表示 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '30px', border: '1px solid #eee', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>
          📱 QRコードでアクセス
        </h3>
        {qrCodeUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <img
              src={qrCodeUrl}
              alt="QRコード"
              style={{ width: '250px', height: '250px', border: '2px solid #ffa500', borderRadius: '10px', padding: '10px', backgroundColor: '#fff' }}
            />
            <button
              onClick={downloadQR}
              style={{ padding: '12px 30px', backgroundColor: '#52c41a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)' }}
            >
              QRコードを保存
            </button>
          </div>
        )}
        <p style={{ fontSize: '13px', color: '#888', marginTop: '15px' }}>
          スマートフォンのカメラでこのQRコードをスキャンしてください
        </p>
      </div>

      {/* URL表示 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #eee', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '15px' }}>
          🔗 アプリのURL
        </h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '10px' }}>
          <input
            type="text"
            value={appUrl}
            readOnly
            style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', backgroundColor: '#fff' }}
          />
          <button
            onClick={copyToClipboard}
            style={{ padding: '8px 20px', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            コピー
          </button>
        </div>
        <p style={{ fontSize: '13px', color: '#888' }}>
          このURLをLINEやメールで共有できます
        </p>
      </div>

      {/* インストール手順 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #eee', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '15px', borderLeft: '4px solid #ffa500', paddingLeft: '10px' }}>
          📲 ホーム画面に追加する方法
        </h3>

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#555', marginBottom: '10px' }}>
            【iPhone / Safari の場合】
          </h4>
          <ol style={{ paddingLeft: '20px', fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
            <li>Safariでアプリを開く</li>
            <li>画面下部の「共有ボタン」（□に↑）をタップ</li>
            <li>「ホーム画面に追加」を選択</li>
            <li>「追加」をタップして完了</li>
          </ol>
        </div>

        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#555', marginBottom: '10px' }}>
            【Android / Chrome の場合】
          </h4>
          <ol style={{ paddingLeft: '20px', fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
            <li>Chromeでアプリを開く</li>
            <li>画面右上のメニュー（⋮）をタップ</li>
            <li>「ホーム画面に追加」を選択</li>
            <li>「追加」をタップして完了</li>
          </ol>
        </div>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff7e6', borderRadius: '8px', border: '1px solid #ffd591' }}>
          <p style={{ fontSize: '13px', color: '#d46b08', margin: 0 }}>
            💡 ホーム画面に追加すると、アプリのようにワンタップで起動できます
          </p>
        </div>
      </div>
    </div>
  );
}

export default AppDownload;
