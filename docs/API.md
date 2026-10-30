# API reference

Base URL for local preview: `http://127.0.0.1:3001/api`.

Send JSON with `Content-Type: application/json` and `X-Requested-With: Studyline` for every write. Retain the session cookie returned by registration/login. Browsers do this automatically for this same-origin app. No bearer token is exposed to React.

| Method | Endpoint         | Result                                     |
| ------ | ---------------- | ------------------------------------------ |
| GET    | /health          | 200 if MongoDB is connected, otherwise 503 |
| POST   | /auth/register   | Create user and session, 201               |
| POST   | /auth/login      | Authenticate, 200                          |
| GET    | /auth/me         | Current public user, 200                   |
| POST   | /auth/logout     | Clear cookie, 204                          |
| GET    | /assignments     | Current user's assignments, 200            |
| POST   | /assignments     | Create owned assignment, 201               |
| GET    | /assignments/:id | Read owned assignment, 200                 |
| PATCH  | /assignments/:id | Update supplied fields, 200                |
| DELETE | /assignments/:id | Delete owned assignment, 204               |

Registration body: `{"name":"Example Student","email":"student@example.test","password":"a-password-at-least-12-characters"}`. Name length 2-80, email at most 254 characters. Password length 12-72 characters and no more than 72 UTF-8 bytes. Login takes email and password. Emails normalize to lowercase. Responses return `user: {id, name, email}` without password hashes.

Assignment body:

```json
{
  "title": "Project Part 1",
  "course": "COMP229",
  "description": "Connect the database and test the APIs",
  "dueDate": "2026-11-15",
  "status": "To Do",
  "priority": "High"
}
```

The example due date is test data, not the course deadline. Title length 1-120, course 1-60, description at most 2000. Due dates use valid calendar dates in YYYY-MM-DD format. Status: To Do, In Progress, Completed. Priority: Low, Medium, High. Defaults apply only on creation. PATCH requires at least one supported field. Clients cannot submit an owner or password hash.

Errors return `{ "message": "Readable explanation" }`. Codes: 400 invalid input/ID, 401 unauthenticated or incorrect credentials, 403 origin/header rejection, 404 missing or other user's assignment, 409 duplicate email, 413 oversized JSON, 429 too many auth attempts, 500 unexpected server failure. Ownership failures intentionally return 404.

## Manual test sequence

1. Register account A, retain cookies, verify /auth/me.
2. Create an assignment. Save the returned ID.
3. List and read it, then PATCH only its status. Confirm title, priority, and description persist.
4. In a separate cookie jar register account B. Verify B cannot list, read, patch, or delete A's record.
5. Send invalid date 2026-02-30, invalid status, an empty title, and an injected owner. Expect 400.
6. Logout A. Verify protected routes return 401.
7. Sign back in as A and delete its test assignment. Confirm GET returns 404.

Use the included Postman collection for the same steps. Set the baseUrl variable and let Postman keep cookies. Never include real passwords in exported collections.
