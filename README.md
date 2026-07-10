<div align="center">
  <img src="frontend/public/logo.png" alt="Pulse Logo" width="120" />
  <h1>Pulse Team Dashboard</h1>
  <p>A full-stack web application for team members to submit structured weekly work reports, and for managers to view and analyze those reports through a consolidated, AI-powered dashboard.</p>
</div>

---

## ✨ Features

- **Role-Based Access Control:** Secure, separate views for **Managers** and **Team Members**.
- **Weekly Reports:** Fixed-structure report generation for consistency across the entire team.
- **Manager Dashboard:** Track team workload, submission compliance, and blockers in real-time.
- **Beautiful Visual Insights:** Interactive charts and graphs powered by Recharts.
- **AI Chat Assistant (Bonus):** Built-in Groq AI assistant (`llama3-8b-8192`) to answer manager queries about team activities.
- **Project Tracking:** Easily categorize work by assigning reports to specific active projects.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4 + Shadcn UI
- **State & Data Fetching:** Axios, React Router v7
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Framework:** Python + FastAPI
- **Database ORM:** SQLAlchemy
- **Database:** SQLite (Default, easy to swap for PostgreSQL/MySQL)
- **Authentication:** JWT (JSON Web Tokens) & Passlib hashing
- **AI Integration:** Groq Python SDK

---

## 🚀 Setup Instructions

Follow these instructions to get the project up and running on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Python](https://www.python.org/) (v3.9+ recommended)
- Git

### 1. Database Setup
This project uses **SQLite** by default for an effortless, zero-config setup. 
The database file (`pulse.db`) will automatically be generated in the backend directory when you start the server. No external database installation is required out-of-the-box!

*(Optional: If you wish to use PostgreSQL or MySQL, simply update the `SQLALCHEMY_DATABASE_URL` in `backend/.env`)*

### 2. Backend Setup
Open a terminal and navigate to the `backend` directory:

```bash
cd backend
```

**Create and activate a virtual environment:**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Environment Variables:**
Create a `.env` file in the `backend` directory and add the following:
```env
# backend/.env
SECRET_KEY=your_super_secret_jwt_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GROQ_API_KEY=your_groq_api_key_here
```

**Run the Backend Server:**
```bash
python -m uvicorn app.main:app --reload
```
*The backend API will now be running on `http://localhost:8000`*

### 3. Frontend Setup
Open a **new** terminal window and navigate to the `frontend` directory:

```bash
cd frontend
```

**Install dependencies:**
```bash
npm install
```

**Run the Frontend Development Server:**
```bash
npm run dev
```
*The frontend will now be running on `http://localhost:5173`*

---

## 🔑 Default Roles & Access
You can register new users through the application (if you are an admin), but the system typically starts with one Manager account to manage the dashboard. 

*(If you need to manually seed a manager, you can do so directly in the SQLite database or via a fast-tracked signup endpoint).*

---

## 📸 Screenshots
*(Feel free to add your own screenshots of the Dashboard, AI Chat widget, and Report submission pages here!)*

---
<div align="center">
  <i>Built as part of a technical assignment.</i>
</div>
