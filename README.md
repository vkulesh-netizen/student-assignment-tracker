# Studyline Part 2 release

Vitaliy Kulesh · 301559060 · COMP229 Web Application Development · Section 404

Studyline is a React, Express and MongoDB application for tracking student assignments. Part 2 adds public example assignments and a My profile view with account update and password-confirmed account deletion. The signed-in workspace supports assignment CRUD, search, sorting and status/date filters.

- Repository: https://github.com/vkulesh-netizen/student-assignment-tracker
- Product backlog and task board: https://github.com/users/vkulesh-netizen/projects/1

## Run the release locally

Use Node.js 24. Run `npm ci` then `npm run build`. Copy `.env.example` to `.env` and set a new `JWT_SECRET` of at least 32 characters. Set `APP_ORIGIN=http://127.0.0.1:3001` for the production-style preview. Use an Atlas connection or a replica set in `MONGODB_URI` because account deletion uses a transaction. Run `npm start` and open http://127.0.0.1:3001.

For a disposable local database, set `LOCAL_TEST_DB=true` in a non-production shell. The app starts an isolated MongoDB replica set and ignores `MONGODB_URI` for that run. Keep connection credentials and session secrets out of Git.

## Verification

- Unit: `node --test tests/validation.test.js`.
- API and unit: `npm test`.
- Playwright: `npx playwright install chromium`, then `npm run test:ui` after building.
- Cypress: run `npx cypress install`, start the local app on port 3001, then run `npm run test:cypress`. To use another port, set `STUDYLINE_BASE_URL` to its origin. The spec records the end-to-end run and saves snapshots after successful changes. Use a disposable database for this run.
- Performance: Express serves Vite's hashed assets with a one-year immutable cache and requires revalidation of the HTML entry point. The local production build and HTTP header measurements are in the release evidence.

The React API client sends same-origin JSON requests to Express. The auth endpoints validate data and issue an HTTP-only session cookie. Account deletion checks the current password and deletes the owner and related assignments in one MongoDB transaction. Assignment reads and writes use the authenticated owner's ID.

## Cloud deployment and CI/CD evidence

1. Connect the GitHub repository to the Render blueprint in `render.yaml`. Set `MONGODB_URI` in Render using the Atlas connection string for this application. Render supplies the service URL and generates `JWT_SECRET`. For a custom origin, set `APP_ORIGIN` explicitly.
2. Verify the public app and its `/api/health` endpoint. Use an application test account to check sign-in and CRUD after deployment.
3. Before the CI/CD change, capture the deployed landing page. On a feature branch, edit a visible sentence in `src/main.jsx`. Push the branch and open a pull request against `main`. GitHub Actions runs the unit and API suite, production build, and browser tests. Merge after the checks pass.
4. After Render deploys the merged revision, reload the same public URL and capture the changed page. Record the public URL, pull request, workflow run and deployment in the submission.
5. Update the live GitHub Projects backlog and task board. The packaged PDF shows local work item states.

## Part A demonstration

1. 0:00–0:45 · Show the two introductory slides. Introduce Studyline and your role.
2. 0:45–2:00 · Show the public examples, register or sign in, and explain the current-view indicator.
3. 2:00–4:00 · Create an assignment, open its card, edit it, change its status, filter it and delete it.
4. 4:00–5:15 · Open My profile, update a test account and demonstrate password-confirmed account deletion. Sign in with another test account and show Sign out.
5. 5:15–6:30 · Explain the React API client, Express routes, Mongoose ownership model and account deletion transaction. Show the test result and project board.
6. Upload the narrated recording to the course-approved streaming provider and include the link with the Part A submission.
