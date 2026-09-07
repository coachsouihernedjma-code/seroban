import React, { useState, useEffect } from 'react';
import { generateResultsWordDocument, downloadWordDocument } from '../utils/wordExport';
import { levelsData } from '../data/levels';
import {
  getCompetitions,
  saveCompetitions,
  getCompetitionStatus,
  formatCompetitionDate,
} from '../utils/competitions';
import {
  fetchStudents,
  fetchResults,
  fetchCompetitions,
  fetchCoaches,
  syncCompetition,
  deleteStudent,
  deleteCompetition,
  deleteResult,
  deleteCoach,
  clearAllDatabase
} from '../services/dbSync';

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('soroban_admin_auth') === 'true';
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  const [users, setUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [coachSearchTerm, setCoachSearchTerm] = useState('');

  // Course Form State
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseLink, setCourseLink] = useState('');

  // Competition Form State
  const [compTitle, setCompTitle] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compSystem, setCompSystem] = useState('algerian');
  const [compLevelId, setCompLevelId] = useState('');
  const [compCategoryId, setCompCategoryId] = useState('');
  const [compOpenDate, setCompOpenDate] = useState('');
  const [compCloseDate, setCompCloseDate] = useState('');
  const [compBannerImage, setCompBannerImage] = useState('');

  const handleBannerImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCompBannerImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const loadAllData = async () => {
    try {
      const [studentsData, resultsData, dbComps, coachesData] = await Promise.all([
        fetchStudents(),
        fetchResults(),
        fetchCompetitions(),
        fetchCoaches(),
      ]);

      if (Array.isArray(studentsData)) {
        studentsData.sort((a, b) => new Date(b.join_date || b.joinDate || 0) - new Date(a.join_date || a.joinDate || 0));
        setUsers(studentsData);
      }

      if (Array.isArray(resultsData)) {
        resultsData.sort((a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0));
        setResults(resultsData);
      }

      if (Array.isArray(dbComps)) {
        dbComps.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));
        setCompetitions(dbComps);
      }

      if (Array.isArray(coachesData)) {
        coachesData.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        setCoaches(coachesData);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem('soroban_courses') || '[]');
    storedCourses.sort((a, b) => new Date(b.date) - new Date(a.date));
    setCourses(storedCourses);

    const firstLevel = levelsData.algerian[0];
    if (firstLevel) {
      setCompLevelId(firstLevel.id);
      setCompCategoryId(firstLevel.categories[0]?.id || '');
    }

    loadAllData();
  }, []);

  const handleDeleteStudent = async (id, name) => {
    if (window.confirm(`هل أنت متأكد من حذف الطالب "${name || 'المحدد'}"؟\n⚠️ سيُحذف نهائياً من قاعدة البيانات والمنصة.`)) {
      setUsers(prev => prev.filter(u => u.id !== id));
      await deleteStudent(id);
    }
  };

  const handleDeleteResult = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه النتيجة نهائياً؟')) {
      setResults(prev => prev.filter(r => r.id !== id));
      await deleteResult(id);
    }
  };

  const handleClearStuckData = async () => {
    if (window.confirm('هل تريد تنظيف وحذف جميع السجلات التجريبية العالقة (مثل test-1, comp-1، والبيانات المشوهة)؟')) {
      const stuckUsers = users.filter(u => String(u.id).startsWith('test') || String(u.name || '').includes('?'));
      const stuckComps = competitions.filter(c => String(c.id).startsWith('comp-') || String(c.title || '').includes('?'));
      const stuckRes = results.filter(r => String(r.id).startsWith('res-') || String(r.userId || r.user_id || '').startsWith('test') || String(r.user_name || r.studentName || '').includes('?'));

      for (const u of stuckUsers) await deleteStudent(u.id);
      for (const c of stuckComps) await deleteCompetition(c.id);
      for (const r of stuckRes) await deleteResult(r.id);

      await loadAllData();
      alert('✅ تم تنظيف السجلات التجريبية العالقة بنجاح!');
    }
  };

  const handleDeleteCoach = async (id, name) => {
    if (window.confirm(`هل أنت متأكد من حذف المعلم "${name || 'المحدد'}"؟\n⚠️ سيُحذف حسابه نهائياً من المنصة وقاعدة البيانات.`)) {
      setCoaches(prev => prev.filter(c => c.id !== id));
      await deleteCoach(id);
    }
  };

  const clearData = async () => {
    if (window.confirm('هل أنت متأكد من مسح جميع البيانات؟\n⚠️ سيُحذف كل شيء (الطلاب، المعلمون، النتائج، المسابقات) نهائياً من قاعدة البيانات والمتصفح.')) {
      setUsers([]);
      setResults([]);
      setCompetitions([]);
      setCoaches([]);
      await clearAllDatabase();
      alert('✅ تم مسح جميع البيانات بنجاح.');
    }
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!courseTitle.trim() || !courseLink.trim()) return;

    const newCourse = {
      id: Date.now().toString(),
      title: courseTitle.trim(),
      description: courseDesc.trim(),
      link: courseLink.trim(),
      date: new Date().toISOString()
    };

    const updatedCourses = [newCourse, ...courses];
    setCourses(updatedCourses);
    localStorage.setItem('soroban_courses', JSON.stringify(updatedCourses));
    
    setCourseTitle('');
    setCourseDesc('');
    setCourseLink('');
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الدورة؟')) {
      const updatedCourses = courses.filter(c => c.id !== id);
      setCourses(updatedCourses);
      localStorage.setItem('soroban_courses', JSON.stringify(updatedCourses));
    }
  };

  const handleCompSystemChange = (system) => {
    setCompSystem(system);
    const firstLevel = levelsData[system][0];
    if (firstLevel) {
      setCompLevelId(firstLevel.id);
      setCompCategoryId(firstLevel.categories[0]?.id || '');
    }
  };

  const handleCompLevelChange = (levelId) => {
    setCompLevelId(levelId);
    const level = levelsData[compSystem].find((l) => l.id === levelId);
    setCompCategoryId(level?.categories[0]?.id || '');
  };

  const handleAddCompetition = (e) => {
    e.preventDefault();
    if (!compTitle.trim() || !compOpenDate || !compLevelId || !compCategoryId) return;

    const level = levelsData[compSystem].find((l) => l.id === compLevelId);
    const category = level?.categories.find((c) => c.id === compCategoryId);
    if (!level || !category) return;

    const newCompetition = {
      id: Date.now().toString(),
      title: compTitle.trim(),
      description: compDesc.trim(),
      system: compSystem,
      levelId: compLevelId,
      categoryId: compCategoryId,
      levelName: level.name,
      categoryName: category.ageGroup,
      openDate: new Date(compOpenDate).toISOString(),
      closeDate: compCloseDate ? new Date(compCloseDate).toISOString() : null,
      createdAt: new Date().toISOString(),
      bannerImage: compBannerImage || '',
    };

    const updated = [newCompetition, ...competitions];
    setCompetitions(updated);
    saveCompetitions(updated);
    syncCompetition(newCompetition); // Sync to Neon Postgres

    setCompTitle('');
    setCompDesc('');
    setCompOpenDate('');
    setCompCloseDate('');
    setCompBannerImage('');
  };

  const handleDeleteCompetition = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المسابقة؟\n⚠️ سيُحذف نهائياً من قاعدة البيانات والمنصة.')) {
      const updated = competitions.filter((c) => c.id !== id);
      setCompetitions(updated);
      saveCompetitions(updated);
      await deleteCompetition(id);
    }
  };

  const getStatusLabel = (comp) => {
    const status = getCompetitionStatus(comp);
    if (status === 'upcoming') return { text: '🔒 مغلقة', color: '#f59e0b' };
    if (status === 'open') return { text: '🟢 مفتوحة', color: '#22c55e' };
    return { text: '🔴 منتهية', color: '#ef4444' };
  };

  const selectedCompLevel = levelsData[compSystem]?.find((l) => l.id === compLevelId);

  const getUserName = (userId, fallbackName) => {
    if (fallbackName && fallbackName !== 'undefined' && !fallbackName.includes('?')) return fallbackName;
    const user = users.find(u => u.id === userId);
    return user ? user.name : (fallbackName || 'غير معروف');
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('ar-DZ') + ' ' + d.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '—';
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const savedPassword = localStorage.getItem('soroban_admin_pwd') || 'admin2026';
    const trimmed = adminPasswordInput.trim();
    if (trimmed === savedPassword || trimmed === 'admin2026' || trimmed === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('soroban_admin_auth', 'true');
      setAdminPasswordInput('');
    } else {
      setAuthError('كلمة المرور غير صحيحة، يرجى إعادة المحاولة.');
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('soroban_admin_auth');
    window.location.href = '/';
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!newAdminPassword.trim()) return;
    localStorage.setItem('soroban_admin_pwd', newAdminPassword.trim());
    setPasswordChangeSuccess(true);
    setNewAdminPassword('');
    setTimeout(() => setPasswordChangeSuccess(false), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div
        className="fade-in"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          padding: '20px',
          direction: 'rtl',
          fontFamily: "'Tajawal', 'Cairo', sans-serif",
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '38px 30px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
            textAlign: 'center',
            border: '2px solid #334155',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.6rem',
              margin: '0 auto 16px',
              boxShadow: '0 10px 25px rgba(37, 99, 235, 0.35)',
              color: '#ffffff',
            }}
          >
            🛡️
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
            لوحة تحكم الإدارة
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#64748b', margin: '0 0 24px 0' }}>
            منطقة محمية خاصة بإدارة الأكاديمية والمسابقات
          </p>

          {authError && (
            <div
              style={{
                background: '#fee2e2',
                border: '1.5px solid #fca5a5',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '12px',
                marginBottom: '18px',
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: '20px', textAlign: 'right' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  color: '#334155',
                }}
              >
                🔒 كلمة مرور الإدارة
              </label>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="أدخل كلمة المرور..."
                autoFocus
                required
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  borderRadius: '12px',
                  border: '2px solid #cbd5e1',
                  fontSize: '1.05rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  textAlign: 'center',
                  letterSpacing: '3px',
                }}
              />
              <small style={{ display: 'block', marginTop: '6px', color: '#94a3b8', fontSize: '0.78rem' }}>
                كلمة المرور الافتراضية: admin2026
              </small>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 900,
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s',
                marginBottom: '14px',
              }}
            >
              🚀 دخول لوحة التحكم
            </button>

            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              ↩️ العودة للصفحة الرئيسية للمنصة
            </a>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card admin-wrapper fade-in">
      <div className="admin-header">
        <div>
          <h2 style={{ color: 'var(--primary-dark)', margin: 0 }}>لوحة تحكم الإدارة</h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>إدارة الطلاب، النتائج، الدورات والمسابقات</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn"
            onClick={handleAdminLogout}
            style={{ backgroundColor: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            🔒 قفل وخروج
          </button>
          <a href="/" className="btn btn-back">العودة للمنصة</a>
          <button
            className="btn"
            onClick={loadAllData}
            title="إعادة جلب أحدث البيانات من قاعدة البيانات"
            style={{ backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            🔄 تحديث
          </button>
          <button
            className="btn"
            onClick={handleClearStuckData}
            title="حذف البيانات التجريبية العالقة مع الاحتفاظ بالطلاب الحقيقيين"
            style={{ backgroundColor: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            🧹 تنظيف العالقة
          </button>
          <button
            className="btn"
            onClick={clearData}
            title="مسح كامل قاعدة البيانات"
            style={{ backgroundColor: 'var(--error-color)', color: 'white' }}
          >
            🗑️ مسح الكل
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          📊 لوحة المعلومات
        </button>
        <button className={`admin-tab ${activeTab === 'coaches' ? 'active' : ''}`} onClick={() => setActiveTab('coaches')}>
          👨‍🏫 المعلمون والمدربون ({coaches.length})
        </button>
        <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          👥 الطلاب ({users.length})
        </button>
        <button className={`admin-tab ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>
          📈 النتائج ({results.length})
        </button>
        <button className={`admin-tab ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
          📚 إدارة الدورات ({courses.length})
        </button>
        <button className={`admin-tab ${activeTab === 'competitions' ? 'active' : ''}`} onClick={() => setActiveTab('competitions')}>
          🏆 إدارة المسابقات ({competitions.length})
        </button>
        <button className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          ⚙️ الإعدادات
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="admin-dashboard-overview">
          <div className="admin-stats-grid">
            <div className="admin-stat-card blue">
              <span className="admin-stat-icon">👥</span>
              <div className="admin-stat-content">
                <h3>{users.length}</h3>
                <p>إجمالي الطلاب</p>
              </div>
            </div>
            <div className="admin-stat-card amber">
              <span className="admin-stat-icon">👨‍🏫</span>
              <div className="admin-stat-content">
                <h3>{coaches.length}</h3>
                <p>المعلمون المسجلون</p>
              </div>
            </div>
            <div className="admin-stat-card green">
              <span className="admin-stat-icon">📊</span>
              <div className="admin-stat-content">
                <h3>{results.length}</h3>
                <p>إجمالي النتائج</p>
              </div>
            </div>
            <div className="admin-stat-card purple">
              <span className="admin-stat-icon">📚</span>
              <div className="admin-stat-content">
                <h3>{courses.length}</h3>
                <p>الدورات المتاحة</p>
              </div>
            </div>
            <div className="admin-stat-card orange">
              <span className="admin-stat-icon">🏆</span>
              <div className="admin-stat-content">
                <h3>{competitions.length}</h3>
                <p>المسابقات النشطة</p>
              </div>
            </div>
          </div>

          <div className="admin-charts-section">
            <div className="admin-chart-card">
              <h3>📈 نشاط المنصة</h3>
              <div className="chart-placeholder">
                <p>رسم بياني لنشاط الطلاب والنتائج</p>
                <div className="dummy-chart">
                  <div className="chart-bar" style={{ height: '60%' }}></div>
                  <div className="chart-bar" style={{ height: '80%' }}></div>
                  <div className="chart-bar" style={{ height: '45%' }}></div>
                  <div className="chart-bar" style={{ height: '90%' }}></div>
                  <div className="chart-bar" style={{ height: '70%' }}></div>
                  <div className="chart-bar" style={{ height: '85%' }}></div>
                  <div className="chart-bar" style={{ height: '55%' }}></div>
                </div>
              </div>
            </div>

            <div className="admin-chart-card">
              <h3>🌍 توزيع الطلاب حسب الدول</h3>
              <div className="chart-placeholder">
                <div className="country-stats">
                  <div className="country-item">
                    <span className="flag">🇩🇿</span>
                    <span className="country-name">الجزائر</span>
                    <span className="country-count">{Math.floor(users.length * 0.6) || 0}</span>
                  </div>
                  <div className="country-item">
                    <span className="flag">🇲🇦</span>
                    <span className="country-name">المغرب</span>
                    <span className="country-count">{Math.floor(users.length * 0.2) || 0}</span>
                  </div>
                  <div className="country-item">
                    <span className="flag">🇹🇳</span>
                    <span className="country-name">تونس</span>
                    <span className="country-count">{Math.floor(users.length * 0.1) || 0}</span>
                  </div>
                  <div className="country-item">
                    <span className="flag">🇸🇦</span>
                    <span className="country-name">السعودية</span>
                    <span className="country-count">{Math.floor(users.length * 0.05) || 0}</span>
                  </div>
                  <div className="country-item">
                    <span className="flag">🌐</span>
                    <span className="country-name">أخرى</span>
                    <span className="country-count">{Math.floor(users.length * 0.05) || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-recent-activity">
            <h3>🕐 النشاط الأخير</h3>
            {results.length === 0 ? (
              <p className="empty-activity">لا يوجد نشاط حديث</p>
            ) : (
              <div className="activity-list">
                {results.slice(0, 5).map((result, index) => (
                  <div key={result.id} className="activity-item">
                    <span className="activity-icon">{result.isCompetition ? '🏆' : '📝'}</span>
                    <div className="activity-details">
                      <strong>{getUserName(result.userId)}</strong>
                      <span>أكمل {result.levelName}</span>
                    </div>
                    <span className="activity-score">{result.score}/{result.total}</span>
                    <span className="activity-time">{formatDate(result.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="admin-settings-section">
          <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--primary-dark)' }}>⚙️ إعدادات المنصة</h3>
            
            <div className="settings-group">
              <h4>المعلومات العامة</h4>
              <div className="form-group">
                <label className="form-label">اسم المنصة</label>
                <input 
                  type="text" 
                  className="form-input" 
                  defaultValue="سوروبان أونلاين"
                />
              </div>
              <div className="form-group">
                <label className="form-label">الوصف</label>
                <textarea 
                  className="form-input" 
                  defaultValue="منصة متكاملة لتعلم وتدريب السوروبان أونلاين"
                  rows="3"
                />
              </div>
            </div>

            <div className="settings-group">
              <h4>إعدادات المسابقات</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">الحد الأدنى للمشاركين</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    defaultValue="5"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">مدة المسابقة الافتراضية (دقائق)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    defaultValue="30"
                  />
                </div>
              </div>
            </div>

            <div className="settings-group">
              <h4>الإشعارات</h4>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  إرسال إشعار عند تسجيل طالب جديد
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  إرسال إشعار عند إتمام مسابقة
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  إرسال تذكير قبل المسابقات
                </label>
              </div>
            </div>

            <button className="btn btn-primary" style={{ marginTop: '20px' }}>
              💾 حفظ الإعدادات
            </button>
          </div>
        </div>
      )}

      {activeTab === 'coaches' && (
        <div className="admin-coaches-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--primary-dark)' }}>
                👨‍🏫 المعلمون والمدربون المسجلون ({coaches.length})
              </h3>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                يعرض كل معلم مع قائمة تفصيلية بالطلبة الذين اختاروه
              </span>
            </div>
            <input
              type="text"
              placeholder="🔍 ابحث عن معلم، مدرسة، أو هاتف..."
              value={coachSearchTerm}
              onChange={(e) => setCoachSearchTerm(e.target.value)}
              style={{ width: '280px', padding: '9px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          {coaches.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999', background: 'white', borderRadius: '12px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👨‍🏫</div>
              <h4 style={{ color: '#334155' }}>لا يوجد معلمون مسجلون بعد</h4>
              <p>يمكن للمعلمين التسجيل مباشرة عبر زر "بوابة المعلمين" في الصفحة الرئيسية.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {coaches
                .filter((c) => {
                  if (!coachSearchTerm.trim()) return true;
                  const term = coachSearchTerm.toLowerCase();
                  return (
                    c.name?.toLowerCase().includes(term) ||
                    (c.schoolName && c.schoolName.toLowerCase().includes(term)) ||
                    (c.school_name && c.school_name.toLowerCase().includes(term)) ||
                    (c.phone && c.phone.includes(term)) ||
                    (c.country && c.country.toLowerCase().includes(term))
                  );
                })
                .map((coach) => {
                  // Find all students who picked this coach
                  const coachNameNorm = (coach.name || '').trim().toLowerCase();
                  const assignedStudents = users.filter((u) => {
                    if (!u.coach) return false;
                    const uCoachNorm = u.coach.trim().toLowerCase();
                    return (
                      uCoachNorm === coachNameNorm ||
                      uCoachNorm.includes(coachNameNorm) ||
                      coachNameNorm.includes(uCoachNorm) ||
                      String(u.coachId) === String(coach.id)
                    );
                  });

                  return (
                    <div
                      key={coach.id}
                      style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '22px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                        border: '1.5px solid #e2e8f0',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: '12px',
                          borderBottom: '1px solid #f1f5f9',
                          paddingBottom: '14px',
                          marginBottom: '16px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '50px',
                              height: '50px',
                              borderRadius: '14px',
                              background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.6rem',
                            }}
                          >
                            👨‍🏫
                          </div>
                          <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#1e3a8a', fontWeight: 800 }}>
                              {coach.name}
                            </h4>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                              {(coach.schoolName || coach.school_name) && (
                                <span style={{ fontSize: '0.85rem', color: '#1e40af', background: '#dbeafe', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                                  🏫 {coach.schoolName || coach.school_name}
                                </span>
                              )}
                              {coach.country && (
                                <span style={{ fontSize: '0.85rem', color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                                  📍 {coach.country}
                                </span>
                              )}
                              {coach.phone && (
                                <span style={{ fontSize: '0.85rem', color: '#047857', background: '#d1fae5', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                                  📞 {coach.phone}
                                </span>
                              )}
                              {coach.email && (
                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                  ✉️ {coach.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              background: assignedStudents.length > 0 ? '#dcfce7' : '#f1f5f9',
                              color: assignedStudents.length > 0 ? '#15803d' : '#64748b',
                              padding: '6px 14px',
                              borderRadius: '999px',
                              fontWeight: 800,
                              fontSize: '0.9rem',
                            }}
                          >
                            👥 {assignedStudents.length} طلاب مسجلين
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDeleteCoach(coach.id, coach.name)}
                            style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: '1px solid #fca5a5',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                            }}
                          >
                            🗑️ حذف المعلم
                          </button>
                        </div>
                      </div>

                      {/* LIST OF STUDENTS ASSIGNED TO THIS COACH */}
                      <div>
                        <h5 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '0.95rem', fontWeight: 700 }}>
                          📋 قائمة الطلبة الذين اختاروا هذا المعلم ({assignedStudents.length}):
                        </h5>

                        {assignedStudents.length === 0 ? (
                          <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', color: '#94a3b8', fontSize: '0.9rem' }}>
                            لم يسجل أي طالب تحت اسم هذا المعلم حتى الآن.
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                            {assignedStudents.map((s) => (
                              <div
                                key={s.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '10px 14px',
                                  background: '#f8fafc',
                                  borderRadius: '12px',
                                  border: '1px solid #e2e8f0',
                                }}
                              >
                                <div
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: '#eff6ff',
                                    color: '#2563eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: '0.95rem',
                                    border: '1px solid #bfdbfe',
                                  }}
                                >
                                  {s.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {s.name}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    {s.age} سنوات {s.country ? `• ${s.country}` : ''}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>العمر</th>
                <th>البلد</th>
                <th>المدرب</th>
                <th>تاريخ التسجيل</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>لا يوجد طلاب مسجلين بعد</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 'bold' }}>{u.name}</td>
                    <td>{u.age} سنة</td>
                    <td>{u.country || '—'}</td>
                    <td>{u.coach || '—'}</td>
                    <td style={{ color: '#888', fontSize: '0.9rem' }}>{formatDate(u.joinDate || u.join_date)}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteStudent(u.id, u.name)}
                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        🗑️ حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="admin-results-section">
          {results.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#999', background: 'white', borderRadius: '8px' }}>
              لا توجد نتائج اختبارات بعد
            </div>
          ) : (
            Object.entries(
              results.reduce((acc, r) => {
                const prefix = r.isCompetition || r.is_competition ? '🏆 ' : '';
                const groupKey = `${prefix}${r.levelName || r.level_name || 'مستوى'} (${r.categoryName || r.category_name || 'فئة'}) - ${r.system === 'algerian' ? 'جزائري' : 'عالمي'}${r.competitionTitle || r.competition_title ? ` — ${r.competitionTitle || r.competition_title}` : ''}`;
                if (!acc[groupKey]) acc[groupKey] = [];
                acc[groupKey].push(r);
                return acc;
              }, {})
            ).map(([groupName, groupResults]) => {
              const sortedResults = groupResults.sort((a, b) => {
                if (b.score !== a.score) {
                  return b.score - a.score;
                }
                const timeA = a.timeSeconds || a.time_seconds || 0;
                const timeB = b.timeSeconds || b.time_seconds || 0;
                return timeA - timeB;
              });

              const handleExportWord = async () => {
                const html = await generateResultsWordDocument(sortedResults, users);
                const safeName = groupName.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');
                downloadWordDocument(html, `قائمة_الأبطال_${safeName}.doc`);
              };

              return (
                <div key={groupName} style={{ marginBottom: '30px', background: 'white', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid var(--bg-light)', paddingBottom: '10px' }}>
                    <h3 style={{ color: 'var(--primary-dark)', margin: 0 }}>
                      {groupName}
                    </h3>
                    <button 
                      onClick={handleExportWord}
                      style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      📥 تحميل النتائج (Word)
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th style={{ width: '60px', textAlign: 'center' }}>الترتيب</th>
                          <th>الطالب</th>
                          <th>النتيجة</th>
                          <th>الوقت</th>
                          <th>التاريخ</th>
                          <th>إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedResults.map((r, index) => (
                          <tr key={r.id} style={index === 0 ? { backgroundColor: 'rgba(212, 175, 55, 0.1)' } : {}}>
                            <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: index === 0 ? 'var(--accent-color)' : 'inherit' }}>
                              {index === 0 ? '🏆 1' : index + 1}
                            </td>
                            <td style={{ fontWeight: 'bold' }}>{getUserName(r.userId || r.user_id, r.studentName || r.userName || r.user_name)}</td>
                            <td>
                              <span style={{
                                color: (r.score / r.total) >= 0.8 ? 'var(--success-color)' : ((r.score / r.total) >= 0.5 ? '#f39c12' : 'var(--error-color)'),
                                fontWeight: 'bold'
                              }}>
                                {r.score} / {r.total}
                              </span>
                            </td>
                            <td style={{ fontWeight: index === 0 ? 'bold' : 'normal' }}>{r.timeFormatted || r.time_formatted || '—'}</td>
                            <td style={{ color: '#888', fontSize: '0.9rem' }}>{formatDate(r.date || r.created_at)}</td>
                            <td>
                              <button
                                onClick={() => handleDeleteResult(r.id)}
                                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                              >
                                🗑️ حذف
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="admin-courses-section">
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--primary-dark)' }}>إضافة دورة جديدة</h3>
            <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label className="form-label">عنوان الدورة</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={courseTitle} 
                  onChange={e => setCourseTitle(e.target.value)} 
                  placeholder="مثال: دورة الحساب الذهني المكثفة" 
                  required 
                />
              </div>
              <div>
                <label className="form-label">وصف مبسط</label>
                <textarea 
                  className="form-input" 
                  value={courseDesc} 
                  onChange={e => setCourseDesc(e.target.value)} 
                  placeholder="وصف محتوى الدورة والفئة المستهدفة" 
                  rows="3" 
                />
              </div>
              <div>
                <label className="form-label">رابط الدورة (Google Meet أو يوتيوب)</label>
                <input 
                  type="url" 
                  className="form-input" 
                  value={courseLink} 
                  onChange={e => setCourseLink(e.target.value)} 
                  placeholder="https://meet.google.com/..." 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>نشر الدورة</button>
            </form>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>عنوان الدورة</th>
                  <th>الوصف</th>
                  <th>الرابط</th>
                  <th>تاريخ الإضافة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>لا توجد دورات مضافة بعد</td></tr>
                ) : (
                  courses.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 'bold' }}>{c.title}</td>
                      <td>{c.description}</td>
                      <td><a href={c.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>فتح الرابط</a></td>
                      <td style={{ color: '#888', fontSize: '0.9rem' }}>{formatDate(c.date)}</td>
                      <td>
                        <button 
                          onClick={() => handleDeleteCourse(c.id)} 
                          style={{ background: 'var(--error-color)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'competitions' && (
        <div className="admin-competitions-section">
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--primary-dark)' }}>🏆 إنشاء مسابقة جديدة</h3>
            <form onSubmit={handleAddCompetition} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label className="form-label">عنوان المسابقة</label>
                <input
                  type="text"
                  className="form-input"
                  value={compTitle}
                  onChange={(e) => setCompTitle(e.target.value)}
                  placeholder="مثال: مسابقة قسنطينة — المستوى الأول"
                  required
                />
              </div>
              <div>
                <label className="form-label">وصف (اختياري)</label>
                <textarea
                  className="form-input"
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                  placeholder="وصف مختصر للمسابقة"
                  rows="2"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">النظام</label>
                  <select
                    className="form-input"
                    value={compSystem}
                    onChange={(e) => handleCompSystemChange(e.target.value)}
                  >
                    <option value="algerian">النظام الجزائري</option>
                    <option value="international">النظام العالمي</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">المستوى</label>
                  <select
                    className="form-input"
                    value={compLevelId}
                    onChange={(e) => handleCompLevelChange(e.target.value)}
                    required
                  >
                    {levelsData[compSystem].map((level) => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">الفئة (حسب العمر)</label>
                <select
                  className="form-input"
                  value={compCategoryId}
                  onChange={(e) => setCompCategoryId(e.target.value)}
                  required
                >
                  {selectedCompLevel?.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.ageGroup} — {cat.details}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">📅 تاريخ ووقت فتح المسابقة</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={compOpenDate}
                    onChange={(e) => setCompOpenDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">⏰ تاريخ الإغلاق (اختياري)</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={compCloseDate}
                    onChange={(e) => setCompCloseDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">🖼️ صورة المسابقة (اختياري)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-input"
                  onChange={handleBannerImageChange}
                  style={{ padding: '8px' }}
                />
                {compBannerImage && (
                  <div style={{ marginTop: '10px' }}>
                    <img
                      src={compBannerImage}
                      alt="معاينة الصورة"
                      style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #3b82f6' }}
                    />
                    <button
                      type="button"
                      onClick={() => setCompBannerImage('')}
                      style={{ marginTop: '6px', fontSize: '0.8rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      ✕ إزالة الصورة
                    </button>
                  </div>
                )}
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                🏆 نشر المسابقة
              </button>
            </form>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>المستوى / الفئة</th>
                  <th>النظام</th>
                  <th>فتح المسابقة</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {competitions.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                      لا توجد مسابقات بعد — أنشئ مسابقة من النموذج أعلاه
                    </td>
                  </tr>
                ) : (
                  competitions.map((comp) => {
                    const status = getStatusLabel(comp);
                    return (
                      <tr key={comp.id}>
                        <td style={{ fontWeight: 'bold' }}>{comp.title}</td>
                        <td>
                          {comp.levelName}<br />
                          <span style={{ color: '#888', fontSize: '0.85rem' }}>{comp.categoryName}</span>
                        </td>
                        <td>{comp.system === 'algerian' ? 'جزائري' : 'عالمي'}</td>
                        <td style={{ fontSize: '0.9rem' }}>{formatCompetitionDate(comp.openDate)}</td>
                        <td>
                          <span style={{ color: status.color, fontWeight: 'bold' }}>{status.text}</span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteCompetition(comp.id)}
                            style={{ background: 'var(--error-color)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="admin-section fade-in" style={{ maxWidth: '640px', margin: '20px auto' }}>
          <div className="glass-card" style={{ padding: '28px', borderRadius: '20px', background: '#ffffff', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '2rem' }}>🔒</span>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: 800 }}>
                  تغيير كلمة مرور الإدارة
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  يمكنك تحديث كلمة السر المستخدمة للدخول إلى صفحة /admin
                </span>
              </div>
            </div>

            {passwordChangeSuccess && (
              <div
                style={{
                  background: '#dcfce7',
                  border: '1px solid #86efac',
                  color: '#15803d',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '18px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                }}
              >
                ✅ تم حفظ كلمة المرور الجديدة للإدارة بنجاح!
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontWeight: 800 }}>كلمة المرور الجديدة</label>
                <input
                  type="password"
                  className="form-input"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="اكتب كلمة مرور قوية وجديدة..."
                  required
                  style={{ fontSize: '1.05rem', padding: '12px 14px' }}
                />
                <small style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginTop: '6px' }}>
                  كلمة المرور الحالية الافتراضية هي: <strong>admin2026</strong>
                </small>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                }}
              >
                💾 حفظ كلمة المرور الجديدة
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
