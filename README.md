# Interior CRM — UNIQUEFRAME CREATIONS

A CRM system that digitizes the early sales process of an interior design company: capturing customer
enquiries as **Leads**, progressing them through a structured workflow, converting won leads into **Deals**,
and giving management real-time visibility through a **Dashboard**.

Built for the Fresher Technical Assessment (POC Requirement Document v1.0).

---

## 1. Technology Stack

| Layer          | Technology                     |
|----------------|---------------------------------|
| Frontend       | Angular 18 (standalone components) |
| Backend        | NestJS 10                       |
| Database       | PostgreSQL                      |
| ORM            | Prisma ORM                      |
| Authentication | JWT (Passport)                  |
| Deployment     | Railway                         |

## 2. Architecture

```mermaid
graph TD
    A[Angular Frontend<br/>User Interface] -->|REST API over HTTPS| B[NestJS Backend<br/>API Server & Business Logic]
    B --> C[Prisma ORM<br/>Data Access Layer]
    C --> D[(PostgreSQL Database<br/>Data Storage)]
```

The Angular app is a pure client that talks to the NestJS API using a bearer JWT attached by an HTTP
interceptor. NestJS enforces authentication (`JwtAuthGuard`) and role-based authorization (`RolesGuard`,
plus service-level scoping so a Sales Executive only ever sees their own leads/deals) before touching the
database through Prisma.

## 3. Database Schema (ERD)

```mermaid
erDiagram
    USER ||--o{ LEAD : "assigned to"
    USER ||--o{ DEAL : "assigned to"
    USER ||--o{ LEAD_ACTIVITY : logs
    USER ||--o{ DEAL_ACTIVITY : logs
    LEAD ||--o| DEAL : "converts to"
    LEAD ||--o{ LEAD_ACTIVITY : has
    DEAL ||--o{ DEAL_ACTIVITY : has

    USER {
        string id PK
        string employeeName
        string email
        string mobile
        enum role
        boolean isActive
        string passwordHash
    }
    LEAD {
        string id PK
        string leadNumber
        string customerName
        string mobile
        string email
        enum propertyType
        float budget
        enum source
        enum status
        string assignedToId FK
    }
    DEAL {
        string id PK
        string dealNumber
        string leadId FK
        float estimatedBudget
        date expectedClosureDate
        int probability
        enum stage
        string assignedToId FK
    }
```

Minimum required entities (User, Role, Lead, Deal) are all present; `LeadActivity` / `DealActivity` were
added to support the "Notes & Activity" / "Activity Timeline" requirements without overloading a single
notes field.

## 4. Roles & Access

| Feature              | Admin | Sales Manager | Sales Executive   |
|-----------------------|:-----:|:--------------:|:------------------:|
| Login                 | ✓     | ✓               | ✓                   |
| Create/Edit User      | ✓     | ✗               | ✗                   |
| View All Leads/Deals  | ✓     | ✓               | Assigned only       |
| Assign Lead           | ✓     | ✓               | ✗                   |
| Convert Lead to Deal  | ✓     | ✓               | ✓ (assigned only)   |
| Delete Lead/Deal      | ✓     | ✗               | ✗                   |

This is enforced both by `RolesGuard` (route-level) and inside each service method (row-level scoping /
ownership checks), matching the business rules in the requirement document (e.g. "Sales Executives can
edit only their assigned Leads").

## 5. Running Locally

### Prerequisites
- Node.js 20+
- A local or hosted PostgreSQL instance

### Backend

```bash
cd backend
cp .env.example .env      # then edit DATABASE_URL / JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run seed               # loads sample users, leads, and a deal
npm run start:dev          # http://localhost:3000/api
```

### Frontend

```bash
cd frontend
npm install
npm start                  # http://localhost:4200
```

The frontend reads the API base URL from `src/environments/environment.ts` (defaults to
`http://localhost:3000/api`).

## 6. Environment Variables

See `backend/.env.example`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/interior_crm?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="8h"
PORT=3000
FRONTEND_URL="http://localhost:4200"
```

## 7. Deployment (Railway)

1. **Database** — create a PostgreSQL plugin in Railway; copy the generated `DATABASE_URL`.
2. **Backend** — create a service from the `backend/` folder (or a separate repo pointing at it).
   Set `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL` as variables. Railway uses
   `backend/railway.json`, which runs `prisma migrate deploy` before starting the server.
3. **Frontend** — create a second service from `frontend/`. Before building, update
   `src/environments/environment.prod.ts` with the deployed backend's `/api` URL. Railway uses
   `frontend/railway.json`, which builds the Angular app and serves the static output with `serve`.
4. Once both are live, run `npm run seed` against the production database (locally, pointing
   `DATABASE_URL` at the Railway Postgres instance) to load sample test data.

## 8. Test Credentials

All seeded users share the password `Password@123`.

| Role            | Email                        |
|------------------|-------------------------------|
| Administrator    | admin@uniqueframe.com         |
| Sales Manager    | manager@uniqueframe.com       |
| Sales Executive  | exec1@uniqueframe.com         |
| Sales Executive  | exec2@uniqueframe.com         |

## 9. REST API Summary

| Method | Endpoint                | Description                        |
|--------|--------------------------|-------------------------------------|
| POST   | /api/auth/login          | Authenticate, returns JWT           |
| GET    | /api/auth/profile        | Current user info                   |
| POST   | /api/users                | Create user (Admin)                |
| GET    | /api/users                | List users (Admin/Manager)         |
| PUT    | /api/users/:id            | Update user (Admin)                |
| GET    | /api/users/sales-staff    | Active staff for lead/deal assignment |
| POST   | /api/leads                | Create lead                        |
| GET    | /api/leads?search=&status=&source=&assignedToId=&propertyType=&minBudget=&maxBudget=&sortBy=&sortOrder= | List/search/filter leads |
| GET    | /api/leads/:id             | Lead detail + activity              |
| PUT    | /api/leads/:id             | Update lead                         |
| DELETE | /api/leads/:id             | Delete lead (Admin)                 |
| POST   | /api/leads/:id/notes        | Add a follow-up note                |
| POST   | /api/leads/:id/convert       | Convert a Won lead into a Deal      |
| GET    | /api/deals                 | List/search/filter deals            |
| GET    | /api/deals/:id              | Deal detail + timeline              |
| PUT    | /api/deals/:id              | Update deal                         |
| PATCH  | /api/deals/:id/stage         | Update deal stage (Confirmed/Lost)  |
| GET    | /api/dashboard/summary       | Combined lead + deal metrics        |

## 10. Business Rules Implemented

- Lead/Deal numbers are auto-generated (`LD-YYYY-####`, `DL-YYYY-####`).
- Lead mobile numbers must be unique; customer name and assigned executive are mandatory.
- Only a lead with status `WON` can be converted into a deal, and only once.
- A deal's expected closure date cannot be earlier than its creation date.
- A `CONFIRMED` deal becomes read-only except for Admins.
- Marking a deal `LOST` requires a reason.
- Sales Executives are scoped to their own assigned leads/deals everywhere (list, detail, edit).
- Only Admins can delete leads; deleting deals is restricted to Admins and generally discouraged.
- Passwords are hashed with bcrypt; inactive users cannot log in.

## 11. Project Structure

```
interior-crm/
├── backend/         NestJS API (auth, users, leads, deals, dashboard modules)
│   ├── prisma/       schema.prisma, seed.ts
│   └── src/
└── frontend/        Angular app (standalone components, signals)
    └── src/app/
        ├── core/      services, guards, interceptors, models
        ├── features/  auth, dashboard, leads, deals, users
        └── shared/    shell layout
```
