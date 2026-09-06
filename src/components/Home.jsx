import React from 'react';

const FEATURES = [
  { icon: '🌍', text: 'نظام جزائري وعالمي' },
  { icon: '🎯', text: 'مستويات متدرجة الصعوبة' },
  { icon: '🧠', text: 'حساب ذهني متقدم' },
  { icon: '⚡', text: 'تقييم تلقائي فوري' },
];

function Home({ onStart }) {
  return (
    <div className="glass-card home-card fade-in">
      <div className="home-logo-wrap">
        <img src="/logo.jpg" alt="شعار الأكاديمية" className="home-logo" />
        <span className="home-welcome-badge">🌟 مرحباً أيها البطل!</span>
      </div>

      <h2 className="home-title">
        مرحبا بك في منصة التدريب و المساباقات<br />
        تحالف سوربان موجة البحر الابيض المتوسط
      </h2>

      <p className="home-subtitle">
        🎮 منصة ممتعة لتدريب واختبار الحساب الذهني<br />
        سجّل بياناتك وابدأ مغامرتك نحو التميّز! 🏆
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <button className="btn btn-play home-start-btn" onClick={onStart}>
          🚀 ابدأ التدريب الآن
        </button>
      </div>

      <div className="home-features">
        <h3>✨ مميزات المنصة</h3>
        <div className="home-features-grid">
          {FEATURES.map((feature) => (
            <div key={feature.text} className="home-feature-card">
              <span className="home-feature-icon">{feature.icon}</span>
              <span className="home-feature-text">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
