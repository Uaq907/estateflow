export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎉 مرحباً بك في EstateFlow!</h1>
      <p>تم إنشاء العقود بنجاح:</p>
      <ul>
        <li>✅ 20 عقد إيجار سكني</li>
        <li>✅ 20 عقد إيجار تجاري</li>
        <li>✅ إجمالي: 40 عقد</li>
      </ul>
      
      <h2>🔗 روابط مفيدة:</h2>
      <ul>
        <li><a href="/dashboard">لوحة التحكم</a></li>
        <li><a href="/dashboard/legal/eviction">طلبات الإخلاء</a></li>
        <li><a href="/api/leases-mock">API العقود (تجريبي)</a></li>
      </ul>
      
      <h2>📊 ملخص العقود:</h2>
      <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '5px' }}>
        <h3>🏠 العقود السكنية:</h3>
        <p>• الإيجار الشهري: 3,000 - 10,000 ريال</p>
        <p>• مدة العقد: سنة واحدة</p>
        <p>• شيك الضمان: شهرين إيجار</p>
        
        <h3>🏢 العقود التجارية:</h3>
        <p>• الإيجار الشهري: 8,000 - 20,000 ريال</p>
        <p>• مدة العقد: سنتين</p>
        <p>• شيك الضمان: 3 أشهر إيجار</p>
      </div>
      
      <p style={{ marginTop: '20px', color: '#666' }}>
        الخادم يعمل على: <strong>http://localhost:5000</strong>
      </p>
    </div>
  );
}
