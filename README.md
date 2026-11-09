# TaskFlow — Kanban Task Management Dashboard

A responsive Kanban task-management dashboard built for the **Frontend Developer Practical Test**.
Users sign in with the DummyJSON Auth API, then create, edit, delete, search, filter and drag tasks across
**Backlog → To Do → In Progress → Done**. Tasks are stored in `localStorage`.

## Screenshots

| Login | Dashboard | Kanban board |

| Login | Dashboard | Kanban board |
| --- | --- | --- |
| <img width="300" src="https://github.com/user-attachments/assets/abc00c01-1853-45b1-8e35-ca4ee691390d" /> | <img width="300" src="https://github.com/user-attachments/assets/36271c94-8504-4866-9763-20e4a30c4934" /> | <img width="300" src="https://github.com/user-attachments/assets/7f4978f5-68ef-4fa5-85cb-12b223e604a8" /> |


More: [drag in progress](screenshots/04-dragging.png) · [My Tasks](screenshots/05-my-tasks.png) · [mobile login](screenshots/06-login-mobile.png) · [mobile dashboard](screenshots/07-dashboard-mobile.png)

## Technology stack

| Area | Choice |
| --- | --- |
| Framework | React 18 + TypeScript, Vite |
| HTTP | Axios (central instance + request/response interceptors) |
| UI | Ant Design 5 (+ custom CSS, light/dark theme) |
| Drag & drop | @dnd-kit (core, sortable; pointer, touch and keyboard sensors) |
| Routing | React Router 6 |
| State | React Context + `useReducer` (auth, tasks, theme) |
| Storage | `localStorage` (tasks, session, theme) |
| Tests | Vitest + Testing Library |

## Installation

Requires Node.js 18+.

```bash
npm install
cp .env.example .env     # optional – defaults already point to DummyJSON
```

## Environment configuration

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `https://dummyjson.com` | Auth API base URL |
| `VITE_TOKEN_EXPIRES_MINS` | `30` | Access-token lifetime requested on login/refresh |

## Run the application

```bash
npm run dev        # development server → http://localhost:5173
npm run build      # type-check + production build
npm run preview    # serve the production build
npm test           # run unit / component tests
```

## Test account

```
Username: emilys
Password: emilyspass
```
(The login page has a "Fill in" shortcut.) Sample tasks are created the first time the app opens;
use **Settings → Reset sample data** to restore them.

## Features

- **Auth**: login form with validation and loading state, error message on failure, token stored in
  `localStorage`, `ProtectedRoute`, session restored on refresh via `GET /auth/me`, logout.
- **Axios**: one configured instance; request interceptor adds `Authorization: Bearer`; response interceptor
  refreshes the token via `POST /auth/refresh` on `401` (concurrent requests share one refresh, request is
  replayed), maps 400/401/403/404/429/5xx/network errors to friendly messages and shows toasts for 403/5xx.
- **Dashboard**: collapsible sidebar (drawer on mobile), header with user info, statistics (Total, Backlog,
  In Progress, Completed + overdue/completion — all computed from data), search & filters, Kanban board.
- **Kanban**: four columns, task cards (title, description, priority, due date, assignee, status), drag between
  columns with live movement, re-order inside a column, drag overlay, touch and keyboard support, and a
  "Move to…" menu as an accessible alternative. Position and status persist after refresh.
- **CRUD**: Add Task modal (validated form), edit via the same modal, delete with confirmation dialog.
- **Search & filter** (combinable): title search, priority, assignee (incl. unassigned), status, due-date range.
- **Extras**: My Tasks table view, Settings (profile, dark mode, reset/clear data), empty states, loading states,
  responsive layout (desktop/tablet/mobile), ARIA labels, reduced-motion support.

## Project structure

```
src/
├── api/          client.ts (Axios instance + interceptors), auth.ts, apiError.ts, tokenStorage.ts
├── context/      AuthContext, TasksContext, ThemeContext
├── hooks/        useTaskFilters, useTaskModal, useDebounce, useAssignees
├── components/   AppLayout, ProtectedRoute, KanbanBoard/Column, TaskCard, TaskFormModal, TaskFilters, StatsCards …
├── pages/        Login, Dashboard, MyTasks, Settings, NotFound
├── utils/        tasksReducer (pure), tasks (filter/stats), seed, storage, constants
└── types/        Task, TaskFilters, Auth types
```

## Design notes

- The task array order *is* the column order, so a single pure reducer (`move`) handles cross-column moves and
  re-ordering; it is unit-tested.
- UI state updates synchronously (optimistic by nature) and is persisted to `localStorage` in an effect.
- Session restore only logs the user out on `401/403`; a network failure keeps the cached session.
- Tokens are kept in `localStorage` as required by the test; in a production app an HttpOnly cookie is safer.
