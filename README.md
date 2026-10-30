# Studyline

Student Assignment Tracker for COMP229 Web Application Development, Section 404, Group 2.

A MERN application for managing personal assignments. Students register, sign in, and create, view, edit, complete, reopen, or delete their own assignments. The dashboard includes course/text search, status filters, due-date sorting, priority sorting, and overdue counts.

Private source repository: https://github.com/vkulesh-netizen/student-assignment-tracker

Private Agile project with Product backlog and Task board views: https://github.com/users/vkulesh-netizen/projects/1

## Run locally

Prerequisite: Node.js 24 LTS and access to a MongoDB server or Atlas cluster.

```sh
npm ci
```

Copy `.env.example` to `.env`. Set `MONGODB_URI` to your database connection string and `JWT_SECRET` to a random secret of at least 32 characters. Set `APP_ORIGIN=http://localhost:5173` for development. Keep `.env` private.

```sh
npm run dev
```

Open http://localhost:5173. The Vite development server proxies `/api` requests to Express on port 3001.

For a local production-style preview:

```sh
npm run build
```

Set `APP_ORIGIN=http://127.0.0.1:3001` in `.env`, then run `npm start` and open http://127.0.0.1:3001. Register your own app account. Atlas database credentials are server configuration, not an app login.

## Verification

```sh
npm test
npm run build
npx playwright install chromium
npm run test:ui
```

The backend suite starts a disposable real MongoDB server. It covers registration, password hashing, cookie attributes, login/logout, invalid data, duplicate accounts, CRUD persistence, ownership protection, missing/forged sessions, CSRF defenses, and authentication rate limiting. The browser suite covers the main user workflow. Do not point automated test fixtures at an existing production database.

## Architecture

- `src/`: React views, form dialogs, responsive styles, API client.
- `server/models/`: Mongoose User and Assignment schemas.
- `server/controllers/`: authentication and assignment operations.
- `server/routes/`: Express API routes.
- `server/middleware/`: JWT sessions, validation, authorization.
- `tests/`: backend integration and browser tests.
- `docs/`: API guide, backlog, demonstration guide, submission materials.
- `.github/workflows/ci.yml`: backend tests and production build on pushes/PRs.

## Database and security

The app uses `student_assignment_tracker` with `users` and `assignments` collections. Each assignment belongs to one user. Every assignment query includes the authenticated owner's ID. Passwords are hashed with bcrypt. JWT sessions use HttpOnly, SameSite=Strict cookies and eight-hour expiry. Production enables Secure cookies and requires an HTTPS APP_ORIGIN. Writes require a custom request header and enforce origin checks. Registration/login are rate limited. Validation rejects unknown fields, invalid dates, and ownership injection.

Use a database user limited to read/write on this app database. Do not commit `.env`, connection passwords, session secrets, or private student records. The local `.env` is excluded from Git and source archives. Public app self-registration is supported; email verification, password reset, and shared assignments are outside this release.

## Deployment

Deploy the Node service using `npm ci && npm run build`, then `npm start`. Configure `NODE_ENV=production`, `MONGODB_URI`, a fresh `JWT_SECRET`, and `APP_ORIGIN=https://your-exact-app-origin`. The server serves both React and the API from one origin. Set `TRUST_PROXY_HOPS` only to the known number of trusted reverse proxies. Production binds to `0.0.0.0` and uses the platform's PORT.

The included `render.yaml` is a deployment blueprint, not evidence of a live deployment. No paid service is required by the code. Confirm any hosting plan before provisioning it.

## Team responsibilities

[Member photo and signature upload instructions](docs/TEAM-UPLOAD-GUIDE.md)

[Upload member files](https://github.com/vkulesh-netizen/student-assignment-tracker/upload/main/docs/member-submissions)

Starting assignments from the random allocation, subject to team agreement:

| Member           | Starting responsibilities                                       |
| ---------------- | --------------------------------------------------------------- |
| Hamzah Al-Samadi | Authentication and authorization APIs                           |
| Kevin Mai        | Assignment CRUD APIs and input validation                       |
| Rihab Chowdhury  | MongoDB models, database connection, Express MVC setup          |
| Vitaliy Kulesh   | Authentication tests, login/register wireframes and React pages |
| Ebana Almahamid  | Assignment tests, assignment wireframes and React pages         |

Each member should review, understand, improve, test, and commit their own work. The initial scaffold was prepared with Codex assistance. Initial generated code is not evidence of individual member contributions. Follow the instructor's policy on AI assistance and attribution.

## Submission status

The source and prepared documentation do not replace the group's signed contract, real student IDs/photos, authentic member commits, a live Agile board, or the recorded 5-10 minute demonstration. See `docs/SUBMISSION.md` for remaining team actions.
