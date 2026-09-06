import React, { useState, useEffect } from 'react';
import { initialCourses } from '../data/programsAndCompetitions';

function CoursesList({ onBack }) {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem('soroban_courses') || '[]');
    if (storedCourses.length > 0) {
      storedCourses.sort((a, b) => new Date(b.date) - new Date(a.date));
      setCourses(storedCourses);
    } else {
      setCourses(initialCourses);
    }
  }, []);

  return (
    <div className="fade-in" style={{ padding: '20px 0', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: 'var(--primary-dark)', fontSize: '2rem', marginBottom: '6px' }}>📖 البرامج والدورات التدريبية</h2>
          <p style={{ color: 'var(--text-medium)', fontSize: '1rem' }}>اكتشف دورات الحساب الذهني المتاحة لدينا لجميع المستويات</p>
        </div>
        {onBack && (
          <button className="btn btn-back" onClick={onBack}>↩️ العودة للرئيسية</button>
        )}
      </div>
        <div className="courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {courses.map(course => (
            <div key={course.id} className="glass-card course-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
              <div style={{ marginBottom: '15px' }}>
                <span style={{ 
                  backgroundColor: 'rgba(32, 178, 170, 0.1)', 
                  color: 'var(--primary-dark)', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold',
                  display: 'inline-block',
                  marginBottom: '10px'
                }}>
                  دورة تدريبية
                </span>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--text-dark)', marginBottom: '10px', lineHeight: '1.4' }}>{course.title}</h3>
                <p style={{ color: 'var(--text-medium)', fontSize: '0.95rem', lineHeight: '1.6' }}>{course.description}</p>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <a 
                  href={course.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary" 
                  style={{ display: 'block', textAlign: 'center', width: '100%', textDecoration: 'none' }}
                >
                  الانضمام للدورة
                </a>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}

export default CoursesList;
