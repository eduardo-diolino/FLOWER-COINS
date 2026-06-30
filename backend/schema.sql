-- FLOWER COINS Database Schema
-- Updated for Youware Backend with photo persistence, monthly reset system, and admin notifications

-- Users table with Youware Backend integration
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    encrypted_yw_id TEXT NOT NULL UNIQUE,
    display_name TEXT,
    photo_url TEXT,
    profile_photo TEXT, -- Base64 encoded photo for persistence
    flower_coins INTEGER DEFAULT 0,
    flower_meta INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
) STRICT;

-- Monthly points history for automatic reset system
CREATE TABLE monthly_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, -- encrypted_yw_id
    month INTEGER NOT NULL, -- 1-12
    year INTEGER NOT NULL,
    flower_coins INTEGER DEFAULT 0,
    flower_meta INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month, year)
) STRICT;

-- Tasks table for available tasks
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    flower_coins INTEGER DEFAULT 0,
    flower_meta INTEGER DEFAULT 0,
    type TEXT DEFAULT 'daily', -- daily, weekly, monthly, one-time
    priority TEXT DEFAULT 'medium', -- low, medium, high, critical
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
) STRICT;

-- Admin notifications table
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id TEXT NOT NULL,
    title TEXT,
    message TEXT NOT NULL,
    audience TEXT DEFAULT 'all',
    is_published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
) STRICT;

-- Distribution history table for manual adjustments
CREATE TABLE distribution_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    admin_id TEXT NOT NULL,
    type TEXT NOT NULL,
    point_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
) STRICT;

-- Create indexes for better performance
CREATE INDEX idx_users_encrypted_yw_id ON users(encrypted_yw_id);
CREATE INDEX idx_monthly_points_user_month ON monthly_points(user_id, month, year);
CREATE INDEX idx_tasks_is_active ON tasks(is_active);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_distribution_history_created_at ON distribution_history(created_at DESC);

-- Meta and IND tasks tables
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
) STRICT;

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
) STRICT;
