# Studyline: Student Assignment Tracker

**Individual Project Proposal**  
**Student:** Vitaliy Kulesh  
**Student Number:** 301559060  
**Course:** COMP229 – Web Application Development  
**Section:** 404  
**Submission Format:** Individual  
**Repository:** https://github.com/vkulesh-netizen/student-assignment-tracker

## Project Overview

I propose to complete Studyline, a Student Assignment Tracker, as an individual MERN application project. The application helps students organize coursework by keeping assignment details, deadlines, priorities, and progress in one place. Each student can register, sign in, and manage a private collection of assignments.

I will be the sole project participant and will take responsibility for requirements, application design, database configuration, backend and frontend development, testing, documentation, and the final demonstration. This proposal replaces the previous team role allocation with an individual work plan.

## Problem and Objectives

Students often track coursework across multiple course pages, notes, and calendars, making it difficult to identify upcoming deadlines and unfinished work. Studyline will provide a central dashboard for recording assignments and reviewing progress.

The project objectives are to:

- Provide account registration, login, and logout.
- Support creating, viewing, updating, and deleting assignments.
- Restrict access so users can manage only their own records.
- Make assignments easy to find through search, filtering, and sorting.
- Provide a responsive interface and persistent MongoDB storage.
- Document and demonstrate the application with meaningful test evidence.

## Functional Scope

Each assignment will contain a title, course, description, due date, status, and priority. Status values will be **To Do**, **In Progress**, and **Completed**. Priority values will be **Low**, **Medium**, and **High**.

Users will be able to create assignments, view their assignment list, edit details, mark work complete, reopen completed work, and delete records. The dashboard will support course and text search, status filters, due-date and priority sorting, and an overdue count.

The interface will include registration and login screens, an assignment dashboard, and an add/edit assignment form. Forms will validate required fields and display understandable error messages.

Shared assignments, email verification, password recovery, and external calendar integration are outside the proposed release scope.

## Technical Design

Studyline will use MongoDB for storage, Express and Node.js for the REST API, and React with Vite for the interface. Mongoose will define database schemas. The backend will organize responsibilities into models, routes, controllers, and middleware.

The database will contain two main collections:

| Collection | Main information |
| --- | --- |
| Users | Name, unique email address, password hash, and timestamps |
| Assignments | Owner reference, title, course, description, due date, status, priority, and timestamps |

Each assignment will reference its owner. Backend queries will enforce ownership for listing, reading, updating, and deleting records. Passwords will be hashed with bcrypt. Authentication will use JWT sessions stored in HttpOnly cookies. Server validation will reject invalid input and attempts to set another owner.

## Individual Work Plan

I will manage the work through a product backlog and task board, with all development and submission responsibilities assigned to me.

| Phase | My responsibilities | Expected evidence |
| --- | --- | --- |
| Requirements and design | Confirm scope, review user workflows, prepare interface designs and database relationships | Proposal, backlog, and External Design Document |
| Backend and database | Review and complete MongoDB setup, authentication, authorization, validation, and assignment CRUD APIs | Source code, API reference, and Postman collection |
| Frontend integration | Review and complete registration, login, dashboard, and assignment forms | Working responsive React interface |
| Verification | Run backend integration and browser workflow tests; investigate and fix failures | Recorded test results and demonstration examples |
| Submission preparation | Update documentation and backlog, package source, and record the demonstration | Final submission package and video link |

For Part 1, I will prioritize the backend, database, API testing, and initial design documentation. I will review the existing React interface and include or refine it according to the applicable submission requirements. Calendar dates will follow the course schedule.

## Testing and Acceptance Criteria

I will verify that a user can register, log in, create an assignment, retrieve it, update its details and status, delete it, and log out. I will also check persistence, duplicate registrations, incorrect credentials, invalid dates and fields, and access to protected routes without a valid session.

Ownership tests will use separate accounts to confirm that one user cannot retrieve, modify, or delete another user's assignments. Browser tests will cover the main user workflow, and the production build will be checked before packaging.

Acceptance requires working account access, complete assignment CRUD functionality, enforced ownership, valid database persistence, a usable responsive interface, and documentation consistent with the application. Test results will be reported only after the relevant checks are run.

## Deliverables and Responsibility

My planned deliverables are the MERN source code, setup instructions, an External Design Document, API documentation and Postman collection, a current product backlog, test evidence, and a recorded demonstration with a submission link. I will provide the repository and other course-required artifacts in the required formats.

The existing project includes a scaffold prepared with Codex assistance. I will review and understand the implementation, document assistance according to course policy, and describe my actual work accurately. Individual submission does not change historical contribution records.

I am responsible for completing and explaining every part of the submitted project. No additional participants or shared role assignments are included in this proposal.
