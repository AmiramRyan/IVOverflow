# IVOverflow

A Stack Overflow-style Q&A platform for IVTech developers. Log in, ask questions with tags and code snippets, answer others, and vote so the best responses rise to the top.

**Live demo:** [Render deployment link](https://ivoverflow.onrender.com/) 

## Test Users


| Email               | Password        | Nickname            |
| ------------------- | --------------- | ------------------- |
| `amiram@ivtech.com` | `password123`   | `dev_gold`          |
| `sam@ivtech.com`    | `password321`   | `joker`             |
| `review@ivtech.com` | `testtheapp123` | `The Best Reviewer` |


## Tech Stack

React, Redux Toolkit, RTK Query, Node.js, Express, MongoDB, JWT

## Quick Start (Local)

**Backend**

```bash
cd backend
npm install
copy .env.example .env   # then fill in DATABASE_URL and JWT_SECRET
npm run seed
npm run dev
```

**Frontend** (separate terminal)

```bash
cd frontend
npm install
npm start
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

