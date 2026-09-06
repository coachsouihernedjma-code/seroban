import { neon } from '@neondatabase/serverless';

let sql = null;
let initialized = false;

function getDb() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;
  if (!sql) {
    sql = neon(dbUrl);
  }
  return sql;
}

async function initTables(db) {
  if (initialized) return;
  try {
    await db`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INTEGER,
        birth_year INTEGER,
        country VARCHAR(100),
        coach VARCHAR(255),
        join_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await db`
      CREATE TABLE IF NOT EXISTS coaches (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        password VARCHAR(255),
        country VARCHAR(100),
        school_name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    try { await db`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS password VARCHAR(255)`; } catch {}
    await db`
      CREATE TABLE IF NOT EXISTS competitions (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        system VARCHAR(50) DEFAULT 'algerian',
        level_id VARCHAR(50),
        category_id VARCHAR(50),
        open_date TIMESTAMP WITH TIME ZONE,
        close_date TIMESTAMP WITH TIME ZONE,
        banner_url TEXT,
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await db`
      CREATE TABLE IF NOT EXISTS competition_results (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        user_name VARCHAR(255),
        level_id VARCHAR(50),
        level_name VARCHAR(100),
        category_id VARCHAR(50),
        category_name VARCHAR(100),
        competition_id VARCHAR(64),
        competition_title VARCHAR(255),
        system VARCHAR(50) DEFAULT 'algerian',
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        time_seconds INTEGER NOT NULL,
        time_formatted VARCHAR(50),
        is_competition BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    initialized = true;
    console.log('✅ [Neon] Tables initialized');
  } catch (err) {
    console.error('❌ [Neon] Init error:', err.message);
  }
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return json(200, {});
  }

  const db = getDb();

  // Remove the function prefix to get the real path
  // e.g. /.netlify/functions/api/students -> /students
  const rawPath = event.path || '';
  const path = rawPath.replace('/.netlify/functions/api', '') || '/';
  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};

  // Status check
  if (path === '/status' || path === '') {
    return json(200, {
      connected: !!db,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    });
  }

  if (!db) {
    return json(503, {
      error: 'DATABASE_URL not configured in Netlify environment variables',
      hasDatabaseUrl: false,
    });
  }

  try {
    await initTables(db);

    // ── STUDENTS ──────────────────────────────────────────────
    if (path === '/students' && method === 'GET') {
      const rows = await db`SELECT * FROM students ORDER BY created_at DESC`;
      return json(200, rows);
    }
    if (path === '/students' && method === 'POST') {
      const id = body.id || Date.now().toString();
      const birthYear = body.birthYear || (body.age ? 2026 - body.age : null);
      await db`
        INSERT INTO students (id, name, age, birth_year, country, coach)
        VALUES (${id}, ${body.name || ''}, ${body.age || 0}, ${birthYear}, ${body.country || ''}, ${body.coach || ''})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, age = EXCLUDED.age,
          birth_year = EXCLUDED.birth_year, country = EXCLUDED.country, coach = EXCLUDED.coach;
      `;
      return json(200, { success: true, id });
    }
    if (path.startsWith('/students/') && method === 'DELETE') {
      const id = path.split('/students/')[1];
      await db`DELETE FROM students WHERE id = ${id}`;
      return json(200, { success: true, deleted: id });
    }

    // ── COACHES ───────────────────────────────────────────────
    if (path === '/coaches' && method === 'GET') {
      const rows = await db`SELECT * FROM coaches ORDER BY created_at DESC`;
      return json(200, rows);
    }
    if (path === '/coaches' && method === 'POST') {
      const id = body.id || Date.now().toString();
      await db`
        INSERT INTO coaches (id, name, phone, email, password, country, school_name)
        VALUES (${id}, ${body.name || ''}, ${body.phone || ''}, ${body.email || ''},
                ${body.password || ''}, ${body.country || ''}, ${body.schoolName || body.school_name || ''})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, phone = EXCLUDED.phone, email = EXCLUDED.email,
          password = EXCLUDED.password, country = EXCLUDED.country, school_name = EXCLUDED.school_name;
      `;
      return json(200, { success: true, id });
    }
    if (path.startsWith('/coaches/') && method === 'DELETE') {
      const id = path.split('/coaches/')[1];
      await db`DELETE FROM coaches WHERE id = ${id}`;
      return json(200, { success: true, deleted: id });
    }

    // ── COMPETITIONS ──────────────────────────────────────────
    if (path === '/competitions' && method === 'GET') {
      const rows = await db`SELECT * FROM competitions ORDER BY open_date ASC`;
      return json(200, rows);
    }
    if (path === '/competitions' && method === 'POST') {
      const id = body.id || Date.now().toString();
      await db`
        INSERT INTO competitions (id, title, description, system, level_id, category_id, open_date, close_date, banner_url, status)
        VALUES (${id}, ${body.title || ''}, ${body.description || ''}, ${body.system || 'algerian'},
                ${body.levelId || body.level_id || ''}, ${body.categoryId || body.category_id || ''},
                ${body.openDate ? new Date(body.openDate) : null}, ${body.closeDate ? new Date(body.closeDate) : null},
                ${body.bannerUrl || ''}, ${body.status || 'open'})
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title, description = EXCLUDED.description, system = EXCLUDED.system,
          level_id = EXCLUDED.level_id, category_id = EXCLUDED.category_id,
          open_date = EXCLUDED.open_date, close_date = EXCLUDED.close_date, status = EXCLUDED.status;
      `;
      return json(200, { success: true, id });
    }
    if (path.startsWith('/competitions/') && method === 'DELETE') {
      const id = path.split('/competitions/')[1];
      await db`DELETE FROM competitions WHERE id = ${id}`;
      return json(200, { success: true, deleted: id });
    }

    // ── RESULTS ───────────────────────────────────────────────
    if (path === '/results' && method === 'GET') {
      const rows = await db`SELECT * FROM competition_results ORDER BY created_at DESC`;
      return json(200, rows);
    }
    if (path === '/results' && method === 'POST') {
      const id = body.id || Date.now().toString();
      await db`
        INSERT INTO competition_results (
          id, user_id, user_name, level_id, level_name, category_id, category_name,
          competition_id, competition_title, system, score, total, time_seconds, time_formatted, is_competition
        )
        VALUES (
          ${id}, ${body.userId || body.user_id || ''}, ${body.userName || body.user_name || ''},
          ${body.levelId || body.level_id || ''}, ${body.levelName || body.level_name || ''},
          ${body.categoryId || body.category_id || ''}, ${body.categoryName || body.category_name || ''},
          ${body.competitionId || body.competition_id || null}, ${body.competitionTitle || body.competition_title || null},
          ${body.system || 'algerian'}, ${body.score || 0}, ${body.total || 0},
          ${body.timeSeconds || body.time_seconds || 0}, ${body.timeFormatted || body.time_formatted || ''},
          ${!!body.isCompetition || !!body.is_competition}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
      return json(200, { success: true, id });
    }
    if (path.startsWith('/results/') && method === 'DELETE') {
      const id = path.split('/results/')[1];
      await db`DELETE FROM competition_results WHERE id = ${id}`;
      return json(200, { success: true, deleted: id });
    }

    // ── CLEAR ALL ─────────────────────────────────────────────
    if (path === '/clear-all' && method === 'POST') {
      await db`TRUNCATE TABLE students, coaches, competitions, competition_results`;
      return json(200, { success: true, message: 'All tables cleared' });
    }
    if (path === '/clear-students' && method === 'POST') {
      await db`TRUNCATE TABLE students`;
      return json(200, { success: true });
    }
    if (path === '/clear-results' && method === 'POST') {
      await db`TRUNCATE TABLE competition_results`;
      return json(200, { success: true });
    }

    return json(404, { error: 'Route not found', path });
  } catch (err) {
    console.error('API Error:', err);
    return json(500, { error: err.message });
  }
};
