import React, { useEffect, useState } from 'react';
import './Landing.css';
import { getCompetitions, getCompetitionStatus, formatCompetitionDate } from '../utils/competitions';

const FEATURES = [
  {
    icon: '📈',
    title: 'تتبع التقدم',
    text: 'تابع تطور مستواك واحصل على تقارير تفصيلية.',
    theme: 'feature-blue',
  },
  {
    icon: '🏆',
    title: 'مسابقات عالمية',
    text: 'شارك في مسابقات محلية ودولية واربح جوائز قيمة.',
    theme: 'feature-amber',
  },
  {
    icon: '🧮',
    title: 'تدريب احترافي',
    text: 'تدريبات متنوعة لرفع السرعة والدقة في الحساب.',
    theme: 'feature-green',
  },
  {
    icon: '🎓',
    title: 'دروس تفاعلية',
    text: 'دروس منظمة ومبسطة تناسب جميع المستويات.',
    theme: 'feature-purple',
  },
];

function Landing({ onLogin, onExploreCompetitions }) {
  const [competitions, setCompetitions] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    const list = getCompetitions()
      .map((c) => ({ ...c, status: getCompetitionStatus(c) }))
      .filter((c) => c.status !== 'closed')
      .sort((a, b) => new Date(a.openDate) - new Date(b.openDate))
      .slice(0, 3);
    setCompetitions(list);
  }, []);

  const scrollTo = (id) => {
    setActiveTab(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-root">
      {/* NAVBAR */}
      <header className="landing-navbar-wrapper">
        <div className="landing-navbar">
          {/* Logo / Brand */}
          <div className="landing-brand" onClick={() => scrollTo('home')} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <img
              src="/logo.jpg"
              alt="شعار الفريق"
              style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6' }}
            />
            <div className="landing-brand-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
              <span className="landing-brand-title" style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e3a8a' }}>فريق موجة البحر</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f59e0b' }}>سويهر نجمة</span>
            </div>
          </div>

          {/* Links */}
          <ul className="landing-nav-links">
            <li>
              <button
                type="button"
                className={`landing-nav-link ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => scrollTo('home')}
              >
                الرئيسية
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`landing-nav-link ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => scrollTo('about')}
              >
                عن سوروبان
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`landing-nav-link ${activeTab === 'features' ? 'active' : ''}`}
                onClick={() => scrollTo('features')}
              >
                المميزات
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`landing-nav-link ${activeTab === 'competitions' ? 'active' : ''}`}
                onClick={() => scrollTo('competitions')}
              >
                المسابقات
              </button>
            </li>
            <li>
              <button
                type="button"
                className="landing-nav-link"
                onClick={onExploreCompetitions}
              >
                الأسعار
              </button>
            </li>
            <li>
              <button
                type="button"
                className="landing-nav-link"
                onClick={() => setShowContact(true)}
              >
                تواصل معنا
              </button>
            </li>
          </ul>

          {/* Nav Actions */}
          <div className="landing-nav-actions">
            <button
              type="button"
              onClick={() => onLogin('coach')}
              style={{
                background: '#fef3c7',
                color: '#b45309',
                border: '1.5px solid #f59e0b',
                borderRadius: '12px',
                padding: '7px 14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.9rem',
                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.2)',
                transition: 'all 0.2s',
              }}
            >
              👨‍🏫 بوابة المعلمين
            </button>
            <button
              type="button"
              className="landing-btn-outline"
              onClick={() => onLogin('student', 'login')}
            >
              🔑 تسجيل الدخول
            </button>
            <button
              type="button"
              className="landing-btn-primary"
              onClick={() => onLogin('student', 'register')}
            >
              ✨ إنشاء حساب بطل
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="landing-hero" id="home">
        <div className="landing-hero-content">
          <h1 className="landing-hero-heading">
            تعلّم . تدرب . تنافس .<br />
            <span className="gradient-text">أبدع مع سوروبان!</span>
          </h1>
          <p className="landing-hero-desc">
            منصة متكاملة لتعلّم وتدريب السوروبان أونلاين والمشاركة في المسابقات العالمية.
          </p>
          <div className="landing-hero-cta">
            <button type="button" className="hero-cta-main" onClick={() => onLogin('student', 'register')}>
              ✨ إنشاء حساب وبدء التدريب
            </button>
            <button
              type="button"
              className="hero-cta-secondary"
              onClick={() => onLogin('student', 'login')}
            >
              🔑 تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => onLogin('coach')}
              style={{
                background: '#ffffff',
                color: '#1e3a8a',
                border: '2px solid #3b82f6',
                borderRadius: '14px',
                padding: '12px 20px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              }}
            >
              👨‍🏫 فضاء المعلّم والمدرب
            </button>
          </div>
        </div>

        <div className="landing-hero-visual">
          <div className="landing-hero-img-box">
            <img
              src="/images/landing_hero.jpg"
              alt="أطفال يتدربون على السوروبان"
            />
          </div>
          <div className="landing-float-chip chip-top">
            <span>✨</span>
            <span>حساب ذهني فائق</span>
          </div>
          <div className="landing-float-chip chip-bottom">
            <span>⭐</span>
            <span>أكثر من 50,000 بطل</span>
          </div>
        </div>
      </section>

      {/* 4 FEATURE PILLS */}
      <section className="landing-features-container" id="features">
        {FEATURES.map((feat) => (
          <div key={feat.title} className="landing-feature-pill">
            <div className={`feature-pill-icon ${feat.theme}`}>
              {feat.icon}
            </div>
            <h3 className="feature-pill-title">{feat.title}</h3>
            <p className="feature-pill-desc">{feat.text}</p>
          </div>
        ))}
      </section>

      {/* COMPETITIONS PROMO */}
      <section className="landing-competitions-wrapper" id="competitions">
        <div className="landing-comp-box">
          {/* Left Promo Card */}
          <div className="landing-comp-left-card">
            <div className="comp-trophy-huge">🏆</div>
            <h3 className="comp-ready-title">جاهز للتحدي؟</h3>
            <p className="comp-ready-sub">
              انضم إلى آلاف المتعلمين حول العالم وأثبت مهاراتك في السوروبان!
            </p>
            <button
              type="button"
              className="comp-explore-btn"
              onClick={onExploreCompetitions}
            >
              عرض كل المسابقات &gt;
            </button>
          </div>

          {/* Right Stream Cards */}
          <div className="landing-comp-right-content">
            <div className="landing-comp-header-row">
              <h2 className="landing-comp-stream-title">
                <span>المسابقات القادمة</span>
                <span>📅</span>
              </h2>
            </div>

            <div className="landing-comp-slider">
              <div className="comp-stream-item">
                <span className="comp-stream-badge">قريباً</span>
                <div className="comp-stream-icon">🏆</div>
                <h4 className="comp-stream-title">كأس الربيع الدولي للسوروبان</h4>
                <p className="comp-stream-date">📅 20 مايو 2026</p>
                <span className="comp-stream-mode">🌐 أونلاين</span>
              </div>

              <div className="comp-stream-item">
                <span className="comp-stream-badge">قريباً</span>
                <div className="comp-stream-icon">🥇</div>
                <h4 className="comp-stream-title">بطولة المهارات الذهنية للأطفال</h4>
                <p className="comp-stream-date">📅 10 جوان 2026</p>
                <span className="comp-stream-mode">🌐 أونلاين</span>
              </div>

              <div className="comp-stream-item">
                <span className="comp-stream-badge">قريباً</span>
                <div className="comp-stream-icon">✨</div>
                <h4 className="comp-stream-title">التحدي العربي للسوروبان</h4>
                <p className="comp-stream-date">📅 25 جوان 2026</p>
                <span className="comp-stream-mode">🌐 أونلاين</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SHORT */}
      <section style={{ maxWidth: '1320px', margin: '0 auto 40px auto', padding: '0 36px', textAlign: 'center' }} id="about">
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e1b4b', marginBottom: '12px' }}>عن منصة سوروبان</h2>
        <p style={{ color: '#64748b', maxWidth: '720px', margin: '0 auto', lineHeight: '1.8', fontSize: '1.05rem' }}>
          منصة تعليمية ذكية للأطفال تجمع بين الطريقة اليابانية الأصيلة في الحساب الذهني وبين المسابقات التفاعلية المحلية والدولية، لتمكين كل طفل من بلوغ أقصى إمكانيات التركيز والذكاء الرياضي.
        </p>
      </section>

      {/* COUNTERS BAR */}
      <div className="landing-counters-bar">
        <div className="counter-item">
          <span className="counter-icon">😊</span>
          <div className="counter-info">
            <strong className="counter-num">+50,000</strong>
            <span className="counter-label">متعلم حول العالم</span>
          </div>
        </div>

        <div className="counter-item">
          <span className="counter-icon">📖</span>
          <div className="counter-info">
            <strong className="counter-num">+1,200</strong>
            <span className="counter-label">درس تفاعلي</span>
          </div>
        </div>

        <div className="counter-item">
          <span className="counter-icon">🏆</span>
          <div className="counter-info">
            <strong className="counter-num">+300</strong>
            <span className="counter-label">مسابقة أقيمت</span>
          </div>
        </div>

        <div className="counter-item">
          <span className="counter-icon">⭐</span>
          <div className="counter-info">
            <strong className="counter-num">4.8 / 5</strong>
            <span className="counter-label">تقييم المتعلمين</span>
          </div>
        </div>
      </div>

      {/* CONTACT MODAL */}
      {showContact && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowContact(false)}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
              borderRadius: '24px',
              padding: '40px 36px',
              maxWidth: '440px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
              position: 'relative',
              border: '1px solid #e0f2fe',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowContact(false)}
              style={{
                position: 'absolute', top: '14px', left: '14px',
                background: '#f1f5f9', border: 'none', borderRadius: '50%',
                width: '32px', height: '32px', cursor: 'pointer',
                fontSize: '1.1rem', color: '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>

            {/* Header */}
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📞</div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.5rem', fontWeight: 900, color: '#1e3a8a' }}>
              تواصل معنا
            </h2>
            <p style={{ color: '#64748b', marginBottom: '28px', fontSize: '0.95rem' }}>
              نحن هنا لمساعدتك! تواصل معنا عبر أي من القنوات التالية
            </p>

            {/* WhatsApp */}
            <a
              href="https://wa.me/213664159368"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                background: 'linear-gradient(135deg, #25d366, #128c7e)',
                color: 'white', textDecoration: 'none',
                borderRadius: '14px', padding: '16px 20px',
                marginBottom: '14px', fontWeight: 700, fontSize: '1rem',
                boxShadow: '0 6px 20px rgba(37, 211, 102, 0.3)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '1.8rem' }}>💬</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '2px' }}>واتساب</div>
                <div style={{ direction: 'ltr' }}>+213 664 159 368</div>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:Coach.souihernedjma@gmail.com"
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                color: 'white', textDecoration: 'none',
                borderRadius: '14px', padding: '16px 20px',
                marginBottom: '24px', fontWeight: 700, fontSize: '0.95rem',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '1.8rem' }}>✉️</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '2px' }}>البريد الإلكتروني</div>
                <div style={{ direction: 'ltr', fontSize: '0.9rem' }}>Coach.souihernedjma@gmail.com</div>
              </div>
            </a>

            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
              سنرد عليك في أقرب وقت ممكن 🌟
            </p>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="landing-footer" id="contact">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '12px' }}>
          <a
            href="https://wa.me/213664159368"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#25d366', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            💬 +213 664 159 368
          </a>
          <a
            href="mailto:Coach.souihernedjma@gmail.com"
            style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ✉️ Coach.souihernedjma@gmail.com
          </a>
        </div>
        <p>جميع الحقوق محفوظة © 2026 coach souiher nedjma</p>
      </footer>
    </div>
  );
}

export default Landing;
