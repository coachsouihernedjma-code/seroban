import React, { useState, useEffect } from 'react';
import { syncStudent, fetchCoaches, syncCoach } from '../services/dbSync';

function Login({ onLogin, onCoachLogin, onBack, initialRole = 'student' }) {
  const [role, setRole] = useState(initialRole); // 'student' | 'coach'
  const [coachAuthMode, setCoachAuthMode] = useState('login'); // 'login' | 'register'

  // Student State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
  const [coach, setCoach] = useState('');
  const [customCoach, setCustomCoach] = useState(false);
  const [availableCoaches, setAvailableCoaches] = useState([]);

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

  // Handle Student Submit
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !age) return;

    setLoading(true);
    const user = {
      id: Date.now().toString(),
      name: name.trim(),
      age: parseInt(age),
      country: country.trim() || '',
      coach: coach.trim() || '',
      joinDate: new Date().toISOString(),
    };

    const users = JSON.parse(localStorage.getItem('soroban_users') || '[]');
    const existingUser = users.find((u) => u.name === user.name);

    const finalUser = existingUser
      ? {
          ...existingUser,
          age: user.age,
          country: user.country,
          coach: user.coach,
        }
      : user;

    await syncStudent(finalUser);
    setLoading(false);
    onLogin(finalUser);
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
        <div style={{ width: '100%', maxWidth: '480px', marginBottom: '14px', display: 'flex', justifyContent: 'flex-start' }}>
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

      {/* PORTAL SWITCH TABS */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          width: '100%',
          maxWidth: '480px',
          background: '#f1f5f9',
          padding: '6px',
          borderRadius: '16px',
          marginBottom: '20px',
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
          🎓 حساب طالب
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
          👨‍🏫 حساب معلّم / مدرّب
        </button>
      </div>

      {/* STUDENT FORM */}
      {role === 'student' && (
        <>
          <div className="login-hero">
            <img
              src="/logo.jpg"
              alt="شعار الأكاديمية"
              className="home-logo"
              style={{ width: '100px', height: '100px', animation: 'none', marginBottom: '12px' }}
            />
            <h2 className="login-title">🏅 تسجيل بيانات البطل</h2>
            <p className="login-subtitle">أدخل بياناتك وانطلق نحو ساحة الإبداع والحساب الذهني!</p>
          </div>

          <form onSubmit={handleStudentSubmit} className="login-form" style={{ maxWidth: '480px' }}>
            <div className="form-group">
              <label className="form-label">👤 اسم الطالب الكامل</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اكتب اسمك هنا..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">🎂 العمر</label>
                <input
                  type="number"
                  className="form-input"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="مثال: 9"
                  min="4"
                  max="20"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">🌍 البلد / الولاية</label>
                <input
                  type="text"
                  className="form-input"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="مثال: الجزائر"
                />
              </div>
            </div>

            {/* Coach Selection */}
            <div className="form-group">
              <label className="form-label">
                🎓 اسم المعلم / المدرب المعتمد
                <span style={{ color: 'var(--text-medium)', fontWeight: 500, fontSize: '0.85rem' }}>
                  {' '}(لتصل نتائجك لمدربك)
                </span>
              </label>

              {availableCoaches.length > 0 && !customCoach ? (
                <div>
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
                    <option value="">-- اختر مدربك من القائمة --</option>
                    {availableCoaches.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} {c.schoolName || c.school_name ? `(${c.schoolName || c.school_name})` : ''}
                      </option>
                    ))}
                    <option value="__custom__">✍️ مدرب آخر (كتابة يدوية)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={coach}
                      onChange={(e) => setCoach(e.target.value)}
                      placeholder="اكتب اسم المدرب/المدربة..."
                    />
                    {availableCoaches.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setCustomCoach(false)}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          padding: '0 12px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        القائمة
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-play login-btn" disabled={loading}>
              {loading ? '⏳ جاري الحفظ...' : '🚀 انطلق للتدريب'}
            </button>
          </form>
        </>
      )}

      {/* COACH FORM */}
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