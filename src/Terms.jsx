function Terms({ onBack }) {
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: '"Helvetica Neue", Arial, sans-serif', backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', position: 'relative' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#333', padding: '0', display: 'flex', alignItems: 'center' }}>
          ←
        </button>
        <h2 style={{ flex: 1, textAlign: 'center', color: '#333', fontSize: '20px', margin: '0', fontWeight: 'bold' }}>利用規約</h2>
        <div style={{ width: '24px' }}></div>
      </div>

      <div style={{ lineHeight: '1.8', color: '#555', fontSize: '14px' }}>
        <p style={{ marginBottom: '20px', color: '#777', fontSize: '13px' }}>
          本規約は、本シフト管理・給与計算・勤怠打刻アプリ（以下「本アプリ」）の利用条件を定めるものです。
          本アプリをご利用いただくことで、本規約に同意したものとみなされます。
        </p>

        <Section title="第1条（定義）">
          <p>本規約において、以下の用語は以下の意味を有するものとします。</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li>「当社」：本アプリを提供・運営する事業者</li>
            <li>「店舗」：本アプリを導入する飲食店等の事業者</li>
            <li>「利用者」：本アプリを利用する店舗の管理者およびスタッフ</li>
            <li>「個人情報」：氏名、勤務情報、給与情報等、個人を特定できる情報</li>
          </ul>
        </Section>

        <Section title="第2条（利用目的）">
          <p>本アプリは、飲食店等におけるシフト管理、勤怠打刻、給与計算を円滑に行うことを目的として提供されます。利用者は、本来の目的以外での利用を禁止されます。</p>
        </Section>

        <Section title="第3条（アカウント管理）">
          <p>1. 利用者は、ログインIDおよびパスワードを適切に管理する責任を負います。</p>
          <p>2. アカウント情報の漏洩、不正利用により生じた損害について、当社は一切の責任を負いません。</p>
          <p>3. 第三者による不正利用を発見した場合、速やかに店舗管理者に報告してください。</p>
        </Section>

        <Section title="第4条（勤怠打刻の正確性）">
          <p>1. 利用者は、勤怠打刻を正確に行う義務を負います。</p>
          <p>2. GPS位置情報による打刻制限が設けられている場合、店舗から半径300m以内での打刻が必要です。</p>
          <p>3. シフト時間外の打刻や早出・残業が発生した場合は、所定の理由入力を行ってください。</p>
          <p>4. 不正な打刻（代理打刻、虚偽の理由入力等）は禁止されており、発覚した場合は懲戒処分の対象となることがあります。</p>
        </Section>

        <Section title="第5条（個人情報の取り扱い）">
          <p>1. 当社および店舗は、利用者の個人情報を適切に管理し、本アプリの運営目的以外には使用しません。</p>
          <p>2. 詳細は別途定める「プライバシーポリシー」をご確認ください。</p>
        </Section>

        <Section title="第6条（禁止事項）">
          <p>利用者は、以下の行為を禁止されます。</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li>本アプリの不正利用、システムへの不正アクセス</li>
            <li>他の利用者のアカウントを無断使用すること</li>
            <li>虚偽の情報を入力すること</li>
            <li>本アプリの運営を妨害する行為</li>
            <li>法令または公序良俗に反する行為</li>
          </ul>
        </Section>

        <Section title="第7条（サービスの変更・中断・終了）">
          <p>1. 当社は、利用者への事前通知なく、本アプリの内容を変更、追加、削除することができます。</p>
          <p>2. システムメンテナンス、障害、その他やむを得ない事由により、本アプリの提供を一時的に中断することがあります。</p>
          <p>3. これらにより生じた損害について、当社は一切の責任を負いません。</p>
        </Section>

        <Section title="第8条（免責事項）">
          <p>1. 本アプリの利用により生じた損害について、当社は一切の責任を負いません。</p>
          <p>2. 給与計算結果はあくまで参考値であり、実際の給与支払額を保証するものではありません。</p>
          <p>3. 店舗と利用者との間で発生した労務トラブルについて、当社は一切の責任を負いません。</p>
        </Section>

        <Section title="第9条（規約の変更）">
          <p>当社は、利用者への事前通知なく本規約を変更できるものとします。変更後の規約は、本アプリ上に掲示した時点で効力を生じます。</p>
        </Section>

        <Section title="第10条（準拠法・管轄裁判所）">
          <p>1. 本規約の準拠法は日本法とします。</p>
          <p>2. 本アプリに関する紛争については、当社の本店所在地を管轄する裁判所を専属的合意管轄裁判所とします。</p>
        </Section>

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
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '10px', borderLeft: '4px solid #ffa500', paddingLeft: '10px' }}>
        {title}
      </h3>
      <div style={{ paddingLeft: '15px', fontSize: '14px' }}>
        {children}
      </div>
    </div>
  );
}

export default Terms;
