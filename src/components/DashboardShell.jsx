import React from 'react';

const NAV = [
  { id: 'dashboard', icon: '🏠', label: 'الصفحة الرئيسية' },
  { id: 'levels', icon: '🎮', label: 'ساحة التدريب' },
  { id: 'courses', icon: '📚', label: 'الدورات التدريبية' },
  { id: 'competitions', icon: '🏆', label: 'المسابقات' },
];

function DashboardShell({
  currentUser,
  currentView,
  currentSystem,
  onViewChange,
  onSystemChange,
  onLogout,
  children,
}) {
  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="dash-logo">
          <img src="/logo.jpg" alt="سوروبان" />
          <div>
            <strong>أكاديمية سوروبان</strong>
            <span>الحساب الذهني</span>
          </div>
        </div>

        <nav className="dash-nav">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`dash-nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="dash-comp-cta"
          onClick={() => onViewChange('competitions')}
        >
          🏆 سجّل لمسابقة جديدة
        </button>

        <div className="dash-goal">
          <h4>هدفك القادم</h4>
          <p>أكمل تدريباً اليوم لتحصل على شارة البطل</p>
          <div className="dash-goal-bar">
            <span style={{ width: '66%' }} />
          </div>
          <small>2 / 3 تحديات</small>
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-topbar">
          <div className="dash-search">
            🔎 ابحث عن درس أو مسابقة...
          </div>
          <div className="dash-top-left">
            <div className="sliding-switch dash-switch">
              <div
                className="sliding-switch-indicator"
                style={{ transform: currentSystem === 'algerian' ? 'translateX(0)' : 'translateX(-100%)' }}
              />
              <button
                type="button"
                className={`sliding-switch-btn ${currentSystem === 'algerian' ? 'active' : ''}`}
                onClick={() => onSystemChange('algerian')}
              >
                جزائري
              </button>
              <button
                type="button"
                className={`sliding-switch-btn ${currentSystem === 'international' ? 'active' : ''}`}
                onClick={() => onSystemChange('international')}
              >
                عالمي
              </button>
            </div>
            <div className="dash-user-chip">
              <div className="dash-avatar">{currentUser.name.charAt(0)}</div>
              <div>
                <strong>مرحباً يا {currentUser.name.split(' ')[0]}</strong>
                <span>المستوى الذهبي · {currentUser.age} سنوات</span>
              </div>
            </div>
            <button type="button" className="dash-logout" onClick={onLogout}>خروج</button>
          </div>
        </header>
        <div className="dash-content">{children}</div>
      </div>
    </div>
  );
}

export default DashboardShell;
