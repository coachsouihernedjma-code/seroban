import React, { useState, useEffect } from 'react';
import { syncStudent, fetchStudents, fetchCoaches, syncCoach } from '../services/dbSync';
import { getEligibleCategoriesForYear, getDefaultLevelForYear } from '../data/levels';

const BIRTH_YEARS = [
  2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008
];

function Login({ onLogin, onCoachLogin, onBack, initialRole = 'student', initialStudentMode = 'login' }) {
  const [role, setRole] = useState(initialRole); // 'student' | 'coach'
  const [studentAuthMode, setStudentAuthMode] = useState(initialStudentMode); // 'login' | 'register'
  const [coachAuthMode, setCoachAuthMode] = useState('login'); // 'login' | 'register'

  // Student Register State
  const [name, setName] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [birthYear, setBirthYear] = useState('2020');
  const [selectedLevelId, setSelectedLevelId] = useState('prep');
  const [country, setCountry] = useState('الجزائر');
  const [coach, setCoach] = useState('');
  const [customCoach, setCustomCoach] = useState(false);
  const [availableCoaches, setAvailableCoaches] = useState([]);

  // Student Login State
  const [studentLoginName, setStudentLoginName] = useState('');
  const [studentLoginPassword, setStudentLoginPassword] = useState('');

  // Coach State
  const [coachName, setCoachName] = useState('');
  const [coachPhone, setCoachPhone] = useState('');
  const [coachEmail, setCoachEmail] = useState('');
  const [coachPassword, setCoachPassword] = useState('');
  const [coachSchool, setCoachSchool] = useState('');
  const [coachCountry, setCoachCountry] = useState('');

  // Coach Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Shared State
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load registered coaches for student dropdown
    fetchCoaches().then((coachesList) => {
      if (Array.isArray(coachesList)) {
        setAvailableCoaches(coachesList);
      }
    });
  }, []);

  // Compute eligible levels for chosen birth year
  const eligibleLevels = React.useMemo(() => {
    return getEligibleCategoriesForYear(Number(birthYear));
  }, [birthYear]);

  // When birthYear changes, update selectedLevelId to default
  useEffect(() => {
    const def = getDefaultLevelForYear(Number(birthYear));
    if (def) {
      setSelectedLevelId(def.levelId);
    }
  }, [birthYear]);

  // Current active level object
  const activeLevelObj = React.useMemo(() => {
    const found = eligibleLevels.find((l) => l.levelId === selectedLevelId);
    return found || eligibleLevels[0] || getDefaultLevelForYear(Number(birthYear));
  }, [eligibleLevels, selectedLevelId, birthYear]);

  // Handle Student Register (Create personal account with password)
  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name.trim()) {
      setErrorMessage('يرجى إدخال اسم الطالب الكامل');
      return;
    }
    if (!studentPassword) {
      setErrorMessage('يرجى تعيين كلمة مرور لحماية حساب الطالب');
      return;
    }

    setLoading(true);
    const calculatedAge = 2026 - Number(birthYear);

    const user = {
      id: Date.now().toString(),
      name: name.trim(),
      password: studentPassword,
      birthYear: Number(birthYear),
      age: calculatedAge,
      country: country.trim() || '',
      coach: coach.trim() || '',
      levelId: activeLevelObj?.levelId || 'prep',
      levelName: activeLevelObj?.levelName || 'المستوى التحضيري',
      categoryId: activeLevelObj?.category?.id || 'prep-1',
      categoryName: activeLevelObj?.category?.ageGroup || 'مواليد (2019-2020-2021)',
      joinDate: new Date().toISOString(),
    };

    const users = JSON.parse(localStorage.getItem('soroban_users') || '[]');
    const existingIndex = users.findIndex((u) => u.name.trim().toLowerCase() === user.name.toLowerCase());

    let finalUser = user;
    if (existingIndex >= 0) {
      finalUser = {
        ...users[existingIndex],
        password: user.password,
        birthYear: user.birthYear,
        age: user.age,
        country: user.country,
        coach: user.coach,
        levelId: user.levelId,
        levelName: user.levelName,
        categoryId: user.categoryId,
        categoryName: user.categoryName,
      };
      users[existingIndex] = finalUser;
    } else {
      users.unshift(user);
    }

    localStorage.setItem('soroban_users', JSON.stringify(users));
    await syncStudent(finalUser);
    setLoading(false);
    onLogin(finalUser);
  };

  // Handle Student Login (Authenticate with name & password)
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!studentLoginName.trim() || !studentLoginPassword) {
      setErrorMessage('يرجى إدخال اسم الطالب وكلمة المرور');
      return;
    }

    setLoading(true);
    // Fetch local and remote students
    const localUsers = JSON.parse(localStorage.getItem('soroban_users') || '[]');
    const dbStudents = await fetchStudents();
    setLoading(false);

    const allStudents = Array.isArray(dbStudents) && dbStudents.length > 0 ? dbStudents : localUsers;
    const targetName = studentLoginName.trim().toLowerCase();

    // Find student by exact name or matching identifier
    const found = allStudents.find((s) => (s.name || '').trim().toLowerCase() === targetName);

    if (!found) {
      setErrorMessage('لم يتم العثور على حساب بهذا الاسم. يمكنك إنشاء حساب جديد بالضغط على تبويب "إنشاء حساب بطل جديد".');
      return;
    }

    // Verify password if set
    if (found.password && found.password !== studentLoginPassword) {
      setErrorMessage('كلمة المرور غير صحيحة، يرجى التأكد وإعادة المحاولة.');
      return;
    }

    // If student had no password (legacy account), update with this password
    if (!found.password) {
      found.password = studentLoginPassword;
      const users = JSON.parse(localStorage.getItem('soroban_users') || '[]');
      const idx = users.findIndex((u) => u.id === found.id || u.name === found.name);
      if (idx >= 0) users[idx].password = studentLoginPassword;
      else users.push(found);
      localStorage.setItem('soroban_users', JSON.stringify(users));
      await syncStudent(found);
    }

    onLogin(found);
  };

  // Handle Coach Register
  const handleCoachRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!coachName.trim() || !coachPassword) {
      setErrorMessage('يرجى كتابة الاسم وكلمة المرور');
      return;
    }

    setLoading(true);
    const newCoach = {
      id: Date.now().toString(),
      name: coachName.trim(),
      phone: coachPhone.trim(),
      email: coachEmail.trim(),
      password: coachPassword,
      schoolName: coachSchool.trim(),
      country: coachCountry.trim(),
      createdAt: new Date().toISOString(),
    };

    const res = await syncCoach(newCoach);
    setLoading(false);

    if (res.ok) {
      onCoachLogin(newCoach);
    } else {
      setErrorMessage(res.error || 'تعذّر إنشاء حساب المعلم، يرجى المحاولة لاحقاً');
    }
  };

  // Handle Coach Login
  const handleCoachLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMessage('يرجى إدخال اسم المعلم/الهاتف وكلمة المرور');
      return;
    }

    setLoading(true);
    const coaches = await fetchCoaches();
    setLoading(false);

    const identifier = loginIdentifier.trim().toLowerCase();
    const found = (coaches || []).find((c) => {
      const matchName = c.name && c.name.toLowerCase() === identifier;
      const matchPhone = c.phone && c.phone.trim() === loginIdentifier.trim();
      const matchEmail = c.email && c.email.toLowerCase() === identifier;
      return matchName || matchPhone || matchEmail;
    });

    if (!found) {
      setErrorMessage('لم يتم العثور على حساب بهذا الاسم أو الهاتف. يمكنك إنشاء حساب جديد.');
      return;
    }

    if (found.password && found.password !== loginPassword) {
      setErrorMessage('كلمة المرور غير صحيحة، يرجى التأكد وإعادة المحاولة.');
      return;
    }

    onCoachLogin(found);
  };

  return (
    <div className="login-page fade-in">
      {onBack && (
        <div style={{ width: '100%', maxWidth: '520px', marginBottom: '14px', display: 'flex', justifyContent: 'flex-start' }}>
          <button
            type="button"
            className="btn btn-back"
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '999px',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              fontWeight: 800,
              color: '#334155',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            ↩️ العودة للصفحة الرئيسية
          </button>
        </div>
      )}

      {/* PORTAL SWITCH TABS (Student vs Coach) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          width: '100%',
          maxWidth: '520px',
          background: '#f1f5f9',
          padding: '6px',
          borderRadius: '16px',
          marginBottom: '16px',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setRole('student');
            setErrorMessage('');
          }}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: role === 'student' ? '#1e3a8a' : 'transparent',
            color: role === 'student' ? '#ffffff' : '#64748b',
            boxShadow: role === 'student' ? '0 4px 12px rgba(30, 58, 138, 0.2)' : 'none',
          }}
        >
          🎓 فضاء الأبطال (الطلاب)
        </button>

        <button
          type="button"
          onClick={() => {
            setRole('coach');
            setErrorMessage('');
          }}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: role === 'coach' ? '#1e3a8a' : 'transparent',
            color: role === 'coach' ? '#ffffff' : '#64748b',
            boxShadow: role === 'coach' ? '0 4px 12px rgba(30, 58, 138, 0.2)' : 'none',
          }}
        >
          👨‍🏫 فضاء المعلمين
        </button>
      </div>

      {/* STUDENT SECTION */}
      {role === 'student' && (
        <div style={{ width: '100%', maxWidth: '520px' }}>
          <div className="login-hero" style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src="/logo.jpg"
              alt="شعار الأكاديمية"
              className="home-logo"
              style={{ width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover', animation: 'none', marginBottom: '8px', border: '2.5px solid #3b82f6' }}
            />
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <span style={{ display: 'block', fontSize: '1.3rem', fontWeight: 900, color: '#1e3a8a' }}>فريق موجة البحر</span>
              <span style={{ display: 'block', fontSize: '1rem', fontWeight: 800, color: '#f59e0b' }}>سويهر نجمة</span>
            </div>
            <h2 className="login-title" style={{ fontSize: '1.45rem', margin: '4px 0' }}>
              {studentAuthMode === 'login' ? '🔑 دخول بطل السوروبان' : '✨ إنشاء حساب بطل جديد'}
            </h2>
            <p className="login-subtitle">
              {studentAuthMode === 'login'
                ? 'أدخل اسمك وكلمة المرور الخاصة بك للوصول لنتائجك ومستواك الشخصي'
                : 'أنشئ حسابك المحمي بكلمة سر وانطلق نحو ساحة التدريب والبطولة'}
            </p>
          </div>

          {/* Student Sub-tabs: Login vs Register */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '18px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setStudentAuthMode('login');
                setErrorMessage('');
              }}
              style={{
                padding: '8px 22px',
                borderRadius: '999px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                background: studentAuthMode === 'login' ? '#2563eb' : '#e2e8f0',
                color: studentAuthMode === 'login' ? '#ffffff' : '#475569',
                boxShadow: studentAuthMode === 'login' ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              🔑 تسجيل الدخول
            </button>

            <button
              type="button"
              onClick={() => {
                setStudentAuthMode('register');
                setErrorMessage('');
              }}
              style={{
                padding: '8px 22px',
                borderRadius: '999px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                background: studentAuthMode === 'register' ? '#10b981' : '#e2e8f0',
                color: studentAuthMode === 'register' ? '#ffffff' : '#475569',
                boxShadow: studentAuthMode === 'register' ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              ✨ إنشاء حساب جديد
            </button>
          </div>

          {errorMessage && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '16px',
                fontSize: '0.9rem',
                fontWeight: 700,
                textAlign: 'center',
                border: '1px solid #fecaca',
              }}
            >
              ⚠️ {errorMessage}
            </div>
          )}

          {/* STUDENT LOGIN FORM */}
          {studentAuthMode === 'login' ? (
            <form onSubmit={handleStudentLogin} className="login-form" style={{ maxWidth: '100%' }}>
              <div className="form-group">
                <label className="form-label">👤 اسم الطالب / البطل الكامل</label>
                <input
                  type="text"
                  className="form-input"
                  value={studentLoginName}
                  onChange={(e) => setStudentLoginName(e.target.value)}
                  placeholder="اكتب اسمك المسجل..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">🔒 كلمة المرور الخاصة بحسابك</label>
                <input
                  type="password"
                  className="form-input"
                  value={studentLoginPassword}
                  onChange={(e) => setStudentLoginPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور..."
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                }}
              >
                {loading ? '⏳ جاري التحقق...' : '🔑 دخول إلى حسابي'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '14px' }}>
                <span style={{ fontSize: '0.88rem', color: '#64748b' }}>ليس لديك حساب بعد؟ </span>
                <button
                  type="button"
                  onClick={() => {
                    setStudentAuthMode('register');
                    setErrorMessage('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    textDecoration: 'underline',
                  }}
                >
                  أنشئ حسابك الآن مجاناً
                </button>
              </div>
            </form>
          ) : (
            /* STUDENT REGISTER FORM */
            <form onSubmit={handleStudentRegister} className="login-form" style={{ maxWidth: '100%' }}>
              {/* Student Name */}
              <div className="form-group">
                <label className="form-label">👤 اسم الطالب / البطل الكامل</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: يوسف بن أحمد"
                  required
                />
              </div>

              {/* Student Password */}
              <div className="form-group">
                <label className="form-label">🔒 كلمة مرور لحماية حسابك الشخصي</label>
                <input
                  type="password"
                  className="form-input"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  placeholder="أنشئ كلمة مرور خاصة بك (مثال: 1234 أو كود سري)..."
                  required
                />
                <small style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', marginTop: '4px' }}>
                  ستحتاج هذه الكلمة لتسجيل الدخول لاحقاً وحماية نقاطك ونتائجك
                </small>
              </div>

              {/* Birth Year & Age row */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 1.2 }}>
                  <label className="form-label">🎂 سنة الميلاد (حسب شهادة الميلاد)</label>
                  <select
                    className="form-input"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    style={{ fontWeight: 700, color: '#1e3a8a' }}
                    required
                  >
                    {BIRTH_YEARS.map((y) => (
                      <option key={y} value={y}>
                        سنة {y} {y >= 2019 ? '(تحضيري)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ flex: 0.8 }}>
                  <label className="form-label">العمر المحسوب</label>
                  <div
                    style={{
                      padding: '12px',
                      background: '#f1f5f9',
                      borderRadius: '12px',
                      fontWeight: 800,
                      color: '#0f172a',
                      textAlign: 'center',
                      border: '1.5px solid #e2e8f0',
                    }}
                  >
                    {2026 - Number(birthYear)} سنوات
                  </div>
                </div>
              </div>

              {/* Level selection if multiple levels exist for this year */}
              {eligibleLevels.length > 1 && (
                <div className="form-group">
                  <label className="form-label">🎯 اختر مستواك الدراسي في السوروبان</label>
                  <select
                    className="form-input"
                    value={selectedLevelId}
                    onChange={(e) => setSelectedLevelId(e.target.value)}
                    style={{ fontWeight: 700, borderColor: '#3b82f6' }}
                  >
                    {eligibleLevels.map((lvl) => (
                      <option key={lvl.levelId} value={lvl.levelId}>
                        {lvl.levelName} — {lvl.category.ageGroup}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* LIVE LEVEL BADGE & PREVIEW (Matches Competition Technical Card) */}
              {activeLevelObj && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    border: '2px solid #86efac',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    marginBottom: '16px',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#166534', background: '#bbf7d0', padding: '3px 10px', borderRadius: '999px' }}>
                      🏆 مستواك المعتمد في البطولة الوطنية
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d' }}>
                      {activeLevelObj.category.ageGroup}
                    </span>
                  </div>

                  <h4 style={{ margin: '4px 0 8px 0', fontSize: '1.15rem', color: '#14532d', fontWeight: 800 }}>
                    {activeLevelObj.levelName}
                  </h4>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '8px',
                      fontSize: '0.83rem',
                      color: '#1e293b',
                    }}
                  >
                    <div style={{ background: '#ffffff', padding: '6px 10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      📝 <strong>العمليات:</strong> {activeLevelObj.category.operationsCount} عملية
                    </div>
                    <div style={{ background: '#ffffff', padding: '6px 10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      📊 <strong>الجداول:</strong> {activeLevelObj.category.tablesSummary}
                    </div>
                    <div style={{ background: '#ffffff', padding: '6px 10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      🏢 <strong>الطوابق:</strong> {activeLevelObj.category.floorsText}
                    </div>
                    <div style={{ background: '#ffffff', padding: '6px 10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      ⏱️ <strong>التوقيت:</strong> {activeLevelObj.category.durationText}
                    </div>
                  </div>
                </div>
              )}

              {/* Wilaya & Coach */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">🌍 البلد / الولاية</label>
                  <input
                    type="text"
                    className="form-input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="مثال: الجزائر - درارية"
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">👨‍🏫 اسم المدرب / المعلم</label>
                  {availableCoaches.length > 0 && !customCoach ? (
                    <select
                      className="form-input"
                      value={coach}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setCustomCoach(true);
                          setCoach('');
                        } else {
                          setCoach(e.target.value);
                        }
                      }}
                    >
                      <option value="">-- اختر مدربك --</option>
                      {availableCoaches.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                      <option value="__custom__">✍️ كتابة يدوية...</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-input"
                      value={coach}
                      onChange={(e) => setCoach(e.target.value)}
                      placeholder="اسم المدرب أو النادي..."
                    />
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-play login-btn"
                disabled={loading}
                style={{
                  fontSize: '1.1rem',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                }}
              >
                {loading ? '⏳ جاري إنشاء الحساب...' : '🚀 إنشاء الحساب والانطلاق للتدريب'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '14px' }}>
                <span style={{ fontSize: '0.88rem', color: '#64748b' }}>لديك حساب بالفعل؟ </span>
                <button
                  type="button"
                  onClick={() => {
                    setStudentAuthMode('login');
                    setErrorMessage('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    textDecoration: 'underline',
                  }}
                >
                  تسجيل الدخول إلى حسابك
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* COACH SECTION */}
      {role === 'coach' && (
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <div className="login-hero" style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>👨‍🏫</div>
            <h2 className="login-title">بوابة المعلمين والمدربين</h2>
            <p className="login-subtitle">
              تابع تقدم طلابك واطلع على نتائجهم وكشوف نقاطهم بدقة.
            </p>
          </div>

          {/* Coach Sub-tabs */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setCoachAuthMode('login');
                setErrorMessage('');
              }}
              style={{
                padding: '8px 20px',
                borderRadius: '999px',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                background: coachAuthMode === 'login' ? '#3b82f6' : '#e2e8f0',
                color: coachAuthMode === 'login' ? 'white' : '#475569',
              }}
            >
              🔑 تسجيل الدخول
            </button>

            <button
              type="button"
              onClick={() => {
                setCoachAuthMode('register');
                setErrorMessage('');
              }}
              style={{
                padding: '8px 20px',
                borderRadius: '999px',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                background: coachAuthMode === 'register' ? '#3b82f6' : '#e2e8f0',
                color: coachAuthMode === 'register' ? 'white' : '#475569',
              }}
            >
              ✨ إنشاء حساب معلم جديد
            </button>
          </div>

          {errorMessage && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '16px',
                fontSize: '0.9rem',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Coach Login Mode */}
          {coachAuthMode === 'login' ? (
            <form onSubmit={handleCoachLogin} className="login-form">
              <div className="form-group">
                <label className="form-label">👤 اسم المعلم أو رقم الهاتف</label>
                <input
                  type="text"
                  className="form-input"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="مثال: أ. أحمد بن علي أو 0555..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">🔒 كلمة المرور</label>
                <input
                  type="password"
                  className="form-input"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '1.05rem', fontWeight: 800 }}
                disabled={loading}
              >
                {loading ? '⏳ جاري التحقق...' : '👨‍🏫 دخول لوحة المعلم'}
              </button>
            </form>
          ) : (
            /* Coach Register Mode */
            <form onSubmit={handleCoachRegister} className="login-form">
              <div className="form-group">
                <label className="form-label">👤 اسم المعلم / المدرب الكامل</label>
                <input
                  type="text"
                  className="form-input"
                  value={coachName}
                  onChange={(e) => setCoachName(e.target.value)}
                  placeholder="مثال: الأستاذ محمد قدور"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">📞 رقم الهاتف / الواتساب</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={coachPhone}
                    onChange={(e) => setCoachPhone(e.target.value)}
                    placeholder="مثال: 0661234567"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">✉️ البريد الإلكتروني (اختياري)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={coachEmail}
                    onChange={(e) => setCoachEmail(e.target.value)}
                    placeholder="teacher@example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">🏫 اسم الأكاديمية / النادي / المدرسة</label>
                  <input
                    type="text"
                    className="form-input"
                    value={coachSchool}
                    onChange={(e) => setCoachSchool(e.target.value)}
                    placeholder="مثال: أكاديمية العباقرة"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">📍 الدولة / الولاية</label>
                  <input
                    type="text"
                    className="form-input"
                    value={coachCountry}
                    onChange={(e) => setCoachCountry(e.target.value)}
                    placeholder="مثال: الجزائر - وهران"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">🔒 كلمة المرور للحساب</label>
                <input
                  type="password"
                  className="form-input"
                  value={coachPassword}
                  onChange={(e) => setCoachPassword(e.target.value)}
                  placeholder="أنشئ كلمة مرور لحسابك"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '1.05rem', fontWeight: 800 }}
                disabled={loading}
              >
                {loading ? '⏳ جاري إنشاء الحساب...' : '✨ إنشاء حساب المعلم'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default Login;