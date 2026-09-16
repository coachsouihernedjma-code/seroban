import React from 'react';
import { getAllCategories } from '../data/levels';

const LEVEL_EMOJIS = ['🌱', '⭐', '🚀', '🏆', '👑', '💎'];

function LevelSelection({ currentSystem, userAge, onSelectLevel, onBack }) {
  // Every category is shown and selectable; the age-appropriate ones are
  // flagged with isRecommended and sorted to the front.
  const allCategories = getAllCategories(currentSystem, userAge);
  const recommendedCount = allCategories.filter(entry => entry.isRecommended).length;

  return (
    <div className="fade-in">
      <div className="level-header">
        <div>
          <h2 className="level-title">
            🎯 {currentSystem === 'algerian' ? 'المستويات والفئات - النظام الجزائري' : 'المستويات والفئات - النظام العالمي'}
          </h2>
          <p className="level-subtitle">
            🎂 كل الفئات متاحة للتدريب — والمميّزة بعلامة ⭐ هي المعتمدة لعمرك ({userAge} سنوات)
          </p>
        </div>
        <button className="btn btn-back" onClick={onBack}>↩️ العودة</button>
      </div>

      {allCategories.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😔</div>
          <h3 style={{ color: 'var(--error-color)', marginBottom: '15px', fontFamily: 'var(--font-playful)' }}>
            لا توجد مستويات متاحة
          </h3>
          <p style={{ color: '#666' }}>لم يتم العثور على أي فئة في هذا النظام. جرّب النظام الآخر! 🔄</p>
        </div>
      ) : (
        <>
          <div className="levels-grid">
            {allCategories.map((entry, index) => (
              <div
                key={`${entry.id}-${entry.category.id}`}
                className={`level-card glass-card${entry.isRecommended ? ' level-card-recommended' : ''}`}
                style={{ '--level-color': entry.color, animationDelay: `${index * 0.05}s` }}
              >
                <span className="level-card-emoji">{LEVEL_EMOJIS[index % LEVEL_EMOJIS.length]}</span>
                <div className="level-card-accent" style={{ backgroundColor: entry.color }} />
                <div className="level-card-body">
                  {entry.isRecommended && (
                    <span className="level-recommended-badge">⭐ الفئة المعتمدة لك</span>
                  )}
                  <h3 className="level-card-title">{entry.category.fullName || entry.name}</h3>
                  <span className="level-card-parent">{entry.name}</span>
                  <div className="level-card-info">
                    <span className="level-card-age">🎂 {entry.category.ageGroup}</span>
                    <p className="level-card-details">{entry.category.details}</p>
                  </div>
                  <div className="level-card-meta">
                    <span className="level-card-count">
                      📝 {entry.category.config?.count || entry.category.operationsCount} مسألة
                    </span>
                    <span className="level-card-count">⏱️ {entry.category.durationText}</span>
                  </div>
                  <button
                    className="btn btn-primary level-card-btn"
                    onClick={() => onSelectLevel({ ...entry, category: entry.category })}
                  >
                    🎮 ابدأ التدريب
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="levels-grid-footer">
            إجمالي الفئات المتاحة: <strong>{allCategories.length}</strong>
            {recommendedCount > 0 && <> — منها <strong>{recommendedCount}</strong> معتمدة لعمرك</>}
          </p>
        </>
      )}
    </div>
  );
}

export default LevelSelection;
