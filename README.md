# PeerLearn

> A modern, collaborative e-learning platform for instructors and learners. PeerLearn enables course creation, structured lessons, real-time discussions, and progress tracking—all in one place.

---

## Table of Contents

-   [Features](#features)
-   [Tech Stack](#tech-stack)
-   [Screenshots](#screenshots)
-   [Installation](#installation)
-   [Environment Variables](#environment-variables)
-   [Running Locally](#running-locally)
-   [App Functions & Usage](#app-functions--usage)
-   [API Routes](#api-routes)
-   [Deployment](#deployment)
-   [Contributing](#contributing)
-   [License](#license)
-   [Contact & Support](#contact--support)

---

## Features

-   User authentication (JWT, roles: student, instructor, admin)
-   Course creation and editing (drag-and-drop builder)
-   Lesson and section management
-   Enrollment and progress tracking
-   Real-time course discussions and chat
-   Instructor analytics dashboard
-   Responsive, modern UI (React + Tailwind CSS)
-   Help Center, Terms of Service, and Privacy Policy pages

---

## Tech Stack

-   **Frontend:** React, Vite, Tailwind CSS
-   **Backend:** Node.js, Express, MongoDB (Mongoose)
-   **Auth:** JWT, bcrypt
-   **Deployment:** Vercel (frontend), Render (backend)

---

## Screenshots

> Add screenshots of the dashboard, course editor, and discussion features here.

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Abumujahid1988/PeerLearn-app.gitcd PeerLearn-app
```

### 2. Install Dependencies

#### Backend

```bash
cd backendnpm install
```

#### Frontend

```bash
cd ../frontendnpm install
```

---

## Environment Variables

### Backend (`backend/.env`)

```
MONGODB_URI=your_mongodb_connection_stringJWT_SECRET=your_jwt_secretPORT=5000
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## Running Locally

### Backend

```bash
cd backendnpm run dev
```

### Frontend

```bash
cd frontendnpm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## App Functions & Usage

### User Roles

-   **Student:** Enroll in courses, track progress, participate in discussions.
-   **Instructor:** Create and manage courses, lessons, and sections. View analytics and moderate discussions.
-   **Admin:** Full access to all courses, users, analytics, and admin dashboard.

### Main Features

-   **Authentication:** Secure login/register with JWT. Role-based access for students, instructors, and admins.
-   **Course Builder:** Instructors can create, edit, and organize courses with sections and lessons using a drag-and-drop interface.
-   **Lesson Management:** Add, edit, and delete lessons. Attach resources and set lesson order.
-   **Enrollment:** Students can enroll in courses and track their progress.
-   **Progress Tracking:** Automatic progress updates as students complete lessons.
-   **Discussions:** Each course has a discussion board for threads and replies. All posts and replies display the sender’s name.
-   **Chat:** Real-time chat for course participants.
-   **Analytics:** Instructors and admins can view course analytics (enrollments, completion rates, ratings).
-   **Help Center:** Access support, FAQs, and contact information.
-   **Legal Pages:** Terms of Service and Privacy Policy are available and linked in the footer.

### Usage

1.  Register as a student or instructor.
2.  Instructors create courses and lessons; students enroll and learn.
3.  Use the dashboard to view your courses, progress, and analytics.
4.  Participate in course discussions and chat rooms.
5.  Access support and legal information from the footer.

---

## API Routes

### Auth

-   `POST /api/auth/register` — Register a new user
-   `POST /api/auth/login` — Login
-   `GET /api/auth/me` — Get current user

### Users

-   `GET /api/users/:id` — Get user profile
-   `PUT /api/users/:id` — Update user profile

### Courses

-   `GET /api/courses` — List all courses
-   `GET /api/courses/:id` — Get course details
-   `POST /api/courses` — Create course (instructor)
-   `PUT /api/courses/:id` — Update course (instructor)
-   `DELETE /api/courses/:id` — Delete course (admin/instructor)

### Lessons & Sections

-   `POST /api/sections` — Create section
-   `POST /api/lessons` — Create lesson
-   `PUT /api/lessons/:id` — Update lesson
-   `DELETE /api/lessons/:id` — Delete lesson

### Enrollment & Progress

-   `POST /api/enrollments` — Enroll in course
-   `GET /api/enrollments/:userId` — Get user enrollments
-   `POST /api/progress` — Update lesson progress

### Discussions

-   `GET /api/discussions/:courseId` — Get course discussions
-   `POST /api/discussions/:courseId` — Create thread
-   `POST /api/discussions/:courseId/comments` — Add comment to thread

### Analytics (Instructor/Admin)

-   `GET /api/analytics/instructor` — Instructor analytics

---

## Deployment

### Frontend (Vercel)

See [`frontend/DEPLOYMENT_FRONTEND_VERCEL.md`](frontend/DEPLOYMENT_FRONTEND_VERCEL.md)

### Backend (Render)

See [`backend/DEPLOYMENT_BACKEND_RENDER.md`](backend/DEPLOYMENT_BACKEND_RENDER.md)

---

## Contributing

1.  Fork the repo and create your branch.
2.  Commit your changes and push.
3.  Open a pull request.

---

## License

[MIT](LICENSE)

---

## Contact & Support

-   Email: [support@peerlearn.com](mailto:support@peerlearn.com)
-   Phone: +2348035220554, +2349123165313

---
