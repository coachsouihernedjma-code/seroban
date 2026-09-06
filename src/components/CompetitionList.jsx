import React, { useState, useEffect } from 'react';
import {
  getCompetitionsForUser,
  hasUserParticipated,
  formatCompetitionDate,
} from '../utils/competitions';

const STATUS_CONFIG = {
  upcoming: {
    label: '🔒 مغلقة',
    desc: 'ستُفتح في',
    className: 'competition-status-upcoming',
    emoji: '⏳',
  },
  open: {
    label: '🟢 مفتوحة',
    desc: 'انطلق الآن!',
    className: 'competition-status-open',
    emoji: '🏆',
  },
  closed: {
    label: '🔴 انتهت',
    desc: 'انتهت المسابقة',
    className: 'competition-status-closed',
    emoji: '📋',
  },
};

function CompetitionList({ currentSystem, userAge, currentUser, onStartCompetition, onBack }) {
  const [competitions, setCompetitions] = useState([]);

  useEffect(() => {
    setCompetitions(getCompetitionsForUser(currentSystem, userAge));
  }, [currentSystem, userAge]);

  if (competitions.length === 0) {
    return (
      <div className="glass-card competition-empty fade-in">
        <div className="competition-empty-icon">🏆</div>
        <h2 className="competition-empty-title">لا توجد مسابقات حالياً</h2>
        <p className="competition-empty-text">
          لا توجد مسابقات متاحة لمستواك في{' '}
          {currentSystem === 'algerian' ? 'النظام الجزائري' : 'النظام العالمي'}.
          <br />
          تابعنا — ستُعلَن المسابقات قريباً! 🌟
        </p>
        {onBack && (
          <button className="btn btn-back" style={{ marginTop: '20px' }} onClick={onBack}>
            ↩️ العودة للرئيسية
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="competition-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="level-title">🏆 المسابقات المتاحة</h2>
          <p className="level-subtitle">
            مسابقاتك حسب مستواك ({userAge} سنوات) —{' '}
            {currentSystem === 'algerian' ? 'النظام الجزائري' : 'النظام العالمي'}
          </p>
        </div>
        {onBack && (
          <button className="btn btn-back" onClick={onBack}>↩️ العودة للرئيسية</button>
        )}
      </div>

      <div className="competitions-grid">
        {competitions.map((comp) => {
          const config = STATUS_CONFIG[comp.status];
          const participated = hasUserParticipated(comp.id, currentUser.id);
          const canStart = comp.status === 'open' && !participated;

          return (
            <div key={comp.id} className={`competition-card glass-card ${config.className}`}>
              <div className="competition-card-header">
                <span className="competition-card-emoji">{config.emoji}</span>
                <span className={`competition-badge ${config.className}`}>{config.label}</span>
              </div>

              <h3 className="competition-card-title">{comp.title}</h3>
              {comp.description && (
                <p className="competition-card-desc">{comp.description}</p>
              )}

              <div className="competition-card-meta">
                <span className="level-card-age">📚 {comp.level.name}</span>
                <span className="level-card-age">🎂 {comp.category.ageGroup}</span>
              </div>

              <div className="competition-dates">
                <div className="competition-date-row">
                  <span>📅 يوم الفتح:</span>
                  <strong>{formatCompetitionDate(comp.openDate)}</strong>
                </div>
                {comp.closeDate && (
                  <div className="competition-date-row">
                    <span>⏰ يوم الإغلاق:</span>
                    <strong>{formatCompetitionDate(comp.closeDate)}</strong>
                  </div>
                )}
              </div>

              {comp.status === 'upcoming' && (
                <div className="competition-locked-msg">
                  🔒 المسابقة مغلقة — ستُفتح في التاريخ المحدد أعلاه
                </div>
              )}

              {participated && (
                <div className="competition-done-msg">
                  ✅ لقد شاركت في هذه المسابقة — أحسنت!
                </div>
              )}

              {canStart && (
                <button
                  className="btn btn-play competition-start-btn"
                  onClick={() =>
                    onStartCompetition({
                      ...comp.level,
                      category: comp.category,
                      competition: comp,
                    })
                  }
                >
                  🚀 ابدأ المسابقة
                </button>
              )}

              {comp.status === 'closed' && !participated && (
                <div className="competition-locked-msg">
                  📋 انتهت المسابقة ولم تشارك فيها
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CompetitionList;
