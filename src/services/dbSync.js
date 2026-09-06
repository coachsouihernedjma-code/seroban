/**
 * Database Sync Service for Neon Postgres
 * Bridges frontend state & localStorage with remote Neon Postgres database.
 */

// Helper fetch wrapper
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    const res = await fetch(endpoint, options);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.error || 'Request failed' };
    }
    const json = await res.json();
    return { ok: true, data: json };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// 1. STUDENTS (بيانات الطالب)
export async function syncStudent(student) {
  // Always update localStorage first for instant UI response
  const users = JSON.parse(localStorage.getItem('soroban_users') || '[]');
  const idx = users.findIndex(u => u.id === student.id || u.name === student.name);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...student };
  } else {
    users.push(student);
  }
  localStorage.setItem('soroban_users', JSON.stringify(users));

  // Sync with Neon Postgres
  const res = await apiCall('/api/students', 'POST', student);
  return res;
}

export async function fetchStudents() {
  const res = await apiCall('/api/students');
  if (res.ok && Array.isArray(res.data)) {
    localStorage.setItem('soroban_users', JSON.stringify(res.data));
    return res.data;
  }
  return JSON.parse(localStorage.getItem('soroban_users') || '[]');
}

// 2. COACHES (بيانات المدرب)
export async function syncCoach(coach) {
  const coaches = JSON.parse(localStorage.getItem('soroban_coaches') || '[]');
  const idx = coaches.findIndex(c => c.id === coach.id);
  if (idx >= 0) {
    coaches[idx] = { ...coaches[idx], ...coach };
  } else {
    coaches.push(coach);
  }
  localStorage.setItem('soroban_coaches', JSON.stringify(coaches));

  return await apiCall('/api/coaches', 'POST', coach);
}

export async function fetchCoaches() {
  const res = await apiCall('/api/coaches');
  if (res.ok && Array.isArray(res.data)) {
    localStorage.setItem('soroban_coaches', JSON.stringify(res.data));
    return res.data;
  }
  return JSON.parse(localStorage.getItem('soroban_coaches') || '[]');
}

// 3. COMPETITIONS (المسابقات)
export async function syncCompetition(competition) {
  const comps = JSON.parse(localStorage.getItem('soroban_competitions') || '[]');
  const idx = comps.findIndex(c => c.id === competition.id);
  if (idx >= 0) {
    comps[idx] = { ...comps[idx], ...competition };
  } else {
    comps.push(competition);
  }
  localStorage.setItem('soroban_competitions', JSON.stringify(comps));

  return await apiCall('/api/competitions', 'POST', competition);
}

export async function fetchCompetitions() {
  const res = await apiCall('/api/competitions');
  if (res.ok && Array.isArray(res.data)) {
    localStorage.setItem('soroban_competitions', JSON.stringify(res.data));
    return res.data;
  }
  return JSON.parse(localStorage.getItem('soroban_competitions') || '[]');
}

// 4. RESULTS (نتائج المسابقات والتدريب)
export async function syncResult(result) {
  const results = JSON.parse(localStorage.getItem('soroban_results') || '[]');
  results.push(result);
  localStorage.setItem('soroban_results', JSON.stringify(results));

  return await apiCall('/api/results', 'POST', result);
}

export async function fetchResults() {
  const res = await apiCall('/api/results');
  if (res.ok && Array.isArray(res.data)) {
    localStorage.setItem('soroban_results', JSON.stringify(res.data));
    return res.data;
  }
  return JSON.parse(localStorage.getItem('soroban_results') || '[]');
}

// 5. DELETIONS & CLEANUP (حذف البيانات العالقة)
export async function deleteStudent(id) {
  const users = JSON.parse(localStorage.getItem('soroban_users') || '[]');
  const filtered = users.filter(u => u.id !== id);
  localStorage.setItem('soroban_users', JSON.stringify(filtered));
  return await apiCall(`/api/students/${encodeURIComponent(id)}`, 'DELETE');
}

export async function deleteCompetition(id) {
  const comps = JSON.parse(localStorage.getItem('soroban_competitions') || '[]');
  const filtered = comps.filter(c => c.id !== id);
  localStorage.setItem('soroban_competitions', JSON.stringify(filtered));
  return await apiCall(`/api/competitions/${encodeURIComponent(id)}`, 'DELETE');
}

export async function deleteResult(id) {
  const results = JSON.parse(localStorage.getItem('soroban_results') || '[]');
  const filtered = results.filter(r => r.id !== id);
  localStorage.setItem('soroban_results', JSON.stringify(filtered));
  return await apiCall(`/api/results/${encodeURIComponent(id)}`, 'DELETE');
}

export async function deleteCoach(id) {
  const coaches = JSON.parse(localStorage.getItem('soroban_coaches') || '[]');
  const filtered = coaches.filter(c => c.id !== id);
  localStorage.setItem('soroban_coaches', JSON.stringify(filtered));
  return await apiCall(`/api/coaches/${encodeURIComponent(id)}`, 'DELETE');
}

export async function clearAllDatabase() {
  localStorage.removeItem('soroban_users');
  localStorage.removeItem('soroban_results');
  localStorage.removeItem('soroban_competitions');
  localStorage.removeItem('soroban_coaches');
  return await apiCall('/api/clear-all', 'POST');
}

// Status checker
export async function checkNeonStatus() {
  return await apiCall('/api/status');
}
