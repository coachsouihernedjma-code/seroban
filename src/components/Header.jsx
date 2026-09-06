import React from 'react';

function Header({ currentSystem, onSystemChange, onViewChange }) {
  return (
    <header className="glass-card" style={{ justifyContent: 'center' }}>
      <div className="sliding-switch">
        <div 
          className="sliding-switch-indicator" 
          style={{ transform: currentSystem === 'algerian' ? 'translateX(0)' : 'translateX(-100%)' }}
        />
        <button 
          className={`sliding-switch-btn ${currentSystem === 'algerian' ? 'active' : ''}`}
          onClick={() => onSystemChange('algerian')}
        >
          النظام الجزائري
        </button>
        <button 
          className={`sliding-switch-btn ${currentSystem === 'international' ? 'active' : ''}`}
          onClick={() => onSystemChange('international')}
        >
          النظام العالمي للبطولات
        </button>
      </div>
    </header>
  );
}

export default Header;
