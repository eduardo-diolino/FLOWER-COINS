// FLOWER COINS Backend API
export default {
  async fetch(request, env, ctx) {
    // Enable CORS for all requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Project-Id, X-Encrypted-Yw-ID, X-Is-Login, X-Yw-Env',
    };

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      const reqHeaders = request.headers.get('Access-Control-Request-Headers');
      const preflightHeaders = { ...corsHeaders };
      if (reqHeaders) {
        preflightHeaders['Access-Control-Allow-Headers'] = reqHeaders;
      } else {
        preflightHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Project-Id, X-Encrypted-Yw-ID, X-Is-Login, X-Yw-Env, Accept, X-Requested-With';
      }
      preflightHeaders['Access-Control-Max-Age'] = '86400';
      return new Response(null, { headers: preflightHeaders });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;

      // Get user info from headers
      const userId = request.headers.get('X-Encrypted-Yw-ID');
      const isLogin = request.headers.get('X-Is-Login') === '1';

      // API Routes
      if (path === '/api/user/info' && method === 'GET') {
        return await getUserInfo(env.DB, userId, corsHeaders);
      }

      if (path === '/api/user/stats' && method === 'GET') {
        return await getUserStats(env.DB, userId, corsHeaders);
      }

      if (path === '/api/tasks' && method === 'GET') {
        return await getTasks(env.DB, corsHeaders);
      }

      if (path === '/api/tasks/complete' && method === 'POST') {
        const body = await request.json();
        return await completeTask(env.DB, userId, body, corsHeaders);
      }

      if (path === '/api/tasks' && method === 'POST') {
        const body = await request.json();
        return await createTask(env.DB, userId, body, corsHeaders);
      }

      if (path === '/api/ranking' && method === 'GET') {
        return await getRanking(env.DB, corsHeaders);
      }

      // Meta Tasks endpoints
      if (path === '/api/meta-tasks' && method === 'GET') {
        const userId = url.searchParams.get('user_id');
        return await getMetaTasks(env.DB, corsHeaders, userId);
      }
      if (path === '/api/meta-tasks' && method === 'POST') {
        const body = await request.json();
        return await createMetaTasks(env.DB, body, corsHeaders);
      }

      // IND Tasks endpoints
      if (path === '/api/ind-tasks' && method === 'GET') {
        const userId = url.searchParams.get('user_id');
        return await getIndTasks(env.DB, corsHeaders, userId);
      }
      if (path === '/api/ind-tasks' && method === 'POST') {
        const body = await request.json();
        return await createIndTasks(env.DB, body, corsHeaders);
      }

      if (path === '/api/user/photo' && method === 'POST') {
        const body = await request.json();
        return await updateUserPhoto(env.DB, userId, body, corsHeaders);
      }

      if (path === '/api/monthly-points' && method === 'GET') {
        const month = url.searchParams.get('month');
        const year = url.searchParams.get('year');
        return await getMonthlyPoints(env.DB, userId, month, year, corsHeaders);
      }

      if (path === '/api/monthly-reset' && method === 'POST') {
        return await performMonthlyReset(env.DB, corsHeaders);
      }

      if (path === '/api/user/list' && method === 'GET') {
        return await getUserList(env.DB, corsHeaders);
      }

      if (path === '/api/distribution-history' && method === 'GET') {
        return await getDistributionHistory(env.DB, corsHeaders);
      }

      if (path === '/api/user/update-points' && method === 'POST') {
        const body = await request.json();
        return await updateUserPoints(env.DB, userId, body, corsHeaders);
      }

      if (path === '/api/user/update-name' && method === 'POST') {
        const body = await request.json();
        return await updateUserName(env.DB, userId, body, corsHeaders);
      }

      // Default response
      return new Response(JSON.stringify({ 
        message: 'FLOWER COINS API v1.0',
        endpoints: [
          'GET /api/user/info',
          'GET /api/user/stats', 
          'GET /api/tasks',
          'POST /api/tasks/complete',
          'POST /api/admin/tasks',
          'GET /api/ranking',
          'POST /api/user/photo',
          'GET /api/monthly-points',
          'POST /api/monthly-reset',
          'GET /api/user/list',
          'GET /api/distribution-history',
          'POST /api/user/update-points',
          'POST /api/user/update-name'
        ]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// Get or create user info
async function getUserInfo(db, userId, corsHeaders) {
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User not authenticated' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Check if user exists in our database
    const { results } = await db.prepare('SELECT * FROM users WHERE encrypted_yw_id = ?')
      .bind(userId).all();

    let user = results[0];
    
    if (!user) {
      // Create new user record
      await db.prepare(`
        INSERT INTO users (encrypted_yw_id, display_name, created_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `).bind(userId, `User_${userId.slice(-8)}`).run();
      
      // Get the newly created user
      const { results: newResults } = await db.prepare('SELECT * FROM users WHERE encrypted_yw_id = ?')
        .bind(userId).all();
      user = newResults[0];
    }

    return new Response(JSON.stringify({ 
      success: true,
      user: user
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get user info error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get user info' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Get user statistics
async function getUserStats(db, userId, corsHeaders) {
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User not authenticated' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get or create user stats
    let { results } = await db.prepare('SELECT * FROM users WHERE encrypted_yw_id = ?')
      .bind(userId).all();

    if (results.length === 0) {
      // Create initial user
      await db.prepare(`
        INSERT INTO users (encrypted_yw_id, flower_coins, flower_meta, level) 
        VALUES (?, 0, 0, 1)
      `).bind(userId).run();

      const { results: newResults } = await db.prepare('SELECT * FROM users WHERE encrypted_yw_id = ?')
        .bind(userId).all();
      results = newResults;
    }

    return new Response(JSON.stringify({ 
      success: true,
      stats: results[0]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get user stats' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Get all active tasks
async function getTasks(db, corsHeaders) {
  try {
    const { results } = await db.prepare('SELECT * FROM tasks WHERE is_active = 1 ORDER BY created_at DESC').all();

    return new Response(JSON.stringify({ 
      success: true,
      tasks: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get tasks' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Complete a task
async function completeTask(db, userId, body, corsHeaders) {
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User not authenticated' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { taskId } = body;
  if (!taskId) {
    return new Response(JSON.stringify({ error: 'Task ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Check if task exists and get details
    const { results: taskResults } = await db.prepare('SELECT * FROM tasks WHERE id = ? AND is_active = 1')
      .bind(taskId).all();

    if (taskResults.length === 0) {
      return new Response(JSON.stringify({ error: 'Task not found or inactive' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const task = taskResults[0];

    // Update user points
    const updateStmt = db.prepare(`
      INSERT OR REPLACE INTO users (encrypted_yw_id, flower_coins, flower_meta, level, updated_at)
      VALUES (
        ?, 
        COALESCE((SELECT flower_coins FROM users WHERE encrypted_yw_id = ?), 0) + ?,
        COALESCE((SELECT flower_meta FROM users WHERE encrypted_yw_id = ?), 0) + ?,
        CASE 
          WHEN (COALESCE((SELECT flower_coins FROM users WHERE encrypted_yw_id = ?), 0) + ?) >= 100
          THEN ((COALESCE((SELECT flower_coins FROM users WHERE encrypted_yw_id = ?), 0) + ?) / 100) + 1
          ELSE 1
        END,
        CURRENT_TIMESTAMP
      )
    `);

    const { success } = await updateStmt.bind(
      userId, userId, task.flower_coins, userId, task.flower_meta, 
      userId, task.flower_coins, userId, task.flower_coins
    ).run();

    if (!success) {
      throw new Error('Failed to complete task');
    }

    // Get updated user data
    const { results: updatedUser } = await db.prepare('SELECT * FROM users WHERE encrypted_yw_id = ?')
      .bind(userId).all();

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Task completed successfully',
      pointsEarned: task.flower_coins,
      metaEarned: task.flower_meta,
      user: updatedUser[0]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Complete task error:', error);
    return new Response(JSON.stringify({ error: 'Failed to complete task' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Create new task (admin only)
async function createTask(db, userId, body, corsHeaders) {
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User not authenticated' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { title, description, type = 'daily', priority = 'medium', flower_coins = 10, flower_meta = 0 } = body;

  if (!title) {
    return new Response(JSON.stringify({ error: 'Task title required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { success } = await db.prepare(`
      INSERT INTO tasks (title, description, type, priority, flower_coins, flower_meta, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(title, description, type, priority, flower_coins, flower_meta).run();

    if (!success) {
      throw new Error('Failed to create task');
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Task created successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Create task error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create task' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Get user ranking
async function getRanking(db, corsHeaders) {
  try {
    const { results } = await db.prepare(`
      SELECT 
        encrypted_yw_id as user_id,
        display_name,
        profile_photo,
        flower_coins,
        flower_meta,
        level,
        ROW_NUMBER() OVER (ORDER BY flower_coins DESC, flower_meta DESC) as rank
      FROM users 
      WHERE flower_coins > 0 OR flower_meta > 0
      ORDER BY flower_coins DESC, flower_meta DESC 
      LIMIT 50
    `).all();

    return new Response(JSON.stringify({ 
      success: true,
      ranking: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get ranking error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get ranking' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Update user profile photo
async function updateUserPhoto(db, userId, body, corsHeaders) {
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User not authenticated' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { photoData } = body;
  if (!photoData) {
    return new Response(JSON.stringify({ error: 'Photo data required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Validate base64 image data
    if (!photoData.startsWith('data:image/')) {
      return new Response(JSON.stringify({ error: 'Invalid image format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check file size limit (2MB for base64 data)
    if (photoData.length > 2000000) {
      return new Response(JSON.stringify({ error: 'Image too large. Please use an image smaller than 1.5MB.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // First, check if user exists, if not create them
    const existingUser = await db.prepare(
      'SELECT id FROM users WHERE encrypted_yw_id = ?'
    ).bind(userId).first();

    if (!existingUser) {
      // Create new user with photo
      const { success } = await db.prepare(`
        INSERT INTO users (encrypted_yw_id, profile_photo, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(userId, photoData).run();

      if (!success) {
        throw new Error('Failed to create user with photo');
      }
    } else {
      // Update existing user's photo
      const { success } = await db.prepare(`
        UPDATE users 
        SET profile_photo = ?, updated_at = CURRENT_TIMESTAMP
        WHERE encrypted_yw_id = ?
      `).bind(photoData, userId).run();

      if (!success) {
        throw new Error('Failed to update photo');
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Foto de perfil salva com sucesso!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update photo error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erro interno do servidor ao salvar foto' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Get monthly points history
async function getMonthlyPoints(db, userId, month, year, corsHeaders) {
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User not authenticated' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    let query, params;
    
    if (month && year) {
      // Get specific month
      query = 'SELECT * FROM monthly_points WHERE user_id = ? AND month = ? AND year = ?';
      params = [userId, parseInt(month), parseInt(year)];
    } else {
      // Get all months for user
      query = 'SELECT * FROM monthly_points WHERE user_id = ? ORDER BY year DESC, month DESC';
      params = [userId];
    }

    const { results } = await db.prepare(query).bind(...params).all();

    return new Response(JSON.stringify({ 
      success: true,
      monthlyPoints: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get monthly points error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get monthly points' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Perform monthly reset
async function performMonthlyReset(db, corsHeaders) {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
    const currentYear = now.getFullYear();

    // Get all users with current points
    const { results: users } = await db.prepare(`
      SELECT encrypted_yw_id, flower_coins, flower_meta 
      FROM users 
      WHERE flower_coins > 0 OR flower_meta > 0
    `).all();

    if (users.length === 0) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'No users to reset'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prepare batch operations
    const statements = [];

    for (const user of users) {
      // Save current month points to history
      statements.push(
        db.prepare(`
          INSERT OR REPLACE INTO monthly_points (user_id, month, year, flower_coins, flower_meta, created_at)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(user.encrypted_yw_id, currentMonth, currentYear, user.flower_coins, user.flower_meta)
      );

      // Reset user points
      statements.push(
        db.prepare(`
          UPDATE users 
          SET flower_coins = 0, flower_meta = 0, updated_at = CURRENT_TIMESTAMP 
          WHERE encrypted_yw_id = ?
        `).bind(user.encrypted_yw_id)
      );
    }

    // Execute all operations atomically
    const batchResults = await db.batch(statements);

    if (batchResults.some(r => !r.success)) {
      throw new Error('Failed to complete monthly reset');
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Monthly reset completed for ${users.length} users`,
      month: currentMonth,
      year: currentYear
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Monthly reset error:', error);
    return new Response(JSON.stringify({ error: 'Failed to perform monthly reset' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Get list of all users
async function getUserList(db, corsHeaders) {
  try {
    const { results } = await db.prepare(`
      SELECT encrypted_yw_id, display_name, flower_coins, flower_meta, level, created_at
      FROM users 
      ORDER BY flower_coins DESC, created_at DESC
    `).all();

    return new Response(JSON.stringify({ 
      success: true,
      users: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get user list error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get user list' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Create distribution history table if it doesn't exist
async function createDistributionHistoryTable(db) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS distribution_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        admin_id TEXT NOT NULL,
        type TEXT NOT NULL, -- 'add' or 'deduct'
        point_type TEXT NOT NULL, -- 'flower_coins' or 'flower_meta'
        amount INTEGER NOT NULL,
        reason TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      ) STRICT
    `).run();
  } catch (error) {
    console.error('Error creating distribution_history table:', error);
  }
}

// Get distribution history
async function getDistributionHistory(db, corsHeaders) {
  try {
    // Ensure table exists
    await createDistributionHistoryTable(db);

    const { results } = await db.prepare(`
      SELECT dh.*, u.display_name as user_name
      FROM distribution_history dh
      LEFT JOIN users u ON dh.user_id = u.encrypted_yw_id
      ORDER BY dh.created_at DESC
      LIMIT 50
    `).all();

    return new Response(JSON.stringify({ 
      success: true,
      history: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get distribution history error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get distribution history' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Update user points (add or deduct)
async function updateUserPoints(db, adminId, body, corsHeaders) {
  if (!adminId) {
    return new Response(JSON.stringify({ error: 'Admin not authenticated' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { userId, type, pointType, amount, reason } = body;
  if (!userId || !type || !pointType || !amount) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Ensure distribution history table exists
    await createDistributionHistoryTable(db);

    const pointField = pointType === 'flower_coins' ? 'flower_coins' : 'flower_meta';
    const operation = type === 'add' ? '+' : '-';
    
    // Prepare statements
    const updateUserStmt = db.prepare(`
      UPDATE users 
      SET ${pointField} = MAX(0, ${pointField} ${operation} ?), updated_at = CURRENT_TIMESTAMP 
      WHERE encrypted_yw_id = ?
    `);

    const logHistoryStmt = db.prepare(`
      INSERT INTO distribution_history (user_id, admin_id, type, point_type, amount, reason, created_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    // Execute atomically
    const batchResults = await db.batch([
      updateUserStmt.bind(amount, userId),
      logHistoryStmt.bind(userId, adminId, type, pointType, amount, reason || '')
    ]);

    if (batchResults.some(r => !r.success)) {
      throw new Error('Failed to update points');
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Points ${type === 'add' ? 'added' : 'deducted'} successfully`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update user points error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update points' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Update user display name
async function updateUserName(db, userId, body, corsHeaders) {
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User not authenticated' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { display_name } = body;
  if (!display_name) {
    return new Response(JSON.stringify({ error: 'Display name required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { success } = await db.prepare(`
      INSERT OR REPLACE INTO users (encrypted_yw_id, display_name, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).bind(userId, display_name).run();

    if (!success) {
      throw new Error('Failed to update name');
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Name updated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update name error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update name' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
// ===== Meta/IND Tasks helpers =====
async function ensureMetaIndTables(db) {
  try {
    if (!db || typeof db.prepare !== 'function') {
      throw new Error('DB not initialized');
    }
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS meta_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        points INTEGER DEFAULT 0,
        assigned_to_user_id TEXT,
        is_completed INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT
      ) STRICT
    `).run();
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS ind_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        points INTEGER DEFAULT 0,
        assigned_to_user_id TEXT,
        is_completed INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT
      ) STRICT
    `).run();
  } catch (e) {
    console.error('ensureMetaIndTables error:', e);
    throw e;
  }
}

async function getMetaTasks(db, corsHeaders, userId) {
  try {
    await ensureMetaIndTables(db);
    let stmt = db.prepare('SELECT * FROM meta_tasks WHERE is_active = 1 ORDER BY created_at DESC');
    if (userId) stmt = db.prepare('SELECT * FROM meta_tasks WHERE assigned_to_user_id = ? ORDER BY created_at DESC').bind(userId);
    const { results } = await stmt.all();
    return new Response(JSON.stringify({ success: true, tasks: results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('getMetaTasks error:', e);
    return new Response(JSON.stringify({ error: 'Failed to get meta tasks' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
}

async function createMetaTasks(db, body, corsHeaders) {
  try {
    await ensureMetaIndTables(db);
    const rawItems = Array.isArray(body.items) ? body.items : [];
    const items = rawItems
      .map(it => ({
        title: String(it.title || '').trim(),
        description: String(it.description || ''),
        points: parseInt(it.points || 0, 10),
        assigned_to_user_id: String(it.assigned_to_user_id || '').trim()
      }))
      .filter(it => it.title.length > 0 && Number.isFinite(it.points) && it.points > 0 && it.assigned_to_user_id.length > 0);
    if (!items.length) {
      return new Response(JSON.stringify({ success: false, error: 'No valid items provided' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let inserted = 0;
    const errors = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      try {
        const r = await db.prepare(
          'INSERT INTO meta_tasks (title, description, points, assigned_to_user_id, is_completed, is_active, created_at) VALUES (?, ?, ?, ?, 0, 1, CURRENT_TIMESTAMP)'
        ).bind(it.title, it.description, it.points, it.assigned_to_user_id).run();
        if (r && r.success) {
          inserted += 1;
        } else {
          errors.push({ index: i, user_id: it.assigned_to_user_id, title: it.title, message: 'Insert returned unsuccess' });
        }
      } catch (err) {
        errors.push({ index: i, user_id: it.assigned_to_user_id, title: it.title, message: err?.message || String(err) });
      }
    }

    return new Response(JSON.stringify({ success: errors.length === 0, inserted, requested: items.length, errors }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('createMetaTasks error:', e);
    return new Response(JSON.stringify({ success: false, error: e?.message || 'Failed to create meta tasks' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
}

async function getIndTasks(db, corsHeaders, userId) {
  try {
    await ensureMetaIndTables(db);
    let stmt = db.prepare('SELECT * FROM ind_tasks WHERE is_active = 1 ORDER BY created_at DESC');
    if (userId) stmt = db.prepare('SELECT * FROM ind_tasks WHERE assigned_to_user_id = ? ORDER BY created_at DESC').bind(userId);
    const { results } = await stmt.all();
    return new Response(JSON.stringify({ success: true, tasks: results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('getIndTasks error:', e);
    return new Response(JSON.stringify({ error: 'Failed to get IND tasks' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
}

async function createIndTasks(db, body, corsHeaders) {
  try {
    await ensureMetaIndTables(db);
    const rawItems = Array.isArray(body.items) ? body.items : [];
    const items = rawItems
      .map(it => ({
        title: String(it.title || '').trim(),
        description: String(it.description || ''),
        points: parseInt(it.points || 0, 10),
        assigned_to_user_id: String(it.assigned_to_user_id || '').trim()
      }))
      .filter(it => it.title.length > 0 && Number.isFinite(it.points) && it.points > 0 && it.assigned_to_user_id.length > 0);
    if (!items.length) {
      return new Response(JSON.stringify({ success: false, error: 'No valid items provided' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let inserted = 0;
    const errors = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      try {
        const r = await db.prepare(
          'INSERT INTO ind_tasks (title, description, points, assigned_to_user_id, is_completed, is_active, created_at) VALUES (?, ?, ?, ?, 0, 1, CURRENT_TIMESTAMP)'
        ).bind(it.title, it.description, it.points, it.assigned_to_user_id).run();
        if (r && r.success) {
          inserted += 1;
        } else {
          errors.push({ index: i, user_id: it.assigned_to_user_id, title: it.title, message: 'Insert returned unsuccess' });
        }
      } catch (err) {
        errors.push({ index: i, user_id: it.assigned_to_user_id, title: it.title, message: err?.message || String(err) });
      }
    }

    return new Response(JSON.stringify({ success: errors.length === 0, inserted, requested: items.length, errors }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('createIndTasks error:', e);
    return new Response(JSON.stringify({ success: false, error: e?.message || 'Failed to create IND tasks' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
}
