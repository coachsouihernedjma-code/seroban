import React from 'react';
import { getFilteredLevels } from '../data/levels';

const LEVEL_EMOJIS = ['🌱', '⭐', '🚀', '🏆', '👑', '💎'];

function LevelSelection({ currentSystem, userAge, onSelectLevel, onBack }) {
  const filteredLevels = getFilteredLevels(currentSystem, userAge);

  return (
    <div className="fade-in">
      <div className="level-header">
        <div>
          <h2 className="level-title">
            🎯 {currentSystem === 'algerian' ? 'مستوياتك - النظام الجزائري' : 'مستوياتك - النظام العالمي'}
          </h2>
          <p className="level-subtitle">
            🎂 تم اختيار المستويات المناسبة لعمرك ({userAge} سنوات)
          </p>
        </div>
        <button className="btn btn-back" onClick={onBack}>↩️ العودة</button>
      </div>

      {filteredLevels.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😔</div>
          <h3 style={{ color: 'var(--error-color)', marginBottom: '15px', fontFamily: 'var(--font-playful)' }}>
            لا توجد مستويات متاحة
          </h3>
          <p style={{ color: '#666' }}>
            عمرك الحالي ({userAge} سنوات) غير مشمول في هذا النظام. جرّب النظام الآخر! 🔄
          </p>
        </div>
      ) : (
        <div className="levels-grid">
          {filteredLevels.map((level, index) => (
            <div
              key={level.id}
              className="level-card glass-card"
              style={{ '--level-color': level.color, animationDelay: `${index * 0.1}s` }}
            >
              <span className="level-card-emoji">{LEVEL_EMOJIS[index % LEVEL_EMOJIS.length]}</span>
              <div className="level-card-accent" style={{ backgroundColor: level.color }} />
              <div className="level-card-body">
                <h3 className="level-card-title">{level.name}</h3>
                <div className="level-card-info">
                  <span className="level-card-age">🎂 {level.matchedCategory.ageGroup}</span>
                  <p className="level-card-details">{level.matchedCategory.details}</p>
                </div>
                <div className="level-card-meta">
                  <span className="level-card-count">📝 {level.matchedCategory.config?.count || 100} مسألة</span>
                </div>
                <button
                  className="btn btn-primary level-card-btn"
                  onClick={() => onSelectLevel({ ...level, category: level.matchedCategory })}
                >
                  🎮 ابدأ التدريب
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LevelSelection;
