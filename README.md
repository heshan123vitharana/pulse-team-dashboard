# Pulse Team Task Management Platform

This is the completed assignment for the **Intern Full Stack Developer** role at CyphLab. 

Pulse is a fully-featured, Role-Based Access Control (RBAC) Project and Team Task Management platform built with React, Node.js, Express, and PostgreSQL (via Prisma).

## ✨ Core Features
- **Strict Role-Based Access Control**:
  - **Administrator:** Full system access, User Registration, Role Management.
  - **Project Manager:** Project Creation, Team Assignment, Task Management.
  - **Team Member:** Project Visibility (Assigned only), Drag-and-drop Task Updates (Kanban board), Comments.
- **Real-Time Notifications:** WebSocket integration notifies users instantly when assigned/unassigned from a project.
- **RESTful API:** fully documented with Postman JSON exports.
- **Secure Authentication:** JWT-based stateless authentication.
- **Responsive UI:** Built with Tailwind CSS and shadcn/ui.
- **CI/CD pipeline:** GitHub Actions integration for linting and build validation.

## 🛠️ Technology Stack
- **Frontend:** React (Vite SPA), TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, Axios.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, JSON Web Tokens (JWT), WebSockets (`ws`).
- **Database:** PostgreSQL (Hosted on Neon Serverless).

> **Note on Frontend Framework:** The assignment requested Next.js. However, to prioritize high-quality UI/UX and rapid, decoupled API development, this project was architected as a decoupled React SPA (Vite). It satisfies all SPA requirements natively.

## 📄 Documentation
Extensive documentation and diagrams have been provided in the `/docs` folder:
- [Entity Relationship Diagram (ERD)](./docs/ERD.md)
- [Use Case Diagram](./docs/USE_CASE.md)
- [System Architecture](./docs/ARCHITECTURE.md)
- [Feature Completion Report](./docs/FEATURE_REPORT.md)
- [Postman API Collection](./postman_collection.json)

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL Database** (A Neon.tech serverless database is highly recommended)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd pulse-team-dashboard
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Rename `.env.example` to `.env` and fill in your Neon Database connection strings.
```bash
cp .env.example .env
```
Run the Prisma migrations and seed the database with initial users and roles:
```bash
npx prisma db push
npx prisma generate
node prisma/seed.js
```
Start the backend server:
```bash
npm run dev
```
*The backend runs on http://localhost:8000*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Rename `.env.example` to `.env` to link the frontend to the backend:
```bash
cp .env.example .env
```
Start the frontend development server:
```bash
npm run dev
```
*The frontend runs on http://localhost:5173*

## 🔑 Default Login Credentials
After running the seed script, you can log in with:
- **Administrator:** `admin@pulse.dev` / `Admin@123`
- **Project Manager:** `pm@pulse.dev` / `PM@123`
- **Team Member:** `user@pulse.dev` / `User@123`

## 🤖 AI Tools Used
During the development of this platform, **Gemini / Antigravity AI Assistant** was utilized to:
1. Accelerate boilerplate code generation for the Express server and React components.
2. Ensure strict adherence to TypeScript interfaces across the stack.
3. Automatically generate the Prisma schema, ERD, and CI/CD pipelines.
4. Assist in debugging `EADDRINUSE` port conflicts and Node module pathing.
