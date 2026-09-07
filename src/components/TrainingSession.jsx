import React, { useState, useEffect, useRef } from 'react';
import { generateProblem } from '../utils/mathGenerator';
import { buildResultMessage, formatClock, PLATFORM_NAME } from '../utils/resultMessage';
import { syncResult } from '../services/dbSync';

function TrainingSession({ level, currentUser, currentSystem, onComplete, onBack, competition = null }) {
  const [problemIndex, setProblemIndex] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [time, setTime] = useState(0);
  const [feedback, setFeedback] = useState(null); // null | { type: 'correct' | 'wrong', correctAnswer: number }
  const [finalResult, setFinalResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const totalProblems = level.category.config?.count || level.category.operationsCount || 90;
  const maxTimeSeconds = (level.category.durationMinutes || 7) * 60; // 7 minutes = 420s

  useEffect(() => {
    setCurrentProblem(generateProblem(level.category.config));
    const timer = setInterval(() => {
      setTime((t) => {
        const nextTime = t + 1;
        if (nextTime >= maxTimeSeconds) {
          clearInterval(timer);
        }
        return nextTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [level, maxTimeSeconds]);

  // Auto focus input when feedback clears
  useEffect(() => {
    if (!feedback && inputRef.current) {
      inputRef.current.focus();
    }
  }, [feedback, problemIndex]);

  const saveResult = async (finalStats) => {
    const result = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      levelId: level.id,
      levelName: level.name,
      categoryId: level.category.id,
      categoryName: level.category.ageGroup,
      system: currentSystem,
      score: finalStats.correct,
      total: totalProblems,
      timeSeconds: time,
      timeFormatted: formatClock(time),
      date: new Date().toISOString(),
      isCompetition: !!competition,
      competitionId: competition?.id || null,
      competitionTitle: competition?.title || null,
    };
    await syncResult(result);
  };

  const nextProblem = (newStats) => {
    if (problemIndex + 1 < totalProblems) {
      setProblemIndex(prev => prev + 1);
      setCurrentProblem(generateProblem(level.category.config));
      setUserAnswer('');
      setFeedback(null);
    } else {
      saveResult(newStats);
      const timeFormatted = formatClock(time);
      setFinalResult({
        message: buildResultMessage({
          user: currentUser,
          levelName: level.name,
          correct: newStats.correct,
          wrong: newStats.wrong,
          timeFormatted,
        }),
        correct: newStats.correct,
        wrong: newStats.wrong,
        timeFormatted,
      });
    }
  };

  const handleAnswer = (e) => {
    e.preventDefault();
    if (feedback) return; // ignore during feedback display
    if (userAnswer === '' || userAnswer === null) return;

    const parsed = parseInt(userAnswer);
    const isCorrect = parsed === currentProblem.correctAnswer;
    const newStats = {
      correct: stats.correct + (isCorrect ? 1 : 0),
      wrong: stats.wrong + (!isCorrect ? 1 : 0)
    };
    setStats(newStats);

    if (isCorrect) {
      setFeedback({ type: 'correct', correctAnswer: currentProblem.correctAnswer });
      // Move to next problem after very short delay
      setTimeout(() => nextProblem(newStats), 350);
    } else {
      setFeedback({ type: 'wrong', correctAnswer: currentProblem.correctAnswer });
      // Show correct answer for shorter time then move on
      setTimeout(() => nextProblem(newStats), 1200);
    }
  };

  const copyResult = async () => {
    if (!finalResult) return;
    try {
      await navigator.clipboard.writeText(finalResult.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('انسخ النتيجة:', finalResult.message);
    }
  };

  if (finalResult) {
    return (
      <div className="result-overlay fade-in">
        <div className="result-card">
          <img src="/logo.jpg" alt="شعار المنصة" className="result-logo" />
          <h2 className="result-heading">🌟 نتيجة اختبار الحساب الذهني 🌟</h2>
          <p className="result-platform">🏫 منصة {PLATFORM_NAME}</p>

          <div className="result-info">
            <p>👤 <strong>اسم البطل:</strong> {currentUser.name}</p>
            <p>📚 <strong>المستوى:</strong> {level.name}</p>
            <p>🎂 <strong>العمر:</strong> {currentUser.age} سنوات</p>
            <p>🌍 <strong>الدولة:</strong> {currentUser.country?.trim() || '—'}</p>
            <p>👩‍🏫 <strong>اسم المدرب:</strong> {currentUser.coach?.trim() || '—'}</p>
          </div>

          <div className="result-divider">━━━━━━━━━━━━━━━</div>

          <div className="result-scores">
            <p>✅ <strong>الإجابات الصحيحة:</strong> {finalResult.correct}</p>
            <p>❌ <strong>الإجابات الخاطئة:</strong> {finalResult.wrong}</p>
            <p>⏱️ <strong>الوقت المستغرق:</strong> {finalResult.timeFormatted}</p>
          </div>

          <div className="result-divider">━━━━━━━━━━━━━━━</div>
          <p className="result-footer">✨ {PLATFORM_NAME}</p>

          <div className="result-actions">
            <button className="btn btn-gold" onClick={copyResult}>
              {copied ? '✅ تم النسخ' : '📋 نسخ النتيجة'}
            </button>
            <button className="btn btn-primary" onClick={onComplete}>
              متابعة
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProblem) return <div className="fade-in" style={{ textAlign: 'center', padding: '60px', fontSize: '1.4rem', color: 'var(--text-medium)' }}>جاري التحضير...</div>;

  const progressPercent = ((problemIndex + 1) / totalProblems) * 100;
  const accuracy = (stats.correct + stats.wrong) > 0
    ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100)
    : 100;

  return (
    <div className="training-container fade-in">
      {/* Top navbar */}
      <div className="training-navbar">
        <div className="training-navbar-right">
          <img src="/logo.jpg" alt="شعار الأكاديمية" className="training-mini-logo" />
          <div>
            <h3 className="training-nav-title">
              {competition ? `🏆 ${competition.title}` : level.name}
            </h3>
            <span className="training-nav-subtitle">
              {competition
                ? `مسابقة — ${level.category.ageGroup}`
                : `${level.category.ageGroup} — ${currentSystem === 'algerian' ? 'النظام الجزائري' : 'النظام العالمي'}`}
            </span>
          </div>
        </div>

        <div className="training-navbar-left">
          <div className="training-student-pill">
            <span className="student-dot"></span>
            <span>{currentUser.name}</span>
          </div>
          <button className="btn btn-back btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }} onClick={onBack}>
            إنهاء
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="training-progress-track">
        <div className="training-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Main grid: problem + stats */}
      <div className="training-grid">
        {/* Problem board */}
        <div className="training-board-area">
          <div className="problem-board" style={{ position: 'relative' }}>

            {/* Feedback overlay */}
            {feedback && (
              <div className={`problem-feedback-side ${feedback.type}`}>
                <div className="feedback-icon">
                  {feedback.type === 'correct' ? '✅' : '❌'}
                </div>
                {feedback.type === 'wrong' && (
                  <div className="feedback-correct-answer">
                    الإجابة: {feedback.correctAnswer}
                  </div>
                )}
              </div>
            )}

            {currentProblem.isMultiplication ? (
              <div
                style={{
                  fontSize: '3.2rem',
                  fontWeight: 900,
                  color: '#1e3a8a',
                  padding: '30px 10px',
                  direction: 'ltr',
                  textAlign: 'center',
                  letterSpacing: '2px',
                }}
              >
                {currentProblem.text} = ؟
              </div>
            ) : (
              <div className="problem-stack">
                {currentProblem.numbers.map((n, i) => (
                  <div key={i} className="problem-line">
                    <span className="op-sign">{n.sign < 0 ? '−' : (i > 0 ? '+' : '')}</span>
                    <span className="op-val">{n.val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Answer — submit on Enter */}
            <form onSubmit={handleAnswer} className="answer-form">
              <input
                ref={inputRef}
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAnswer(e); }}
                autoFocus
                disabled={!!feedback}
                className={`form-input training-input${feedback ? (feedback.type === 'correct' ? ' input-correct' : ' input-wrong') : ''}`}
                placeholder="اكتب الناتج..."
                style={{ marginBottom: 0 }}
              />
              <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-medium)', textAlign: 'center' }}>
                اضغط <strong>Enter</strong> لتأكيد الإجابة
              </p>
            </form>
          </div>
        </div>

        {/* Stats Sidebar */}
        <aside className="training-stats-sidebar">
          <div className="stat-box timer-box">
            <span className="stat-box-label">⏱️ الوقت المستغرق</span>
            <span className="stat-box-val timer-val">{formatClock(time)}</span>
            <span style={{ fontSize: '0.75rem', marginTop: '4px', color: time >= maxTimeSeconds - 60 ? '#ef4444' : '#64748b' }}>
              متبقي من 07 دقائق: {formatClock(Math.max(0, maxTimeSeconds - time))}
            </span>
          </div>

          <div className="stat-box">
            <span className="stat-box-label">التقدم</span>
            <span className="stat-box-val" style={{ color: 'var(--primary-color)' }}>
              {problemIndex + 1} <small style={{ fontSize: '0.85rem', color: '#888' }}>/ {totalProblems}</small>
            </span>
          </div>

          <div className="stats-row-dual">
            <div className="stat-box compact">
              <span className="stat-box-label">صحيح</span>
              <span className="stat-box-val" style={{ color: 'var(--success-color)' }}>{stats.correct}</span>
            </div>
            <div className="stat-box compact">
              <span className="stat-box-label">خطأ</span>
              <span className="stat-box-val" style={{ color: 'var(--error-color)' }}>{stats.wrong}</span>
            </div>
          </div>

          <div className="stat-box">
            <span className="stat-box-label">الدقة الحالية</span>
            <div className="accuracy-meter">
              <div
                className="accuracy-fill"
                style={{
                  width: `${accuracy}%`,
                  backgroundColor: accuracy >= 80 ? 'var(--success-color)' : (accuracy >= 50 ? 'var(--accent-color)' : 'var(--error-color)')
                }}
              />
            </div>
            <span className="accuracy-val">{accuracy}%</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default TrainingSession;
