# 🏋️ FitPro Gym Management System

) — reimagined with a full MySQL schema, Node.js REST API, JWT auth, and a premium dark-mode dashboard.

---

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Database | **MySQL** (schema.sql — 7 tables, views, stored proc, trigger) |
| Backend  | **Node.js + Express** REST API |
| Auth     | **JWT** tokens + bcrypt password hashing |
| Frontend | **Vanilla HTML/CSS/JS** + Chart.js |

---

## Project Structure

```
gym management system/
├── database/
│   └── schema.sql              ← Full MySQL schema (run this first!)
├── backend/
│   ├── config/db.js            ← MySQL connection pool
│   ├── controllers/            ← authController, memberController, ...
│   ├── middleware/auth.js      ← JWT middleware
│   ├── routes/                 ← auth, members, trainers, packages, ...
│   ├── server.js               ← Express app entry point
│   ├── .env.example            ← Copy to .env and fill in
│   └── package.json
└── frontend/
    ├── index.html              ← Single-page app
    ├── style.css               ← Dark-mode glassmorphism
    └── app.js                  ← All frontend logic
```

---

## Setup Instructions

### 1. Database
```sql
-- In MySQL Workbench or mysql CLI:
source /path/to/database/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials

npm install
npm run dev      # runs on http://localhost:5000
```

### 3. Frontend
Open `frontend/index.html` directly in a browser, or serve with:
```bash
npx serve frontend
```

### 4. Login
- **Username:** `admin`
- **Password:** `pass`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login → JWT |
| GET  | `/api/members/stats` | Dashboard stats |
| GET  | `/api/members` | List all members |
| POST | `/api/members` | Add member |
| PUT  | `/api/members/:id` | Update member |
| DELETE | `/api/members/:id` | Delete member |
| GET  | `/api/trainers` | List trainers |
| POST | `/api/trainers` | Add trainer |
| GET  | `/api/packages` | List packages |
| POST | `/api/packages` | Add package |
| GET  | `/api/memberships` | List memberships |
| POST | `/api/memberships` | Enroll member (calls stored proc) |
| GET  | `/api/memberships/expiring` | Expiring in 7 days |
| GET  | `/api/payments` | List payments |
| GET  | `/api/payments/monthly` | Monthly revenue chart data |

---

## 🚀 Deployment & Hosting

The application is architected for seamless cloud deployment. For the current live environment, the following stack is used:

*   **Version Control:** Hosted on **GitHub** ([lover3123/GYM-MANAGEMENT_SYSTEM](https://github.com/lover3123/GYM-MANAGEMENT_SYSTEM)) for automated CI/CD.
*   **Database:** Hosted on **Aiven MySQL** (Free Tier). This provides a managed, secure relational database with 99.9% uptime.
*   **Backend (API):** Deployed on **Render** (Web Services). Render automatically pulls from GitHub and redeploys on every push.
*   **Frontend:** Deployed on **Vercel**. Provides ultra-fast content delivery (CDN) and global availability.

---

## ER Diagram

See [ER_DIAGRAM.md](./ER_DIAGRAM.md) for the full entity-relationship diagram and database design notes.
