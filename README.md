# VConnect NFC Card - React & Express Migration

This project is a complete migration of the original PHP Admin Panel and Website to a modern web stack: a **React frontend** (Vite SPA) and a **modular Express backend** (Node.js), utilizing the existing MySQL database structure.

Tagline: One Tap. Infinite Connections.

---

## Folder Structure

```
VConnect/
├── backend/            # Express API Server
│   ├── controllers/    # API Request Handlers
│   ├── routes/         # Express Routing
│   ├── middleware/     # Auth & Geolocation Visitor tracking middlewares
│   ├── services/       # OTP and third-party delivery services
│   ├── db/             # Pool connection helper
│   ├── app.js          # App configurations
│   ├── server.js       # Listener entry point
│   └── .env            # Configurable environment variables
│
├── frontend/           # Vite React Client
│   ├── src/
│   │   ├── context/    # Global State Auth provider
│   │   ├── pages/      # Router pages (LandingPage, Login, AdminDashboard, Cards)
│   │   ├── index.css   # Premium styling tokens and animations
│   │   └── App.jsx     # Router config
│   └── vite.config.js  # Reverse proxies setup
│
├── uploads/            # Shared user uploads directory (profile banners & QRs)
└── README.md
```

---

## Backend Environment Setup

Create `backend/.env` (already created with defaults) and customize the variables:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=mysql
DB_NAME=bkads
JWT_SECRET=bkads_secret_key_jwt_session_secure_2026
WHATSAPP_API_URL=https://wbot.dhanyafamilysaloon.in/send-message
QR_BASE_URL=http://localhost:5173/profile
NODE_ENV=development
```

---

## How to Install & Run Locally

### 1. Pre-requisites
- **Node.js**: Make sure Node.js (version 18+) is installed on your computer.
- **MySQL**: Your MySQL server should be running locally with the database `bkads` and credentials matching the `.env` settings.

### 2. Run the Express Backend
Open your terminal inside the `backend` folder:
```bash
cd backend
npm install
npm run dev
```
The server will start listening on port `5000` and automatically verify MySQL database connection.

### 3. Run the React Frontend
Open another terminal inside the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
Vite will start the client dev server at `http://localhost:5173`. 
The configuration routes `/api` and `/uploads` requests automatically to the backend port.

---

## Verifying the Migration

1. **Visitor Tracking**: Visit the landing page `http://localhost:5173/`. Verify that the page view triggers visitor logging in the `visitor_logs` table (with IP, browser info, and geolocation FALLBACK calls).
2. **User OTP Sign Up**: Visit `http://localhost:5173/signup`. Enter user details and verify that the backend generates and sends a WhatsApp verification code, and registers it inside the `otp_logs` table.
3. **Profile Creation**: Complete the registration by adding a profile photo, choosing template themes, and saving. Verify the record is saved inside the `profile` table and your session cookies are set.
4. **QR Generation**: Log in, view your live card profile, and click "Generate QR Code". Verify that a QR image is generated, saved under `uploads/qrcode/`, and downloads successfully.
5. **Admin Panels**: Go to `http://localhost:5173/admin/login` and sign in using your admin credentials (Username: `bkads`, Password: `123`). Access stats charts, search profiles, toggling status for admin users, and export CSV files.
