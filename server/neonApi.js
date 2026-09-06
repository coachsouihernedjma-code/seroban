import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config();

let sql = null;
let initialized = false;

export function getDb() {
  const dbUrl = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
  if (!dbUrl) return null;
  if (!sql) {
    sql = neon(dbUrl);
  }
  return sql;
}

export async function initTables() {
  const db = getDb();
  if (!db || initialized) return;

  try {
    // 1. Students table (بيانات الطالب)
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

    // 2. Coaches table (بيانات المدرب)
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
    try {
      await db`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS password VARCHAR(255)`;
    } catch {}

    // 3. Competitions table (المسابقات)
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

    // 4. Competition results table (نتائج المسابقات)
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
    console.log('✅ [Neon] Successfully initialized all tables (students, coaches, competitions, results)');
  } catch (err) {
    console.error('❌ [Neon] Error initializing tables:', err.message);
  }
}

// Handler helper to read request body
function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, obj) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(obj));
}

// Vite Middleware Handler
export async function neonApiMiddleware(req, res, next) {
  const url = req.url || '';
  if (!url.startsWith('/api/')) {
    return next();
  }

  // Reload env dynamically if needed
  dotenv.config();
  const db = getDb();

  // Status check
  if (url === '/api/status') {
    return sendJson(res, 200, {
      connected: !!db,
      hasDatabaseUrl: !!(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL),
    });
  }

  if (!db) {
    return sendJson(res, 503, {
      error: 'DATABASE_URL not configured yet in .env',
      hasDatabaseUrl: false,
    });
  }

  try {
    await initTables();

    // 1. STUDENTS
    if (url === '/api/students' && req.method === 'GET') {
      const rows = await db`SELECT * FROM students ORDER BY created_at DESC`;
      return sendJson(res, 200, rows);
    }
    if (url === '/api/students' && req.method === 'POST') {
      const body = await parseBody(req);
      const id = body.id || Date.now().toString();
      const birthYear = body.birthYear || (body.age ? 2026 - body.age : null);
      await db`
        INSERT INTO students (id, name, age, birth_year, country, coach)
        VALUES (${id}, ${body.name || ''}, ${body.age || 0}, ${birthYear}, ${body.country || ''}, ${body.coach || ''})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          age = EXCLUDED.age,
          birth_year = EXCLUDED.birth_year,
          country = EXCLUDED.country,
          coach = EXCLUDED.coach;
      `;
      return sendJson(res, 200, { success: true, id });
    }

    // 2. COACHES
    if (url === '/api/coaches' && req.method === 'GET') {
      const rows = await db`SELECT * FROM coaches ORDER BY created_at DESC`;
      return sendJson(res, 200, rows);
    }
    if (url === '/api/coaches' && req.method === 'POST') {
      const body = await parseBody(req);
      const id = body.id || Date.now().toString();
      await db`
        INSERT INTO coaches (id, name, phone, email, password, country, school_name)
        VALUES (${id}, ${body.name || ''}, ${body.phone || ''}, ${body.email || ''}, ${body.password || ''}, ${body.country || ''}, ${body.schoolName || body.school_name || ''})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          password = EXCLUDED.password,
          country = EXCLUDED.country,
          school_name = EXCLUDED.school_name;
      `;
      return sendJson(res, 200, { success: true, id });
    }

    // 3. COMPETITIONS
    if (url === '/api/competitions' && req.method === 'GET') {
      const rows = await db`SELECT * FROM competitions ORDER BY open_date ASC`;
      return sendJson(res, 200, rows);
    }
    if (url === '/api/competitions' && req.method === 'POST') {
      const body = await parseBody(req);
      const id = body.id || Date.now().toString();
      await db`
        INSERT INTO competitions (id, title, description, system, level_id, category_id, open_date, close_date, banner_url, status)
        VALUES (${id}, ${body.title || ''}, ${body.description || ''}, ${body.system || 'algerian'}, ${body.levelId || body.level_id || ''}, ${body.categoryId || body.category_id || ''}, ${body.openDate ? new Date(body.openDate) : null}, ${body.closeDate ? new Date(body.closeDate) : null}, ${body.bannerUrl || ''}, ${body.status || 'open'})
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          system = EXCLUDED.system,
          level_id = EXCLUDED.level_id,
          category_id = EXCLUDED.category_id,
          open_date = EXCLUDED.open_date,
          close_date = EXCLUDED.close_date,
          status = EXCLUDED.status;
      `;
      return sendJson(res, 200, { success: true, id });
    }

    // 4. RESULTS
    if (url === '/api/results' && req.method === 'GET') {
      const rows = await db`SELECT * FROM competition_results ORDER BY created_at DESC`;
      return sendJson(res, 200, rows);
    }
    if (url === '/api/results' && req.method === 'POST') {
      const body = await parseBody(req);
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
      return sendJson(res, 200, { success: true, id });
    }

    // DELETE: individual records
    if (url.startsWith('/api/students/') && req.method === 'DELETE') {
      const id = url.split('/api/students/')[1];
      await db`DELETE FROM students WHERE id = ${id}`;
      return sendJson(res, 200, { success: true, deleted: id });
    }
    if (url.startsWith('/api/coaches/') && req.method === 'DELETE') {
      const id = url.split('/api/coaches/')[1];
      await db`DELETE FROM coaches WHERE id = ${id}`;
      return sendJson(res, 200, { success: true, deleted: id });
    }
    if (url.startsWith('/api/competitions/') && req.method === 'DELETE') {
      const id = url.split('/api/competitions/')[1];
      await db`DELETE FROM competitions WHERE id = ${id}`;
      return sendJson(res, 200, { success: true, deleted: id });
    }
    if (url.startsWith('/api/results/') && req.method === 'DELETE') {
      const id = url.split('/api/results/')[1];
      await db`DELETE FROM competition_results WHERE id = ${id}`;
      return sendJson(res, 200, { success: true, deleted: id });
    }

    // DELETE ALL: clear all tables
    if (url === '/api/clear-all' && req.method === 'POST') {
      await db`TRUNCATE TABLE students, coaches, competitions, competition_results`;
      return sendJson(res, 200, { success: true, message: 'All tables cleared' });
    }

    // DELETE students only
    if (url === '/api/clear-students' && req.method === 'POST') {
      await db`TRUNCATE TABLE students`;
      return sendJson(res, 200, { success: true });
    }

    // DELETE results only
    if (url === '/api/clear-results' && req.method === 'POST') {
      await db`TRUNCATE TABLE competition_results`;
      return sendJson(res, 200, { success: true });
    }

    return sendJson(res, 404, { error: 'Route not found' });
  } catch (err) {
    console.error('API Error:', err);
    return sendJson(res, 500, { error: err.message });
  }
}
