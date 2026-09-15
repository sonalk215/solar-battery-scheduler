# National Battery Installation Dispatch Dashboard

A full-stack web application designed for scheduling teams to manage, dispatch, and track national battery installations. It features a responsive drag-and-drop React frontend, a robust Node.js/Prisma rules engine backend, PostgreSQL persistence, and live Open-Meteo weather risk synchronization.

---

## Tech Stack

* **Frontend**: React (v19), Vite, Tailwind CSS (v4), React Icons, Native HTML5 Drag-and-Drop.
* **Backend**: Node.js, Express, Prisma ORM, PostgreSQL, `csv-parser`.
* **Integrations**: Open-Meteo API for real-time weather risk thresholds (>40 km/h wind, >15 mm rain).

---

## Project Structure

```text
solar-scheduler/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic & request handlers
│   │   ├── routes/          # API routing (jobs, installers, weather)
│   │   ├── services/        # Rules engine & weather integration
│   │   ├── db.js            # Prisma client instance
│   │   ├── seed.js          # CSV database seeding script
│   │   └── server.js        # Express application entry point
│   ├── prisma/              # Database schema & migrations
│   ├── installers.csv       # Initial installer roster dataset
│   └── jobs.csv             # Initial jobs dataset
└── frontend/
    ├── src/
    │   ├── components/      # UI Modules (UnscheduledDrawer, ScheduleGrid)
    │   ├── services/        # Axios API client
    │   ├── App.jsx          # Main layout & state orchestrator
    │   └── index.css        # Tailwind v4 import setup
    └── package.json
```

## Getting Started & Installation

### Prerequisites

* Node.js (v18 or higher)
* PostgreSQL running locally or via a cloud provider


### Step 1: Backend Setup & Configuration

#### 1. Navigate to the backend directory and install dependencies:
```
cd backend
npm install
```

#### 2. Configure your environment variables:
  Create a .env file in the root of your backend folder and add your PostgreSQL connection string and port:
```
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/solar_scheduler?schema=public"
PORT=4000
```

#### 3. Push the database schema and seed data:
  Run the Prisma migration tool to set up your tables, populate them from your CSV datasets using the seed script, and start the development server:
```
# Push schema to PostgreSQL
npx prisma db push

# Seed installers and jobs from CSV files
npm run seed

# Start the backend server (runs on http://localhost:4000)
npm run dev
```

### Step 2: Frontend Setup & Running

#### 1. Open a new terminal window, navigate to the frontend directory, and install dependencies:
```
cd frontend
npm install
```

#### 2. Start the frontend development server:
  
```
npm run dev
```
Vite will serve the application locally on http://localhost:5173

## Core Features & Rules Engine

* **Persistent Drag-and-Drop Dispatch:** Drag unscheduled jobs from the left queue drawer onto any installer's day column. Changes persist instantly to PostgreSQL and survive page refreshes.
* **Sequential Stacking:** Drop multiple jobs on the same day; subsequent jobs automatically calculate start times back-to-back based on preceding job completions.
* **Automated Rules Enforcement (validateAssignment):**
  * **State Matching:** Prevents cross-state dispatches unless matched.
  * **Shift Bounds:** Ensures jobs fit entirely within the installer's shift working hours.
  * **Leave & Working Days:** Blocks scheduling during approved leave periods or off-days.
  * **Daily Capacity & Overlap:** Prevents double-booking and restricts total daily hours from exceeding shift length limits.
* **Weather Risk Warnings:** Highlights high-risk days on the dispatch grid based on live Open-Meteo wind and precipitation forecasts.

