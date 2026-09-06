import React, { useMemo, useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './EnhancedDashboard.css';
import { getFilteredLevels } from '../data/levels';
import { initialCourses } from '../data/programsAndCompetitions';
import { getCompetitions } from '../utils/competitions';
import { fetchStudents, fetchResults } from '../services/dbSync';

function getCountryFlag(country) {
  if (!country) return '🇩🇿';
  const c = country.trim().toLowerCase();
  if (c.includes('جزائر') || c.includes('algeria') || c.includes('dz')) return '🇩🇿';
  if (c.includes('مغرب') || c.includes('morocco')) return '🇲🇦';
  if (c.includes('تونس') || c.includes('tunisia')) return '🇹🇳';
  if (c.includes('مصر') || c.includes('egypt')) return '🇪🇬';
  if (c.includes('سعود') || c.includes('saudi')) return '🇸🇦';
  if (c.includes('إمارات') || c.includes('uae')) return '🇦🇪';
  if (c.includes('فلسطين') || c.includes('palestine')) return '🇵🇸';
  if (c.includes('سوريا') || c.includes('syria')) return '🇸🇾';
  if (c.includes('أردن') || c.includes('jordan')) return '🇯🇴';
  return '🌍';
}

function EnhancedDashboard({
  currentUser,
  currentSystem,
  onSystemChange,
  onStartTraining,
  onOpenLevels,
  onOpenCompetitions,
  onOpenCourses,
  onNavigate,
  onLogout,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNavItem, setActiveNavItem] = useState('home');
  const [liveCompetitions, setLiveCompetitions] = useState([]);
  const [userStats, setUserStats] = useState({ totalPoints: 0, sessionsCount: 0, streak: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const bellRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showNotifications]);

  useEffect(() => {
    async function loadDashboardData() {
      // 1. Load real competitions from DB/storage
      const comps = getCompetitions();
      setLiveCompetitions(comps.slice(0, 3));

      // 2. Load real students and real results
      const [allStudents, allResults] = await Promise.all([
        fetchStudents(),
        fetchResults(),
      ]);

      const studentsList = Array.isArray(allStudents) && allStudents.length > 0
        ? allStudents
        : JSON.parse(localStorage.getItem('soroban_users') || '[]');

      const resultsList = Array.isArray(allResults) && allResults.length > 0
        ? allResults
        : JSON.parse(localStorage.getItem('soroban_results') || '[]');

      // 3. Compute current user's real training stats
      const myResults = resultsList.filter(
        (r) =>
          String(r.userId || r.user_id) === String(currentUser?.id) ||
          (r.userName || r.user_name || r.studentName) === currentUser?.name
      );
      const totalPoints = myResults.reduce((sum, r) => sum + (r.score || 0) * 10, 0);
      const sessionsCount = myResults.length;
      const days = new Set(myResults.map((r) => new Date(r.date || r.created_at || 0).toDateString()));
      setUserStats({ totalPoints, sessionsCount, streak: days.size });

      // 4. Build leaderboard STRICTLY from real registered students
      const studentMap = {};
      studentsList.forEach((s) => {
        studentMap[String(s.id)] = {
          id: String(s.id),
          name: s.name,
          pts: 0,
          country: s.country || '',
          flag: getCountryFlag(s.country),
        };
      });

      // Ensure currentUser is included if registered
      if (currentUser && !studentMap[String(currentUser.id)]) {
        studentMap[String(currentUser.id)] = {
          id: String(currentUser.id),
          name: currentUser.name,
          pts: totalPoints,
          country: currentUser.country || '',
          flag: getCountryFlag(currentUser.country),
        };
      }

      // Add actual points from real completed results
      resultsList.forEach((r) => {
        const uid = String(r.userId || r.user_id || '');
        const uname = (r.userName || r.user_name || r.studentName || '').trim();
        if (uid && studentMap[uid]) {
          studentMap[uid].pts += (r.score || 0) * 10;
        } else if (uname) {
          const found = Object.values(studentMap).find((s) => s.name === uname);
          if (found) {
            found.pts += (r.score || 0) * 10;
          }
        }
      });

      // Sort students by points descending
      const realLeaderboard = Object.values(studentMap)
        .sort((a, b) => b.pts - a.pts)
        .slice(0, 10);
      setLeaderboard(realLeaderboard);

      // 5. Build dynamic real notifications
      const realNotes = [];
      if (comps.length > 0) {
        realNotes.push({
          id: 'comp-' + comps[0].id,
          icon: '🏆',
          text: `مسابقة جديدة: "${comps[0].title}" متاحة الآن للمشاركة`,
          time: 'جديد',
        });
      }
      if (myResults.length > 0) {
        const last = myResults[myResults.length - 1];
        realNotes.push({
          id: 'res-' + last.id,
          icon: '⭐',
          text: `أكملت بنجاح تدريب ${last.levelName || 'المستوى'} وحصلت على ${last.score} نقطة`,
          time: 'سجل حديث',
        });
      }
      realNotes.push({
        id: 'welcome',
        icon: '🎉',
        text: `أهلاً بك يا ${currentUser?.name?.split(' ')[0] || 'البطل'}! ابدأ أولى جلساتك لجمع النقاط.`,
        time: 'اليوم',
      });

      setNotifications(realNotes);
      setUnreadCount(realNotes.length > 0 ? 1 : 0);
    }

    loadDashboardData();
  }, [currentUser?.id, currentUser?.name]);

  const filteredLevels = useMemo(
    () => getFilteredLevels(currentSystem, currentUser?.age || 9),
    [currentSystem, currentUser?.age]
  );

  const navItems = [
    { id: 'home', label: 'الصفحة الرئيسية', icon: '🏠', action: () => onNavigate('dashboard') },
    { id: 'courses', label: 'الدورات التدريبية', icon: '📖', action: () => onNavigate('courses') },
    { id: 'competitions', label: 'المسابقات', icon: '🏆', action: () => onNavigate('competitions') },
    { id: 'daily', label: 'التحديات اليومية', icon: '🔥', action: () => onNavigate('levels') },
    { id: 'academy', label: 'أكاديمي', icon: '🎓', action: () => onNavigate('courses') },
    { id: 'progress', label: 'تقدمي', icon: '📈', action: () => onNavigate('levels') },
    { id: 'interactive', label: 'المجلس التفاعلي', icon: '💬', action: () => onNavigate('dashboard') },
    { id: 'certificates', label: 'الشهادات', icon: '📜', action: () => onNavigate('dashboard') },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️', action: () => onNavigate('dashboard') },
  ];

  const handleStartQuick = () => {
    if (filteredLevels.length > 0) {
      const firstLevel = filteredLevels[0];
      onStartTraining({ ...firstLevel, category: firstLevel.matchedCategory });
    } else {
      onOpenLevels();
    }
  };

  const handleCourseClick = (idx) => {
    if (filteredLevels[idx]) {
      const level = filteredLevels[idx];
      onStartTraining({ ...level, category: level.matchedCategory });
    } else if (filteredLevels.length > 0) {
      const level = filteredLevels[0];
      onStartTraining({ ...level, category: level.matchedCategory });
    } else {
      onOpenLevels();
    }
  };

  return (
    <div className="portal-wrapper">
      {/* TOPBAR */}
      <header className="portal-topbar">
        {/* Left: User profile & controls */}
        <div className="topbar-left">
          <div className="user-greeting-chip">
            <div className="user-avatar-circle">
              {currentUser?.name ? currentUser.name.charAt(0) : '👦'}
            </div>
            <div className="user-greeting-meta">
              <span className="user-greeting-title">مرحبا يا {currentUser?.name?.split(' ')[0] || 'البطل'} 👋</span>
              <span className="user-greeting-level">🌟 المستوى الذهبي</span>
            </div>
          </div>

          <div
            ref={bellRef}
            className="topbar-notification"
            title="الإشعارات والتنبيهات"
            onClick={() => {
              if (!showNotifications) {
                // Calculate bell position - responsive
                const rect = bellRef.current?.getBoundingClientRect();
                if (rect) {
                  const isMobile = window.innerWidth < 640;
                  const dropWidth = isMobile ? Math.min(320, window.innerWidth - 16) : 320;
                  const leftPos = isMobile
                    ? Math.max(8, (window.innerWidth - dropWidth) / 2)
                    : Math.max(8, rect.left - 290);
                  setDropdownPos({
                    top: rect.bottom + 8,
                    left: leftPos,
                  });
                }
              }
              setShowNotifications(!showNotifications);
              setUnreadCount(0);
            }}
            style={{ position: 'relative' }}
          >
            🔔
            {unreadCount > 0 && (
              <span className="notification-count">{unreadCount}</span>
            )}
          </div>

          {showNotifications && ReactDOM.createPortal(
            <>
              {/* Transparent backdrop to close on outside click */}
              <div
                onClick={() => setShowNotifications(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 999998,
                  background: 'transparent',
                }}
              />
              {/* Notification dropdown rendered at body level */}
              <div
                ref={notificationRef}
                className="notification-dropdown"
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'fixed',
                  top: `${dropdownPos.top}px`,
                  left: `${dropdownPos.left}px`,
                  width: '320px',
                  maxWidth: 'calc(100vw - 24px)',
                  background: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.10)',
                  border: '1.5px solid #cbd5e1',
                  zIndex: 999999,
                  textAlign: 'right',
                  direction: 'rtl',
                  overflow: 'hidden',
                  animation: 'notifFadeIn 0.18s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                    borderBottom: '1px solid #e2e8f0',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    color: '#ffffff',
                  }}
                >
                  <span>🔔 الإشعارات والتنبيهات</span>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#fff', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                      لا توجد إشعارات جديدة
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #f1f5f9',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          cursor: 'default',
                        }}
                      >
                        <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{n.icon}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 3px 0', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.4 }}>
                            {n.text}
                          </p>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{n.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>,
            document.body
          )}

          <div className="topbar-lang-pill" title="اللغة">
            🌐 العربية ▾
          </div>

          <div className="topbar-sys-switch">
            <button
              type="button"
              className={`sys-switch-btn ${currentSystem === 'algerian' ? 'active' : ''}`}
              onClick={() => onSystemChange('algerian')}
            >
              🇩🇿 جزائري
            </button>
            <button
              type="button"
              className={`sys-switch-btn ${currentSystem === 'international' ? 'active' : ''}`}
              onClick={() => onSystemChange('international')}
            >
              🌍 عالمي
            </button>
          </div>

          {onLogout && (
            <button type="button" className="topbar-logout-btn" onClick={onLogout} title="تسجيل الخروج">
              🚷
            </button>
          )}

          {/* Hamburger - mobile only */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setShowMobileMenu(true)}
            aria-label="قائمة التنقل"
          >
            ☰
          </button>
        </div>

        {/* Center: Search */}
        <div className="topbar-center">
          <div className="topbar-search-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="ابحث عن درس أو مسابقة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="topbar-search-input"
            />
          </div>
        </div>

        {/* Right: Brand */}
        <div className="topbar-right">
          <div className="topbar-brand">
            <div className="topbar-brand-icon">🧮</div>
            <div className="topbar-brand-text">
              <span className="topbar-brand-title">Suroban Academy</span>
              <span className="topbar-brand-sub">أكاديمية السوروبان</span>
            </div>
          </div>
        </div>
      </header>

      {/* 3-COLUMN BODY LAYOUT */}
      <div className="portal-layout-grid">
        {/* RIGHT: NAVIGATION SIDEBAR */}
        <aside className="portal-sidebar-column">
          <nav className="portal-nav-card">
            {navItems.map((item) => {
              const isActive = activeNavItem === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`portal-nav-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveNavItem(item.id);
                    item.action();
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            className="portal-sidebar-comp-btn"
            onClick={onOpenCompetitions}
          >
            🏆 سجل لمسابقة جديدة
          </button>
        </aside>

        {/* CENTER: MAIN STREAM */}
        <main className="portal-center-column">
          {/* Hero Banner with 3D Mascot */}
          <section className="portal-hero-banner">
            <div className="hero-banner-content">
              <h1 className="hero-banner-title">🏆 تعلّم .. تدرب .. تنافس </h1>
              <h2 className="hero-banner-sub">مع منصة سوربان الأفضل للأطفال</h2>
              <p className="hero-banner-desc">
                طوّر مهاراتك الحسابية وكن بطل المسابقات العالمية!
              </p>
              <button
                type="button"
                className="hero-banner-btn"
                onClick={handleStartQuick}
              >
                ▶ ابدأ التدريب الآن
              </button>
            </div>
            <div className="hero-banner-visual">
              <img
                src="/images/dashboard_hero.jpg"
                alt="بطل السوروبان"
                className="hero-banner-img"
              />
            </div>
          </section>

          {/* 4 Stats Cards */}
          <div className="portal-stats-row">
            {/* Card 1: Streak */}
            <div className="stat-pill-card bg-purple">
              <div className="stat-pill-icon">🔥</div>
              <div className="stat-pill-info">
                <span className="stat-pill-label">التحدي اليومي</span>
                <strong className="stat-pill-val">{userStats.streak > 0 ? `${userStats.streak} أيام متتالية` : 'ابدأ اليوم!'}</strong>
                <div className="stat-pill-progress-track">
                  <div className="stat-pill-progress-fill" style={{ width: `${Math.min((userStats.streak / 7) * 100, 100)}%` }} />
                </div>
              </div>
            </div>

            {/* Card 2: Points */}
            <div className="stat-pill-card bg-green">
              <div className="stat-pill-icon">⭐</div>
              <div className="stat-pill-info">
                <span className="stat-pill-label">نقاطك</span>
                <strong className="stat-pill-val">{userStats.totalPoints > 0 ? `${userStats.totalPoints.toLocaleString()} نقطة` : '0 نقطة'}</strong>
              </div>
            </div>

            {/* Card 3: Level */}
            <div className="stat-pill-card bg-blue">
              <div className="stat-pill-icon">🏅</div>
              <div className="stat-pill-info">
                <span className="stat-pill-label">المستوى الحالي</span>
                <strong className="stat-pill-val">
                  {userStats.sessionsCount >= 6 ? 'المستوى الذهبي' : userStats.sessionsCount >= 3 ? 'المستوى الفضي' : 'المستوى التمهيدي'}
                </strong>
              </div>
            </div>

            {/* Card 4: Sessions */}
            <div className="stat-pill-card bg-pink">
              <div className="stat-pill-icon">📊</div>
              <div className="stat-pill-info">
                <span className="stat-pill-label">جلسات التدريب</span>
                <div className="rank-badge-box">
                  <strong className="stat-pill-val">{userStats.sessionsCount}</strong>
                  <span className="rank-badge-pill">جلسة</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: الدورات التدريبية */}
          <section>
            <div className="portal-section-header">
              <h2 className="section-headline">📖 الدورات التدريبية</h2>
              <button
                type="button"
                className="section-see-all"
                onClick={onOpenCourses || onOpenLevels}
              >
                عرض الكل &gt;
              </button>
            </div>

            <div className="portal-courses-grid">
              {initialCourses.map((c, idx) => {
                const toneClass = `c-${c.tone}`;
                return (
                  <div
                    key={c.id}
                    className={`course-item-card ${toneClass}`}
                    onClick={() => handleCourseClick(idx)}
                  >
                    <div className="course-thumb-box">
                      <img src={c.image} alt={c.title} />
                    </div>
                    <h3 className="course-item-title">{c.title}</h3>
                    <p className="course-item-sub">{c.subtitle}</p>
                    <div className="course-item-stars">{c.stars}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 2: المسابقات القادمة */}
          <section>
            <div className="portal-section-header">
              <h2 className="section-headline">🏆 المسابقات القادمة</h2>
              <button
                type="button"
                className="section-see-all"
                onClick={onOpenCompetitions}
              >
                عرض الكل &gt;
              </button>
            </div>

            {liveCompetitions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🏆</div>
                <p style={{ fontSize: '1rem', fontWeight: 600 }}>لا توجد مسابقات منشورة بعد</p>
                <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>سيُعلن عن المسابقات قريباً!</p>
              </div>
            ) : (
              <div className="portal-competitions-grid">
                {liveCompetitions.map((comp) => (
                  <div key={comp.id} className="comp-item-card">
                    <span className={`comp-badge-tag tag-orange`}>
                      {comp.levelName || comp.system}
                    </span>
                    <div className="comp-thumb-box" style={{ background: comp.bannerImage ? 'transparent' : 'linear-gradient(135deg,#1e3a8a,#3b82f6)' }}>
                      {comp.bannerImage ? (
                        <img src={comp.bannerImage} alt={comp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem' }}>🏆</div>
                      )}
                    </div>
                    <h3 className="comp-info-title">{comp.title}</h3>
                    <div className="comp-info-meta">
                      <span>📅 {new Date(comp.openDate).toLocaleDateString('ar-DZ')}</span>
                      <span>👥 {comp.categoryName}</span>
                    </div>
                    <button
                      type="button"
                      className="comp-reg-btn"
                      onClick={onOpenCompetitions}
                    >
                      🚀 سجل الآن
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Trust Bar */}
          <footer className="portal-trust-banner">
            <span>🛡️ بيئة آمنة للأطفال</span>
            <span>📜 شهادات معتمدة</span>
            <span>🌐 مسابقات عالمية</span>
            <span>👨‍🏫 تعلم مع أفضل المدربين</span>
          </footer>
        </main>

        {/* LEFT: WIDGETS COLUMN */}
        <aside className="portal-widgets-column">
          {/* Leaderboard Widget */}
          <div className="widget-box">
            <h3 className="widget-box-title">🏆 لوحة المتصدرين</h3>
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 10px', color: '#94a3b8', fontSize: '0.9rem' }}>
                لا توجد نتائج مسجلة بعد
              </div>
            ) : (
              <div className="widget-leader-list">
                {leaderboard.map((item, idx) => (
                  <div key={item.id} className="widget-leader-row">
                    <span className="leader-rank-col">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </span>
                    <div className="leader-avatar-circle">{item.name.charAt(0)}</div>
                    <div className="leader-details">
                      <span className="leader-name-text">{item.name}</span>
                      <span className="leader-points-text">{item.pts.toLocaleString()} نقطة</span>
                    </div>
                    <span className="leader-flag-icon">{item.flag || ''}</span>
                  </div>
                ))}
              </div>
            )}
            {leaderboard.length > 5 && (
              <button
                type="button"
                className="widget-link-btn"
                onClick={onOpenCompetitions}
              >
                ← عرض المزيد
              </button>
            )}
          </div>

          {/* Next Goal Widget */}
          <div className="widget-box goal-widget-box">
            <h3 className="widget-box-title">هدفك القادم</h3>
            <div className="goal-big-icon">
              {userStats.sessionsCount >= 3 ? '🎖️' : '🎁'}
            </div>
            <p className="goal-instruction">
              {userStats.sessionsCount >= 3
                ? '🎉 مبروك! أكملت هدف التدريب ونلت شارة البطل!'
                : `أكمل 3 جلسات تدريب لتحصل على شارة البطل!`}
            </p>
            <div className="goal-progress-flex">
              <div className="goal-track">
                <div
                  className="goal-fill"
                  style={{
                    width: `${Math.min(100, Math.round((userStats.sessionsCount / 3) * 100))}%`,
                  }}
                />
              </div>
              <span className="goal-ratio">{Math.min(userStats.sessionsCount, 3)} / 3</span>
            </div>
          </div>
        </aside>
      </div>

      {/* ====== MOBILE BOTTOM NAV BAR ====== */}
      <nav className="mobile-bottom-nav" aria-label="التنقل السريع">
        {[
          { id: 'home', label: 'رئيسي', icon: '🏠', action: () => onNavigate('dashboard') },
          { id: 'courses', label: 'دورات', icon: '📖', action: () => onNavigate('courses') },
          { id: 'competitions', label: 'مسابقات', icon: '🏆', action: () => onNavigate('competitions') },
          { id: 'daily', label: 'تحدي', icon: '🔥', action: () => onNavigate('levels') },
          { id: 'menu', label: 'قائمة', icon: '⋯', action: () => setShowMobileMenu(true) },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            className={`mobile-nav-item ${activeNavItem === item.id ? 'active' : ''}`}
            onClick={() => {
              if (item.id !== 'menu') setActiveNavItem(item.id);
              item.action();
            }}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ====== MOBILE MENU DRAWER ====== */}
      {showMobileMenu && (
        <>
          <div
            className="mobile-drawer-backdrop"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="mobile-drawer">
            <div className="mobile-drawer-header">
              <span>🧠 قائمة التنقل</span>
              <button
                type="button"
                className="mobile-drawer-close"
                onClick={() => setShowMobileMenu(false)}
              >
                ✕
              </button>
            </div>
            <div className="mobile-drawer-nav">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`mobile-drawer-item ${activeNavItem === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveNavItem(item.id);
                    item.action();
                    setShowMobileMenu(false);
                  }}
                >
                  <span className="mobile-drawer-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            {onLogout && (
              <button
                type="button"
                className="mobile-drawer-logout"
                onClick={() => { setShowMobileMenu(false); onLogout(); }}
              >
                🚷 تسجيل الخروج
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default EnhancedDashboard;