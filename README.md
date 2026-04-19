# FitQuest 🍄

A gamified fitness tracker with a Mario-style world map and RPG progression system. Built for people who want to start getting healthier without the intimidation of a traditional fitness app.

## Tech Stack

- **Vite + React + TypeScript** — fast dev experience
- **Supabase** — auth and database
- **Tailwind CSS** — styling
- **React Router v6** — navigation

## Features

- 🔐 Email/password auth with persistent sessions
- 🗺️ Mario-style world map with 5 unlockable zones
- ⭐ XP + leveling system (500 XP per level)
- 📝 Daily activity logging with XP calculations
- ⚔️ Weekly quests tailored to your fitness goal
- 🏆 Achievement badges (8 total)
- 📊 Profile with lifetime stats + weight journey

---

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (~2 minutes)
3. Go to **Settings → API** and copy:
   - **Project URL**
   - **anon/public key**

### 2. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **Run**

This creates the `profiles`, `daily_logs`, `achievements`, and `quest_completions` tables with Row Level Security enabled.

### 3. Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add environment variables in the Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

---

## XP System

Each activity contributes XP toward leveling up (500 XP per level):

| Activity | Goal | Max XP |
|---|---|---|
| Steps | 10,000 | 100 XP |
| Miles | 3 | 100 XP |
| Strength Sets | 15 | 100 XP |
| Water Cups | 8 | 50 XP |
| Sleep Hours | 8 | 75 XP |
| Calories Burned | 500 | 100 XP |
| Weight Logged | — | 25 XP |

**Max per day: 550 XP**

## Zone Unlock Levels

| Zone | Name | Unlocks at |
|---|---|---|
| 1 | Mushroom Plains 🍄 | Level 1 (start) |
| 2 | Boulder Ridge 🪨 | Level 3 |
| 3 | Crystal Caves 💎 | Level 6 |
| 4 | Volcano Peak 🌋 | Level 10 |
| 5 | Sky Fortress ⚡ | Level 15 |

## Achievements

| Badge | Condition |
|---|---|
| First Steps 👟 | Log your first day |
| Week Warrior 🗡️ | Log 7 days in a row |
| Iron Will 🛡️ | Complete a full week of quests |
| Speedster ⚡ | Run 10 miles in a week |
| Hydration Hero 💧 | Hit water goal 5 days in a row |
| Level Up! ⭐ | Reach Level 2 |
| Halfway There 🏆 | Reach Level 3 |
| Zone Conqueror 💎 | Unlock Zone 3 |
