# ServiDesk – Employee Service Request Management System

A full-stack Employee Service Request Management System built using React, Node.js, Express.js, and PostgreSQL.

ServiDesk allows employees to submit and track service requests, agents to manage and resolve tickets, and administrators to manage users and monitor the entire platform.

## Features

### Employee
- Secure login and registration
- Create service requests
- View personal service requests
- Track ticket status
- View ticket details and activity
- Add comments to requests

### Agent
- View all service requests
- Assign tickets to themselves
- Update ticket status
- Add public comments and internal notes
- View ticket activity

### Admin
- Admin dashboard with platform statistics
- Manage employees and agents
- Create new employee and agent accounts
- Activate and deactivate users
- Assign tickets to agents
- Update ticket status
- Monitor all service requests

## Technology Stack

**Frontend**
- React.js
- Vite
- React Router
- Axios
- Lucide React
- CSS

**Backend**
- Node.js
- Express.js
- JWT Authentication
- bcryptjs
- Zod Validation

**Database**
- PostgreSQL

## Project Structure

```text
ServiDesk/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Installation and Setup

### 1. Clone Repository

```bash
git clone https://github.com/AveshKumar12/Arrowstack-Task-2-ServiDesk
cd Arrowstack-Task-2-ServiDesk
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the server folder:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=servidesk_db
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d
```

Configure PostgreSQL and create the `servidesk_db` database. Run your project's database schema and seed scripts to create the required tables and departments.

Start the backend:

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

### 3. Frontend Setup

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend will run at the Vite URL shown in your terminal, usually `http://localhost:5173`.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register employee |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get logged-in user |
| GET | `/api/requests/my-requests` | Employee requests |
| POST | `/api/requests` | Create request |
| GET | `/api/requests/all` | View all requests |
| PATCH | `/api/requests/:id/assign` | Assign request |
| PATCH | `/api/requests/:id/status` | Update request status |
| GET | `/api/admin/dashboard` | Admin statistics |
| GET | `/api/admin/users` | View users |
| POST | `/api/admin/users` | Create employee or agent |
| PATCH | `/api/admin/users/:id` | Update user |
| GET | `/api/admin/tickets` | View all tickets |

All protected endpoints require a valid JWT Bearer token.

## Security
- Password hashing with bcryptjs
- JWT-based authentication
- Role-based authorization
- Protected API routes
- Input validation
- Environment variables for sensitive configuration

## Project Information

**Project:** ServiDesk – Employee Service Request Management System  
**Program:** Arrowstack Virtual Internship Program  
**Track:** Advanced Technical Track  
**Domain:** Full Stack Development  
**Batch:** 2026

## Author

Avesh Kumar

