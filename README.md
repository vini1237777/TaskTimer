# Task and Time Tracking App

A full-stack Task and Time Tracking app where users can manage tasks, start/stop a real-time timer, view time logs, and see a daily productivity summary. Built with SvelteKit and GraphQL, backed by MongoDB.

## Live Deployed Link

- Live App: https://task-timer-two.vercel.app/auth/login

Test credentials:

- Email: user@gmail.com
- Password: user@123

## Tech Stack (Brief)

- Frontend: SvelteKit, Svelte, TypeScript
- Backend/API: SvelteKit server routes, GraphQL Yoga
- Database: MongoDB + Mongoose
- Authentication: Cookie based session auth
- Optional AI: LangChain + OpenAI (task title/description suggestions)
- Deployment: Vercel

## Local Development Setup

1. Clone the repository

```bash
git clone https://github.com/vini1237777/TaskTimer
```

2. npm install

3.npm run dev

## Authentication (Working)

- Users can sign up, log in, and log out.
- Session is stored using secure cookies.
- All protected pages and GraphQL operations require authentication.
- If not logged in, accessing `/app/*` redirects to `/auth/login` (and APIs return an auth error).
