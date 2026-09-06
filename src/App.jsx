import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Landing from './components/Landing';
import EnhancedDashboard from './components/EnhancedDashboard';
import LevelSelection from './components/LevelSelection';
import TrainingSession from './components/TrainingSession';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import CoursesList from './components/CoursesList';
import CompetitionList from './components/CompetitionList';
import CoachDashboard from './components/CoachDashboard';

import { fetchStudents, fetchCompetitions, fetchResults, fetchCoaches } from './services/dbSync';

function App() {
  const [currentSystem, setCurrentSystem] = useState('algerian');
  const [currentView, setCurrentView] = useState('home');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentCoach, setCurrentCoach] = useState(null);
  const [loginRole, setLoginRole] = useState('student');
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    // Initial sync with Neon Postgres in background
    fetchStudents();
    fetchCompetitions();
    fetchResults();
    fetchCoaches();

    // Check if we are in admin mode via URL
    if (window.location.pathname === '/admin') {
      setIsAdminView(true);
      return;
    }

    // Try to load user session
    const sessionUser = sessionStorage.getItem('soroban_current_user');
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser));
      setCurrentView('dashboard');
      return;
    }

    // Try to load coach session
    const sessionCoach = sessionStorage.getItem('soroban_current_coach');
    if (sessionCoach) {
      setCurrentCoach(JSON.parse(sessionCoach));
      setCurrentView('coach-dashboard');
      return;
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    sessionStorage.setItem('soroban_current_user', JSON.stringify(user));
    // Go to dashboard after login
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('soroban_current_user');
    setCurrentView('home');
  };

  const handleCoachLogin = (coach) => {
    setCurrentCoach(coach);
    sessionStorage.setItem('soroban_current_coach', JSON.stringify(coach));
    setCurrentView('coach-dashboard');
  };

  const handleCoachLogout = () => {
    setCurrentCoach(null);
    sessionStorage.removeItem('soroban_current_coach');
    setCurrentView('home');
  };

  const startTraining = (level) => {
    setSelectedLevel(level);
    setSelectedCompetition(null);
    setCurrentView('training');
  };

  const startCompetition = (levelWithCompetition) => {
    setSelectedLevel(levelWithCompetition);
    setSelectedCompetition(levelWithCompetition.competition);
    setCurrentView('competition-training');
  };

  const isTrainingView = currentView === 'training' || currentView === 'competition-training';
  const isDashboardView = currentView === 'dashboard' && currentUser;

  // Admin view — hidden, accessible only via /admin
  if (isAdminView) {
    return (
      <div className="app-container">
        <AdminDashboard />
      </div>
    );
  }

  // Coach Dashboard view
  if (currentCoach && currentView === 'coach-dashboard') {
    return (
      <div className="app-container">
        <CoachDashboard
          coach={currentCoach}
          onLogout={handleCoachLogout}
          onBack={() => setCurrentView('home')}
        />
      </div>
    );
  }

  // Guest landing page (Image 2) - Full width
  if (!currentUser && currentView === 'home') {
    return (
      <Landing 
        onLogin={(role) => {
          setLoginRole(role || 'student');
          setCurrentView('login');
        }} 
        onExploreCompetitions={() => setCurrentView('competitions')} 
      />
    );
  }

  // Logged-in full dashboard view (Image 1) - Full width
  if (isDashboardView) {
    return (
      <EnhancedDashboard
        currentUser={currentUser}
        currentSystem={currentSystem}
        onSystemChange={setCurrentSystem}
        onStartTraining={startTraining}
        onOpenLevels={() => setCurrentView('levels')}
        onOpenCompetitions={() => setCurrentView('competitions')}
        onOpenCourses={() => setCurrentView('courses')}
        onStartCompetition={startCompetition}
        onNavigate={(viewId) => {
          if (viewId === 'home') setCurrentView('dashboard');
          else setCurrentView(viewId);
        }}
        onLogout={handleLogout}
        currentView={currentView}
      />
    );
  }

  return (
    <div className={`app-container fade-in ${isTrainingView ? 'training-mode' : ''}`}>
      {/* Show header only for sub-views that need it */}
      {currentView !== 'home' && currentView !== 'training' && currentView !== 'competition-training' && (
        <Header
          currentSystem={currentSystem}
          onSystemChange={setCurrentSystem}
          onViewChange={setCurrentView}
        />
      )}

      {/* Show compact user bar only in sub-views like levels, courses, competitions */}
      {currentUser && currentView !== 'dashboard' && !isTrainingView && (
        <div className="user-bar">
          <div className="user-bar-info">
            <div className="user-bar-avatar">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <span className="user-bar-name">{currentUser.name}</span>
              <span className="user-bar-age">{currentUser.age} سنوات</span>
            </div>
          </div>
          
          <div className="user-nav">
            <button 
              className="user-nav-btn" 
              onClick={() => setCurrentView('dashboard')}
            >
              🏠 الرئيسية
            </button>
            <button 
              className={`user-nav-btn ${currentView === 'levels' ? 'active' : ''}`} 
              onClick={() => setCurrentView('levels')}
            >
              🎮 ساحة التدريب
            </button>
            <button 
              className={`user-nav-btn ${currentView === 'courses' ? 'active' : ''}`} 
              onClick={() => setCurrentView('courses')}
            >
              📚 الدورات
            </button>
            <button 
              className={`user-nav-btn ${currentView === 'competitions' ? 'active' : ''}`} 
              onClick={() => setCurrentView('competitions')}
            >
              🏆 المسابقات
            </button>
          </div>

          <button onClick={handleLogout} className="btn btn-logout">
            👋 خروج
          </button>
        </div>
      )}

      <main>
        {!currentUser && !currentCoach ? (
          currentView === 'home' ? (
            <Landing 
              onLogin={(role) => {
                setLoginRole(role || 'student');
                setCurrentView('login');
              }} 
              onExploreCompetitions={() => setCurrentView('competitions')} 
            />
          ) : currentView === 'competitions' ? (
            <CompetitionList
              currentSystem={currentSystem}
              userAge={10}
              currentUser={null}
              onStartCompetition={() => {
                setLoginRole('student');
                setCurrentView('login');
              }}
              onBack={() => setCurrentView('home')}
            />
          ) : (
            <Login
              onLogin={handleLogin}
              onCoachLogin={handleCoachLogin}
              onBack={() => setCurrentView('home')}
              initialRole={loginRole}
            />
          )
        ) : (
          <>
            {currentView === 'levels' && (
              <LevelSelection
                currentSystem={currentSystem}
                userAge={currentUser.age}
                onSelectLevel={startTraining}
                onBack={() => setCurrentView('dashboard')}
              />
            )}
            {currentView === 'courses' && (
              <CoursesList onBack={() => setCurrentView('dashboard')} />
            )}
            {currentView === 'competitions' && (
              <CompetitionList
                currentSystem={currentSystem}
                userAge={currentUser.age}
                currentUser={currentUser}
                onStartCompetition={startCompetition}
                onBack={() => setCurrentView('dashboard')}
              />
            )}
            {currentView === 'training' && (
              <TrainingSession
                level={selectedLevel}
                currentUser={currentUser}
                currentSystem={currentSystem}
                onComplete={() => setCurrentView('dashboard')} 
                onBack={() => setCurrentView('levels')} 
              />
            )}
            {currentView === 'competition-training' && (
              <TrainingSession
                level={selectedLevel}
                currentUser={currentUser}
                currentSystem={currentSystem}
                competition={selectedCompetition}
                onComplete={() => setCurrentView('dashboard')} 
                onBack={() => setCurrentView('competitions')} 
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
