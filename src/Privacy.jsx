function Privacy({ onBack }) {
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: '"Helvetica Neue", Arial, sans-serif', backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', position: 'relative' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#333', padding: '0', display: 'flex', alignItems: 'center' }}>
          ←
        </button>
        <h2 style={{ flex: 1, textAlign: 'center', color: '#333', fontSize: '20px', margin: '0', fontWeight: 'bold' }}>プライバシーポリシー</h2>
        <div style={{ width: '24px' }}></div>
      </div>

      <div style={{ lineHeight: '1.8', color: '#555', fontSize: '14px' }}>
        <p style={{ marginBottom: '20px', color: '#777', fontSize: '13px' }}>
          本プライバシーポリシーは、本シフト管理・給与計算・勤怠打刻アプリ（以下「本アプリ」）における
          個人情報の取り扱いについて定めるものです。
        </p>

        <Section title="1. 収集する個人情報">
          <p>本アプリでは、以下の個人情報を収集します。</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li><strong>アカウント情報：</strong>氏名、ログインID、パスワード</li>
            <li><strong>勤務情報：</strong>シフト希望、確定シフト、勤怠打刻記録</li>
            <li><strong>給与情報：</strong>時給、労働時間、給与計算結果</li>
            <li><strong>位置情報：</strong>勤怠打刻時のGPS位置データ</li>
            <li><strong>その他：</strong>予約情報、早出・残業理由などの入力データ</li>
          </ul>
        </Section>

        <Section title="2. 個人情報の利用目的">
          <p>収集した個人情報は、以下の目的で利用します。</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li>シフト管理および勤怠管理</li>
            <li>給与計算および労務管理</li>
            <li>本アプリの機能提供および改善</li>
            <li>不正利用の防止およびセキュリティ確保</li>
            <li>利用者からの問い合わせ対応</li>
          </ul>
          <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#d9534f' }}>
            上記以外の目的で個人情報を利用することはありません。
          </p>
        </Section>

        <Section title="3. 位置情報の取得について">
          <p>本アプリは、勤怠打刻時に不正防止のためGPS位置情報を取得します。</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li>位置情報は、店舗から半径300m以内であるかを確認する目的でのみ使用されます</li>
            <li>取得した位置情報は、打刻記録とともに保存されます</li>
            <li>位置情報の取得を許可しない場合、打刻機能を利用できません</li>
          </ul>
        </Section>

        <Section title="4. 個人情報の第三者提供">
          <p>当社は、以下の場合を除き、利用者の個人情報を第三者に提供することはありません。</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li>利用者本人の同意がある場合</li>
            <li>法令に基づく場合</li>
            <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難である場合</li>
            <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難である場合</li>
          </ul>
        </Section>

        <Section title="5. 個人情報の管理">
          <p>当社は、個人情報の漏洩、滅失、毀損を防止するため、以下の対策を講じます。</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li>Firebase（Google Cloud）の安全なデータベースを使用</li>
            <li>適切なアクセス制限（店長とスタッフの権限分離）</li>
            <li>パスワードの暗号化保存</li>
            <li>定期的なセキュリティ対策の見直し</li>
          </ul>
        </Section>

        <Section title="6. 個人情報の保存期間">
          <p>個人情報は、利用目的を達成するために必要な期間保存します。退職等により本アプリの利用が終了した場合でも、
          法令で定められた期間（労働基準法に基づく5年間等）は記録を保持することがあります。</p>
        </Section>

        <Section title="7. 個人情報の開示・訂正・削除">
          <p>利用者は、自身の個人情報について、以下の権利を有します。</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li>開示を請求する権利</li>
            <li>訂正、追加または削除を請求する権利</li>
            <li>利用の停止または消去を請求する権利</li>
          </ul>
          <p style={{ marginTop: '10px' }}>
            これらの請求は、店舗管理者を通じて行ってください。
          </p>
        </Section>

        <Section title="8. Cookie（クッキー）について">
          <p>本アプリでは、利用者の利便性向上のため、ブラウザのローカルストレージを使用してログイン情報を保存します。
          これにより、再訪問時に自動ログインが可能になります。ローカルストレージを削除すると、再度ログインが必要になります。</p>
        </Section>

        <Section title="9. SSL（暗号化通信）について">
          <p>本アプリは、個人情報の送受信時にSSL（Secure Socket Layer）による暗号化通信を使用しています。
          これにより、第三者による情報の盗聴や改ざんを防止しています。</p>
        </Section>

        <Section title="10. 未成年者の個人情報について">
          <p>未成年者が本アプリを利用する場合、保護者の同意を得た上で利用してください。
          未成年者の個人情報についても、本ポリシーに従って適切に管理します。</p>
        </Section>

        <Section title="11. プライバシーポリシーの変更">
          <p>当社は、法令の変更や本アプリの機能追加等に伴い、本プライバシーポリシーを変更することがあります。
          変更後のポリシーは、本アプリ上に掲示した時点で効力を生じます。</p>
        </Section>

        <Section title="12. お問い合わせ">
          <p>個人情報の取り扱いに関するお問い合わせは、店舗管理者までご連絡ください。</p>
        </Section>

        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#e6f7ff', borderRadius: '8px', border: '1px solid #91d5ff' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0050b3', marginBottom: '10px' }}>
            個人情報保護の取り組み
          </h3>
          <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.8' }}>
            当社は、個人情報保護法およびその他の関連法令を遵守し、利用者の個人情報を適切に管理します。
            利用者の皆様が安心して本アプリをご利用いただけるよう、今後も継続的にセキュリティ対策を強化してまいります。
          </p>
        </div>

        <p style={{ marginTop: '40px', textAlign: 'right', fontSize: '13px', color: '#999' }}>
          制定日：2024年12月1日<br />
          最終更新：2025年12月16日
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '25px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '10px', borderLeft: '4px solid #1890ff', paddingLeft: '10px' }}>
        {title}
      </h3>
      <div style={{ paddingLeft: '15px', fontSize: '14px' }}>
        {children}
      </div>
    </div>
  );
}

export default Privacy;
