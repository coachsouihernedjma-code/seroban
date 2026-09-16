import React, { useState, useEffect, useRef } from 'react';
import { generateProblem, resetPool, getProblemCount } from '../utils/mathGenerator';
import { buildResultMessage, formatClock, formatTimeInArabic, PLATFORM_NAME } from '../utils/resultMessage';
import { syncResult } from '../services/dbSync';

// Sound effect for celebration
function playCelebrationFanfare() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.14 }, // C5
      { freq: 659.25, time: 0.14, dur: 0.14 }, // E5
      { freq: 783.99, time: 0.28, dur: 0.16 }, // G5
      { freq: 1046.50, time: 0.44, dur: 0.55 }, // C6
    ];
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = n.freq;
      gain.gain.setValueAtTime(0.001, ctx.currentTime + n.time);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + n.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.time + n.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + n.time);
      osc.stop(ctx.currentTime + n.time + n.dur + 0.05);
    });
  } catch {
    // Audio might be blocked by browser autoplay policy; fallback quietly
  }
}

// Canvas Confetti & Shapes Animation Component
function ConfettiCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#ffd700', '#06b6d4'];
    const particles = [];
    const count = 130;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 260,
        y: height / 2 - 80 + (Math.random() - 0.5) * 120,
        vx: (Math.random() - 0.5) * 20,
        vy: -Math.random() * 15 - 5,
        size: Math.random() * 9 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 14,
        shape: Math.random() > 0.4 ? 'rect' : (Math.random() > 0.5 ? 'circle' : 'star'),
        gravity: 0.32,
      });
    }

    const startTime = Date.now();
    const duration = 4800; // 4.8 seconds

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.vRot;
        p.vx *= 0.985;

        const fade = Math.max(0, 1 - (elapsed / duration));
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'star') {
          ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            ctx.lineTo(Math.cos(((18 + s * 72) * Math.PI) / 180) * p.size, -Math.sin(((18 + s * 72) * Math.PI) / 180) * p.size);
            ctx.lineTo(Math.cos(((54 + s * 72) * Math.PI) / 180) * (p.size / 2), -Math.sin(((54 + s * 72) * Math.PI) / 180) * (p.size / 2));
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, (p.size * 2) / 3);
        }

        ctx.restore();
      });

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}

function TrainingSession({ level, currentUser, currentSystem, onComplete, onBack, competition = null }) {
  const [problemIndex, setProblemIndex] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [time, setTime] = useState(0);
  const [feedback, setFeedback] = useState(null); // null | { type: 'correct' | 'wrong', correctAnswer: number }
  const [finalResult, setFinalResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const timeRef = useRef(0);
  const statsRef = useRef({ correct: 0, wrong: 0 });
  const isFinishedRef = useRef(false);

  const categoryConfig = {
    ...level.category.config,
    categoryId: level.category.config?.categoryId || level.category.id,
    tables: level.category.tables,
  };

  // The session always runs the official operation count from levels.js. When a
  // category's PDF holds fewer problems than that (prep, l1-1, l1-2), the pool
  // reshuffles and replays to fill the remainder — see mathGenerator.
  const availableProblems = getProblemCount(categoryConfig.categoryId);
  const totalProblems = level.category.config?.count || level.category.operationsCount || 90;
  // Maximum time is 7 minutes (420 seconds) as standard
  const maxTimeSeconds = (level.category.durationMinutes || 7) * 60;

  // Sync refs with state
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  // Clean finish function: stops timer immediately and builds result
  const finishSession = (finalStats, finalTimeSeconds, reason = 'completed') => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;

    // Clear timer immediately so it doesn't keep running
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const elapsed = Math.min(finalTimeSeconds, maxTimeSeconds);
    const timeFormatted = formatClock(elapsed);
    const timeArabic = formatTimeInArabic(elapsed);
    const finishedEarly = elapsed < maxTimeSeconds;

    saveResult(finalStats, elapsed);

    const displayLevelName = level.category?.fullName || level.name;

    setFinalResult({
      message: buildResultMessage({
        user: currentUser,
        levelName: displayLevelName,
        correct: finalStats.correct,
        wrong: finalStats.wrong,
        timeFormatted,
        timeSeconds: elapsed,
      }),
      correct: finalStats.correct,
      wrong: finalStats.wrong,
      timeFormatted,
      timeArabic,
      timeSeconds: elapsed,
      finishedEarly,
      reason,
      totalAnswered: finalStats.correct + finalStats.wrong,
    });

    // Launch celebration audio
    playCelebrationFanfare();
  };

  useEffect(() => {
    // Reset the PDF problem pool so each session starts fresh
    const categoryId = categoryConfig.categoryId;
    if (categoryId) resetPool(categoryId);
    setCurrentProblem(generateProblem(categoryConfig));

    // Start timer with automatic stop at 7 minutes maximum
    timerRef.current = setInterval(() => {
      setTime((t) => {
        const nextTime = t + 1;
        timeRef.current = nextTime;
        if (nextTime >= maxTimeSeconds) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          // Finish automatically when 7 minutes expire
          finishSession(statsRef.current, maxTimeSeconds, 'time_up');
          return maxTimeSeconds;
        }
        return nextTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [level, maxTimeSeconds]);

  // Auto focus input when feedback clears
  useEffect(() => {
    if (!feedback && inputRef.current && !finalResult && !showConfirmSubmit) {
      inputRef.current.focus();
    }
  }, [feedback, problemIndex, finalResult, showConfirmSubmit]);

  const saveResult = async (finalStats, finalTimeSeconds) => {
    const result = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      levelId: level.id,
      levelName: level.category?.fullName || level.name,
      categoryId: level.category.id,
      categoryName: level.category.ageGroup,
      system: currentSystem,
      score: finalStats.correct,
      total: totalProblems,
      timeSeconds: finalTimeSeconds,
      timeFormatted: formatClock(finalTimeSeconds),
      date: new Date().toISOString(),
      isCompetition: !!competition,
      competitionId: competition?.id || null,
      competitionTitle: competition?.title || null,
    };
    await syncResult(result);
  };

  const nextProblem = (newStats) => {
    if (problemIndex + 1 < totalProblems) {
      setProblemIndex((prev) => prev + 1);
      setCurrentProblem(generateProblem(categoryConfig));
      setUserAnswer('');
      setFeedback(null);
    } else {
      // Completed all operations! Finish immediately without waiting
      finishSession(newStats, timeRef.current, 'completed_all');
    }
  };

  const handleAnswer = (e) => {
    e.preventDefault();
    if (feedback || isFinishedRef.current) return;
    if (userAnswer === '' || userAnswer === null) return;

    const parsed = parseInt(userAnswer, 10);
    const isCorrect = parsed === currentProblem.correctAnswer;
    const newStats = {
      correct: stats.correct + (isCorrect ? 1 : 0),
      wrong: stats.wrong + (!isCorrect ? 1 : 0),
    };
    setStats(newStats);
    statsRef.current = newStats;

    if (isCorrect) {
      setFeedback({ type: 'correct', correctAnswer: currentProblem.correctAnswer });
      setTimeout(() => nextProblem(newStats), 350);
    } else {
      setFeedback({ type: 'wrong', correctAnswer: currentProblem.correctAnswer });
      setTimeout(() => nextProblem(newStats), 1100);
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

  // If session finished, display celebratory result screen
  if (finalResult) {
    const accuracy =
      finalResult.correct + finalResult.wrong > 0
        ? Math.round((finalResult.correct / (finalResult.correct + finalResult.wrong)) * 100)
        : 100;

    return (
      <div className="result-overlay fade-in">
        {/* Animated Celebration Confetti & Shapes */}
        <ConfettiCanvas />

        {/* Floating background decorative celebration shapes */}
        <div className="floating-celebration-shapes">
          <span className="float-shape shape-star-1">⭐</span>
          <span className="float-shape shape-star-2">✨</span>
          <span className="float-shape shape-balloon-1">🎈</span>
          <span className="float-shape shape-balloon-2">🎉</span>
          <span className="float-shape shape-trophy">🏆</span>
          <span className="float-shape shape-medal">🥇</span>
          <span className="float-shape shape-sparkle">🌟</span>
        </div>

        <div className="result-card celebratory-card">
          {/* Top Hero Celebration Badge */}
          <div className="celebration-hero-banner">
            <div className="celebration-trophy-badge">
              <span className="trophy-emoji">🏆</span>
              <span className="sparkle-top-right">✨</span>
              <span className="sparkle-bottom-left">⭐</span>
            </div>

            <h2 className="celebration-hero-title">
              أحسنت يا بطل! 🌟
            </h2>

            <div className="celebration-hero-time-box">
              <span className="time-box-icon">⏱️</span>
              <span className="time-box-text">
                لقد أنهيت العمليات في <strong>{finalResult.timeArabic}</strong> ({finalResult.timeFormatted})
              </span>
            </div>

            {finalResult.finishedEarly ? (
              <div className="celebration-speed-pill">
                ⚡ سرعة فائقة! أنهيت العمليات بنجاح قبل نهاية الوقت (7 دقائق)
              </div>
            ) : (
              <div className="celebration-speed-pill time-up-pill">
                ⌛ أتممت التحدي مع انتهاء وقت الـ 7 دقائق كحد أقصى!
              </div>
            )}
          </div>

          <img src="/logo.jpg" alt="شعار المنصة" className="result-logo" />
          <h3 className="result-heading">🌟 نتيجة اختبار الحساب الذهني 🌟</h3>
          <p className="result-platform">🏫 منصة {PLATFORM_NAME}</p>

          <div className="result-info">
            <p>👤 <strong>اسم البطل:</strong> {currentUser.name}</p>
            <p>📚 <strong>المستوى:</strong> {level.category?.fullName || level.name}</p>
            <p>🎂 <strong>العمر:</strong> {currentUser.age} سنوات</p>
            <p>🌍 <strong>الدولة:</strong> {currentUser.country?.trim() || '—'}</p>
            <p>👩‍🏫 <strong>اسم المدرب:</strong> {currentUser.coach?.trim() || '—'}</p>
          </div>

          <div className="result-divider">━━━━━━━━━━━━━━━</div>

          <div className="result-scores">
            <p>✅ <strong>الإجابات الصحيحة:</strong> {finalResult.correct}</p>
            <p>❌ <strong>الإجابات الخاطئة:</strong> {finalResult.wrong}</p>
            <p>📊 <strong>نسبة الدقة:</strong> {accuracy}%</p>
            <p>⏱️ <strong>الوقت المستغرق:</strong> {finalResult.timeFormatted} ({finalResult.timeArabic})</p>
          </div>

          <div className="result-divider">━━━━━━━━━━━━━━━</div>
          <p className="result-footer">✨ {PLATFORM_NAME}</p>

          <div className="result-actions">
            <button className="btn btn-gold" onClick={copyResult}>
              {copied ? '✅ تم النسخ' : '📋 نسخ النتيجة والمشاركة'}
            </button>
            <button className="btn btn-primary" onClick={onComplete}>
              متابعة 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No official problem set for this category — say so instead of hanging on
  // a loading message, since we never fall back to generated problems.
  if (availableProblems === 0) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '50px 20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📄</div>
        <h3 style={{ color: 'var(--error-color)', marginBottom: '12px' }}>
          لا توجد عمليات رسمية لهذه الفئة
        </h3>
        <p style={{ color: 'var(--text-medium)', marginBottom: '24px' }}>
          لم يتم العثور على ملف العمليات الخاص بـ «{level.category?.fullName || level.name}».
        </p>
        <button className="btn btn-back" onClick={onBack}>↩️ العودة</button>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '60px', fontSize: '1.4rem', color: 'var(--text-medium)' }}>
        جاري التحضير...
      </div>
    );
  }

  const progressPercent = ((problemIndex + 1) / totalProblems) * 100;
  const accuracy =
    stats.correct + stats.wrong > 0
      ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100)
      : 100;

  // Layout hints for the problem stack: the number of floors (rows) and the
  // widest value decide how much the CSS may shrink the font before scrolling.
  const stackNumbers = Array.isArray(currentProblem.numbers) ? currentProblem.numbers : [];
  const stackFloors = Math.max(stackNumbers.length, 1);
  const stackDigits = stackNumbers.reduce(
    (max, n) => Math.max(max, String(Math.abs(n.val)).length),
    1
  );

  return (
    <div className="training-container fade-in">
      {/* Early submit confirmation modal */}
      {showConfirmSubmit && (
        <div className="confirm-modal-backdrop fade-in">
          <div className="confirm-modal-card scale-in">
            <div className="confirm-modal-icon">🏁</div>
            <h3 className="confirm-modal-title">هل أنهيت العمليات وتريد التسليم الآن؟</h3>
            <p className="confirm-modal-desc">
              لقد أجبت على <strong>{stats.correct + stats.wrong}</strong> عملية في <strong>{formatClock(time)}</strong> (من أصل 7 دقائق).
              عند التسليم الآن ستنتهي الجلسة فوراً وتُحفظ نتيجتك!
            </p>
            <div className="confirm-modal-actions">
              <button
                className="btn btn-success btn-lg"
                onClick={() => {
                  setShowConfirmSubmit(false);
                  finishSession(statsRef.current, timeRef.current, 'submitted_early');
                }}
              >
                ✅ نعم، سلّم النتيجة الآن
              </button>
              <button
                className="btn btn-back"
                onClick={() => setShowConfirmSubmit(false)}
              >
                ↩️ مواصلة الحساب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top navbar */}
      <div className="training-navbar">
        <div className="training-navbar-right">
          <img src="/logo.jpg" alt="شعار الأكاديمية" className="training-mini-logo" />
          <div>
            <h3 className="training-nav-title">
              {competition ? `🏆 ${competition.title}` : (level.category?.fullName || level.name)}
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

          {/* Prominent finish & submit button: finishes operations immediately without waiting */}
          <button
            className="btn btn-finish-early"
            onClick={() => setShowConfirmSubmit(true)}
            title="تسليم العمليات فوراً عند الانتهاء قبل الـ 7 دقائق"
          >
            🏁 إنهاء وتسليم العمليات
          </button>

          <button
            className="btn btn-back btn-sm"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
            onClick={onBack}
            title="خروج إلى القائمة"
          >
            خروج
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

            {/* Progression stage badge: Units -> Tens -> Hundreds */}
            <div className={`stage-badge stage-${currentProblem.stage || 'units'}`}>
              <span className="stage-badge-icon">
                {currentProblem.stage === 'units' && '🌱'}
                {currentProblem.stage === 'tens' && '🚀'}
                {currentProblem.stage === 'hundreds' && '⭐'}
                {currentProblem.isMultiplication && '✖️'}
              </span>
              <span className="stage-badge-title">
                {currentProblem.stage === 'units' && 'جدول الآحاد (وحدات)'}
                {currentProblem.stage === 'tens' && 'جدول العشرات'}
                {currentProblem.stage === 'hundreds' && 'جدول المئات'}
                {/* stageLabel distinguishes the three ضرب groups (1×2, 1×3, 2×2) */}
                {currentProblem.isMultiplication && (currentProblem.stageLabel || 'جدول الضرب')}
                {!currentProblem.stage && !currentProblem.isMultiplication && 'عمليات الحساب الذهني'}
              </span>
              {currentProblem.id && (
                <span className="stage-badge-id">عملية {currentProblem.id}</span>
              )}
            </div>

            {currentProblem.isMultiplication ? (
              <div className="problem-multiplication">
                {currentProblem.text} = ؟
              </div>
            ) : (
              <div
                className="problem-stack"
                style={{ '--floors': stackFloors, '--digits': stackDigits }}
              >
                {stackNumbers.map((n, i) => (
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAnswer(e);
                }}
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
            <span
              style={{
                fontSize: '0.75rem',
                marginTop: '4px',
                color: time >= maxTimeSeconds - 60 ? '#ef4444' : '#64748b',
                fontWeight: time >= maxTimeSeconds - 60 ? '700' : 'normal',
              }}
            >
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
                  backgroundColor: accuracy >= 80 ? 'var(--success-color)' : (accuracy >= 50 ? 'var(--accent-color)' : 'var(--error-color)'),
                }}
              />
            </div>
            <span className="accuracy-val">{accuracy}%</span>
          </div>

          {/* Quick submit button in sidebar as well */}
          <button
            className="btn btn-gold btn-block"
            style={{ marginTop: '8px', padding: '10px 14px', fontSize: '0.95rem', fontWeight: 800 }}
            onClick={() => setShowConfirmSubmit(true)}
          >
            🏁 إنهاء وتسليم العمليات
          </button>
        </aside>
      </div>
    </div>
  );
}

export default TrainingSession;
