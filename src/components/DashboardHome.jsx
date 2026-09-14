import React, { useEffect, useMemo, useState } from 'react';
import { getFilteredLevels } from '../data/levels';
import {
  getCompetitionsForUser,
  getCompetitionStatus,
  formatCompetitionDate,
  hasUserParticipated,
} from '../utils/competitions';

const COURSE_STYLES = [
  { tone: 'purple', icon: '🧠' },
  { tone: 'orange', icon: '⏱️' },
  { tone: 'blue', icon: '🏆' },
  { tone: 'green', icon: '🌱' },
];

function DashboardHome({
  currentUser,
  currentSystem,
  onStartTraining,
  onOpenLevels,
  onOpenCompetitions,
  onStartCompetition,
}) {
  const [competitions, setCompetitions] = useState([]);
  const levels = useMemo(
    () => getFilteredLevels(currentSystem, currentUser.age).slice(0, 4),
    [currentSystem, currentUser.age]
  );

  const stats = useMemo(() => {
    const results = JSON.parse(localStorage.getItem('soroban_results') || '[]');
    const mine = results.filter((r) => r.userId === currentUser.id);
    const points = mine.reduce((sum, r) => sum + (r.score || 0), 0);
    const comps = mine.filter((r) => r.isCompetition).length;
    return {
      points,
      trainings: mine.length,
      comps,
      streak: Math.min(mine.length, 7) || 1,
    };
  }, [currentUser.id]);

  const leaderboard = useMemo(() => {
    const users = JSON.parse(localStorage.getItem('soroban_users') || '[]');
    const results = JSON.parse(localStorage.getItem('soroban_results') || '[]');
    const scores = users.map((u) => {
      const pts = results
        .filter((r) => r.userId === u.id)
        .reduce((sum, r) => sum + (r.score || 0), 0);
      return { ...u, pts };
    });
    scores.sort((a, b) => b.pts - a.pts);
    return scores.slice(0, 5);
  }, []);

  useEffect(() => {
    setCompetitions(getCompetitionsForUser(currentSystem, currentUser.age).slice(0, 3));
  }, [currentSystem, currentUser.age]);

  return (
    <div className="dash-home fade-in">
      <section className="dash-hero">
        <div>
          <h1>تعلّم .. تدرّب .. تنافس</h1>
          <p>
            انطلق في رحلة الحساب الذهني وأصبح بطلاً عالمياً مع تحالف سوروبان موجة البحر الأبيض المتوسط.
          </p>
          <button type="button" className="dash-hero-btn" onClick={onOpenLevels}>
            ▶ ابدأ التدريب الآن
          </button>
        </div>
        <div className="dash-hero-art">👦🧮</div>
      </section>

      <div className="dash-stats-row">
        <article className="dash-stat purple">
          <span>🔥</span>
          <div>
            <small>تحدي يومي</small>
            <strong>{stats.streak} أيام متتالية</strong>
          </div>
        </article>
        <article className="dash-stat green">
          <span>⭐</span>
          <div>
            <small>النقاط</small>
            <strong>{stats.points.toLocaleString('ar-DZ')} نقطة</strong>
          </div>
        </article>
        <article className="dash-stat blue">
          <span>🥇</span>
          <div>
            <small>المستوى الحالي</small>
            <strong>{currentUser?.levelName || 'المستوى التحضيري'}</strong>
          </div>
        </article>
        <article className="dash-stat pink">
          <span>🌍</span>
          <div>
            <small>التدريبات</small>
            <strong>{stats.trainings} جلسة</strong>
          </div>
        </article>
      </div>

      <div className="dash-two-col">
        <section>
          <div className="dash-section-head">
            <h2>الدورات التدريبية</h2>
            <button type="button" onClick={onOpenLevels}>عرض الكل</button>
          </div>
          <div className="dash-course-grid">
            {levels.length === 0 ? (
              <p className="dash-empty">لا توجد مستويات لعمرك في هذا النظام.</p>
            ) : (
              levels.map((level, i) => {
                const style = COURSE_STYLES[i % COURSE_STYLES.length];
                return (
                  <button
                    key={level.id}
                    type="button"
                    className={`dash-course-card ${style.tone}`}
                    onClick={() => onStartTraining({ ...level, category: level.matchedCategory })}
                  >
                    <span className="dash-course-icon">{style.icon}</span>
                    <h3>{level.matchedCategory?.fullName || level.name}</h3>
                    <p>{level.matchedCategory.ageGroup}</p>
                    <div className="dash-stars">★★★★★</div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <aside className="dash-leaders">
          <h2>لوحة المتصدرين</h2>
          {leaderboard.length === 0 ? (
            <p className="dash-empty">ابدأ التدريب لتظهر في الترتيب.</p>
          ) : (
            leaderboard.map((u, i) => (
              <div key={u.id} className="dash-leader-row">
                <span className={`rank r${i + 1}`}>{i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span>
                <div className="mini-av">{u.name.charAt(0)}</div>
                <div>
                  <strong>{u.name}</strong>
                  <small>{u.country || '—'}</small>
                </div>
                <b>{u.pts}</b>
              </div>
            ))
          )}
        </aside>
      </div>

      <section>
        <div className="dash-section-head">
          <h2>المسابقات القادمة</h2>
          <button type="button" onClick={onOpenCompetitions}>عرض الكل</button>
        </div>
        <div className="dash-comp-grid">
          {competitions.length === 0 ? (
            <p className="dash-empty">لا توجد مسابقات متاحة لمستواك حالياً.</p>
          ) : (
            competitions.map((comp) => {
              const status = getCompetitionStatus(comp);
              const done = hasUserParticipated(comp.id, currentUser.id);
              return (
                <article key={comp.id} className="dash-comp-card">
                  <span className={`tag ${status}`}>{status === 'open' ? 'مفتوحة' : status === 'upcoming' ? 'قريباً' : 'منتهية'}</span>
                  <h3>{comp.title}</h3>
                  <p>{formatCompetitionDate(comp.openDate)}</p>
                  <p className="muted">{comp.level.name} · {comp.category.ageGroup}</p>
                  {status === 'open' && !done ? (
                    <button
                      type="button"
                      className="dash-register-btn"
                      onClick={() =>
                        onStartCompetition({
                          ...comp.level,
                          category: comp.category,
                          competition: comp,
                        })
                      }
                    >
                      سجّل الآن
                    </button>
                  ) : (
                    <button type="button" className="dash-register-btn ghost" onClick={onOpenCompetitions}>
                      التفاصيل
                    </button>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>

      <footer className="dash-trust">
        <span>🛡️ بيئة آمنة للأطفال</span>
        <span>📜 شهادات معتمدة</span>
        <span>🌍 مسابقات عالمية</span>
        <span>👩‍🏫 تعلّم مع أفضل المدربين</span>
      </footer>
    </div>
  );
}

export default DashboardHome;
