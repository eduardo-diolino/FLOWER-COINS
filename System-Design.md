# FLOWER COINS - Gamified Task Management Platform

## Overview

FLOWER COINS is a gamified enterprise task management platform designed to increase employee motivation, engagement, and productivity through game mechanics such as points, rewards, rankings, and mascot interaction. **Now powered by a complete backend and real production-ready features!**

---

# Platform Structure

## Main Pages

- **index.html** – Login page with real authentication powered by Supabase.
- **employee.html** – Employee dashboard featuring tasks, points, ranking, rewards, and mascot chat synchronized with the database.
- **admin.html** – Administrative dashboard for managing employees, tasks, rewards, and statistics.

---

# Database (Supabase)

### Tables

- **users** – Stores employee and administrator accounts with authentication.
- **tasks** – Tasks created by administrators.
- **user_progress** – Stores employee task completion progress.
- **user_stats** – Consolidated employee statistics including points, rewards, level, and ranking.

---

# Implemented Features

## Real Authentication System

- ✅ Secure authentication using Supabase.
- ✅ Employee registration with validation.
- ✅ Administrator and employee role separation.
- ✅ Persistent user sessions.
- ✅ Database-driven authentication.

---

## Dynamic Task Management

- ✅ Administrators can create tasks.
- ✅ Newly created tasks automatically appear for employees.
- ✅ Task completion is saved in the database.
- ✅ Task categories:
  - Daily
  - Weekly
  - Monthly
  - One-Time
- ✅ Priority levels:
  - Low
  - Medium
  - High
  - Critical
- ✅ Custom point values per task.

---

## Points & Rewards System

- ✅ Automatic conversion (10 Points = R$1.00).
- ✅ Automatic level calculation.
- ✅ Real-time statistics updates.
- ✅ Celebration effects including confetti, sounds, and animations.

---

## Employee Dashboard

- ✅ Personalized dashboard.
- ✅ Dynamic task loading.
- ✅ Progress bars and completion indicators.
- ✅ Global employee ranking.
- ✅ Chat with the mascot **Miss Florzinha**.
- ✅ Rainbow animations and interactive effects.

---

## Administrator Dashboard

- ✅ Complete analytics dashboard.
- ✅ Full Task CRUD.
- ✅ Employee management.
- ✅ Top performer ranking.
- ✅ Recent activity feed.
- ✅ Productivity reports.
- ✅ Real-time statistics.

---

## Security & Performance

- ✅ Row Level Security (RLS).
- ✅ Role-based access control.
- ✅ Automatic database triggers.
- ✅ Optimized indexes for performance.

---

# Technology Stack

## Frontend

- HTML5
- CSS3
- JavaScript (ES6+)

## Styling

- Tailwind CSS
- Custom CSS Animations

## Backend

- Supabase

## Database

- PostgreSQL

## Authentication

- Supabase Authentication

## Real-Time Features

- Supabase Realtime Subscriptions

---

# Access Credentials

## Administrator

**Username**

AGNA COSTA PCP

**Password**

AgPc@2011

---

## Employees

Employees can:

- Create their own account using the **Create Employee Account** option.
- Or log in using the flexible authentication system.

---

# System Architecture

## Data Flow

1. User Login
   - Authentication via Supabase.

2. Task Creation
   - Administrator creates tasks.

3. Task Assignment
   - Tasks become immediately available to employees.

4. Task Completion
   - Progress is saved in **user_progress**.

5. Statistics Update
   - **user_stats** is automatically updated.

6. Ranking Calculation
   - Rankings are recalculated through database triggers.

7. Dashboard Synchronization
   - Real-time data displayed throughout the platform.

---

# Automatic Database Triggers

### update_user_stats()

Automatically updates employee statistics after task completion.

### update_updated_at_column()

Automatically updates modification timestamps.

---

# Security Policies (RLS)

- Employees can only access their own data.
- Administrators have full access.
- Tasks are publicly available to employees.
- Progress records remain private for each user.

---

# Highlighted Features

## 🎮 Complete Gamification

- Level system.
- Global leaderboard.
- Celebration animations.
- Live progress tracking.

---

## 🔄 Real-Time Synchronization

- Instant task delivery.
- Automatic statistics updates.
- Dynamic leaderboard.

---

## 📊 Advanced Analytics

- Administrative dashboard.
- Top performer tracking.
- Recent activity monitoring.
- Productivity reports.

---

## 🎨 Rainbow User Interface

- Advanced CSS animations.
- Colorful FLOWER COINS theme.
- Falling coin animations.
- Sparkles and glow effects.

---

# Future Development

## Planned Features

- [ ] GPT-powered AI Assistant
- [ ] Real-time Push Notifications
- [ ] Achievement & Badge System
- [ ] PDF Report Generator
- [ ] REST API
- [ ] Mobile Application (React Native)

---

# Scalability

The platform is designed to support enterprise-scale growth.

- Optimized PostgreSQL database.
- High-performance indexing.
- Secure architecture.
- Modular codebase.
- Ready for thousands of concurrent users.

---

# Status

✅ **FULLY OPERATIONAL**

- Real database
- Secure authentication
- Complete task management
- Live synchronization
- Production-ready architecture

---

# Development Notes

This document provides guidance to **YOUWARE Agent (youware.com)** when working with the source code in this repository.

---

# Update: FLOWER IND

## New Currency: FLOWER IND

A new synchronized reward currency called **FLOWER IND** has been introduced.

### Database

New column:

- **user_stats.flowers_ind_distributed** *(INTEGER DEFAULT 0)*

New table:

**ind_tasks**

- id
- title
- description
- points
- flower_ind
- assigned_to_user_id
- is_completed
- created_at
- completed_at
- is_active

---

## Administrator Interface

- New **"Distribute FLOWER IND"** button in the header with an employee selection modal.
- New **"New IND Task"** button next to **"New Meta Task"**.
- Task type selector now supports:
  - Normal
  - Meta
  - IND
- Complete IND/META task management:
  - Enable/Disable
  - Edit
  - Delete

---

## Employee Interface

- Dedicated **FLOWER IND** card with a bright pink design.
- Counter synchronized with the database.
- Uses the image:

```
/assets/img/FLOWER IND.png
```

- Dedicated **FLOWER IND Tasks** section.
- Automatic counter updates after task completion.

---

## Source Code

Main script:

```
assets/js/flower-ind.js
```

Responsibilities:

- UI injection
- Database schema RPC
- FLOWER IND distribution
- IND task management

Additionally,

```
sync_manager.js
```

now synchronizes:

- **flowers_ind_distributed**

inside **syncUserStats()**.

---

## Notes

By default, **FLOWER IND** behaves similarly to the **META** reward system and **does not reset monthly**.

A monthly reset mechanism can be enabled in the future if required.