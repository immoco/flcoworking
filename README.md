# FL Smartech Spaces

A coworking booking platform monorepo with a React/Vite frontend, Express/Prisma backend, and shared types/constants.

## Project Structure

- `client/` — React frontend built with Vite and Tailwind CSS.
- `server/` — Express API server with Prisma and PostgreSQL.
- `shared/` — Shared constants and types used across the app.

## Setup Instructions

1. Install dependencies
   - `cd /home/sanjaysakthi/FLSmartech/flcoworking`
   - `npm install`
   - `cd server && npm install`
   - `cd ../client && npm install`

2. Configure environment variables
   - Create a `.env` file in `server/`.
   - Add the required variables listed below.

3. Generate Prisma client and run migrations
   - `cd server`
   - `npm run prisma:generate`
   - `npm run migrate`

4. Seed the database
   - `cd server`
   - `npm run seed`

5. Start development servers
   - Backend: `cd server && npm run dev`
   - Frontend: `cd client && npm run dev`

## Environment Variables

The server expects the following environment variables:

- `DATABASE_URL` — PostgreSQL database connection string.
- `SHADOW_DATABASE_URL` — Shadow database URL for Prisma migrations.
- `ACCESS_TOKEN_SECRET` — JWT secret used for authentication.
- `PORT` — Optional server port (default `5000`).
- `SMTP_HOST` — SMTP server hostname.
- `SMTP_PORT` — SMTP server port.
- `SMTP_USER` — SMTP username.
- `SMTP_PASS` — SMTP password.

## API Documentation

- Base API path: `/api`
- Health check: `/api/health`
- Authentication: `/api/auth`
- Branches: `/api/branches`
- Spaces: `/api/spaces`
- Bookings: `/api/bookings`
- Payments: `/api/payments`
- Documents: `/api/documents`
- NOC requests: `/api/noc`
- Admin endpoints: `/api/admin`

For detailed endpoint behavior, inspect the route implementations in `server/src/routes/`.

## Seeding Instructions

Run the server seed script after setting your environment variables:

```bash
cd server
npm run seed
```

The seed data includes:

- Branch: `KP Tower`, Chennai.
- Spaces: Virtual Office Basic, Virtual Office Premium, Hot Desk, Dedicated Desk, Private Cabin, Meeting Room.
- Admin users:
  - `super@kptower.in / Admin@1234` (SUPER_ADMIN)
  - `manager@kptower.in / Manager@1234` (BRANCH_ADMIN)
- Customer login:
  - `test@customer.in / Test@1234`
- Sample customers:
  - `FL Smartech Private Limited` with a verified virtual office booking and issued NOC.
  - `Sample Startup Co` with a monthly coworking booking pending payment.
  - `Individual Freelancer` with a hot desk day booking.

## Architecture Overview

- `client/` contains React pages, admin and customer portals, and API helpers.
- `server/` includes Express route modules, Prisma ORM models, JWT authentication, file uploads, documents, and NOC PDF generation.
- `shared/` holds reusable constants and type definitions.
- `server/prisma/` defines the Prisma schema and database seed script.
- `server/src/routes/` implements REST endpoints for the application domain.

## Notes

- The frontend and backend are separate apps, connected through the `/api` prefix.
- The seed script is intended for development and local testing.
- Adjust `SMTP_*` values for email delivery if production email integration is required.
