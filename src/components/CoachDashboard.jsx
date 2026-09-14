import React, { useState, useEffect, useMemo } from 'react';
import './CoachDashboard.css';
import { fetchStudents, fetchResults } from '../services/dbSync';
import { generateCoachStudentsReport, downloadWordDocument } from '../utils/wordExport';

function CoachDashboard({ coach, onLogout, onBack }) {
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allStudents, allResults] = await Promise.all([
        fetchStudents(),
        fetchResults(),
      ]);
      setStudents(allStudents || []);
      setResults(allResults || []);
    } catch (err) {
      console.error('Error fetching coach data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter only students who selected this coach
  const coachNameNorm = (coach?.name || '').trim().toLowerCase();
  const myStudents = useMemo(() => {
    if (!coachNameNorm) return [];
    return students.filter((s) => {
      if (!s.coach) return false;
      const sCoachNorm = s.coach.trim().toLowerCase();
      return (
        sCoachNorm === coachNameNorm ||
        sCoachNorm.includes(coachNameNorm) ||
        coachNameNorm.includes(sCoachNorm) ||
        String(s.coachId) === String(coach.id)
      );
    });
  }, [students, coachNameNorm, coach?.id]);

  // Set of IDs and names of students belonging to this coach
  const myStudentIds = useMemo(() => new Set(myStudents.map((s) => String(s.id))), [myStudents]);
  const myStudentNames = useMemo(
    () => new Set(myStudents.map((s) => s.name.trim().toLowerCase())),
    [myStudents]
  );

  // Filter only results of this coach's students
  const myResults = useMemo(() => {
    return results.filter((r) => {
      const rId = String(r.userId || r.user_id || '');
      const rName = (r.userName || r.user_name || r.studentName || '').trim().toLowerCase();
      return myStudentIds.has(rId) || (rName && myStudentNames.has(rName));
    });
  }, [results, myStudentIds, myStudentNames]);

  // Filtered students by search term
  const displayedStudents = useMemo(() => {
    if (!searchTerm.trim()) return myStudents;
    return myStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.country && s.country.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [myStudents, searchTerm]);

  // Filtered results by student selection
  const displayedResults = useMemo(() => {
    let list = myResults;
    if (selectedStudentFilter !== 'all') {
      list = list.filter(
        (r) =>
          String(r.userId || r.user_id) === selectedStudentFilter ||
          (r.userName || r.user_name) === selectedStudentFilter
      );
    }
    return list.sort((a, b) => {
      const dateA = new Date(a.date || a.created_at || 0);
      const dateB = new Date(b.date || b.created_at || 0);
      return dateB - dateA;
    });
  }, [myResults, selectedStudentFilter]);

  // Calculations for stats
  const totalCompetitions = myResults.filter((r) => r.isCompetition || r.is_competition).length;
  const avgScore =
    myResults.length > 0
      ? Math.round(
          (myResults.reduce((sum, r) => sum + (r.score / (r.total || 1)) * 100, 0) /
            myResults.length)
        )
      : 0;

  const handleCopyCoachName = () => {
    navigator.clipboard.writeText(coach.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportWord = async () => {
    if (myStudents.length === 0) {
      alert('لا يوجد طلاب مسجلون تحت إشرافك حالياً');
      return;
    }
    try {
      const html = await generateCoachStudentsReport(coach.name, myStudents, myResults);
      const safeName = coach.name.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');
      downloadWordDocument(html, `كشف_طلبة_المدرب_${safeName}.doc`);
    } catch (err) {
      console.error('Word export error:', err);
      alert('حدث خطأ أثناء إنشاء الملف. حاول مرة أخرى.');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('ar-DZ');
    } catch {
      return '—';
    }
  };

  return (
    <div className="coach-dashboard-wrapper fade-in">
      {/* HEADER */}
      <div className="coach-header">
        <div className="coach-profile">
          <div className="coach-avatar">👨‍🏫</div>
          <div className="coach-info">
            <h2>مرحباً بالأستاذ: {coach.name}</h2>
            <div className="coach-badge-row">
              {coach.schoolName && <span className="coach-badge">🏫 {coach.schoolName}</span>}
              {coach.country && <span className="coach-badge">📍 {coach.country}</span>}
              {coach.phone && <span className="coach-badge">📞 {coach.phone}</span>}
              <span className="coach-badge" style={{ background: '#fef3c7', color: '#b45309' }}>
                🎓 معلّم معتمد
              </span>
            </div>
          </div>
        </div>

        <div className="coach-actions">
          {onBack && (
            <button type="button" className="btn btn-back" onClick={onBack}>
              🏠 الرئيسية
            </button>
          )}
          <button
            type="button"
            className="btn"
            onClick={loadData}
            style={{ backgroundColor: '#3b82f6', color: 'white' }}
          >
            🔄 تحديث
          </button>
          <button
            type="button"
            className="btn"
            onClick={onLogout}
            style={{ backgroundColor: '#ef4444', color: 'white' }}
          >
            👋 خروج
          </button>
        </div>
      </div>

      {/* QUICK INVITATION BOX */}
      <div className="coach-guide-box">
        <div className="coach-guide-text">
          <h4>💡 كيف يسجّل الطلاب تحت إشرافك؟</h4>
          <p>
            أخبر طلابك باختيار اسمك (<strong>{coach.name}</strong>) في خانة "اسم المدرب" أثناء إنشاء
            حسابهم. ستظهر لك هنا كل بياناتهم ونتائجهم فوراً!
          </p>
        </div>
        <button type="button" className="coach-copy-btn" onClick={handleCopyCoachName}>
          {copied ? '✅ تم النسخ بنجاح!' : '📋 نسخ اسم المدرب'}
        </button>
      </div>

      {/* STATS OVERVIEW */}
      <div className="coach-stats-grid">
        <div className="coach-stat-card blue">
          <div className="coach-stat-icon">👥</div>
          <div className="coach-stat-content">
            <h3>{myStudents.length}</h3>
            <p>الطلاب التابعين لك</p>
          </div>
        </div>

        <div className="coach-stat-card green">
          <div className="coach-stat-icon">📝</div>
          <div className="coach-stat-content">
            <h3>{myResults.length}</h3>
            <p>إجمالي الاختبارات المكتملة</p>
          </div>
        </div>

        <div className="coach-stat-card amber">
          <div className="coach-stat-icon">🏆</div>
          <div className="coach-stat-content">
            <h3>{totalCompetitions}</h3>
            <p>مشاركات المسابقات</p>
          </div>
        </div>

        <div className="coach-stat-card purple">
          <div className="coach-stat-icon">📈</div>
          <div className="coach-stat-content">
            <h3>{avgScore}%</h3>
            <p>متوسط إنجاز الطلبة</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="coach-tabs">
        <button
          type="button"
          className={`coach-tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          👥 قائمة طلبتي ({myStudents.length})
        </button>
        <button
          type="button"
          className={`coach-tab ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          📈 نتائج واختبارات طلبتي ({myResults.length})
        </button>
      </div>

      {/* TAB 1: STUDENTS LIST */}
      {activeTab === 'students' && (
        <div className="coach-table-card">
          <div className="coach-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, color: '#1e3a8a' }}>
              قائمة الطلاب الذين اختاروك كمدرب ({displayedStudents.length})
            </h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="🔍 ابحث عن طالب..."
                className="coach-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="button"
                onClick={handleExportWord}
                style={{
                  background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                  fontSize: '0.88rem',
                }}
              >
                📥 تحميل كشف النقاط (Word)
              </button>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">⏳ جاري تحميل بيانات الطلاب...</div>
          ) : displayedStudents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h4>لا يوجد طلاب مسجلين تحت إشرافك بعد</h4>
              <p>شارك اسمك مع طلابك ليختاروك أثناء التسجيل في المنصة لتتمكن من متابعتهم هنا.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>اسم الطالب</th>
                    <th>العمر</th>
                    <th>البلد</th>
                    <th>تاريخ التسجيل</th>
                    <th>الاختبارات المنجزة</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedStudents.map((student) => {
                    const studentResCount = myResults.filter(
                      (r) =>
                        String(r.userId || r.user_id) === String(student.id) ||
                        (r.userName || r.user_name) === student.name
                    ).length;

                    return (
                      <tr key={student.id}>
                        <td style={{ fontWeight: 800, color: '#1e3a8a' }}>{student.name}</td>
                        <td>{student.age} سنة</td>
                        <td>{student.country || '—'}</td>
                        <td style={{ color: '#64748b' }}>
                          {formatDate(student.joinDate || student.join_date)}
                        </td>
                        <td>
                          <span
                            style={{
                              background: '#eff6ff',
                              color: '#2563eb',
                              padding: '3px 10px',
                              borderRadius: '999px',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                            }}
                          >
                            {studentResCount} اختبار
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentFilter(String(student.id));
                              setActiveTab('results');
                            }}
                            style={{
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                            }}
                          >
                            📊 عرض نتائجه
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RESULTS OF MY STUDENTS ONLY */}
      {activeTab === 'results' && (
        <div className="coach-table-card">
          <div className="coach-filter-bar">
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#1e3a8a' }}>
                📊 كشف نتائج واختبارات طلبتك فقط ({displayedResults.length})
              </h3>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                تظهر هنا نتائج الطلاب المرتبطين بحسابك فقط
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                className="coach-search-input"
                style={{ width: 'auto' }}
                value={selectedStudentFilter}
                onChange={(e) => setSelectedStudentFilter(e.target.value)}
              >
                <option value="all">كل الطلاب ({myStudents.length})</option>
                {myStudents.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleExportWord}
                style={{
                  background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                }}
              >
                📥 تحميل كشف النقاط (Word)
              </button>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">⏳ جاري تحميل النتائج...</div>
          ) : displayedResults.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h4>لا توجد نتائج مسجلة لطلبتك حتى الآن</h4>
              <p>عندما يبدأ طلابك بحل التدريبات أو المشاركة بالمسابقات، ستظهر نتائجهم هنا مباشرة.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>اسم الطالب</th>
                    <th>نوع الاختبار</th>
                    <th>المستوى / الفئة</th>
                    <th>الدرجة</th>
                    <th>النسبة</th>
                    <th>الوقت</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedResults.map((result) => {
                    const isComp = result.isCompetition || result.is_competition;
                    const pct = Math.round((result.score / (result.total || 1)) * 100);
                    return (
                      <tr key={result.id}>
                        <td style={{ fontWeight: 800, color: '#1e3a8a' }}>
                          {result.userName || result.user_name || result.studentName || 'طالب'}
                        </td>
                        <td>
                          <span
                            style={{
                              background: isComp ? '#fef3c7' : '#f1f5f9',
                              color: isComp ? '#b45309' : '#475569',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                            }}
                          >
                            {isComp ? '🏆 مسابقة' : '📝 تدريب'}
                          </span>
                        </td>
                        <td>
                          {result.levelName || result.level_name || '—'}
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginRight: '4px' }}>
                            ({result.categoryName || result.category_name || '—'})
                          </span>
                        </td>
                        <td style={{ fontWeight: 800 }}>
                          {result.score} / {result.total}
                        </td>
                        <td>
                          <span
                            style={{
                              color: pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626',
                              fontWeight: 800,
                            }}
                          >
                            {pct}%
                          </span>
                        </td>
                        <td>{result.timeFormatted || result.time_formatted || '—'}</td>
                        <td style={{ color: '#64748b' }}>
                          {formatDate(result.date || result.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CoachDashboard;
